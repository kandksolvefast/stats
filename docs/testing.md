# Stats - Testing Strategy

**Status:** v1.0 | **Last Updated:** 2025-11-22

## Overview

Comprehensive testing strategy covering unit, component, integration, E2E, and performance testing to ensure reliability, performance, and maintainability.

### Testing Philosophy

1. **Test Behavior, Not Implementation** - Focus on what the code does, not how
2. **Confidence Over Coverage** - 100% coverage doesn't mean bug-free; meaningful tests do
3. **Fast Feedback** - Unit tests run in < 1s, full suite in < 30s
4. **Fail Fast** - Tests should catch regressions immediately
5. **Realistic Scenarios** - E2E tests mirror actual user workflows

---

## Test Matrix

### Coverage Targets

| Test Type | Target Coverage | Execution Time | Run Frequency |
|-----------|----------------|----------------|---------------|
| **Unit Tests (Rust)** | 70%+ | < 5s | Every commit |
| **Unit Tests (TS)** | 70%+ | < 3s | Every commit |
| **Component Tests** | All shared components | < 5s | Every commit |
| **Integration Tests** | All Tauri commands | < 10s | Pre-push |
| **E2E Tests** | Critical paths | < 30s | Pre-merge |
| **Performance Tests** | All modules | < 20s | Weekly + releases |

---

## Unit Tests

### Rust Backend Tests

**Framework:** `cargo test` (built-in)

**Location:** `src-tauri/src/` (co-located with implementation)

**Naming Convention:** `{module}_tests.rs` or `#[cfg(test)] mod tests { ... }`

**Example Structure:**
```rust
// src-tauri/src/readers/cpu.rs

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cpu_reader_new_initializes_correctly() {
        let config = CPUConfig::default();
        let reader = CPUReader::new(config);
        assert!(reader.history.is_empty());
        assert_eq!(reader.max_history, 300);
    }

    #[test]
    fn test_read_returns_valid_data() {
        let mut reader = CPUReader::new(CPUConfig::default());
        let result = reader.read();

        assert!(result.is_ok());
        let data = result.unwrap();
        assert!(data.total_usage >= 0.0 && data.total_usage <= 100.0);
        assert_eq!(data.per_core_usage.len(), data.logical_cores);
    }

    #[test]
    fn test_history_buffer_limits_size() {
        let mut reader = CPUReader::new(CPUConfig {
            max_history: 5,
            ..Default::default()
        });

        for i in 0..10 {
            reader.add_to_history(i as f64);
        }

        assert_eq!(reader.history.len(), 5);
        assert_eq!(reader.history.front(), Some(&5.0));
    }

    #[test]
    fn test_top_processes_sorted_by_cpu() {
        let reader = CPUReader::new(CPUConfig::default());
        let processes = reader.get_top_processes(5);

        // Verify sorted descending by CPU usage
        for i in 0..processes.len() - 1 {
            assert!(processes[i].cpu_usage >= processes[i + 1].cpu_usage);
        }
    }

    #[test]
    fn test_temperature_returns_none_when_unavailable() {
        // Platform-specific test
        #[cfg(target_os = "windows")]
        {
            let reader = CPUReader::new(CPUConfig::default());
            let temp = reader.get_temperature();
            // On most Windows systems, this will be None
            // (can't assert None because some systems support it)
            assert!(temp.is_none() || temp.unwrap() > 0.0);
        }
    }
}
```

**What to Test:**
- [ ] Data structure initialization
- [ ] Data validation (ranges, types)
- [ ] Error handling (graceful failures)
- [ ] Platform-specific behavior
- [ ] Edge cases (empty data, max values, overflow)
- [ ] Serialization/deserialization (serde)

**Run Tests:**
```bash
cd src-tauri
cargo test
cargo test --release  # Performance-sensitive tests
```

### TypeScript/React Tests

**Framework:** Vitest + React Testing Library

**Location:** `src/**/__tests__/` (co-located with components)

**Naming Convention:** `{ComponentName}.test.tsx` or `{hookName}.test.ts`

