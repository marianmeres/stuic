<script lang="ts" module>
	import type { Props as ButtonGroupRadioProps } from "../ButtonGroupRadio/ButtonGroupRadio.svelte";
	import type { ColorSchemePreference } from "./color-scheme.svelte.js";

	/** Translated strings. Defaults are English. */
	export interface ColorSchemeSwitcherLabels {
		/** Accessible name of the radiogroup. Default: "Color scheme". */
		group?: string;
		/** Default: "System". */
		system?: string;
		/** Default: "Light mode". */
		light?: string;
		/** Default: "Dark mode". */
		dark?: string;
	}

	export interface Props {
		/**
		 * Which preferences to offer, in order. Default: system, light, dark.
		 * Without "system" the pair mirrors `ColorScheme.current` (what is on
		 * screen) instead of the stored preference, so a viewer who never chose
		 * still sees one segment active.
		 */
		options?: ColorSchemePreference[];
		/**
		 * Render the label text next to each icon. Default: icon-only, each
		 * segment named by `aria-label` and (see `tooltips`) a tooltip.
		 */
		showLabels?: boolean;
		/** Tooltip on each icon-only segment. Default: true. Ignored with `showLabels`. */
		tooltips?: boolean;
		labels?: ColorSchemeSwitcherLabels;
		/**
		 * Icon markup per preference (an SVG string, e.g. from
		 * `@marianmeres/icons-fns`). Defaults: monitor, sun, moon.
		 */
		icons?: Partial<Record<ColorSchemePreference, string>>;
		/** Forwarded to `ButtonGroupRadio`. */
		size?: ButtonGroupRadioProps["size"];
		disabled?: boolean;
		/**
		 * Skip the component's own class (compact width, icon sizing). The group
		 * is then a plain full-width `ButtonGroupRadio`.
		 */
		unstyled?: boolean;
		class?: string;
		classButton?: string;
		classButtonActive?: string;
		style?: string;
		/** The radiogroup element (bindable). */
		el?: HTMLDivElement;
	}
</script>

<script lang="ts">
	import { iconMonitor, iconMoon, iconSun } from "../../icons/index.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import ButtonGroupRadio from "../ButtonGroupRadio/ButtonGroupRadio.svelte";
	import { ColorScheme } from "./color-scheme.svelte.js";

	let {
		options = ["system", "light", "dark"],
		showLabels = false,
		tooltips = true,
		labels,
		icons,
		size = "md",
		disabled,
		unstyled = false,
		class: classProp,
		classButton,
		classButtonActive,
		style,
		el = $bindable(),
	}: Props = $props();

	const CLS = "stuic-color-scheme-switcher";

	const L = $derived({
		group: labels?.group ?? "Color scheme",
		system: labels?.system ?? "System",
		light: labels?.light ?? "Light mode",
		dark: labels?.dark ?? "Dark mode",
	});

	const ICON = $derived({
		system: icons?.system ?? iconMonitor({ size: 16 }),
		light: icons?.light ?? iconSun({ size: 16 }),
		dark: icons?.dark ?? iconMoon({ size: 16 }),
	} satisfies Record<ColorSchemePreference, string>);

	// What is active. With "system" on offer that is the stored preference
	// (`ColorScheme.preference`). A light/dark pair has no segment for "nothing
	// stored", so it mirrors what is on screen (`ColorScheme.current`) instead.
	// Both getters are reactive, so an outside change — the avatar menu, another
	// tab, the OS while following — moves the active segment on its own. No
	// local copy of the state: the runtime is the single source of truth.
	const value = $derived(
		options.includes(ColorScheme.SYSTEM) ? ColorScheme.preference : ColorScheme.current
	);

	const bgrOptions = $derived(
		options.map((preference) => ({
			value: preference,
			label: showLabels
				? `${ICON[preference]}<span>${L[preference]}</span>`
				: ICON[preference],
		}))
	);

	// Icon-only segments carry their name as `aria-label` (an SVG has no text)
	// and, by default, as a tooltip. With visible labels the text names them.
	// `data-icon-only` is what the CSS keys on to make them square (a circle
	// under the group's default pill radius).
	function buttonProps(index: number) {
		if (showLabels) return undefined;
		const label = L[options[index]];
		return {
			"aria-label": label,
			"data-icon-only": "",
			tooltip: tooltips ? label : undefined,
		};
	}
</script>

<ButtonGroupRadio
	bind:el
	options={bgrOptions}
	{value}
	{size}
	{disabled}
	aria-label={L.group}
	class={twMerge(!unstyled && CLS, classProp)}
	{classButton}
	{classButtonActive}
	{style}
	{buttonProps}
	onButtonClick={(index) => {
		ColorScheme.setPreference(options[index]);
	}}
/>
