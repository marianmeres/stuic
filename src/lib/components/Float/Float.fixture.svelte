<script lang="ts">
	// Float's runtime control is imperative (methods via a ref), so the browser
	// test drives it through this fixture: it holds the `bind:this` ref and exposes
	// testid buttons that call each method. Float props are forwarded via `...rest`.
	import Float from "./Float.svelte";

	let float = $state<Float>();
	let { ...rest } = $props();
</script>

<button data-testid="m-minimize" onclick={() => float?.minimize()}>minimize</button>
<button data-testid="m-expand" onclick={() => float?.expand()}>expand</button>
<button data-testid="m-toggle" onclick={() => float?.toggleMinimize()}>toggle</button>
<button data-testid="m-moveto" onclick={() => float?.moveTo(123, 45)}>moveTo</button>
<button
	data-testid="m-placement-br"
	onclick={() => float?.moveToPlacement("bottom-right")}
>
	placement
</button>
<button data-testid="m-front" onclick={() => float?.bringToFront()}>front</button>

<Float bind:this={float} title="Panel" {...rest}>
	<input data-testid="body-input" type="text" />
	<p>body content</p>
</Float>
