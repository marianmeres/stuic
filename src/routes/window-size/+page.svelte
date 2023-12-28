<script>
	import { windowSize, breakpoint } from '../../lib';
	import Layout from '../_components/Layout.svelte';
</script>

<Layout>
	<div class="outline mb-4 p-4 rounded">
		<strong>window-size</strong>
		<pre>{JSON.stringify($windowSize, null, 2)}</pre>
	</div>
	<div class="outline mb-4 p-4 rounded">
		<strong>breakpoint</strong>
		<pre>{JSON.stringify($breakpoint, null, 2)}</pre>
	</div>
</Layout>
