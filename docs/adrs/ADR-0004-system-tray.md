# ADR-0004: System Tray Approach

**Status:** Proposed

**Date:** 2025-11-23

**Deciders:** Core maintainers

**Tags:** platform, UX, tauri

---

## Context

What is the issue that we're seeing that is motivating this decision or change? Describe the forces at play, including technological, political, social, and project-related. Keep it factual and avoid solution-oriented language.

### Problem Statement

Pick the tray strategy: pure Tauri system-tray menu vs lightweight always-on window with tray shortcut, balancing responsiveness, accessibility, and OS parity.

### Goals & Constraints

**Goals:**
- Show module widgets in tray with quick access
- Keep idle CPU low (<5%) and memory low (<100MB target)
- Respect platform tray behaviors (macOS menu bar, Windows tray, Linux variants)

**Constraints:**
- Avoid heavy window churn; minimize window creation latency
- Support right-click menu (dashboard, settings, quit)

---

## Decision Drivers

- [x] Performance (startup, idle CPU/mem)
- [x] Cross-Platform Compatibility
- [x] UX parity with original app
- [x] Complexity/maintainability
- [ ] Bundle size (minor)

---

## Options Considered

### Option 1: Native Tauri System Tray Menu

**Pros:**
- ✅ Uses built-in API; minimal surface area
- ✅ Lowest idle footprint
- ✅ Good parity with macOS menu bar style

**Cons:**
- ❌ Less flexible visuals compared to custom window
- ❌ Charts/advanced UI limited to popup windows

**Trade-offs:**
- ⚖️ Simplicity over visual fidelity; works for MVP.

### Option 2: Always-On Mini Window + Tray Shortcut

**Pros:**
- ✅ Full React UI for tray content (charts, controls)
- ✅ Consistent visuals with main app

**Cons:**
- ❌ Slightly higher idle memory for hidden window
- ❌ More window management code, per-OS quirks

**Trade-offs:**
- ⚖️ Better UI, but more complexity and resources.

---

## Decision

**Chosen Option:** Pending (default to native tray for MVP, evaluate mini-window in Phase 3)

**Rationale:**
- Get feature parity quickly with native tray API; defer mini-window until performance is measured.
- Minimizes idle cost while backends/readers are being tuned.

**Key Factors:**
1. Idle resource budget
2. Implementation time for MVP
3. Cross-platform behavior

---

## Consequences

### Positive

- ✅ MVP tray ready with low complexity
- ✅ Leaves room for enhanced UI later without blocking

### Negative

- ❌ Tray visuals limited initially; mitigate with careful menu structure
- ❌ Possible migration work if switching to mini-window; mitigate by isolating tray code paths

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
