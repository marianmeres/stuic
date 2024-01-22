<script lang="ts">
	import { tooltip, type TooltipOptions } from '../../actions/tooltip/tooltip.js';

	export let options: Partial<TooltipOptions> = {};

	const POPOVER_DEFAULTS: Partial<TooltipOptions> = {
		hideOnInsufficientSpace: true,
		triggers: ['click'],
	};

	let popover: HTMLElement;
</script>

{#if popover}
	<span
		use:tooltip={{
			...POPOVER_DEFAULTS,
			...(options || {}),
			popover,
		}}
	>
		<slot />
	</span>
{/if}

<div bind:this={popover} class="hidden">
	<slot name="popover" />
</div>
