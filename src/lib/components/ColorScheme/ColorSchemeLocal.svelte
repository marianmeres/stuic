<script lang="ts" module>
	/** ColorSchemeLocal has no props - it's a pure hydration component */
	export interface Props {}
</script>

<script lang="ts">
	import { ColorScheme } from "./color-scheme.svelte.js";
	$effect(() => {
		// Bootstrap <script> below has run by the time this effect fires;
		// re-seed the runtime from whatever the DOM is now showing.
		ColorScheme.syncFromDom();
	});
</script>

<!--
	Similar to ColorSchemeSystemAware, except that it never reads window.matchMedia and only
	relies on the local userland setting.

	If no preference is stored, this bootstrap leaves the `<html>` class
	alone — meaning the app's SSR'd default wins. Ship `<html class="dark">`
	from your `app.html` / SSR to default the app to dark; users can still
	override via `ColorScheme.toggle()` later.

	Uses the hardcoded default storage key "stuic-color-scheme". Apps that
	override the runtime key via `ColorScheme.configure({ key })` should ship
	their own inline bootstrap in `app.html` if FOUC-free hydration matters.
-->
<svelte:head>
	<script>
		// Block-scoped on purpose: a classic <script>'s top-level const/let lands
		// in the page's global lexical scope and persists even after the node is
		// removed. If this body ever runs a second time in the same realm — e.g.
		// Svelte re-inserting <svelte:head> while recovering from a hydration
		// mismatch — an unscoped `const KEY` throws "Identifier 'KEY' has already
		// been declared" and aborts hydration. The braces make re-execution a
		// harmless no-op (and keep KEY/cls/v out of the global namespace). Do not unwrap.
		{
			const KEY = window.__COLOR_SCHEME_KEY__ ?? "stuic-color-scheme";
			const cls = window.document.documentElement.classList;
			const v = localStorage.getItem(KEY);
			if (v === "dark") cls.add("dark");
			else if (v === "light") cls.remove("dark");
			// else: no stored preference — leave the SSR'd class alone.
		}
	</script>
</svelte:head>
