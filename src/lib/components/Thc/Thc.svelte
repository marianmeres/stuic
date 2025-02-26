<script lang="ts" module>
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

	const _is = (m: any) => typeof m === "string" && m;

	export function isTHCNotEmpty(m: any) {
		return _is(m) || _is(m?.text) || _is(m?.html) || m?.component;
	}
</script>

<script lang="ts">
	let {
		thc,
		forceAsHtml = false,
		allowCastToStringFallback = true,
		...rest
	}: {
		thc: THC;
		forceAsHtml?: boolean;
		allowCastToStringFallback?: boolean;
	} = $props();
</script>

{#if typeof thc === "string"}
	{#if forceAsHtml}{@html thc}{:else}{thc}{/if}
{:else if "text" in thc && thc.text}
	{#if forceAsHtml}{@html thc.text}{:else}{thc.text}{/if}
{:else if "html" in thc && thc.html}
	{@html thc.html}
{:else if typeof thc === "object" && "component" in thc}
	<thc.component {...thc.props || {}} {...rest || {}} />
{:else if allowCastToStringFallback}
	<!-- cast to string as the last resort (if enabled) -->
	{thc}
{:else}
	<!-- silence -->
{/if}
