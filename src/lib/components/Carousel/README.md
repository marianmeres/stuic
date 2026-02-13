# Carousel

A horizontally scrollable carousel component with optional active item tracking,
keyboard navigation, snap scrolling, and flexible content rendering via THC.

## Props

| Prop              | Type                                                                | Default    | Description                            |
| ----------------- | ------------------------------------------------------------------- | ---------- | -------------------------------------- |
| `items`           | `CarouselItem[]`                                                    | required   | Array of carousel items                |
| `itemsPerView`    | `number`                                                            | `1`        | Number of items visible per view       |
| `peekPercent`     | `number`                                                            | `0`        | Percentage of next item to show (0-50) |
| `gap`             | `number \| string`                                                  | -          | Gap between items                      |
| `trackActive`     | `boolean`                                                           | `false`    | Enable active item tracking            |
| `activeIndex`     | `number`                                                            | `0`        | Active item index (bindable)           |
| `value`           | `string \| number`                                                  | -          | Active item id (bindable)              |
| `snap`            | `boolean`                                                           | `true`     | Enable scroll snap                     |
| `snapAlign`       | `"start" \| "center" \| "end"`                                      | `"start"`  | Snap alignment                         |
| `keyboard`        | `boolean`                                                           | `true`     | Enable keyboard navigation             |
| `loop`            | `boolean`                                                           | `false`    | Loop navigation                        |
| `scrollBehavior`  | `ScrollBehavior`                                                    | `"smooth"` | Scroll behavior                        |
| `class`           | `string`                                                            | -          | Custom class for container             |
| `classTrack`      | `string`                                                            | -          | Custom class for scroll track          |
| `classItem`       | `string`                                                            | -          | Custom class for items                 |
| `classItemActive` | `string`                                                            | -          | Custom class for active item           |
| `unstyled`        | `boolean`                                                           | `false`    | Skip default styling                   |
| `el`              | `HTMLDivElement`                                                    | -          | Element reference (bindable)           |
| `onActiveChange`  | `(item: CarouselItem, index: number) => void`                       | -          | Callback when active changes           |
| `renderItem`      | `Snippet<[{ item: CarouselItem; index: number; active: boolean }]>` | -          | Custom item render snippet             |

## CarouselItem Interface

```typescript
interface CarouselItem {
	id: string | number;
	content: THC; // Text, HTML, Component, or Snippet
	disabled?: boolean;
	data?: Record<string, any>; // Custom data for renderItem
}
```

## Methods

| Method        | Description               |
| ------------- | ------------------------- |
| `goTo(index)` | Navigate to item at index |
| `goToId(id)`  | Navigate to item with id  |
| `next()`      | Navigate to next item     |
| `previous()`  | Navigate to previous item |

## Usage

### Basic

```svelte
<Carousel
	items={[
		{ id: 1, content: "Slide 1" },
		{ id: 2, content: "Slide 2" },
		{ id: 3, content: "Slide 3" },
	]}
/>
```

### Multiple Items Per View with Peek

```svelte
<Carousel {items} itemsPerView={3} peekPercent={10} gap={16} />
```

### With Active Tracking

```svelte
<script>
	let activeIndex = $state(0);
</script>

<Carousel
	{items}
	trackActive
	bind:activeIndex
	onActiveChange={(item, i) => console.log("Active:", item)}
/>
```

### Custom Rendering

```svelte
<Carousel {items}>
	{#snippet renderItem({ item, index, active })}
		<div class="card" class:active>
			<h3>{item.content}</h3>
			<p>{item.data?.description}</p>
		</div>
	{/snippet}
</Carousel>
```

### Programmatic Navigation

```svelte
<script>
	let carousel: Carousel;
</script>

<Carousel bind:this={carousel} {items} trackActive />

<button onclick={() => carousel.previous()}>Previous</button>
<button onclick={() => carousel.next()}>Next</button>
<button onclick={() => carousel.goTo(0)}>First</button>
```

## CSS Variables

| Variable                                    | Default                 | Description            |
| ------------------------------------------- | ----------------------- | ---------------------- |
| `--stuic-carousel-gap`                      | `1rem`                  | Gap between items      |
| `--stuic-carousel-peek-percent`             | `0%`                    | Peek percentage        |
| `--stuic-carousel-item-radius`              | `--radius-md`           | Item border radius     |
| `--stuic-carousel-item-bg`                  | `transparent`           | Item background        |
| `--stuic-carousel-item-bg-active`           | `transparent`           | Active item background |
| `--stuic-carousel-item-border`              | `transparent`           | Item border color      |
| `--stuic-carousel-item-border-active`       | `--stuic-color-primary` | Active border          |
| `--stuic-carousel-item-border-width`        | `0`                     | Item border width      |
| `--stuic-carousel-item-border-width-active` | `2px`                   | Active border width    |
| `--stuic-carousel-ring-width`               | `3px`                   | Focus ring width       |
| `--stuic-carousel-ring-color`               | `--stuic-color-ring`    | Focus ring color       |

## Keyboard Navigation

- **ArrowLeft/ArrowRight**: Previous/Next item
- **ArrowUp/ArrowDown**: Previous/Next item (alternative)
- **Home**: First item
- **End**: Last item
