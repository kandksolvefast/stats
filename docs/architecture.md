# Stats - System Architecture

**Status:** v1.0 | **Last Updated:** 2025-11-22 | **Phase:** Planning

## Overview

Stats is a cross-platform system monitoring application built with Tauri, combining a Rust backend for system data collection with a React + TypeScript + Tailwind frontend for visualization.

### Key Architectural Principles

1. **Separation of Concerns**: Clear boundary between data collection (Rust) and presentation (React)
2. **Event-Driven**: Async data streaming from backend to frontend
3. **Modular**: Each monitoring module is independent and pluggable
4. **Performance-First**: Efficient rendering, minimal overhead, lazy loading
5. **Type-Safe**: End-to-end type safety from Rust to TypeScript

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                     (React + TypeScript)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │ System Tray  │  │  Dashboard   │  │  Settings Window     │ │
│  │   Widgets    │  │    View      │  │                      │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────────────┘ │
│         │                 │                  │                  │
│         └─────────────────┴──────────────────┘                  │
│                           │                                     │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │              Module Components Layer                     │  │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │  │
│  │  │ CPU │ │ RAM │ │ Net │ │Disk │ │ GPU │ │ ... │       │  │
│  │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘       │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                     │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │           Shared Components & Hooks                      │  │
│  │  • Charts  • Widgets  • Cards  • Tables                  │  │
│  │  • useSystemData  • useChart  • useSettings              │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                     │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │            State Management (Zustand)                    │  │
│  │  • CPU Store  • RAM Store  • Settings Store              │  │
│  │  • App Store  • Notification Store                       │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
              ┌─────────────▼──────────────┐
              │   Tauri IPC Bridge         │
              │   (invoke, events)         │
              └─────────────┬──────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      RUST BACKEND                               │
│                        (Tauri)                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Tauri Commands                          │  │
│  │  • get_cpu_stats()       • get_network_stats()          │  │
│  │  • get_memory_stats()    • start_monitoring()           │  │
│  │  • get_disk_stats()      • stop_monitoring()            │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                     │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │              Monitoring Coordinator                      │  │
│  │  • Manages reader lifecycle                              │  │
│  │  • Handles update intervals                              │  │
│  │  • Emits events to frontend                              │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                     │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │                   Readers Layer                          │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │  │
│  │  │CPUReader │ │RAMReader │ │NetReader │ │DiskReader│   │  │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘   │  │
│  │       │            │            │            │           │  │
│  └───────┼────────────┼────────────┼────────────┼───────────┘  │
│          │            │            │            │               │
│  ┌───────▼────────────▼────────────▼────────────▼───────────┐  │
│  │              System Information Layer                    │  │
│  │  • sysinfo crate  • battery crate  • network crate       │  │
│  │  • Platform-specific APIs (IOKit, WMI, sysfs)            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                ┌───────────▼────────────┐
                │   Operating System     │
                │   (macOS/Windows/Linux)│
                └────────────────────────┘
```

---

## Data Flow

### 1. Initial Load Flow

```
User launches app
    │
    ├─▶ Tauri creates main window
    │   └─▶ React app mounts
    │       └─▶ Module components mount
    │           └─▶ useSystemData() hooks initialize
    │               └─▶ invoke("start_monitoring", { module: "cpu", interval: 1000 })
    │
    └─▶ Rust: start_monitoring command
        └─▶ Spawns async task for module
            └─▶ Creates reader instance (CPUReader::new())
                └─▶ Enters poll loop:
                    ├─▶ reader.read() → collect system data
                    ├─▶ emit("cpu_update", data) → send to frontend
                    └─▶ tokio::time::sleep(interval)
```

### 2. Real-time Update Flow

```
┌─────────────┐                  ┌──────────────┐                 ┌────────────┐
│   Rust      │                  │    Tauri     │                 │  React     │
│   Reader    │                  │    Event     │                 │  Frontend  │
└──────┬──────┘                  └──────┬───────┘                 └─────┬──────┘
       │                                │                               │
       │ read() every 1s                │                               │
       ├────────────────────────────────▶ emit("cpu_update", data)     │
       │                                ├───────────────────────────────▶
       │                                │                               │
       │                                │                    event listener
       │                                │                    updates store
       │                                │                               │
       │                                │                    store.setCPUData()
       │                                │                               │
       │                                │                    React re-renders
       │                                │                    components
       │                                │                               │
       │ read() every 1s                │                               │
       ├────────────────────────────────▶ emit("cpu_update", data)     │
       │                                ├───────────────────────────────▶
       │                                │                               │
