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

	Uses the hardcoded default storage key "stuic-color-scheme". Apps that
	override the runtime key via `ColorScheme.configure({ key })` should ship
	their own inline bootstrap in `app.html` if FOUC-free hydration matters.
-->
<svelte:head>
	<script>
		const KEY = "stuic-color-scheme";
		const cls = window.document.documentElement.classList;
		localStorage.getItem(KEY) === "dark" ? cls.add("dark") : cls.remove("dark");
	</script>
</svelte:head>
