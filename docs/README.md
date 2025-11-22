# Stats Documentation

Welcome to the Stats project documentation. This folder contains all planning, architecture, and development documentation for the Tauri + React migration.

---

## 📚 Documentation Index

### Core Documents

#### [Vision & Scope](./vision.md) 🎯
**Read First** - High-level goals, scope, success criteria, and assumptions.
- What we're building and why
- What's in scope vs. out of scope
- Success criteria and performance budgets
- Frozen assumptions

#### [Architecture](./architecture.md) 🏗️
**System Design** - Technical architecture, data flow, and technology stack.
- System architecture diagrams
- Backend (Rust/Tauri) structure
- Frontend (React/TS) structure
- Data contracts and APIs
- Platform considerations

#### [Design System](./design-system.md) 🎨
**UI/UX Spec** - Design tokens, components, and visual language.
- Color palette (dark/light themes)
- Typography scale
- Component primitives (Button, Card, Input, etc.)
- Widget components (Charts, Gauges, etc.)
- Spacing, shadows, animations
- Tailwind configuration reference

#### [Testing Strategy](./testing.md) 🧪
**Quality Assurance** - Test types, coverage targets, and performance budgets.
- Unit tests (Rust + TypeScript)
- Component tests
- Integration tests (Tauri commands)
- E2E tests (Playwright)
- Performance benchmarks
- CI/CD setup

---

### Module Documentation

#### [Module Template](./modules/_template.md) 📋
Template for documenting new modules (CPU, RAM, Network, etc.)

#### [CPU Module](./modules/cpu.md) 🖥️
**Reference Implementation** - Complete specification for CPU monitoring module.
- Backend reader implementation
- Tauri commands and events
- Frontend components (Widget, Popup, Settings)
- Data contracts
- Testing checklist

**Additional Modules:** (To be added as implemented)
- RAM Module
- Network Module
- Disk Module
- GPU Module
- Battery Module
- Sensors Module
- Bluetooth Module
- Clock Module

---

### Architecture Decision Records (ADRs)

#### [ADR Template](./adrs/ADR-0000-template.md) 📝
Template for documenting technical decisions.

#### [ADR-0001: State Management](./adrs/ADR-0001-state-management.md)
Decision to use Zustand for state management.

#### [ADR-0002: Chart Library](./adrs/ADR-0002-chart-library.md)
Decision to use Recharts for data visualization.

**Future ADRs:**
- ADR-0003: Historical data storage (IndexedDB vs SQLite)
- ADR-0004: System tray implementation
- ADR-0005: Localization approach
- (Add as decisions are made)

---

### Project Tracking

#### [Changelog](./changelog.md) 📅
Running log of shipped features, bug fixes, and decisions.
- User-facing changes
- Release notes
- Breaking changes
- Quick decision log

#### [Status](./status.md) 📊
**Weekly Updates** - Current progress, blockers, and metrics.
- Phase progress
- This week's work
- Metrics (code coverage, performance)
- Risks and mitigations
- Upcoming milestones

---

## 🗺️ Documentation Flow

### For New Contributors

1. **Start Here:** [Vision](./vision.md) - Understand what we're building
2. **Architecture:** [Architecture](./architecture.md) - Learn the system design
3. **Design:** [Design System](./design-system.md) - Understand UI patterns
4. **Module Docs:** [CPU Module](./modules/cpu.md) - See example implementation
5. **Testing:** [Testing](./testing.md) - Understand quality standards

### For Implementing a Feature

1. **Check Vision** - Is this in scope?
2. **Review Architecture** - How does this fit?
3. **Check Module Docs** - Similar implementations?
4. **Write Tests** - Follow testing strategy
5. **Update Docs** - Update relevant docs and changelog

### For Making Technical Decisions

1. **Use ADR Template** - [ADR-0000-template.md](./adrs/ADR-0000-template.md)
2. **Document Options** - List alternatives considered
3. **Explain Decision** - Rationale and trade-offs
4. **Get Review** - Team approval before merging
5. **Link in Architecture** - Cross-reference in main docs

### Weekly Workflow

**Friday (End of Week):**
1. Update [Status](./status.md) - This week's progress
2. Update [Changelog](./changelog.md) - Shipped changes
3. Review upcoming week goals
4. Document blockers/risks

