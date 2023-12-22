<script lang="ts" context="module">
	export class ColorScheme {
		static readonly KEY = 'color-scheme';

		static getSystemValue = () =>
			window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

		static getLocalValue = () => localStorage.getItem(ColorScheme.KEY);

		static getValue = () => {
			return ColorScheme.KEY in localStorage
				? localStorage.getItem(ColorScheme.KEY)
				: ColorScheme.getSystemValue();
		};

		static toggle = () => {
			// returns bool, indicating whether token is in the list after the call or not.
			const isDark = window.document.documentElement.classList.toggle('dark');
			localStorage.setItem(ColorScheme.KEY, isDark ? 'dark' : 'light');
		};

		static reset = () => {
			localStorage.removeItem(ColorScheme.KEY);
		};
	}
</script>

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