**Example Structure:**
```typescript
// src/modules/CPU/__tests__/useCPU.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useCPU } from '../useCPU';
import { mockInvoke } from '@tauri-apps/api/mocks';

describe('useCPU', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('initializes with loading state', () => {
        const { result } = renderHook(() => useCPU(1000));

        expect(result.current.isLoading).toBe(true);
        expect(result.current.data).toBeNull();
    });

    test('updates data on cpu_update event', async () => {
        const mockData: CPUData = {
            totalUsage: 45.2,
            perCoreUsage: [40, 50],
            systemLoad: 10,
            userLoad: 35,
            idleLoad: 55,
            physicalCores: 2,
            logicalCores: 2,
            topProcesses: [],
            timestamp: new Date().toISOString(),
        };

        const { result } = renderHook(() => useCPU(1000));

        // Simulate event
        await mockInvoke('start_monitoring', { module: 'cpu', interval: 1000 });
        // Emit mock event
        // (use event emitter mock or trigger store update directly)

        await waitFor(() => {
            expect(result.current.data).toEqual(mockData);
            expect(result.current.isLoading).toBe(false);
        });
    });

    test('adds to history buffer', async () => {
        const { result } = renderHook(() => useCPU(1000));

        // Simulate multiple updates
        for (let i = 0; i < 5; i++) {
            // Trigger store update with i% usage
        }

        await waitFor(() => {
            expect(result.current.history.length).toBe(5);
        });
    });

    test('limits history to 300 points', async () => {
        const { result } = renderHook(() => useCPU(1000));

        // Simulate 400 updates
        for (let i = 0; i < 400; i++) {
            // Trigger store update
        }

        await waitFor(() => {
            expect(result.current.history.length).toBe(300);
        });
    });
});
```

```typescript
// src/modules/CPU/__tests__/CPUWidget.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { CPUWidget } from '../CPUWidget';
import { useCPUStore } from '@/stores/cpuStore';

describe('CPUWidget', () => {
    test('renders mini variant with percentage', () => {
        // Setup store with mock data
        useCPUStore.setState({
            data: {
                totalUsage: 45.2,
                // ... other fields
            },
        });

        render(<CPUWidget variant="mini" />);

        expect(screen.getByText('45%')).toBeInTheDocument();
    });

    test('shows loading state', () => {
        useCPUStore.setState({ isLoading: true, data: null });

        render(<CPUWidget variant="mini" />);

        expect(screen.getByTestId('cpu-widget-skeleton')).toBeInTheDocument();
    });

    test('shows error state', () => {
        useCPUStore.setState({
            error: new Error('Failed to fetch'),
            data: null,
        });

        render(<CPUWidget variant="mini" />);

        expect(screen.getByText(/error/i)).toBeInTheDocument();
    });

    test('updates when data changes', async () => {
        const { rerender } = render(<CPUWidget variant="mini" />);

        useCPUStore.setState({
            data: { totalUsage: 50, /* ... */ },
        });

        rerender(<CPUWidget variant="mini" />);

        expect(screen.getByText('50%')).toBeInTheDocument();
    });
});
```

**What to Test:**
- [ ] Component rendering (snapshots optional)
- [ ] Props variations
- [ ] User interactions (clicks, inputs)
- [ ] Conditional rendering
- [ ] Error boundaries
- [ ] Loading states
- [ ] Hook behavior (data flow, cleanup)
- [ ] Store updates

**Run Tests:**
```bash
npm test
npm run test:coverage
npm run test:ui  # Vitest UI
```

---

## Component Tests

Test all reusable components in isolation with various props and states.

**Location:** `src/components/__tests__/`

**Components to Test:**
- [ ] `Button` - All variants, sizes, states
- [ ] `Card` - Variants, hover, click
- [ ] `Input` - Value changes, validation, disabled
- [ ] `Toggle` - On/off, disabled, callback
- [ ] `Modal` - Open/close, backdrop click, escape key
- [ ] `Tooltip` - Hover, positioning
- [ ] `Badge` - Variants, content
- [ ] `Dropdown` - Selection, keyboard nav
- [ ] Charts (LineChart, BarChart, etc.) - Data rendering, animations, tooltips

