<script lang="ts">
	import { createSwitchStore } from '@marianmeres/switch-store';
	import Expandable from '../../lib/components/Expandable/Expandable.svelte';
	import Layout from '../_components/Layout.svelte';
	import { dummyText } from '../_utils/dummy-text';
	import { createClog } from '@marianmeres/clog';

	const clog = createClog('exandable page');

	const left = createSwitchStore();
	const right = createSwitchStore();
</script>

<Layout>
	<div class="w-full outline flex overflow-hidden mb-8">
		<div class="flex-1 flex flex-col order-2 p-4">
			<button on:click={left.toggle}>
				left {#if $left.isOn}(forced){/if}
			</button>
			<button on:click={right.toggle}>
				right {#if $right.isOn}(forced){/if}
			</button>
			<div class="opacity-25 mt-4">{@html dummyText(3)}</div>
		</div>

		<div class="parent left order-1">
			<Expandable
				position="left"
				force={$left.isOn}
				class=" bg-red-400 p-4"
				expandedClass="w-[300px] shadow-2xl	shadow-black"
				let:isExpanded
				on:click={() => clog('left click')}
			>
				<div>
					{#if isExpanded}<div class="font-bold">EXPANDED</div>{/if}
					hover
					{#if isExpanded}<button on:click={left.toggle}>toggle force</button>{/if}
				</div>
			</Expandable>
		</div>
		<div class="parent right order-3">
			<Expandable
				position="right"
				force={$right.isOn}
				class=" bg-orange-400 p-4 cursor-pointer"
				expandedClass="w-[300px] shadow-2xl	shadow-black"
				expandsOn="click"
				let:isExpanded
				on:click={() => clog('right click')}
			>
				{#if isExpanded}<div class="font-bold">EXPANDED</div>{/if}
				click
			</Expandable>
		</div>
	</div>

	<div class="h-64 w-full outline flex flex-col overflow-hidden mb-8">
		<div class="flex-1 p-4 order-2">
			<div class="opacity-25">{@html dummyText(1)}</div>
		</div>
		<div class="parent top w-full order-1 z-10">
			<Expandable
				position="top"
				class=" bg-red-400 p-4"
				expandedClass="h-[150px] shadow-2xl shadow-black"
				let:isExpanded
				on:click={() => clog('top click')}
			>
				{#if isExpanded}<div class="font-bold">EXPANDED</div>{/if}
				hover
			</Expandable>
		</div>
		<div class="parent bottom order-3">
			<Expandable
				position="bottom"
				class=" bg-orange-400 cursor-pointer p-4"
				expandedClass="h-[150px] shadow-2xl	shadow-black"
				expandsOn="click"
				let:isExpanded
				on:click={() => clog('bottom click')}
			>
				{#if isExpanded}<div class="font-bold">EXPANDED</div>{/if}
				click
			</Expandable>
		</div>
	</div>
</Layout>

<style lang="scss">
	.parent {
		// relative position is IMPORTANT, as the child is absolute
		position: relative;
	}
	.left,
	.right {
		width: 100px;
	}
	.top,
	.bottom {
		height: 100px;
	}
</style>
