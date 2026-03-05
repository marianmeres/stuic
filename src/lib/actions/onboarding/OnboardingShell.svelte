<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { TourStepDef, TourLabels, TourShellContext } from "./onboarding.svelte.js";

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
	}
</script>

<script lang="ts">
	import Thc from "../../components/Thc/Thc.svelte";
	import Button from "../../components/Button/Button.svelte";
	import { iconChevronLeft, iconChevronRight, iconCheck } from "$lib/icons/index.js";
	import { twMerge } from "../../utils/tw-merge.js";

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
</script>

{#if shell}
	{@render shell(context)}
{:else}
	<div class="stuic-onboarding-shell">
		{#if step.title}
			<div class="stuic-onboarding-title">{step.title}</div>
		{/if}
		{#if step.content}
			<div class="stuic-onboarding-content">
				<Thc thc={step.content} />
			</div>
		{/if}
		<div class="stuic-onboarding-footer">
			<span class="stuic-onboarding-steps">{index + 1} / {total}</span>
			<div class="stuic-onboarding-actions">
				{#if !isLast}
					<button class="stuic-onboarding-btn-skip" onclick={skip}>
						{step.skipLabel ?? labels.skip}
					</button>
				{/if}
				{#if !isFirst}
					<Button
						onclick={prev}
						class={twMerge(BUTTON_CLS, classControls)}
						{...BUTTON_PROPS}
					>
						{@html iconChevronLeft({ size: ICON_SIZE })}
					</Button>
				{/if}
				<Button
					onclick={next}
					class={twMerge(BUTTON_CLS, classControls)}
					{...BUTTON_PROPS}
					intent="primary"
					variant="solid"
				>
					{@html isLast
						? iconCheck({ size: ICON_SIZE })
						: iconChevronRight({ size: ICON_SIZE })}
				</Button>
			</div>
		</div>
	</div>
{/if}
