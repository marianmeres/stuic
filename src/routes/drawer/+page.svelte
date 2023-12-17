<script lang="ts">
	import { createClog } from '@marianmeres/clog';
	import { Drawer, createDrawerStore } from '../../lib/index.js';
	import Layout from '../_components/Layout.svelte';
	import { dummyText } from '../_utils/dummy-text.js';

	const clog = createClog('drawer');
	const drawer = createDrawerStore();

	let position: any = 'left';
	const preset = {
		left: '',
		right: '',
		top: '',
		bottom: '',
	};
</script>

<Layout>
	<select bind:value={position} class="border pr-2">
		{#each ['left', 'top', 'right', 'bottom'] as value}
			<option {value}>{value}</option>
		{/each}
	</select>
	<button on:click={(e) => drawer.open()}>Open drawer</button>
</Layout>

<!-- on:click={(e) => drawer.close()} -->
<!-- on:element={({ detail }) => clog(detail)} -->
<Drawer
	{drawer}
	backdropClass="z-10 bg-black/50"
	on:escape={(e) => drawer.close()}
	on:backdrop_click={(e) => drawer.close()}
	{position}
	transitionDuration={200}
	class="bg-white"
>
	<div class="w-full">
		<div class="p-4 bg-gray-200">
			<button on:click={(e) => drawer.close()}>close</button>
		</div>
		<div class="p-4 max-w-[400px]">
			{@html dummyText(30)}
		</div>
	</div>
</Drawer>
