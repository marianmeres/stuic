<!-- 
    Similar to PrefersColorScheme, except that it never reads window.matchMedia and only
    relies on the local userland setting
-->
<svelte:head>
	<script>
		const KEY = 'color-scheme';
		const cls = window.document.documentElement.classList;
		localStorage.getItem(KEY) === 'dark' ? cls.add('dark') : cls.remove('dark');
	</script>
</svelte:head>
