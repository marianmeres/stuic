<script>
	import { createClog } from '@marianmeres/clog';
	import { onOutside } from '../../lib';
	import Layout from '../_components/Layout.svelte';

	const clog = createClog('onOutside page');
</script>

<Layout>
	<div
		class="outline p-4 mb-8"
		use:onOutside={{ handler: (outsideEl) => clog('via handler', outsideEl) }}
		on:outside={({ detail: outsideEl }) => clog('via on:outside custom event', outsideEl)}
	>
		Click/focus inside/outside this <code>div</code> and check console.
		<div class="mt-4">
			<button class="border p-1">focusable 1</button>
			<button class="border p-1">focusable 2</button>
		</div>
	</div>

	<button class="border p-1">focusable element outside</button>
</Layout>
