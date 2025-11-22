# ADR-0005: Localization Approach

**Status:** Proposed

**Date:** 2025-11-23

**Deciders:** Core maintainers

**Tags:** i18n, frontend, UX

---

## Context

What is the issue that we're seeing that is motivating this decision or change? Describe the forces at play, including technological, political, social, and project-related. Keep it factual and avoid solution-oriented language.

### Problem Statement

Select localization framework and workflow to support 30+ languages across frontend (React) and backend-originated messages/notifications.

### Goals & Constraints

**Goals:**
- Easy string management and extraction
- Supports pluralization and ICU-style formatting
- Works in Tauri/React with minimal overhead
- Allows community contributions

**Constraints:**
- Avoid heavy runtime deps
- Keep string files diffable and reviewable

---

## Decision Drivers

- [x] Developer Experience
- [x] Maintainability
- [x] Community contributions
- [x] Bundle size/runtime overhead
- [x] Type safety
- [ ] Cost (OSS)

---

## Options Considered

### Option 1: i18next + react-i18next

**Pros:**
- ✅ Mature ecosystem, good community support
- ✅ ICU formatting via plugins; works in Tauri
- ✅ Lazy-loaded namespaces for modules

**Cons:**
- ❌ Slight runtime overhead vs compile-time extraction
- ❌ JSON resource files can get large without discipline

**Trade-offs:**
- ⚖️ Fast to adopt; relies on runtime lookups.

### Option 2: FormatJS (react-intl)

**Pros:**
- ✅ Strong ICU/messageformat support
- ✅ Extraction tooling

**Cons:**
- ❌ Heavier bundle/runtime
- ❌ Tighter coupling to component tree

**Trade-offs:**
- ⚖️ Great for ICU-heavy apps; more weight than needed for Stats.

### Option 3: LinguiJS

**Pros:**
- ✅ Compile-time catalogs, smaller runtime
- ✅ TypeScript-friendly

**Cons:**
- ❌ Smaller ecosystem than i18next
- ❌ Requires build-time integration

**Trade-offs:**
- ⚖️ Lean runtime; adds build steps and slightly steeper onboarding.

---

## Decision

**Chosen Option:** Pending (leaning i18next for speed; revisit after MVP)

**Rationale:**
- Fast adoption, familiar API, and modular namespaces align with module-first architecture.
- Keeps runtime small enough while giving ICU support via plugins.

**Key Factors:**
1. Onboarding speed
2. Bundle/runtime size
3. Community + tooling

---

## Consequences

### Positive

- ✅ Clear path to ship translations early
- ✅ Works with module-local namespaces

### Negative

- ❌ Runtime-based lookups; mitigate with static typing wrappers
- ❌ Catalog sprawl risk; mitigate with linting/extraction scripts and reviewers

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
