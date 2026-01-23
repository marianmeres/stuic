<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { FormEventHandler, HTMLLabelAttributes } from "svelte/elements";
	import type {
		ValidateOptions,
		ValidationResult,
	} from "../../actions/validate.svelte.js";

	export type SwitchIntent =
		| "primary"
		| "accent"
		| "success"
		| "warning"
		| "destructive"
		| "info";

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
		/** Screen reader label (visually hidden) */
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
		validate,
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
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions  -->
<label
	bind:this={wrap}
	class={twMerge("stuic-switch m-2", _preset.size[size], classProp)}
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
	<input
		bind:checked
		bind:this={checkbox}
		type="checkbox"
		class="opacity-0 size-0"
		{disabled}
		{required}
		{name}
		use:validateAction={() => ({
			enabled: !!validate,
			...(typeof validate === "boolean" ? {} : validate),
			setValidationResult,
		})}
		tabindex="-1"
	/>
</label>
