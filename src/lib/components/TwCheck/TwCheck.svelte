<script lang="ts" module>
	import type { Snippet } from "svelte";

	export interface Props {
		class?: string;
		children?: Snippet;
		theme?: string;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/index.js";

	let { class: classProp, children, theme }: Props = $props();

	// Responsive classes demonstrate Tailwind is working:
	// - Font size changes: text-base -> sm:text-2xl
	// Note: border styles are in component CSS to avoid Vite HMR timing issues
	const _default = `
		stuic-twcheck
		inline-block
		text-base sm:text-2xl
		sm:border-2 border-teal-400
	`;

	const _buildTheme = (theme?: string) => {
		if (!theme) return "";
		return [
			`--stuic-twcheck-bg: var(--color-${theme}-600)`,
			`--stuic-twcheck-text: var(--color-${theme}-100, var(--color-white))`,
		].join(";");
	};
</script>

<div class={twMerge(_default, classProp)} style={_buildTheme(theme)}>
	{@render children?.()}
</div>
