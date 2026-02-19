<script lang="ts">
	import { BookResponsive, Button, type BookPage } from "$lib/index.js";

	let forceInline = $state(false);

	const pages: BookPage[] = Array.from({ length: 9 }, (_, i) => ({
		id: i,
		src: `https://picsum.photos/seed/book-page-${i}/420/600`,
		title: i === 0 ? "Cover" : `Page ${i}`,
		width: 420,
		height: 600,
		areas: [
			{ id: `${i}-top`, x: 60, y: 40, w: 300, h: 120, label: "Header" },
			{ id: `${i}-mid`, x: 110, y: 250, w: 200, h: 100, label: "Center" },
		],
	}));
</script>

<div class="absolute top-2 right-2 z-10">
	<Button size="sm" variant="outline" onclick={() => (forceInline = !forceInline)}>
		{forceInline ? "Book mode" : "Inline mode"}
	</Button>
</div>

<BookResponsive
	{pages}
	{forceInline}
	onAreaClick={({ area, page }) => {
		console.log("onAreaClick", { area, page });
	}}
/>
