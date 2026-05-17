<script lang="ts" module>
	/** ColorSchemeSystemAware has no props - it's a pure hydration component */
	export interface Props {}
</script>

<!--
	If you do not wish to take the system preference into account use ColorSchemeLocal sibling.

	Uses the hardcoded default storage key "stuic-color-scheme". Apps that
	override the runtime key via `ColorScheme.configure({ key })` should ship
	their own inline bootstrap in `app.html` if FOUC-free hydration matters.
-->
<svelte:head>
	<script>
		const KEY = "stuic-color-scheme";
		const cls = window.document.documentElement.classList;
		if (KEY in localStorage) {
			localStorage.getItem(KEY) === "dark" ? cls.add("dark") : cls.remove("dark");
		} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
			cls.add("dark");
		}
	</script>
</svelte:head>
