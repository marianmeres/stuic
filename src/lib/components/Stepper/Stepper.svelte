<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";
	import type { THC } from "../Thc/Thc.svelte";
	import type { TranslateFn } from "../../types.js";

	export type StepperOrientation = "horizontal" | "vertical";

	export type StepperLabelPosition = "end" | "below";

	export type StepperStepState = "completed" | "current" | "upcoming";

	export type StepperClickable = "none" | "completed" | "all";

	export interface StepperStep {
		/** Step label */
		label: THC;
		/** Optional secondary line under the label */
		description?: THC;
		/**
		 * Raw svg/html string rendered inside the indicator instead of the step number
		 * (e.g. an `@marianmeres/icons-fns` render result). Completed/error markers
		 * still take precedence.
		 */
		icon?: string;
		/** Marks the step as failed — destructive coloring + "×" indicator */
		error?: boolean;
		/** Never clickable, regardless of the `clickable` policy */
		disabled?: boolean;
	}

	export interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
		/** The steps to render. Plain strings are shorthand for `{ label }`. */
		steps: (StepperStep | string)[];
		/**
		 * Zero-based index of the current step (default 0) — aligns with
		 * `@marianmeres/wizard`'s `step.index`. Steps before it render as completed,
		 * steps after it as upcoming. Pass `steps.length` to mark every step
		 * completed (wizard done). Out-of-range values are clamped.
		 */
		current?: number;
		/**
		 * Navigation callback. When provided (and `clickable` is not "none"), steps
		 * render as buttons and eligible ones fire this on click. The current step
		 * never fires.
		 */
		onSelect?: (index: number, step: StepperStep) => void;
		/**
		 * Which steps may be clicked when `onSelect` is present. `"completed"`
		 * (default): only completed steps — the "go back and revisit" wizard rule.
		 * `"all"`: any non-disabled step. `"none"`: display-only.
		 */
		clickable?: StepperClickable;
		/** Layout direction (default "horizontal") */
		orientation?: StepperOrientation;
		/**
		 * Horizontal orientation only: labels to the right of the indicator
		 * (`"end"`, default) or centered below it (`"below"` — the classic
		 * checkout header).
		 */
		labelPosition?: StepperLabelPosition;
		/** Disable all interaction (e.g. while a step is submitting) */
		disabled?: boolean;
		/** i18n translate function (see `createStepperT`) */
		t?: TranslateFn;
		/** Override the indicator bubble content */
		renderIndicator?: Snippet<
			[{ index: number; step: StepperStep; state: StepperStepState }]
		>;
		/** Skip all default styling */
		unstyled?: boolean;
		/** Additional CSS classes */
		class?: string;
		/** Class for every step item (`li`) */
		classStep?: string;
		/** Class for the indicator bubble */
		classIndicator?: string;
		/** Class for the label */
		classLabel?: string;
		/** Class for the description */
		classDescription?: string;
		/** Class for the connector line between steps */
		classConnector?: string;
		/** Bindable element reference */
		el?: HTMLElement;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import Thc from "../Thc/Thc.svelte";
	import { iconCheck, iconX } from "../../icons/index.js";
	import { t_default } from "./i18n.js";

	let {
		steps,
		current = 0,
		onSelect,
		clickable = "completed",
		orientation = "horizontal",
		labelPosition = "end",
		disabled = false,
		t = t_default,
		renderIndicator,
		unstyled = false,
		class: classProp,
		classStep: classStepProp,
		classIndicator: classIndicatorProp,
		classLabel: classLabelProp,
		classDescription: classDescriptionProp,
		classConnector: classConnectorProp,
		el = $bindable(),
		...rest
	}: Props = $props();

	let _steps: StepperStep[] = $derived(
		steps.map((s) => (typeof s === "string" ? { label: s } : s))
	);

	// clamped to [0, steps.length] — the extra slot means "all completed"
	let _current = $derived(Math.min(Math.max(0, Math.floor(current)), _steps.length));

	let _interactive = $derived(!!onSelect && clickable !== "none");

	let _class = $derived(unstyled ? classProp : twMerge("stuic-stepper", classProp));
	let _classStep = $derived(
		unstyled ? classStepProp : twMerge("stuic-stepper-item", classStepProp)
	);
	let _classIndicator = $derived(
		unstyled ? classIndicatorProp : twMerge("stuic-stepper-indicator", classIndicatorProp)
	);
	let _classLabel = $derived(
		unstyled ? classLabelProp : twMerge("stuic-stepper-label", classLabelProp)
	);
	let _classDescription = $derived(
		unstyled
			? classDescriptionProp
			: twMerge("stuic-stepper-description", classDescriptionProp)
	);
	let _classConnector = $derived(
		unstyled ? classConnectorProp : twMerge("stuic-stepper-connector", classConnectorProp)
	);

	function stateOf(i: number): StepperStepState {
		if (i < _current) return "completed";
		if (i === _current) return "current";
		return "upcoming";
	}

	function isEligible(step: StepperStep, state: StepperStepState): boolean {
		if (disabled || step.disabled || state === "current") return false;
		return clickable === "all" || state === "completed";
	}

	function select(i: number) {
		const step = _steps[i];
		if (!_interactive || !isEligible(step, stateOf(i))) return;
		onSelect?.(i, step);
	}

	// icon-only state info for screen readers ("Step 2 of 4, Completed")
	function srText(i: number, step: StepperStep, state: StepperStepState): string {
		const parts = [t("step_x_of_y", { step: i + 1, stepCount: _steps.length })];
		if (step.error) parts.push(t("failed"));
		else if (state === "completed") parts.push(t("completed"));
		return parts.join(", ");
	}