**Example:**
```typescript
// src/components/__tests__/Button.test.tsx
describe('Button', () => {
    test('renders primary variant', () => {
        render(<Button variant="primary">Click me</Button>);
        expect(screen.getByRole('button')).toHaveClass('bg-cpu-500');
    });

    test('calls onClick handler', async () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click me</Button>);

        await userEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledOnce();
    });

    test('disabled state prevents clicks', async () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick} disabled>Click me</Button>);

        await userEvent.click(screen.getByRole('button'));
        expect(handleClick).not.toHaveBeenCalled();
    });
});
```

---

## Integration Tests

Test Tauri command invocation and event streaming between Rust and React.

**Location:** `tests/integration/`

**Framework:** Vitest with Tauri test helpers

**What to Test:**
- [ ] Command invocation returns expected data
- [ ] Event streaming delivers updates
- [ ] Settings persistence (localStorage)
- [ ] Error propagation from Rust to React
- [ ] Concurrent module monitoring

**Example:**
```typescript
// tests/integration/cpu.test.ts
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';
import { describe, test, expect } from 'vitest';

describe('CPU Module Integration', () => {
    test('get_cpu_stats returns valid data', async () => {
        const data = await invoke<CPUData>('get_cpu_stats');

        expect(data).toBeDefined();
        expect(data.totalUsage).toBeGreaterThanOrEqual(0);
        expect(data.totalUsage).toBeLessThanOrEqual(100);
        expect(data.perCoreUsage.length).toBeGreaterThan(0);
        expect(data.timestamp).toBeDefined();
    });

    test('start_monitoring emits events', async () => {
        const events: CPUData[] = [];

        const unlisten = await listen<CPUData>('cpu_update', (event) => {
            events.push(event.payload);
        });

        await invoke('start_monitoring', {
            module: 'cpu',
            interval: 1000
        });

        // Wait for 2.5 seconds to collect 2-3 events
        await new Promise(resolve => setTimeout(resolve, 2500));

        await invoke('stop_monitoring', { module: 'cpu' });
        unlisten();

        expect(events.length).toBeGreaterThanOrEqual(2);
        events.forEach(data => {
            expect(data.totalUsage).toBeGreaterThanOrEqual(0);
        });
    });

    test('concurrent module monitoring', async () => {
        const cpuEvents: CPUData[] = [];
        const memEvents: MemoryData[] = [];

        const unlistenCPU = await listen('cpu_update', (e) => cpuEvents.push(e.payload));
        const unlistenMem = await listen('memory_update', (e) => memEvents.push(e.payload));

        await Promise.all([
            invoke('start_monitoring', { module: 'cpu', interval: 1000 }),
            invoke('start_monitoring', { module: 'memory', interval: 1000 }),
        ]);

        await new Promise(resolve => setTimeout(resolve, 2500));

        await Promise.all([
            invoke('stop_monitoring', { module: 'cpu' }),
            invoke('stop_monitoring', { module: 'memory' }),
        ]);

        unlistenCPU();
        unlistenMem();

        expect(cpuEvents.length).toBeGreaterThanOrEqual(2);
        expect(memEvents.length).toBeGreaterThanOrEqual(2);
    });
});
```

---

## E2E Tests

Test critical user paths through the full application.

**Framework:** Playwright

**Location:** `tests/e2e/`

**Configuration:** `playwright.config.ts`

**Critical User Paths:**
1. **First Launch** - Setup wizard, enable modules, save settings
2. **View CPU Module** - Click tray, see popup, verify data
3. **Change Settings** - Open settings, modify interval, verify persistence
4. **Multiple Modules** - View CPU, RAM, Network in sequence
5. **Threshold Alert** - Set low threshold, trigger notification
6. **Theme Toggle** - Switch dark/light mode, verify persistence

