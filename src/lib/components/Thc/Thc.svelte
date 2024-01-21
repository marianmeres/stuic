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
</script>

<script lang="ts">
	// pragmatic shortcut to allow string to be rendered as html without
	// the need to wrap it as { html: ... }
	export let forceAsHtml = false;
	export let thc: THC;
</script>

{#if typeof thc === 'string'}
	{#if forceAsHtml}{@html thc}{:else}{thc}{/if}
{:else if thc?.text}
	{#if forceAsHtml}{@html thc.text}{:else}{thc.text}{/if}
{:else if thc?.html}
	{@html thc.html}
{:else if thc?.component}
	<svelte:component this={thc.component} {...thc?.props || {}} />
{:else}
	<!-- cast to string as the last resort -->
	{thc}
{/if}
