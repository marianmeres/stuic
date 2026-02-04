# Tasks

Common procedures for working with STUIC.

---

## Add New Component

### Steps

1. Create folder: `src/lib/components/{Name}/`
2. Create `{Name}.svelte` with Props interface
3. Create `index.ts` with exports
4. Create `index.css` if component needs custom tokens
5. Add CSS import to `src/lib/index.css`
6. Add JS export to `src/lib/index.ts`
7. Create `README.md` with props table and examples

### Template: {Name}.svelte

```svelte
<script lang="ts" module>
  import type { HTMLDivAttributes } from "svelte/elements";
  import type { Snippet } from "svelte";

  export interface Props extends Omit<HTMLDivAttributes, "children"> {
    children?: Snippet;
    unstyled?: boolean;
    class?: string;
    el?: HTMLDivElement;
  }
</script>

<script lang="ts">
  import { twMerge } from "../../utils/tw-merge.js";

  let {
    children,
    unstyled = false,
    class: classProp,
    el = $bindable(),
    ...rest
  }: Props = $props();
</script>

<div
  bind:this={el}
  class={unstyled ? classProp : twMerge("stuic-{name}", classProp)}
  {...rest}
>
  {@render children?.()}
</div>
```

### Template: index.ts

```ts
export {
  default as {Name},
  type Props as {Name}Props,
} from "./{Name}.svelte";
```

### Checklist

- [ ] Props interface extends HTML element attributes
- [ ] Has `unstyled`, `class`, `el` props
- [ ] Uses `twMerge()` for class merging
- [ ] Data attributes for variants (not CSS classes)
- [ ] CSS added to `src/lib/index.css` (if applicable)
- [ ] Exported from `src/lib/index.ts`
- [ ] README.md with props table

---

## Add CSS Tokens to Component

### Steps

1. Create/edit `{Component}/index.css`
2. Add `:root {}` block with component tokens
3. Add `@layer components {}` with styles
4. Add import to `src/lib/index.css`

### Template: index.css

```css
/* prettier-ignore */
:root {
  --stuic-{component}-radius: var(--radius-md);
  --stuic-{component}-padding: 1rem;
}

@layer components {
  .stuic-{component} {
    background: var(--_bg);
    color: var(--_text);
    border-radius: var(--stuic-{component}-radius);
    padding: var(--stuic-{component}-padding);
  }

  /* Intent sets color palette */
  .stuic-{component}[data-intent="primary"] {
    --_color: var(--stuic-color-primary);
    --_fg: var(--stuic-color-primary-foreground);
  }

  /* Variant determines color application */
  .stuic-{component}[data-variant="solid"] {
    --_bg: var(--_color);
    --_text: var(--_fg);
  }

  /* Dark mode overrides (if needed) */
  .dark .stuic-{component} {
    /* Override internal vars */
  }
}
```

### Checklist

- [ ] Token names follow `--stuic-{component}-{property}-{state?}` pattern
- [ ] No abbreviated names
- [ ] State at end (not `--stuic-button-hover-bg`)
- [ ] No `-dark` suffix (use `.dark {}` selector)
- [ ] Added import to `src/lib/index.css`

---

## Create New Theme

### Steps

1. Copy `src/lib/themes/css/stone.css` as template
2. Rename to `{name}.css`
3. Update color values in `:root {}` section
4. Update color values in `:root.dark {}` section
5. Use Tailwind color variables: `var(--color-{palette}-{shade})`

### Usage

```css
/* Replace default theme in your app */
@import "@marianmeres/stuic/dist/themes/css/{name}.css";
```

### Checklist

- [ ] All intent colors defined (primary, accent, destructive, warning, success)
- [ ] All role colors defined (background, surface, foreground, border, input, ring, muted)
- [ ] Dark mode section complete
- [ ] Test light and dark modes visually

---

## Test Changes

### Steps

1. Run `npm run build` - Check for errors
2. Run `npm run check` - TypeScript validation
3. Run `npm run dev` - Start dev server
4. Test in browser (http://localhost:8886)
5. Test light mode
6. Test dark mode (add `class="dark"` to `<html>`)
7. Test that `--stuic-color-primary` changes cascade

### Checklist

- [ ] No build errors
- [ ] No TypeScript errors
- [ ] Component renders correctly
- [ ] Light mode works
- [ ] Dark mode works
- [ ] CSS vars cascade properly
- [ ] `unstyled` prop disables styling
- [ ] `class` prop merges correctly

---

## Update CSS Variable Names

### Steps

1. Update `index.css` with new `--stuic-*` names
2. Keep old names temporarily as aliases (if public API)
3. Update component `.svelte` file references
4. Update README.md CSS variables section
5. Remove old aliases after deprecation period

### Naming Rules

| Correct | Wrong |
|---------|-------|
| `--stuic-button-bg-hover` | `--stuic-button-hover-bg` |
| `--stuic-list-item-button-radius` | `--stuic-lib-radius` |
| `:root.dark { --stuic-button-bg: ...; }` | `--stuic-button-bg-dark` |
