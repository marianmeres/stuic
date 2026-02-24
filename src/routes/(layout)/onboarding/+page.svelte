<script lang="ts">
	import { createTour, tourStep, type TourShellContext } from "$lib/index.js";
	import CustomShellDemo from "./CustomShellDemo.svelte";

	// ── Tour 1: Basic 3-step tour ─────────────────────────────────────────
	const basicTour = createTour({
		steps: [
			{
				id: "basic-header",
				title: "Welcome to the Tour",
				content:
					"This is the page heading. Tours are defined centrally in createTour() and target elements via use:tourStep.",
				position: "bottom",
			},
			{
				id: "basic-feature-a",
				title: "Feature A",
				content: "Each step has a title, rich content, and a custom position.",
				position: "right",
			},
			{
				id: "basic-feature-b",
				title: "Feature B",
				content: "Last step. Press Finish (or Escape) to end the tour.",
				position: "bottom",
				finishLabel: "Got it!",
			},
		],
		onStart: () => console.log("[basicTour] started"),
		onEnd: () => console.log("[basicTour] ended"),
		onSkip: () => console.log("[basicTour] skipped"),
		onStepChange: (step, i) => console.log("[basicTour] step", i, step.id),
	});

	// ── Tour 2: Conditional step ─────────────────────────────────────────
	let showAdvanced = $state(false);

	const conditionalTour = createTour({
		steps: [
			{
				id: "cond-start",
				title: "Step 1 — Always here",
				content: "This element is always in the DOM.",
				position: "bottom",
			},
			{
				id: "cond-hidden",
				title: "Step 2 — Conditional",
				content:
					"This element only exists when toggled on. Toggle it off before starting to see the wait→skip behavior (check the console).",
				position: "bottom",
			},
			{
				id: "cond-end",
				title: "Step 3 — The End",
				content: "Made it to the last step!",
				position: "top",
			},
		],
		waitForElement: 500,
	});

	// ── Tour 3: Persisted (session storage) ───────────────────────────────
	const persistedTour = createTour({
		steps: [
			{
				id: "persisted-a",
				title: "Persistence demo — Step 1",
				content:
					"This tour uses storageKey + storage: 'session'. Complete or skip it, then reload — it won't appear again this session.",
				position: "bottom",
			},
			{
				id: "persisted-b",
				title: "Persistence demo — Step 2",
				content:
					"The result ('completed' or 'skipped') is stored in sessionStorage. Call tour.reset() to clear it.",
				position: "top",
			},
		],
		storageKey: "stuic-demo:onboarding-persisted",
		storage: "session",
		onEnd: () => console.log("[persistedTour] completed — persisted to sessionStorage"),
		onSkip: () => console.log("[persistedTour] skipped — persisted to sessionStorage"),
	});

	// ── Tour 4: Multiple independent tours ────────────────────────────────
	const tour3 = createTour({
		steps: [
			{
				id: "t3-a",
				title: "Tour 3 / Step 1",
				content: "This is a second independent tour running on the same page.",
				position: "bottom",
			},
			{
				id: "t3-b",
				title: "Tour 3 / Step 2",
				content: "Multiple createTour() instances coexist without interference.",
				position: "top",
			},
		],
	});
</script>

