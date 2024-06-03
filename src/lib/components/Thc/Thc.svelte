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

	export let transform: undefined | ((s: string) => string) = undefined;

	const _transform = (s: any): string =>
		typeof transform === 'function' ? transform(s) : s;
</script>

{#if typeof thc === 'string'}
	{#if forceAsHtml}{@html _transform(thc)}{:else}{_transform(thc)}{/if}
{:else if thc?.text}
	{#if forceAsHtml}{@html _transform(thc.text)}{:else}{_transform(thc.text)}{/if}
{:else if thc?.html}
	{@html _transform(thc.html)}
{:else if thc?.component}
	<svelte:component this={thc.component} {...thc?.props || {}} {...$$restProps || {}} />
{:else if allowCastToStringFallback}
	<!-- cast to string as the last resort (if enabled) -->
	{_transform(thc)}
{:else}
	<!-- silence -->
{/if}
