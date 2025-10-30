<script>
	import { Button } from "$lib/index.js";
	import { dummyText } from "../../_utils/dummy-text.js";

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
