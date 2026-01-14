<script lang="ts">
	import { popover, isPopoverSupported, type PopoverPosition, tooltip } from "$lib/index.js";
	import { Spinner } from "$lib/index.js";
	import { dummySentence } from "../../_utils/dummy-text.js";

	const isSupported = isPopoverSupported();

	let dynamicContent = $state("Edit me to see reactive updates");
	let clickCount = $state(0);
	let isOpen = $state(false);
</script>

<div class="space-y-8 p-4">
	<h1 class="text-2xl font-bold">Popover Action</h1>

	<p class="text-sm">
		CSS Anchor Positioning:
		<span class={isSupported ? "text-green-600" : "text-orange-600"}>
			{isSupported ? "Supported" : "Not supported (fallback mode)"}
		</span>
	</p>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Click Trigger (default)</h2>

		<div class="flex gap-4 flex-wrap">
			<button
				class="px-4 py-2 bg-blue-500 text-white rounded"
				use:popover={() => ({
					content: "Simple text content in a popover",
					class: "p-3 bg-white dark:bg-neutral-800",
				})}
			>
				Simple Text
			</button>

			<button
				class="px-4 py-2 bg-blue-500 text-white rounded"
				use:popover={() => ({
					content: { html: "<strong>Bold</strong> and <em>italic</em> content" },
					position: "bottom",
					class: "p-3 bg-white dark:bg-neutral-800",
				})}
			>
				HTML Content
			</button>

			<button
				class="px-4 py-2 bg-blue-500 text-white rounded"
				use:popover={() => ({
					content: { component: Spinner, props: { size: 32 } },
					position: "right",
					class: "p-4 bg-white dark:bg-neutral-800",
				})}
			>
				Component Content
			</button>
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Hover Trigger</h2>

		<div class="flex gap-4 flex-wrap">
			<button
				class="px-4 py-2 bg-green-500 text-white rounded"
				use:popover={() => ({
					content: "Hover to see this! Move your mouse over the popover too.",
					trigger: "hover",
					position: "top",
					class: "p-3 max-w-64 bg-white dark:bg-neutral-800",
				})}
			>
				Hover Me (top)
			</button>

			<button
				class="px-4 py-2 bg-green-500 text-white rounded"
				use:popover={() => ({
					content: "Left-positioned popover on hover",
					trigger: "hover",
					position: "left",
					class: "p-3 bg-white dark:bg-neutral-800",
				})}
			>
				Hover Me (left)
			</button>

			<button
				class="px-4 py-2 bg-green-500 text-white rounded"
				use:popover={() => ({
					content: { html: `<div class="p-3">${dummySentence(3)}</div>` },
					trigger: "hover",
					position: "bottom",
					class: "bg-white dark:bg-neutral-800",
				})}
			>
				Hover (longer content)
			</button>
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Reactive Content</h2>

		<div class="flex gap-4 items-center flex-wrap">
			<input
				type="text"
				bind:value={dynamicContent}
				class="border px-2 py-1 rounded w-64"
			/>

			<button
				class="px-4 py-2 bg-purple-500 text-white rounded"
				use:popover={() => ({
					content: dynamicContent,
					position: "bottom",
					class: "p-3 max-w-80 bg-white dark:bg-neutral-800",
				})}
			>
				Dynamic Content
			</button>
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Callbacks</h2>

		<div class="flex gap-4 items-center flex-wrap">
			<button
				class="px-4 py-2 bg-indigo-500 text-white rounded"
				use:popover={() => ({
					content: `Opened ${clickCount} time(s)`,
					position: "bottom",
					class: "p-3 bg-white dark:bg-neutral-800",
					onShow: () => {
						clickCount++;
					},
				})}
			>
				Click to track opens ({clickCount})
			</button>
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Programmatic Open</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Control the popover state from outside using the <code>open</code> option
		</p>

		<div class="flex gap-4 items-center flex-wrap">
			<button
				class="px-4 py-2 bg-violet-500 text-white rounded"
				onclick={() => (isOpen = !isOpen)}
			>
				{isOpen ? "Close" : "Open"} Programmatically
			</button>

			<span
				class="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 rounded cursor-default"
				use:popover={() => ({
					content: "Controlled by external state!",
					position: "bottom",
					class: "p-3 bg-white dark:bg-neutral-800",
					open: isOpen,
					onHide: () => (isOpen = false),
				})}
			>
				Anchor (state: {isOpen ? "open" : "closed"})
			</span>
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Positions</h2>

		<div class="flex gap-3 flex-wrap items-center justify-center py-16">
			{#each ["top", "top-left", "top-right", "top-span-left", "top-span-right", "bottom", "bottom-left", "bottom-right", "bottom-span-left", "bottom-span-right", "left", "right"] as pos (pos)}
				{@const position = pos as PopoverPosition}
				<button
					class="px-3 py-1 bg-neutral-200 dark:bg-neutral-700 rounded text-sm"
					use:popover={() => ({
						content: `Position: ${position}`,
						position,
						class: "p-2 text-sm bg-white dark:bg-neutral-800",
					})}
				>
					{pos}
				</button>
			{/each}
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Custom Styling</h2>

		<div class="flex gap-4 flex-wrap">
			<button
				class="px-4 py-2 bg-pink-500 text-white rounded"
				use:popover={() => ({
					content: "Custom styled popover",
					class:
						"bg-pink-100 dark:bg-pink-900 text-pink-900 dark:text-pink-100 p-4 rounded-lg border-2 border-pink-500",
				})}
			>
				Pink Theme
			</button>

			<button
				class="px-4 py-2 bg-amber-500 text-white rounded"
				use:popover={() => ({
					content: {
						html: "<div class='p-4 space-y-2'><h3 class='font-bold'>Card Title</h3><p class='text-sm opacity-75'>This looks like a card component inside the popover.</p></div>",
					},
					class:
						"bg-amber-50 dark:bg-amber-900 text-amber-900 dark:text-amber-100 rounded-xl shadow-xl border-0",
				})}
			>
				Card Style
			</button>
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Configuration Options</h2>

		<div class="flex gap-4 flex-wrap">
			<button
				class="px-4 py-2 bg-red-500 text-white rounded"
				use:popover={() => ({
					content: "Press Escape or click outside to close",
					position: "bottom",
					class: "p-3 bg-white dark:bg-neutral-800",
					closeOnEscape: true,
					closeOnClickOutside: true,
				})}
			>
				Default Close Behavior
			</button>

			<button
				class="px-4 py-2 bg-red-500 text-white rounded"
				use:popover={() => ({
					content: "Only closes by clicking the button again",
					position: "bottom",
					class: "p-3 bg-white dark:bg-neutral-800",
					closeOnEscape: false,
					closeOnClickOutside: false,
				})}
			>
				No Auto-Close
			</button>
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Offset</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Control the spacing between popover and anchor (default: 0.25rem)
		</p>

		<div class="flex gap-4 flex-wrap">
			<button
				class="px-4 py-2 bg-teal-500 text-white rounded"
				use:popover={() => ({
					content: "No offset (0)",
					position: "bottom",
					offset: "0",
					class: "p-3 bg-white dark:bg-neutral-800",
				})}
			>
				No Offset
			</button>

			<button
				class="px-4 py-2 bg-teal-500 text-white rounded"
				use:popover={() => ({
					content: "Default offset (0.25rem)",
					position: "bottom",
					class: "p-3 bg-white dark:bg-neutral-800",
				})}
			>
				Default (0.25rem)
			</button>

			<button
				class="px-4 py-2 bg-teal-500 text-white rounded"
				use:popover={() => ({
					content: "Large offset (1rem)",
					position: "bottom",
					offset: "1rem",
					class: "p-3 bg-white dark:bg-neutral-800",
				})}
			>
				Large (1rem)
			</button>
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Close Others</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Only one popover can be open at a time in this group
		</p>

		<div class="flex gap-4 flex-wrap">
			<button
				class="px-4 py-2 bg-orange-500 text-white rounded"
				use:popover={() => ({
					content: "Popover A - opening this closes others",
					position: "bottom",
					closeOthers: true,
					class: "p-3 bg-white dark:bg-neutral-800",
				})}
			>
				Popover A
			</button>

			<button
				class="px-4 py-2 bg-orange-500 text-white rounded"
				use:popover={() => ({
					content: "Popover B - opening this closes others",
					position: "bottom",
					closeOthers: true,
					class: "p-3 bg-white dark:bg-neutral-800",
				})}
			>
				Popover B
			</button>

			<button
				class="px-4 py-2 bg-orange-500 text-white rounded"
				use:popover={() => ({
					content: "Popover C - opening this closes others",
					position: "bottom",
					closeOthers: true,
					class: "p-3 bg-white dark:bg-neutral-800",
				})}
			>
				Popover C
			</button>
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Force Fallback Mode</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Test the centered modal fallback even when CSS Anchor Positioning is supported
		</p>

		<div class="flex gap-4 flex-wrap">
			<button
				class="px-4 py-2 bg-rose-500 text-white rounded"
				use:popover={() => ({
					content: "This popover uses the fallback centered modal mode",
					forceFallback: true,
					class: "p-4 bg-white dark:bg-neutral-800",
				})}
			>
				Centered Modal (forceFallback)
			</button>

			<button
				class="px-4 py-2 bg-rose-500 text-white rounded"
				use:popover={() => ({
					content: {
						html: "<div class='p-2 space-y-2'><h3 class='font-bold'>Fallback Mode</h3><p class='text-sm'>With backdrop overlay. Click outside or press Escape to close.</p></div>",
					},
					forceFallback: true,
					class: "bg-white dark:bg-neutral-800 rounded-lg",
				})}
			>
				With HTML Content
			</button>

			<button
				class="px-4 py-2 bg-rose-500 text-white rounded"
				use:popover={() => ({
					content: "No backdrop in fallback mode",
					forceFallback: true,
					showBackdrop: false,
					class: "p-4 bg-white dark:bg-neutral-800",
				})}
			>
				No Backdrop
			</button>
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Combined with Tooltip</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Popover and tooltip can be used on the same element thanks to the anchor-name helper
		</p>

		<div class="flex gap-4 flex-wrap">
			<button
				class="px-4 py-2 bg-cyan-500 text-white rounded"
				aria-label="Hover for tooltip, click for popover"
				use:tooltip
				use:popover={() => ({
					content: "This is a popover (click triggered)",
					position: "bottom",
					class: "p-3 bg-white dark:bg-neutral-800",
				})}
			>
				Tooltip + Popover
			</button>

			<button
				class="px-4 py-2 bg-cyan-500 text-white rounded"
				use:tooltip={() => ({
					content: "Helpful tooltip text",
					position: "top",
				})}
				use:popover={() => ({
					content: {
						html: "<div class='p-2'><strong>Rich popover content</strong><p class='text-sm mt-1'>Click to see, hover for tooltip</p></div>",
					},
					position: "bottom",
					class: "bg-white dark:bg-neutral-800",
				})}
			>
				Custom Both
			</button>

			<button
				class="px-4 py-2 bg-cyan-500 text-white rounded"
				use:tooltip={() => ({
					content: "Quick info on hover",
					position: "left",
				})}
				use:popover={() => ({
					content: "Detailed popover on click",
					trigger: "click",
					position: "right",
					class: "p-3 bg-white dark:bg-neutral-800",
				})}
			>
				Left Tooltip / Right Popover
			</button>
		</div>
	</section>
</div>