```

### 3. User Interaction Flow (Settings Change)

```
User changes update interval
    │
    └─▶ React: onChange handler
        └─▶ invoke("update_interval", { module: "cpu", interval: 5000 })
            └─▶ Rust: update_interval command
                └─▶ Stops current reader task
                    └─▶ Starts new task with new interval
                        └─▶ Saves to settings
                            └─▶ emit("settings_updated")
                                └─▶ React: Settings store updates
```

---

## Module Architecture

Each monitoring module follows a consistent pattern across both Rust and React.

### Rust Module Structure

```
src-tauri/src/readers/cpu.rs

pub struct CPUReader {
    system: System,           // sysinfo::System instance
    history: VecDeque<f64>,   // Rolling history buffer
    config: CPUConfig,        // Module configuration
}

impl CPUReader {
    pub fn new(config: CPUConfig) -> Self { ... }

    pub async fn read(&mut self) -> Result<CPUData> {
        // 1. Refresh system info
        self.system.refresh_cpu();

        // 2. Collect data
        let usage = self.system.global_cpu_info().cpu_usage();
        let per_core = self.system.cpus().iter()
            .map(|cpu| cpu.cpu_usage())
            .collect();

        // 3. Update history
        self.history.push_back(usage);
        if self.history.len() > 60 {
            self.history.pop_front();
        }

        // 4. Return structured data
        Ok(CPUData {
            total_usage: usage,
            per_core_usage: per_core,
            timestamp: Utc::now(),
            ...
        })
    }

    pub async fn get_top_processes(&self, limit: usize) -> Vec<Process> { ... }
}

// Data structure (serialized to JSON)
#[derive(Serialize, Deserialize)]
pub struct CPUData {
    pub total_usage: f64,
    pub per_core_usage: Vec<f64>,
    pub system_load: f64,
    pub user_load: f64,
    pub temperature: Option<f64>,
    pub frequency: Option<u64>,
    pub timestamp: DateTime<Utc>,
}
```

### React Module Structure

```
src/modules/CPU/
├── CPUWidget.tsx          # System tray widget
├── CPUPopup.tsx           # Detailed popup panel
├── CPUSettings.tsx        # Settings page
├── useCPU.ts              # Custom hook for CPU data
└── types.ts               # TypeScript types

// Custom hook
export function useCPU(interval: number = 1000) {
    const store = useCPUStore();

    useEffect(() => {
        // Start monitoring
        invoke('start_monitoring', { module: 'cpu', interval });

        // Listen for updates
        const unlisten = listen<CPUData>('cpu_update', (event) => {
            store.setData(event.payload);
        });

        return () => {
            unlisten.then(fn => fn());
            invoke('stop_monitoring', { module: 'cpu' });
        };
    }, [interval]);

    return {
        data: store.data,
        history: store.history,
        isLoading: store.isLoading,
    };
}
```

---

## Technology Stack

### Frontend

| Layer | Technology | Purpose | Version |
|-------|-----------|---------|---------|
| **Framework** | React | UI component library | 18.x |
| **Language** | TypeScript | Type safety | 5.x |
| **Styling** | Tailwind CSS | Utility-first styling | 3.x |
| **State** | Zustand | Lightweight state management | 4.x |
| **Charts** | Recharts | Data visualization | 2.x |
| **Animation** | Framer Motion | UI animations | 11.x |
| **Build** | Vite | Fast dev server & bundler | 5.x |
| **Testing** | Vitest + RTL | Unit & component tests | Latest |

### Backend

| Layer | Technology | Purpose | Version |
|-------|-----------|---------|---------|
| **Framework** | Tauri | Desktop app framework | 1.5+ |
| **Language** | Rust | System programming | 1.70+ |
| **System Info** | sysinfo | CPU, RAM, disk, network | 0.30+ |
| **Battery** | battery | Battery information | 0.7+ |
| **Async Runtime** | Tokio | Async task execution | 1.x |
| **Serialization** | serde + serde_json | Data serialization | 1.x |
| **Time** | chrono | Date/time handling | 0.4 |
| **Testing** | cargo test | Unit tests | Built-in |

### Development

| Tool | Purpose |
|------|---------|
| **ESLint** | JavaScript/TypeScript linting |
| **Prettier** | Code formatting |
| **Rustfmt** | Rust code formatting |
| **Clippy** | Rust linting |
| **Playwright** | E2E testing |
| **GitHub Actions** | CI/CD |

---

## Key Technical Decisions

### State Management: Zustand

**Rationale**: Lightweight, minimal boilerplate, excellent TypeScript support, sufficient for our needs.

**Store Structure**:
```typescript
// Per-module stores
interface CPUStore {
    data: CPUData | null;
    history: number[];
    isLoading: boolean;
    error: Error | null;
    setData: (data: CPUData) => void;
    addToHistory: (value: number) => void;
}

