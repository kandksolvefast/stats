## Summary

<!-- Briefly describe what this PR does (1-2 sentences) -->

Closes #<!-- issue number -->

---

## Type of Change

<!-- Check all that apply -->

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update
- [ ] 🎨 UI/UX improvement
- [ ] ⚡️ Performance improvement
- [ ] ♻️ Refactoring (no functional changes)
- [ ] 🧪 Test coverage improvement
- [ ] 🔧 Build/tooling change

---

## Changes Made

<!-- Describe the changes in detail. Use bullet points for clarity. -->

### Backend (Rust)
-
-

### Frontend (React/TypeScript)
-
-

### Documentation
-
-

---

## Linked Issue

<!-- Link to the issue this PR addresses -->

**Issue:** #<!-- issue number -->

**Related Issues:** #<!-- if applicable -->

---

## Documentation Updated?

<!-- Check all that apply -->

- [ ] Updated [docs/architecture.md](../../docs/architecture.md)
- [ ] Updated [docs/modules/[module].md](../../docs/modules/)
- [ ] Updated [docs/design-system.md](../../docs/design-system.md)
- [ ] Updated [docs/testing.md](../../docs/testing.md)
- [ ] Created/updated ADR in [docs/adrs/](../../docs/adrs/)
- [ ] Updated [docs/changelog.md](../../docs/changelog.md)
- [ ] Updated code comments/JSDoc
- [ ] No documentation changes needed

---

## Tests

<!-- Describe the tests you added or updated -->

### Unit Tests
- [ ] Added/updated Rust tests: `src-tauri/src/...`
- [ ] Added/updated React tests: `src/.../__tests__/...`
- [ ] All existing tests pass

### Integration Tests
- [ ] Added/updated integration tests: `tests/integration/...`
- [ ] Tested Tauri command invocation
- [ ] Tested event streaming

### E2E Tests
- [ ] Added/updated E2E tests: `tests/e2e/...`
- [ ] Tested user workflow end-to-end

### Manual Testing
<!-- Describe manual testing performed -->
- [ ] Tested on macOS
- [ ] Tested on Windows
- [ ] Tested on Linux
- [ ] Verified dark/light theme
- [ ] Verified responsive behavior
- [ ] Tested with screen reader (accessibility)

**Test Evidence:**
<!-- Add links to test runs, screenshots, or videos -->
- Test results:
- Screenshots:

---

## Performance Notes

<!-- Describe any performance implications of this change -->

### Benchmarks
- [ ] Ran Rust benchmarks: `cargo bench`
- [ ] Measured component render time
- [ ] Checked memory usage
- [ ] Verified no performance regression

**Performance Impact:**
<!-- Describe measured impact, if any -->
- CPU usage:
- Memory usage:
- Render time:
- Bundle size change:

**Before/After:**
<!-- If applicable, show metrics before and after -->
```
Before: X ms / Y MB
After:  X ms / Y MB
```

---

## Screenshots

<!-- Add screenshots for UI changes -->

### Before
<!-- Screenshot or description of current behavior -->

### After
<!-- Screenshot showing new behavior -->

### Dark Mode
<!-- If UI change, show dark mode screenshot -->

### Responsive
<!-- If layout change, show mobile/small window -->

---

## Code Quality

<!-- Self-review checklist -->

- [ ] Code follows project style guidelines
- [ ] Self-reviewed code for obvious issues
- [ ] Added comments for complex logic
- [ ] Updated TypeScript types where needed
- [ ] No compiler warnings
- [ ] No linter errors
- [ ] Formatted with Prettier (frontend) / rustfmt (backend)
- [ ] Removed console.logs / debug prints
- [ ] No hardcoded values (use constants/config)

---

## Breaking Changes

<!-- If this is a breaking change, describe migration path -->

**Breaking Changes:**
-

**Migration Guide:**
<!-- How should users/developers adapt to this change? -->
1.
2.

---

## Deployment Notes

<!-- Any special deployment considerations? -->

- [ ] Requires database migration
- [ ] Requires new environment variables
- [ ] Requires dependency update: `npm install` / `cargo update`
- [ ] Requires rebuild: `npm run tauri build`
- [ ] No special deployment steps needed

**Post-Deploy Verification:**
<!-- How to verify this works in production? -->
1.
2.

---

## Accessibility

<!-- Accessibility considerations -->

- [ ] Keyboard navigation tested
- [ ] Screen reader compatible (ARIA labels)
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA
- [ ] Works with reduced motion
- [ ] N/A - No UI changes

---

## Checklist

<!-- Final checklist before requesting review -->

- [ ] PR title follows convention: `type(scope): description` (e.g., `feat(cpu): add temperature monitoring`)
- [ ] Linked to issue (closes #XXX)
- [ ] All sections of this template filled out
- [ ] Documentation updated
- [ ] Tests added/updated and passing
- [ ] Code reviewed by self
- [ ] No merge conflicts
- [ ] Ready for review

---

## Reviewer Notes

<!-- Any specific areas you'd like reviewers to focus on? -->

**Focus Areas:**
-
-

**Questions for Reviewers:**
-
-

---

## Additional Context

<!-- Any other context, links, or information -->

**Related PRs:**
- #

**References:**
-
-

**Notes:**
-
