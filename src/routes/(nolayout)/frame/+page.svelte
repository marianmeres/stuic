<script lang="ts">
	import { Button, twMerge } from "../../../lib/index.js";

	// ---------------------------------------------------------------------------
	// Viewport-anchored letterbox, live.
	//
	// This page lives in (nolayout) on purpose: a `fixed inset-0` letterbox covers
	// the whole viewport, so it cannot be demoed inside the padded demo chrome.
	//
	// The markup below IS the documentation. Note how little of it is stuic:
	//   - the letterbox parent  -> `fixed inset-0 grid overflow-hidden bg-*`
	//   - containment           -> `contain-layout contain-paint`
	//   - the scroll container  -> `overflow-y-auto`
	// ...are all plain Tailwind v4 utilities. The preset ships none of them.
	// The ONLY stuic classes here are `.stuic-frame` and `.stuic-frame-col`,
	// because `width = min(available-width, available-height * ratio)` is the one
	// part Tailwind cannot express.
	// ---------------------------------------------------------------------------

	interface RatioOption {
		/** Written verbatim into `--stuic-frame-aspect-ratio`. */
		css: string;
		/** The same number, for checking the measurement against the ask. */
		value: number;
		note: string;
	}

	const RATIOS: RatioOption[] = [
		{ css: "0.48", value: 0.48, note: "Bare decimal. Safe everywhere." },
		{ css: "0.5", value: 0.5, note: "Bare decimal. Safe everywhere." },
		{
			css: "calc(16 / 9)",
			value: 16 / 9,
			note: "The recommended spelling for a w/h pair: calc() collapses it to one number, so it stays safe wherever a consumer re-reads the token.",
		},
		{
			css: "1",
			value: 1,
			note: "The preset default (a square, i.e. unmistakably 'not configured yet').",
		},
		{
			css: "16 / 9",
			value: 16 / 9,
			note: "Works here — `aspect-ratio:` takes it, and so does `calc(H * (var(--r)))`. Discouraged anyway: in a DIVISION, `calc(W / var(--r))` expands to `W / 16 / 9`, i.e. 81x too small, with no parse error and no warning.",
		},
	];

	let ratio = $state<RatioOption>(RATIOS[1]);
	let fillHeight = $state(false);
	let contain = $state(false);
	let scroll = $state(false);

	let boxEl = $state<HTMLDivElement>()!;
	let frameEl = $state<HTMLDivElement>()!;
	let dialogEl = $state<HTMLDialogElement>()!;

	const filler = [...Array(24).keys()];

	// Everything the controls do to the frame is exactly these two strings.
	const frameClass = $derived(
		[
			"stuic-frame",
			"bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100",
			contain && "contain-layout contain-paint",
			scroll && "overflow-y-auto",
		]
			.filter(Boolean)
			.join(" ")
	);

	const frameStyle = $derived(
		[
			`--stuic-frame-aspect-ratio: ${ratio.css};`,
			fillHeight ? " --stuic-frame-height: 100dvh;" : "",
		].join("")
	);

	//
	// Live readout. Without this the page is a picture; with it, it is something
	// you can check a claim against.
	//

	let m = $state({ w: 0, h: 0, ratio: 0, barX: 0, barY: 0 });

	function measure(): void {
		if (!frameEl || !boxEl) return;
		const f = frameEl.getBoundingClientRect();
		const b = boxEl.getBoundingClientRect();
		m = {
			w: f.width,
			h: f.height,
			ratio: f.height ? f.width / f.height : 0,
			barX: Math.max(0, (b.width - f.width) / 2),
			barY: Math.max(0, (b.height - f.height) / 2),
		};
	}

	$effect(() => {
		// Track the controls: toggling containment can change the frame's box
		// without the observer ever seeing a resize.
		void frameClass;
		void frameStyle;

		const ro = new ResizeObserver(() => measure());
		ro.observe(frameEl);
		ro.observe(boxEl);
		window.addEventListener("resize", measure);
		measure();

		return () => {
			ro.disconnect();
			window.removeEventListener("resize", measure);
		};
	});

	/** The ratio lock is holding only while the measurement matches the ask. */
	const offRatio = $derived(Math.abs(m.ratio - ratio.value) > 0.005);

	//
	// "Copy CSS" — emit the current combination as something pasteable.
	//

	const snippet = $derived.by(() => {
		const classes = [
			"stuic-frame",
			contain && "contain-layout contain-paint",
			scroll && "overflow-y-auto",
		]
			.filter(Boolean)
			.join(" ");

		const tokens = [`--stuic-frame-aspect-ratio: ${ratio.css};`];
		if (fillHeight) tokens.push("--stuic-frame-height: 100dvh;");

		const warnings: string[] = [];
		if (fillHeight) {
			warnings.push(
				"\t\t<!-- WARNING: an explicit height beats aspect-ratio unconditionally.",
				"\t\t     Wherever 100vw < 100dvh * ratio the frame degenerates to the raw",
				"\t\t     viewport: bars 0/0, ratio wrong. Looks fine on a desktop, wrong on",
				"\t\t     the target handset. -->"
			);
		}
		if (contain && scroll) {
			warnings.push(
				"\t\t<!-- WARNING: containing block AND scroll container on the same element.",
				"\t\t     Every position:fixed descendant then renders at y = -scrollTop.",
				"\t\t     Scroll an inner element instead. -->"
			);
		}

		const extras = [
			contain && "\tcontain: layout paint;",
			scroll && "\toverflow-y: auto;",
		].filter(Boolean);

		return [
			"<!-- The letterbox parent. No stuic class: every part of it is a Tailwind utility. -->",
			'<div class="fixed inset-0 grid overflow-hidden bg-neutral-800">',
			"\t<!-- The ratio-locked frame. This is the only stuic class involved. -->",
			...warnings,
			`\t<div class="${classes}" style="${tokens.join(" ")}">`,
			"\t\t<!-- your app -->",
			"\t</div>",
			"</div>",
			"",
			"/* Same thing without Tailwind: */",
			".letterbox {",
			"\tposition: fixed;",
			"\tinset: 0;",
			"\tdisplay: grid;",
			"\toverflow: hidden;",
			"\tbackground: #262626;",
			"}",
			"",
			'.my-frame { /* also class="stuic-frame" */',
			`\t${tokens.join("\n\t")}`,
			...extras,
			"}",
		].join("\n");
	});

	let copyState = $state<"idle" | "ok" | "err">("idle");
	let copyTimer: ReturnType<typeof setTimeout> | undefined;

	async function copy(): Promise<void> {
		clearTimeout(copyTimer);
		try {
			await navigator.clipboard.writeText(snippet);
			copyState = "ok";
		} catch {
			copyState = "err";
		}
		copyTimer = setTimeout(() => (copyState = "idle"), 1500);
	}

	//
	// Presentation only below here.
	//

	const pill =
		"cursor-pointer rounded border px-2 py-0.5 font-mono text-[11px] leading-tight";
	const pillOn = "border-sky-600 bg-sky-600 text-white";
	const pillOff =
		"border-neutral-300 bg-white text-neutral-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200";
	const card = "rounded border border-neutral-200 p-2 dark:border-neutral-700";
