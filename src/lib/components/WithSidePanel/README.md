# WithSidePanel

A flex layout component with a collapsible side panel and main content area.
Both panels consume full height with independent scrolling. The side panel
auto-hides when the container width falls below a configurable threshold
(container-based, not viewport-based), behaving like a mobile drawer.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `Snippet` | — | Main content |
| `side` | `Snippet` | — | Side panel content |
| `position` | `"left" \| "right"` | `"left"` | Side panel position |
| `width` | `string` | `"300px"` | Side panel width (CSS value, px or %) |
| `threshold` | `number` | `768` | Container width (px) below which side auto-hides |
| `transition` | `boolean` | `true` | Enable Svelte slide transition |
| `transitionDuration` | `number` | `200` | Transition duration in ms |
| `open` | `boolean` | `true` | Desktop visibility state (bindable) |
| `resizable` | `boolean \| Partial<ResizableWidthOptions>` | `false` | Enable drag-resizable side panel |
| `classMain` | `string` | — | Custom class for main content div |
| `classSide` | `string` | — | Custom class for side panel div |
| `class` | `string` | — | Custom class for wrapper div |
| `unstyled` | `boolean` | `false` | Skip all default styling |
| `el` | `HTMLDivElement` | — | Bindable wrapper element reference |

## API (via `bind:this`)

| Method | Returns | Description |
|--------|---------|-------------|
| `show()` | `void` | Show the side panel |
| `hide()` | `void` | Hide the side panel |
| `toggle()` | `void` | Toggle the side panel |
| `setWidth(w: string)` | `void` | Set side panel width dynamically |
| `current()` | `{ open: boolean, small: boolean }` | Current state |

## Usage

### Basic

```svelte
<WithSidePanel>
    {#snippet side()}
        <nav>Navigation</nav>
    {/snippet}
    Main content
</WithSidePanel>
```

### Programmatic control

```svelte
<script>
    import { WithSidePanel } from '@marianmeres/stuic';
    let panel;
</script>

<button onclick={() => panel.toggle()}>Toggle</button>

<WithSidePanel bind:this={panel} width="250px" position="right">
    {#snippet side()}
        Side content
    {/snippet}
    Main content
</WithSidePanel>
```

### Resizable

```svelte
<WithSidePanel resizable={{ min: 200, max: 500, key: 'sidebar', storage: 'local' }}>
    {#snippet side()}
        Drag the edge to resize
    {/snippet}
    Main content
</WithSidePanel>
```

### Tracking state

```svelte
<script>
    let isOpen = $state(true);
</script>

<WithSidePanel bind:open={isOpen} threshold={600}>
    {#snippet side()}
        Panel is {isOpen ? 'open' : 'closed'}
    {/snippet}
    Main content
</WithSidePanel>
```

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-with-side-panel-border-color` | `gray-200` / `gray-700` (dark) | Border between panels |
| `--stuic-with-side-panel-border-width` | `1px` | Border width |

## Data Attributes (on wrapper)

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-position` | `"left"` \| `"right"` | Current side panel position |
| `data-small` | present/absent | Container is below threshold |
| `data-open` | present/absent | Side panel is visible |
