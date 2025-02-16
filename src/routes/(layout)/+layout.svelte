<script>
	let { children } = $props();
	import "../../app.css";
	import { ColorScheme } from "../../lib/components/ColorScheme/color-scheme.js";
	import LocalColorScheme from "../../lib/components/ColorScheme/ColorSchemeLocal.svelte";
	import { page } from "$app/state";
	import { getViewport } from "$lib/index.js";

	let theme = $state(ColorScheme.getLocalValue(ColorScheme.LIGHT));

	const toggleTheme = () => {
		ColorScheme.toggle();
		theme = ColorScheme.getLocalValue();
	};

	const viewport = getViewport();
</script>

<LocalColorScheme />

<header
	class="
		p-4 flex items-center
		bg-neutral-200
		dark:bg-neutral-950
	"
>
	<div class="flex-1">
		<a class="underline" href="/">UI home</a>
		{#if page?.route?.id !== "/"}
			<span class="opacity-50">&rarr;&nbsp;{page.route.id?.slice(1)}</span>
		{/if}
	</div>
	<div>
		<span class="mr-4 opacity-50">
			{viewport.breakpoint.__current__ || "none"}
		</span>

		<button onclick={toggleTheme}>
			{theme === ColorScheme.LIGHT ? ColorScheme.DARK : ColorScheme.LIGHT}
		</button>
	</div>
</header>

<div class="p-4">
	{@render children()}
</div>
