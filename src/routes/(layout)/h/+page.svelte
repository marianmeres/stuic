<script lang="ts">
	import H from "$lib/components/H/H.svelte";
</script>

<h2 class="text-xl font-bold mb-4">H (Heading)</h2>

<h3 class="font-semibold mb-2">All levels (h1–h6)</h3>
<div class="mb-8 space-y-2">
	<H level={1}>Heading level 1</H>
	<H level={2}>Heading level 2</H>
	<H level={3}>Heading level 3</H>
	<H level={4}>Heading level 4</H>
	<H level={5}>Heading level 5</H>
	<H level={6}>Heading level 6</H>
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">renderLevel (visual override)</h3>
<p class="text-sm text-neutral-500 mb-2">
	Semantic h2 elements styled as different visual levels:
</p>
<div class="mb-8 space-y-2">
	<H level={2} renderLevel={1}>h2 styled as h1</H>
	<H level={2} renderLevel={3}>h2 styled as h3</H>
	<H level={2} renderLevel={5}>h2 styled as h5</H>
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Custom CSS variables</h3>
<div class="mb-8 space-y-2">
	<H level={1} style="--stuic-h1-font-size: 3rem; --stuic-h-font-weight: 900;">
		Extra large, extra bold h1
	</H>
	<H level={2} style="--stuic-h-font-weight: 300; --stuic-h-letter-spacing: 0.1em;">
		Light weight, wide tracking h2
	</H>
	<H level={3} style="--stuic-h-color: oklch(0.6 0.15 250);">Colored h3</H>
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">With Tailwind class override</h3>
<div class="mb-8">
	<H level={2} class="italic underline">Italic underlined h2</H>
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Unstyled</h3>
<p class="text-sm text-neutral-500 mb-2">
	No default styles applied — just a plain heading element:
</p>
<div class="mb-8">
	<H level={3} unstyled>Unstyled h3 (browser defaults)</H>
	<H level={3} unstyled class="text-pink-500 text-3xl font-black">
		Unstyled h3 with custom classes
	</H>
</div>
