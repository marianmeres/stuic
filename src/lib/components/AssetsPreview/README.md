# AssetsPreview

A modal-based asset preview component for displaying images and files. Supports image zoom, pan/drag navigation, keyboard shortcuts, and multi-asset navigation with thumbnails.

## Props

| Prop            | Type                         | Default  | Description                   |
| --------------- | ---------------------------- | -------- | ----------------------------- |
| `assets`        | `string[] \| AssetPreview[]` | -        | Array of assets to preview    |
| `classControls` | `string`                     | -        | CSS for control buttons       |
| `t`             | `TranslateFn`                | built-in | Translation function for i18n |
| `onDelete`      | `(asset, index) => void`     | -        | Optional delete handler       |

## Types

```typescript
type AssetPreviewUrlObj = {
	thumb: string | URL; // Thumbnail URL
	full: string | URL; // Full resolution for preview
	original: string | URL; // Original for download
};

interface AssetPreview {
	url: AssetPreviewUrlObj;
	name?: string; // Display name
	type?: string; // MIME type or file type
}
```

## Methods

| Method          | Description                                      |
| --------------- | ------------------------------------------------ |
| `open(index?)`  | Open preview, optionally at specific asset index |
| `close()`       | Close preview                                    |
| `visibility()`  | Returns object with `visible` getter             |
| `setOpener(el)` | Set element to refocus when closed               |

## Features

- **Image zoom**: 5 zoom levels (1x, 1.5x, 2x, 3x, 4x)
- **Pan/drag**: Click and drag to pan zoomed images
- **Keyboard navigation**: Arrow keys for prev/next
- **Touch support**: Touch gestures for pan
- **Auto-preload**: Preloads full-resolution images when modal opens
- **File type icons**: Displays appropriate icons for non-image files

## Translation Keys

| Key                 | Default             |
| ------------------- | ------------------- |
| `unable_to_preview` | "Unable to preview" |
| `download`          | "Download"          |
| `close`             | "Close"             |
| `zoom_in`           | "Zoom in"           |
| `zoom_out`          | "Zoom out"          |
| `delete`            | "Delete"            |

## Usage

### Basic Usage with Strings

```svelte
<script lang="ts">
	import { AssetsPreview } from "stuic";

	let preview: AssetsPreview;
	const images = ["/images/photo1.jpg", "/images/photo2.jpg"];
</script>

<button onclick={() => preview.open()}>View Images</button>

<AssetsPreview bind:this={preview} assets={images} />
```

### With Full Asset Objects

```svelte
<script lang="ts">
	import { AssetsPreview, type AssetPreview } from "stuic";

	let preview: AssetsPreview;

	const assets: AssetPreview[] = [
		{
			url: {
				thumb: "/images/photo1-thumb.jpg",
				full: "/images/photo1-large.jpg",
				original: "/images/photo1-original.jpg",
			},
			name: "Vacation Photo",
			type: "image/jpeg",
		},
		{
			url: {
				thumb: "/docs/report-thumb.png",
				full: "/docs/report.pdf",
				original: "/docs/report.pdf",
			},
			name: "Annual Report.pdf",
			type: "application/pdf",
		},
	];
</script>

<AssetsPreview bind:this={preview} {assets} />
```

### Open at Specific Index

```svelte
<script lang="ts">
	let preview: AssetsPreview;
</script>

{#each assets as asset, idx}
	<button onclick={() => preview.open(idx)}>
		<img src={asset.url.thumb} alt={asset.name} />
	</button>
{/each}

<AssetsPreview bind:this={preview} {assets} />
```

### With Delete Handler

```svelte
<script lang="ts">
	let assets = $state([...initialAssets]);
	let preview: AssetsPreview;

	function handleDelete(asset: AssetPreview, index: number) {
		assets.splice(index, 1);
		assets = assets; // trigger reactivity
	}
</script>

<AssetsPreview bind:this={preview} {assets} onDelete={handleDelete} />
```

### With Custom Translations

```svelte
<script lang="ts">
	const t = (key: string) => {
		const translations: Record<string, string> = {
			unable_to_preview: "Vorschau nicht verfügbar",
			download: "Herunterladen",
			close: "Schließen",
			zoom_in: "Vergrößern",
			zoom_out: "Verkleinern",
			delete: "Löschen",
		};
		return translations[key] ?? key;
	};
</script>

<AssetsPreview bind:this={preview} {assets} {t} />
```
