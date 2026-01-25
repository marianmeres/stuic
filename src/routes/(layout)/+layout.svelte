<script lang="ts">
	let { children } = $props();
	import "../../app.css";
	import { page } from "$app/state";
	import { ColorScheme, ColorSchemeLocal, Breakpoint, ucfirst } from "$lib/index.js";
	import { base } from "$app/paths";
	import { themes, themeNames } from "./theme-preview/themes-list.js";
	import { browser } from "$app/environment";

	const THEME_STORAGE_KEY = "stuic-selected-theme";

	let theme = $state(ColorScheme.getLocalValue(ColorScheme.LIGHT));

	let selectedTheme = $state(
		browser ? localStorage.getItem(THEME_STORAGE_KEY) || "stone" : "stone"
	);
	let themeCss = $derived(themes[selectedTheme]);

	$effect(() => {
		if (browser) {
			localStorage.setItem(THEME_STORAGE_KEY, selectedTheme);
		}
	});

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

<svelte:head>
	{@html `<style id="dynamic-theme">${themeCss}</style>`}
</svelte:head>

<ColorSchemeLocal />

<div class="flex flex-col min-h-screen">
	<header class={["p-4 flex items-center bg-stone-200 dark:bg-stone-950"]}>
		<div class="flex-1">
			<a class="underline" href="/">UI home</a>
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

			<select
				bind:value={selectedTheme}
				class="mr-2 px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
			>
				{#each themeNames as t}
					<option value={t}>{t}</option>
				{/each}
			</select>

			<button onclick={toggleTheme}>
				{theme === ColorScheme.LIGHT ? ColorScheme.DARK : ColorScheme.LIGHT}
			</button>
		</div>
	</header>

	<div class="p-4 flex-1 flex flex-col">
		{@render children()}
	</div>
</div>
