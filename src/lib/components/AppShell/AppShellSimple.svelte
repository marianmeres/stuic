<script lang="ts" module>
	import { setContext, type Snippet } from "svelte";
	import { twMerge } from "../../utils/tw-merge.js";

	export interface Props {
		class?: string;
		//
		headerClass?: string;
		railClass?: string;
		asideClass?: string;
		mainClass?: string;
		// header support style as well (for iOS theming, seem to be better supported)
		headerStyle?: string;
		//
		rail?: Snippet;
		header?: Snippet;
		aside?: Snippet;
		children?: Snippet;
		//
		elRail?: HTMLElement;
		elHeader?: HTMLElement;
		elAside?: HTMLElement;
		elMain?: HTMLElement;
	}

	export const APP_SHELL_SIMPLE_MAIN_WIDTH = Symbol("APP_SHELL_SIMPLE_MAIN_WIDTH");
</script>

<script lang="ts">
	let {
		class: classProp,
		//
		headerClass,
		railClass,
		asideClass,
		mainClass,
		//
		headerStyle = "",
		//
		rail,
		header,
		aside,
		children,
		//
		elRail = $bindable(),
		elHeader = $bindable(),
		elAside = $bindable(),
		elMain = $bindable(),
	}: Props = $props();

	let headerHeight = $state(0);

	// pragmatic use case...
	let mainWidth: number = $state(0);
	setContext(APP_SHELL_SIMPLE_MAIN_WIDTH, {
		get current() {
			return mainWidth;
		},
	});
</script>

{#if header}
	<header
		bind:this={elHeader}
		bind:clientHeight={headerHeight}
		data-shell="header"
		class={twMerge("sticky top-0 z-10", headerClass)}
		style={headerStyle}
	>
		{@render header()}
	</header>
{/if}

<div class={twMerge("flex", classProp)}>
	{#if rail}
		<div
			bind:this={elRail}
			data-shell="rail"
			style:top="{headerHeight}px"
			style:height="calc(100dvh - {headerHeight}px)"
			class={twMerge(
				"sticky shrink-0",
				"flex flex-col items-center",
				"overflow-x-hidden overflow-y-auto",
				"scrollbar-thin",
				railClass
			)}
		>
			{@render rail()}
		</div>
	{/if}

	{#if aside}
		<aside
			bind:this={elAside}
			data-shell="aside"
			style:top="{headerHeight}px"
			style:height="calc(100dvh - {headerHeight}px)"
			class={twMerge(
				"sticky shrink-0",
				"flex flex-col items-center",
				"overflow-x-hidden overflow-y-auto",
				"scrollbar-thin",
				asideClass
			)}
		>
			{@render aside()}
		</aside>
	{/if}

	<main
		bind:this={elMain}
		data-shell="main"
		class={twMerge("flex-1 max-w-full", mainClass)}
		bind:offsetWidth={mainWidth}
	>
		{@render children?.()}
	</main>
</div>

<style>
	.scrollbar-thin {
		scrollbar-width: thin;
		/* scrollbar-gutter: stable; */
	}
</style>
