<script lang="ts">
	import { ThemePreview, ColorScheme } from "$lib/index.js";

	// Import all theme CSS files as raw strings
	import neutralCss from "$lib/themes/neutral.css?raw";
	import grayCss from "$lib/themes/gray.css?raw";
	import rainbowCss from "$lib/themes/rainbow.css?raw";
	import indigoAmberCss from "$lib/themes/indigo-amber.css?raw";
	import tealRoseCss from "$lib/themes/teal-rose.css?raw";
	import violetLimeCss from "$lib/themes/violet-lime.css?raw";
	import blueOrangeCss from "$lib/themes/blue-orange.css?raw";
	import emeraldPinkCss from "$lib/themes/emerald-pink.css?raw";
	import skyAmberCss from "$lib/themes/sky-amber.css?raw";
	import fuchsiaEmeraldCss from "$lib/themes/fuchsia-emerald.css?raw";
	import slateCyanCss from "$lib/themes/slate-cyan.css?raw";
	import purpleYellowCss from "$lib/themes/purple-yellow.css?raw";
	import cyanRedCss from "$lib/themes/cyan-red.css?raw";
	import roseTealCss from "$lib/themes/rose-teal.css?raw";
	import redCyanCss from "$lib/themes/red-cyan.css?raw";
	import cyanSlateCss from "$lib/themes/cyan-slate.css?raw";
	import pinkEmeraldCss from "$lib/themes/pink-emerald.css?raw";

	const themes: Record<string, string> = {
		neutral: neutralCss,
		gray: grayCss,
		rainbow: rainbowCss,
		"indigo-amber": indigoAmberCss,
		"teal-rose": tealRoseCss,
		"rose-teal": roseTealCss,
		"violet-lime": violetLimeCss,
		"blue-orange": blueOrangeCss,
		"emerald-pink": emeraldPinkCss,
		"pink-emerald": pinkEmeraldCss,
		"sky-amber": skyAmberCss,
		"fuchsia-emerald": fuchsiaEmeraldCss,
		"slate-cyan": slateCyanCss,
		"cyan-slate": cyanSlateCss,
		"purple-yellow": purpleYellowCss,
		"cyan-red": cyanRedCss,
		"red-cyan": redCyanCss,
	};

	const themeNames = Object.keys(themes);

	let selectedTheme = $state("neutral");
	let themeCss = $derived(themes[selectedTheme]);
	let colorScheme = $state(ColorScheme.getLocalValue());

	function toggleColorScheme() {
		ColorScheme.toggle();
		colorScheme = ColorScheme.getLocalValue();
	}

	function nextTheme() {
		const idx = themeNames.indexOf(selectedTheme);
		selectedTheme = themeNames[(idx + 1) % themeNames.length];
	}

	function prevTheme() {
		const idx = themeNames.indexOf(selectedTheme);
		selectedTheme = themeNames[(idx - 1 + themeNames.length) % themeNames.length];
	}
</script>

<svelte:head>
	{@html `<style id="dynamic-theme">${themeCss}</style>`}
</svelte:head>

<div class="space-y-6">
	<div class="flex flex-wrap items-center gap-4">
		<h1 class="text-2xl font-bold">Theme Preview</h1>

		<!-- Theme selector -->
		<div class="flex items-center gap-2">
			<button
				class="px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
				onclick={prevTheme}
			>
				←
			</button>

			<select
				bind:value={selectedTheme}
				class="px-3 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
			>
				{#each themeNames as theme}
					<option value={theme}>{theme}</option>
				{/each}
			</select>

			<button
				class="px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
				onclick={nextTheme}
			>
				→
			</button>
		</div>

		<!-- Dark/light toggle -->
		<button
			class="px-3 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
			onclick={toggleColorScheme}
		>
			{colorScheme === "light" ? "🌙 Dark" : "☀️ Light"}
		</button>
	</div>

	<p class="text-sm text-neutral-600 dark:text-neutral-400">
		Select a theme from the dropdown and toggle between light/dark modes to preview all
		design tokens in action.
	</p>

	<ThemePreview />

	<!-- Quick theme grid for fast switching -->
	<div class="mt-8">
		<h2 class="text-lg font-semibold mb-3">Quick Theme Switch</h2>
		<div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-2">
			{#each themeNames as theme}
				<button
					class="px-2 py-1.5 text-xs rounded border transition-colors {selectedTheme ===
					theme
						? 'border-blue-500 bg-blue-50 dark:bg-blue-950 font-medium'
						: 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'}"
					onclick={() => (selectedTheme = theme)}
				>
					{theme}
				</button>
			{/each}
		</div>
	</div>
</div>
