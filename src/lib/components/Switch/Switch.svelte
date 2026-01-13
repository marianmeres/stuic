<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { FormEventHandler, HTMLLabelAttributes } from "svelte/elements";
	import type {
		ValidateOptions,
		ValidationResult,
	} from "../../actions/validate.svelte.js";

	export interface Props extends Omit<HTMLLabelAttributes, "children" | "onchange"> {
		button?: HTMLButtonElement;
		checked?: boolean;
		size?: "xs" | "sm" | "md" | "lg" | "xl" | string;
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

	import "./index.css";

	let {
		button = $bindable(),
		size = "md",
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
			xs: `h-4 w-7`,
			sm: `h-5 w-9`,
			md: `h-6 w-11`,
			lg: `h-7 w-13`,
			xl: `h-8 w-15`,
		},
		dot: {
			size: {
				xs: `size-2 data-[checked=true]:translate-x-4`,
				sm: `size-3 data-[checked=true]:translate-x-5`,
				md: `size-4 data-[checked=true]:translate-x-6`,
				lg: `size-5 data-[checked=true]:translate-x-7`,
				xl: `size-6 data-[checked=true]:translate-x-8`,
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
	class={twMerge(
		"stuic-switch",
		`m-2 
		relative inline-flex shrink-0 items-center
		rounded-full cursor-pointer

		transition-colors duration-100

		hover:brightness-105 active:brightness-95
		data-[disabled=true]:!cursor-not-allowed data-[disabled=true]:!opacity-50 data-[disabled=true]:hover:brightness-100

		bg-neutral-400 dark:bg-neutral-400

		data-[checked=true]:bg-switch-accent
		dark:data-[checked=true]:bg-switch-accent-dark

		focus:outline-0
		focus:ring-switch-accent/20 focus:dark:ring-switch-accent-dark/20
		focus:ring-4`,
		size,
		_preset.size[size],
		classProp
	)}
	data-checked={checked}
	data-disabled={disabled}
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
		class={twMerge(
			"dot",
			`flex items-center justify-center
			translate-x-1 rounded-full  
			transition-all duration-100
			shadow
			bg-neutral-50 dark:bg-neutral-50
			text-neutral-950 dark:text-neutral-950`,
			size,
			_preset.dot.size[size],
			dotClass
		)}
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
