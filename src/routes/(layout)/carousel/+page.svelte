<script lang="ts">
	import { Carousel, type CarouselItem, Button } from "$lib/index.js";

	// Basic items with simple text content
	const basicItems: CarouselItem[] = [
		{ id: 1, content: "Slide 1" },
		{ id: 2, content: "Slide 2" },
		{ id: 3, content: "Slide 3" },
		{ id: 4, content: "Slide 4" },
		{ id: 5, content: "Slide 5" },
	];

	// Items with HTML content
	const htmlItems: CarouselItem[] = [
		{ id: "a", content: { html: "<strong>Bold Slide</strong>" } },
		{ id: "b", content: { html: "<em>Italic Slide</em>" } },
		{ id: "c", content: { html: "<span class='text-red-500'>Red Slide</span>" } },
		{ id: "d", content: { html: "<u>Underlined Slide</u>" } },
	];

	// Rich items for custom rendering
	const richItems: CarouselItem[] = [
		{
			id: 1,
			content: "Mountain View",
			data: {
				image: "https://picsum.photos/seed/mountain/400/300",
				description: "A beautiful mountain landscape",
			},
		},
		{
			id: 2,
			content: "Ocean Sunset",
			data: {
				image: "https://picsum.photos/seed/ocean/400/300",
				description: "Sunset over the ocean waves",
			},
		},
		{
			id: 3,
			content: "Forest Path",
			data: {
				image: "https://picsum.photos/seed/forest/400/300",
				description: "A serene path through the forest",
			},
		},
		{
			id: 4,
			content: "City Lights",
			data: {
				image: "https://picsum.photos/seed/city/400/300",
				description: "City skyline at night",
			},
		},
		{
			id: 5,
			content: "Desert Dunes",
			data: {
				image: "https://picsum.photos/seed/desert/400/300",
				description: "Golden sand dunes at sunset",
			},
		},
	];

	// Image items for radio button demo
	const imageRadioItems: CarouselItem[] = [
		{
			id: "img-1",
			content: "",
			data: {
				src: "https://picsum.photos/seed/cat/200/200",
				label: "Cat",
			},
		},
		{
			id: "img-2",
			content: "",
			data: {
				src: "https://picsum.photos/seed/dog/200/200",
				label: "Dog",
			},
		},
		{
			id: "img-3",
			content: "",
			data: {
				src: "https://picsum.photos/seed/bird/200/200",
				label: "Bird",
			},
		},
		{
			id: "img-4",
			content: "",
			data: {
				src: "https://picsum.photos/seed/fish/200/200",
				label: "Fish",
			},
		},
		{
			id: "img-5",
			content: "",
			data: {
				src: "https://picsum.photos/seed/rabbit/200/200",
				label: "Rabbit",
			},
		},
	];

	// State for interactive demos
	let activeIndex1 = $state(0);
	let carousel1: Carousel;

	let activeIndex2 = $state(0);
	let carousel2: Carousel;

	let selectedImageId = $state<string | number>("img-1");
	let imageCarousel: Carousel;
</script>

