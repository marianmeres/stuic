# Book

A physical book visualization with CSS 3D page-flipping animation. Displays an ordered list of page images as a book that can be opened, flipped through, zoomed, and panned.

## Usage

```svelte
<script lang="ts">
  import { Book, type BookPage } from '@marianmeres/stuic';

  const pages: BookPage[] = [
    { id: 0, src: '/cover.jpg', title: 'Cover' },
    { id: 1, src: '/page1.jpg', title: 'Page 1' },
    { id: 2, src: '/page2.jpg', title: 'Page 2' },
    // ...
  ];

  let book: Book;
  let activeSpread = $state(0);
</script>

<div style="--stuic-book-page-width: 300px; --stuic-book-page-height: 420px;">
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

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pages` | `BookPage[]` | required | Ordered array of book pages |
| `activeSpread` | `number` | `0` | Currently active spread index (bindable) |
| `keyboard` | `boolean` | `true` | Enable keyboard navigation |
| `swipe` | `boolean` | `true` | Enable swipe gesture navigation |
| `duration` | `number` | `600` | Flip animation duration in ms |
| `zoom` | `boolean` | `true` | Enable zoom capability |
| `zoomLevels` | `readonly number[]` | `[1, 1.5, 2, 3]` | Discrete zoom levels |
| `clampPan` | `boolean` | `false` | Clamp panning within bounds |
| `singlePage` | `boolean` | `false` | Force single-page layout (one page per flip) |
| `responsive` | `boolean` | `true` | Auto-switch to single-page when container is too narrow |
| `onSpreadChange` | `(spread, index) => void` | - | Callback when active spread changes |
| `renderPage` | `Snippet` | - | Custom render snippet for pages |
| `class` | `string` | - | Custom class for container |
| `classStage` | `string` | - | Custom class for the 3D stage |
| `classPage` | `string` | - | Custom class for pages |
| `unstyled` | `boolean` | `false` | Skip default styling |
| `el` | `HTMLDivElement` | - | Bindable element reference |

## Interfaces

```typescript
interface BookPage {
  id: string | number;
  src: string;
  title?: string;
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

| Method | Description |
|--------|-------------|
| `next()` | Navigate to next spread |
| `previous()` | Navigate to previous spread |
| `goTo(spreadIndex)` | Navigate to a specific spread |
| `zoomIn()` | Zoom in one level |
| `zoomOut()` | Zoom out one level |
| `resetZoom()` | Reset zoom to 1x |
| `getCollection()` | Get the underlying ItemCollection |

## Keyboard Navigation

| Key | Action |
|-----|--------|
| ArrowRight / ArrowDown | Next spread |
| ArrowLeft / ArrowUp | Previous spread |
| Home | First spread |
| End | Last spread |

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-book-page-width` | `300px` | Width of a single page |
| `--stuic-book-page-height` | `400px` | Height of the book |
| `--stuic-book-perspective` | `1200px` | CSS perspective depth |
| `--stuic-book-duration` | `600ms` | Flip animation duration |
| `--stuic-book-timing` | `ease-in-out` | Animation timing function |
| `--stuic-book-page-bg` | `var(--stuic-color-surface)` | Page background color |
| `--stuic-book-page-shadow` | `0 2px 16px rgba(0,0,0,0.15)` | Book shadow |
| `--stuic-book-radius` | `var(--radius-sm)` | Page border radius |
