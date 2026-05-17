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
	If you do not wish to take the system preference into account use ColorSchemeLocal sibling.

	Uses the hardcoded default storage key "stuic-color-scheme". Apps that
	override the runtime key via `ColorScheme.configure({ key })` should ship
	their own inline bootstrap in `app.html` if FOUC-free hydration matters.
-->
<svelte:head>
	<script>
		const KEY = window.__COLOR_SCHEME_KEY__ ?? "stuic-color-scheme";
		const cls = window.document.documentElement.classList;
		if (KEY in localStorage) {
			localStorage.getItem(KEY) === "dark" ? cls.add("dark") : cls.remove("dark");
		} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
			cls.add("dark");
		}
	</script>
</svelte:head>
