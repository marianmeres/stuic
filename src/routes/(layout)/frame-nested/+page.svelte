<script lang="ts">
	// `.stuic-frame-cq` — the NESTED variant of the ratio-locked frame: the same
	// formula as `.stuic-frame`, but sized in container-query units instead of
	// viewport units, so the frame fits whatever box it is handed.
	//
	// The box below is resizable on both axes (plain CSS `resize: both` — the
	// repo's `resizableWidth` action only drives the inline axis, and `cqh` is
	// half the story here).

	type Mode = "size" | "inline" | "none";

	const MODES: { value: Mode; cls: string; label: string }[] = [
		{ value: "size", cls: "@container-size", label: "@container-size" },
		{ value: "inline", cls: "@container", label: "@container (inline-size)" },
		{ value: "none", cls: "", label: "no container" },
	];

	const RATIOS: { css: string; n: number; label: string }[] = [
		{ css: "0.5", n: 0.5, label: "0.5" },
		{ css: "0.48", n: 0.48, label: "0.48" },
		{ css: "1", n: 1, label: "1 (default)" },
		{ css: "calc(4 / 3)", n: 4 / 3, label: "calc(4 / 3)" },
		{ css: "calc(16 / 9)", n: 16 / 9, label: "calc(16 / 9)" },
		{ css: "3", n: 3, label: "3" },
	];

	let mode = $state<Mode>("size");
	let ratioCss = $state("0.5");
	// the frame's OWN container-type — for its descendants, never for itself
	let frameIsContainer = $state(true);
	// letterbox clips (the recipe) vs. lets the overflow escape (so you can see it)
	let clip = $state(true);

	const containerCls = $derived(MODES.find((m) => m.value === mode)!.cls);
	const ratio = $derived(RATIOS.find((r) => r.css === ratioCss)!);

	let shellEl = $state<HTMLElement>();
	let slotEl = $state<HTMLElement>();
	let frameEl = $state<HTMLElement>();
	let probeEl = $state<HTMLElement>();

	type Box = { w: number; h: number };
	const ZERO: Box = { w: 0, h: 0 };
	let m = $state<{ shell: Box; slot: Box; frame: Box; probe: Box; win: Box }>({
		shell: ZERO,
		slot: ZERO,
		frame: ZERO,
		probe: ZERO,
		win: ZERO,
	});

	function box(el: HTMLElement | undefined): Box {
		if (!el) return ZERO;
		const r = el.getBoundingClientRect();
		return { w: r.width, h: r.height };
	}

	function measure() {
		m = {
			shell: box(shellEl),
			slot: box(slotEl),
			frame: box(frameEl),
			probe: box(probeEl),
			win: { w: window.innerWidth, h: window.innerHeight },
		};
	}

	$effect(() => {
		// re-measure on every control change, not just on resize
		void mode;
		void ratioCss;
		void frameIsContainer;
		void clip;

		measure();

		const ro = new ResizeObserver(measure);
		for (const el of [shellEl, slotEl, frameEl, probeEl]) el && ro.observe(el);
		window.addEventListener("resize", measure);

		return () => {
			ro.disconnect();
			window.removeEventListener("resize", measure);
		};
	});

	// What `100cqw` / `100cqh` actually resolve against, per mode. This is the
	// whole point of the page: only the first row is the letterbox.
	const basis = $derived.by(() => {
		if (mode === "size")
			return { w: m.slot.w, wSrc: "letterbox", h: m.slot.h, hSrc: "letterbox" };
		if (mode === "inline")
			return { w: m.slot.w, wSrc: "letterbox", h: m.win.h, hSrc: "small viewport" };
		return { w: m.win.w, wSrc: "small viewport", h: m.win.h, hSrc: "small viewport" };
	});

	const predictedW = $derived(Math.min(basis.w, basis.h * ratio.n));
	const predictedH = $derived(predictedW / ratio.n);
	const widthBound = $derived(basis.h * ratio.n >= basis.w);

	const overW = $derived(m.frame.w - m.slot.w);
	const overH = $derived(m.frame.h - m.slot.h);
	const fits = $derived(overW < 0.5 && overH < 0.5);
	const measuredRatio = $derived(m.frame.h ? m.frame.w / m.frame.h : 0);

	const n1 = (n: number) => (Math.round(n * 10) / 10).toFixed(1);
	const dim = (b: Box) => `${n1(b.w)} × ${n1(b.h)}`;

	// Only name the axis that actually overflows: a "0.0" in an "overflows by"
	// readout reads as a measurement, not as an absence.
	const overflowAxes = $derived(
		[
			overW >= 0.5 && `${n1(overW)} horizontally`,
			overH >= 0.5 && `${n1(overH)} vertically`,
		]
			.filter(Boolean)
			.join(", ")
	);

	const snippet = `<!-- the outer box: whatever gives the app its size -->
<div class="flex flex-col h-dvh">
	<header class="shrink-0">…</header>

	<!-- The letterbox IS the query container — not the outer box.
	     100cqh has to mean "the space left under the header". -->
	<div class="@container-size grid flex-1 min-h-0 overflow-hidden bg-neutral-800">
		<!-- The frame. Its own @container-size serves its DESCENDANTS;
		     the frame's own cqw/cqh read the letterbox above it. -->
		<div
			class="stuic-frame stuic-frame-cq @container-size relative bg-white"
			style="--stuic-frame-aspect-ratio: 0.5"
		>
			…
		</div>
	</div>
</div>`;
</script>

