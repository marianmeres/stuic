<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	let _class = '';
	export { _class as class };

	export let size = '1em';
</script>

<svg
	fill="none"
	viewBox="0 0 24 24"
	stroke-width="1.5"
	stroke="currentColor"
	style="width:{size};height:{size};"
	class={twMerge(`inline ${_class}`)}
>
	<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>
