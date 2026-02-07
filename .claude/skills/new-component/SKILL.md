---
name: new-component
description: Create a new STUIC Svelte 5 component with all required files
---

Create a new STUIC component named `$ARGUMENTS`.

## Before Starting

1. Read `AGENTS.md` - Contains ALL coding conventions for this project
2. Read `src/lib/components/Button/` as the canonical reference implementation

## Files to Create

Create these files at `src/lib/components/$ARGUMENTS/`:

### 1. `$ARGUMENTS.svelte`

Must include:

- `<script lang="ts" module>` block with exported Props interface
- Props extending appropriate HTML element attributes
- Universal props: `unstyled`, `class`, `el = $bindable()`
- Svelte 5 runes: `$props()`, `$derived()`, `$bindable()`
- `twMerge()` for class prop merging
- Data attributes for variants/states (not classes)

### 2. `index.ts`

```ts
export { default as $ARGUMENTS } from "./$ARGUMENTS.svelte";
export type { Props as $ARGUMENTSProps } from "./$ARGUMENTS.svelte";
```

### 3. `index.css` (if component needs theming)

Must follow CSS structure from AGENTS.md:

- `@theme inline` block with component tokens
- Tokens reference global tokens as fallbacks
- Pattern: `--stuic-{component}-{property}-{state}`
- NO `-dark` suffix (use `.dark {}` selector)

### 4. `README.md`

Include:

- Component description
- Props table with types/defaults/descriptions
- Usage examples
- CSS variables reference (if applicable)

## After Creation

1. Import CSS in component: `import './index.css';`
2. Add CSS import to `src/lib/index.css`
3. Add export to `src/lib/index.ts`
4. Run `npm run check` to verify no type errors
