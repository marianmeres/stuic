<script lang="ts">
	import {
		dimBehind,
		showDimBehind,
		hideDimBehind,
		isDimBehindOpen,
	} from "$lib/index.js";

	let reactiveOpen = $state(false);
	let multiAll = $state(false);
	let scrollLockOpen = $state(false);
	let customOpen = $state(false);
	let callbackOpen = $state(false);
	let callbackLog = $state<string[]>([]);
	let zIndexOpen = $state(false);
</script>

<div class="space-y-8 p-4">
	<h1 class="text-2xl font-bold">Dim Behind Action</h1>
	<p class="text-sm text-neutral-600 dark:text-neutral-400">
		A simplified alternative to <code>spotlight</code>. Dims everything behind a target element
		by showing a shared backdrop and elevating the target above it via z-index. No cutout hole,
		no annotations — just dim and elevate.
	</p>

	<hr class="my-4" />

	<!-- Basic (programmatic via ID) -->
	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Basic (programmatic via ID)</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Click "Dim" to highlight the target. Close via Escape or clicking the backdrop.
		</p>

		<div class="flex gap-4 items-center flex-wrap">
			<button
				class="px-4 py-2 bg-blue-500 text-white rounded"
				onclick={() => showDimBehind("basic")}
			>
				Dim
			</button>

			<div
				class="px-6 py-4 bg-amber-100 dark:bg-amber-900 rounded-lg border border-amber-300 dark:border-amber-700"
				use:dimBehind={() => ({
					id: "basic",
				})}
			>
				Target Element
			</div>

			<span class="text-sm opacity-50">
				State: {isDimBehindOpen("basic") ? "open" : "closed"}
			</span>
		</div>
	</section>

	<hr class="my-4" />

	<!-- Reactive open prop -->
	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Reactive open prop</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Control the dim effect via a reactive <code>open</code> boolean.
		</p>

		<div class="flex gap-4 items-center flex-wrap">
			<button
				class="px-4 py-2 bg-green-500 text-white rounded"
				onclick={() => (reactiveOpen = !reactiveOpen)}
			>
				{reactiveOpen ? "Hide" : "Show"}
			</button>

			<div
				class="px-6 py-4 bg-emerald-100 dark:bg-emerald-900 rounded-lg border border-emerald-300 dark:border-emerald-700"
				use:dimBehind={() => ({
					open: reactiveOpen,
					onHide: () => (reactiveOpen = false),
				})}
			>
				Reactive Target
			</div>
		</div>
	</section>

	<hr class="my-4" />

	<!-- Multiple simultaneous -->
	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Multiple simultaneous</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Multiple elements can be dimmed at once. The backdrop is a singleton with reference
			counting — it only disappears when all elements are deactivated.
		</p>

		<div class="flex gap-4 items-center flex-wrap">
			<button
				class="px-4 py-2 bg-violet-500 text-white rounded"
				onclick={() => (multiAll = !multiAll)}
			>
				{multiAll ? "Hide All" : "Dim All"}
			</button>
		</div>

		<div class="flex gap-4 items-start flex-wrap mt-2">
			{#each ["A", "B", "C"] as label}
				<div
					class="px-6 py-4 bg-violet-100 dark:bg-violet-900 rounded-lg border border-violet-300 dark:border-violet-700"
					use:dimBehind={() => ({
						open: multiAll,
						onHide: () => (multiAll = false),
					})}
				>
					Element {label}
				</div>
			{/each}
		</div>
	</section>

	<hr class="my-4" />

	<!-- Custom z-index -->
	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Custom z-index</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Override z-index per instance via the <code>zIndex</code> option.
		</p>

		<div class="flex gap-4 items-center flex-wrap">
			<button
				class="px-4 py-2 bg-pink-500 text-white rounded"
				onclick={() => (zIndexOpen = !zIndexOpen)}
			>
				{zIndexOpen ? "Hide" : "Dim"} (z-index: 100)
			</button>

			<div
				class="px-6 py-4 bg-pink-100 dark:bg-pink-900 rounded-lg border border-pink-300 dark:border-pink-700"
				use:dimBehind={() => ({
					open: zIndexOpen,
					zIndex: 100,
					onHide: () => (zIndexOpen = false),
				})}
			>
				High z-index Target
			</div>
		</div>
	</section>

	<hr class="my-4" />

	<!-- Scroll lock -->
	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Scroll lock</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			With <code>scrollLock: true</code>, the page becomes non-scrollable while dimmed. Compare
			with the basic example above where scrolling still works.
		</p>

		<div class="flex gap-4 items-center flex-wrap">
			<button
				class="px-4 py-2 bg-orange-500 text-white rounded"
				onclick={() => (scrollLockOpen = !scrollLockOpen)}
			>
				{scrollLockOpen ? "Hide" : "Dim"} (scroll locked)
			</button>

			<div
				class="px-6 py-4 bg-orange-100 dark:bg-orange-900 rounded-lg border border-orange-300 dark:border-orange-700"
				use:dimBehind={() => ({
					open: scrollLockOpen,
					scrollLock: true,
					onHide: () => (scrollLockOpen = false),
				})}
			>
				Scroll Lock Target
			</div>
		</div>
	</section>

	<hr class="my-4" />

	<!-- Custom backdrop styling -->
	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Custom backdrop styling</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Override CSS tokens for custom backdrop color and transition duration.
		</p>

		<div
			class="flex gap-4 items-center flex-wrap"
			style="--stuic-dim-behind-backdrop-bg: rgb(59 130 246 / 0.3); --stuic-dim-behind-transition-duration: 500ms;"
		>
			<button
				class="px-4 py-2 bg-cyan-500 text-white rounded"
				onclick={() => (customOpen = !customOpen)}
			>
				{customOpen ? "Hide" : "Dim"} (blue tint, slow fade)
			</button>

			<div
				class="px-6 py-4 bg-cyan-100 dark:bg-cyan-900 rounded-lg border border-cyan-300 dark:border-cyan-700"
				use:dimBehind={() => ({
					open: customOpen,
					onHide: () => (customOpen = false),
				})}
			>
				Custom Styled Target
			</div>
		</div>
	</section>

	<hr class="my-4" />

	<!-- Callbacks -->
	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Callbacks</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			<code>onShow</code> and <code>onHide</code> callbacks.
		</p>

		<div class="flex gap-4 items-center flex-wrap">
			<button
				class="px-4 py-2 bg-indigo-500 text-white rounded"
				onclick={() => (callbackOpen = !callbackOpen)}
			>
				{callbackOpen ? "Hide" : "Dim"}
			</button>

			<div
				class="px-6 py-4 bg-indigo-100 dark:bg-indigo-900 rounded-lg border border-indigo-300 dark:border-indigo-700"
				use:dimBehind={() => ({
					open: callbackOpen,
					onShow: () => {
						callbackLog = [...callbackLog, `onShow @ ${new Date().toLocaleTimeString()}`];
					},
					onHide: () => {
						callbackOpen = false;
						callbackLog = [...callbackLog, `onHide @ ${new Date().toLocaleTimeString()}`];
					},
				})}
			>
				Callback Target
			</div>
		</div>

		{#if callbackLog.length}
			<div class="text-xs font-mono bg-neutral-100 dark:bg-neutral-800 rounded p-3 space-y-1">
				{#each callbackLog as entry}
					<div>{entry}</div>
				{/each}
			</div>
		{/if}
	</section>
</div>
