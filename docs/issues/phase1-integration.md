# Phase 1: CPU Integration (End-to-End)

**Target Date:** 2025-12-07
**Owner:** TBD

## Summary
Validate CPU module end-to-end: reader → command/events → store → UI. Cover settings, error handling, and performance targets.

## References
- CPU spec: docs/modules/cpu.md
- Testing: docs/testing.md
- Status: docs/status.md

## Checklist
- [ ] Wire start/stop monitoring commands from UI settings
- [ ] Verify event cadence and data contracts
- [ ] Add E2E test (Playwright) for CPU flow
- [ ] Measure startup time and idle CPU/memory with CPU module enabled
- [ ] Log metrics in docs/testing.md and docs/status.md
- [ ] Update docs/changelog.md after integration

## Acceptance Criteria
- CPU flow works in dev build and packaged app (smoke)
- E2E test passes in CI
- Baseline performance metrics recorded
