<script>
	import { createClog } from '@marianmeres/clog';
	import { iconHeroSolidCheck, iconHeroSolidXMark } from '@marianmeres/icons-fns';
	import { Switch } from '../../lib';
	import Layout from '../_components/Layout.svelte';

	const clog = createClog('Switch page');

	let toggle1 = true;
	// $: clog(toggle1);
</script>

<Layout>
	<div class="flex items-center text-xs"><Switch checked size="xs" /> xs</div>
	<div class="flex items-center text-sm"><Switch size="sm" /> sm</div>
	<div class="flex items-center">
		<Switch
			size="md"
			bind:checked={toggle1}
			on:change={({ detail }) => clog('on:change', detail)}
		>
			<svelte:fragment slot="on">
				{@html iconHeroSolidCheck({ size: 10 })}
			</svelte:fragment>
			<svelte:fragment slot="off">
				{@html iconHeroSolidXMark({ size: 10, class: 'opacity-40' })}
			</svelte:fragment>
		</Switch> md (default)
		<button
			class="underline text-xs opacity-50 mx-2"
			on:click={() => {
				toggle1 = !toggle1;
			}}
		>
			change from outside
		</button>
	</div>
	<div class="flex items-center text-lg"><Switch size="lg" /> lg</div>
	<div class="flex items-center text-xl">
		<Switch
			size="xl"
			preHook={async (old) => Promise.resolve(!!confirm('Are you sure?'))}
		/> xl (with confirm)
	</div>
	<hr class="my-8" />
	<Switch disabled />
</Layout>
