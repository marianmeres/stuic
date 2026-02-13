<script lang="ts">
	import Separator from "$lib/components/Separator/Separator.svelte";
</script>

<h2 class="text-xl font-bold mb-4">Separator</h2>

<h3 class="font-semibold mb-2">Horizontal (default)</h3>
<div class="mb-8">
	<p>Content above</p>
	<Separator />
	<p>Content below</p>
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Vertical</h3>
<div class="flex items-center h-8 mb-8">
	<span>Left</span>
	<Separator orientation="vertical" />
	<span>Right</span>
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Vertical in a toolbar</h3>
<div class="flex items-center gap-2 h-10 mb-8">
	<button class="px-3 py-1 border rounded">Bold</button>
	<button class="px-3 py-1 border rounded">Italic</button>
	<Separator orientation="vertical" />
	<button class="px-3 py-1 border rounded">Left</button>
	<button class="px-3 py-1 border rounded">Center</button>
	<button class="px-3 py-1 border rounded">Right</button>
	<Separator orientation="vertical" />
	<button class="px-3 py-1 border rounded">Link</button>
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Custom thickness</h3>
<div class="space-y-4 mb-8">
	<div>
		<p class="text-sm text-neutral-500 mb-2">1px (default):</p>
		<Separator />
	</div>
	<div>
		<p class="text-sm text-neutral-500 mb-2">2px:</p>
		<Separator style="--stuic-separator-thickness: 2px;" />
	</div>
	<div>
		<p class="text-sm text-neutral-500 mb-2">4px:</p>
		<Separator style="--stuic-separator-thickness: 4px;" />
	</div>
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Custom color</h3>
<div class="space-y-4 mb-8">
	<div>
		<p class="text-sm text-neutral-500 mb-2">Default (border color):</p>
		<Separator />
	</div>
	<div>
		<p class="text-sm text-neutral-500 mb-2">Red:</p>
		<Separator style="--stuic-separator-color: red;" />
	</div>
	<div>
		<p class="text-sm text-neutral-500 mb-2">Custom oklch:</p>
		<Separator style="--stuic-separator-color: oklch(0.6 0.15 250);" />
	</div>
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Custom spacing</h3>
<div class="mb-8 border border-dashed border-neutral-300 p-4">
	<p>Above</p>
	<Separator style="--stuic-separator-spacing: 0.5rem;" />
	<p>Tight (0.5rem)</p>
	<Separator />
	<p>Default (1rem)</p>
	<Separator style="--stuic-separator-spacing: 2rem;" />
	<p>Loose (2rem)</p>
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Decorative (aria-hidden)</h3>
<div class="mb-8">
	<p class="text-sm text-neutral-500 mb-2">
		This separator has no semantic role (inspect the DOM):
	</p>
	<Separator decorative />
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">With Tailwind class override</h3>
<div class="mb-8">
	<Separator class="my-8" />
</div>
