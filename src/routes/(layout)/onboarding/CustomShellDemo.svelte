<script lang="ts" module>
	/**
	 * Demonstrates the `shell` snippet option.
	 *
	 * Snippets must be passed via props (or children) — they can't be referenced
	 * in the `<script>` block that calls `createTour`, since the script runs before
	 * the template. The idiomatic pattern is to receive the snippet as a prop from
	 * a parent component that owns the snippet definition.
	 */
</script>

<script lang="ts">
	import type { Snippet } from "svelte";
	import { createTour, tourStep, type TourShellContext } from "$lib/index.js";

	let { shell }: { shell?: Snippet<[TourShellContext]> } = $props();

	const tour = createTour({
		steps: [
			{
				id: "custom-btn",
				title: "Custom Shell",
				content: "Step 1 — this step uses a fully custom navigation UI.",
				position: "bottom",
			},
			{
				id: "custom-panel",
				title: "Info Panel",
				content: "Step 2 — same custom shell, different element.",
				position: "right",
			},
			{
				id: "custom-finish",
				title: "All done!",
				content: "Step 3 — the Finish button calls next() which ends the tour.",
				position: "top",
			},
		],
		// Use a getter so the reactive prop value is always read at call time,
		// not captured at createTour() initialization.
		get shell() {
			return shell;
		},
	});
</script>

<div class="flex gap-3 flex-wrap items-center">
	<button
		class="px-4 py-2 bg-emerald-500 text-white rounded text-sm"
		onclick={tour.start}
		disabled={tour.active}
	>
		{tour.active ? `Step ${tour.currentIndex + 1} / 3…` : "Start Custom Tour"}
	</button>
</div>

<div class="flex gap-6 flex-wrap mt-4">
	<button
		class="px-6 py-3 bg-emerald-500 text-white rounded-lg font-medium"
		use:tourStep={[tour, "custom-btn"]}
	>
		Action Button
	</button>
	<div
		class="px-6 py-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg border"
		use:tourStep={[tour, "custom-panel"]}
	>
		Info Panel
	</div>
	<div
		class="px-6 py-4 bg-teal-100 dark:bg-teal-900 rounded-lg border border-teal-300"
		use:tourStep={[tour, "custom-finish"]}
	>
		Finish Target
	</div>
</div>
