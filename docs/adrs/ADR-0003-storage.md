# ADR-0003: Historical Storage (IndexedDB vs SQLite)

**Status:** Proposed

**Date:** 2025-11-23

**Deciders:** Core maintainers

**Tags:** data, persistence, frontend, backend

---

## Context

We need a cross-platform store for historical samples (per-module metrics) that supports configurable retention, export, and low-overhead reads for charts. MVP must work without heavyweight installers and keep bundle size/memory overhead low.

### Problem Statement

Pick storage for historical metrics in the Tauri app (IndexedDB vs SQLite) that balances write throughput (1s intervals), query simplicity (time-range reads), and portability.

### Goals & Constraints

**Goals:**
- Fast append + range reads for charting (1–10s intervals)
- Offline-friendly; zero external services
- Export to CSV/JSON
- Minimal install friction

**Constraints:**
- Works on macOS/Windows/Linux
- Fits within performance budgets (<100MB memory, low CPU)
- Avoids heavy native dependencies if possible

---

## Decision Drivers

- [x] Performance (write throughput, read latency)
- [x] Developer Experience
- [x] Maintainability
- [x] Ecosystem/Community Support
- [x] Bundle Size / Runtime Overhead
- [x] Cross-Platform Compatibility
- [x] Type Safety
- [ ] Cost (OSS)

---

## Options Considered

### Option 1: IndexedDB (via Dexie)

**Pros:**
- ✅ Built-in browser storage; no native deps
- ✅ Good for append + range queries with indexes
- ✅ Lowest install friction across OSes

**Cons:**
- ❌ Limited to frontend; no shared store with Rust without IPC
- ❌ Larger payload marshalling cost over IPC for exports

**Trade-offs:**
- ⚖️ Easiest MVP path, but harder to share history with Rust services.

### Option 2: SQLite (via Tauri plugin / SQL.js fallback)

**Pros:**
- ✅ Shared store between Rust and frontend
- ✅ Mature query capabilities; good for aggregation
- ✅ Straightforward export from backend

**Cons:**
- ❌ Native dependency (tauri-plugin-sql) per platform
- ❌ Slightly higher bundle size/complexity

**Trade-offs:**
- ⚖️ More power and parity across modules at cost of setup/packaging work.

---

## Decision

**Chosen Option:** Pending (leaning IndexedDB for MVP, SQLite for long-term parity)

**Rationale:**
- MVP velocity and zero native deps favor IndexedDB; aligns with low friction startup.
- Long-term export + cross-module aggregation likely benefits from SQLite; can phase-in once core flows stabilize.

**Key Factors:**
1. Install friction vs capability
2. Performance under 1s cadence
3. Cross-platform packaging effort

---

## Consequences

### Positive

- ✅ IndexedDB path keeps bundle lean and dev loop simple
- ✅ Leaves door open for SQLite migration if/when needed

### Negative

- ❌ Potential future migration work from IndexedDB → SQLite; mitigate by abstracting storage behind module APIs
- ❌ No Rust-side access in MVP; mitigate by keeping IPC payloads slim and compressing history if needed

### Risks

- ⚠️ Risk 1 - Mitigation strategy
- ⚠️ Risk 2 - Mitigation strategy

---

## Implementation Notes

How will this decision be implemented? Any specific steps or considerations?

- [ ] Step 1
- [ ] Step 2
- [ ] Step 3

---

## Alternatives Not Pursued

Briefly mention any other options that were considered but not detailed above, and why they were quickly dismissed.

---

## Follow-up Actions

- [ ] Action 1 - Owner, Deadline
- [ ] Action 2 - Owner, Deadline

---

## Links & References

- [Link to relevant discussion](https://...)
- [Related ADR](../adrs/ADR-YYYY-title.md)
- [External documentation](https://...)
- [Proof of concept](https://...)

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | YYYY-MM-DD | Initial decision | Author Name |
| 1.1 | YYYY-MM-DD | Updated after review | Author Name |

---

## Notes

Any additional context, future considerations, or TODOs.
