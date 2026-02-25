<script lang="ts">
	import { ImageCycler, type ImageCyclerImage } from "$lib/index.js";

	const images: ImageCyclerImage[] = [
		{
			src: "https://picsum.photos/seed/mountain1/800/600",
			alt: "Mountain vista",
			title: "Mountain Vista",
			description: "A breathtaking view of alpine peaks at dawn",
		},
		{
			src: "https://picsum.photos/seed/city42/800/600",
			alt: "Urban skyline",
			title: "Urban Skyline",
			description: "City lights shimmering at dusk",
		},
		{
			src: "https://picsum.photos/seed/ocean7/800/600",
			alt: "Coastal waves",
			title: "Coastal Waves",
			description: "Peaceful shores where land meets sea",
		},
		{
			src: "https://picsum.photos/seed/forest3/800/600",
			alt: "Forest path",
			title: "Forest Path",
			description: "Sunlight filtering through ancient trees",
		},
	];

	const portrait: ImageCyclerImage[] = [
		{ src: "https://picsum.photos/seed/portrait1/400/600", alt: "Portrait 1" },
		{ src: "https://picsum.photos/seed/portrait2/400/600", alt: "Portrait 2" },
		{ src: "https://picsum.photos/seed/portrait3/400/600", alt: "Portrait 3" },
	];

	let lastClicked = $state<{ title?: string; index: number } | null>(null);
</script>

<div class="space-y-16 py-8">

	<!-- Section 1: Basic cover (default) -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Basic (cover, default)</h2>
		<p class="text-sm text-neutral-500 mb-4">
			No metadata, 3s cycle, 500ms crossfade. Container is 100% wide, 400px tall.
		</p>
		<div class="w-full h-[400px] rounded-xl overflow-hidden">
			<ImageCycler {images} />
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Section 2: With metadata snippets + onClick -->
	<section>
		<h2 class="text-xl font-semibold mb-2">With metadata snippets + onClick</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Title overlay (top-left) and description overlay (bottom). The <code>onclick</code> prop is
			passed into both snippets — clicking either fires the handler.
			{#if lastClicked}
				<span class="ml-2 font-medium text-green-600 dark:text-green-400">
					Clicked: "{lastClicked.title}" (index {lastClicked.index})
				</span>
			{/if}
		</p>
		<div class="w-full h-[420px] rounded-xl overflow-hidden">
			<ImageCycler
				{images}
				minWait={4000}
				transitionDuration={700}
				onclick={(image, index) => {
					lastClicked = { title: image.title, index };
				}}
			>
				{#snippet title({ image, onclick })}
					<div class="absolute top-4 left-4">
						<button
							class="bg-black/60 text-white text-sm font-semibold px-3 py-1.5 rounded-lg backdrop-blur-sm hover:bg-black/80 transition-colors cursor-pointer"
							{onclick}
						>
							{image.title}
						</button>
					</div>
				{/snippet}
				{#snippet description({ image, onclick })}
					<div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
						<p
							class="text-white text-sm cursor-pointer hover:underline"
							role="button"
							tabindex="-1"
							onclick={onclick}
							onkeydown={onclick}
						>
							{image.description}
						</p>
					</div>
				{/snippet}
			</ImageCycler>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Section 3: Fit modes comparison -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Fit modes</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Portrait images (400×600) in a landscape container (400×300) to show the difference.
		</p>
		<div class="grid grid-cols-3 gap-4">
			{#each (["cover", "contain", "fill"] as const) as fit}
				<div>
					<p class="text-xs font-mono text-center mb-2 text-neutral-500">{fit}</p>
					<div class="h-[300px] rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
						<ImageCycler images={portrait} {fit} minWait={2500} transitionDuration={400} />
					</div>
				</div>
			{/each}
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Section 4: Fast cycling / custom timing -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Custom timing</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>minWait={1500}</code>, <code>transitionDuration={1000}</code> — slow fade, short wait.
		</p>
		<div class="w-full h-[300px] rounded-xl overflow-hidden">
			<ImageCycler {images} minWait={1500} transitionDuration={1000} />
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Section 5: Single image (no cycling) -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Single image (no cycling)</h2>
		<p class="text-sm text-neutral-500 mb-4">
			When only one image is provided the cycling effect is disabled.
		</p>
		<div class="w-full h-[250px] rounded-xl overflow-hidden">
			<ImageCycler images={[images[0]]} />
		</div>
	</section>

</div>
