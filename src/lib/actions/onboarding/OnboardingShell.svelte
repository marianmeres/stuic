<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { TourStepDef, TourLabels, TourShellContext } from "./onboarding.svelte.js";
	import type { Props as ButtonProps } from "../../components/Button/Button.svelte";

	type ButtonOverrides = Pick<
		ButtonProps,
		"variant" | "intent" | "size" | "roundedFull" | "class"
	>;

	export interface Props {
		step: TourStepDef;
		/** 0-based index of this step */
		index: number;
		total: number;
		isFirst: boolean;
		isLast: boolean;
		labels: Required<TourLabels>;
		/** Optional custom shell snippet — replaces the entire default layout */
		shell?: Snippet<[TourShellContext]>;
		next: () => void;
		prev: () => void;
		skip: () => void;
		//
		classControls?: string;
		/** Whether to show the step counter (e.g. "1 / 3"). Default: true */
		showSteps?: boolean;
		/** Override props for the prev button */
		prevButtonProps?: ButtonOverrides;
		/** Override props for the next/finish button */
		nextButtonProps?: ButtonOverrides;
	}
</script>

<script lang="ts">
	import Thc from "../../components/Thc/Thc.svelte";
	import Button from "../../components/Button/Button.svelte";
	import { iconChevronLeft, iconChevronRight, iconCheck } from "$lib/icons/index.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import { omit } from "../../utils/omit-pick.js";

	let {
		step,
		index,
		total,
		isFirst,
		isLast,
		labels,
		shell,
		next,
		prev,
		skip,
		classControls,
		showSteps = true,
		prevButtonProps,
		nextButtonProps,
	}: Props = $props();

	const context: TourShellContext = $derived({
		step,
		index,
		total,
		isFirst,
		isLast,
		next,
		prev,
		skip,
	});

	const BUTTON_CLS = "p-0";

	const BUTTON_PROPS = {
		aspect1: true,
		variant: "soft",
		roundedFull: true,
	};

	const ICON_SIZE = 24;

	const _finishLabel = $derived(isLast ? (step.finishLabel ?? labels.finish) : "");
</script>

{#if shell}
	{@render shell(context)}
{:else}
	<div class="stuic-onboarding-shell">
		{#if step.title || showSteps}
			<div class="stuic-onboarding-header">
				{#if step.title}
					<div class="stuic-onboarding-title">{step.title}</div>
				{/if}
				{#if showSteps}
					<span class="stuic-onboarding-steps">{index + 1} / {total}</span>
				{/if}
			</div>
		{/if}
		{#if step.content}
			<div class="stuic-onboarding-content">
				<Thc thc={step.content} />
			</div>
		{/if}
		<div class="stuic-onboarding-footer">
			{#if !isLast}
				<button class="stuic-onboarding-btn-skip" onclick={skip}>
					{step.skipLabel ?? labels.skip}
				</button>
			{/if}
			<div class="stuic-onboarding-actions">
				{#if !isFirst}
					<Button
						onclick={prev}
						class={twMerge(BUTTON_CLS, classControls, prevButtonProps?.class)}
						{...BUTTON_PROPS}
						{...omit(prevButtonProps ?? {}, "class")}
					>
						{@html iconChevronLeft({ size: ICON_SIZE })}
					</Button>
				{/if}
				<Button
					onclick={next}
					class={twMerge(
						BUTTON_CLS,
						_finishLabel && "pl-2 pr-3",
						classControls,
						nextButtonProps?.class
					)}
					{...BUTTON_PROPS}
					aspect1={!_finishLabel}
					intent="primary"
					variant="solid"
					{...omit(nextButtonProps ?? {}, "class")}
				>
					{@html isLast
						? iconCheck({ size: ICON_SIZE })
						: iconChevronRight({ size: ICON_SIZE })}
					{#if _finishLabel}{_finishLabel}{/if}
				</Button>
			</div>
		</div>
	</div>
{/if}
