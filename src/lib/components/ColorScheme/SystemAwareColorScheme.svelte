<!-- 
	If you do not wish to take the system preference into account use LocalColorScheme sibling
-->
<svelte:head>
	<script>
		const KEY = 'color-scheme';
		const cls = window.document.documentElement.classList;
		if (KEY in localStorage) {
			localStorage.getItem(KEY) === 'dark' ? cls.add('dark') : cls.remove('dark');
		} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			cls.add('dark');
		}
	</script>
</svelte:head>
