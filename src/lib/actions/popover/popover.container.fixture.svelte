<script lang="ts">
	import { popover } from "./popover.svelte.js";

	let { open = false, useContainer = false }: { open?: boolean; useContainer?: boolean } =
		$props();

	let shell = $state<HTMLDivElement>();
</script>

<!-- A bounded shell that is a fixed containing block + stacking context. -->
<div
	bind:this={shell}
	data-testid="shell"
	style="contain: layout paint; width: 300px; height: 200px;"
></div>

<button
	data-testid="trigger"
	use:popover={() => ({
		content: "Hello",
		open,
		container: useContainer ? () => shell ?? null : undefined,
	})}
>
	trigger
</button>
