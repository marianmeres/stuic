<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { TranslateFn } from "../../types.js";
	import type { CheckoutStep } from "./_internal/checkout-types.js";

	export interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
		/**
		 * Step definitions. Each step has an id and label.
		 * Default: 4-step checkout flow (review, shipping, confirm, complete).
		 */
		steps?: CheckoutStep[];

		/** ID of the currently active step */
		currentStep: string;

		/**
		 * Called when a navigable past step is clicked.
		 * If undefined, past steps are rendered as plain text (not clickable).
		 */
		onNavigate?: (step: CheckoutStep) => void;

		/**
		 * Separator between steps.
		 * String value is rendered as HTML (e.g., "&rarr;").
		 * Snippet provides full customization.
		 * Default: right arrow "→"
		 */
		separator?: Snippet | string;

		/**
		 * Override rendering of an individual step label.
		 * Receives the step object and its position state.
		 */
		stepLabel?: Snippet<
			[
				{
					step: CheckoutStep;
					index: number;
					isCurrent: boolean;
					isPast: boolean;
					isFuture: boolean;
				},
			]
		>;

		t?: TranslateFn;
		unstyled?: boolean;
		class?: string;
		el?: HTMLElement;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import { t_default } from "./_internal/checkout-i18n-defaults.js";

	let {
		steps: stepsProp,
		currentStep,
		onNavigate,
		separator,
		stepLabel,
		t: tProp,
		unstyled = false,
		class: classProp,
		el = $bindable(),
		...rest
	}: Props = $props();

	let t = $derived(tProp ?? t_default);

	let defaultSteps: CheckoutStep[] = $derived([
		{ id: "review", label: t("checkout.step.review") },
		{ id: "shipping", label: t("checkout.step.shipping") },
		{ id: "confirm", label: t("checkout.step.confirm") },
		{ id: "complete", label: t("checkout.step.complete") },
	]);

	let steps = $derived(stepsProp ?? defaultSteps);

	let currentIndex = $derived(steps.findIndex((s) => s.id === currentStep));

	let _class = $derived(
		unstyled ? classProp : twMerge("stuic-checkout-progress", classProp)
	);
</script>

<nav
	bind:this={el}
	class={_class}
	aria-label={t("checkout.progress.label")}
	{...rest}
>
	{#each steps as step, index (step.id)}
		{@const isPast = currentIndex >= 0 && index < currentIndex}
		{@const isCurrent = index === currentIndex}
		{@const isFuture = currentIndex < 0 || index > currentIndex}

		{#if index > 0}
			<span
				class={unstyled ? undefined : "stuic-checkout-progress-separator"}
				aria-hidden="true"
			>
				{#if separator}
					{#if typeof separator === "string"}
						{@html separator}
					{:else}
						{@render separator()}
					{/if}
				{:else}
					→
				{/if}
			</span>
		{/if}

		{#if stepLabel}
			{@render stepLabel({ step, index, isCurrent, isPast, isFuture })}
		{:else if isPast && onNavigate && step.navigable !== false}
			<button
				type="button"
				class={unstyled
					? undefined
					: "stuic-checkout-progress-step stuic-checkout-progress-step--past"}
				onclick={() => onNavigate(step)}
			>
				{step.label}
			</button>
		{:else}
			<span
				class={unstyled
					? undefined
					: twMerge(
							"stuic-checkout-progress-step",
							isCurrent && "stuic-checkout-progress-step--current",
							isPast && "stuic-checkout-progress-step--past",
							isFuture && "stuic-checkout-progress-step--future"
						)}
				aria-current={isCurrent ? "step" : undefined}
			>
				{step.label}
			</span>
		{/if}
	{/each}
</nav>
