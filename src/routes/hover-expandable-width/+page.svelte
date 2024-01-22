<script lang="ts">
	import { createClog } from '@marianmeres/clog';
	import { createSwitchStore } from '@marianmeres/switch-store';
	import { HoverExpandableWidth } from '../../lib/index.js';
	import Layout from '../_components/Layout.svelte';
	import { dummyText } from '../_utils/dummy-text.js';

	const clog = createClog('exandable page');

	const left = createSwitchStore();

	let enabled = true;
</script>

<Layout>
	<button on:click={() => (enabled = !enabled)} class="mb-4">
		{enabled ? 'disable' : 'enable'}
	</button>
	<div class="w-full outline flex overflow-hidden mb-8 h-[300px]">
		<div class="left">
			<HoverExpandableWidth
				class="bg-red-400"
				let:isExpanded
				let:inTransition
				on:click={() => clog('left click')}
				on:change={({ detail }) => clog('change', detail)}
				{enabled}
			>
				<div class="h-full w-full p-4 transition duration">
					hover
					{#if isExpanded}<div class="font-bold">EXPANDED</div>{/if}
					{#if inTransition}<div class="font-bold">Transition</div>{/if}
					<!-- {#if isExpanded}<button on:click={left.toggle}>toggle force</button>{/if} -->

					<div class="opacity-25 mt-4">{@html dummyText(3)}</div>
				</div>
			</HoverExpandableWidth>
		</div>
		<div class="flex-1 p-4 order 2">
			<button on:click={left.toggle}>
				left {#if $left.isOn}(forced){/if}
			</button>
			<div class="opacity-25 mt-4">{@html dummyText(3)}</div>
		</div>
	</div>
</Layout>
