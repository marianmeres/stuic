<script lang="ts">
	let { children } = $props();
	import "../../app.css";
	import { page } from "$app/state";
	import { ColorScheme, ColorSchemeLocal, Breakpoint, ucfirst } from "$lib/index.js";
	import { base } from "$app/paths";

	let theme = $state(ColorScheme.getLocalValue(ColorScheme.LIGHT));

	const toggleTheme = () => {
		ColorScheme.toggle();
		theme = ColorScheme.getLocalValue();
	};

	let route = $derived(page.route.id?.slice(1).replace(/\([^)]+\)\//, ""));

	let breakpoint = new Breakpoint();

	let segments: undefined | string[] = $derived(
		page?.route.id
			?.split("/")
			.filter(Boolean)
			.filter((v) => !v.startsWith("("))
	);
</script>

<ColorSchemeLocal />

<header class={["p-4 flex items-center bg-neutral-200 dark:bg-neutral-950"]}>
	<div class="flex-1">
		<a class="underline" href="/">UI home</a>
		<!-- quick-n-dirty -->
		<span class="space-x-1">
			{#each segments || [] as seg, i}
				{@const href = [base, seg].join("/")}
				{#if i === (segments?.length || 0) - 1}
					&rarr;&nbsp;<span>{ucfirst(seg)}</span>
				{:else}
					&rarr;&nbsp;<a {href} class="underline">{ucfirst(seg)}</a>
				{/if}
			{/each}
		</span>
	</div>
	<div>
		<span class="mr-4 opacity-50">
			{breakpoint.current}
		</span>

		<button onclick={toggleTheme}>
			{theme === ColorScheme.LIGHT ? ColorScheme.DARK : ColorScheme.LIGHT}
		</button>
	</div>
</header>

<div class="p-4">
	{@render children()}
</div>
