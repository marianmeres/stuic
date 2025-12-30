<script lang="ts" module>
	import type { Snippet, Component } from "svelte";

	// THC = Text or Html or Component

	interface WithComponent {
		component: Component<any>;
		props?: Record<string, any>;
	}

	interface WithText {
		text: string;
	}

	interface WithHtml {
		html: string;
	}

	interface WithSnippet {
		snippet: Snippet;
	}

	type AsSnippet = Snippet;

	export type THC =
		| string
		| WithText
		| WithHtml
		| WithComponent
		| WithSnippet
		| AsSnippet;

	export interface Props extends Record<string, any> {
		thc: THC;
		forceAsHtml?: boolean;
		allowCastToStringFallback?: boolean;
	}

	const _is = (m: THC | undefined | null): m is string => typeof m === "string" && !!m;

	export function isTHCNotEmpty(m: THC | Snippet<any> | undefined | null): boolean {
		if (!m) return false;
		return (
			_is(m) ||
			_is((m as WithText)?.text) ||
			_is((m as WithHtml)?.html) ||
			!!(m as WithComponent)?.component
		);
	}

	/**
	 * Will try to extract textual (or html) content from THC
	 */
	export function getTHCStringContent(m: THC | undefined | null): string {
		if (!m) return "";
		if (typeof m === "string") return m;
		return (m as WithHtml)?.html || (m as WithText)?.text || "";
	}
</script>

<script lang="ts">
	let {
		thc,
		forceAsHtml = false,
		allowCastToStringFallback = true,
		...rest
	}: Props = $props();
</script>

{#if typeof thc === "string"}
	{#if forceAsHtml}{@html thc}{:else}{thc}{/if}
{:else if "text" in thc && thc.text}
	{#if forceAsHtml}{@html thc.text}{:else}{thc.text}{/if}
{:else if "html" in thc && thc.html}
	{@html thc.html}
{:else if typeof thc === "function"}
	{@render thc()}
{:else if typeof thc === "object" && "snippet" in thc}
	{@render thc.snippet()}
{:else if typeof thc === "object" && "component" in thc}
	<thc.component {...thc.props || {}} {...rest || {}} />
{:else if allowCastToStringFallback}
	<!-- cast to string as the last resort (if enabled) -->
	{thc}
{:else}
	<!-- silence -->
{/if}