// Global app store
interface AppStore {
    activeModules: string[];
    updateInterval: number;
    theme: 'dark' | 'light';
    setTheme: (theme: 'dark' | 'light') => void;
}

// Settings store
interface SettingsStore {
    moduleSettings: Record<string, any>;
    saveSettings: (module: string, settings: any) => void;
    loadSettings: () => void;
}
```

### Data Streaming: Tauri Events

**Pattern**: Rust emits events, React listens via `listen()` API.

**Why not polling**: Event-driven is more efficient, reduces latency, avoids unnecessary requests.

**Event naming convention**: `{module}_update` (e.g., `cpu_update`, `memory_update`)

### Historical Data: In-Memory Circular Buffer

**Rust side**: `VecDeque<T>` with max size (e.g., 60 data points for 1-minute history at 1s interval)

**React side**: Array in Zustand store, updated on each event

**Persistence**: Optional save to IndexedDB for longer history (Phase 2+)

### Chart Library: Recharts

**Rationale**: React-friendly, good performance, declarative API, active development.

**Alternatives considered**: Chart.js (imperative), Victory (heavy), D3 (complex).

### Update Intervals: Backend-Controlled

**Options**: 1s, 2s, 5s, 10s, 15s, 30s, 60s

**Implementation**: Each reader spawns a tokio task with configurable `sleep()` duration.

**Frontend role**: UI for selection, invokes Rust command to change interval.

---

## Data Contracts

### CPU Module

**Command**: `get_cpu_stats() -> CPUData`

**Event**: `cpu_update` payload:
```typescript
interface CPUData {
    totalUsage: number;          // 0-100
    perCoreUsage: number[];      // 0-100 per core
    systemLoad: number;          // 0-100
    userLoad: number;            // 0-100
    idleLoad: number;            // 0-100
    temperature?: number;        // Celsius
    frequency?: number;          // MHz
    topProcesses: Process[];     // Top 5 by default
    timestamp: string;           // ISO 8601
}

interface Process {
    pid: number;
    name: string;
    cpuUsage: number;   // Percentage
    memoryUsage: number; // Bytes
}
```

### Memory Module

**Command**: `get_memory_stats() -> MemoryData`

**Event**: `memory_update` payload:
```typescript
interface MemoryData {
    total: number;           // Bytes
    used: number;            // Bytes
    available: number;       // Bytes
    free: number;            // Bytes
    active: number;          // Bytes
    inactive: number;        // Bytes
    wired: number;           // Bytes (macOS)
    compressed: number;      // Bytes (macOS)
    swapTotal: number;       // Bytes
    swapUsed: number;        // Bytes
    pressure: 'normal' | 'warning' | 'critical';
    topProcesses: Process[];
    timestamp: string;
}
```

### Network Module

**Command**: `get_network_stats() -> NetworkData`

**Event**: `network_update` payload:
```typescript
interface NetworkData {
    uploadSpeed: number;     // Bytes/sec
    downloadSpeed: number;   // Bytes/sec
    totalUploaded: number;   // Bytes (session)
    totalDownloaded: number; // Bytes (session)
    interfaces: NetworkInterface[];
    publicIP?: string;
    timestamp: string;
}

