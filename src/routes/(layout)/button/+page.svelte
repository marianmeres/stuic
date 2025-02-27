<script>
	import { Button } from "$lib/index.js";
</script>

<div class="space-x-3">
	<Button disabled>Disabled</Button>
	<Button>Default</Button>
	<Button variant="primary">Primary</Button>
	<Button variant="secondary">Secondary</Button>
	<Button size="sm">Small</Button>
	<Button size="lg">Large</Button>
	<Button muted class="shadow-none">Muted, no shadow</Button>
	<hr class="my-8" />
	<Button
		--color-button-bg="var(--color-green-600)"
		--color-button-text="var(--color-sky-200)"
		--color-button-border="var(--color-red-700)"
		--color-button-border-focus="var(--color-red-500)"
		--color-button-bg-dark="var(--color-blue-600)"
		--color-button-text-dark="var(--color-red-200)"
		--color-button-border-dark="var(--color-green-700)"
		--color-button-border-focus-dark="var(--color-green-500)"
	>
		Custom direct colors
	</Button>
</div>
