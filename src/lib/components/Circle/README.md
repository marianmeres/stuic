# Circle

An SVG circle progress indicator with configurable stroke, rotation, and animated transitions.

## Props

| Prop                    | Type      | Default | Description                                   |
| ----------------------- | --------- | ------- | --------------------------------------------- |
| `completeness`          | `number`  | `1`     | Progress value from 0 to 1                    |
| `strokeWidth`           | `number`  | `10`    | Stroke width in SVG units                     |
| `bgStrokeColor`         | `string`  | -       | Background circle stroke color                |
| `roundedEdges`          | `boolean` | `true`  | Use rounded stroke line caps                  |
| `rotate`                | `number`  | `0`     | Rotation in degrees                           |
| `strokeWidthRatio`      | `number`  | `0`     | Ratio for background stroke width             |
| `animateCompletenessMs` | `number`  | `0`     | Transition duration for progress changes (ms) |
| `class`                 | `string`  | -       | CSS for container div                         |
| `style`                 | `string`  | -       | Inline styles for container                   |
| `circleClass`           | `string`  | -       | CSS for SVG circle element                    |
| `circleStyle`           | `string`  | -       | Inline styles for circle                      |

## Usage

### Basic Progress Circle

```svelte
<script lang="ts">
	import { Circle } from "stuic";
</script>

<Circle completeness={0.75} class="size-16" />
```

### Animated Progress

```svelte
<script lang="ts">
	import { Circle } from "stuic";

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

```svelte
<Circle
	completeness={0.5}
	strokeWidth={8}
	rotate={-90}
	bgStrokeColor="rgba(0,0,0,0.1)"
	class="size-24"
	circleClass="stroke-blue-500"
/>
```
