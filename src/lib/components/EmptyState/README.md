# EmptyState

Icon + title + description + CTA placeholder for empty lists, tables, and search
results. Centered, theme-aware, and non-interactive by itself — the CTA area is a
snippet you fill with your own `Button`s or links. Pairs naturally with `DataTable`
("no rows"), search UIs ("no results"), and first-run dashboard tiles.

## Props

| Prop               | Type                               | Default   | Description                                       |
| ------------------ | ---------------------------------- | --------- | ------------------------------------------------- |
| `icon`             | `THC`                              | -         | Icon area content (e.g. `{ html: iconSearch() }`) |
| `title`            | `THC`                              | -         | Title headline                                    |
| `description`      | `THC`                              | -         | Short supporting text below the title             |
| `variant`          | `"plain" \| "outline" \| "dashed"` | `"plain"` | Container treatment (bordered box or none)        |
| `size`             | `"sm" \| "md" \| "lg"`             | `"md"`    | Padding, icon and typography scale                |
| `unstyled`         | `boolean`                          | `false`   | Skip all default styling                          |
| `class`            | `string`                           | -         | Additional CSS classes (merged via twMerge)       |
| `classIcon`        | `string`                           | -         | Class for the icon area                           |
| `classTitle`       | `string`                           | -         | Class for the title                               |
| `classDescription` | `string`                           | -         | Class for the description                         |
| `classActions`     | `string`                           | -         | Class for the actions area                        |
| `el`               | `HTMLElement`                      | -         | Element reference (bindable)                      |

## Snippet Props

| Snippet      | Description                                        |
| ------------ | -------------------------------------------------- |
| `actions`    | CTA area below the description (buttons, links)    |
| `renderIcon` | Override the icon area (instead of the `icon` THC) |
| `children`   | Override the entire default layout                 |

## Usage

### Basic

```svelte
<script lang="ts">
	import { EmptyState, Button, iconSearch } from "@marianmeres/stuic";
</script>

<EmptyState
	icon={{ html: iconSearch() }}
	title="No results found"
	description="Try adjusting your search or filters."
/>
```

### With CTA

```svelte
<EmptyState
	icon={{ html: iconPlus() }}
	title="No projects yet"
	description="Create your first project to get started."
>
	{#snippet actions()}
		<Button intent="primary">New project</Button>
		<Button variant="ghost">Learn more</Button>
	{/snippet}
</EmptyState>
```

### Variants

```svelte
<!-- No box (default) — for use inside an already-framed area (table body, panel) -->
<EmptyState variant="plain" title="Nothing here" />

<!-- Bordered container -->
<EmptyState variant="outline" title="Nothing here" />

<!-- Dashed container — the "drop zone / placeholder" look -->
<EmptyState variant="dashed" title="Nothing here" />
```

### Sizes

```svelte
<EmptyState size="sm" title="No comments" />
<EmptyState size="md" title="No comments" />
<EmptyState size="lg" title="No comments" />
```

### With DataTable

```svelte
{#if !rows.length}
	<EmptyState
		icon={{ html: iconFile() }}
		title="No documents"
		description="Documents you upload will show up here."
	>
		{#snippet actions()}
			<Button intent="primary">Upload</Button>
		{/snippet}
	</EmptyState>
{:else}
	<DataTable {rows} ... />
{/if}
```

### Custom Styling

```svelte
<!-- Override the entire layout -->
<EmptyState variant="dashed">
	<img src="/illustrations/empty.svg" alt="" class="w-40" />
	<p>Absolutely nothing.</p>
</EmptyState>

<!-- Override component tokens inline -->
<EmptyState
	title="Big icon"
	icon={{ html: iconSearch() }}
	style="--stuic-empty-state-icon-size-md: 5rem;"
/>
```

## Accessibility

The component renders a plain `<div>` with no implicit role. When an empty state
replaces content dynamically (e.g. search results updating), pass `role="status"`
so screen readers announce it:

```svelte
<EmptyState role="status" title="No results found" />
```

## CSS Variables

### Component Tokens

| Variable                                    | Default                          | Description                            |
| ------------------------------------------- | -------------------------------- | -------------------------------------- |
| `--stuic-empty-state-gap`                   | `0.5rem`                         | Gap between icon/title/description     |
| `--stuic-empty-state-icon-text`             | `--stuic-color-muted-foreground` | Icon color                             |
| `--stuic-empty-state-icon-opacity`          | `0.8`                            | Icon opacity                           |
| `--stuic-empty-state-icon-margin-bottom`    | `0.25rem`                        | Extra space below the icon             |
| `--stuic-empty-state-title-font-weight`     | `--font-weight-semibold`         | Title font weight                      |
| `--stuic-empty-state-title-text`            | `--stuic-color-foreground`       | Title color                            |
| `--stuic-empty-state-description-text`      | `--stuic-color-muted-foreground` | Description color                      |
| `--stuic-empty-state-description-max-width` | `45ch`                           | Description line-length cap            |
| `--stuic-empty-state-actions-gap`           | `0.5rem`                         | Gap between CTA buttons                |
| `--stuic-empty-state-actions-margin-top`    | `1rem`                           | Space above the CTA row                |
| `--stuic-empty-state-bg`                    | `transparent`                    | Background                             |
| `--stuic-empty-state-border`                | `--stuic-color-border`           | Border color (outline/dashed variants) |
| `--stuic-empty-state-border-width`          | `--stuic-border-width`           | Border width (outline/dashed variants) |
| `--stuic-empty-state-radius`                | `--stuic-radius-container`       | Border radius (outline/dashed)         |

### Size Tokens

Each size (sm, md, lg) has corresponding tokens:

- `--stuic-empty-state-padding-{size}`
- `--stuic-empty-state-icon-size-{size}` (applied to any `svg` inside the icon area)
- `--stuic-empty-state-title-font-size-{size}`
- `--stuic-empty-state-description-font-size-{size}`

## Data Attributes

The component uses data attributes for styling:

- `data-variant` - `"plain" | "outline" | "dashed"`
- `data-size` - `"sm" | "md" | "lg"`
