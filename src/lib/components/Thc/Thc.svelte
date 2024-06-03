<script lang="ts" context="module">
	// THC = Text or Html or Component

	interface WithComponent {
		component: any;
		props?: Record<string, any>;
	}

	interface WithText {
		text: string;
	}

	interface WithHtml {
		html: string;
	}

	//
	export type THC = string | WithText | WithHtml | WithComponent;

	const _is = (m: any) => typeof m === 'string' && m;

	export const isTHCNotEmpty = (m: any) =>
		_is(m) || _is(m?.text) || _is(m?.html) || m?.component;
</script>

<script lang="ts">
	// the content
	export let thc: THC;

	// pragmatic shortcut to allow string to be rendered as html without
	// the need to wrap it as { html: ... }
	export let forceAsHtml = false;

	//
	export let allowCastToStringFallback = true;

	export let filter: undefined | ((s: string) => string) = undefined;

	const _filter = (s: string): string => (typeof filter === 'function' ? filter(s) : s);
</script>

{#if typeof thc === 'string'}
	{#if forceAsHtml}{@html _filter(thc)}{:else}{_filter(thc)}{/if}
{:else if thc?.text}
	{#if forceAsHtml}{@html _filter(thc.text)}{:else}{_filter(thc.text)}{/if}
{:else if thc?.html}
	{@html _filter(thc.html)}
{:else if thc?.component}
	<svelte:component this={thc.component} {...thc?.props || {}} {...$$restProps || {}} />
{:else if allowCastToStringFallback}
	<!-- cast to string as the last resort (if enabled) -->
	{_filter(thc)}
{:else}
	<!-- silence -->
{/if}
