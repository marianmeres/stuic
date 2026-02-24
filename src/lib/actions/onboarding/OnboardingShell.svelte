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
	}
</script>

<script lang="ts">
	import Thc from "../../components/Thc/Thc.svelte";

	let { step, index, total, isFirst, isLast, labels, shell, next, prev, skip }: Props = $props();

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
					<button class="stuic-onboarding-btn-prev" onclick={prev}>
						{step.prevLabel ?? labels.prev}
					</button>
				{/if}
				<button class="stuic-onboarding-btn-next" onclick={next}>
					{isLast
						? (step.finishLabel ?? labels.finish)
						: (step.nextLabel ?? labels.next)}
				</button>
			</div>
		</div>
	</div>
{/if}
