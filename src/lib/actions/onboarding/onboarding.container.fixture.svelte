<script lang="ts">
	import { untrack } from "svelte";
	import { createTour, tourStep } from "./onboarding.svelte.js";

	let {
		/** Register the target through `use:tourStep` instead of a `selector`. */
		useAction = false,
		/** Re-keys the target, i.e. destroys the node and mounts a fresh one at
		 *  different coordinates — what a lazy tab or a keyed block does between
		 *  two runs of the same tour. */
		swapped = false,
		storageKey = undefined,
	}: {
		useAction?: boolean;
		swapped?: boolean;
		storageKey?: string;
	} = $props();

	const tour = createTour({
		steps: [
			{
				id: "one",
				title: "Step one",
				content: "the only step",
				position: "bottom",
				padding: 0,
				borderRadius: 0,
				// The whole point of the two modes: an action-registered step has
				// no selector to be re-resolved from. untracked for the same reason
				// as `storageKey` below.
				selector: untrack(() => (useAction ? undefined : "[data-testid='target']")),
			},
		],
		// Short: the action test asserts a step is NOT skipped, and a skip costs
		// this whole wait before it can be observed.
		waitForElement: 300,
		// untrack: read once at init, which is when `createTour` needs it — a
		// tracked read here would be a reactivity warning for a prop that never
		// changes after mount.
		storageKey: untrack(() => storageKey),
		storage: "session",
		showSteps: false,
	});
</script>

<!-- Above the spotlight backdrop (z-index 50), which would otherwise swallow
every click the test makes while a tour is running. -->
<div style="position: relative; z-index: 100;">
	<button data-testid="start" onclick={() => tour.start()}>start</button>
	<button data-testid="reset" onclick={() => tour.reset()}>reset</button>
	<button data-testid="skip" onclick={() => void tour.skip()}>skip</button>
	<div data-testid="active">{tour.active ? "yes" : "no"}</div>
</div>

{#key swapped}
	{#if useAction}
		<div
			data-testid="target"
			use:tourStep={[tour, "one"]}
			style="position: absolute; left: {swapped ? 160 : 40}px; top: {swapped
				? 130
				: 30}px; width: 60px; height: 20px;"
		>
			t
		</div>
	{:else}
		<div
			data-testid="target"
			style="position: absolute; left: {swapped ? 160 : 40}px; top: {swapped
				? 130
				: 30}px; width: 60px; height: 20px;"
		>
			t
		</div>
	{/if}
{/key}
