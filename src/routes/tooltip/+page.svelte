<script lang="ts">
	import { createClog } from '@marianmeres/clog';
	import { onDestroy, onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { tooltip, windowSize } from '../../lib';
	import { calculateAlignment } from '../../lib/utils/calculate-alignment.js';
	import Layout from '../_components/Layout.svelte';
	import { dummySentence, dummyText } from '../_utils/dummy-text.js';

	const clog = createClog('tooltip page');

	let anchor: HTMLElement;
	let el: HTMLElement;
	let scrollableRoot: HTMLElement;

	// prettier-ignore
	const positions = [
		'topRight', 'top', 'topLeft',
		'rightBottom', 'right', 'rightTop',
		'bottomLeft', 'bottom', 'bottomRight',
		'leftTop', 'left', 'leftBottom',
	];
	let posIdx = 1;
	$: selectedPosition = positions[posIdx];

	let offset = 5;
	let safe = true;
	let position: any;

	const placeNow = () => {
		const root = scrollableRoot;

		const rootRect = root.getBoundingClientRect();
		const boundaryRoot = {
			x: rootRect.x,
			y: rootRect.y,
			width: rootRect.width,
			height: rootRect.height,
		};

		const result = calculateAlignment(
			boundaryRoot,
			anchor.getBoundingClientRect(),
			el.getBoundingClientRect(),
			offset
		);

		position = result.position;

		const x = position[selectedPosition].x;
		const y = position[selectedPosition].y;
		safe = position[selectedPosition].safe;

		el.style.position = `fixed`;
		el.style.left = `${x}px`;
		el.style.top = `${y}px`;
	};

	const onScroll = () => {
		placeNow();
	};

	let mounted = false;
	onMount(() => {
		mounted = true;
		placeNow();
		scrollableRoot.addEventListener('scroll', placeNow);
	});

	$: if (mounted && $windowSize) {
		placeNow();
	}

	onDestroy(() => {
		scrollableRoot.removeEventListener('scroll', placeNow);
	});

	$: if (mounted && (selectedPosition || offset)) placeNow();

	const colors = {
		// top: { class: '', arrowClass: ''},
		left: {
			class: 'bg-teal-600 dark:bg-teal-600',
			arrowClass: 'border-teal-600 dark:border-teal-600',
		},
		right: { class: 'bg-fuchsia-700 ', arrowClass: 'border-fuchsia-700' },
	};

	const trigger = writable(false);
	const triggers = ['hover', 'focus', 'click'];

	// const notifier = writable(false);
	// $: createClog('show/hide notifier')($notifier);

	const groups = [
		['topLeft', 'top', 'topRight'],
		['bottomLeft', 'bottom', 'bottomRight'],
		['leftTop', 'left', 'leftBottom'],
		['rightTop', 'right', 'rightBottom'],
	];
</script>

<Layout>
	<div class="flex justify-between mb-4">
		{#each [1, 2, 3] as i}
			<span
				class="px-2 py-1 border-2"
				aria-label="This is <strong>basic</strong> tooltip"
				use:tooltip
			>
				{i}
			</span>
		{/each}
	</div>
	{#each groups as group}
		<div class="mb-8 p-4 border flex items-center justify-center w-full h-[200px]">
			<div class="space-x-8">
				{#each group as alignment}
					<button
						id={`b-${alignment}`}
						class="border px-2 py-1"
						aria-label={dummySentence(/top|right/.test(alignment) ? 3 : 2)}
						use:tooltip={{
							alignment,
							triggers,
							class: `${colors?.[alignment]?.class || ''}`,
							arrowClass: `${colors?.[alignment]?.arrowClass || ''}`,
							hideOnInsufficientSpace: true,
							logger: clog.debug,
							trigger,
							// notifier,
						}}
					>
						{alignment}
					</button>
				{/each}
			</div>
		</div>
	{/each}

	<button
		class="border mb-4 px-2"
		on:click={() => ($trigger = !$trigger)}
		aria-label="Click here to manually toggle all tooltips above"
		use:tooltip
	>
		toggle manually all
	</button>

	<div bind:this={scrollableRoot} class="h-[400px] overflow-auto p-4 border">
		{@html dummyText(5)}

		<div class="mb-2 border flex items-center justify-center w-[75%] h-[200px] space-x-4">
			<span bind:this={anchor} class="px-2 py-1 border-2">test</span>
			{#if scrollableRoot}
				<span
					class="px-2 py-1 border-2"
					aria-label="This is <strong>basic</strong> tooltip"
					use:tooltip={{
						boundaryRoot: scrollableRoot,
					}}>tooltip</span
				>
			{/if}
		</div>
		<div class="flex items-center">
			<div class="flex-1">
				<input
					class="w-full"
					bind:value={posIdx}
					type="range"
					min="0"
					max={positions.length - 1}
					step="1"
				/>
			</div>
			<div class="w-[120px] text-right">{selectedPosition}</div>
		</div>
		<div class="flex items-center">
			<div class="flex-1">
				<input
					class="w-full"
					bind:value={offset}
					type="range"
					min="0"
					max={20}
					step="5"
				/>
			</div>
			<div class="w-[120px] text-right">{offset}</div>
		</div>
		<div
			bind:this={el}
			class="px-3 py-2 bg-orange-300 inline-block w-max"
			class:bg-red-500={!safe}
		>
			Alignment tester<br />(multiline)
		</div>

		{@html dummyText(10)}
	</div>

	<div class="w-[2000px] h-[2000px]">&nbsp</div>
</Layout>
