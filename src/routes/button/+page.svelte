<script lang="ts">
	import { Button, ButtonConfig } from '../../lib';
	import X from '../../lib/components/X/X.svelte';
	import Layout from '../_components/Layout.svelte';
	import {
		iconHeroOutlineExclamationTriangle,
		iconHeroOutlineXMark,
		iconBsGithub,
	} from '@marianmeres/icons-fns';

	ButtonConfig.class = `
		border-t border-b-2 border-r-2 border-black/10 border-b-black/20 border-r-black/20 hover:border-black/20
		bg-neutral-300 dark:bg-neutral-500 dark:border-black/90 dark:border-b-black dark:border-r-black dark:hover:border-black
		text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white
		focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-1 focus-visible:outline-pink-500/40
	`.trim();

	ButtonConfig.classBySize.xl = 'font-bold';

	ButtonConfig.variant.primary = `
		bg-pink-500 text-white hover:text-white
		dark:bg-pink-500 dark:text-white dark:hover:text-white
	`.trim();

	ButtonConfig.variant.checked = `
		brightness-[1.15] after:content-['✓'] font-semibold
	`.trim();

	ButtonConfig.variant.foo = `
		text-green-800           hover:text-green-900      bg-green-100 hover:brightness-1
		dark:text-green-600 dark:hover:text-green-700 dark:bg-green-100
	`.trim();

	ButtonConfig.variant['foo-outline'] = `
		border-green-500 bg-transparent dark:bg-transparent hover:border-green-500
		dark:border-green-500
	`.trim();

	let active = 0;
</script>

<Layout>
	<p class="mb-4">
		Examples. Note, that the core component is (almost) not styled out of the box at all.
	</p>
	<div class="space-x-4 mb-4 flex items-center">
		<Button variant="primary">Primary</Button>
		<Button variant="foo">Foo</Button>
		<Button variant="foo foo-outline">Foo outline</Button>
		<Button
			href="https://github.com/marianmeres/stuic"
			class="bg-blue-200 dark:bg-blue-200 text-black dark:text-black"
			target="_blank"
		>
			{@html iconBsGithub({ class: 'mr-1' })}
			Github
		</Button>
	</div>
	<hr class="my-4" />
	<div class="space-x-4 mb-4 flex flex-wrap items-center">
		<Button size="xs">xsmall</Button>
		<span>and</span>
		<Button size="sm">Small</Button>
		<span>and</span>
		<Button>Medium</Button>
		<Button class="pl-1">
			<X size="1.5rem" />
			<span>Medium</span>
			<X />
		</Button>
		<span>and</span>
		<Button size="lg">Large</Button>
		<span>and</span>
		<Button size="xl">X Large</Button>
	</div>
	<hr class="my-4" />
	<div class="space-x-4 mb-4">
		<Button rounded={false} size="xs">xsmall</Button>
		<Button rounded={false} size="sm">Small</Button>
		<Button rounded={false}>Medium</Button>
		<Button rounded={false} size="lg">Large</Button>
		<Button rounded={false} size="xl">XLarge</Button>
	</div>
	<hr class="my-4" />
	<div class="space-x-4 mb-4">
		<Button shadow={true} size="xs">xsmall</Button>
		<Button shadow={true} size="sm">Small</Button>
		<Button shadow={true}>Medium</Button>
		<Button shadow={true} size="lg">Large</Button>
		<Button shadow={true} size="xl">XLarge</Button>
	</div>
	<hr class="my-4" />
	<div class="space-x-4 mb-4">
		<Button rounded="full" size="xs">
			<span>xsmall</span>
		</Button>
		<span>and</span>
		<Button rounded="full" size="sm" variant="primary">Small</Button>
		<span>and</span>
		<Button rounded="full">
			<X />
			{@html iconHeroOutlineXMark({ size: 16 })}
			<span>Medium</span>
			{@html iconHeroOutlineExclamationTriangle({ size: 16 })}
		</Button>
		<span>and</span>
		<Button rounded="full" size="lg" variant="foo foo-outline">Large</Button>
		<span>and</span>
		<Button rounded="full" size="xl" disabled variant="foo">XLarge</Button>
	</div>
	<hr class="my-4" />
	<div class="space-x-4 mb-4">
		<Button square shadow={false} class="group bg-emerald-200">
			<X size="1.33rem" class="opacity-75 group-hover:opacity-100 m-1.5" />
		</Button>

		<Button square shadow={true} class="text-xl w-12 h-12 border-0" variant="primary">
			M
		</Button>
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
