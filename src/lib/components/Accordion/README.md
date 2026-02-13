# Accordion

A classic accordion component for organizing content into collapsible sections.
Supports exclusive mode (only one section open at a time), keyboard navigation,
and works both as a group (`Accordion` + `AccordionItem`) or standalone (`AccordionItem` only).

## Usage

### Basic

```svelte
<script>
	import { Accordion, AccordionItem } from '@marianmeres/stuic';
</script>

<Accordion>
	<AccordionItem>
		{#snippet trigger()}Section 1{/snippet}
		<p>Content for section 1.</p>
	</AccordionItem>
	<AccordionItem>
		{#snippet trigger()}Section 2{/snippet}
		<p>Content for section 2.</p>
	</AccordionItem>
</Accordion>
```

### Exclusive mode

Only one item can be open at a time:

```svelte
<Accordion exclusive>
	<AccordionItem>
		{#snippet trigger()}Section 1{/snippet}
		<p>Content for section 1.</p>
	</AccordionItem>
	<AccordionItem>
		{#snippet trigger()}Section 2{/snippet}
		<p>Content for section 2.</p>
	</AccordionItem>
</Accordion>
```

### Default open

```svelte
<AccordionItem open>
	{#snippet trigger()}Open by default{/snippet}
	<p>This section starts expanded.</p>
</AccordionItem>
```

### Controlled state

```svelte
<script>
	let isOpen = $state(false);
</script>

<button onclick={() => isOpen = !isOpen}>Toggle</button>

<AccordionItem bind:open={isOpen}>
	{#snippet trigger()}Controlled{/snippet}
	<p>Controlled externally.</p>
</AccordionItem>
```

## Accordion Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `exclusive` | `boolean` | `false` | Only one item open at a time |
| `class` | `string` | — | Container class |
| `unstyled` | `boolean` | `false` | Strip all component styling |
| `style` | `string` | — | Inline styles (CSS variable overrides) |
| `el` | `HTMLDivElement` | — | Bindable element reference |

## AccordionItem Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Expanded state (bindable) |
| `disabled` | `boolean` | `false` | Prevent toggling |
| `class` | `string` | — | Item wrapper class |
| `classTrigger` | `string` | — | Trigger button class |
| `classContent` | `string` | — | Content panel class |
| `unstyled` | `boolean` | `false` | Strip all component styling |
| `style` | `string` | — | Inline styles (CSS variable overrides) |
| `el` | `HTMLDivElement` | — | Bindable element reference |
| `trigger` | `Snippet` | — | Header/trigger content (required) |
| `children` | `Snippet` | — | Panel content (required) |

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-accordion-border-color` | `--stuic-color-border` | Item separator color |
| `--stuic-accordion-border-width` | `1px` | Separator width |
| `--stuic-accordion-radius` | `--radius-md` | Corner rounding |
| `--stuic-accordion-transition` | `200ms` | Open/close animation duration |
| `--stuic-accordion-trigger-padding-x` | `1rem` | Trigger horizontal padding |
| `--stuic-accordion-trigger-padding-y` | `0.75rem` | Trigger vertical padding |
| `--stuic-accordion-trigger-font-weight` | `--font-weight-medium` | Trigger text weight |
| `--stuic-accordion-trigger-bg` | `transparent` | Trigger background |
| `--stuic-accordion-trigger-bg-hover` | muted mix | Trigger hover background |
| `--stuic-accordion-content-padding-x` | `1rem` | Content horizontal padding |
| `--stuic-accordion-content-padding-y` | `0.75rem` | Content vertical padding |
| `--stuic-accordion-ring-width` | `2px` | Focus ring width |
| `--stuic-accordion-ring-color` | `--stuic-color-ring` | Focus ring color |
