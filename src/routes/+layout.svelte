<script>
	let { children } = $props();
	import '../app.css';
</script>

<div class="p-4">
	{@render children()}
</div>