**Example:**
```typescript
// tests/e2e/cpu-module.spec.ts
import { test, expect } from '@playwright/test';

test.describe('CPU Module', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Wait for app to initialize
        await page.waitForSelector('[data-testid="app-ready"]');
    });

    test('displays CPU widget in system tray', async ({ page }) => {
        const widget = page.locator('[data-testid="cpu-widget"]');
        await expect(widget).toBeVisible();

        const usage = await widget.locator('[data-testid="usage-value"]').textContent();
        const usageNum = parseFloat(usage!);
        expect(usageNum).toBeGreaterThanOrEqual(0);
        expect(usageNum).toBeLessThanOrEqual(100);
    });

    test('opens popup on widget click', async ({ page }) => {
        await page.click('[data-testid="cpu-widget"]');

        const popup = page.locator('[data-testid="cpu-popup"]');
        await expect(popup).toBeVisible();

        // Verify popup content
        await expect(popup.locator('h2')).toHaveText('CPU');
        await expect(popup.locator('[data-testid="cpu-gauge"]')).toBeVisible();
        await expect(popup.locator('[data-testid="cpu-chart"]')).toBeVisible();
    });

    test('changes update interval in settings', async ({ page }) => {
        // Open settings
        await page.click('[data-testid="settings-btn"]');
        await page.click('[data-testid="sidebar-cpu"]');

        // Change interval
        await page.selectOption('[data-testid="update-interval"]', '5000');
        await page.click('[data-testid="save-settings"]');

        // Verify saved
        await expect(page.locator('[data-testid="settings-saved-toast"]')).toBeVisible();

        // Reload and verify persistence
        await page.reload();
        await page.click('[data-testid="settings-btn"]');
        await page.click('[data-testid="sidebar-cpu"]');

        const interval = await page.locator('[data-testid="update-interval"]').inputValue();
        expect(interval).toBe('5000');
    });

    test('displays top processes', async ({ page }) => {
        await page.click('[data-testid="cpu-widget"]');

        const processTable = page.locator('[data-testid="cpu-processes"]');
        await expect(processTable).toBeVisible();

        const rows = processTable.locator('tbody tr');
        const rowCount = await rows.count();
        expect(rowCount).toBeGreaterThan(0);
        expect(rowCount).toBeLessThanOrEqual(10);

        // Verify sortable
        await page.click('[data-testid="process-header-cpu"]');
        // Processes should re-sort (verify first process has highest CPU)
    });

    test('threshold notification triggers', async ({ page }) => {
        // Set low threshold
        await page.click('[data-testid="settings-btn"]');
        await page.click('[data-testid="sidebar-cpu"]');
        await page.fill('[data-testid="threshold-warning"]', '1');
        await page.click('[data-testid="enable-notifications"]');
        await page.click('[data-testid="save-settings"]');

        // Wait for notification (should trigger almost immediately with 1% threshold)
        const notification = page.locator('[data-testid="notification"]');
        await expect(notification).toBeVisible({ timeout: 10000 });
        await expect(notification).toContainText('CPU usage above');
    });
});
```

**Run E2E Tests:**
```bash
npx playwright test
npx playwright test --ui  # Interactive UI
npx playwright test --debug  # Debug mode
```

---

## Performance Tests

Ensure the application meets performance budgets.

### Performance Budgets

| Metric | Budget | Measurement |
|--------|--------|-------------|
| **Startup Time** | < 2s | Time to interactive |
| **Idle CPU Usage** | < 5% | Activity Monitor (avg over 1 min) |
| **Idle Memory** | < 100MB | Activity Monitor (RSS) |
| **Update Latency** | < 100ms | Event timestamp → UI render |
| **Chart Render (300pts)** | < 16ms (60 FPS) | React DevTools Profiler |
| **Process List (100)** | < 50ms | React DevTools Profiler |
| **Command Invocation** | < 10ms | Rust instrumentation |
| **Data Read** | < 1ms | Rust benchmark |

### Rust Benchmarks

**Framework:** Criterion

**Location:** `src-tauri/benches/`

**Example:**
```rust
// src-tauri/benches/cpu_bench.rs
use criterion::{black_box, criterion_group, criterion_main, Criterion};
use stats::readers::CPUReader;

fn bench_cpu_read(c: &mut Criterion) {
    let mut reader = CPUReader::new(Default::default());

    c.bench_function("cpu_read", |b| {
        b.iter(|| {
            black_box(reader.read().unwrap());
        });
    });
}

fn bench_top_processes(c: &mut Criterion) {
    let reader = CPUReader::new(Default::default());

    c.bench_function("top_processes_10", |b| {
        b.iter(|| {
            black_box(reader.get_top_processes(10));
        });
    });
}

criterion_group!(benches, bench_cpu_read, bench_top_processes);
criterion_main!(benches);
```

