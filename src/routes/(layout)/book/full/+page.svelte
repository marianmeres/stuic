<script lang="ts">
	import { BookResponsive, type BookPage } from "$lib/index.js";

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

<BookResponsive
	{pages}
	onAreaClick={({ area, page }) => {
		console.log("onAreaClick", { area, page });
	}}
/>
