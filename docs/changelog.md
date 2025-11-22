# Changelog

All notable changes to the Stats Tauri migration project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planning → Phase 1 Ramp - 2025-11-23

#### Added
- Phase 1 issue drafts (setup, CPU backend, CPU frontend, integration) with target dates and doc links
- `stats-tauri/` scaffold (Vite + React + TS strict + Tailwind tokens + Zustand/Recharts deps)
- Tailwind config seeded from design tokens; Panel + CPU placeholder components
- Tauri Rust skeleton (commands/readers scaffolds) and config files; CPU reader returns data contract fields + top processes
- Module doc stubs for RAM, Network, Disk
- ADR placeholders for storage (IndexedDB vs SQLite), system tray approach, localization
- Docs guardrail workflow (`docs-check`) and script

#### Notes
- Baseline performance metrics pending first dev run; dev server blocked by sandbox EPERM on port bind. Track in docs/testing.md and docs/status.md.

### Planning Phase - 2025-11-22

#### Added
- Comprehensive documentation structure
  - Vision document with goals, scope, and success criteria
  - Architecture document with system design and data flow
  - Design system specification with Tailwind tokens
  - Testing strategy with coverage targets and performance budgets
  - Module documentation template and CPU module spec
  - ADR templates and initial decisions (state management, chart library)
  - PR and issue templates for GitHub workflow

#### Decisions
- **ADR-0001**: Selected Zustand for state management
  - Rationale: Lightweight, minimal boilerplate, perfect for modular architecture
  - Bundle size: ~1KB vs ~15KB for Redux Toolkit

- **ADR-0002**: Selected Recharts for data visualization
  - Rationale: Declarative React API, good performance for our use case (300 points)
  - Trade-off: Developer velocity over raw canvas performance

#### Documentation
- Created docs/ structure with vision, architecture, design-system, testing
- Established module documentation pattern (template + CPU example)
- Set up ADR process for technical decisions
- Defined test matrix and performance budgets

---

## Template for Future Releases

---

## [1.0.0] - YYYY-MM-DD

### Added
- Initial release
- CPU monitoring module
- RAM monitoring module
- Network monitoring module
- System tray integration
- Dashboard view
- Settings panel
- Dark/light theme support
- Auto-update system

### Changed
-

### Deprecated
-

### Removed
-

### Fixed
-

### Security
-

---

## [0.2.0] - YYYY-MM-DD (Phase 2 Example)

### Added
- Disk monitoring module
- GPU monitoring module
- Battery monitoring module
- Historical data persistence (IndexedDB)
- Export data feature (CSV/JSON)

### Changed
- Improved chart performance (60 FPS at 1s intervals)
- Optimized bundle size (reduced by 20KB)

### Fixed
- Memory leak in chart component
- Incorrect CPU temperature on Windows

---

## [0.1.0] - YYYY-MM-DD (Phase 1 - MVP)

### Added
- Project scaffolding (Tauri + React + TypeScript + Tailwind)
- CPU monitoring module (end-to-end)
  - Backend: CPUReader with sysinfo
  - Tauri commands: get_cpu_stats, start_monitoring
  - Frontend: CPUWidget, CPUPopup, CPUSettings
  - Charts: LineChart, Gauge
- RAM monitoring module (basic implementation)
- Design system components (Button, Card, Input, Toggle)
- Zustand stores (CPU, RAM, App, Settings)
- Basic system tray integration

### Infrastructure
- Vitest + React Testing Library setup
- Playwright E2E tests
- Criterion benchmarks (Rust)
- GitHub Actions CI/CD
- Pre-commit hooks (ESLint, Prettier, rustfmt)

### Documentation
- Complete architecture documentation
- CPU module specification
- Testing strategy
- Contributing guidelines

---

## Changelog Entry Format

When adding entries, follow this structure:

### Added
- **[Module/Feature]** - Description of what was added
  - Sub-point with more detail
  - Reference to PR: #123

### Changed
- **[Module/Feature]** - What changed and why
  - Impact: Performance improved by X%
  - Migration notes: How to adapt to this change

### Fixed
- **[Module]** - Bug description
  - Root cause: Brief explanation
  - Fixes: #456

### Performance
- **[Module]** - Performance improvement
  - Before: X ms / Y MB
  - After: X ms / Y MB
  - Benchmark: Link to benchmark results

### Breaking Changes
- **[Module/API]** - What changed
  - Migration path: Step-by-step guide
  - Deprecation timeline: When old API will be removed

---

## Decision Log (Short Form)

Quick decisions that don't warrant full ADRs:

**2025-11-22:**
- Chose Inter font for UI (readability, variable font)
- Set minimum macOS version to 10.15 (Tauri requirement)
- Default update interval: 1 second (configurable 1-60s)
- Chart history limit: 300 points (5 minutes at 1s interval)

---

## Notes

- This changelog is user-facing for releases
- Development progress tracked in [status.md](./status.md)
- Technical decisions documented in [ADRs](./adrs/)
- Module-specific changes documented in module docs

---

**Maintainers:** Keep this file updated with each PR that ships user-facing changes.
