# Card

A flexible card component for displaying content in a contained, visually distinct box. Supports images, titles, descriptions, action footers, and both vertical and horizontal layouts.

## Usage

```svelte
<script>
	import { Card, Button } from "@marianmeres/stuic";
</script>

<!-- Basic -->
<Card
	image="/photo.jpg"
	title="Card Title"
	description="A brief description."
/>

<!-- With eyebrow and footer actions -->
<Card
	image="/photo.jpg"
	eyebrow="Category"
	title="Card Title"
	description="Description text."
>
	{#snippet renderFooter()}
		<div class="flex justify-end gap-2">
			<Button variant="ghost" size="sm">Cancel</Button>
			<Button intent="primary" size="sm">Action</Button>
		</div>
	{/snippet}
</Card>

<!-- As a link -->
<Card href="/articles/123" image="/photo.jpg" title="Clickable Card" />

<!-- As a button -->
<Card onclick={() => doSomething()} image="/photo.jpg" title="Clickable Card" />

<!-- Horizontal layout -->
<Card variant="horizontal" image="/photo.jpg" title="Side Image" description="..." />

<!-- Badge overlay on image -->
<Card image="/photo.jpg" title="On Sale">
	{#snippet renderBadge()}
		<span class="bg-red-500 text-white text-xs px-2 py-1 rounded">SALE</span>
	{/snippet}
</Card>

<!-- Full override -->
<Card>
	<div class="p-6">Completely custom content</div>
</Card>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `image` | `string` | - | Image URL for the top (vertical) or side (horizontal) area |
| `imageAlt` | `string` | `""` | Alt text for the image |
| `eyebrow` | `THC` | - | Small label above the title (category, date, tag) |
| `title` | `THC` | - | Card title |
| `description` | `THC` | - | Short description below the title |
| `variant` | `"vertical" \| "horizontal"` | `"vertical"` | Layout variant |
| `horizontalThreshold` | `number` | `480` | Width (px) below which horizontal auto-switches to vertical. Set 0 to disable. |
| `href` | `string` | - | Renders card as `<a>` |
| `onclick` | `(e: MouseEvent) => void` | - | Renders card as `<button>` |
| `disabled` | `boolean` | `false` | Disabled state (reduced opacity, no interaction) |
| `unstyled` | `boolean` | `false` | Skip all default styling |
| `class` | `string` | - | Additional CSS classes for the card shell |
| `classImage` | `string` | - | Additional CSS classes for the image container |
| `classContent` | `string` | - | Additional CSS classes for the content area |
| `classFooter` | `string` | - | Additional CSS classes for the footer |
| `el` | `HTMLElement` | - | Bindable element reference |

## Snippets

| Snippet | Parameters | Description |
|---------|------------|-------------|
| `children` | - | Overrides the entire card body |
| `renderImage` | `{ image, imageAlt }` | Overrides the image area |
| `renderBadge` | - | Badge/overlay positioned over the image |
| `renderContent` | `{ eyebrow?, title?, description? }` | Overrides the content area |
| `renderFooter` | - | Footer area (action buttons, metadata) |

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-card-bg` | `var(--stuic-color-card, var(--stuic-color-background))` | Background color |
| `--stuic-card-bg-hover` | `var(--stuic-color-card-hover, var(--stuic-color-muted))` | Hover background (interactive only) |
| `--stuic-card-border-width` | `1px` | Border width |
| `--stuic-card-border` | `var(--stuic-color-border)` | Border color |
| `--stuic-card-border-hover` | `var(--stuic-color-border-hover)` | Hover border color |
| `--stuic-card-radius` | `var(--radius-lg)` | Border radius |
| `--stuic-card-shadow` | `var(--shadow-sm)` | Box shadow |
| `--stuic-card-shadow-hover` | `var(--shadow-md)` | Hover box shadow |
| `--stuic-card-transition` | `150ms` | Transition duration |
| `--stuic-card-padding` | `1rem` | Content and footer padding |
| `--stuic-card-content-gap` | `0.5rem` | Gap between content elements |
| `--stuic-card-image-aspect-ratio` | `16 / 9` | Image aspect ratio (vertical only) |
| `--stuic-card-image-object-fit` | `cover` | Image object-fit |
| `--stuic-card-image-width-horizontal` | `40%` | Image width in horizontal variant |
| `--stuic-card-eyebrow-font-size` | `var(--text-xs)` | Eyebrow font size |
| `--stuic-card-eyebrow-text` | `var(--stuic-color-muted-foreground)` | Eyebrow text color |
| `--stuic-card-title-font-size` | `var(--text-lg)` | Title font size |
| `--stuic-card-title-font-weight` | `var(--font-weight-semibold)` | Title font weight |
| `--stuic-card-title-text` | `var(--stuic-color-foreground)` | Title text color |
| `--stuic-card-description-font-size` | `var(--text-sm)` | Description font size |
| `--stuic-card-description-text` | `var(--stuic-color-muted-foreground)` | Description text color |
| `--stuic-card-ring-width` | `3px` | Focus ring width |
| `--stuic-card-ring-color` | `var(--stuic-color-ring)` | Focus ring color |
| `--stuic-card-opacity-disabled` | `0.5` | Disabled opacity |

## Notes

- The card fills its parent container (`width: 100%; height: 100%`). Control card size via the parent element.
- Footer sticks to the bottom of the card via `margin-top: auto`.
- When using `href` or `onclick`, the entire card becomes interactive with hover effects. Avoid placing interactive elements (buttons, links) inside `renderFooter` in this case, as it creates invalid nested interactive HTML.
- All content props (`title`, `description`, `eyebrow`) accept the THC type (plain string, HTML, component, or snippet).
- When `variant="horizontal"`, the card measures its own width and automatically switches to vertical layout when narrower than `horizontalThreshold` (default 480px). Set `horizontalThreshold={0}` to disable this behavior.
