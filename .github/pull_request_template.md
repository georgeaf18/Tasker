## Description

<!-- What does this PR do? Link to Linear task: https://linear.app/tasker/issue/TASK-XXX -->

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Performance improvement
- [ ] Code quality improvement

## Checklist

### Code Quality

- [ ] My code follows the project's style guidelines (ESLint passes with no warnings)
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] No console.log statements left in the code (use console.warn/error for production logging)
- [ ] No TODO/FIXME comments (create Linear tasks instead)
- [ ] TypeScript strict mode compliance (no 'any' types without justification)
- [ ] Functions are under 50 lines and have cyclomatic complexity < 10
- [ ] Maximum nesting depth of 3 levels maintained

### Documentation

- [ ] I have updated the documentation (if applicable)
- [ ] I have added JSDoc comments for exported functions/classes
- [ ] I have added an ADR if this introduces new architectural patterns
- [ ] CHANGELOG.md has been updated (for features/fixes)

### Testing

- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Test coverage meets or exceeds the project threshold (75% global, 85% backend business logic)
- [ ] I have added snapshot tests for UI components (if applicable)

### Testing Details

<!-- How has this been tested? -->

- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Manual testing

**Test commands run:**

```bash
# List the commands you used to test
npm run test
npm run e2e:critical
```

### Accessibility (for UI changes)

- [ ] Keyboard navigation works correctly
- [ ] Screen reader support verified
- [ ] Color contrast meets WCAG 2.1 Level AA
- [ ] Focus indicators are visible and clear
- [ ] ARIA labels added where necessary

### ADHD/Dyslexia Design Principles (for UI changes)

- [ ] Visual hierarchy is clear and uncluttered
- [ ] Maximum 3 levels of nested information
- [ ] Important actions are visually prominent
- [ ] Clear, descriptive labels (not abbreviated)
- [ ] Appropriate use of whitespace

## Screenshots (if applicable)

<!-- Add screenshots for UI changes -->
<!-- Consider before/after screenshots for bug fixes -->

## AI-Assisted Development Notes

<!-- If AI helped generate this code, note any specific validations you performed -->

- [ ] I have reviewed all AI-generated code line-by-line
- [ ] I have verified the code matches the requirements exactly
- [ ] I have tested edge cases beyond what the AI suggested
- [ ] I have confirmed no security vulnerabilities were introduced
- [ ] I have verified no performance regressions

**AI tools used:**

<!-- e.g., Claude Code, GitHub Copilot, etc. -->

**Specific validations performed:**

<!-- Describe what you specifically checked beyond the AI's output -->

## Dependencies

- [ ] No circular dependencies introduced (verified with `npm run deps:check`)
- [ ] No new dependencies added OR new dependencies justified below
- [ ] No security vulnerabilities in dependencies (`npm audit` passes)

**New dependencies (if any):**

<!-- List and justify any new dependencies -->

## Performance Considerations

- [ ] No unnecessary re-renders or re-computations
- [ ] Appropriate use of memoization/caching
- [ ] No memory leaks introduced
- [ ] Bundle size impact considered (for frontend changes)

## Additional Context

<!-- Any additional context, considerations, or trade-offs -->
<!-- Link to related PRs, issues, or discussions -->

## Reviewer Notes

<!-- Specific areas where you want reviewer focus -->
<!-- Known limitations or future improvements -->