</script>

{#snippet stepInner(i: number, step: StepperStep, state: StepperStepState)}
	<span class={_classIndicator} aria-hidden="true">
		{#if renderIndicator}
			{@render renderIndicator({ index: i, step, state })}
		{:else if step.error}
			{@html iconX()}
		{:else if state === "completed"}
			{@html iconCheck()}
		{:else if step.icon}
			{@html step.icon}
		{:else}
			{i + 1}
		{/if}
	</span>
	<span class="sr-only">{srText(i, step, state)}</span>
	<span class={unstyled ? undefined : "stuic-stepper-text"}>
		<span class={_classLabel}><Thc thc={step.label} /></span>
		{#if step.description}
			<span class={_classDescription}><Thc thc={step.description} /></span>
		{/if}
	</span>
{/snippet}

{#if _steps.length}
	<nav
		bind:this={el}
		class={_class}
		data-orientation={!unstyled ? orientation : undefined}
		data-label-position={!unstyled && orientation === "horizontal"
			? labelPosition
			: undefined}
		data-disabled={!unstyled && disabled ? "" : undefined}
		aria-label={t("stepper", null, "Progress")}
		{...rest}
	>
		<ol class={unstyled ? undefined : "stuic-stepper-list"}>
			{#each _steps as step, i (i)}
				{@const state = stateOf(i)}
				<li
					class={_classStep}
					data-state={!unstyled ? state : undefined}
					data-error={!unstyled && step.error ? "" : undefined}
					data-disabled={!unstyled && step.disabled ? "" : undefined}
					aria-current={state === "current" ? "step" : undefined}
				>
					{#if _interactive}
						<button
							type="button"
							class={unstyled ? undefined : "stuic-stepper-trigger"}
							disabled={!isEligible(step, state)}
							onclick={() => select(i)}
						>
							{@render stepInner(i, step, state)}
						</button>
					{:else}
						<div class={unstyled ? undefined : "stuic-stepper-trigger"}>
							{@render stepInner(i, step, state)}
						</div>
					{/if}
					{#if i < _steps.length - 1}
						<span
							class={_classConnector}
							data-state={!unstyled && state === "completed" ? "completed" : undefined}
							aria-hidden="true"
						></span>
					{/if}
				</li>
			{/each}
		</ol>
	</nav>
{/if}
