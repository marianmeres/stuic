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
:root {
	/* Component-level customization tokens */
	--stuic-{component}-{property}: {default-value};
	--stuic-{component}-{property}-{state}: {value};
}

@layer components {
	.stuic-{component} {
		/* Base styles using CSS vars or internal vars */
		background: var(--_bg);
		color: var(--_text);
	}

	/* Intent/variant styles set internal vars */
	.stuic-{component}[data-intent="primary"] {
		--_color: var(--stuic-color-primary);
		--_fg: var(--stuic-color-primary-foreground);
	}

	/* Dark mode overrides */
	.dark .stuic-{component} { }
}
```

**Example (Button):**
```css
/* prettier-ignore */
:root {
	--stuic-button-radius: var(--radius-md);
	--stuic-button-ring-color: var(--stuic-color-ring);
	--stuic-button-padding-x-md: 1rem;
}

@layer components {
	.stuic-button {
		background: var(--_bg);
		color: var(--_text);
		border-color: var(--_border);
	}

	.stuic-button[data-intent="primary"] {
		--_color: var(--stuic-color-primary);
		--_fg: var(--stuic-color-primary-foreground);
	}

	.stuic-button[data-variant="solid"] {
		--_bg: var(--_color);
		--_text: var(--_fg);
	}
}
```

### 3. Global Design Tokens

Theme tokens are defined in `src/lib/themes/css/` (e.g., `stone.css`). The default theme is imported in `src/lib/index.css`.

**Intent Colors** (5 types, each with state variants):
- `--stuic-color-primary` - Primary actions
- `--stuic-color-accent` - Secondary emphasis
- `--stuic-color-destructive` - Dangerous actions
- `--stuic-color-warning` - Caution states
- `--stuic-color-success` - Positive states

Each intent has these variants:
- `-hover`, `-active` (background states)
- `-foreground`, `-foreground-hover`, `-foreground-active` (text on intent)

**Surface Colors for Intents:**
- `--stuic-color-surface-{intent}` - Soft/muted background tint
- `--stuic-color-surface-{intent}-foreground` - Text on surface
- `--stuic-color-surface-{intent}-border` - Border on surface

**Layout Colors:**
- `--stuic-color-background` - Page background (with `-foreground` variants)
- `--stuic-color-surface` - Base surface level
- `--stuic-color-surface-1` - Elevated surface (with `-hover`, `-active`, `-foreground` variants)
- `--stuic-color-muted` - Subdued elements (with state variants)

**Semantic Colors:**
- `--stuic-color-foreground` - Primary text
- `--stuic-color-border` - Default borders (with `-hover`, `-active`)
- `--stuic-color-input` - Input backgrounds (with state variants)
- `--stuic-color-ring` - Focus ring color

**Dark Mode:**
Dark mode is defined in `:root.dark {}` selector within theme files. DO NOT use `-dark` suffix on variable names.

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

- Use `:root {}` for component token definitions
- Use `@layer components {}` for component styles
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
2. **DO NOT** use `-dark` suffix for CSS variables (use `:root.dark {}` selector)
3. **DO NOT** put state before property in variable names
4. **DO NOT** use `--color-*` prefix for new variables (use `--stuic-color-*`)
5. **DO NOT** add `dark:` Tailwind prefixes when CSS variables handle dark mode
6. **DO NOT** create components without `unstyled` and `class` props
7. **DO NOT** use Svelte 4 syntax (`export let`, `$:`, etc.)

## Testing Changes

After making changes:
1. Run `npm run build` to check for build errors
2. Run `npm run dev` to test visually
3. Test both light and dark modes
4. Test that `--stuic-color-primary` changes cascade to affected components

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

- Main CSS entry: `src/lib/index.css`
- Theme files: `src/lib/themes/css/` (e.g., `stone.css`)
- Main exports: `src/lib/index.ts`
- Example component: `src/lib/components/Button/`
