<script lang="ts" module>
	import type { Snippet } from "svelte";

	export interface Props {
		/** Expanded state (bindable) */
		open?: boolean;
		/** Prevent toggling */
		disabled?: boolean;
		/** Item wrapper class */
		class?: string;
		/** Trigger button class */
		classTrigger?: string;
		/** Content panel class */
		classContent?: string;
		/** Strip all component styling */
		unstyled?: boolean;
		/** Inline styles (for CSS variable overrides) */
		style?: string;
		/** Bind reference to item element */
		el?: HTMLDivElement;
		/** Header/trigger content */
		trigger: Snippet;
		/** Panel content */
		children: Snippet;
	}
</script>

<script lang="ts">
	import { getContext } from "svelte";
	import { twMerge } from "../../utils/tw-merge.js";
	import {
		ACCORDION_CTX_KEY,
		type AccordionContext,
	} from "./Accordion.svelte";

	let {
		open = $bindable(false),
		disabled = false,
		class: classProp,
		classTrigger,
		classContent,
		unstyled = false,
		style,
		el = $bindable(),
		trigger,
		children,
	}: Props = $props();

	const itemId = Symbol();
	const ctx = getContext<AccordionContext | undefined>(ACCORDION_CTX_KEY);

	// Generate unique IDs for aria linking
	const uid = Math.random().toString(36).slice(2, 9);
	const triggerId = `stuic-accordion-trigger-${uid}`;
	const panelId = `stuic-accordion-panel-${uid}`;

	// Register with parent accordion context
	$effect(() => {
		ctx?.register(itemId, () => {
			open = false;
		});
		return () => ctx?.unregister(itemId);
	});

	function toggle() {
		if (disabled) return;
		open = !open;
		if (open) {
			ctx?.notifyOpen(itemId);
		}
	}

	let _class = $derived(
		unstyled ? classProp : twMerge("stuic-accordion-item", classProp)
	);
	let _classTrigger = $derived(
		unstyled ? classTrigger : twMerge("stuic-accordion-trigger", classTrigger)
	);
	let _classContent = $derived(
		unstyled ? classContent : twMerge("stuic-accordion-content", classContent)
	);
</script>

<div
	bind:this={el}
	class={_class}
	data-open={open}
	data-disabled={disabled || undefined}
	{style}
>
	<button
		type="button"
		id={triggerId}
		class={_classTrigger}
		aria-expanded={open}
		aria-controls={panelId}
		{disabled}
		onclick={toggle}
	>
		<span class="flex-1 text-left">
			{@render trigger()}
		</span>
		<svg
			class="stuic-accordion-chevron"
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<polyline points="6 9 12 15 18 9"></polyline>
		</svg>
	</button>
	<div
		id={panelId}
		class={_classContent}
		role="region"
		aria-labelledby={triggerId}
	>
		<div class="stuic-accordion-content-inner">
			<div class="stuic-accordion-content-body">
				{@render children()}
			</div>
		</div>
	</div>
</div>
