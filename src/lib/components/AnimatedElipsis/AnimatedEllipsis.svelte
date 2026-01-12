<script lang="ts" module>
	export interface Props {
		class?: string;
		enabled?: boolean;
		/** Animation cycle duration in ms (default: 1000) */
		speed?: number;
	}
</script>

<script lang="ts">
	let { class: _class, enabled = true, speed = 1000 }: Props = $props();
</script>

<!-- prettier-ignore -->
<span class={_class} style:--duration="{speed}ms"
	><span class="dot dot1" class:paused={!enabled}>.</span
	><span class="dot dot2" class:paused={!enabled}>.</span
	><span class="dot dot3" class:paused={!enabled}>.</span
></span>

<style>
	.dot {
		opacity: 0;
	}

	.dot1 {
		animation: dot1 var(--duration, 1s) infinite linear;
	}
	.dot2 {
		animation: dot2 var(--duration, 1s) infinite linear;
	}
	.dot3 {
		animation: dot3 var(--duration, 1s) infinite linear;
	}

	.dot.paused {
		animation: none;
		opacity: 1;
	}

	@keyframes dot1 {
		0%,
		20% {
			opacity: 0;
		}
		25% {
			opacity: 1;
		}
		80% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}

	@keyframes dot2 {
		0%,
		45% {
			opacity: 0;
		}
		50% {
			opacity: 1;
		}
		80% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}

	@keyframes dot3 {
		0%,
		70% {
			opacity: 0;
		}
		75% {
			opacity: 1;
		}
		80% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}
</style>
