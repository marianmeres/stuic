<script lang="ts">
	// Harness for exercising TimeTrap's imperative reset() + the reactive
	// isTooFast / startedAt bindings from a real test. `*.test.svelte` files are
	// treated as components (not test files) and are excluded from the package.
	import TimeTrap from "./TimeTrap.svelte";

	let { minMs = 80 }: { minMs?: number } = $props();

	let trap = $state<TimeTrap>();
	let isTooFast = $state(true);
	let elapsedMs = $state(0);
	let startedAt = $state<number>();
</script>

<button data-testid="reset" onclick={() => trap?.reset()}>reset</button>
<output data-testid="toofast">{String(isTooFast)}</output>
<output data-testid="started">{startedAt ?? ""}</output>

<TimeTrap bind:this={trap} bind:isTooFast bind:elapsedMs bind:startedAt {minMs} />
