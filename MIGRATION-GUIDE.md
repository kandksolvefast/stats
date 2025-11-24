# Migration Guide: Adding Sidecar Support to Other Modules

This guide explains how to add HTTP sidecar support to RAM, Disk, Network, and Battery modules, following the pattern established for CPU.

## Table of Contents

- [Overview](#overview)
- [Why Sidecar Instead of Direct Reading?](#why-sidecar-instead-of-direct-reading)
- [Architecture](#architecture)
- [Step-by-Step Migration](#step-by-step-migration)
  - [1. Define Data Types](#1-define-data-types)
  - [2. Create Module Store](#2-create-module-store)
  - [3. Wire NotificationCenter](#3-wire-notificationcenter)
  - [4. Add HTTP Endpoint](#4-add-http-endpoint)
  - [5. Configure Readers](#5-configure-readers)
  - [6. Create Tauri Frontend](#6-create-tauri-frontend)
- [Testing](#testing)
- [Best Practices](#best-practices)

---

## Overview

The sidecar pattern allows external consumers (Tauri UI, monitoring tools, etc.) to access Stats module data via HTTP. This guide uses **RAM module** as an example, but the same pattern applies to all modules.

### What You'll Build

```
┌─────────────────────────────────────────────────────────────┐
│                     Stats macOS App                          │
│                                                              │
│  ┌────────────┐    Notifications   ┌──────────────────┐    │
│  │ RAM Module │───────────────────>│   RAMStore       │    │
│  │  Readers   │                     │  (Singleton)     │    │
│  └────────────┘                     └──────────────────┘    │
│                                              │               │
│                                              ▼               │
│                                     ┌──────────────────┐    │
│                                     │ RAMSidecarSocket │    │
│                                     │ :8974/ram        │    │
│                                     └──────────────────┘    │
└──────────────────────────────────────────│──────────────────┘
                                           │ HTTP
                                           ▼
                          ┌──────────────────────────────┐
                          │      Tauri Frontend           │
                          │  - React Components          │
                          │  - Real-time Polling         │
                          │  - Visualizations            │
                          └──────────────────────────────┘
```

---

## Why Sidecar Instead of Direct Reading?

### Initial Approach: Direct Rust/sysinfo

Initially, we attempted to read CPU metrics directly in the Tauri app using Rust crates like `sysinfo`:

```rust
// Initial approach - reading CPU directly in Tauri
use sysinfo::{System, SystemExt, ProcessorExt};

#[tauri::command]
fn get_cpu_usage() -> f32 {
    let mut sys = System::new_all();
    sys.refresh_cpu();
    sys.global_cpu_info().cpu_usage()
}
```

**Problems with this approach:**

1. **Limited macOS-specific metrics**: Generic Rust crates like `sysinfo` don't expose:
   - SMC temperature sensors (M1/M2/M3/M4 specific sensors)
   - IOReport frequency data (E-core vs P-core frequencies)
   - Efficiency vs Performance core usage breakdown
   - macOS-specific swap and compressed memory stats

2. **Duplicate implementation**: We'd need to reimplement all the sophisticated logic that already exists in the Stats app:
   - SMC sensor mapping for different Apple Silicon generations
   - IOReport channel parsing and frequency calculation
   - Process filtering and sorting
   - Memory pressure calculation

3. **Platform fragmentation**: Different code paths for:
   - Intel vs Apple Silicon
   - macOS versions (Big Sur, Monterey, Ventura, Sonoma, Sequoia)
   - Security permission handling (TCC, Sandbox)

4. **Maintenance burden**: Two codebases doing the same thing:
   - Swift Stats app with years of refinement
   - New Rust implementation that needs to catch up

### Chosen Approach: Sidecar Pattern

Instead, we expose the Stats app's **existing, battle-tested** metrics via HTTP:

**Benefits:**

1. **✅ Reuse existing code**: Leverage all the sophisticated Swift/Obj-C logic
2. **✅ macOS-specific features**: Full access to SMC, IOReport, and private APIs
3. **✅ Single source of truth**: Stats app remains authoritative
4. **✅ Zero duplication**: No need to reimplement sensor reading in Rust
5. **✅ Cross-platform frontend**: React UI can run anywhere, consume macOS data
6. **✅ Extensibility**: Easy to add REST APIs, WebSockets, Prometheus export, etc.

**Trade-offs:**

- **Stats app dependency**: Tauri UI requires Stats app to be running
- **IPC overhead**: HTTP polling adds ~1ms latency (negligible for 1s updates)
- **Port management**: Need to ensure port 8973 is available

### When to Use Each Approach

| Scenario | Recommended Approach |
|----------|---------------------|
| **macOS-specific UI** | ✅ Sidecar (this guide) |
| **Cross-platform generic metrics** | Direct Rust reading (sysinfo) |
| **Need SMC/IOReport data** | ✅ Sidecar (not available in Rust) |
| **Standalone CLI tool** | Direct Rust reading |
| **Web dashboard for Stats** | ✅ Sidecar |
| **Linux/Windows Tauri app** | Direct Rust reading |

### Decision Summary

We chose the **sidecar pattern** because:
- Stats app already has **5+ years** of macOS platform expertise
- **50+ SMC sensors** mapped across M1/M2/M3/M4
- **IOReport parsing** for frequency metrics not available elsewhere
- **Process sorting** with proper permission handling
- **Memory pressure** calculation using macOS private APIs

Rather than rewriting all of this in Rust (and maintaining two implementations), we expose it via HTTP and let any UI consume it.

---

## Architecture

### Core Components

1. **Module Readers** - Existing Swift code that polls system metrics
2. **Module Store** - Singleton that aggregates data from readers
3. **NotificationCenter Bridge** - Connects module notifications to store
4. **HTTP Server** - BSD socket server exposing data as JSON
5. **Tauri Frontend** - React UI consuming the HTTP API

### Data Flow

```
Readers → Notifications → Store → HTTP Server → Tauri UI
```

---

## Step-by-Step Migration

We'll migrate the **RAM module** as an example. Adapt the naming for your target module.

### 1. Define Data Types

#### 1.1 Create Swift Payload Type

Create `StatsSidecar/Payloads/RamPayload.swift`:

```swift
import Foundation

struct RamPayload: Codable {
    // Basic RAM metrics
    var totalBytes: UInt64?
    var usedBytes: UInt64?
    var freeBytes: UInt64?
    var activeBytes: UInt64?
    var inactiveBytes: UInt64?
    var wiredBytes: UInt64?
    var compressedBytes: UInt64?

    // Derived metrics
    var usedPercentage: Double?
    var appMemoryBytes: UInt64?
    var cachedFilesBytes: UInt64?

    // Swap
    var swapTotalBytes: UInt64?
    var swapUsedBytes: UInt64?

    // Top memory processes
    var topProcesses: [RamTopProcess]

    init(
        totalBytes: UInt64? = nil,
        usedBytes: UInt64? = nil,
        freeBytes: UInt64? = nil,
        activeBytes: UInt64? = nil,
        inactiveBytes: UInt64? = nil,
        wiredBytes: UInt64? = nil,
        compressedBytes: UInt64? = nil,
        usedPercentage: Double? = nil,
        appMemoryBytes: UInt64? = nil,
        cachedFilesBytes: UInt64? = nil,
        swapTotalBytes: UInt64? = nil,
        swapUsedBytes: UInt64? = nil,
        topProcesses: [RamTopProcess] = []
    ) {
        self.totalBytes = totalBytes
        self.usedBytes = usedBytes
        self.freeBytes = freeBytes
        self.activeBytes = activeBytes
        self.inactiveBytes = inactiveBytes
        self.wiredBytes = wiredBytes
        self.compressedBytes = compressedBytes
        self.usedPercentage = usedPercentage
        self.appMemoryBytes = appMemoryBytes
        self.cachedFilesBytes = cachedFilesBytes
        self.swapTotalBytes = swapTotalBytes
        self.swapUsedBytes = swapUsedBytes
        self.topProcesses = topProcesses
    }
}

struct RamTopProcess: Codable {
    var pid: Int
    var name: String
    var memoryBytes: UInt64
}
```

#### 1.2 Add to Xcode Project

1. Open `Stats.xcodeproj`
2. Right-click `StatsSidecar` folder → "Add Files to Stats"
3. Create new Swift file `RamPayload.swift`
4. Ensure target membership: **Stats** (not framework targets)

#### 1.3 Create TypeScript Types

Create `stats-tauri/src/types/ram.ts`:

```typescript
export interface RamTopProcess {
  pid: number;
  name: string;
  memoryBytes: number;
}

export interface RAMData {
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  activeBytes?: number;
  inactiveBytes?: number;
  wiredBytes?: number;
  compressedBytes?: number;
  usedPercentage: number;
  appMemoryBytes?: number;
  cachedFilesBytes?: number;
  swapTotalBytes?: number;
  swapUsedBytes?: number;
  topProcesses: RamTopProcess[];
  timestamp: string; // ISO string
}
```

---

### 2. Create Module Store

Create `StatsSidecar/RamStore.swift`:

```swift
import Foundation
import Kit
#if canImport(RAM)
import RAM
#endif

final class RamStore {
    static let shared = RamStore()
    private let lock = NSLock()

    private var payload = RamPayload(
        totalBytes: nil,
        usedBytes: nil,
        freeBytes: nil,
        activeBytes: nil,
        inactiveBytes: nil,
        wiredBytes: nil,
        compressedBytes: nil,
        usedPercentage: nil,
        appMemoryBytes: nil,
        cachedFilesBytes: nil,
        swapTotalBytes: nil,
        swapUsedBytes: nil,
        topProcesses: []
    )

    private init() {}

    func snapshot() -> RamPayload {
        lock.lock(); defer { lock.unlock() }
        return payload
    }

    // Update from RAM_Usage reader
    func update(usage: RAM_Usage) {
        lock.lock(); defer { lock.unlock() }

        payload.totalBytes = usage.total
        payload.usedBytes = usage.used
        payload.freeBytes = usage.free
        payload.activeBytes = usage.active
        payload.inactiveBytes = usage.inactive
        payload.wiredBytes = usage.wired
        payload.compressedBytes = usage.compressed

        // Calculate percentage
        if usage.total > 0 {
            payload.usedPercentage = (Double(usage.used) / Double(usage.total)) * 100.0
        }

        payload.appMemoryBytes = usage.app
        payload.cachedFilesBytes = usage.cached
        payload.swapTotalBytes = usage.swap?.total
        payload.swapUsedBytes = usage.swap?.used
    }

    // Update from ProcessReader
    func update(processes: [TopProcess]) {
        lock.lock(); defer { lock.unlock() }

        let mapped = processes.map {
            RamTopProcess(
                pid: $0.pid,
                name: $0.name,
                memoryBytes: $0.usage  // Memory usage in bytes
            )
        }
        payload.topProcesses = mapped
    }
}
```

**Key Points:**
- Thread-safe with `NSLock`
- Singleton pattern
- Separate `update()` methods for each reader type
- Match reader notification payloads (check `Modules/RAM/main.swift` for notification types)

---

### 3. Wire NotificationCenter

#### 3.1 Find Module Notifications

Look in `Modules/RAM/main.swift` for notification definitions:

```swift
public extension Notification.Name {
    static let ramUsageUpdated = Notification.Name("ramUsageUpdated")
    static let ramProcessesUpdated = Notification.Name("ramProcessesUpdated")
}
```

#### 3.2 Subscribe in AppDelegate

In `Stats/AppDelegate.swift`, add observers after CPU subscriptions:

```swift
// Add after CPU sidecar subscriptions in applicationDidFinishLaunching

// Subscribe to RAM module notifications to update RamStore
NotificationCenter.default.addObserver(
    forName: .ramUsageUpdated,
    object: nil,
    queue: nil
) { notification in
    if let usage = notification.object as? RAM_Usage {
        RamStore.shared.update(usage: usage)
    }
}

NotificationCenter.default.addObserver(
    forName: .ramProcessesUpdated,
    object: nil,
    queue: nil
) { notification in
    if let processes = notification.object as? [TopProcess] {
        RamStore.shared.update(processes: processes)
    }
}
```

**Important:** Import the RAM module at top of AppDelegate:
```swift
import RAM
```

---

### 4. Add HTTP Endpoint

#### 4.1 Extend BSD Socket Server

Modify `StatsSidecar/CpuSidecarBSDSocket.swift` to handle multiple endpoints:

**Option A: Extend Existing Server**

Add RAM endpoint to existing server:

```swift
private func handleRequest(_ request: String) -> Data? {
    // Parse request path
    if request.hasPrefix("GET /cpu") {
        let payload = SidecarStore.shared.snapshot()
        return try? JSONEncoder().encode(payload)
    } else if request.hasPrefix("GET /ram") {
        let payload = RamStore.shared.snapshot()
        return try? JSONEncoder().encode(payload)
    }

    // 404 for unknown paths
    return nil
}
```

**Option B: Separate Server (Recommended)**

Create `StatsSidecar/RamSidecarBSDSocket.swift`:

```swift
import Foundation

final class RamSidecarBSDSocket {
    private var serverSocket: Int32 = -1
    private var isRunning = false

    func start() {
        guard !isRunning else { return }
        isRunning = true

        DispatchQueue.global(qos: .background).async { [weak self] in
            self?.startServer()
        }
    }

    func stop() {
        isRunning = false
        if serverSocket >= 0 {
            close(serverSocket)
            serverSocket = -1
        }
    }

    private func startServer() {
        // Create socket
        serverSocket = socket(AF_INET, SOCK_STREAM, 0)
        guard serverSocket >= 0 else {
            print("RAM Sidecar: Failed to create socket")
            return
        }

        // Set socket options
        var optval: Int32 = 1
        setsockopt(serverSocket, SOL_SOCKET, SO_REUSEADDR, &optval, socklen_t(MemoryLayout<Int32>.size))

        // Bind to port 8974
        var addr = sockaddr_in()
        addr.sin_family = sa_family_t(AF_INET)
        addr.sin_port = in_port_t(8974).bigEndian
        addr.sin_addr.s_addr = inet_addr("127.0.0.1")

        let bindResult = withUnsafePointer(to: &addr) {
            $0.withMemoryRebound(to: sockaddr.self, capacity: 1) {
                bind(serverSocket, $0, socklen_t(MemoryLayout<sockaddr_in>.size))
            }
        }

        guard bindResult == 0 else {
            print("RAM Sidecar: Failed to bind to port 8974")
            close(serverSocket)
            return
        }

        // Listen
        listen(serverSocket, 5)
        print("RAM Sidecar: Listening on port 8974")

        // Accept loop
        while isRunning {
            var clientAddr = sockaddr_in()
            var clientAddrLen = socklen_t(MemoryLayout<sockaddr_in>.size)

            let clientSocket = withUnsafeMutablePointer(to: &clientAddr) {
                $0.withMemoryRebound(to: sockaddr.self, capacity: 1) {
                    accept(serverSocket, $0, &clientAddrLen)
                }
            }

            guard clientSocket >= 0 else { continue }

            DispatchQueue.global(qos: .userInitiated).async { [weak self] in
                self?.handleClient(clientSocket)
            }
        }
    }

    private func handleClient(_ clientSocket: Int32) {
        defer { close(clientSocket) }

        // Read request
        var buffer = [UInt8](repeating: 0, count: 4096)
        let bytesRead = recv(clientSocket, &buffer, buffer.count, 0)
        guard bytesRead > 0 else { return }

        // Get payload
        let payload = RamStore.shared.snapshot()
        guard let jsonData = try? JSONEncoder().encode(payload) else { return }

        // Build HTTP response
        let response = """
            HTTP/1.1 200 OK\r
            Content-Type: application/json\r
            Content-Length: \(jsonData.count)\r
            Access-Control-Allow-Origin: *\r
            Connection: close\r
            \r

            """

        var responseData = Data(response.utf8)
        responseData.append(jsonData)

        // Send response
        responseData.withUnsafeBytes { ptr in
            send(clientSocket, ptr.baseAddress, responseData.count, 0)
        }

        // Shutdown write side
        shutdown(clientSocket, SHUT_WR)
    }
}
```

#### 4.2 Start Server in AppDelegate

Add to `Stats/AppDelegate.swift`:

```swift
// Add property
internal let ramSidecar = RamSidecarBSDSocket()

// In applicationDidFinishLaunching, after CPU sidecar:
let ramSidecarEnabled = Store.shared.bool(key: "enableRamSidecar", defaultValue: false)
if ramSidecarEnabled {
    self.ramSidecar.start()
    info("RAM sidecar started on port 8974")
} else {
    info("RAM sidecar disabled via configuration")
}

// In applicationWillTerminate:
self.ramSidecar.stop()
```

---

### 5. Configure Readers

Check if RAM module readers need popup gating adjustments.

#### 5.1 Check Current Reader Setup

Look in `Modules/RAM/readers.swift`:

```swift
public class UsageReader: Reader<RAM_Usage> {
    public override func setup() {
        self.popup = false  // Already runs continuously - good!
        self.setInterval(1)
    }
    // ...
}

public class ProcessReader: Reader<[TopProcess]> {
    public override func setup() {
        self.popup = true  // Only runs when popup is open - needs fix!
        self.setInterval(1)
    }
    // ...
}
```

#### 5.2 Update ProcessReader

Make ProcessReader respect the sidecar flag:

```swift
public override func setup() {
    // Only run continuously if the RAM sidecar is enabled
    let sidecarEnabled = Store.shared.bool(key: "enableRamSidecar", defaultValue: false)
    self.popup = !sidecarEnabled

    // Use longer interval when sidecar is enabled
    if sidecarEnabled {
        let interval = Store.shared.int(key: "RAM_sidecarProcessInterval", defaultValue: 5)
        self.setInterval(interval)
    } else {
        self.setInterval(Store.shared.int(key: "RAM_updateTopInterval", defaultValue: 1))
    }
}
```

---

### 6. Create Tauri Frontend

#### 6.1 Create Store

Create `stats-tauri/src/stores/ramStore.ts`:

```typescript
import { create } from 'zustand';
import { RAMData } from '@/types/ram';

export type RamSnapshot = Omit<RAMData, 'timestamp'> & { timestamp: number };

type RamState = {
  latest?: RamSnapshot;
  history: RamSnapshot[];
  setSnapshot: (payload: RamSnapshot) => void;
};

export const useRamStore = create<RamState>((set) => ({
  history: [],
  setSnapshot: (payload) =>
    set((state) => ({
      latest: payload,
      history: [...state.history.slice(-59), payload]
    }))
}));
```

#### 6.2 Create Data Hook

Create `stats-tauri/src/hooks/useRamData.ts`:

```typescript
import { useEffect } from 'react';
import { useRamStore, RamSnapshot } from '@/stores/ramStore';

const SIDECAR_URL =
  (import.meta as any).env?.VITE_RAM_SIDECAR_URL || 'http://127.0.0.1:8974/ram';

function mapSidecarPayload(payload: any): RamSnapshot {
  const now = Date.now();

  return {
    totalBytes: payload.totalBytes ?? 0,
    usedBytes: payload.usedBytes ?? 0,
    freeBytes: payload.freeBytes ?? 0,
    activeBytes: payload.activeBytes,
    inactiveBytes: payload.inactiveBytes,
    wiredBytes: payload.wiredBytes,
    compressedBytes: payload.compressedBytes,
    usedPercentage: payload.usedPercentage ?? 0,
    appMemoryBytes: payload.appMemoryBytes,
    cachedFilesBytes: payload.cachedFilesBytes,
    swapTotalBytes: payload.swapTotalBytes,
    swapUsedBytes: payload.swapUsedBytes,
    topProcesses: payload.topProcesses ?? [],
    timestamp: now
  };
}

export function useRamData() {
  const setSnapshot = useRamStore((s) => s.setSnapshot);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(SIDECAR_URL);
        const json = await response.json();
        const snapshot = mapSidecarPayload(json);
        setSnapshot(snapshot);
      } catch (error) {
        console.error('Failed to fetch RAM data:', error);
      }
    };

    // Initial fetch
    fetchData();

    // Poll every second
    const interval = setInterval(fetchData, 1000);

    return () => clearInterval(interval);
  }, [setSnapshot]);
}
```

#### 6.3 Create UI Component

Create `stats-tauri/src/modules/RAM/RAMDetail.tsx`:

```typescript
import { useRamStore, RamSnapshot } from '@/stores/ramStore';

type Props = {
  data?: RamSnapshot;
  history: RamSnapshot[];
};

function formatBytes(bytes: number | undefined): string {
  if (!bytes) return 'N/A';
  const gb = bytes / (1024 ** 3);
  return `${gb.toFixed(2)} GB`;
}

export default function RAMDetail({ data, history }: Props) {
  const usedPct = data?.usedPercentage ?? 0;

  return (
    <div className="space-y-4 rounded-2xl border border-border-default bg-gradient-to-br from-background-secondary to-background-primary/80 p-5 shadow-xl">
      <h2 className="text-xl font-semibold text-foreground-primary">RAM</h2>

      {/* Usage Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Used</span>
          <span>{usedPct.toFixed(1)}%</span>
        </div>
        <div className="h-4 w-full rounded-full bg-border-subtle overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
            style={{ width: `${usedPct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-foreground-secondary">
          <span>{formatBytes(data?.usedBytes)} used</span>
          <span>{formatBytes(data?.totalBytes)} total</span>
        </div>
      </div>

      {/* Memory Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-border-subtle bg-background-primary/70 p-3">
          <div className="text-xs text-foreground-secondary">App Memory</div>
          <div className="text-lg font-semibold text-foreground-primary">
            {formatBytes(data?.appMemoryBytes)}
          </div>
        </div>

        <div className="rounded-lg border border-border-subtle bg-background-primary/70 p-3">
          <div className="text-xs text-foreground-secondary">Wired</div>
          <div className="text-lg font-semibold text-foreground-primary">
            {formatBytes(data?.wiredBytes)}
          </div>
        </div>

        <div className="rounded-lg border border-border-subtle bg-background-primary/70 p-3">
          <div className="text-xs text-foreground-secondary">Cached</div>
          <div className="text-lg font-semibold text-foreground-primary">
            {formatBytes(data?.cachedFilesBytes)}
          </div>
        </div>

        <div className="rounded-lg border border-border-subtle bg-background-primary/70 p-3">
          <div className="text-xs text-foreground-secondary">Compressed</div>
          <div className="text-lg font-semibold text-foreground-primary">
            {formatBytes(data?.compressedBytes)}
          </div>
        </div>
      </div>

      {/* Top Processes */}
      <div className="space-y-2 rounded-lg border border-border-subtle bg-background-primary/70 p-3">
        <h4 className="text-sm font-semibold text-foreground-primary">
          Top Memory Consumers
        </h4>
        <div className="space-y-1">
          {data?.topProcesses.slice(0, 8).map((p) => (
            <div key={p.pid} className="flex justify-between text-xs">
              <span className="text-foreground-primary">{p.name}</span>
              <span className="text-foreground-secondary">
                {formatBytes(p.memoryBytes)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

#### 6.4 Add to App

Update `stats-tauri/src/App.tsx`:

```typescript
import { useRamData } from '@/hooks/useRamData';
import { useRamStore } from '@/stores/ramStore';
import RAMDetail from '@/modules/RAM/RAMDetail';

function App() {
  // Existing CPU hooks
  useCpuData();
  const cpuLatest = useCpuStore((s) => s.latest);
  const cpuHistory = useCpuStore((s) => s.history);

  // Add RAM hooks
  useRamData();
  const ramLatest = useRamStore((s) => s.latest);
  const ramHistory = useRamStore((s) => s.history);

  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
      <CPUDetail data={cpuLatest} history={cpuHistory} />
      <RAMDetail data={ramLatest} history={ramHistory} />
    </div>
  );
}
```

---

## Testing

### 1. Build Stats App

```bash
# In Xcode
# Product → Build (⌘B)
# Ensure no errors
```

### 2. Enable Sidecar

```bash
# Enable RAM sidecar
defaults write eu.exelban.Stats enableRamSidecar -bool true

# Restart Stats app
killall Stats
open -a Stats
```

### 3. Verify HTTP Endpoint

```bash
# Test endpoint
curl http://127.0.0.1:8974/ram | jq

# Should see:
# {
#   "totalBytes": 17179869184,
#   "usedBytes": 12884901888,
#   "usedPercentage": 75.0,
#   "topProcesses": [...]
# }
```

### 4. Test Tauri UI

```bash
cd stats-tauri
npm install
npm run dev

# Open http://localhost:1420
# Verify RAM module displays data
```

---

## Best Practices

### Thread Safety
- Always use `NSLock` in store classes
- Lock before reading/writing payload
- Use `defer { lock.unlock() }` pattern

### Battery Efficiency
- Default sidecar to **disabled** (`defaultValue: false`)
- Use separate interval keys for sidecar mode
- Document battery impact in README

### Error Handling
- Handle missing optional values gracefully
- Return `nil` for unavailable metrics
- Don't crash on malformed notifications

### Documentation
- Add configuration section to README
- Document all `defaults write` keys
- Include battery impact table
- Provide helper scripts

### Code Quality
- Follow existing Swift/TypeScript style
- Add inline comments for complex logic
- Use TypeScript strict mode
- Write clear variable names

---

## Module-Specific Notes

### RAM Module
- Port: **8974**
- Main notification: `ramUsageUpdated`
- Process notification: `ramProcessesUpdated`
- Key type: `RAM_Usage`

### Disk Module
- Port: **8975**
- Notifications: `diskLoadUpdated`, `diskSmartUpdated`
- Key types: `Disk_Load`, `SmartData`
- Multiple drives: Return array of disk objects

### Network Module
- Port: **8976**
- Notifications: `networkLoadUpdated`, `networkProcessesUpdated`
- Key types: `Network_Load`, `[TopProcess]`
- Track: upload/download rates, total bytes, interface stats

### Battery Module
- Port: **8977**
- Notifications: `batteryLevelUpdated`, `batteryStateUpdated`
- Key types: `Battery_Info`
- Track: percentage, time remaining, cycles, health, power source

---

## Common Issues

### "Module not found" in AppDelegate

**Solution:** Ensure module is imported:
```swift
import RAM  // or Disk, Network, Battery
```

### Port Already in Use

**Solution:** Choose different port or find conflicting process:
```bash
lsof -i :8974
kill -9 <PID>
```

### Data Not Updating

**Solution:**
1. Check reader popup gating (should respect `enableXxxSidecar`)
2. Verify notifications are firing (add debug prints)
3. Confirm sidecar is enabled and app restarted

### TypeScript Type Mismatches

**Solution:**
- Match Swift property names exactly
- Use optional (`?`) for nullable Swift properties
- Test with `curl | jq` to see actual JSON shape

---

## Example: Complete Disk Module Migration

See `examples/disk-migration/` (fictional) for:
- `DiskPayload.swift` - Complete payload type
- `DiskStore.swift` - Thread-safe store
- `DiskSidecarBSDSocket.swift` - HTTP server
- `stats-tauri/src/modules/Disk/` - React UI
- Tests and documentation

---

## Getting Help

- **Issues:** Check existing GitHub issues for similar problems
- **Code Review:** Review CPU module implementation as reference
- **Documentation:** See README-SIDECAR.md for configuration details
- **Community:** Ask in discussions for architecture questions

---

## Checklist

Before submitting a PR for a new module:

- [ ] Swift payload type defined with `Codable`
- [ ] Store class with thread-safe `NSLock`
- [ ] NotificationCenter subscriptions in AppDelegate
- [ ] HTTP server with proper CORS headers
- [ ] Reader popup gating respects sidecar flag
- [ ] TypeScript types match Swift payload
- [ ] Zustand store for state management
- [ ] React component with visualizations
- [ ] README documentation with examples
- [ ] Helper script for enable/disable
- [ ] Tested on macOS (Intel and Apple Silicon if possible)
- [ ] No console spam (logging removed from hot paths)
- [ ] Battery impact documented
- [ ] All defaults set to `false` (opt-in)

---

## Next Steps

1. Choose a module (RAM recommended for beginners)
2. Follow this guide step-by-step
3. Test thoroughly
4. Document any module-specific gotchas
5. Submit PR with clear description

**Happy migrating!** 🚀
