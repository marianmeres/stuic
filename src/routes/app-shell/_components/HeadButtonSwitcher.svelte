<script lang="ts">
	import { parseBoolean } from '@marianmeres/parse-boolean';

	export let flag: boolean;
	export let label: string;

	$: key = `stuic-${label}`;
	$: flag = parseBoolean(sessionStorage.getItem(key) || false);
	$: sessionStorage.setItem(key, Number(flag).toString());
</script>

<button
	class="text-xs px-1 rounded"
	class:bg-gray-200={!flag}
	class:text-neutral-950={!flag}
	class:bg-gray-600={flag}
	class:text-neutral-50={flag}
	on:click={() => (flag = !flag)}
>
	{label}
</button>
