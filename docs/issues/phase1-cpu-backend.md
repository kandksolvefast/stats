# Phase 1: CPU Backend (Rust/Tauri)

**Target Date:** 2025-12-03
**Owner:** TBD

## Summary
Implement CPU reader, Tauri commands, and event streaming for the CPU module per `docs/modules/cpu.md`.

## References
- CPU spec: docs/modules/cpu.md
- Architecture: docs/architecture.md
- Testing: docs/testing.md

## Checklist
- [ ] Flesh out `src-tauri/src/readers/cpu.rs` with history buffer and config
- [ ] Add `get_cpu_stats`, `start_monitoring`, `stop_monitoring` commands
- [ ] Event streaming to frontend (`cpu_update`)
- [ ] Unit tests for CPU reader (sysinfo-based)
- [ ] Benchmarks (Criterion) for snapshot collection
- [ ] Update docs/status.md + docs/changelog.md when complete

## Acceptance Criteria
- Commands return data matching CPU module contract
- Event stream configurable intervals (1s/2s/5s/10s)
- Tests and benchmarks added per `docs/testing.md`
