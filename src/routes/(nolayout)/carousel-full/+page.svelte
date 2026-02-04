<script lang="ts">
	import { Carousel, type CarouselItem } from "$lib/index.js";

	const slides: CarouselItem[] = [
		{
			id: 1,
			content: "Welcome",
			data: {
				subtitle: "Full-screen presentation mode",
				bg: "bg-gradient-to-br from-blue-600 to-indigo-800",
			},
		},
		{
			id: 2,
			content: "Navigate with Arrows",
			data: {
				subtitle: "Use ← → keys or swipe to move between slides",
				bg: "bg-gradient-to-br from-emerald-600 to-teal-800",
			},
		},
		{
			id: 3,
			content: "Full Viewport",
			data: {
				subtitle: "Each slide takes 100% width and height",
				bg: "bg-gradient-to-br from-orange-500 to-red-700",
			},
		},
		{
			id: 4,
			content: "Loop Enabled",
			data: {
				subtitle: "Navigation wraps from last to first slide",
				bg: "bg-gradient-to-br from-purple-600 to-pink-700",
			},
		},
		{
			id: 5,
			content: "The End",
			data: {
				subtitle: "Press → to loop back to the beginning",
				bg: "bg-gradient-to-br from-slate-700 to-slate-900",
			},
		},
	];

	let activeIndex = $state(0);
</script>

<div class="fixed inset-0 w-screen h-screen overflow-hidden bg-neutral-400">
	<Carousel
		items={slides}
		itemsPerView={1}
		gap={0}
		snap={true}
		keyboard={true}
		loop={true}
		trackActive
		syncActiveOnScroll
		bind:activeIndex
		unstyled
		class="w-full h-full overflow-hidden"
		classTrack="flex w-full h-full overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar"
		classItem="w-full h-full flex-shrink-0 snap-start"
	>
		{#snippet renderItem({ item })}
			<div
				class="{item.data
					?.bg} w-full h-full flex flex-col items-center justify-center text-white p-8"
			>
				<h1 class="text-5xl md:text-7xl font-bold mb-4 text-center">
					{item.content}
				</h1>
				<p class="text-xl md:text-2xl opacity-80 text-center max-w-2xl">
					{item.data?.subtitle}
				</p>
			</div>
		{/snippet}
	</Carousel>

	<!-- Slide counter -->
	<div
		class="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm"
	>
		{activeIndex + 1} / {slides.length}
	</div>

	<!-- Navigation hint -->
	<div class="fixed bottom-8 right-8 text-white/60 text-sm hidden md:block">
		← → to navigate
	</div>
</div>

<style>
	:global(.hide-scrollbar) {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	:global(.hide-scrollbar::-webkit-scrollbar) {
		display: none;
	}
</style>
