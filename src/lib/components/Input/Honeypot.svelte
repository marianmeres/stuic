<script lang="ts" module>
	import type { HTMLInputAttributes } from "svelte/elements";

	export interface Props extends Omit<HTMLInputAttributes, "value" | "name"> {
		/**
		 * Current trap value. Real users never see the field, so a non-empty value
		 * is a strong "this was filled by a bot" signal. Bindable.
		 */
		value?: string;
		/**
		 * Name (and id) of the trap field. Pick something a naive bot finds
		 * tempting to fill, that your real form does NOT use, and — importantly —
		 * that browser/profile autofill does NOT recognize as a known field.
		 * Avoid `url`/`website`/`email`/`name`/`phone`/`address`/`company`: those
		 * are exactly what Chrome/Safari autofill writes into, which would fill the
		 * off-screen trap for a real user and create a false positive. Default:
		 * "link" (tempting to link-spam bots, ignored by autofill).
		 */
		name?: string;
		id?: string;
		/**
		 * Screen-reader-only instruction. The wrapper is `aria-hidden`, so this is
		 * a belt-and-suspenders fallback for the rare AT that ignores aria-hidden.
		 * Default: "Leave this field empty".
		 */
		label?: string;
		/** Wrapper element ref. Bindable. */
		el?: HTMLDivElement;
		/** Underlying `<input>` ref. Bindable. */
		input?: HTMLInputElement;
		/**
		 * Drop the `stuic-honeypot` class. The hiding styles are applied inline and
		 * are NOT affected by this — a honeypot must stay hidden to function.
		 */
		unstyled?: boolean;
		class?: string;
	}
</script>

<script lang="ts">
	import { getId } from "../../utils/get-id.js";
	import { twMerge } from "../../utils/tw-merge.js";

	let {
		value = $bindable(""),
		name = "link",
		id = getId(),
		label = "Leave this field empty",
		el = $bindable(),
		input = $bindable(),
		unstyled = false,
		class: classProp,
		...rest
	}: Props = $props();

	/** `true` when the trap was filled (i.e. the submitter is likely a bot). */
	export function isFilled(): boolean {
		return (value ?? "").trim() !== "";
	}

	// Hiding here is FUNCTIONAL, not cosmetic: a visible honeypot would be filled
	// by real users and produce false positives. We inline the hide styles (rather
	// than rely on a CSS class) so the trap stays hidden even if the consumer has
	// not imported the library stylesheet — the primitive is self-contained. This
	// is the standard visually-hidden recipe, kept off-screen rather than
	// `display:none`/`type=hidden` (which many bots skip).
	const HIDE_STYLE =
		"position:absolute !important;width:1px;height:1px;padding:0;margin:-1px;" +
		"overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;";

	let _class = $derived(unstyled ? classProp : twMerge("stuic-honeypot", classProp));
</script>

<!--
	aria-hidden + tabindex=-1 keep the trap out of the accessibility tree and tab
	order, so assistive tech and keyboard users never reach it. autocomplete is set
	to "new-password" — NOT "off", which Chrome/Safari ignore on non-credential text
	fields — because "new-password" is the value browsers and password managers
	actually honor as do-not-autofill, so autofill won't write into the trap and
	falsely flag a real user.
-->
<div bind:this={el} class={_class} style={HIDE_STYLE} aria-hidden="true">
	<label for={id}>{label}</label>
	<input
		bind:this={input}
		bind:value
		{id}
		{name}
		type="text"
		tabindex={-1}
		autocomplete="new-password"
		{...rest}
	/>
</div>
