<script lang="ts" module>
	import type { Snippet } from "svelte";

	export const ACCORDION_CTX_KEY = Symbol("stuic-accordion");

	export interface AccordionContext {
		exclusive: boolean;
		register: (id: symbol, closeFn: () => void) => void;
		unregister: (id: symbol) => void;
		notifyOpen: (id: symbol) => void;
	}

	export interface Props {
		/** Only one item open at a time */
		exclusive?: boolean;
		/** Container class */
		class?: string;
		/** Strip all component styling */
		unstyled?: boolean;
		/** Inline styles (for CSS variable overrides) */
		style?: string;
		/** Bind reference to container element */
		el?: HTMLDivElement;
		/** AccordionItem children */
		children: Snippet;
	}
</script>

<script lang="ts">
	import { setContext } from "svelte";
	import { SvelteMap } from "svelte/reactivity";
	import { twMerge } from "../../utils/tw-merge.js";

	let {
		exclusive = false,
		class: classProp,
		unstyled = false,
		style,
		el = $bindable(),
		children,
	}: Props = $props();

	// Registry of items and their close callbacks
	const items = new SvelteMap<symbol, () => void>();

	const ctx: AccordionContext = {
		get exclusive() {
			return exclusive;
		},
		register(id, closeFn) {
			items.set(id, closeFn);
		},
		unregister(id) {
			items.delete(id);
		},
		notifyOpen(id) {
			if (exclusive) {
				for (const [itemId, closeFn] of items) {
					if (itemId !== id) closeFn();
				}
			}
		},
	};

	setContext(ACCORDION_CTX_KEY, ctx);

	let _class = $derived(unstyled ? classProp : twMerge("stuic-accordion", classProp));
</script>

<div bind:this={el} class={_class} {style}>
	{@render children()}
</div>
