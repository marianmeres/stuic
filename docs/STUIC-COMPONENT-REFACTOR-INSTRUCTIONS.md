# Component Theming Refactor Instructions

## Context

The STUIC library uses a new design token-based approach to theming. Before making any changes, you must understand the current theming system and reference implementations.

## Required Reading (in order)

1. `@docs/DESIGN-TOKENS-MANUAL.md` — Core theming philosophy and token structure
2. `@src/lib/components/ThemePreview/README.md` — Reference implementation example
3. `@src/lib/components/Button/README.md` — Reference implementation example
4. `@docs/tailwind-v4-css-variables.md` — Available Tailwind CSS variables

## Task

Refactor `<COMPONENT_NAME>` to align with the new design token philosophy.

**Before writing any code, analyze the component and prepare a refactor plan.**

---

## Refactor Requirements

### 1. Remove Hardcoded Colors
- Eliminate all direct/hardcoded color values from the component
- Replace with appropriate theme CSS variables only

### 2. CSS Variable Migration
- Move **customizable** styling properties to CSS variables where it makes sense
- **Do not** over-engineer — only extract what genuinely benefits from customization
- Direct Tailwind classes remain the **primary** styling method
- Only move to CSS vars what simplifies the component or adds meaningful flexibility

### 3. Simplification
- If migrating to CSS variables simplifies component internals, leverage that opportunity
- Reduce complexity where possible

### 4. Tailwind Override Support
- Ensure Tailwind utility classes can still override CSS variable defaults where appropriate

### 5. Color Intents
- Only implement color intents if they make semantic sense for this component
- If intents don't apply (e.g., layout-only components), skip them entirely

### 6. Token Naming & Values
When creating component-level customization tokens, reference Tailwind CSS variables directly:

**Examples:**
```css
:root {
  /* Font sizes */
  --stuic-xyz-font-size-sm: var(--text-sm);
  --stuic-xyz-font-size-base: var(--text-base);

  /* Border radius */
  --stuic-xyz-radius: var(--radius-md);

  /* Spacing (prefer calc with --spacing) */
  --stuic-xyz-padding-x: calc(var(--spacing) * 2);
  --stuic-xyz-padding-y: calc(var(--spacing) * 1);
  --stuic-xyz-gap: calc(var(--spacing) * 3);
}

@layer components {
  .xzy {
    /* ... */
  }
}
```

Refer to `@docs/tailwind-v4-css-variables.md` for the full list of available variables.

Actual CSS definition must be written inside the `@layer components { ... }` block

---

## Documentation Requirement

Ensure the component has an up-to-date `README.md` that documents:
- Available CSS custom properties
- Usage examples
- Any color intent support (if applicable)

---

## Breaking Changes Policy

- Backward compatibility is **not a hard blocker**
- However, **massive or disruptive changes must be discussed before implementation**
- Note any breaking changes in your plan

---

## Deliverables

1. **Analysis & Plan** (first step, before any code changes):
   - Current component state assessment
   - List of hardcoded colors to remove
   - Proposed CSS variables to introduce
   - Potential simplifications identified
   - Breaking changes (if any)
   - Questions or discussion points

2. **Implementation** (after plan approval):
   - Refactored component code
   - Updated/created `README.md` for the component








