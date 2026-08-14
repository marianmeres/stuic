<script lang="ts">
	import { dimBehind } from "./dim-behind.svelte.js";

	let {
		aOpen = false,
		bOpen = false,
		useContainers = false,
		sameContainer = false,
	}: {
		aOpen?: boolean;
		bOpen?: boolean;
		useContainers?: boolean;
		sameContainer?: boolean;
	} = $props();

	let containerA = $state<HTMLDivElement>();
	let containerB = $state<HTMLDivElement>();
</script>

<!-- Two independent shells, each a fixed containing block + stacking context
(the framed-app case the `container` option exists for). -->
<div
	bind:this={containerA}
	data-testid="container-a"
	style="contain: layout paint; width: 200px; height: 120px;"
>
	<div
		data-testid="target-a"
		use:dimBehind={() => ({
			open: aOpen,
			container: useContainers ? () => containerA ?? null : undefined,
		})}
	>
		A
	</div>
</div>

<div
	bind:this={containerB}
	data-testid="container-b"
	style="contain: layout paint; width: 200px; height: 120px;"
>
	<div
		data-testid="target-b"
		use:dimBehind={() => ({
			open: bOpen,
			container: useContainers
				? () => (sameContainer ? (containerA ?? null) : (containerB ?? null))
				: undefined,
		})}
	>
		B
	</div>
</div>