<div class="space-y-16 py-8">
	<!-- Basic Carousel -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Basic Carousel (1 per view)</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Default carousel with one item per view. Swipe or use arrow keys to navigate.
		</p>
		<div
			class="border rounded-lg p-4"
			style="--stuic-carousel-item-bg: var(--stuic-color-surface); --stuic-carousel-item-border-width: 1px; --stuic-carousel-item-border: var(--stuic-color-border);"
		>
			<Carousel items={basicItems} classItem="p-8 text-center text-2xl font-bold" />
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- With Active Tracking -->
	<section>
		<h2 class="text-xl font-semibold mb-2">With Active Tracking + Scroll Sync</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Tracks the active item. Scroll/swipe to change active, or use buttons/keyboard.
		</p>
		<div
			class="border rounded-lg p-4"
			style="--stuic-carousel-item-bg: var(--stuic-color-surface); --stuic-carousel-item-border-width: 1px; --stuic-carousel-item-border: var(--stuic-color-border);"
		>
			<Carousel
				bind:this={carousel1}
				items={basicItems}
				trackActive
				syncActiveOnScroll
				bind:activeIndex={activeIndex1}
				classItem="p-8 text-center text-2xl font-bold"
			/>
		</div>
		<div class="mt-4 flex items-center gap-4">
			<Button size="sm" onclick={() => carousel1.previous()}>Previous</Button>
			<Button size="sm" onclick={() => carousel1.next()}>Next</Button>
			<span class="text-sm text-neutral-600 dark:text-neutral-400">
				Active: {activeIndex1 + 1} / {basicItems.length}
			</span>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Multiple Items Per View with Peek -->
	<section>
		<h2 class="text-xl font-semibold mb-2">3 Items Per View with Peek</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Shows 3 items at a time with 10% peek of the next item to indicate more content.
		</p>
		<div class="border rounded-lg p-4">
			<Carousel
				items={basicItems}
				itemsPerView={3}
				peekPercent={10}
				gap={16}
				classItem="p-6 text-center font-bold bg-blue-100 dark:bg-blue-900 rounded-lg"
			/>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Center Snap Alignment -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Center Snap Alignment</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Items snap to center position when scrolling.
		</p>
		<div class="border rounded-lg p-4">
			<Carousel
				items={basicItems}
				itemsPerView={2}
				peekPercent={15}
				gap={16}
				snapAlign="center"
				trackActive
				classItem="p-6 text-center font-bold bg-green-100 dark:bg-green-900 rounded-lg"
			/>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Free Scroll (No Snap) -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Free Scroll (No Snap)</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Scrolling without snap behavior for more fluid navigation.
		</p>
		<div class="border rounded-lg p-4">
			<Carousel
				items={basicItems}
				itemsPerView={3}
				gap={16}
				snap={false}
				classItem="p-6 text-center font-bold bg-purple-100 dark:bg-purple-900 rounded-lg"
			/>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Loop Navigation -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Loop Navigation</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Navigation wraps around from last to first item. Click the carousel and use arrow
			keys.
		</p>
		<div
			class="border rounded-lg p-4"
			style="--stuic-carousel-item-bg: var(--stuic-color-surface); --stuic-carousel-item-border-width: 1px; --stuic-carousel-item-border: var(--stuic-color-border);"
		>
			<Carousel
				bind:this={carousel2}
				items={basicItems}
				trackActive
				bind:activeIndex={activeIndex2}
				loop
				keyboard
				classItem="p-8 text-center text-2xl font-bold"
			/>
		</div>
		<div class="mt-4 flex items-center gap-4">
			<Button size="sm" onclick={() => carousel2.previous()}>Previous</Button>
			<Button size="sm" onclick={() => carousel2.next()}>Next</Button>
			<span class="text-sm text-neutral-600 dark:text-neutral-400">
				Active: {activeIndex2 + 1} / {basicItems.length} (loops!)
			</span>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- HTML Content (THC) -->
	<section>
		<h2 class="text-xl font-semibold mb-2">HTML Content (THC)</h2>
		<p class="text-sm text-neutral-500 mb-4">Using the THC pattern with HTML content.</p>
		<div
			class="border rounded-lg p-4"
			style="--stuic-carousel-item-bg: var(--stuic-color-surface); --stuic-carousel-item-border-width: 1px; --stuic-carousel-item-border: var(--stuic-color-border);"
		>
			<Carousel items={htmlItems} classItem="p-8 text-center text-xl" />
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Custom Render Snippet -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Custom Render Snippet</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Using renderItem snippet for rich card layouts.
		</p>
		<div class="border rounded-lg p-4">
			<Carousel items={richItems} itemsPerView={2} peekPercent={10} gap={16} trackActive>
				{#snippet renderItem({ item, active })}
					<div
						class="rounded-lg overflow-hidden border transition-all"
						class:ring-2={active}
						class:ring-blue-500={active}
					>
						<img
							src={item.data?.image}
							alt={String(item.content)}
							class="w-full h-48 object-cover"
						/>
						<div class="p-4">
							<h3 class="font-bold text-lg">{item.content}</h3>
							<p class="text-sm text-neutral-600 dark:text-neutral-400">
								{item.data?.description}
							</p>
						</div>
					</div>
				{/snippet}
			</Carousel>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Image Radio Buttons -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Image Radio Buttons</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Click to select an image. This demonstrates using the carousel as an image picker.
		</p>
		<div class="border rounded-lg p-4">
			<Carousel
				bind:this={imageCarousel}
				items={imageRadioItems}
				itemsPerView={4}
				peekPercent={5}
				gap={12}
				trackActive
				bind:value={selectedImageId}
			>
				{#snippet renderItem({ item, active })}
					<button
						type="button"
						class="w-full rounded-md overflow-hidden cursor-pointer focus:outline-none"
						onclick={() => imageCarousel.goToId(item.id)}
					>
						<img
							src={item.data?.src}
							alt={item.data?.label}
							class="w-full aspect-square object-cover"
						/>
						<div class="p-2 text-center text-sm font-medium">
							{item.data?.label}
						</div>
					</button>
				{/snippet}
			</Carousel>
		</div>
		<p class="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
			Selected: <strong>{selectedImageId}</strong>
		</p>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Custom Styling via CSS Variables -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Custom Styling via CSS Variables</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Customized using CSS custom properties for gap, radius, and colors.
		</p>
		<div
			class="border rounded-lg p-4"
			style="
				--stuic-carousel-gap: 2rem;
				--stuic-carousel-item-radius: 1rem;
				--stuic-carousel-item-bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				--stuic-carousel-item-border-width: 0;
			"
		>
			<Carousel
				items={basicItems}
				itemsPerView={3}
				gap="2rem"
				classItem="p-8 text-center text-xl font-bold text-white"
			/>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Unstyled -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Unstyled (Full Custom)</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Using unstyled mode with custom Tailwind classes.
		</p>
		<Carousel
			items={basicItems}
			unstyled
			class="flex gap-4 overflow-x-auto pb-4"
			classItem="flex-shrink-0 w-64 p-6 bg-amber-100 dark:bg-amber-900 rounded-xl text-center font-bold"
		/>
	</section>
</div>
