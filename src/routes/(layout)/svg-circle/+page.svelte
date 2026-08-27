<script lang="ts">
	import { iconCheck, svgCircle, type SvgCircleOptions } from "$lib/index.js";
	import type { Attachment } from "svelte/attachments";

	// The helper is framework agnostic: it returns a plain DOM <svg> (plus setters), so
	// mounting it is just "append, and remove on cleanup". In Svelte an attachment is
	// the tidiest way to say that.
	function circle(options: Partial<SvgCircleOptions> = {}): Attachment<HTMLElement> {
		return (node) => {
			const { svg } = svgCircle(options);
			node.appendChild(svg);
			return () => svg.remove();
		};
	}

	// `bgStrokeColor` takes any CSS color, so a currentColor mix gives us a track that
	// follows the current text color (and so the color scheme) for free.
	const TRACK = "color-mix(in srgb, currentColor 15%, transparent)";

	//
	// Playground -----------------------------------------------------------------
	//
	let pgSize = $state(160);
	let pgStrokeWidth = $state(10);
	let pgCompleteness = $state(0.7);
	let pgRotate = $state(-90);
	let pgRoundedEdges = $state(true);
	let pgStrokeWidthRatio = $state(0);
	let pgTrack = $state(true);

	let pgHost: HTMLDivElement = $state()!;

	// Note the split: structural options rebuild the svg, while `completeness` and
	// `rotate` go through the setters - no DOM re-creation, just two attribute writes.
	let pgApi = $derived(
		svgCircle({
			strokeWidth: pgStrokeWidth,
			roundedEdges: pgRoundedEdges,
			strokeWidthRatio: pgStrokeWidthRatio,
			bgStrokeColor: pgTrack ? TRACK : "",
		})
	);

	$effect(() => {
		// Capture the instance: the teardown must remove *this* svg. Reading `pgApi`
		// again inside the teardown would resolve to the freshly recomputed one and
		// leave the old node behind.
		const { svg } = pgApi;
		pgHost.appendChild(svg);
		return () => svg.remove();
	});

	$effect(() => {
		pgApi.setCompleteness(pgCompleteness);
	});

	$effect(() => {
		pgApi.setRotate(pgRotate);
	});

	//
	// Animated completeness (CSS transition via `circleStyle`) ---------------------
	//
	let downloaded = $state(0);
	let downloadHost: HTMLDivElement = $state()!;

	let downloadApi = $derived(
		svgCircle({
			strokeWidth: 12,
			bgStrokeColor: TRACK,
			circleStyle: "transition: stroke-dashoffset 600ms ease-in-out;",
		})
	);

	$effect(() => {
		const { svg } = downloadApi;
		downloadHost.appendChild(svg);
		return () => svg.remove();
	});

	$effect(() => {
		downloadApi.setCompleteness(downloaded / 100);
	});

	//
	// rAF spinner (setRotate straight from the loop) -------------------------------
	//
	let spinning = $state(true);
	let spinnerHost: HTMLDivElement = $state()!;
	// deliberately NOT $state: the loop writes it 60 times a second and nothing in the
	// template needs to know - which is exactly what the imperative setters are for
	let spinnerDeg = 0;

	$effect(() => {
		const api = svgCircle({
			completeness: 0.25,
			strokeWidth: 10,
			bgStrokeColor: TRACK,
		});
		api.setRotate(spinnerDeg);
		spinnerHost.appendChild(api.svg);

		let raf = 0;
		let last = performance.now();
		const loop = (t: number) => {
			spinnerDeg = (spinnerDeg + (t - last) * 0.36) % 360;
			last = t;
			api.setRotate(spinnerDeg);
			raf = requestAnimationFrame(loop);
		};
		if (spinning) raf = requestAnimationFrame(loop);

		return () => {
			cancelAnimationFrame(raf);
			api.svg.remove();
		};
	});
</script>

