# Conventions

Code standards and patterns for STUIC development.

---

## CSS Variable Naming

**Pattern:** `--stuic-{component}-{element?}-{property}-{state?}`

| Segment   | Values                                                        |
| --------- | ------------------------------------------------------------- |
| component | Full name: `button`, `list-item-button`, `modal`              |
| element   | Optional: `track`, `thumb`, `icon`                            |
| property  | `bg`, `text`, `border`, `ring`, `shadow`, `radius`, `padding` |
| state     | `hover`, `active`, `focus`, `disabled`, `error`               |

### Do

```css
--stuic-button-bg-hover: ...;
--stuic-button-ring-color: ...;
--stuic-list-item-button-radius: ...;
--stuic-switch-track-bg: ...;
```

### Don't

```css
--stuic-btn-bg: ...; /* abbreviated component name */
--stuic-button-hover-bg: ...; /* state before property */
--stuic-button-bg-dark: ...; /* dark suffix */
--color-button-bg: ...; /* missing stuic- prefix */
```

---

## Svelte 5 Patterns

### Props Declaration

```svelte
<script lang="ts" module>
	import type { HTMLButtonAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";

	export interface Props extends Omit<HTMLButtonAttributes, "children"> {
		children?: Snippet;
		variant?: "solid" | "outline" | "ghost";
		intent?: "primary" | "accent" | "destructive";
		unstyled?: boolean;
		class?: string;
		el?: HTMLButtonElement;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";

	let {
		children,
		variant = "solid",
		intent = "primary",
		unstyled = false,
		class: classProp,
		el = $bindable(),
		...rest
	}: Props = $props();

	let _class = $derived(unstyled ? classProp : twMerge("stuic-button", classProp));
</script>
```

### State Management

```ts
// Simple state
let count = $state(0);

// Derived values
let doubled = $derived(count * 2);

// Complex derived
let status = $derived.by(() => {
	if (count < 0) return "negative";
	if (count === 0) return "zero";
	return "positive";
});

// Effects
$effect(() => {
	console.log("count changed:", count);
	return () => {
		/* cleanup */
	};
});
```

### Bindable Props

```ts
let {
	value = $bindable(""),
	checked = $bindable(false),
	el = $bindable(),
}: Props = $props();
```

---

## Component Requirements

Every visual component MUST support:

| Prop       | Type          | Purpose                    |
| ---------- | ------------- | -------------------------- |
| `unstyled` | `boolean`     | Skip all default styling   |
| `class`    | `string`      | Additional CSS classes     |
| `el`       | `HTMLElement` | Bindable element reference |

### Implementation

```svelte
<button
  bind:this={el}
  class={unstyled ? classProp : twMerge("stuic-button", classProp)}
  {...rest}
>
```

---

## Data Attributes

Use data attributes for variants/states. Do NOT use CSS classes.

### Do

```svelte
<button
  class="stuic-button"
  data-intent={intent}
  data-variant={variant}
  data-size={size}
  data-active={active ? "true" : undefined}
>
```

### Don't

```svelte
<button class="stuic-button stuic-button--primary stuic-button--solid">
```

### CSS Selectors

```css
.stuic-button[data-intent="primary"] {
}
.stuic-button[data-variant="solid"] {
}
.stuic-button[data-size="lg"] {
}
.stuic-button[data-active="true"] {
}
```

---

## File Structure

```
{ComponentName}/
├── {ComponentName}.svelte    # Main component
├── index.ts                  # Exports
├── index.css                 # Component tokens (if customizable)
├── README.md                 # Documentation
└── _internal/                # Internal helpers (optional)
```

---

## Export Pattern

```ts
// index.ts
export {
	default as Button,
	type Props as ButtonProps,
	type ButtonVariant,
	type ButtonSize,
} from "./Button.svelte";
```

---

## Anti-Patterns

| Don't                               | Do                                |
| ----------------------------------- | --------------------------------- |
| `export let prop`                   | `let { prop } = $props()`         |
| `$: derived = ...`                  | `let derived = $derived(...)`     |
| `dark:bg-gray-800`                  | CSS var with `:root.dark {}`      |
| `import './index.css'` in component | Centralize in `src/lib/index.css` |
| `class="variant-primary"`           | `data-variant="primary"`          |
| `--stuic-btn-*`                     | `--stuic-button-*`                |
| `--stuic-button-hover-bg`           | `--stuic-button-bg-hover`         |
| `--stuic-button-bg-dark`            | `.dark { --stuic-button-bg: }`    |

---

## Tailwind CSS v4

- Use `:root {}` for component token definitions
- Use `@layer components {}` for component styles
- No `dark:` prefix when CSS variables handle dark mode
- Use `twMerge()` for class prop merging
- Prefer `bg-linear-to-r` over `bg-gradient-to-r` (v4 canonical)

---

## Documentation

Every component README MUST include:

1. **Description** - One paragraph
2. **Props table** - Type, default, description
3. **Usage examples** - Basic and advanced
4. **CSS variables** - If component has tokens

### Props Table Format

```markdown
| Prop       | Type                    | Default     | Description          |
| ---------- | ----------------------- | ----------- | -------------------- |
| `intent`   | `"primary" \| "accent"` | `"primary"` | Semantic color       |
| `unstyled` | `boolean`               | `false`     | Skip default styling |
```
