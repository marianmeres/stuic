<script lang="ts">
	import { createClog } from '@marianmeres/clog';
	import { draggable, droppable } from '../../lib/actions/drag-drop';
	import Layout from '../_components/Layout.svelte';
	import { writable, type Writable } from 'svelte/store';

	const clog = createClog('drag-drop +page');

	const isDragged = writable<Record<string, boolean>>({});
	const isDraggedOver = writable<Record<string, boolean>>({});

	// $: clog('isDragged', $isDragged);
	// $: clog('isDraggedOver', $isDraggedOver);
</script>

<Layout>
	<ul class="p-2" class:bg-gray-50={Object.values($isDragged).some((v) => v)}>
		{#each ['aaa', 'bbb', 'ccc'] as label, index}
			{@const id = `li-${index}`}
			<!-- on:dragover|preventDefault prevents the slow native "slide to original position" animation -->
			<li
				use:draggable={{
					id,
					payload: () => ({ index, label }),
					effectAllowed: 'move', // "action"
					isDragged,
					// allowedAxis: 'y', // not working
				}}
				class:cursor-grab={!$isDragged?.[id]}
				class:cursor-grabbing={$isDragged?.[id]}
				class:opacity-25={$isDragged?.[id]}
				on:dragover|preventDefault
			>
				{label}
				<div
					use:droppable={{
						id,
						dropEffect: 'move', // "acceptance"
						onDrop: (data, e) => {
							clog('onDrop', index, data, e.dataTransfer);
						},
						isDraggedOver,
					}}
					class:bg-gray-300={$isDraggedOver?.[id]}
					class:h-1={!$isDraggedOver?.[id]}
					class:h-4={$isDraggedOver?.[id]}
				>
					&nbsp;
				</div>
			</li>
		{/each}
	</ul>
</Layout>