{#snippet ring(label: string, cls: string, options: Partial<SvgCircleOptions>)}
	<div class="flex flex-col items-center gap-2">
		<div class={cls} {@attach circle(options)}></div>
		<code class="text-xs text-neutral-500">{label}</code>
	</div>
{/snippet}

{#snippet gauge(percent: number, size: number, textCls: string, strokeWidth: number)}
	<div class="relative" style="width: {size}px; height: {size}px;">
		<div
			class="absolute inset-0"
			{@attach circle({
				strokeWidth,
				completeness: percent / 100,
				rotate: -90,
				bgStrokeColor: TRACK,
			})}
		></div>
		<div
			class={["absolute inset-0 flex items-center justify-center tabular-nums", textCls]}
		>
			{percent}%
		</div>
	</div>
{/snippet}

<h2 class="text-xl font-bold mb-4">svgCircle</h2>

<p class="max-w-2xl mb-8 text-sm text-neutral-500">
	A dependency free helper that builds an <code>&lt;svg&gt;</code> ring as a plain DOM
	node and hands back <code>setCompleteness</code> / <code>setRotate</code> to update it
	in place. It renders into a fixed <code>100&times;100</code> viewBox at
	<code>width/height: 100%</code>, so <strong>the container decides the size</strong> and
	the stroke defaults to
	<code>currentColor</code>. For the common Svelte case there is also a thin
	<code>&lt;Circle&gt;</code> wrapper around it.
</p>

<h3 class="font-semibold mb-2">Basic</h3>
<div class="flex flex-wrap items-center gap-8 mb-8">
	{@render ring("svgCircle()", "size-16", {})}
	{@render ring("completeness: 0.75", "size-16", { completeness: 0.75 })}
	{@render ring("+ rotate: -90", "size-16", { completeness: 0.75, rotate: -90 })}
	{@render ring("+ bgStrokeColor", "size-16", {
		completeness: 0.75,
		rotate: -90,
		bgStrokeColor: TRACK,
	})}
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Sizes</h3>
<p class="text-sm text-neutral-500 mb-4">
	Identical options, different containers. Because the viewBox is fixed, the stroke scales
	with the box - <code>strokeWidth: 10</code> is always 10% of the diameter.
</p>
<div class="flex flex-wrap items-end gap-8 mb-8">
	{@render ring("size-6", "size-6", {
		completeness: 0.7,
		rotate: -90,
		bgStrokeColor: TRACK,
	})}
	{@render ring("size-10", "size-10", {
		completeness: 0.7,
		rotate: -90,
		bgStrokeColor: TRACK,
	})}
	{@render ring("size-16", "size-16", {
		completeness: 0.7,
		rotate: -90,
		bgStrokeColor: TRACK,
	})}
	{@render ring("size-24", "size-24", {
		completeness: 0.7,
		rotate: -90,
		bgStrokeColor: TRACK,
	})}
	{@render ring("size-40", "size-40", {
		completeness: 0.7,
		rotate: -90,
		bgStrokeColor: TRACK,
	})}
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Thickness</h3>
<p class="text-sm text-neutral-500 mb-4">
	<code>strokeWidth</code> is in viewBox units. The radius shrinks to keep the stroke
	inside the box (<code>r = 50 - strokeWidth / 2</code>), so <code>50</code> collapses the ring
	into a filled disc and there is nothing left above it.
</p>
<div class="flex flex-wrap items-center gap-8 mb-8">
	{#each [2, 5, 10, 20, 35, 50] as sw (sw)}
		{@render ring(`strokeWidth: ${sw}`, "size-20", {
			strokeWidth: sw,
			completeness: 0.7,
			rotate: -90,
			bgStrokeColor: TRACK,
		})}
	{/each}
</div>

<div class="mb-8">
	<p class="text-sm text-neutral-500 mb-4">
		Same thickness in <em>pixels</em> across sizes needs an inverse scale:
		<code>strokeWidth = (px / boxPx) * 100</code>.
	</p>
	<div class="flex flex-wrap items-end gap-8">
		{#each [32, 56, 88, 128] as px (px)}
			<div class="flex flex-col items-center gap-2">
				<div
					style="width: {px}px; height: {px}px;"
					{@attach circle({
						strokeWidth: (5 / px) * 100,
						completeness: 0.7,
						rotate: -90,
						bgStrokeColor: TRACK,
					})}
				></div>
				<code class="text-xs text-neutral-500">{px}px box, 5px stroke</code>
			</div>
		{/each}
	</div>
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Stroke width ratio (clamping)</h3>
<p class="text-sm text-neutral-500 mb-4">
	<code>strokeWidthRatio</code> caps the stroke at a fraction of the radius, which is
	handy when the width comes from user input. All four ask for
	<code>strokeWidth: 40</code>.
</p>
<div class="flex flex-wrap items-center gap-8 mb-8">
	{#each [0, 0.6, 0.4, 0.2] as ratio (ratio)}
		{@render ring(`strokeWidthRatio: ${ratio}`, "size-20", {
			strokeWidth: 40,
			strokeWidthRatio: ratio,
			completeness: 0.7,
			rotate: -90,
			bgStrokeColor: TRACK,
		})}
	{/each}
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Completeness</h3>
<p class="text-sm text-neutral-500 mb-4">
	<code>0</code> to <code>1</code> (values outside are clamped).
</p>
<div class="flex flex-wrap items-center gap-8 mb-8">
	{#each [0, 0.1, 0.25, 0.5, 0.75, 1] as c (c)}
		{@render ring(`${c}`, "size-16", {
			completeness: c,
			rotate: -90,
			bgStrokeColor: TRACK,
		})}
	{/each}
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Rotation</h3>
<p class="text-sm text-neutral-500 mb-4">
	The arc starts at 3 o'clock, so progress rings usually want
	<code>rotate: -90</code>. Degrees wrap modulo 360.
</p>
<div class="flex flex-wrap items-center gap-8 mb-8">
	{#each [0, -90, 90, 180, 45] as r (r)}
		{@render ring(`rotate: ${r}`, "size-16", {
			completeness: 0.25,
			rotate: r,
			bgStrokeColor: TRACK,
		})}
	{/each}
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Line caps</h3>
<div class="flex flex-wrap items-center gap-8 mb-8">
	{@render ring("roundedEdges: true", "size-20", {
		strokeWidth: 16,
		completeness: 0.6,
		rotate: -90,
		bgStrokeColor: TRACK,
	})}
	{@render ring("roundedEdges: false", "size-20", {
		strokeWidth: 16,
		completeness: 0.6,
		rotate: -90,
		roundedEdges: false,
		bgStrokeColor: TRACK,
	})}
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Color</h3>
<p class="text-sm text-neutral-500 mb-4">
	The stroke is <code>currentColor</code>, so it inherits the text color. Use
	<code>class</code> (applied to the <code>&lt;svg&gt;</code>) or
	<code>circleStyle</code> (applied to the <code>&lt;circle&gt;</code>) to override.
</p>
<div class="flex flex-wrap items-center gap-8 mb-8">
	{@render ring("inherited", "size-16", {
		completeness: 0.7,
		rotate: -90,
		bgStrokeColor: TRACK,
	})}
	{@render ring('class: "text-red-500"', "size-16", {
		class: "text-red-500",
		completeness: 0.7,
		rotate: -90,
		bgStrokeColor: TRACK,
	})}
	{@render ring("circleStyle: stroke", "size-16", {
		circleStyle: "stroke: oklch(0.72 0.19 145);",
		completeness: 0.7,
		rotate: -90,
		bgStrokeColor: TRACK,
	})}
	{@render ring("circleStyle: css var", "size-16", {
		circleStyle: "stroke: var(--stuic-color-primary);",
		completeness: 0.7,
		rotate: -90,
		bgStrokeColor: TRACK,
	})}
	{@render ring("bgStrokeColor: red-200", "size-16", {
		class: "text-red-500",
		completeness: 0.7,
		rotate: -90,
		bgStrokeColor: "var(--color-red-200)",
	})}
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Content inside</h3>
<p class="text-sm text-neutral-500 mb-4">
	The svg fills its container, so anything centered in a <code>relative</code> parent sits inside
	the ring.
</p>
<div class="flex flex-wrap items-center gap-8 mb-8">
	{@render gauge(38, 56, "text-xs", 8)}
	{@render gauge(62, 88, "text-sm", 8)}
	{@render gauge(85, 128, "text-2xl font-semibold", 6)}
	{@render gauge(100, 160, "text-4xl font-bold", 4)}
</div>

<div class="flex flex-wrap items-center gap-8 mb-8">
	<div class="relative size-24">
		<div
			class="absolute inset-0 text-green-600 dark:text-green-500"
			{@attach circle({ strokeWidth: 8, rotate: -90, bgStrokeColor: TRACK })}
		></div>
		<div
			class="absolute inset-0 flex items-center justify-center text-green-600 dark:text-green-500"
		>
			{@html iconCheck({ size: 40 })}
		</div>
	</div>

	<div class="relative size-24">
		<div
			class="absolute inset-0"
			{@attach circle({
				strokeWidth: 4,
				completeness: 0.66,
				rotate: -90,
				bgStrokeColor: TRACK,
			})}
		></div>
		<div class="absolute inset-0 flex flex-col items-center justify-center leading-tight">
			<span class="text-xl font-semibold tabular-nums">2</span>
			<span class="text-[0.6rem] uppercase tracking-wide text-neutral-500">of 3</span>
		</div>
	</div>

	<div class="relative size-24">
		<div
			class="absolute inset-0 text-blue-600 dark:text-blue-500"
			{@attach circle({
				strokeWidth: 6,
				completeness: 0.9,
				rotate: -90,
				bgStrokeColor: TRACK,
			})}
		></div>
		<div class="absolute inset-2 flex items-center justify-center">
			<img
				src="https://picsum.photos/seed/stuic-avatar/128/128"
				alt=""
				class="size-full rounded-full object-cover"
			/>
		</div>
	</div>

	<div class="relative size-32">
		<div
			class="absolute inset-0 text-amber-600 dark:text-amber-500"
			{@attach circle({
				strokeWidth: 10,
				completeness: 0.45,
				rotate: -90,
				roundedEdges: false,
				bgStrokeColor: TRACK,
			})}
		></div>
		<div class="absolute inset-0 flex flex-col items-center justify-center leading-tight">
			<span class="text-2xl font-bold tabular-nums">4.5</span>
			<span class="text-xs text-neutral-500">GB used</span>
		</div>
	</div>
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Animating</h3>
<p class="text-sm text-neutral-500 mb-4">
	<code>circleStyle</code> can add a CSS transition on
	<code>stroke-dashoffset</code>, so <code>setCompleteness</code> animates on its own.
</p>
<div class="flex flex-wrap items-center gap-6 mb-8">
	<div class="relative size-28">
		<div
			class="absolute inset-0 text-blue-600 dark:text-blue-500"
			bind:this={downloadHost}
		></div>
		<div class="absolute inset-0 flex items-center justify-center tabular-nums">
			{downloaded}%
		</div>
	</div>
	<div class="flex flex-wrap gap-2">
		{#each [0, 25, 50, 75, 100] as v (v)}
			<button
				class="px-3 py-1 rounded border border-neutral-300 dark:border-neutral-700"
				onclick={() => (downloaded = v)}
			>
				{v}%
			</button>
		{/each}
	</div>
</div>

<p class="text-sm text-neutral-500 mb-4">
	And a rAF loop can call <code>setRotate</code> directly - no component state, no re-render
	per frame.
</p>
<div class="flex flex-wrap items-center gap-6 mb-8">
	<div class="size-16 text-blue-600 dark:text-blue-500" bind:this={spinnerHost}></div>
	<button
		class="px-3 py-1 rounded border border-neutral-300 dark:border-neutral-700"
		onclick={() => (spinning = !spinning)}
	>
		{spinning ? "Pause" : "Resume"}
	</button>
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Playground</h3>
<div class="flex flex-wrap items-start gap-8 mb-8">
	<div
		class="text-blue-600 dark:text-blue-500 shrink-0"
		style="width: {pgSize}px; height: {pgSize}px;"
		bind:this={pgHost}
	></div>

	<div class="grow max-w-md space-y-3">
		<label class="flex items-center gap-4">
			<span class="w-40 text-sm text-neutral-500">container</span>
			<input type="range" bind:value={pgSize} min="24" max="320" class="flex-1" />
			<span class="w-16 text-sm tabular-nums text-right">{pgSize}px</span>
		</label>
		<label class="flex items-center gap-4">
			<span class="w-40 text-sm text-neutral-500">strokeWidth</span>
			<input type="range" bind:value={pgStrokeWidth} min="1" max="100" class="flex-1" />
			<span class="w-16 text-sm tabular-nums text-right">{pgStrokeWidth}</span>
		</label>
		<label class="flex items-center gap-4">
			<span class="w-40 text-sm text-neutral-500">strokeWidthRatio</span>
			<input
				type="range"
				bind:value={pgStrokeWidthRatio}
				min="0"
				max="1"
				step="0.05"
				class="flex-1"
			/>
			<span class="w-16 text-sm tabular-nums text-right">{pgStrokeWidthRatio}</span>
		</label>
		<label class="flex items-center gap-4">
			<span class="w-40 text-sm text-neutral-500">completeness</span>
			<input
				type="range"
				bind:value={pgCompleteness}
				min="0"
				max="1"
				step="0.01"
				class="flex-1"
			/>
			<span class="w-16 text-sm tabular-nums text-right">{pgCompleteness}</span>
		</label>
		<label class="flex items-center gap-4">
			<span class="w-40 text-sm text-neutral-500">rotate</span>
			<input type="range" bind:value={pgRotate} min="-180" max="180" class="flex-1" />
			<span class="w-16 text-sm tabular-nums text-right">{pgRotate}&deg;</span>
		</label>
		<label class="flex items-center gap-3">
			<input type="checkbox" bind:checked={pgRoundedEdges} />
			<span class="text-sm text-neutral-500">roundedEdges</span>
		</label>
		<label class="flex items-center gap-3">
			<input type="checkbox" bind:checked={pgTrack} />
			<span class="text-sm text-neutral-500">bgStrokeColor</span>
		</label>

		<pre
			class="p-3 rounded bg-neutral-100 dark:bg-neutral-900 text-xs overflow-x-auto">{`svgCircle({
	strokeWidth: ${pgStrokeWidth},
	strokeWidthRatio: ${pgStrokeWidthRatio},
	roundedEdges: ${pgRoundedEdges},${pgTrack ? `\n\tbgStrokeColor: "${TRACK}",` : ""}
});
// then, without rebuilding the svg:
api.setCompleteness(${pgCompleteness});
api.setRotate(${pgRotate});`}</pre>
	</div>
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Notes</h3>
<ul class="max-w-2xl mb-8 space-y-2 text-sm text-neutral-500 list-disc list-inside">
	<li>
		The svg is <code>100%</code> / <code>100%</code> over a fixed
		<code>100&times;100</code> viewBox - size it by sizing the container.
	</li>
	<li>
		<code>completeness</code> is clamped to <code>0..1</code> and
		<code>rotate</code> is taken modulo 360, on both the options and the setters.
	</li>
	<li>
		The <code>radius</code> option is currently ignored - the radius is derived from the viewBox
		and the (possibly clamped) stroke width.
	</li>
	<li>
		Rebuilding on every change is wasteful: keep the returned object and use
		<code>setCompleteness</code> / <code>setRotate</code> for the values that move.
	</li>
</ul>
