<script lang="ts" module>
	import type { Snippet, Component } from "svelte";

	/**
	 * Configuration for rendering a Svelte component.
	 */
	interface WithComponent {
		component: Component<any>;
		props?: Record<string, any>;
	}

	/**
	 * Configuration for rendering plain text.
	 */
	interface WithText {
		text: string;
	}

	/**
	 * Configuration for rendering raw HTML.
	 */
	interface WithHtml {
		html: string;
	}

	/**
	 * Configuration for rendering a Svelte snippet.
	 */
	interface WithSnippet {
		snippet: Snippet;
	}

	type AsSnippet = Snippet;

	/**
	 * Flexible content type that accepts Text, Html, or Component (THC).
	 *
	 * Used throughout stuic components to allow flexible content rendering.
	 * Accepts multiple formats:
	 * - Plain string (rendered as text or HTML based on component settings)
	 * - `{ text: string }` - explicit plain text
	 * - `{ html: string }` - explicit HTML (rendered with {@html})
	 * - `{ component: Component, props?: object }` - Svelte component
	 * - `{ snippet: Snippet }` - Svelte snippet
	 * - Svelte snippet function directly
	 *
	 * @example
	 * ```ts
	 * // Plain string
	 * const label: THC = "Click me";
	 *
	 * // HTML content
	 * const label: THC = { html: "<strong>Bold</strong> text" };
	 *
	 * // Component
	 * const label: THC = { component: MyIcon, props: { size: 24 } };
	 * ```
	 */
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

	/**
	 * Checks if a THC value has renderable content.
	 *
	 * @param m - The THC value to check
	 * @returns `true` if the value contains non-empty text, html, or a component
	 *
	 * @example
	 * ```ts
	 * isTHCNotEmpty("Hello");           // true
	 * isTHCNotEmpty({ text: "Hi" });    // true
	 * isTHCNotEmpty("");                // false
	 * isTHCNotEmpty(null);              // false
	 * ```
	 */
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
	 * Extracts the string content from a THC value.
	 *
	 * Returns the text or html string from the THC, or empty string if not available.
	 * Does not extract content from component or snippet types.
	 *
	 * @param m - The THC value to extract content from
	 * @returns The extracted string content, or empty string
	 *
	 * @example
	 * ```ts
	 * getTHCStringContent("Hello");           // "Hello"
	 * getTHCStringContent({ text: "Hi" });    // "Hi"
	 * getTHCStringContent({ html: "<b>X</b>" }); // "<b>X</b>"
	 * getTHCStringContent(null);              // ""
	 * ```
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
