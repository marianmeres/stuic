<script>
	import { Button } from '$lib/index.js';

	// ButtonConfig.variant = {
	// 	foo: {},
	// };
</script>

<div class="bg-amber-50 p-4 mb-4 space-x-3">
	<Button disabled>Light</Button>
	<Button variant="primary">Light primary</Button>
	<Button variant="secondary">Secondary</Button>
	<Button size="sm">sm</Button>
	<Button size="lg">lg</Button>
	<Button muted>lg muted</Button>
</div>

<div class="dark dark:bg-black/80 p-4 space-x-3">
	<Button disabled>Dark</Button>
	<Button variant="primary">Dark primary</Button>
	<Button variant="secondary">Dark secondary</Button>
</div>

<style>
	/* @reference "tailwindcss"; */
	@reference "../../app.css";

	:global([data-button-variant='primary']) {
		/* @apply font-bold text-yellow-400 dark:text-red-700 border-0 border-e-3 border-b-3; */
		/* --radius-button: var(--radius-xl); */
	}
</style>
