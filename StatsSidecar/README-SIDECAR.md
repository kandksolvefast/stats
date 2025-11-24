# CPU Sidecar - HTTP Server Implementation

## Overview

Two implementations available for exposing CPU metrics via HTTP:

1. **CpuSidecar.swift** - Uses Apple's Network framework (NWConnection)
2. **CpuSidecarBSDSocket.swift** - Uses BSD sockets (more reliable for HTTP/1.1)

## Current Status

- **NWConnection version** has issues with body delivery (curl shows "transfer closed with X bytes remaining")
- **BSD socket version** is a proven fallback

---

## How to Switch to BSD Socket Version

### Step 1: Update AppDelegate.swift

Find this line:
```swift
private let sidecar = CpuSidecar()
```

Change to:
```swift
private let sidecar = CpuSidecarBSDSocket()
```

### Step 2: Rebuild

Rebuild the Stats app in Xcode.

### Step 3: Test

```bash
curl -v http://127.0.0.1:8973/cpu
```

Should now show the full JSON body without "transfer closed" error.

---

## Comparison

| Feature | NWConnection | BSD Socket |
|---------|-------------|------------|
| **Complexity** | More complex (async, state handlers) | Simple, synchronous |
| **Control** | Less control over TCP lifecycle | Full control |
| **HTTP/1.1** | Not designed for raw HTTP | Perfect for HTTP/1.1 |
| **Debugging** | Harder to debug state transitions | Easy to debug with `recv()`/`send()` |
| **Performance** | Modern async I/O | Traditional blocking I/O |
| **Reliability** | Can have timing issues | Proven, reliable |

---

## Why NWConnection Might Fail

1. **Connection lifecycle**: `isComplete: true` signals EOF but might not flush buffers before state transitions
2. **State handler conflicts**: `.cancelled` state can trigger premature `cancel()` calls
3. **Modern protocol focus**: NWConnection is designed for HTTP/2, QUIC, etc., not raw HTTP/1.1
4. **Async complexity**: Multiple async callbacks can race with connection state changes

## Why BSD Sockets Work

1. **Simple, synchronous**: Read request → Send response → Close
2. **Full control**: We explicitly call `shutdown(SHUT_WR)` to signal EOF
3. **Proven**: BSD sockets have been used for HTTP servers since the 90s
4. **No state handler conflicts**: Direct socket operations, no state machine

---

## Recommendation

**Use BSD socket version** unless you need NWConnection's advanced features (TLS, modern protocols, etc.).

For a simple HTTP/1.1 JSON API on localhost, BSD sockets are the right tool.

---

## Testing

Both versions respond to:
```bash
curl http://127.0.0.1:8973/cpu
```

Expected response:
```json
{"totalUsage":45.2,"perCoreUsage":[40,50,...],"topProcesses":[...]}
```

---

## Logs

### NWConnection Logs (Detailed)
- Connection state transitions
- Send completion status
- Hex dump of response bytes

### BSD Socket Logs (Simple)
- Bytes received
- Payload to send
- Bytes sent
- Connection closed

---

## Next Steps

1. Try enhanced NWConnection version (already applied)
2. Check logs to understand failure
3. If still broken, switch to BSD socket version
4. Update AppDelegate.swift per instructions above

---

## Configuration

### Enabling the Sidecar

**Default:** The sidecar is **disabled by default** to preserve battery life.

**⚠️ IMPORTANT:** After changing this setting, you **MUST restart the Stats app** for changes to take effect. The `enableCpuSidecar` flag is read once at startup and cannot be changed at runtime.

#### Option 1: Helper Script (Recommended)

Use the included toggle script that handles restart automatically:

```bash
# From the project root
./toggle-sidecar.sh
```

The script provides:
- Interactive menu to enable/disable sidecar
- Automatic Stats app restart
- Verification that sidecar is working
- Clear status messages

#### Option 2: Manual Configuration

To enable:
```bash
defaults write eu.exelban.Stats enableCpuSidecar -bool true
# Then restart Stats app
```

To disable:
```bash
defaults write eu.exelban.Stats enableCpuSidecar -bool false
# Then restart Stats app
```

#### Verification

After enabling and restarting, verify the sidecar is working:

```bash
# Check if sidecar is running
curl http://127.0.0.1:8973/cpu

# Should return JSON with data like:
# {"totalUsage":45.2,"perCoreUsage":[40,50,...],"temperature":52.0,"topProcesses":[...]}
```

**If you see empty/missing fields** (`topProcesses: []`, `temperature: null`, etc.), the sidecar is running but readers are not feeding data. This means:
- The `enableCpuSidecar` flag was not enabled when the app started, OR
- You forgot to restart the app after enabling the flag

**Solution:** Enable the flag and restart:
```bash
defaults write eu.exelban.Stats enableCpuSidecar -bool true
# Kill and relaunch Stats app
```

### Battery Impact

When the sidecar is enabled, the following continuous polling occurs:

| Reader | Operation | Default Interval | Battery Impact |
|--------|-----------|------------------|----------------|
| **ProcessReader** | `/bin/ps` spawn | 5 seconds | Medium |
| **TemperatureReader** | SMC sensor reads | 1 second | Low-Medium |
| **FrequencyReader** | IOReport queries | 1 second | Low-Medium |
| **AverageLoadReader** | `uptime` command | 15 seconds | Low |

**Total Impact:** Moderate continuous CPU/battery usage. Not recommended for prolonged use on battery power.

### Advanced Configuration

#### Process Polling Interval

Adjust how often process data is polled when sidecar is enabled:

```bash
# Set to 10 seconds (more battery-friendly)
defaults write eu.exelban.Stats CPU_sidecarProcessInterval -int 10

# Set to 3 seconds (more responsive, higher battery drain)
defaults write eu.exelban.Stats CPU_sidecarProcessInterval -int 3
```

**Default:** 5 seconds (when sidecar is enabled)

#### Number of Processes Tracked

```bash
# Track fewer processes to reduce ps overhead
defaults write eu.exelban.Stats CPU_processes -int 5

# Track more processes (default: 8)
defaults write eu.exelban.Stats CPU_processes -int 12
```

---

## Battery-Friendly Usage

For minimal battery impact when using the sidecar:

1. **Enable only when needed (requires restart each time):**
   ```bash
   # Enable before using Tauri UI
   defaults write eu.exelban.Stats enableCpuSidecar -bool true
   # Restart Stats app now

   # When done, disable and restart again
   defaults write eu.exelban.Stats enableCpuSidecar -bool false
   # Restart Stats app again
   ```

   **Note:** Because the setting is read at startup, you must restart the app after each change.

2. **Increase polling intervals:**
   ```bash
   defaults write eu.exelban.Stats CPU_sidecarProcessInterval -int 10
   ```

3. **Reduce process count:**
   ```bash
   defaults write eu.exelban.Stats CPU_processes -int 5
   ```

4. **Restart Stats app** after changing configuration
