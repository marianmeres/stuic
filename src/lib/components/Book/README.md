# Book

A physical book visualization with CSS 3D page-flipping animation. Displays an ordered list of page images as a book that can be opened, flipped through, zoomed, and panned.

## Usage

```svelte
<script lang="ts">
	import { Book, type BookPage } from "@marianmeres/stuic";

	import { Book, computeBookPageSize, type BookPage } from "@marianmeres/stuic";

	const pages: BookPage[] = [
		{ id: 0, src: "/cover.jpg", title: "Cover", width: 2480, height: 3508 },
		{ id: 1, src: "/page1.jpg", title: "Page 1", width: 2480, height: 3508 },
		{ id: 2, src: "/page2.jpg", title: "Page 2", width: 2480, height: 3508 },
		// ...
	];

	const size = computeBookPageSize(pages);
	let book: Book;
	let activeSpread = $state(0);
</script>

<div style="--stuic-book-page-width: {size.width}px; --stuic-book-page-height: {size.height}px;">
	<Book bind:this={book} {pages} bind:activeSpread />
</div>

<button onclick={() => book.previous()}>Prev</button>
<button onclick={() => book.next()}>Next</button>
```

## Data Model

Pages are grouped into **spreads**:

- **Spread 0**: page 0 alone (cover, book closed — single-page width)
- **Spread 1**: pages 1 + 2
- **Spread 2**: pages 3 + 4
- **Spread k** (k >= 1): pages `2k-1` + `2k`
- Final spread may have only a left page if the total count is even

## Props

| Prop             | Type                      | Default          | Description                                             |
| ---------------- | ------------------------- | ---------------- | ------------------------------------------------------- |
| `pages`          | `BookPage[]`              | required         | Ordered array of book pages                             |
| `activeSpread`   | `number`                  | `0`              | Currently active spread index (bindable)                |
| `keyboard`       | `boolean`                 | `true`           | Enable keyboard navigation                              |
| `swipe`          | `boolean`                 | `true`           | Enable swipe gesture navigation                         |
| `duration`       | `number`                  | `600`            | Flip animation duration in ms                           |
| `zoom`           | `boolean`                 | `true`           | Enable zoom capability                                  |
| `zoomLevels`     | `readonly number[]`       | `[1, 1.5, 2, 3]` | Discrete zoom levels                                    |
| `clampPan`       | `boolean`                 | `false`          | Clamp panning within bounds                             |
| `singlePage`     | `boolean`                 | `false`          | Force single-page layout (one page per flip)            |
| `responsive`     | `boolean`                 | `true`           | Auto-switch to single-page when container is too narrow |
| `onSpreadChange` | `(spread, index) => void` | -                | Callback when active spread changes                     |
| `onAreaClick`    | `({area, page}) => void`  | -                | Callback when a clickable area is clicked               |
| `renderPage`     | `Snippet`                 | -                | Custom render snippet for pages                         |
| `class`          | `string`                  | -                | Custom class for container                              |
| `classStage`     | `string`                  | -                | Custom class for the 3D stage                           |
| `classPage`      | `string`                  | -                | Custom class for pages                                  |
| `unstyled`       | `boolean`                 | `false`          | Skip default styling                                    |
| `el`             | `HTMLDivElement`          | -                | Bindable element reference                              |

## Interfaces

```typescript
interface BookPageArea {
	id: string | number;
	x: number;       // X position in natural image pixels
	y: number;       // Y position in natural image pixels
	w: number;       // Width in natural image pixels
	h: number;       // Height in natural image pixels
	[key: string]: any;
}

interface BookPage {
	id: string | number;
	src: string;
	title?: string;
	width: number;         // Natural image width in px
	height: number;        // Natural image height in px
	areas?: BookPageArea[];
	[key: string]: any;
}

interface BookSpread {
	id: number;
	spreadIndex: number;
	leftPage?: BookPage;
	rightPage?: BookPage;
}
```

## Methods

| Method              | Description                       |
| ------------------- | --------------------------------- |
| `next()`            | Navigate to next spread           |
| `previous()`        | Navigate to previous spread       |
| `goTo(spreadIndex)` | Navigate to a specific spread     |
| `zoomIn()`          | Zoom in one level                 |
| `zoomOut()`         | Zoom out one level                |
| `resetZoom()`       | Reset zoom to 1x                  |
| `getCollection()`   | Get the underlying ItemCollection |

## Utility Functions

### `computeBookPageSize(pages, targetHeight?)`

Computes display dimensions from page image metadata. Finds the largest width/height across all pages, preserves aspect ratio, and scales to a target height (default `400`).

```ts
import { computeBookPageSize } from "@marianmeres/stuic";

const size = computeBookPageSize(pages);       // { width: 283, height: 400 }
const size = computeBookPageSize(pages, 300);  // { width: 212, height: 300 }
```

## Clickable Areas

Pages can define clickable areas (e.g. product hotspots in a catalog). Areas are rendered as an SVG overlay that scales correctly with the page image. Requires `width`/`height` on the page (natural image dimensions) and the `onAreaClick` callback.

```svelte
<script lang="ts">
	import { Book, type BookPage } from "@marianmeres/stuic";

	const pages: BookPage[] = [
		{
			id: 0,
			src: "/catalog-page-1.jpg",
			width: 2480,
			height: 3508,
			areas: [
				{ id: "SKU-001", x: 100, y: 200, w: 400, h: 300 },
				{ id: "SKU-002", x: 600, y: 200, w: 400, h: 300 },
			],
		},
		// ...
	];
</script>

<Book {pages} onAreaClick={({ area, page }) => addToCart(area.id)} />
```

## Keyboard Navigation

| Key                    | Action          |
| ---------------------- | --------------- |
| ArrowRight / ArrowDown | Next spread     |
| ArrowLeft / ArrowUp    | Previous spread |
| Home                   | First spread    |
| End                    | Last spread     |

## CSS Variables

| Variable                   | Default                       | Description               |
| -------------------------- | ----------------------------- | ------------------------- |
| `--stuic-book-page-width`  | `300px`                       | Width of a single page    |
| `--stuic-book-page-height` | `400px`                       | Height of the book        |
| `--stuic-book-perspective` | `1200px`                      | CSS perspective depth     |
| `--stuic-book-duration`    | `600ms`                       | Flip animation duration   |
| `--stuic-book-timing`      | `ease-in-out`                 | Animation timing function |
| `--stuic-book-page-bg`     | `var(--stuic-color-surface)`  | Page background color     |
| `--stuic-book-page-shadow` | `0 2px 16px rgba(0,0,0,0.15)` | Book shadow               |
| `--stuic-book-radius`      | `var(--radius-sm)`            | Page border radius        |
| `--stuic-book-area-fill-hover` | `rgba(0, 0, 0, 0.06)`    | Area hover highlight fill |
