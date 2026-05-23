# ImageCycler

Auto-cycling background-image carousel with fade transitions. Preloads the next image before swapping, so transitions never reveal a half-loaded asset. Optional `title` and `description` snippets render an absolutely-positioned meta layer on top of the image.

## Props

| Prop                 | Type                                                              | Default   | Description                                                            |
| -------------------- | ----------------------------------------------------------------- | --------- | ---------------------------------------------------------------------- |
| `images`             | `ImageCyclerImage[]`                                              | required  | Images to cycle through.                                               |
| `fit`                | `"cover" \| "contain" \| "fill"`                                  | `"cover"` | Background-size mode. Set via `data-fit` on the image layer.            |
| `minWait`            | `number`                                                          | `3000`    | Minimum wait (ms) on each image before advancing.                       |
| `transitionDuration` | `number`                                                          | `500`     | Fade duration in ms (for both the image and the meta layer).            |
| `onclick`            | `(image, index) => void`                                          | -         | Click handler. The snippets receive a forwarded version.                |
| `title`              | `Snippet<[{ image, index, onclick }]>`                            | -         | Title overlay snippet.                                                  |
| `description`        | `Snippet<[{ image, index, onclick }]>`                            | -         | Description overlay snippet.                                            |
| `unstyled`           | `boolean`                                                         | `false`   | Skip default styling.                                                   |
| `class`              | `string`                                                          | -         | Additional CSS classes.                                                 |
| `el`                 | `HTMLElement`                                                     | -         | Bindable root element.                                                  |

## `ImageCyclerImage`

```ts
interface ImageCyclerImage {
	src: string;
	alt?: string;
	title?: string;
	description?: string;
	[key: string]: unknown; // arbitrary extra fields are preserved
}
```

## Usage

### Minimal

```svelte
<script lang="ts">
	import { ImageCycler } from "@marianmeres/stuic";

	const slides = [
		{ src: "/hero/a.jpg", alt: "A" },
		{ src: "/hero/b.jpg", alt: "B" },
		{ src: "/hero/c.jpg", alt: "C" },
	];
</script>

<div style="aspect-ratio: 16/9;">
	<ImageCycler images={slides} />
</div>
```

### With overlay + click

```svelte
<ImageCycler
	images={slides}
	minWait={5000}
	transitionDuration={800}
	onclick={(img, i) => console.log("clicked", i, img)}
>
	{#snippet title({ image, onclick })}
		<button type="button" {onclick} class="absolute bottom-12 left-6 text-white">
			{image.title}
		</button>
	{/snippet}
	{#snippet description({ image })}
		<p class="absolute bottom-4 left-6 text-white/80">{image.description}</p>
	{/snippet}
</ImageCycler>
```

## CSS Variables

| Variable                                    | Default | Description           |
| ------------------------------------------- | ------- | --------------------- |
| `--stuic-image-cycler-transition-duration`  | `500ms` | (informational; the active transition duration comes from the `transitionDuration` prop) |

## Notes

- The root has `position: relative; overflow: hidden`. The parent must define a height (`aspect-ratio`, fixed height, etc.) since the image layer is absolutely positioned.
- Only the next image is preloaded; earlier images aren't kept warm.
- A single-image `images` array disables the cycler effect.
- The `aria-label` for the background layer falls back to `alt → title → ""`.
