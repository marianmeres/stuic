<script lang="ts">
	import type { Snippet } from "svelte";
	import "./index.css";
	import { twMerge } from "tailwind-merge";

	let {
		class: classProp,
		children,
		theme,
	}: {
		class?: string;
		children?: Snippet;
		theme?: string;
	} = $props();

	const _default = `
		stuic-twcheck bg-twcheck-bg 
		inline-block px-2 
		text-yellow-300 sm:text-white 
		text-base sm:text-2xl
		sm:border-2 border-teal-400
	`;

	const _buildTheme = (theme?: string) => {
		// simulating missing css var
		return theme
			? `--color-twcheck-bg: var(--color-foo-bar-baz, var(--color-${theme}-600));`
			: "";
	};
</script>

<div class={twMerge(_default, classProp)} style={_buildTheme(theme)}>
	{@render children?.()}
</div>
