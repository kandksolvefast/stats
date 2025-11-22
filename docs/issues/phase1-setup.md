# Phase 1: Project Setup (Tauri + React + Tailwind)

**Target Date:** 2025-11-29
**Owner:** TBD

## Summary
Scaffold the new Tauri + React + TypeScript codebase with Tailwind tokens from `docs/design-system.md`, strict TypeScript, ESLint/Prettier, and baseline CI guardrails.

## References
- Architecture: docs/architecture.md
- Design tokens: docs/design-system.md
- Testing strategy: docs/testing.md
- Status: docs/status.md

## Checklist
- [ ] Initialize Tauri workspace structure under `stats-tauri/`
- [ ] Configure Vite + React + TS strict mode
- [ ] Add Tailwind with design tokens and plugins (forms, typography)
- [ ] Wire ESLint + Prettier (React, TS, Tailwind rules)
- [ ] Add npm scripts for dev/build/lint/check
- [ ] Add CI doc check workflow
- [ ] Update docs/status.md + docs/changelog.md when complete

## Acceptance Criteria
- `npm run check`, `npm run lint`, and `npm run build` succeed locally (after deps installed)
- Tailwind tokens match `docs/design-system.md`
- Repo skeleton lives in `stats-tauri/` without touching Swift sources