<div class="space-y-10 p-4">
	<h1
		class="text-2xl font-bold"
		use:tourStep={[basicTour, "basic-header"]}
	>
		Onboarding (createTour)
	</h1>
	<p class="text-sm text-neutral-600 dark:text-neutral-400">
		A declarative multi-step tour abstraction built on top of the
		<code>spotlight</code> primitive. Steps are defined centrally and
		connected to DOM elements via <code>use:tourStep</code>.
	</p>

	<hr class="my-4" />

	<!-- ── Example 1: Basic tour ───────────────────────────────────────── -->
	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Basic 3-step Tour</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Default navigation shell with Prev / Next / Skip buttons and step
			counter. Labels are overridable globally (<code>labels</code>) or per
			step (<code>nextLabel</code>, <code>finishLabel</code>, …). Open the
			console to see lifecycle callbacks.
		</p>

		<div class="flex gap-3 flex-wrap items-center">
			<button
				class="px-4 py-2 bg-blue-500 text-white rounded text-sm"
				onclick={basicTour.start}
				disabled={basicTour.active}
			>
				{basicTour.active
					? `Step ${basicTour.currentIndex + 1} / 3…`
					: "Start Tour"}
			</button>
			{#if basicTour.active}
				<button
					class="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 rounded text-sm"
					onclick={basicTour.skip}
				>
					End Tour
				</button>
			{/if}
		</div>

		<div class="flex gap-6 flex-wrap mt-2">
			<div
				class="px-6 py-4 bg-violet-100 dark:bg-violet-900 rounded-lg border border-violet-300 dark:border-violet-700"
				use:tourStep={[basicTour, "basic-feature-a"]}
			>
				Feature A
			</div>
			<div
				class="px-6 py-4 bg-teal-100 dark:bg-teal-900 rounded-lg border border-teal-300 dark:border-teal-700"
				use:tourStep={[basicTour, "basic-feature-b"]}
			>
				Feature B
			</div>
		</div>
	</section>

	<hr class="my-4" />

	<!-- ── Example 2: Conditional step ────────────────────────────────── -->
	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Conditional Step (wait → skip)</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Step 2's target is conditionally rendered. If the element isn't in the
			DOM when the tour reaches it, the tour waits <code>waitForElement</code>
			ms (default 500) — then warns in the console and skips to the next step.
			Toggle the checkbox <em>off</em> before starting to see the skip.
		</p>

		<div class="flex gap-3 flex-wrap items-center">
			<button
				class="px-4 py-2 bg-orange-500 text-white rounded text-sm"
				onclick={conditionalTour.start}
				disabled={conditionalTour.active}
			>
				{conditionalTour.active
					? `Step ${conditionalTour.currentIndex + 1} / 3…`
					: "Start Tour"}
			</button>
			<label
				class="flex gap-2 items-center text-sm select-none cursor-pointer"
			>
				<input type="checkbox" bind:checked={showAdvanced} />
				Show advanced element (step 2 target)
			</label>
		</div>

		<div class="flex gap-6 flex-wrap mt-2">
			<div
				class="px-6 py-4 bg-amber-100 dark:bg-amber-900 rounded-lg border border-amber-300 dark:border-amber-700"
				use:tourStep={[conditionalTour, "cond-start"]}
			>
				Always visible (step 1)
			</div>

			{#if showAdvanced}
				<div
					class="px-6 py-4 bg-rose-100 dark:bg-rose-900 rounded-lg border border-rose-300 dark:border-rose-700"
					use:tourStep={[conditionalTour, "cond-hidden"]}
				>
					Conditional element (step 2)
				</div>
			{/if}

			<div
				class="px-6 py-4 bg-sky-100 dark:bg-sky-900 rounded-lg border border-sky-300 dark:border-sky-700"
				use:tourStep={[conditionalTour, "cond-end"]}
			>
				Always visible (step 3)
			</div>
		</div>
	</section>

	<hr class="my-4" />

	<!-- ── Example 3: Persisted tour (session storage) ─────────────────── -->
	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Persisted Tour (sessionStorage)</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Pass <code>storageKey</code> to persist the tour result. Once completed
			or skipped, <code>start()</code> silently does nothing on subsequent
			calls — even after a page reload (within the same session). Use
			<code>tour.reset()</code> to clear the stored result and allow it to run
			again.
		</p>

		<div class="flex gap-3 flex-wrap items-center">
			<button
				class="px-4 py-2 bg-emerald-500 text-white rounded text-sm disabled:opacity-50"
				onclick={persistedTour.start}
				disabled={persistedTour.active}
			>
				{persistedTour.active
					? `Step ${persistedTour.currentIndex + 1} / 2…`
					: persistedTour.seen
						? "Already seen (start blocked)"
						: "Start Tour"}
			</button>
			{#if persistedTour.seen}
				<button
					class="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 rounded text-sm"
					onclick={persistedTour.reset}
				>
					Reset (clear sessionStorage)
				</button>
			{/if}
			<span class="text-xs text-neutral-500 font-mono">
				seen: {persistedTour.seen}
			</span>
		</div>

		<div class="flex gap-6 flex-wrap mt-2">
			<div
				class="px-6 py-4 bg-emerald-100 dark:bg-emerald-900 rounded-lg border border-emerald-300 dark:border-emerald-700"
				use:tourStep={[persistedTour, "persisted-a"]}
			>
				Persisted — Element A
			</div>
			<div
				class="px-6 py-4 bg-cyan-100 dark:bg-cyan-900 rounded-lg border border-cyan-300 dark:border-cyan-700"
				use:tourStep={[persistedTour, "persisted-b"]}
			>
				Persisted — Element B
			</div>
		</div>
	</section>

	<hr class="my-4" />

	<!-- ── Example 4: Multiple independent tours ──────────────────────── -->
	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Multiple Independent Tours</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Multiple <code>createTour()</code> instances coexist on the same page
			without interference. Each manages its own state independently.
		</p>

		<div class="flex gap-3 flex-wrap items-center">
			<button
				class="px-4 py-2 bg-pink-500 text-white rounded text-sm"
				onclick={tour3.start}
				disabled={tour3.active}
			>
				{tour3.active
					? `Step ${tour3.currentIndex + 1} / 2…`
					: "Start Tour 3"}
			</button>
		</div>

		<div class="flex gap-6 flex-wrap mt-2">
			<div
				class="px-6 py-4 bg-pink-100 dark:bg-pink-900 rounded-lg border border-pink-300 dark:border-pink-700"
				use:tourStep={[tour3, "t3-a"]}
			>
				Tour 3 — Element A
			</div>
			<div
				class="px-6 py-4 bg-indigo-100 dark:bg-indigo-900 rounded-lg border border-indigo-300 dark:border-indigo-700"
				use:tourStep={[tour3, "t3-b"]}
			>
				Tour 3 — Element B
			</div>
		</div>
	</section>

	<hr class="my-4" />

	<!-- ── Example 4: Custom shell snippet ────────────────────────────── -->
	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Custom Shell Snippet</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Pass a <code>shell</code> snippet to replace the entire default
			navigation UI. The snippet receives a <code>TourShellContext</code> with
			step data and navigation controls. Since snippets can't be referenced in
			the <code>&lt;script&gt;</code> block that calls
			<code>createTour</code>, the idiomatic Svelte 5 pattern is to define the
			shell in a child component and pass it as a named snippet prop.
		</p>

		<!--
			CustomShellDemo.svelte wraps the tour creation and accepts `shell` as a prop.
			The snippet is defined here (in the parent) and passed down as a child prop.
		-->
		<CustomShellDemo>
			{#snippet shell(ctx: TourShellContext)}
				<div class="p-4 space-y-3 min-w-50 max-w-xs">
					<div class="flex items-center justify-between">
						<span class="text-xs font-mono opacity-50">
							{ctx.index + 1} of {ctx.total}
						</span>
						<button
							class="text-xs opacity-40 hover:opacity-80 transition-opacity"
							onclick={ctx.skip}
						>
							✕
						</button>
					</div>
					{#if ctx.step.title}
						<p class="font-bold text-sm">{ctx.step.title}</p>
					{/if}
					{#if ctx.step.content}
						<p class="text-sm opacity-75">{ctx.step.content as string}</p>
					{/if}
					<div class="flex justify-end gap-2 pt-1">
						{#if !ctx.isFirst}
							<button
								class="text-xs px-3 py-1.5 rounded border border-current opacity-60 hover:opacity-100 transition-opacity"
								onclick={ctx.prev}
							>
								← Back
							</button>
						{/if}
						<button
							class="text-xs px-3 py-1.5 rounded bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
							onclick={ctx.next}
						>
							{ctx.isLast ? "Done ✓" : "Continue →"}
						</button>
					</div>
				</div>
			{/snippet}
		</CustomShellDemo>
	</section>
</div>
