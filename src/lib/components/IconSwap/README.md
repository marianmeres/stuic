# IconSwap

Cross-fades between N visual states (HTML strings or Snippets) at a single position. Commonly used for hamburger ⇄ X toggles, play ⇄ pause, sun ⇄ moon, etc. Respects `prefers-reduced-motion` (animation duration is forced to 0).

## Props

| Prop         | Type                       | Default  | Description                                                                |
| ------------ | -------------------------- | -------- | -------------------------------------------------------------------------- |
| `states`     | `Array<string \| Snippet>` | required | The visual states to swap between. Strings are rendered with `{@html}`.    |
| `active`     | `number`                   | `0`      | Bindable index of the currently visible state.                              |
| `duration`   | `number`                   | `300`    | Transition duration in ms. Set `0` to disable.                              |
| `easing`     | `string`                   | `"ease"` | CSS `transition-timing-function`.                                           |
| `unstyled`   | `boolean`                  | `false`  | Skip default styling.                                                       |
| `class`      | `string`                   | -        | Additional CSS classes for the root `<span>`.                              |
| `stateClass` | `string`                   | -        | Additional CSS classes for each state wrapper.                              |
| `el`         | `HTMLSpanElement`          | -        | Bindable root element.                                                      |

## Usage

### Hamburger ⇄ X

```svelte
<script lang="ts">
	import { IconSwap, iconMenu, iconX } from "@marianmeres/stuic";

	let isOpen = $state(false);
</script>

<button onclick={() => (isOpen = !isOpen)}>
	<IconSwap active={isOpen ? 1 : 0} states={[iconMenu(), iconX()]} />
</button>
```

### With snippets

```svelte
<IconSwap active={tab}>
	{#snippet states_0()}<span>A</span>{/snippet}
	{#snippet states_1()}<strong>B</strong>{/snippet}
	{#snippet states_2()}<em>C</em>{/snippet}
</IconSwap>

<!-- equivalent with an array of snippets -->
<IconSwap active={tab} states={[stateA, stateB, stateC]} />
```

### Custom easing/duration

```svelte
<IconSwap states={frames} active={i} duration={500} easing="cubic-bezier(0.4, 0, 0.2, 1)" />
```

## CSS Variables

| Variable                      | Default | Description                |
| ----------------------------- | ------- | -------------------------- |
| `--stuic-icon-swap-duration`  | (prop)  | Transition duration         |
| `--stuic-icon-swap-easing`    | (prop)  | Transition timing function  |

## Data Attributes

- `data-active` (root) — current active index
- `data-visible="true"` (state wrapper) — present on the visible state

## Behavior

- All states render concurrently; the inactive ones have `opacity: 0` and `aria-hidden="true"`.
- The root is positioned so all states stack at the same coordinates.
- `active` is clamped to `[0, states.length - 1]`.