</script>

<svelte:head>
	<title>stuic-frame &mdash; ratio-locked letterbox</title>
</svelte:head>

<!--
	THE LETTERBOX PARENT.
	`fixed inset-0` anchors it to the viewport, `grid` centres the frame (via the
	frame's own `margin: auto`), `overflow-hidden` clips, `bg-*` paints the bars.
	All four are Tailwind utilities — stuic ships no class for this on purpose.
-->
<div bind:this={boxEl} class="fixed inset-0 grid overflow-hidden bg-neutral-800">
	<!--
		THE FRAME. One class + one custom property is the whole ratio lock.
		Every extra class here comes from a toggle below, and every one of them is
		a plain Tailwind utility layered on top of the preset.
	-->
	<div bind:this={frameEl} class={frameClass} style={frameStyle}>
		<!--
			When the frame is NOT the scroll container, an inner scroller keeps the
			controls reachable at every ratio (the frame itself is `overflow: hidden`).
		-->
		<div class={scroll ? "p-3" : "h-full overflow-y-auto p-3"}>
			<div class="mx-auto flex max-w-2xl flex-col gap-3">
				<header class="flex flex-wrap items-baseline justify-between gap-2">
					<h1 class="font-mono text-sm font-bold">.stuic-frame</h1>
					<a href="/" class="text-[11px] text-sky-700 underline dark:text-sky-400">
						&larr; all demos
					</a>
				</header>

				<p class="text-[11px] leading-snug text-neutral-600 dark:text-neutral-400">
					The dark area is the letterbox: a
					<code class="font-mono">fixed inset-0 grid overflow-hidden bg-*</code>
					parent, built from Tailwind utilities only. The light area is
					<code class="font-mono">.stuic-frame</code>, locked to the ratio below. Resize
					the window &mdash; the readout is live.
				</p>

				<!-- LIVE READOUT -->
				<dl
					class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 rounded bg-neutral-100 p-2 font-mono text-[11px] tabular-nums dark:bg-neutral-800"
				>
					<dt class="text-neutral-500">size</dt>
					<dd>{m.w.toFixed(1)} &times; {m.h.toFixed(1)}</dd>

					<dt class="text-neutral-500">ratio</dt>
					<dd class={offRatio ? "font-bold text-red-600 dark:text-red-400" : ""}>
						{m.ratio.toFixed(4)}
						<span class="font-normal text-neutral-500">
							(asked {ratio.value.toFixed(4)})
						</span>
					</dd>

					<dt class="text-neutral-500">bars x</dt>
					<dd>{m.barX.toFixed(1)} per side</dd>

					<dt class="text-neutral-500">bars y</dt>
					<dd>{m.barY.toFixed(1)} per side</dd>
				</dl>

				{#if offRatio}
					<p
						class="rounded border border-red-400 bg-red-50 p-2 text-[11px] leading-snug text-red-800 dark:border-red-500 dark:bg-red-950 dark:text-red-200"
					>
						<strong>Off-ratio.</strong> The frame is not honouring the aspect ratio you
						asked for. With
						<code class="font-mono">--stuic-frame-height: 100dvh</code> on, that is expected:
						see the toggle below.
					</p>
				{/if}

				<!-- RATIO PICKER -->
				<div class={card}>
					<p class="mb-1 font-mono text-[11px] text-neutral-500">
						--stuic-frame-aspect-ratio
					</p>
					<div class="flex flex-wrap gap-1">
						{#each RATIOS as r (r.css)}
							<button
								type="button"
								class={twMerge(pill, ratio.css === r.css ? pillOn : pillOff)}
								onclick={() => (ratio = r)}
							>
								{r.css}
							</button>
						{/each}
					</div>
					<p class="mt-1 text-[11px] leading-snug text-neutral-600 dark:text-neutral-400">
						{ratio.note}
					</p>
				</div>

				<!-- G15: an explicit height is not a ratio lock -->
				<div class={card}>
					<div class="flex flex-wrap items-center gap-2">
						{@render switchBtn(fillHeight, () => (fillHeight = !fillHeight))}
						<code class="font-mono text-[11px]"> --stuic-frame-height: 100dvh </code>
					</div>
					<p class="mt-1 text-[11px] leading-snug text-neutral-600 dark:text-neutral-400">
						<strong>This is a demonstration of a trap, not a feature.</strong> An explicit
						height beats
						<code class="font-mono">aspect-ratio</code> unconditionally (which is why the
						token needs no
						<code class="font-mono">!important</code>). Turn it on, then narrow the
						window: as soon as
						<code class="font-mono">100vw &lt; 100dvh &times; ratio</code> the frame becomes
						the raw viewport &mdash; bars 0/0, readout off-ratio. It looks perfect on a wide
						desktop and is wrong on the handset you shipped it for.
					</p>
				</div>

				<!-- Containment: what actually traps a fixed descendant -->
				<div class={card}>
					<div class="flex flex-wrap items-center gap-2">
						{@render switchBtn(contain, () => (contain = !contain))}
						<code class="font-mono text-[11px]">contain-layout contain-paint</code>
					</div>
					<p class="mt-1 text-[11px] leading-snug text-neutral-600 dark:text-neutral-400">
						Watch the pink <code class="font-mono">position: fixed</code> marker. Off: it
						sits in the <em>viewport's</em> bottom-right corner, out on the bars. On: the
						frame is its containing block, so it snaps to the
						<em>frame's</em> corner. Either
						<code class="font-mono">contain: layout</code> or
						<code class="font-mono">contain: paint</code> alone is enough;
						<code class="font-mono">container-type</code> is
						<em>not</em> &mdash; it stopped implying layout containment in 2024.
					</p>
				</div>

				<!-- G4b: the combination that breaks every fixed descendant -->
				<div
					class={twMerge(
						card,
						contain &&
							scroll &&
							"border-amber-500 bg-amber-50 dark:border-amber-500 dark:bg-amber-950"
					)}
				>
					<div class="flex flex-wrap items-center gap-2">
						{@render switchBtn(scroll, () => (scroll = !scroll))}
						<code class="font-mono text-[11px]">overflow-y-auto</code>
						<span class="text-[11px] text-neutral-500">+ a tall child</span>
					</div>
					{#if contain && scroll}
						<p class="mt-1 text-[11px] leading-snug text-amber-900 dark:text-amber-100">
							<strong>Scroll down now.</strong> The pink
							<code class="font-mono">position: fixed</code> marker scrolls away with the
							content. It is not fixed any more: the frame is both its containing block
							and its scroll container, so it renders at
							<code class="font-mono">y = -scrollTop</code>, i.e. it behaves like
							<code class="font-mono">position: absolute</code> against the scroll origin.
							Any drawer, backdrop or dropdown opened on a scrolled route lands offscreen
							and the user taps nothing.
							<strong>
								Never make one element both the fixed containing block and the scroll
								container.
							</strong>
							Scroll an inner element instead, or leave overlays in viewport space and re-align
							them with <code class="font-mono">.stuic-frame-col</code>.
						</p>
					{:else}
						<p
							class="mt-1 text-[11px] leading-snug text-neutral-600 dark:text-neutral-400"
						>
							Makes the frame itself the scroll container (the preset's
							<code class="font-mono">overflow: hidden</code> loses to a utility, by
							design &mdash; <code class="font-mono">.stuic-frame</code> is in
							<code class="font-mono">@layer components</code>). Turn
							<em>containment on as well</em> to see the single most expensive mistake in this
							pattern.
						</p>
					{/if}
				</div>

				<!-- Top layer -->
				<div class={card}>
					<div class="flex flex-wrap items-center gap-2">
						<Button size="sm" variant="outline" onclick={() => dialogEl.showModal()}>
							Open modal
						</Button>
						<code class="font-mono text-[11px]">.stuic-frame-col</code>
					</div>
					<p class="mt-1 text-[11px] leading-snug text-neutral-600 dark:text-neutral-400">
						A <code class="font-mono">&lt;dialog&gt;.showModal()</code> is promoted to the
						top layer, where the frame's geometry &mdash; and its containment &mdash; mean
						nothing: it measures against the viewport no matter what. Custom properties
						still inherit normally, so
						<code class="font-mono">.stuic-frame-col</code> re-derives the frame's width and
						lands the strip back on the frame column. Its dashed edges should line up with the
						frame's edges at every ratio.
					</p>
				</div>

				<!-- Copy -->
				<div class={card}>
					<Button size="sm" variant="outline" onclick={copy}>
						{copyState === "ok"
							? "Copied"
							: copyState === "err"
								? "Copy failed"
								: "Copy CSS"}
					</Button>
					<details class="mt-2">
						<summary
							class="cursor-pointer text-[11px] text-neutral-600 dark:text-neutral-400"
						>
							show snippet
						</summary>
						<pre
							class="mt-1 max-h-56 overflow-auto rounded bg-neutral-100 p-2 font-mono text-[10px] leading-snug dark:bg-neutral-800">{snippet}</pre>
					</details>
				</div>

				{#if scroll}
					<div class="flex flex-col gap-2">
						<p class="text-[11px] text-neutral-500">
							Tall child &mdash; here so there is something to scroll.
						</p>
						{#each filler as i (i)}
							<div
								class="rounded bg-neutral-100 px-2 py-3 font-mono text-[10px] text-neutral-500 dark:bg-neutral-800"
							>
								filler {i + 1}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!--
			The marker whose behaviour the containment / scroll toggles are about.
			`fixed` resolves against the viewport until some ancestor forms a fixed
			containing block — which `contain: layout` / `contain: paint` does.
		-->
		<div
			class="fixed right-2 bottom-2 z-20 rounded bg-fuchsia-600 px-2 py-1 font-mono text-[10px] text-white shadow"
		>
			position: fixed
		</div>

		<!--
			A DOM child of the frame, so it inherits --stuic-frame-aspect-ratio. Once
			showModal() promotes it to the top layer its geometry is viewport-space
			regardless; `.stuic-frame-col` is what puts the content back on the column.
		-->
		<dialog
			bind:this={dialogEl}
			class="m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-transparent p-0 backdrop:bg-black/60"
		>
			<div class="flex h-full flex-col justify-center">
				<div
					class="stuic-frame-col border-y-2 border-dashed border-fuchsia-400 bg-fuchsia-700 p-4 text-white"
				>
					<p class="font-mono text-xs font-bold">.stuic-frame-col</p>
					<p class="mt-1 text-[11px] leading-snug">
						This strip is inside a top-layer
						<code class="font-mono">&lt;dialog&gt;</code>, which is viewport-space. Its
						dashed edges line up with the frame underneath because the class re-derives
						<code class="font-mono">
							min(100vw, calc(100dvh &times; ({ratio.css})))
						</code>
						from the inherited token.
					</p>
					<Button
						size="sm"
						variant="outline"
						class="mt-3 border-white text-white"
						onclick={() => dialogEl.close()}
					>
						Close
					</Button>
				</div>
			</div>
		</dialog>
	</div>
</div>

{#snippet switchBtn(on: boolean, fn: () => void)}
	<button
		type="button"
		role="switch"
		aria-checked={on}
		class={twMerge(pill, on ? pillOn : pillOff)}
		onclick={fn}
	>
		{on ? "ON" : "OFF"}
	</button>
{/snippet}
