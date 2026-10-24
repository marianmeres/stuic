<script lang="ts">
	import { Debounced } from "./debounced.svelte.js";

	let {
		wait = 300,
		onDebounced,
	}: { wait?: number; onDebounced?: (value: string) => void } = $props();

	let q = $state("init");
	// the fixture deliberately captures the initial `wait`
	// svelte-ignore state_referenced_locally
	const debounced = new Debounced(() => q, wait);

	// history of what `current` went through
	$effect(() => {
		onDebounced?.(debounced.current);
	});
</script>

<input data-testid="q" bind:value={q} />
<output data-testid="raw">{q}</output>
<output data-testid="debounced">{debounced.current}</output>
<output data-testid="pending">{debounced.pending ? "yes" : "no"}</output>
<button data-testid="flush" onclick={() => debounced.updateImmediately()}>flush</button>
<button data-testid="cancel" onclick={() => debounced.cancel()}>cancel</button>
<button data-testid="set" onclick={() => debounced.setImmediately("forced")}>set</button>
