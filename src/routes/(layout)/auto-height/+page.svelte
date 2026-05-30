<script lang="ts">
	import { autoHeight } from "$lib/index.js";

	// --- Demo A: height animates on content change ---
	const SIZES = { short: 1, medium: 3, tall: 6 } as const;
	let size = $state<keyof typeof SIZES>("short");

	// --- Demo B: conditional attachment (enabled toggle) ---
	let enabled = $state(true);
	let sizeB = $state<keyof typeof SIZES>("short");

	// --- Demo C: async growth caught by the ResizeObserver ---
	let asyncLines = $state(1);
	let pending = $state(false);
	function addAsync() {
		pending = true;
		// no explicit re-measure — the ResizeObserver picks up the reflow
		setTimeout(() => {
			asyncLines += 2;
			pending = false;
		}, 600);
	}
	function resetAsync() {
		asyncLines = 1;
	}

	const lorem =
		"The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.";
</script>

<div class="space-y-8 p-4">
	<h1 class="text-2xl font-bold">autoHeight attachment</h1>
	<p class="text-sm text-neutral-600 dark:text-neutral-400">
		<code>{`{@attach autoHeight}`}</code> drives the host element's <code>height</code> to
		its single child's natural height, re-measuring on resize (via a
		<code>ResizeObserver</code>). Pair it with a CSS <code>height</code> transition (gated
		behind <code>prefers-reduced-motion</code>) to get a smooth grow/shrink. The
		attachment manages the inline <code>height</code> and toggles
		<code>overflow: clip</code>
		<em>only while the height transitions</em> (so growing content doesn't spill out, but
		focus rings / borders aren't clipped at rest) — don't set <code>overflow</code> on the
		host yourself. Add <code>overflow-clip-margin</code> on the host to let rings/borders stay
		visible mid-transition too. Turn on your OS "reduce motion" setting to confirm it snaps
		instantly to the correct height.
	</p>

	<hr class="my-4" />

	<!-- Demo A -->
	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Animate on content change</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Swap the inner content between short / medium / tall — the viewport animates its
			height between the two natural sizes.
		</p>

		<div class="flex gap-2 flex-wrap">
			{#each Object.keys(SIZES) as s (s)}
				<button
					class="px-3 py-1.5 rounded border"
					class:bg-blue-600={size === s}
					class:text-white={size === s}
					class:border-blue-600={size === s}
					class:border-neutral-300={size !== s}
					class:dark:border-neutral-700={size !== s}
					onclick={() => (size = s as keyof typeof SIZES)}
				>
					{s}
				</button>
			{/each}
		</div>

		<!-- viewport = the host the attachment drives; inner = the measured child -->
		<div
			class="viewport rounded-lg border border-neutral-300 dark:border-neutral-700"
			{@attach autoHeight}
		>
			<div class="inner p-4">
				{#each Array(SIZES[size]) as _, i (i)}
					<p>{i + 1}. {lorem}</p>
				{/each}
			</div>
		</div>
	</section>

	<hr class="my-4" />

	<!-- Demo B -->
	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Conditional attachment</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			<code>{`{@attach enabled && autoHeight}`}</code> — a falsy value means "no
			attachment". With it <strong>on</strong>, content changes animate. With it
			<strong>off</strong>, the attachment is removed (its cleanup clears the inline
			height) so the box snaps to fit.
		</p>

		<div class="flex gap-4 items-center flex-wrap">
			<label class="flex items-center gap-2 text-sm">
				<input type="checkbox" bind:checked={enabled} />
				autoHeight enabled: <strong>{enabled ? "on" : "off"}</strong>
			</label>

			<div class="flex gap-2 flex-wrap">
				{#each Object.keys(SIZES) as s (s)}
					<button
						class="px-3 py-1.5 rounded border"
						class:bg-emerald-600={sizeB === s}
						class:text-white={sizeB === s}
						class:border-emerald-600={sizeB === s}
						class:border-neutral-300={sizeB !== s}
						class:dark:border-neutral-700={sizeB !== s}
						onclick={() => (sizeB = s as keyof typeof SIZES)}
					>
						{s}
					</button>
				{/each}
			</div>
		</div>

		<div
			class="viewport rounded-lg border border-neutral-300 dark:border-neutral-700"
			{@attach enabled && autoHeight}
		>
			<div class="inner p-4">
				{#each Array(SIZES[sizeB]) as _, i (i)}
					<p>{i + 1}. {lorem}</p>
				{/each}
			</div>
		</div>
	</section>

	<hr class="my-4" />

	<!-- Demo C -->
	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Async / out-of-band growth</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Content that grows asynchronously (a late fetch, an image load) is caught by the
			<code>ResizeObserver</code> with no explicit re-trigger.
		</p>

		<div class="flex gap-2 flex-wrap">
			<button
				class="px-3 py-1.5 rounded bg-violet-600 text-white disabled:opacity-50"
				onclick={addAsync}
				disabled={pending}
			>
				{pending ? "adding…" : "Add lines (after 600ms)"}
			</button>
			<button
				class="px-3 py-1.5 rounded border border-neutral-300 dark:border-neutral-700"
				onclick={resetAsync}
			>
				Reset
			</button>
		</div>

		<div
			class="viewport rounded-lg border border-neutral-300 dark:border-neutral-700"
			{@attach autoHeight}
		>
			<div class="inner p-4">
				{#each Array(asyncLines) as _, i (i)}
					<p>{i + 1}. {lorem}</p>
				{/each}
			</div>
		</div>
	</section>
</div>

<style>
	/* The host the attachment drives: just a height transition (gated behind
	   reduced-motion). The attachment toggles `overflow: clip` itself, only while
	   the height transitions — so don't set `overflow` here. (A real consumer can add
	   `overflow-clip-margin` to keep focus rings visible mid-transition.) */
	@media (prefers-reduced-motion: no-preference) {
		.viewport {
			transition: height 200ms ease;
		}
	}
	.inner > p + p {
		margin-top: 0.5rem;
	}
</style>
