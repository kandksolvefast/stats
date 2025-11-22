# ADR-0001: State Management Library Selection

**Status:** Accepted

**Date:** 2025-11-22

**Deciders:** Technical Lead, Frontend Team

**Tags:** frontend, architecture, state-management

---

## Context

The Stats application requires a state management solution to handle:
- Real-time system metrics data from Tauri backend
- User settings and preferences
- UI state (modals, popups, theme)
- Historical data buffers for charts
- Multiple independent module stores (CPU, RAM, Network, etc.)

### Problem Statement

Which state management library should we use for the React frontend to handle global state efficiently while maintaining developer experience and performance?

### Goals & Constraints

**Goals:**
- Minimal boilerplate and learning curve
- Excellent TypeScript support
- Good performance (no unnecessary re-renders)
- Small bundle size
- Support for computed values and subscriptions
- Easy to test and debug

**Constraints:**
- Must work with React 18
- Should not require complex setup
- Team prefers hooks-based API
- No external dependencies on backend (Redux Saga, etc.)

---

## Decision Drivers

- [x] **Developer Experience** - Ease of use, minimal boilerplate
- [x] **Performance** - Efficient updates, selective re-renders
- [x] **Bundle Size** - Keep frontend lean
- [x] **TypeScript Support** - First-class TS support
- [x] **Testing** - Easy to mock and test
- [ ] Ecosystem/Community Support
- [ ] Learning Curve
- [x] DevTools Support

---

## Options Considered

### Option 1: Redux Toolkit

**Description:**
Official recommended approach for Redux, with simplified APIs and built-in best practices.

**Pros:**
- ✅ Industry standard, massive ecosystem
- ✅ Excellent DevTools (time-travel debugging)
- ✅ Structured and predictable state updates
- ✅ Built-in middleware (thunks, sagas)
- ✅ Great documentation and community support

**Cons:**
- ❌ Significant boilerplate even with RTK
- ❌ Steep learning curve (actions, reducers, slices)
- ❌ Larger bundle size (~15KB gzipped with dependencies)
- ❌ Overkill for our use case (no complex async flows)
- ❌ More files and structure to maintain

**Trade-offs:**
- ⚖️ Powerful but heavyweight for our needs

---

### Option 2: Zustand

**Description:**
Lightweight state management library with a hooks-based API and minimal boilerplate.

**Pros:**
- ✅ Minimal boilerplate (single `create()` call per store)
- ✅ Excellent TypeScript support out of the box
- ✅ Tiny bundle size (~1KB gzipped)
- ✅ Hooks-based API familiar to React developers
- ✅ No providers needed (stores are modules)
- ✅ Easy to test (stores are just functions)
- ✅ Built-in DevTools support
- ✅ Supports computed values and subscriptions
- ✅ Can create multiple independent stores (perfect for modules)

**Cons:**
- ❌ Smaller ecosystem compared to Redux
- ❌ Less structure/opinionation (can lead to inconsistency)
- ❌ Fewer middleware options

**Trade-offs:**
- ⚖️ Flexibility requires discipline in team conventions

---

### Option 3: Jotai

**Description:**
Atom-based state management library, React Query-like approach for global state.

**Pros:**
- ✅ Very modern, atomic state approach
- ✅ Excellent TypeScript support
- ✅ Small bundle size (~2KB)
- ✅ Built-in async support
- ✅ DevTools available

**Cons:**
- ❌ Atom-based paradigm has learning curve
- ❌ Newer library, smaller community
- ❌ Might be over-engineered for simple stores
- ❌ Less familiar to team

**Trade-offs:**
- ⚖️ Powerful but requires paradigm shift

---

### Option 4: Context API + useReducer

**Description:**
Built-in React solution using Context and hooks.

**Pros:**
- ✅ No external dependency
- ✅ Team already familiar
- ✅ Zero bundle size overhead

**Cons:**
- ❌ Boilerplate for each context
- ❌ Provider hell with multiple contexts
- ❌ No DevTools support
- ❌ Re-render issues without careful optimization
- ❌ Harder to organize with many modules

