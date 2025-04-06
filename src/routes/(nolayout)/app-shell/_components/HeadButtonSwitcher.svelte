<script lang="ts">
	import { parseBoolean } from "@marianmeres/parse-boolean";
	import { twMerge } from "$lib/index.js";

	let { flag = $bindable(), label }: { flag: boolean; label: string } = $props();

	let key = $derived(`stuic-${label}`);

	$effect(() => {
		flag = parseBoolean(sessionStorage.getItem(key) || false);
	});

	$effect(() => {
		sessionStorage.setItem(key, Number(flag).toString());
	});

	// $inspect(key, flag);
</script>

<button
	class={twMerge(
		"text-xs px-1 rounded",
		!flag && "bg-gray-200 text-neutral-950",
		flag && "bg-gray-600 text-neutral-50"
	)}
	onclick={() => (flag = !flag)}
>
	{label}
</button>
