<script lang="ts">
	import { BookResponsive, type BookPage } from "$lib/index.js";

	const pages: BookPage[] = Array.from({ length: 9 }, (_, i) => ({
		id: i,
		src: `https://picsum.photos/seed/book-page-${i}/420/600`,
		title: i === 0 ? "Cover" : `Page ${i}`,
		width: 420,
		height: 600,
	}));
</script>

<BookResponsive {pages} />
