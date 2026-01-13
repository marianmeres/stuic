<script lang="ts">
	import Skeleton from "$lib/components/Skeleton/Skeleton.svelte";
</script>

<h2 class="text-xl font-bold mb-4">Skeleton Loader</h2>

<h3 class="font-semibold mb-2">Basic Rectangle</h3>
<div class="space-y-2 mb-8">
	<Skeleton width="100%" height="1rem" />
	<Skeleton width="75%" height="1rem" />
	<Skeleton width="50%" height="1rem" />
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Sizes</h3>
<div class="space-y-2 mb-8">
	<Skeleton width="100%" height="0.75rem" />
	<Skeleton width="100%" height="1rem" />
	<Skeleton width="100%" height="1.5rem" />
	<Skeleton width="100%" height="3rem" />
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Circle Variant (Avatars)</h3>
<div class="flex items-center gap-4 mb-8">
	<Skeleton variant="circle" size="32px" />
	<Skeleton variant="circle" size="48px" />
	<Skeleton variant="circle" size="64px" />
	<Skeleton variant="circle" size="96px" />
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Text Variant (Multiple Lines)</h3>
<div class="space-y-6 mb-8">
	<div>
		<p class="text-sm text-neutral-500 mb-2">3 lines, default settings:</p>
		<Skeleton variant="text" lines={3} width="100%" height="1rem" />
	</div>
	<div>
		<p class="text-sm text-neutral-500 mb-2">5 lines, larger gap:</p>
		<Skeleton variant="text" lines={5} width="100%" height="0.875rem" gap="0.75rem" />
	</div>
	<div>
		<p class="text-sm text-neutral-500 mb-2">4 lines, 50% last line:</p>
		<Skeleton variant="text" lines={4} width="100%" height="1rem" lastLineWidth="50%" />
	</div>
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Animation Styles</h3>
<div class="space-y-4 mb-8">
	<div>
		<p class="text-sm text-neutral-500 mb-2">Shimmer (default):</p>
		<Skeleton animation="shimmer" width="100%" height="2rem" />
	</div>
	<div>
		<p class="text-sm text-neutral-500 mb-2">Pulse:</p>
		<Skeleton animation="pulse" width="100%" height="2rem" />
	</div>
	<div>
		<p class="text-sm text-neutral-500 mb-2">None:</p>
		<Skeleton animation="none" width="100%" height="2rem" />
	</div>
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Animation Duration</h3>
<div class="space-y-4 mb-8">
	<div>
		<p class="text-sm text-neutral-500 mb-2">Fast (0.8s):</p>
		<Skeleton width="100%" height="1.5rem" duration="0.8s" />
	</div>
	<div>
		<p class="text-sm text-neutral-500 mb-2">Normal (1.5s):</p>
		<Skeleton width="100%" height="1.5rem" duration="1.5s" />
	</div>
	<div>
		<p class="text-sm text-neutral-500 mb-2">Slow (3s):</p>
		<Skeleton width="100%" height="1.5rem" duration="3s" />
	</div>
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Border Radius</h3>
<div class="space-y-4 mb-8">
	<div>
		<p class="text-sm text-neutral-500 mb-2">Default rounded:</p>
		<Skeleton width="200px" height="2rem" />
	</div>
	<div>
		<p class="text-sm text-neutral-500 mb-2">No rounded:</p>
		<Skeleton width="200px" height="2rem" rounded={false} />
	</div>
	<div>
		<p class="text-sm text-neutral-500 mb-2">Custom (1rem):</p>
		<Skeleton width="200px" height="2rem" rounded="1rem" />
	</div>
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Card Placeholder Example</h3>
<div class="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 max-w-sm mb-8">
	<div class="flex items-center gap-3 mb-4">
		<Skeleton variant="circle" size="48px" />
		<div class="flex-1">
			<Skeleton width="60%" height="1rem" class="mb-2" />
			<Skeleton width="40%" height="0.75rem" />
		</div>
	</div>
	<Skeleton variant="text" lines={3} width="100%" height="0.875rem" class="mb-4" />
	<Skeleton width="100%" height="200px" rounded="0.5rem" />
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">List Placeholder Example</h3>
<div class="space-y-3 max-w-md">
	{#each [1, 2, 3] as _}
		<div class="flex items-center gap-3 p-2 border border-neutral-200 dark:border-neutral-700 rounded">
			<Skeleton variant="circle" size="40px" />
			<div class="flex-1">
				<Skeleton width="70%" height="0.875rem" class="mb-1" />
				<Skeleton width="50%" height="0.75rem" />
			</div>
			<Skeleton width="60px" height="1.5rem" rounded="0.25rem" />
		</div>
	{/each}
</div>
