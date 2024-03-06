<script lang="ts">
	import { createClog } from '@marianmeres/clog';
	import { draggable, droppable } from '../../lib/actions/drag-drop';
	import Layout from '../_components/Layout.svelte';
	import { writable, type Writable } from 'svelte/store';

	const clog = createClog('drag-drop +page');

	const isDragged = writable<string | null>(null);
	const isDraggedOver = writable<string | null>(null);

	// $: clog('isDragged', $isDragged);
	// $: clog('isDraggedOver', $isDraggedOver);
</script>

<Layout>
	<ul class="p-2" class:bg-gray-50={$isDragged}>
		{#each ['aaa', 'bbb', 'ccc'] as label, index}
			{@const id = `li-${index}`}
			<!-- on:dragover|preventDefault prevents the slow native "slide to original position" animation -->
			<li
				use:draggable={{
					id,
					payload: () => ({ index, label }),
					effectAllowed: 'move', // "action"
					isDragged,
					// logger: createClog('draggable'),
				}}
				class:opacity-25={$isDragged === id}
				class="flex items-center"
				use:droppable={{
					id,
					dropEffect: 'move', // "acceptance"
					onDrop: (data, e) => {
						clog('onDrop', index, data, e.dataTransfer);
					},
					onDragover: (e) => {
						// clog('onDragover', index);
					},
					isDraggedOver,
					// logger: createClog('droppable'),
				}}
				class:border={$isDraggedOver === id}
				class:border-black={$isDraggedOver === id}
			>
				{id}
				{label}
				{$isDragged === id ? 'dragged' : ''}
				&nbsp;
				<div class="flex items-center space-x-2">
					<div>inner a</div>
					<div>inner b</div>
				</div>
			</li>
		{/each}
	</ul>
</Layout>

<style lang="scss">
	:global(*[draggable='true']) {
		cursor: grab;
	}
	:global(*[aria-grabbed='true']) {
		cursor: grabbing;
	}
</style>
