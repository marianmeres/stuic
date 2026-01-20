# AGENTS.md - AI Coding Agent Guidelines for STUIC

This document provides strict requirements and conventions for AI coding agents working on the STUIC codebase.

## Project Overview

STUIC (Svelte Tailwind UI Components) is a Svelte 5 component library built with Tailwind CSS v4. It uses a centralized design token system with CSS custom properties.

## Technology Stack

- **Framework**: Svelte 5 with runes (`$state`, `$derived`, `$bindable`, `$props`)
- **Styling**: Tailwind CSS v4 with `@theme inline` directive
- **Build**: Vite, SvelteKit (library mode)
- **Package Manager**: npm/pnpm

## STRICT REQUIREMENTS

### 1. CSS Variable Naming Convention

**ALL CSS variables MUST follow this pattern:**

```
--stuic-{component}-{element?}-{property}-{state?}
```

**Rules:**
- Use `--stuic-` prefix for all custom properties
- Use **full component names** (no abbreviations)
  - Correct: `--stuic-list-item-button-bg`
  - Wrong: `--stuic-lib-bg`
- Put **state at the end**
  - Correct: `--stuic-button-bg-hover`
  - Wrong: `--stuic-button-hover-bg`
- **No `-dark` suffix** - dark mode is defined in `.dark {}` selector
  - Correct: Define in `.dark { --stuic-button-bg: ...; }`
  - Wrong: `--stuic-button-bg-dark`
- Standard properties: `bg`, `text`, `border`, `ring`, `shadow`, `accent`, `radius`
- Standard states: `hover`, `active`, `focus`, `disabled`, `error`

### 2. Component CSS Structure

Every component with customizable styling MUST have an `index.css` file with this structure:

```css
/* prettier-ignore */
@theme inline {
	/* Component tokens - reference global tokens as fallbacks */
	--stuic-{component}-{property}: var(--stuic-{component}-{property}, var(--stuic-{global-token}));

	/* Tailwind utility aliases (for backwards compatibility) */
	--color-{legacy-name}: var(--stuic-{component}-{property});
	--color-{legacy-name}-dark: var(--stuic-{component}-{property});
}
```

**Example (Button):**
```css
/* prettier-ignore */
@theme inline {
	--stuic-button-bg: var(--stuic-button-bg, var(--stuic-surface-interactive));
	--stuic-button-text: var(--stuic-button-text, var(--stuic-text));
	--stuic-button-border: var(--stuic-button-border, var(--stuic-border-strong));

	/* Tailwind utility aliases */
	--color-button-bg: var(--stuic-button-bg);
	--color-button-bg-dark: var(--stuic-button-bg);
}
```

### 3. Global Design Tokens

Global tokens are defined in `src/lib/theme.css`. Components MUST reference these as fallback defaults:

**Accent Colors:**
- `--stuic-accent` - Primary accent color
- `--stuic-accent-hover`, `--stuic-accent-active`
- `--stuic-accent-destructive`, `--stuic-accent-destructive-hover`

**Surface Colors:**
- `--stuic-surface` - Base background
- `--stuic-surface-elevated` - Cards, modals
- `--stuic-surface-sunken` - Input backgrounds
- `--stuic-surface-overlay` - Tooltips, backdrops
- `--stuic-surface-interactive` - Buttons, list items
- `--stuic-surface-interactive-hover`, `--stuic-surface-interactive-active`

**Text Colors:**
- `--stuic-text` - Primary text
- `--stuic-text-muted` - Secondary text
- `--stuic-text-inverse` - On dark backgrounds
- `--stuic-text-on-accent` - On accent backgrounds
- `--stuic-text-destructive` - Error text

**Border Colors:**
- `--stuic-border` - Default border
- `--stuic-border-strong` - Emphasized
- `--stuic-border-subtle` - Light
- `--stuic-border-focus` - Focus state
- `--stuic-border-error` - Error state

**Other:**
- `--stuic-ring` - Focus ring color
- `--stuic-radius`, `--stuic-radius-sm`, `--stuic-radius-lg`
- `--stuic-transition-fast`, `--stuic-transition-normal`, `--stuic-transition-slow`

### 4. Svelte 5 Patterns

**Props declaration:**
```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		children?: Snippet;
		variant?: 'primary' | 'secondary';
		unstyled?: boolean;
		class?: string;
		el?: HTMLButtonElement;
	}

	let {
		children,
		variant,
		unstyled = false,
		class: className = '',
		el = $bindable(),
		...rest
	}: Props = $props();
</script>
```

**State management:**
```svelte
<script lang="ts">
	let count = $state(0);
	let doubled = $derived(count * 2);
</script>
```

### 5. Component Features

Every visual component SHOULD support:
- `unstyled` prop - Removes all default styling
- `class` prop - Additional CSS classes (merged with `twMerge`)
- `el` prop - Bindable element reference

### 6. File Structure

```
src/lib/components/{ComponentName}/
├── {ComponentName}.svelte    # Main component
├── index.ts                  # Exports
├── index.css                 # Component tokens (if customizable)
└── README.md                 # Documentation
```

### 7. Import Patterns

```ts
// index.ts
export { default as ComponentName } from './ComponentName.svelte';
export type { Props as ComponentNameProps } from './ComponentName.svelte';
```

### 8. Tailwind CSS v4 Specifics

- Use `@theme inline` for CSS variable definitions
- No `dark:` prefix in Tailwind classes when CSS variables handle dark mode
- Use `twMerge()` for class prop merging
- Prefer `bg-linear-to-r` over `bg-gradient-to-r` (v4 canonical)

### 9. Documentation Requirements

Every component README MUST include:
- Description
- Props table with types, defaults, descriptions
- Usage examples
- CSS variables reference (if applicable)

## DO NOT

1. **DO NOT** use abbreviated component names in CSS variables
2. **DO NOT** use `-dark` suffix for CSS variables
3. **DO NOT** put state before property in variable names
4. **DO NOT** use `--color-*` prefix for new variables (legacy only)
5. **DO NOT** add `dark:` Tailwind prefixes when CSS variables handle dark mode
6. **DO NOT** forget to add Tailwind utility aliases for backwards compatibility
7. **DO NOT** create components without `unstyled` and `class` props
8. **DO NOT** use Svelte 4 syntax (`export let`, `$:`, etc.)

## Testing Changes

After making changes:
1. Run `npm run build` to check for build errors
2. Run `npm run dev` to test visually
3. Test both light and dark modes
4. Test that `--stuic-accent` changes cascade to affected components

## Common Tasks

### Adding a New Component with Theming

1. Create component folder structure
2. Create `index.css` with tokens referencing global tokens
3. Import CSS in component with `import './index.css';`
4. Add to `src/lib/index.css` imports
5. Export from `src/lib/index.ts`
6. Create README.md documentation

### Updating CSS Variable Names

1. Update `index.css` with new `--stuic-*` names
2. Keep old names as Tailwind utility aliases
3. Update README.md CSS variables section
4. Update any Svelte component references

## Reference Files

- Global tokens: `src/lib/theme.css`
- Main CSS imports: `src/lib/index.css`
- Main exports: `src/lib/index.ts`
- Example component: `src/lib/components/Button/`
