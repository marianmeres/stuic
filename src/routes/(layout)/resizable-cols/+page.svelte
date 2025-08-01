<script>
	import { resizableCols } from "../../../lib/actions/resizable-cols.svelte.js";
</script>

<div
	class="border flex flex-1"
	use:resizableCols={() => ({
		divider: {
			initialSplit: 25,
		},
		// if provided, will store the value
		// key: "example-page",
	})}
>
	<div class="flex flex-col">left</div>
	<div class="">right</div>
</div>
