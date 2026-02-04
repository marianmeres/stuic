# STUIC - Svelte Tailwind UI Components

See @AGENTS.md for complete coding conventions.

## Quick Commands

```bash
npm run dev          # Start dev server
npm run build        # Build library
npm run check        # Run svelte-check
npm run test         # Run Vitest tests
npm run lint         # Lint code
npm run format       # Format code
```

## Critical Rules (DO NOT)

1. Use abbreviated names in CSS vars (use `--stuic-list-item-button-bg`)
2. Use `-dark` suffix (use `.dark {}` selector instead)
3. Put state before property (`--stuic-button-hover-bg` is wrong)
4. Use Svelte 4 syntax (`export let`, `$:`) - use runes instead
5. Create components without `unstyled`, `class`, `el` props
6. Use `dark:` Tailwind prefix when CSS variables handle dark mode

## CSS Variable Patterns

**Theme tokens:** `--stuic-color-{semantic}`
- Intents: `primary`, `accent`, `destructive`, `warning`, `success`
- Each with: `-hover`, `-active`, `-foreground`, `-foreground-hover`, `-foreground-active`
- Layout: `background`, `surface`, `surface-1`, `muted`, `foreground`, `border`, `input`, `ring`

**Component tokens:** `--stuic-{component}-{property}-{state?}`
- Example: `--stuic-button-radius`, `--stuic-button-ring-color`

## Component Checklist

- [ ] Props interface extends HTML element attributes
- [ ] Universal props: `unstyled`, `class`, `el = $bindable()`
- [ ] Use `twMerge()` for class merging
- [ ] Data attributes for variants/states (not classes)
- [ ] `index.css` with `:root {}` and `@layer components {}`
- [ ] `index.ts` exports component and Props type
- [ ] `README.md` with props table and examples

## Svelte 5 Pattern

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  interface Props extends HTMLButtonAttributes {
    children?: Snippet;
    unstyled?: boolean;
    class?: string;
    el?: HTMLElement;
  }

  let {
    children,
    unstyled = false,
    class: classProp,
    el = $bindable(),
    ...rest
  }: Props = $props();
</script>
```

## Reference

- Main CSS entry: `src/lib/index.css`
- Theme files: `src/lib/themes/css/` (e.g., `stone.css`)
- Example component: `src/lib/components/Button/`
- Full conventions: `AGENTS.md`