**Run Benchmarks:**
```bash
cd src-tauri
cargo bench
```

**Baseline:** Save first run as baseline, compare future runs:
```bash
cargo bench -- --save-baseline initial
cargo bench -- --baseline initial
```

### Frontend Performance Tests

**Framework:** Vitest + React DevTools Profiler API

**Example:**
```typescript
// tests/performance/chart-render.test.ts
import { render } from '@testing-library/react';
import { Profiler } from 'react';
import { describe, test, expect } from 'vitest';
import { LineChart } from '@/components/LineChart';

describe('Chart Performance', () => {
    test('renders 300 data points in < 16ms', () => {
        const data = Array.from({ length: 300 }, (_, i) => ({
            timestamp: i,
            value: Math.random() * 100,
        }));

        let renderTime = 0;

        const onRender = (
            id: string,
            phase: string,
            actualDuration: number
        ) => {
            if (phase === 'mount') {
                renderTime = actualDuration;
            }
        };

        render(
            <Profiler id="LineChart" onRender={onRender}>
                <LineChart data={data} />
            </Profiler>
        );

        expect(renderTime).toBeLessThan(16); // 60 FPS
    });
});
```

### Manual Performance Testing

**Checklist:**
- [ ] Launch app, measure time to first render (< 2s)
- [ ] Open Activity Monitor/Task Manager
- [ ] Let app idle for 1 minute
- [ ] Verify CPU usage < 5%
- [ ] Verify memory usage < 100MB
- [ ] Enable all modules (CPU, RAM, Network, etc.)
- [ ] Verify CPU usage < 8%
- [ ] Open CPU popup, measure render time
- [ ] Scroll process list (100+ items), verify smooth 60 FPS
- [ ] Switch update interval to 1s, monitor overhead
- [ ] Run for 1 hour, check for memory leaks (should be stable)

### Initial Baseline (empty shell)
- Startup time: **~0.25s** (Vite dev ready ~247ms; dist build ~0.6s). Target < 2s ✅
- Idle CPU: **~0%** (dev server process) Target < 5% ✅
- Idle memory (RSS): **~62MB** (dev server process) Target < 100MB ✅
- Notes: Measured on local macOS host; revisit after wiring more modules.

---

## Fixtures & Test Data

**Location:** `tests/fixtures/`

**Structure:**
```
tests/fixtures/
├── cpu-data.json          # Sample CPU data snapshots
├── memory-data.json       # Sample memory data
├── processes.json         # Sample process lists
├── settings.json          # Sample user settings
└── README.md              # Fixture documentation
```

**Example Fixture:**
```json
// tests/fixtures/cpu-data.json
{
  "idle": {
    "totalUsage": 5.2,
    "perCoreUsage": [4.1, 5.8, 6.0, 5.1],
    "systemLoad": 1.5,
    "userLoad": 3.7,
    "idleLoad": 94.8,
    "temperature": 45.0,
    "frequency": 2400,
    "physicalCores": 2,
    "logicalCores": 4,
    "topProcesses": [],
    "timestamp": "2025-11-22T10:00:00Z"
  },
  "medium": {
    "totalUsage": 45.6,
    ...
  },
  "high": {
    "totalUsage": 85.3,
    ...
  }
}
```

**Usage:**
```typescript
import cpuFixtures from '@/tests/fixtures/cpu-data.json';

test('handles high CPU usage', () => {
    const highCPU = cpuFixtures.high;
    useCPUStore.setState({ data: highCPU });
    // ... assertions
});
```

**Version Notes:**
- Update fixtures when data contracts change
- Document fixture data sources (real captures, synthetic)
- Include edge cases (no data, extreme values)

---

## Continuous Integration

### GitHub Actions Workflow

**File:** `.github/workflows/test.yml`

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  rust-tests:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    steps:
      - uses: actions/checkout@v3
      - uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      - name: Run Rust tests
        run: |
          cd src-tauri
          cargo test --all-features

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --run
      - run: npm run test:coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run tauri build
      - run: npx playwright test

  performance-benchmarks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Rust benchmarks
        run: |
          cd src-tauri
          cargo bench -- --save-baseline ci
      - name: Upload benchmark results
        uses: actions/upload-artifact@v3
        with:
          name: benchmark-results
          path: src-tauri/target/criterion
