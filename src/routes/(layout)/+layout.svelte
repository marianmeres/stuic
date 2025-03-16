<script>
	let { children } = $props();
	import "../../app.css";
	import { page } from "$app/state";
	import { ColorScheme, ColorSchemeLocal, Breakpoint } from "$lib/index.js";

	let theme = $state(ColorScheme.getLocalValue(ColorScheme.LIGHT));

	const toggleTheme = () => {
		ColorScheme.toggle();
		theme = ColorScheme.getLocalValue();
	};

	let route = $derived(page.route.id?.slice(1).replace(/\([^)]+\)\//, ""));

	let breakpoint = new Breakpoint();
</script>

<ColorSchemeLocal />

<header
	class="
		p-4 flex items-center
		bg-neutral-200 dark:bg-neutral-950
	"
>
	<div class="flex-1">
		<a class="underline" href="/">UI home</a>
		{#if page?.route?.id !== "/"}
			<span class="opacity-50">
				&rarr;&nbsp;{route}
			</span>
		{/if}
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
