<script lang="ts" module>
	import type { Snippet } from "svelte";

	export interface ImageCyclerImage {
		src: string;
		alt?: string;
		title?: string;
		description?: string;
		[key: string]: unknown;
	}

	export type ImageCyclerFit = "cover" | "contain" | "fill";

	export interface Props {
		images: ImageCyclerImage[];
		fit?: ImageCyclerFit;
		minWait?: number;
		transitionDuration?: number;
		onclick?: (image: ImageCyclerImage, index: number) => void;
		title?: Snippet<[{ image: ImageCyclerImage; index: number; onclick: (() => void) | undefined }]>;
		description?: Snippet<[{ image: ImageCyclerImage; index: number; onclick: (() => void) | undefined }]>;
		unstyled?: boolean;
		class?: string;
		el?: HTMLElement;
	}
</script>

<script lang="ts">
	import { fade } from "svelte/transition";
	import { preloadImg } from "../../utils/preload-img.js";
	import { twMerge } from "../../utils/tw-merge.js";

	let {
		images,
		fit = "cover",
		minWait = 3000,
		transitionDuration = 500,
		onclick,
		title,
		description,
		unstyled = false,
		class: classProp,
		el = $bindable(),
	}: Props = $props();

	let currentIndex = $state(0);

	let _class = $derived(unstyled ? classProp : twMerge("stuic-image-cycler", classProp));

	let _onclick = $derived(onclick ? () => onclick(images[currentIndex], currentIndex) : undefined);

	$effect(() => {
		const idx = currentIndex;
		if (images.length <= 1) return;
		let cancelled = false;
		const nextIndex = (idx + 1) % images.length;
		Promise.all([
			preloadImg({ src: images[nextIndex].src }),
			new Promise<void>((resolve) => setTimeout(resolve, minWait)),
		]).then(() => {
			if (!cancelled) currentIndex = nextIndex;
		});
		return () => {
			cancelled = true;
		};
	});
</script>

<div bind:this={el} class={_class}>
	{#key currentIndex}
		<div
			class="stuic-image-cycler-bg"
			data-fit={!unstyled ? fit : undefined}
			style:background-image="url({images[currentIndex].src})"
			role="img"
			aria-label={images[currentIndex].alt ?? images[currentIndex].title ?? ""}
			in:fade={{ duration: transitionDuration }}
			out:fade={{ duration: transitionDuration }}
		></div>
	{/key}

	{#if title || description}
		{#key currentIndex}
			<div
				class="stuic-image-cycler-meta"
				in:fade={{ duration: transitionDuration }}
				out:fade={{ duration: transitionDuration }}
			>
				{#if title}
					{@render title({ image: images[currentIndex], index: currentIndex, onclick: _onclick })}
				{/if}
				{#if description}
					{@render description({ image: images[currentIndex], index: currentIndex, onclick: _onclick })}
				{/if}
			</div>
		{/key}
	{/if}
</div>
