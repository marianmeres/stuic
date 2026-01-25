<script lang="ts">
	import {
		ThemePreview,
		ColorScheme,
		AlertConfirmPrompt,
		AlertConfirmPromptStack,
		Notifications,
		NotificationsStack,
	} from "$lib/index.js";

	import { themes, themeNames } from "./themes-list.js";

	let selectedTheme = $state("stone");
	let themeCss = $derived(themes[selectedTheme]);
	let colorScheme = $state(ColorScheme.getLocalValue());

	const notifications = new NotificationsStack([], {
		disposeInterval: 1_000,
	});

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

	const acp = new AlertConfirmPromptStack();
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

	<ThemePreview {acp} {notifications} />
</div>

<AlertConfirmPrompt {acp} />

<Notifications {notifications} />
