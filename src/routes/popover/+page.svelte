<script>
	import { createClog } from '@marianmeres/clog';
	import Layout from '../_components/Layout.svelte';
	import Popover from '../../lib/components/Popoverx/Popover.svelte';
	import { tooltip } from '../../lib/actions/tooltip/tooltip';

	const clog = createClog('popover page');
</script>

<Layout>
	<div class=" h-[300px]">&nbsp;</div>

	Hello
	<Popover
		options={{
			alignment: 'bottomLeft',
			class: 'bg-gradient-to-r from-red-500 to-red-700 w-full max-w-[300px]',
			arrowClass: 'border-red-500 dark:border-red-500',
			logger: clog,
		}}
	>
		<button class="border px-2">Open popover</button>
		<div slot="popover" class="">
			This is rich popover
			<hr />
			<div class="size-64"></div>
		</div>
	</Popover>
	World!

	<br />
	<div class="w-full">
		<span aria-label="This is normal tooltip" use:tooltip>How are you?</span>
	</div>

	<div class="w-[2000px] h-[2000px]">&nbsp;</div>
</Layout>
