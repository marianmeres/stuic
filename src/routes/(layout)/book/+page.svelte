<script lang="ts">
	import {
		Book,
		type BookPage,
		type BookPageArea,
		buildSpreads,
		buildSinglePageSpreads,
		Button,
	} from "$lib/index.js";

	// Sample pages using picsum placeholder images
	const pages: BookPage[] = Array.from({ length: 9 }, (_, i) => ({
		id: i,
		src: `https://picsum.photos/seed/book-page-${i}/420/600`,
		title: i === 0 ? "Cover" : `Page ${i}`,
	}));

	const evenPages = pages.slice(0, 6);
	const totalSpreads = buildSpreads(pages).length;
	const totalSingleSpreads = buildSinglePageSpreads(pages).length;

	let activeSpread = $state(0);
	let book: Book;

	let singleActiveSpread = $state(0);
	let singleBook: Book;

	let responsiveActiveSpread = $state(0);
	let responsiveBook: Book;

	// Clickable areas example — simulated product catalog
	const catalogPages: BookPage[] = Array.from({ length: 5 }, (_, i) => ({
		id: `catalog-${i}`,
		src: `https://picsum.photos/seed/catalog-${i}/420/600`,
		title: i === 0 ? "Catalog Cover" : `Catalog Page ${i}`,
		width: 420,
		height: 600,
		areas:
			i === 0
				? [] // no areas on cover
				: [
						{ id: `p${i}-product-1`, x: 20, y: 30, w: 180, h: 250, label: "Product A" },
						{ id: `p${i}-product-2`, x: 220, y: 30, w: 180, h: 250, label: "Product B" },
						{ id: `p${i}-product-3`, x: 20, y: 310, w: 180, h: 250, label: "Product C" },
						{ id: `p${i}-product-4`, x: 220, y: 310, w: 180, h: 250, label: "Product D" },
					],
	}));
	let lastClickedArea = $state<{ area: BookPageArea; page: BookPage } | null>(null);
</script>