---

## 📂 Folder Structure

```
docs/
├── README.md                    # This file (documentation index)
├── vision.md                    # Project goals and scope
├── architecture.md              # System design
├── design-system.md             # UI/UX specification
├── testing.md                   # Test strategy
├── changelog.md                 # Release notes and decisions
├── status.md                    # Weekly progress tracking
│
├── modules/                     # Module-specific documentation
│   ├── _template.md             # Template for new modules
│   ├── cpu.md                   # CPU module spec
│   ├── ram.md                   # (To be created)
│   ├── network.md               # (To be created)
│   └── ...
│
└── adrs/                        # Architecture Decision Records
    ├── ADR-0000-template.md     # ADR template
    ├── ADR-0001-state-management.md
    ├── ADR-0002-chart-library.md
    └── ...
```

---

## ✅ Documentation Standards

### When to Update Docs

**Always update when:**
- Adding new features
- Making architectural changes
- Making technical decisions
- Changing APIs or data contracts
- Discovering important implementation details
- Completing a phase or milestone

**Consider updating when:**
- Fixing significant bugs
- Refactoring code structure
- Learning something non-obvious
- Discovering edge cases

### How to Keep Docs Current

1. **Update as You Code** - Don't defer documentation
2. **Link PRs to Docs** - Reference doc updates in PR template
3. **Review in PRs** - Docs are part of code review
4. **Weekly Maintenance** - Update status.md every Friday
5. **Version Documents** - Maintain revision history table

### Writing Style

- **Be Concise** - Respect reader's time
- **Be Specific** - Concrete examples over abstractions
- **Be Visual** - Diagrams, tables, code samples
- **Be Current** - Update stale info or mark deprecated
- **Be Searchable** - Use clear headings and keywords

---

## 🔗 External Links

### Technology Documentation
- [Tauri Documentation](https://tauri.app/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)
- [Recharts](https://recharts.org/)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)
- [Rust Book](https://doc.rust-lang.org/book/)

### Original Project
- [Stats (Swift)](https://github.com/exelban/stats) - Original macOS app

---

## 🤝 Contributing to Documentation

### Adding New Documents

1. Follow existing naming conventions
2. Use markdown formatting
3. Include revision history table
4. Update this README index
5. Cross-link related documents

### Updating Existing Documents

1. Maintain revision history
2. Update "Last Updated" date
3. Increment version if major change
4. Note what changed in revision history
5. Update changelog.md if user-facing

### Creating ADRs

1. Copy [ADR-0000-template.md](./adrs/ADR-0000-template.md)
2. Number sequentially (ADR-0003, ADR-0004, etc.)
3. Fill out all sections
4. Get team review
5. Link from architecture.md

### Documenting Modules

1. Copy [_template.md](./modules/_template.md)
2. Name file: `{module-name}.md` (lowercase)
3. Fill out all sections (backend, frontend, testing)
4. Include code examples
5. Link from README

---

## 📋 Quick Reference

### Key Files by Role

**Product/PM:**
- [Vision](./vision.md) - Scope and goals
- [Status](./status.md) - Current progress
- [Changelog](./changelog.md) - What shipped

**Developer:**
- [Architecture](./architecture.md) - System design
- [Module Docs](./modules/) - Implementation guides
- [Testing](./testing.md) - Quality standards
- [ADRs](./adrs/) - Technical decisions

**Designer:**
- [Design System](./design-system.md) - UI spec
- [Vision](./vision.md) - UX goals

**QA:**
- [Testing](./testing.md) - Test strategy
- [Module Docs](./modules/) - Feature specs
- [Status](./status.md) - What to test

---

## 🆘 Need Help?

- **Can't find something?** Use GitHub search or Cmd+F in docs
- **Documentation unclear?** Open an issue with the "documentation" label
- **Have a suggestion?** PR welcome! Follow contributing guidelines
- **Need architecture guidance?** Check ADRs or ask in team chat

---

## 📜 License

This documentation is part of the Stats project and follows the same license as the codebase.

---

**Last Updated:** 2025-11-22
**Maintained By:** Project Team
**Questions?** Open an issue or discussion on GitHub