<div class="space-y-8 p-4">
	<h1 class="text-2xl font-bold">
		Nested ratio-locked frame (<code>.stuic-frame-cq</code>)
	</h1>

	<p class="text-sm text-neutral-600 dark:text-neutral-400">
		<code>.stuic-frame</code> sizes itself against the viewport. Add
		<code>.stuic-frame-cq</code> and it sizes against the nearest
		<strong>ancestor</strong>
		query container instead — same formula,
		<code>width: min(100cqw, calc(100cqh * ratio))</code>, so the frame fits whatever box
		it is handed. That box needs <code>container-type: size</code> (Tailwind:
		<code>@container-size</code>), and it must be the region the frame is allowed to fill
		— here the area <em>under</em> the fake header, not the outer shell. Drag the bottom-right
		corner of the box to resize it on both axes.
	</p>

	<hr class="my-4" />

	<!-- Controls -->
	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Controls</h2>

		<div class="space-y-2">
			<div class="text-sm font-medium">Query container on the letterbox</div>
			<div class="flex gap-2 flex-wrap">
				{#each MODES as opt (opt.value)}
					<button
						class="px-3 py-1.5 rounded border font-mono text-sm"
						class:bg-blue-600={mode === opt.value}
						class:text-white={mode === opt.value}
						class:border-blue-600={mode === opt.value}
						class:border-neutral-300={mode !== opt.value}
						class:dark:border-neutral-700={mode !== opt.value}
						onclick={() => (mode = opt.value)}
					>
						{opt.label}
					</button>
				{/each}
			</div>
		</div>

		<div class="space-y-2">
			<div class="text-sm font-medium">
				<code>--stuic-frame-aspect-ratio</code>
			</div>
			<div class="flex gap-2 flex-wrap">
				{#each RATIOS as r (r.css)}
					<button
						class="px-3 py-1.5 rounded border font-mono text-sm"
						class:bg-emerald-600={ratioCss === r.css}
						class:text-white={ratioCss === r.css}
						class:border-emerald-600={ratioCss === r.css}
						class:border-neutral-300={ratioCss !== r.css}
						class:dark:border-neutral-700={ratioCss !== r.css}
						onclick={() => (ratioCss = r.css)}
					>
						{r.label}
					</button>
				{/each}
			</div>
		</div>

		<div class="flex gap-6 flex-wrap items-center text-sm">
			<label class="flex items-center gap-2">
				<input type="checkbox" bind:checked={frameIsContainer} />
				frame declares <code>@container-size</code> (for its descendants)
			</label>
			<label class="flex items-center gap-2">
				<input type="checkbox" bind:checked={clip} />
				letterbox clips (<code>overflow-hidden</code>) — off also turns the shell into a
				scroll container (<code>overflow-auto</code>), so the escaping frame stays
				reachable
			</label>
		</div>
	</section>

	<hr class="my-4" />

	<!-- The demo -->
	<section class="space-y-4">
		<h2 class="text-xl font-semibold">The box</h2>

		<div
			bind:this={shellEl}
			class={[
				"resize flex flex-col w-[560px] h-[360px] min-w-[240px] min-h-[180px] max-w-full",
				"rounded-lg border border-neutral-400 dark:border-neutral-600",
				clip ? "overflow-hidden" : "overflow-auto",
			]}
		>
			<!-- fake header: the frame must fit what is left BELOW this -->
			<div
				class="shrink-0 h-10 flex items-center px-3 text-xs font-mono bg-stone-200 dark:bg-stone-900 border-b border-neutral-400 dark:border-neutral-600"
			>
				fake app header (40px)
			</div>

			<!-- the letterbox: the query container + the bars -->
			<div
				bind:this={slotEl}
				class={[
					"grid flex-1 min-h-0 bg-neutral-700 dark:bg-black",
					clip ? "overflow-hidden" : "overflow-visible",
					containerCls,
				]}
			>
				<!-- the frame -->
				<div
					bind:this={frameEl}
					class={[
						"stuic-frame stuic-frame-cq relative bg-white dark:bg-neutral-900",
						"outline-2 outline-emerald-500",
						frameIsContainer && "@container-size",
					]}
					style="--stuic-frame-aspect-ratio: {ratio.css}"
				>
					<!-- a DESCENDANT sized in the frame's own container units -->
					<div
						bind:this={probeEl}
						class="bg-fuchsia-500/25 outline-2 outline-dashed outline-fuchsia-500"
						style="width: 50cqw; height: 25cqh"
					></div>

					<div
						class="absolute inset-0 grid place-items-center pointer-events-none text-center text-xs font-mono leading-5"
					>
						<div>
							<div>.stuic-frame .stuic-frame-cq</div>
							<div class="opacity-60">{dim(m.frame)}</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<p class="text-xs text-neutral-500 dark:text-neutral-500">
			The 2px emerald outline is the frame — that, not the background, is what tells frame
			from letterbox, because in dark mode both are near-black. Everything under the
			header outside that outline is the letterbox (the leftover space). Dashed magenta =
			a descendant sized <code>50cqw × 25cqh</code>.
		</p>
	</section>

	<!-- Readout -->
	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Live readout</h2>

		<div class="text-sm font-mono space-y-1">
			<div class="grid grid-cols-[15rem_1fr] gap-x-4">
				<div class="text-neutral-500">resizable shell</div>
				<div>{dim(m.shell)}</div>

				<div class="text-neutral-500">letterbox (the slot)</div>
				<div>
					{dim(m.slot)} &nbsp;<span class="text-neutral-500"
						>shell − 40px header − 2px border</span
					>
				</div>

				<div class="text-neutral-500">100cqw / 100cqh resolve to</div>
				<div>
					{n1(basis.w)} ({basis.wSrc}) / {n1(basis.h)} ({basis.hSrc})
				</div>

				<div class="text-neutral-500">predicted frame</div>
				<div>
					min({n1(basis.w)}, {n1(basis.h)} × {ratio.n.toFixed(4)}) = {n1(predictedW)}
					&nbsp;→&nbsp; {n1(predictedW)} × {n1(predictedH)}
				</div>

				<div class="text-neutral-500">measured frame</div>
				<div>
					<strong>{dim(m.frame)}</strong>
					&nbsp; ratio {measuredRatio.toFixed(4)}
					<span class="text-neutral-500">(target {ratio.n.toFixed(4)})</span>
				</div>

				<div class="text-neutral-500">vs. the letterbox</div>
				<div>
					{#if fits}
						<span class="text-emerald-600 dark:text-emerald-400">fits</span>
						— bars {n1(Math.max(0, -overW) / 2)}px left/right, {n1(
							Math.max(0, -overH) / 2
						)}px top/bottom
					{:else}
						<span class="text-red-600 dark:text-red-400">
							overflows by {overflowAxes}
						</span>
					{/if}
				</div>

				<div class="text-neutral-500">cq descendant (50cqw × 25cqh)</div>
				<div>
					{dim(m.probe)}
					<span class="text-neutral-500">
						{#if frameIsContainer}
							— reads the FRAME (50% / 25% of {dim(m.frame)})
						{:else}
							— reads past the frame, to the letterbox / viewport
						{/if}
					</span>
				</div>

				<div class="text-neutral-500">window (≈ 100svw × 100svh)</div>
				<div>{dim(m.win)}</div>
			</div>
		</div>

		<!-- Annotation: what you are looking at, per mode -->
		{#if mode === "size"}
			<div
				class="rounded border border-emerald-600/40 bg-emerald-500/10 p-3 text-sm space-y-2"
			>
				<div class="font-semibold">Correct — this is the supported setup.</div>
				<p>
					<code>container-type: size</code> makes both axes of the letterbox queryable, so
					<code>100cqw</code> and <code>100cqh</code> are the letterbox's own box. The
					frame fits the space left under the header exactly, and the leftovers become
					bars on exactly one axis. Resize the box: the ratio is pinned and the bars swap
					axis when the binding axis changes. Resize the <em>window</em>: nothing moves —
					the frame does not know the viewport exists.
				</p>
			</div>
		{:else if mode === "inline"}
			<div
				class="rounded border border-amber-600/40 bg-amber-500/10 p-3 text-sm space-y-2"
			>
				<div class="font-semibold">
					Broken, quietly — <code>inline-size</code> is not enough.
				</div>
				<p>
					<code>@container</code> is <code>container-type: inline-size</code>: only the
					inline axis is queryable. <code>100cqw</code> still reads the letterbox, but
					<code>100cqh</code> is not eligible here, so it falls
					<strong>through</strong> this container to the next size container above — there
					is none, so it lands on the small viewport. No error, no warning, a plausible
					number. The <strong>ratio stays correct</strong>; only the
					<strong>scale</strong> is wrong. Resize the <em>window</em> (not the box) and watch
					the frame track it.
				</p>
			</div>
		{:else}
			<div class="rounded border border-red-600/40 bg-red-500/10 p-3 text-sm space-y-2">
				<div class="font-semibold">Broken, quietly — no query container at all.</div>
				<p>
					With no query container above it, <code>.stuic-frame-cq</code> does not fail:
					both axes fall back to the small viewport, so <code>100cqw</code> =
					<code>100svw</code>
					and <code>100cqh</code> = <code>100svh</code>. The frame is sized for the
					<em>window</em> and overflows its parent — the exact same output shape you would
					get from plain <code>.stuic-frame</code>, which is why this is easy to ship by
					accident. Resize the window and watch the frame move while the box stays put.
				</p>
			</div>
		{/if}

		{#if mode !== "size" && widthBound}
			<div class="rounded border border-neutral-500/40 bg-neutral-500/10 p-3 text-sm">
				<strong>Note:</strong> right now the <em>width</em> is the binding axis, so
				<code>min()</code> picks <code>100cqw</code> — which is still the letterbox — and
				the broken <code>cqh</code> never shows. That is what makes this trap dangerous:
				it hides at some ratios and window sizes. Pick a tall ratio (<code>0.5</code>) or
				make the box wider to expose it.
			</div>
		{/if}
	</section>

	<hr class="my-4" />

	<!-- Why two elements -->
	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Why two elements</h2>

		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			An element's own <code>container-type</code> never applies to itself: the frame's
			<code>100cqw</code>/<code>100cqh</code> always query an <strong>ancestor</strong>.
			Toggle "frame declares <code>@container-size</code>" above and watch the readout:
			the
			<strong>frame's own size does not change</strong> — only the magenta descendant does,
			because that declaration exists for the frame's children, not for the frame. So the letterbox
			and the frame have to be two separate elements: one to be measured against, one to be
			measured.
		</p>

		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			The same rule explains where the container class goes. Put <code
				>@container-size</code
			>
			on the outer shell instead of the letterbox and <code>100cqh</code> becomes "the whole
			shell", header included — the frame then overshoots by exactly the header's height. The
			container has to be the box the frame is actually allowed to fill.
		</p>

		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Note also that <code>container-type: size</code> zeroes an element's intrinsic block
			size. It is safe on the letterbox here because the letterbox is a flex item with
			<code>flex-1 min-h-0</code> (its height comes from the shell, not from its
			contents), and safe on the frame because <code>aspect-ratio</code> always gives the
			frame a determined height. Put <code>@container-size</code> on an auto-height box and
			you get a 0-tall element.
		</p>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">The recipe</h2>
		<pre
			class="text-xs overflow-x-auto rounded bg-neutral-100 dark:bg-neutral-900 p-4">{snippet}</pre>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			<code>grid</code>, <code>overflow-hidden</code>, <code>bg-*</code> and
			<code>@container-size</code> are all Tailwind utilities — the preset ships only the
			sizing formula, because that is the only part Tailwind cannot express. See
			<code>docs/RATIO_LOCKED_FRAME.md</code> for the full recipe set and the gotcha list.
		</p>
	</section>
</div>