```

### Pre-commit Hooks

**Tool:** Husky + lint-staged

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "vitest related --run"
    ],
    "*.rs": [
      "cargo fmt",
      "cargo clippy"
    ]
  }
}
```

### Pre-push Hooks

```bash
#!/bin/sh
# .husky/pre-push

# Run fast tests before push
npm test -- --run
cd src-tauri && cargo test
```

---

## Test Reporting

### Coverage Reports

**Backend:**
```bash
cd src-tauri
cargo tarpaulin --out Html --output-dir coverage
open coverage/index.html
```

**Frontend:**
```bash
npm run test:coverage
open coverage/index.html
```

**Thresholds:**
```json
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      lines: 70,
      functions: 70,
      branches: 65,
      statements: 70,
    }
  }
});
```

### Performance Tracking

**Criterion Reports:** `src-tauri/target/criterion/report/index.html`

**Benchmark History:** Track over time, alert on regressions > 10%

**Lighthouse (if web view):** Core Web Vitals, accessibility scores

---

## Manual Testing Checklist

### Before Each Release

**Functional:**
- [ ] All modules display correct data
- [ ] Widgets render in system tray
- [ ] Popups open/close properly
- [ ] Settings persist across restarts
- [ ] Threshold notifications work
- [ ] Theme toggle works
- [ ] Update interval changes take effect
- [ ] Process lists are sortable and accurate

**Cross-Platform:**
- [ ] Test on macOS 11+
- [ ] Test on Windows 10/11
- [ ] Test on Ubuntu 20.04+
- [ ] Verify platform-specific features (temperature, sensors)

**Performance:**
- [ ] No memory leaks (run 24 hours)
- [ ] Idle CPU < 5%
- [ ] Startup time < 2s
- [ ] Smooth animations (60 FPS)

**Accessibility:**
- [ ] Keyboard navigation works
- [ ] Screen reader announces updates
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA

**Edge Cases:**
- [ ] No network (public IP unavailable)
- [ ] No permissions (sensors unavailable)
- [ ] High CPU/RAM (app remains responsive)
- [ ] Many processes (100+, virtualization works)

---

## Test Data Management

### Snapshots

Use sparingly for:
- Complex data structures
- UI component HTML (visual regression)

**Update Snapshots:**
```bash
npm test -- -u
```

**Review Before Committing:** Ensure snapshots reflect intentional changes.

### Mocks

**Tauri Mocks:**
```typescript
// tests/mocks/tauri.ts
import { vi } from 'vitest';

export const mockInvoke = vi.fn((cmd: string, args?: any) => {
    if (cmd === 'get_cpu_stats') {
        return Promise.resolve({ totalUsage: 50, /* ... */ });
    }
    // ... other commands
});

vi.mock('@tauri-apps/api/tauri', () => ({
    invoke: mockInvoke,
}));
```

**Store Mocks:**
```typescript
// Reset store before each test
beforeEach(() => {
    useCPUStore.setState(initialState, true);
});
```

---

## Debugging Tests

### Vitest Debugging

```bash
# Run single test file
npm test src/modules/CPU/__tests__/useCPU.test.ts

# Run in watch mode
npm test -- --watch

# UI mode
npm test -- --ui

# Debug in VS Code
{
  "type": "node",
  "request": "launch",
  "name": "Vitest Debug",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["test", "--", "--run"],
  "console": "integratedTerminal"
}
```

### Playwright Debugging

```bash
# Debug mode (opens inspector)
npx playwright test --debug

# Headed mode (see browser)
npx playwright test --headed

# Trace viewer (detailed timeline)
npx playwright test --trace on
npx playwright show-trace trace.zip
```

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-11-22 | Initial testing strategy | Project Team |

---

**Next Steps:**
1. Set up test infrastructure (Vitest, Playwright, Criterion)
2. Write initial tests for CPU module (MVP)
3. Configure CI/CD pipeline
4. Establish baseline benchmarks
5. Integrate coverage reporting
