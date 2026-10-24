<script lang="ts">
	import { watch } from "./watch.svelte.js";

	let {
		lazy = false,
		onRun,
		onCleanup,
	}: {
		lazy?: boolean;
		onRun: (
			values: [number, string],
			previous: [number | undefined, string | undefined],
			untrackedSeen: number
		) => void;
		onCleanup?: () => void;
	} = $props();

	let a = $state(0);
	let b = $state("x");
	// read inside the watcher body only — must NOT become a dependency
	let untracked = $state(0);

	// the fixture deliberately captures the initial `lazy`
	// svelte-ignore state_referenced_locally
	watch(
		[() => a, () => b],
		(values, previous) => {
			onRun(values, previous, untracked);
			return onCleanup;
		},
		{ lazy }
	);
</script>

<button data-testid="inc-a" onclick={() => a++}>a</button>
<button data-testid="set-b" onclick={() => (b = "y")}>b</button>
<button data-testid="inc-untracked" onclick={() => untracked++}>untracked</button>
