<script>
	import { Button } from "$lib/index.js";

	let checked = $state(true);
</script>

<div class="space-x-3">
	<Button disabled>Disabled</Button>
	<Button>Default</Button>
	<Button inverse>Default (inverse)</Button>
	<Button variant="primary">Primary (css)</Button>
	<Button variant="secondary">Secondary</Button>
	<Button size="sm">Small</Button>
	<Button size="lg">Large</Button>
	<Button muted noshadow noborder>Muted, no shadow, no border</Button>
	<hr class="my-8" />
	<Button
		--stuic-button-bg="var(--color-green-600)"
		--stuic-button-text="var(--color-sky-200)"
		--stuic-button-border="var(--color-red-700)"
		--stuic-button-border-focus="var(--color-red-500)"
	>
		Custom direct colors
	</Button>
	<hr class="my-8" />
	<Button unstyled variant="secondary" class="bg-pink-400 rounded px-2">
		no default styles
	</Button>
	<hr class="my-8" />
	<Button roleSwitch onclick={() => console.log("outer click")} bind:checked>
		<!-- {#snippet children({ checked })} -->
		Switch: {checked ? "on" : "off"}
		<!-- {/snippet} -->
	</Button>
	<div>
		checked: {checked}
	</div>
</div>