**Trade-offs:**
- ⚖️ Simple but doesn't scale well

---

## Decision

**Chosen Option:** Option 2 - Zustand

**Rationale:**

Zustand is the best fit for Stats because:

1. **Minimal Boilerplate** - We can create a store per module (CPU, RAM, Network, etc.) with just a few lines of code, aligning with our modular architecture.

2. **Perfect for Our Use Case** - We need independent stores for each module, plus global app state. Zustand's module-based approach (no providers) is ideal.

3. **Performance** - Selective subscriptions mean components only re-render when their specific slice of state changes, critical for real-time monitoring.

4. **Bundle Size** - At ~1KB, it's negligible compared to the savings from not using Redux.

5. **Developer Experience** - Hooks-based API is intuitive, requires minimal learning, and integrates seamlessly with React 18.

6. **TypeScript** - First-class TS support with excellent type inference for stores.

**Key Factors:**
1. **Module Independence** - Each monitoring module (CPU, RAM, etc.) can have its own store without coupling
2. **Real-time Performance** - Efficient updates critical for 1-second intervals across 9 modules
3. **Developer Velocity** - Minimal boilerplate means faster iteration during Phase 1 MVP

---

## Consequences

### Positive

- ✅ **Fast Development** - Less code to write, faster feature delivery
- ✅ **Smaller Bundle** - ~14KB savings vs Redux Toolkit
- ✅ **Better Performance** - No unnecessary re-renders with proper selectors
- ✅ **Easy Testing** - Stores are plain functions, easy to mock
- ✅ **Module Isolation** - Each module's state is independent

### Negative

- ❌ **Less Structure** - Need to establish conventions for store organization (mitigated by templates)
- ❌ **Smaller Ecosystem** - Fewer third-party integrations (acceptable for our use case)

### Risks

- ⚠️ **Inconsistent Patterns** - Without discipline, stores could become inconsistent
  - **Mitigation:** Create store template, enforce via code review
- ⚠️ **Team Unfamiliarity** - Team may not know Zustand
  - **Mitigation:** Simple API, quick learning curve (~30 min), provide examples

---

## Implementation Notes

1. **Store Structure:**
```typescript
// Per-module store pattern
export const useCPUStore = create<CPUStore>((set, get) => ({
    data: null,
    history: [],
    isLoading: true,
    error: null,
    settings: defaultSettings,

    // Actions
    setData: (data) => set({ data, isLoading: false }),
    addToHistory: (value) => set((state) => ({
        history: [...state.history, value].slice(-300)
    })),
}));
```

2. **DevTools Integration:**
```typescript
import { devtools } from 'zustand/middleware';

export const useCPUStore = create<CPUStore>()(
    devtools(
        (set, get) => ({ /* ... */ }),
        { name: 'CPU Store' }
    )
);
```

3. **Persistence:**
```typescript
import { persist } from 'zustand/middleware';

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set) => ({ /* ... */ }),
        { name: 'app-settings' }
    )
);
```

---

## Follow-up Actions

- [x] Install Zustand (`npm install zustand`)
- [ ] Create store templates for modules - Tech Lead, Phase 1
- [ ] Document store patterns in [docs/architecture.md](../architecture.md) - Tech Lead, Phase 1
- [ ] Implement CPU store as reference - Developer, Phase 1
- [ ] Add Zustand DevTools to development setup - Developer, Phase 1

---

## Links & References

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Zustand vs Redux Comparison](https://blog.logrocket.com/zustand-vs-redux/)
- [React State Management in 2024](https://www.robinwieruch.de/react-state-usereducer-usestate-usecontext/)
- [Architecture Decision](../architecture.md#state-management-zustand)

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-11-22 | Initial decision | Technical Lead |

---

## Notes

If we encounter limitations with Zustand (unlikely based on requirements), we can reassess. The migration path to another library would be relatively straightforward due to the simple store API.
