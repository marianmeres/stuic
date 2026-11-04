<script lang="ts">
	import { goto, snapshot } from "$app/navigation";
	import { Searchable } from "@marianmeres/searchable";

	// prettier-ignore
	const topLevel = [
		'accordion',
		'alert-confirm-prompt',
		'animated-ellipsis',
		'auto-height',
		'avatar',
		'app-shell',
		'app-shell-simple', 
		'assets-preview', 
		// 'avatar', 
		'backdrop',
		'breadcrumbs',
        'button',
        'button-group-radio', 
        'calendar',
		'carousel', 
		'card',
		'cart',
		'checkout',
		'code-block',
		'collapsible', 
        'color-picker',
		'color-scheme', 
		'command-menu',
		'comment-input',
		'contact-us-form',
		'context-menu',
		'copy-button',
		'cron-input',
		'description-list',
		'dim-behind',
		'dismissible-message',
        'data-table', 
        // 'drag-drop', 
        'drawer',
        'dropdown-menu',
		'empty-state',
		'fields-builder',
		'file-dropzone',
		'float',
		'frame',
		'frame-nested',
		'h',
		'header',
		'hover-expandable-width',
		'image-cycler',
		'icons',
		'icon-swap',
		'input',
		'input-history',
		'kbd-shortcut',
		'list-group',
		'list-item-button',
		'login-form',
		'login-or-register-form',
		'markdown-editor',
		'modal-dialog',
		'modal',
		'nav',
		'notifications',
		'onboarding',
		'otp-input',
		// 'on-outside',
		'pagination',
		'phone-frame',
		'pill',
		'popover',
		'pricing-table',
		'progress',
		'range-slider',
		'rating',
		'register-form',
		'resizable-width',
		'separator', 
		'skeleton',
		'slider',
		'sliding-panels',
		'spotlight',
		'spinner',
		'split-button',
		'split-pane',
		'stat',
		'stepper',
		'style-presets',
		'svg-circle',
        'switch', 
		// 'table', 
		'tabbed-menu',
        'thc', 
        'theme-preview', 
		'gantt',
		'timeline',
        'tooltip',
		'trend-chart',
        'tree',
        'tw-check',
		'user-avatar-menu',
		'wheel-picker',
		'with-side-panel',
		// 'viewport',
		'x'
	];

	// "input" sub-pages are hoisted to the top level, read from the filesystem so new
	// ones show up on their own (lazy glob: only the paths are used, nothing is imported)
	const inputPages = Object.keys(import.meta.glob("./input/*/+page.svelte")).map((path) =>
		path.slice("./".length, -"/+page.svelte".length)
	);

	// "/" → " " sorts "input/*" right after "input", before "input-history"
	const sortKey = (link: string) => link.replaceAll("/", " ");
	const links = [...topLevel, ...inputPages].toSorted((a, b) =>
		sortKey(a) < sortKey(b) ? -1 : 1
	);

	// "-" is a word char by default; dropping it splits "data-table" into two words
	// (on both index and query side), so "table" and "data ta" both find it
	const index = new Searchable({ index: "trie", nonWordCharWhitelist: "" });
	for (const link of links) index.add(link, link);

	let q = $state("");
	let active = $state(0);

	const filtered = $derived.by(() => {
		const query = q.trim();
		if (!query) return links;
		let found = index.search(query, "prefix");
		// typo tolerance, but only once the query is long enough not to match everything
		if (!found.length && query.length >= 4) {
			found = index.search(query, "fuzzy", { maxDistance: 1 });
		}
		const hits = new Set(found);
		// alphabetical, except slugs (or their last segment, e.g. "input/date")
		// starting with the query go first (Enter opens #1)
		const head = query.toLowerCase().replace(/[\s_]+/g, "-");
		const rank = (l: string) =>
			l.startsWith(head) || l.split("/").at(-1)!.startsWith(head) ? 0 : 1;
		return links.filter((l) => hits.has(l)).toSorted((a, b) => rank(a) - rank(b));
	});

	const linkId = (link: string) => `home-link-${link}`;

	function onkeydown(e: KeyboardEvent) {
		if (e.key === "ArrowDown" || e.key === "ArrowUp") {
			e.preventDefault();
			if (!filtered.length) return;
			const step = e.key === "ArrowDown" ? 1 : -1;
			active = (active + step + filtered.length) % filtered.length;
			document
				.getElementById(linkId(filtered[active]))
				?.scrollIntoView({ block: "nearest" });
		} else if (e.key === "Enter") {
			const target = filtered[active];
			if (target) {
				e.preventDefault();
				goto(`/${target}`);
			}
		} else if (e.key === "Escape") {
			q = "";
			active = 0;
		}
	}

	// keeps the query when coming back from an example page via browser back
	snapshot({
		capture: () => q,
		restore: (value: string) => (q = value),
	});
</script>

<div class="p-4">
	<div class="sticky top-0 z-10 pb-4 bg-stone-50 dark:bg-stone-800">
		<!-- SvelteKit focuses [autofocus] after client-side navigation, so typing works right away -->
		<!-- svelte-ignore a11y_autofocus -->
		<input
			type="search"
			bind:value={q}
			oninput={() => (active = 0)}
			{onkeydown}
			autofocus
			autocomplete="off"
			spellcheck="false"
			placeholder="Filter... (↑↓ to move, Enter to open, Esc to clear)"
			aria-label="Filter components"
			class="w-full p-2 px-4 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
		/>
		<div class="mt-1 px-1 text-sm opacity-60">
			{filtered.length} / {links.length}
		</div>
	</div>

	<ul class="space-y-2">
		{#each filtered as link, i (link)}
			{@const parent = link.slice(0, link.lastIndexOf("/") + 1)}
			{@const name = link.slice(parent.length)}
			<li>
				<a
					id={linkId(link)}
					href={link}
					class={[
						"block p-2 px-4 rounded-lg hover:text-white hover:bg-neutral-600",
						q.trim() && i === active
							? "text-white bg-neutral-600"
							: "bg-neutral-200 dark:bg-neutral-900",
					]}><span class="opacity-60">{parent}</span>{name}</a
				>
			</li>
		{:else}
			<li class="px-1 opacity-60">No match for "{q.trim()}"</li>
		{/each}
	</ul>
</div>
