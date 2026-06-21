<script lang="ts" module>
	/** ColorSchemeSystemAware has no props - it's a pure hydration component */
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
	Explicit opt-in for OS-aware first paint. The `ColorScheme` runtime itself
	never auto-derives from `prefers-color-scheme` — only this bootstrap does,
	and only at hydration when no preference is stored. If you do not want
	system preference taken into account, use the ColorSchemeLocal sibling.

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
		// harmless no-op (and keep KEY/cls out of the global namespace). Do not unwrap.
		{
			const KEY = window.__COLOR_SCHEME_KEY__ ?? "stuic-color-scheme";
			const cls = window.document.documentElement.classList;
			if (KEY in localStorage) {
				localStorage.getItem(KEY) === "dark" ? cls.add("dark") : cls.remove("dark");
			} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
				cls.add("dark");
			}
		}
	</script>
</svelte:head>
