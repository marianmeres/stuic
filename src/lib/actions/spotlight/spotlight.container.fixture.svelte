<script lang="ts">
	import { spotlight } from "./spotlight.svelte.js";

	let { open = false, useContainer = false }: { open?: boolean; useContainer?: boolean } =
		$props();

	let shell = $state<HTMLDivElement>();
</script>

<!-- A bounded shell that is a fixed containing block + stacking context. The
target sits at a known offset inside it so the clip-path hole coordinates can
be asserted container-locally. -->
<div
	bind:this={shell}
	data-testid="shell"
	style="contain: layout paint; width: 240px; height: 180px; position: relative;"
>
	<button
		data-testid="target"
		style="position: absolute; left: 40px; top: 30px; width: 60px; height: 20px;"
		use:spotlight={() => ({
			content: "hi",
			open,
			padding: 4,
			borderRadius: 0,
			scrollIntoView: false,
			autoTrack: false,
			container: useContainer ? () => shell ?? null : undefined,
		})}
	>
		x
	</button>
</div>