<div class="space-y-16 py-8">
	<!-- Basic Book -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Book Component</h2>
		<p class="text-sm text-neutral-500 mb-4">
			9 pages: front cover + 3 interior spreads + back cover. Click buttons or use arrow
			keys (focus the book first). Swipe on touch devices.
		</p>

		<div class="flex flex-col items-center gap-6">
			<div
				class="w-full"
				style="--stuic-book-page-width: 280px; --stuic-book-page-height: 400px;"
			>
				<Book bind:this={book} {pages} bind:activeSpread />
			</div>

			<div class="flex items-center gap-4">
				<Button size="sm" onclick={() => book.previous()} disabled={activeSpread === 0}>
					Previous
				</Button>
				<span class="text-sm text-neutral-600 dark:text-neutral-400 min-w-32 text-center">
					Spread {activeSpread + 1} / {totalSpreads}
				</span>
				<Button
					size="sm"
					onclick={() => book.next()}
					disabled={activeSpread >= totalSpreads - 1}
				>
					Next
				</Button>
			</div>

			<div class="flex items-center gap-4">
				<Button size="sm" variant="outline" onclick={() => book.zoomIn()}>Zoom In</Button>
				<Button size="sm" variant="outline" onclick={() => book.zoomOut()}>
					Zoom Out
				</Button>
				<Button size="sm" variant="outline" onclick={() => book.resetZoom()}>
					Reset Zoom
				</Button>
			</div>

			<input
				type="range"
				min={0}
				max={totalSpreads - 1}
				bind:value={activeSpread}
				class="w-64"
			/>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Even page count (last page alone) -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Even Page Count (6 pages)</h2>
		<p class="text-sm text-neutral-500 mb-4">
			6 pages: cover + 2 full spreads + 1 lone last page. Demonstrates odd final spread.
		</p>

		<div class="flex flex-col items-center gap-6">
			<div
				class="w-full"
				style="--stuic-book-page-width: 240px; --stuic-book-page-height: 340px;"
			>
				<Book pages={evenPages} />
			</div>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Custom page rendering -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Custom Page Rendering</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Using the renderPage snippet for custom page content.
		</p>

		<div class="flex flex-col items-center gap-6">
			<div
				class="w-full"
				style="--stuic-book-page-width: 240px; --stuic-book-page-height: 340px;"
			>
				<Book pages={pages.slice(0, 5)}>
					{#snippet renderPage({ page, position })}
						<div class="relative w-full h-full">
							<img
								src={page.src}
								alt={page.title ?? ""}
								class="w-full h-full object-cover"
								draggable="false"
							/>
							<div
								class="absolute bottom-0 left-0 right-0 p-3 text-white text-sm font-medium"
								style="background: linear-gradient(transparent, rgba(0,0,0,0.6))"
							>
								{page.title} ({position})
							</div>
						</div>
					{/snippet}
				</Book>
			</div>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Forced Single-Page Mode -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Single-Page Mode (forced)</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Using <code>singlePage</code> prop. Each flip shows one page at a time. 9 pages = 9 spreads.
		</p>

		<div class="flex flex-col items-center gap-6">
			<div
				class="w-full"
				style="--stuic-book-page-width: 240px; --stuic-book-page-height: 340px;"
			>
				<Book
					bind:this={singleBook}
					{pages}
					singlePage
					bind:activeSpread={singleActiveSpread}
				/>
			</div>

			<div class="flex items-center gap-4">
				<Button
					size="sm"
					onclick={() => singleBook.previous()}
					disabled={singleActiveSpread === 0}
				>
					Previous
				</Button>
				<span class="text-sm text-neutral-600 dark:text-neutral-400 min-w-32 text-center">
					Page {singleActiveSpread + 1} / {totalSingleSpreads}
				</span>
				<Button
					size="sm"
					onclick={() => singleBook.next()}
					disabled={singleActiveSpread >= totalSingleSpreads - 1}
				>
					Next
				</Button>
			</div>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Responsive (auto-detect) -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Responsive (auto-detect)</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Container is 300px wide. The book auto-switches to single-page mode because 2
			&times; page width (480px) exceeds the container. Resize window to test.
		</p>

		<div class="flex flex-col items-center gap-6">
			<div
				class="border border-dashed border-neutral-300 dark:border-neutral-600 p-4"
				style="max-width: 300px;"
			>
				<div
					class="w-full"
					style="--stuic-book-page-width: 240px; --stuic-book-page-height: 340px;"
				>
					<Book
						bind:this={responsiveBook}
						{pages}
						bind:activeSpread={responsiveActiveSpread}
					/>
				</div>
			</div>

			<div class="flex items-center gap-4">
				<Button
					size="sm"
					onclick={() => responsiveBook.previous()}
					disabled={responsiveActiveSpread === 0}
				>
					Previous
				</Button>
				<span class="text-sm text-neutral-600 dark:text-neutral-400 min-w-32 text-center">
					Spread {responsiveActiveSpread + 1}
				</span>
				<Button size="sm" onclick={() => responsiveBook.next()}>Next</Button>
			</div>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Clickable Areas (product catalog) -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Clickable Areas</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Pages with SVG overlay areas (e.g. product hotspots). Hover to see highlight, click to
			trigger <code>onAreaClick</code>. Open a spread to see the areas.
		</p>

		<div class="flex flex-col items-center gap-6">
			<div
				class="w-full"
				style="--stuic-book-page-width: 280px; --stuic-book-page-height: 400px;"
			>
				<Book
					pages={catalogPages}
					onAreaClick={(data) => {
						lastClickedArea = data;
					}}
				/>
			</div>

			{#if lastClickedArea}
				<div
					class="text-sm bg-neutral-100 dark:bg-neutral-800 rounded px-4 py-2 text-center"
				>
					Clicked: <strong>{lastClickedArea.area.label}</strong>
					(id: {lastClickedArea.area.id}) on {lastClickedArea.page.title}
				</div>
			{/if}
		</div>
	</section>
</div>
