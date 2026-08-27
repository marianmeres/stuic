# Circle

An SVG circle progress indicator with configurable stroke, rotation, and animated
transitions. A thin Svelte wrapper around the [`svgCircle`](../../utils/svg-circle.ts)
utility.

The svg is rendered at `width/height: 100%` over a fixed `100x100` viewBox, so **the
container decides the size** (default `size-6`) and `strokeWidth` is expressed in viewBox
units - i.e. it scales with the box. The stroke defaults to `currentColor`.

## Props

| Prop                    | Type      | Default | Description                                                            |
| ----------------------- | --------- | ------- | ---------------------------------------------------------------------- |
| `completeness`          | `number`  | `1`     | Progress from 0 to 1 (clamped)                                         |
| `strokeWidth`           | `number`  | `10`    | Stroke width in viewBox units (radius = `50 - strokeWidth / 2`)        |
| `strokeWidthRatio`      | `number`  | `0`     | Caps `strokeWidth` at this fraction of the radius; `0` means no cap    |
| `bgStrokeColor`         | `string`  | -       | Any CSS color; adds a full background ring behind the arc              |
| `roundedEdges`          | `boolean` | `true`  | Rounded (vs butt) stroke line caps                                     |
| `rotate`                | `number`  | `0`     | Rotation in degrees; the arc starts at 3 o'clock, so use `-90` for top |
| `animateCompletenessMs` | `number`  | `0`     | CSS transition duration on `stroke-dashoffset` (ms)                    |
| `class`                 | `string`  | -       | CSS classes for the container div                                      |
| `style`                 | `string`  | -       | Inline styles for the container div                                    |
| `circleClass`           | `string`  | -       | CSS classes for the `<svg>` element                                    |
| `circleStyle`           | `string`  | -       | Inline styles for the `<circle>` element                               |

`completeness` and `rotate` are applied through the helper's setters, so changing them
only rewrites two attributes. Every other prop rebuilds the svg.

## Usage

### Basic Progress Circle

```svelte
<script lang="ts">
	import { Circle } from "@marianmeres/stuic";
</script>

<Circle completeness={0.75} rotate={-90} class="size-16" />
```

### Animated Progress

```svelte
<script lang="ts">
	import { Circle } from "@marianmeres/stuic";

	let progress = $state(0);

	function startProgress() {
		progress = 0;
		const interval = setInterval(() => {
			progress += 0.1;
			if (progress >= 1) clearInterval(interval);
		}, 200);
	}
</script>

<Circle completeness={progress} animateCompletenessMs={200} class="size-20" />

<button onclick={startProgress}>Start</button>
```

### Custom Styling

The ring's stroke is `currentColor`, so a text color on the container (or on the svg via
`circleClass`) colors it. To set the stroke directly, use `circleStyle` - it lands on the
`<circle>` element, which is the only place that beats the `stroke="currentColor"`
presentation attribute.

```svelte
<!-- via currentColor -->
<Circle
	completeness={0.5}
	strokeWidth={8}
	rotate={-90}
	bgStrokeColor="rgba(0,0,0,0.1)"
	class="size-24 text-blue-500"
/>

<!-- or explicitly on the circle element -->
<Circle
	completeness={0.5}
	rotate={-90}
	class="size-24"
	circleStyle="stroke: var(--stuic-color-primary);"
/>
```

### Content Inside the Ring

```svelte
<div class="relative size-24">
	<Circle
		completeness={0.62}
		rotate={-90}
		bgStrokeColor="#e5e5e5"
		class="absolute inset-0"
	/>
	<div class="absolute inset-0 flex items-center justify-center">62%</div>
</div>
```
