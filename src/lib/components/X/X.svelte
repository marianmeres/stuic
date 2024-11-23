<script lang="ts">
	import { twMerge2 } from '../../utils/tw-merge2.js';

	let _class = '';
	export { _class as class };

	export let strokeWidth: 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 = 2;

	// size-6 is 1.5rem, 24px
</script>

<svg
	fill="none"
	viewBox="0 0 24 24"
	stroke-width={strokeWidth}
	stroke="currentColor"
	class={twMerge2(`inline size-6 ${_class}`)}
>
	<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>
