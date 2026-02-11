<script lang="ts">
	import {
		spotlight,
		showSpotlight,
		hideSpotlight,
		isSpotlightOpen,
	} from "$lib/index.js";

	let tourStep = $state(0);
	let tourActive = $derived(tourStep > 0);
	let reactiveOpen = $derived(tourStep === 99);

	// Expose tour navigation for inline HTML onclick handlers
	function goToStep(step: number) {
		tourStep = step;
	}

	$effect(() => {
		(window as any).__spotlightTourGoTo = goToStep;
		return () => delete (window as any).__spotlightTourGoTo;
	});
</script>

<div class="space-y-8 p-4">
	<h1 class="text-2xl font-bold">Spotlight Action</h1>
	<p class="text-sm text-neutral-600 dark:text-neutral-400">
		Highlights a target element by dimming everything else behind a backdrop with a cutout
		hole. Useful for onboarding tutorials, feature tours, and drawing attention to UI elements.
	</p>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Basic (programmatic via ID)</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Click "Show" to spotlight the target element. Close via Escape or clicking the backdrop.
		</p>

		<div class="flex gap-4 items-center flex-wrap">
			<button
				class="px-4 py-2 bg-blue-500 text-white rounded"
				onclick={() => showSpotlight("basic")}
			>
				Show Spotlight
			</button>

			<div
				class="px-6 py-4 bg-amber-100 dark:bg-amber-900 rounded-lg border border-amber-300 dark:border-amber-700"
				use:spotlight={() => ({
					content: "This is the highlighted element!",
					position: "bottom",
					id: "basic",
					class: "p-3",
				})}
			>
				Target Element
			</div>

			<span class="text-sm opacity-50">
				State: {isSpotlightOpen("basic") ? "open" : "closed"}
			</span>
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Reactive open prop</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Control the spotlight via a reactive <code>open</code> boolean.
		</p>

		<div class="flex gap-4 items-center flex-wrap">
			<button
				class="px-4 py-2 bg-green-500 text-white rounded"
				onclick={() => (tourStep = tourStep === 99 ? 0 : 99)}
			>
				{reactiveOpen ? "Hide" : "Show"} Spotlight
			</button>

			<div
				class="px-6 py-4 bg-emerald-100 dark:bg-emerald-900 rounded-lg border border-emerald-300 dark:border-emerald-700"
				use:spotlight={() => ({
					content: {
						html: "<div class='p-3 space-y-2'><strong>Reactive control</strong><p class='text-sm opacity-75'>The <code>open</code> prop drives visibility.</p></div>",
					},
					position: "right",
					open: reactiveOpen,
					onHide: () => {
						if (tourStep === 99) tourStep = 0;
					},
				})}
			>
				Reactive Target
			</div>
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Positions</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Annotation placement relative to the target.
		</p>

		<div class="flex gap-3 flex-wrap items-center justify-center py-8">
			{#each ["top", "bottom", "left", "right"] as pos}
				{@const id = `pos-${pos}`}
				<button
					class="px-4 py-2 bg-violet-500 text-white rounded"
					onclick={() => showSpotlight(id)}
				>
					{pos}
				</button>
				<span
					class="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 rounded"
					use:spotlight={() => ({
						content: `Position: ${pos}`,
						position: pos,
						id,
						class: "p-2 text-sm",
					})}
				>
					{pos}
				</span>
			{/each}
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Padding & Border Radius</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Customize the cutout hole size and corner rounding.
		</p>

		<div class="flex gap-4 items-center flex-wrap">
			<button
				class="px-4 py-2 bg-pink-500 text-white rounded"
				onclick={() => showSpotlight("tight")}
			>
				Tight (0px pad, 0px radius)
			</button>
			<span
				class="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 rounded"
				use:spotlight={() => ({
					content: "Tight cutout, no rounding",
					position: "bottom",
					padding: 0,
					borderRadius: 0,
					id: "tight",
					class: "p-2 text-sm",
				})}
			>
				Tight
			</span>

			<button
				class="px-4 py-2 bg-pink-500 text-white rounded"
				onclick={() => showSpotlight("loose")}
			>
				Loose (24px pad, 16px radius)
			</button>
			<span
				class="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 rounded"
				use:spotlight={() => ({
					content: "Generous padding with rounded corners",
					position: "bottom",
					padding: 24,
					borderRadius: 16,
					id: "loose",
					class: "p-2 text-sm",
				})}
			>
				Loose
			</span>
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">HTML Content</h2>

		<div class="flex gap-4 items-center flex-wrap">
			<button
				class="px-4 py-2 bg-indigo-500 text-white rounded"
				onclick={() => showSpotlight("rich")}
			>
				Rich HTML Annotation
			</button>
			<div
				class="px-6 py-4 bg-sky-100 dark:bg-sky-900 rounded-lg border"
				use:spotlight={() => ({
					content: {
						html: `<div class="p-4 space-y-2 max-w-xs">
							<h3 class="font-bold text-base">Welcome!</h3>
							<p class="text-sm opacity-80">This annotation supports <strong>HTML</strong>, plain text, Svelte components, and snippets via the <code>THC</code> type.</p>
						</div>`,
					},
					position: "bottom",
					id: "rich",
				})}
			>
				Rich Content Target
			</div>
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Simple Tour Example</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Chain spotlights together for a multi-step onboarding tour.
		</p>

		<div class="flex gap-4 items-center flex-wrap">
			<button
				class="px-4 py-2 bg-orange-500 text-white rounded"
				onclick={() => (tourStep = 1)}
			>
				{tourActive ? "Restart" : "Start"} Tour
			</button>
			<span class="text-sm opacity-50">Step: {tourActive ? tourStep : "—"}</span>
		</div>

		<div class="flex gap-8 items-start mt-4 flex-wrap">
			<div
				class="px-6 py-4 bg-rose-100 dark:bg-rose-900 rounded-lg border border-rose-300 dark:border-rose-700"
				use:spotlight={() => ({
					content: {
						html: `<div class="p-3 space-y-2">
							<p class="font-semibold">Step 1 of 3</p>
							<p class="text-sm">This is the first feature.</p>
							<div class="flex gap-2 mt-2">
								<button class="px-3 py-1 text-xs bg-neutral-200 dark:bg-neutral-700 rounded" onclick="window.__spotlightTourGoTo(0)">Skip</button>
								<button class="px-3 py-1 text-xs bg-blue-500 text-white rounded" onclick="window.__spotlightTourGoTo(2)">Next</button>
							</div>
						</div>`,
					},
					position: "bottom",
					open: tourStep === 1,
					onHide: () => {
						if (tourStep === 1) tourStep = 0;
					},
				})}
			>
				Feature A
			</div>

			<div
				class="px-6 py-4 bg-amber-100 dark:bg-amber-900 rounded-lg border border-amber-300 dark:border-amber-700"
				use:spotlight={() => ({
					content: {
						html: `<div class="p-3 space-y-2">
							<p class="font-semibold">Step 2 of 3</p>
							<p class="text-sm">This is the second feature.</p>
							<div class="flex gap-2 mt-2">
								<button class="px-3 py-1 text-xs bg-neutral-200 dark:bg-neutral-700 rounded" onclick="window.__spotlightTourGoTo(1)">Back</button>
								<button class="px-3 py-1 text-xs bg-blue-500 text-white rounded" onclick="window.__spotlightTourGoTo(3)">Next</button>
							</div>
						</div>`,
					},
					position: "bottom",
					open: tourStep === 2,
					onHide: () => {
						if (tourStep === 2) tourStep = 0;
					},
				})}
			>
				Feature B
			</div>

			<div
				class="px-6 py-4 bg-teal-100 dark:bg-teal-900 rounded-lg border border-teal-300 dark:border-teal-700"
				use:spotlight={() => ({
					content: {
						html: `<div class="p-3 space-y-2">
							<p class="font-semibold">Step 3 of 3</p>
							<p class="text-sm">This is the last feature. You're all set!</p>
							<div class="flex gap-2 mt-2">
								<button class="px-3 py-1 text-xs bg-neutral-200 dark:bg-neutral-700 rounded" onclick="window.__spotlightTourGoTo(2)">Back</button>
								<button class="px-3 py-1 text-xs bg-green-500 text-white rounded" onclick="window.__spotlightTourGoTo(0)">Done</button>
							</div>
						</div>`,
					},
					position: "bottom",
					open: tourStep === 3,
					onHide: () => {
						if (tourStep === 3) tourStep = 0;
					},
				})}
			>
				Feature C
			</div>
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Click-through Test</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			The target element remains interactive through the cutout hole.
		</p>

		<div class="flex gap-4 items-center flex-wrap">
			<button
				class="px-4 py-2 bg-cyan-500 text-white rounded"
				onclick={() => showSpotlight("click-through")}
			>
				Show Spotlight
			</button>

			<button
				class="px-4 py-2 bg-red-500 text-white rounded"
				use:spotlight={() => ({
					content: "Try clicking the button — it should work through the hole!",
					position: "top",
					id: "click-through",
					class: "p-3",
				})}
				onclick={() => alert("Button clicked through the spotlight!")}
			>
				Click Me!
			</button>
		</div>
	</section>
</div>
