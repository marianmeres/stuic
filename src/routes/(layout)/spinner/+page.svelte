<script>
	import Spinner from "$lib/components/Spinner/Spinner.svelte";

	let w = ["w-4", "w-5", "w-8", "w-16"];
	let size = 1;
	let count = 8;
	let duration = 750;
</script>

<div class="flex items-center space-x-6">
	<span class="flex items-center space-x-2">
		<input type="range" bind:value={count} min={3} max={12} step="1" />
		<span>{count}</span>
	</span>
	<span class="flex items-center space-x-2">
		<input type="range" bind:value={duration} min={400} max={2000} step="100" />
		<span>{duration}</span>
	</span>
	<span class="flex items-center space-x-2">
		<input type="range" bind:value={size} min={0} max={3} step="1" />
	</span>
</div>

<div class="space-y-6 mt-6">
	<div class="space-x-6">
		<Spinner class={w[size]} {count} {duration} thickness="thin" height="short" />
		<Spinner class={w[size]} {count} {duration} thickness="thin" height="normal" />
		<Spinner class={w[size]} {count} {duration} thickness="thin" height="tall" />
	</div>
	<div class="space-x-6">
		<Spinner class={w[size]} {count} {duration} thickness="normal" height="short" />
		<Spinner class={w[size]} {count} {duration} thickness="normal" height="normal" />
		<Spinner class={w[size]} {count} {duration} thickness="normal" height="tall" />
	</div>
	<div class="space-x-6">
		<Spinner class={w[size]} {count} {duration} thickness="thick" height="short" />
		<Spinner class={w[size]} {count} {duration} thickness="thick" height="normal" />
		<Spinner class={w[size]} {count} {duration} thickness="thick" height="tall" />
	</div>
</div>
