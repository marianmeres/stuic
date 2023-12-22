<script lang="ts">
	import { createClog } from '@marianmeres/clog';
	import { Drawer, createDrawerStore } from '../../lib/index.js';
	import Layout from '../_components/Layout.svelte';
	import { dummyText } from '../_utils/dummy-text.js';

	const clog = createClog('drawer');
	const drawer = createDrawerStore();

	let position: any = 'left';
</script>

<Layout>
	<select bind:value={position} class="pr-2">
		{#each ['left', 'top', 'right', 'bottom'] as value}
			<option {value}>{value}</option>
		{/each}
	</select>
	<button on:click={drawer.open}>Open drawer</button>
</Layout>

<!-- on:click={(e) => drawer.close()} -->
<!-- on:element={({ detail }) => clog(detail)} -->
<Drawer
	{drawer}
	{position}
	backdropClass="z-10 bg-black/50 cursor-pointer"
	class="bg-white dark:bg-neutral-700 cursor-auto"
	on:escape={drawer.close}
	on:click_backdrop={drawer.close}
	on:click_outside={() => clog('click outside')}
>
	<div class="w-full">
		<div class="p-4 bg-gray-200 dark:bg-black">
			<button on:click={(e) => drawer.close()}>close</button>
		</div>
		<div class="p-4 w-[400px] max-w-[400px]">
			{@html dummyText(30)}
		</div>
	</div>
</Drawer>
