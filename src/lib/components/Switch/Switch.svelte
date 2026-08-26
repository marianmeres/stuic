<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { FormEventHandler, HTMLLabelAttributes } from "svelte/elements";
	import type {
		ValidateOptions,
		ValidationResult,
	} from "../../actions/validate.svelte.js";

	export type SwitchIntent = "primary" | "accent" | "success" | "warning" | "destructive";

	export interface Props extends Omit<HTMLLabelAttributes, "children" | "onchange"> {
		button?: HTMLButtonElement;
		checked?: boolean;
		size?: "sm" | "md" | "lg" | string;
		/** Semantic color intent */
		intent?: SwitchIntent;
		/** Form field name for the hidden checkbox */
		name?: string;
		class?: string;
		/** Classes for the toggle dot/knob element */
		dotClass?: string;
		/**
		 * Accessible name for the switch, rendered as `aria-label` on the interactive
		 * element. An explicit `aria-label`/`aria-labelledby` passed by the caller wins.
		 * Required unless the switch is named some other way - `role="switch"` takes its
		 * name from the author only, never from its content.
		 */
		label?: string;
		required?: boolean;
		disabled?: boolean;
		tabindex?: number;
		/** Snippet to render inside dot when checked */
		on?: Snippet;
		/** Snippet to render inside dot when unchecked */
		off?: Snippet;
		onclick?: (event: MouseEvent) => void;
		onchange?: FormEventHandler<HTMLButtonElement> | null | undefined;
		/** Async validation before toggle - return false to prevent change */
		preHook?: (current: boolean) => Promise<false | any>;
		validate?: boolean | Omit<ValidateOptions, "setValidationResult">;
		setValidationResult?: (res: ValidationResult) => void;
	}
</script>

<script lang="ts">
	import { tick } from "svelte";
	import { twMerge } from "../../utils/tw-merge.js";
	import { validate as validateAction } from "../../actions/validate.svelte.js";

	let {
		button = $bindable(),
		size = "md",
		intent,
		name,
		class: classProp,
		dotClass,
		checked = $bindable(),
		required,
		disabled,
		tabindex = 0,
		label,
		on,
		off,
		onclick,
		preHook,
		// Renamed local binding to avoid collision with `export function validate()` below.
		validate: validateProp,
		setValidationResult,
		...rest
	}: Props = $props();

	const _preset: any = {
		size: {
			xs: `h-5 w-9`,
			sm: `h-6 w-11`,
			md: `h-7 w-13`,
			lg: `h-8 w-15`,
		},
		dot: {
			size: {
				xs: `size-3 data-[checked=true]:translate-x-5`,
				sm: `size-4 data-[checked=true]:translate-x-6`,
				md: `size-5 data-[checked=true]:translate-x-7`,
				lg: `size-6 data-[checked=true]:translate-x-8`,
			},
		},
	};

	//
	let wrap = $state<HTMLLabelElement>()!;
	let checkbox = $state<HTMLInputElement>()!;

	function change() {
		checkbox.checked = !checked;
		checkbox.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
		wrap.focus();
	}

	//
	let _doValidate: (() => void) | undefined = $state();
	// Local copy of the last validation result so getValidation() works even
	// when no external setValidationResult was provided.
	let _validation: ValidationResult | undefined = $state();

	/** Trigger validation now. Reaches the parent via `setValidationResult`. */
	export function validate(): ValidationResult | undefined {
		_doValidate?.();
		return _validation;
	}

	/** Clear the inline validation message and reset `setCustomValidity`. */
	export function clearValidation(): void {
		_validation = undefined;
		checkbox?.setCustomValidity?.("");
	}

	/** Current validation state. */
	export function getValidation(): ValidationResult | undefined {
		return _validation;
	}

	/** Focus the visual switch wrapper. */
	export function focus(): void {
		wrap?.focus?.();
	}

	/** Scroll the switch into view. */
	export function scrollIntoView(opts?: ScrollIntoViewOptions): void {
		wrap?.scrollIntoView?.({ behavior: "smooth", block: "center", ...opts });
	}
</script>

<!--
	The <label> is the interactive element here: it is focusable, keyboard operable and
	carries the whole toggle interaction, so it - not the hidden checkbox - is what must
	be announced. Hence `role="switch"` + the aria state below. The inner checkbox stays
	as the form value carrier only (aria-hidden, see there).

	Note that `role` on a <label> is not allowed by ARIA-in-HTML (the element maps to no
	role); it is nevertheless honoured by browsers/AT and is the least invasive way to
	name and announce this control without restructuring the markup.
-->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions  -->
<label
	bind:this={wrap}
	class={twMerge("stuic-switch m-2", _preset.size[size], classProp)}
	role="switch"
	aria-checked={!!checked}
	aria-disabled={disabled || undefined}
	aria-required={required || undefined}
	aria-invalid={_validation && !_validation.valid ? "true" : undefined}
	aria-label={label}
	data-checked={checked}
	data-disabled={disabled}
	data-intent={intent}
	tabindex={disabled ? -1 : tabindex}
	onkeydown={(e: KeyboardEvent) => {
		if (!disabled && !e.metaKey && ["Space", "Enter"].includes(e.code)) {
			change();
		}
	}}
	onclick={async (e) => {
		e.preventDefault();
		if (disabled) return false;

		if (typeof preHook === "function" && (await preHook(checked ?? false)) === false) {
			return false;
		}

		change();

		await tick();

		if (typeof onclick === "function") onclick(e);
	}}
	{...rest as Record<string, unknown>}
>
	<span
		class={twMerge("dot translate-x-1", _preset.dot.size[size], dotClass)}
		data-checked={checked}
	>
		{#if checked}
			{@render on?.()}
		{:else}
			{@render off?.()}
		{/if}
	</span>
	<!--
		Value carrier only: it holds the checked state for form submission and native
		validation. `aria-hidden` keeps it out of the a11y tree so the switch above is
		the single announced control (it is never focused - `tabindex="-1"` and every
		focus() call targets the wrapper).
	-->
	<input
		bind:checked
		bind:this={checkbox}
		type="checkbox"
		class="opacity-0 size-0"
		aria-hidden="true"
		{disabled}
		{required}
		{name}
		use:validateAction={() => ({
			enabled: validateProp !== false,
			...(typeof validateProp === "boolean" ? {} : validateProp),
			setValidationResult: (res) => {
				_validation = res;
				setValidationResult?.(res);
			},
			setDoValidate: (fn) => (_doValidate = fn),
		})}
		tabindex="-1"
	/>
</label>
