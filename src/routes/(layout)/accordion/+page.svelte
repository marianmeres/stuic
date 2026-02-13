<script lang="ts">
	import { Accordion, AccordionItem } from "$lib/index.js";

	let controlledOpen = $state(false);
</script>

<h1 class="text-2xl font-bold mb-8">Accordion</h1>

<div class="space-y-8 max-w-xl">
	<section>
		<h2 class="text-lg font-semibold mb-2">Basic</h2>
		<Accordion>
			<AccordionItem>
				{#snippet trigger()}What is STUIC?{/snippet}
				<p>
					STUIC is an opinionated Svelte 5 component library built with Tailwind CSS v4.
					It provides accessible, customizable UI components for building modern web
					applications.
				</p>
			</AccordionItem>
			<AccordionItem>
				{#snippet trigger()}How do I install it?{/snippet}
				<p>
					Install via npm: <code>npm install @marianmeres/stuic</code>. Then import
					components directly from the package.
				</p>
			</AccordionItem>
			<AccordionItem>
				{#snippet trigger()}Can I customize the styling?{/snippet}
				<p>
					Yes! Every component supports CSS variable overrides, a <code>class</code>
					prop for Tailwind classes, and an <code>unstyled</code> prop to strip all default
					styling.
				</p>
			</AccordionItem>
		</Accordion>
	</section>

	<section>
		<h2 class="text-lg font-semibold mb-2">Exclusive mode</h2>
		<p class="text-sm text-neutral-500 mb-2">Only one item can be open at a time.</p>
		<Accordion exclusive>
			<AccordionItem>
				{#snippet trigger()}Section A{/snippet}
				<p>Opening this section will close the others.</p>
			</AccordionItem>
			<AccordionItem>
				{#snippet trigger()}Section B{/snippet}
				<p>Only one section is visible at any given time.</p>
			</AccordionItem>
			<AccordionItem>
				{#snippet trigger()}Section C{/snippet}
				<p>This is the third section content.</p>
			</AccordionItem>
		</Accordion>
	</section>

	<section>
		<h2 class="text-lg font-semibold mb-2">Default open</h2>
		<Accordion>
			<AccordionItem open>
				{#snippet trigger()}Open by default{/snippet}
				<p>This section starts expanded when the page loads.</p>
			</AccordionItem>
			<AccordionItem>
				{#snippet trigger()}Closed by default{/snippet}
				<p>This one starts collapsed.</p>
			</AccordionItem>
		</Accordion>
	</section>

	<section>
		<h2 class="text-lg font-semibold mb-2">Disabled item</h2>
		<Accordion>
			<AccordionItem>
				{#snippet trigger()}Enabled{/snippet}
				<p>This item can be toggled normally.</p>
			</AccordionItem>
			<AccordionItem disabled>
				{#snippet trigger()}Disabled{/snippet}
				<p>This content is not reachable.</p>
			</AccordionItem>
			<AccordionItem>
				{#snippet trigger()}Also enabled{/snippet}
				<p>Another toggleable item.</p>
			</AccordionItem>
		</Accordion>
	</section>

	<section>
		<h2 class="text-lg font-semibold mb-2">Controlled state</h2>
		<div class="mb-2">
			<button
				class="px-3 py-1 bg-neutral-200 dark:bg-neutral-700 rounded text-sm"
				onclick={() => (controlledOpen = !controlledOpen)}
			>
				Toggle externally (currently: {controlledOpen ? "open" : "closed"})
			</button>
		</div>
		<Accordion>
			<AccordionItem bind:open={controlledOpen}>
				{#snippet trigger()}Controlled item{/snippet}
				<p>This item's state is controlled by the button above.</p>
			</AccordionItem>
			<AccordionItem>
				{#snippet trigger()}Independent item{/snippet}
				<p>This item operates independently.</p>
			</AccordionItem>
		</Accordion>
	</section>

	<section>
		<h2 class="text-lg font-semibold mb-2">Standalone (no wrapper)</h2>
		<p class="text-sm text-neutral-500 mb-2">
			AccordionItem works without the Accordion wrapper.
		</p>
		<div class="space-y-2">
			<AccordionItem>
				{#snippet trigger()}Standalone item 1{/snippet}
				<p>Works fine without the Accordion wrapper.</p>
			</AccordionItem>
			<AccordionItem>
				{#snippet trigger()}Standalone item 2{/snippet}
				<p>Each item manages its own state independently.</p>
			</AccordionItem>
		</div>
	</section>

	<section>
		<h2 class="text-lg font-semibold mb-2">Custom styling</h2>
		<Accordion
			style="--stuic-accordion-border-color: oklch(0.6 0.15 250); --stuic-accordion-radius: 0; --stuic-accordion-trigger-bg-hover: oklch(0.6 0.15 250 / 0.1);"
		>
			<AccordionItem>
				{#snippet trigger()}Custom border color{/snippet}
				<p>This accordion uses CSS variable overrides for custom theming.</p>
			</AccordionItem>
			<AccordionItem>
				{#snippet trigger()}No border radius{/snippet}
				<p>Sharp corners via <code>--stuic-accordion-radius: 0</code>.</p>
			</AccordionItem>
		</Accordion>
	</section>
</div>
