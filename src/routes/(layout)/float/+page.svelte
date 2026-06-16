<script lang="ts">
	import {
		Button,
		Switch,
		Float,
		FLOAT_PLACEMENTS,
		type FloatPlacement,
	} from "$lib/index.js";
	import { iconGripVertical } from "$lib/icons/index.js";

	// refs for the imperative API
	let panel: Float = $state()!;

	// demo "scene" values the panel tweaks
	let fov = $state(50);
	let intensity = $state(0.6);
	let wireframe = $state(false);
	let bg = $state("#3344ff");

	let placement = $state<FloatPlacement>("top-right");

	// closable demo
	let showClosable = $state(true);

	// persisted demo (position + minimized survive reloads under this key)
	const STORAGE_KEY = "demo-panel";
</script>

<div class="space-y-4 max-w-2xl">
	<p>
		<code>Float</code> is a draggable, collapsible floating panel positioned by params (<code
			>x</code
		>/<code>y</code> or a named <code>placement</code>) and driven imperatively. Drag it
		anywhere on the header, double-click the header (or the chevron) to minimize, and it
		stays clamped inside the viewport.
	</p>

	<!-- imperative control bar -->
	<div class="flex flex-wrap items-center gap-2">
		<Button size="sm" onclick={() => panel?.minimize()}>minimize()</Button>
		<Button size="sm" onclick={() => panel?.expand()}>expand()</Button>
		<Button size="sm" onclick={() => panel?.bringToFront()}>bringToFront()</Button>
		<Button size="sm" onclick={() => panel?.moveTo(24, 24)}>moveTo(24, 24)</Button>

		<label class="inline-flex items-center gap-1 text-sm">
			placement:
			<select
				bind:value={placement}
				class="border rounded px-1 py-0.5 bg-transparent"
				onchange={() => panel?.moveToPlacement(placement)}
			>
				{#each FLOAT_PLACEMENTS as a (a)}
					<option value={a}>{a}</option>
				{/each}
			</select>
		</label>
	</div>

	<!-- a live readout of the values the panel controls -->
	<div
		class="rounded-lg border p-4 text-sm font-mono"
		style="background: {bg}; color: white;"
	>
		fov: {fov} · intensity: {intensity} · wireframe: {wireframe} · bg: {bg}
	</div>

	<p class="text-sm opacity-70">
		Three panels are mounted (top-right, the persisted one, and a closable one). Click a
		buried panel to bring it to front. The middle panel remembers its position + minimized
		state across reloads (<code>storageKey="{STORAGE_KEY}"</code>).
	</p>
</div>

<!-- ============================================================= -->
<!-- main tweak panel: placed top-right, with icon + header action -->
<!-- ============================================================= -->
<Float bind:this={panel} title="Scene settings" placement="top-right" width={280}>
	{#snippet icon()}
		<span class="opacity-60">{@html iconGripVertical({ size: 16 })}</span>
	{/snippet}

	{#snippet actions()}
		<button
			type="button"
			data-no-drag
			class="stuic-float-btn"
			title="Reset position"
			aria-label="Reset position"
			onclick={() => panel?.moveToPlacement("top-right")}
		>
			↺
		</button>
	{/snippet}

	<div class="space-y-3">
		<label class="block text-sm space-y-1">
			<span>Field of view: {fov}</span>
			<input type="range" min="10" max="120" bind:value={fov} class="w-full" />
		</label>

		<label class="block text-sm space-y-1">
			<span>Light intensity: {intensity}</span>
			<input
				type="range"
				min="0"
				max="1"
				step="0.05"
				bind:value={intensity}
				class="w-full"
			/>
		</label>

		<label class="flex items-center justify-between text-sm">
			<span>Wireframe</span>
			<Switch bind:checked={wireframe} label="Wireframe" />
		</label>

		<label class="flex items-center justify-between text-sm">
			<span>Background</span>
			<input type="color" bind:value={bg} />
		</label>
	</div>
</Float>

<!-- ============================================================= -->
<!-- persisted panel -->
<!-- ============================================================= -->
<Float title="Persisted" placement="left" width={220} storageKey={STORAGE_KEY}>
	<p class="text-sm">
		Drag me and minimize me, then reload the page — my position and minimized state are
		restored from <code>localStorage</code>.
	</p>
</Float>

<!-- ============================================================= -->
<!-- closable panel -->
<!-- ============================================================= -->
{#if showClosable}
	<Float
		title="Closable"
		placement="bottom-right"
		width={220}
		closable
		onClose={() => (showClosable = false)}
	>
		<p class="text-sm">
			I have a close button (and Escape closes me). Closing fires <code>onClose</code>;
			the page decides to unmount me.
		</p>
	</Float>
{:else}
	<div class="fixed bottom-4 right-4">
		<Button size="sm" onclick={() => (showClosable = true)}>Re-open closable panel</Button
		>
	</div>
{/if}
