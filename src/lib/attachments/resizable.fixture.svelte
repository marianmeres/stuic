<!--
	TEST-ONLY fixture for the `resizable` attachment (and the `resizableWidth` action
	wrapper). A 400x300 flex container, the resized element first, a flexing sibling
	after it; `external` adds a sibling to serve as the provided handle; `unmount`
	tears the whole thing down so cleanup can be observed on the detached nodes.
-->
<script lang="ts">
	import { resizable, type ResizableOptions } from "./resizable.js";
	import {
		resizableWidth,
		type ResizableWidthOptions,
	} from "../actions/resizable-width.svelte.js";

	let {
		options = {} as ResizableOptions,
		action = undefined as ResizableWidthOptions | undefined,
		external = false,
		vertical = false,
	} = $props();

	let handleEl = $state<HTMLDivElement>();
	let mounted = $state(true);
</script>

<div
	data-testid="container"
	style="width:400px;height:300px;display:flex;flex-direction:{vertical
		? 'column'
		: 'row'}"
>
	{#if mounted}
		{#if action}
			<div data-testid="el" style="width:100px" use:resizableWidth={() => action}>el</div>
		{:else}
			<div
				data-testid="el"
				style={vertical ? "height:100px" : "width:100px"}
				{@attach external
					? handleEl && resizable({ ...options, handle: handleEl })
					: resizable(options)}
			>
				el
			</div>
		{/if}
		{#if external}
			<div data-testid="handle" data-foo="bar" bind:this={handleEl}></div>
		{/if}
	{/if}
	<div style="flex:1">rest</div>
</div>
<button type="button" data-testid="unmount" onclick={() => (mounted = false)}
	>unmount</button
>