interface NetworkInterface {
    name: string;
    uploadSpeed: number;
    downloadSpeed: number;
    isActive: boolean;
}
```

*(Additional modules follow similar pattern - see docs/modules/ for full specs)*

---

## Performance Optimization Strategy

### Backend

1. **Lazy Initialization**: Only create readers for enabled modules
2. **Efficient Polling**: Use platform-specific APIs (avoid shelling out)
3. **Minimal Allocations**: Reuse buffers, avoid clones where possible
4. **Async Tasks**: Non-blocking I/O, parallel data collection
5. **Batching**: Combine multiple metrics in single read when possible

### Frontend

1. **React.memo**: Memoize expensive components
2. **useMemo/useCallback**: Prevent unnecessary recalculations
3. **Virtual Scrolling**: For process lists (react-window)
4. **Code Splitting**: Lazy load modules with React.lazy()
5. **Debouncing**: Debounce chart re-renders
6. **Windowing**: Limit history size in state (60-300 points)

### IPC

1. **Event Batching**: Batch updates if multiple modules update simultaneously
2. **Selective Updates**: Only send changed data (delta compression)
3. **Throttling**: Respect update intervals, don't spam events

---

## Security Considerations

### Tauri Security

- **CSP**: Content Security Policy enabled
- **Allowlist**: Explicit command allowlist in `tauri.conf.json`
- **No Remote URLs**: All frontend assets bundled, no CDN
- **IPC Validation**: Validate all command inputs in Rust

### System Access

- **Minimal Permissions**: Only request necessary OS permissions
- **No Privileged Operations**: Avoid requiring sudo/admin
- **User Privacy**: No telemetry without explicit consent
- **Local-Only**: No network requests except public IP lookup (optional)

---

## Platform Differences

| Feature | macOS | Windows | Linux |
|---------|-------|---------|-------|
| **CPU Temp** | ✅ (SMC) | ⚠️ (Limited) | ⚠️ (lm-sensors) |
| **CPU Freq** | ✅ | ✅ | ✅ |
| **GPU Stats** | ✅ | ✅ | ⚠️ (Depends on driver) |
| **Battery** | ✅ | ✅ | ✅ |
| **Sensors** | ✅ (Full) | ⚠️ (Basic) | ⚠️ (Varies) |
| **Bluetooth** | ✅ | ✅ | ⚠️ (BlueZ) |
| **Process Tree** | ✅ | ✅ | ✅ |
| **Network/Process** | ✅ | ⚠️ | ⚠️ |

**Legend**: ✅ Full support | ⚠️ Partial/varies | ❌ Not available

**Strategy**: Gracefully degrade features, show informative messages for unavailable metrics.

---

## Error Handling

### Rust

```rust
// Custom error types
#[derive(Debug, thiserror::Error)]
pub enum StatsError {
    #[error("Failed to read system information: {0}")]
    SystemReadError(String),

    #[error("Module not found: {0}")]
    ModuleNotFound(String),

    #[error("Invalid interval: {0}")]
    InvalidInterval(u64),
}

// Result type alias
pub type StatsResult<T> = Result<T, StatsError>;
```

### React

```typescript
// Error boundaries for module failures
<ErrorBoundary fallback={<ModuleError />}>
    <CPUModule />
</ErrorBoundary>

// Error states in stores
interface CPUStore {
    error: Error | null;
    setError: (error: Error) => void;
}

// Toast notifications for user-facing errors
toast.error('Failed to fetch CPU data. Retrying...');
```

---

## Deployment Architecture

### Development
```
npm run tauri dev
  ├─▶ Vite dev server (React)
  └─▶ Cargo build + run (Rust)
```

### Production Build
```
npm run tauri build
  ├─▶ Vite build → optimized bundle
  └─▶ Cargo build --release → native binary
      └─▶ Package platform-specific installer
          ├─▶ macOS: .app bundle + .dmg
          ├─▶ Windows: .exe + .msi
          └─▶ Linux: .deb, .rpm, .AppImage
```

### Auto-Update

```
Tauri Updater
  ├─▶ GitHub Releases as update server
  ├─▶ Version check on startup (optional)
  ├─▶ Background download
  └─▶ Prompt user to install
```

---

## Future Considerations (Post-Phase 1)

1. **Plugin System**: Allow community-contributed modules
2. **Cloud Sync**: Optional settings/data sync via user's cloud
3. **Advanced Charts**: Zoom, pan, export capabilities
4. **Machine Learning**: Anomaly detection, predictions
5. **Mobile Companion**: View stats remotely via mobile app
6. **Multi-System**: Monitor multiple machines from one dashboard
7. **Historical Database**: SQLite for long-term storage, queryable history

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-11-22 | Initial architecture document | Project Team |

---

**Next Steps:**
1. Review and approve architecture
2. Create ADRs for major decisions (state lib, chart lib, etc.)
3. Begin Phase 1 implementation: Project setup + CPU module
