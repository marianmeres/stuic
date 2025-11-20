<script lang="ts" module>
	import { createClog } from "@marianmeres/clog";
	import { type Snippet } from "svelte";
	import { waitForNextRepaint } from "../../utils/paint.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import { sleep } from "../../utils/sleep.js";

	const clog = createClog("SlidingContainer");

	type PanelId = "A" | "B";

	// internal state values DRY consts
	const DIRECTION_RTL = "rtl";
	const DIRECTION_LTR = "ltr";
	const SLIDING_IN = "in";
	const SLIDING_OUT = "out";
	const ACTIVE = "active";
	const INACTIVE_LEFT = "inactive-left";
	const INACTIVE_RIGHT = "inactive-right";
	const DESTROYED = "destroyed";
</script>

<script lang="ts">
	let {
		class: classProp = "",
		destroyInactive = true,
		duration = 300,
		initial = "A",
		panelA,
		panelB = null,
	}: {
		class?: string;
		destroyInactive?: boolean;
		duration?: number;
		initial?: PanelId;
		panelA: Snippet<[{ show: typeof show; active: PanelId; inTransition: boolean }]>;
		panelB?: null | Snippet<
			[{ show: typeof show; active: PanelId; inTransition: boolean }]
		>;
	} = $props();

	//
	let active: PanelId = $state(initial);
	let inTransition = $state(false);

	// panel states
	let A = $state(initial === "A" ? ACTIVE : INACTIVE_LEFT);
	let B = $state(initial === "B" ? ACTIVE : INACTIVE_RIGHT);

	/** */
	export async function show(targetPanel: PanelId): Promise<boolean> {
		if (inTransition) {
			clog.warn("Transition in progress, ignoring...");
			return false;
		}

		if (active === targetPanel) {
			clog.debug(`Panel ${targetPanel} already active`);
			return false;
		}

		inTransition = true;
		const direction = targetPanel === "B" ? DIRECTION_RTL : DIRECTION_LTR;

		// set up states for transition
		if (direction === DIRECTION_RTL) {
			B = INACTIVE_RIGHT;

			// ensure panel exists before transitioning
			await waitForNextRepaint();

			A = SLIDING_OUT;
			B = SLIDING_IN;
		} else {
			A = INACTIVE_LEFT;

			// ensure panel exists before transitioning
			await waitForNextRepaint();

			B = SLIDING_OUT;
			A = SLIDING_IN;
		}

		// wait for transition to end
		await sleep(duration);

		// clean up after transition
		if (direction === DIRECTION_RTL) {
			A = destroyInactive ? DESTROYED : INACTIVE_LEFT;
			B = ACTIVE;
			active = "B";
		} else {
			B = destroyInactive ? DESTROYED : INACTIVE_RIGHT;
			A = ACTIVE;
			active = "A";
		}

		inTransition = false;

		return true;
	}

	/** To be able to consume from outside */
	export function current() {
		return {
			get active(): PanelId {
				return active;
			},
			get isTransitioning(): boolean {
				return inTransition;
			},
		};
	}

	const PANEL_CLASS = "absolute inset-0 transition-transform ease-in-out";
</script>

<div class={twMerge("relative w-full h-full overflow-hidden", classProp)}>
	<!-- Panel A -->
	{#if A !== DESTROYED}
		<div
			class={PANEL_CLASS}
			style="transition-duration:{duration}ms;"
			class:translate-x-0={[ACTIVE, SLIDING_IN].includes(A)}
			class:-translate-x-full={[INACTIVE_LEFT, SLIDING_OUT].includes(A)}
			class:translate-x-full={A === INACTIVE_RIGHT}
		>
			{@render panelA({ show, active, inTransition })}
		</div>
	{/if}

	<!-- Panel B -->
	{#if B !== DESTROYED}
		<div
			class={PANEL_CLASS}
			style="transition-duration:{duration}ms;"
			class:translate-x-0={[ACTIVE, SLIDING_IN].includes(B)}
			class:-translate-x-full={B === INACTIVE_LEFT}
			class:translate-x-full={[INACTIVE_RIGHT, SLIDING_OUT].includes(B)}
		>
			{@render panelB?.({ show, active, inTransition })}
		</div>
	{/if}
</div>
