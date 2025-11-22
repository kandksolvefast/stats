# Phase 1: CPU Frontend (React/Tailwind)

**Target Date:** 2025-12-05
**Owner:** TBD

## Summary
Implement CPU widget/popup/settings and wire to Tauri commands using Zustand stores and hooks.

## References
- CPU spec: docs/modules/cpu.md
- Design system: docs/design-system.md
- Testing: docs/testing.md

## Checklist
- [ ] Create CPU store (`useCpuStore`) and hook (`useSystemData`) wiring to Tauri events
- [ ] Implement CPUWidget (menu bar) + CPUPopup (details) + CPUSettings
- [ ] Add charts with Recharts per design system
- [ ] Add loading/skeleton and error states
- [ ] Component tests (Vitest + RTL)
- [ ] Update docs/status.md + docs/changelog.md when complete

## Acceptance Criteria
- UI renders with live data from Tauri events
- Charts show historical data (circular buffer)
- Settings persist intervals and toggles
- Tests cover store logic and component render paths
