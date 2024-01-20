<script lang="ts">
	import { Button, ButtonConfig } from '../../lib';
	import Layout from '../_components/Layout.svelte';

	ButtonConfig.variant.checked = `
		brightness-[1.1] after:content-['✓']
	`.trim();

	let active = 0;
</script>

<Layout>
	<div class="space-x-4 mb-4 flex flex-wrap items-center">
		<Button size="xs">Xsmall</Button>
		<Button size="sm">Small</Button>
		<Button>Medium</Button>
		<Button variant="primary">Primary</Button>
		<Button size="lg">Large</Button>
		<Button size="xl">XLarge</Button>
	</div>

	<hr class="my-4" />
	<div class="space-x-4 mb-4">
		<div class="inline-flex flex-row space-x-0">
			<Button
				class="border-r-0 rounded-tr-none rounded-br-none isolate"
				variant={active === 0 ? 'checked' : ''}
				on:click={() => (active = 0)}
			>
				One
			</Button>
			<!-- if "active" handle manually -->
			<Button
				class="border-r border-l rounded-none isolate"
				variant={active === 1 ? 'checked' : ''}
				on:click={() => (active = 1)}
			>
				Two
			</Button>
			<Button
				class="border-l-0 rounded-tl-none rounded-bl-none isolate"
				variant={active === 2 ? 'checked' : ''}
				on:click={() => (active = 2)}
			>
				Three
			</Button>
		</div>
	</div>

	<hr class="my-4" />
	<div class="space-x-4 mb-4">
		<div class="inline-flex flex-col space-y-0">
			<Button
				class="border-b-0 rounded-bl-none rounded-br-none isolate"
				variant={active === 0 ? 'checked' : ''}
				on:click={() => (active = 0)}
			>
				One
			</Button>
			<!-- if "active" handle manually -->
			<Button
				class="border-t border-b rounded-none isolate"
				variant={active === 1 ? 'checked' : ''}
				on:click={() => (active = 1)}
			>
				Two
			</Button>
			<Button
				class="border-t-0 rounded-tl-none rounded-tr-none isolate"
				variant={active === 2 ? 'checked' : ''}
				on:click={() => (active = 2)}
			>
				Three
			</Button>
		</div>
	</div>
	<hr class="my-4" />
	<Button class="block w-full" disabled rounded={false}>Block</Button>
</Layout>
