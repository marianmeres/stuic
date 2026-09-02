<script lang="ts">
	import { RangeSlider, Button, type ValidationResult } from "$lib/index.js";
	import { iconLucideChevronLeft } from "@marianmeres/icons-fns/lucide/iconLucideChevronLeft.js";
	import { iconLucideChevronRight } from "@marianmeres/icons-fns/lucide/iconLucideChevronRight.js";

	let basicStart = $state(20);
	let basicEnd = $state(80);

	let priceStart = $state(150);
	let priceEnd = $state(600);
	const eur = new Intl.NumberFormat("en", {
		style: "currency",
		currency: "EUR",
		maximumFractionDigits: 0,
	});

	let gapStart = $state(40);
	let gapEnd = $state(60);

	let hoursStart = $state(9);
	let hoursEnd = $state(17);

	let vStart = $state(20);
	let vEnd = $state(70);

	let rtlStart = $state(20);
	let rtlEnd = $state(60);

	let extStart = $state(10);
	let extEnd = $state(30);

	let formOut = $state("");

	let valStart = $state(40);
	let valEnd = $state(50);
	let validation = $state<ValidationResult | undefined>();
</script>

<h3 class="font-semibold mb-2">Basic (horizontal)</h3>
<p class="text-sm opacity-60 mb-2">
	Press anywhere: the nearest thumb jumps there. Grab a thumb to drag it. Thumbs never
	cross. Tab focuses the thumbs in turn; arrows / Home / End / PageUp / PageDown step
	them.
</p>
<div class="flex flex-wrap items-center gap-6 mb-8">
	<RangeSlider bind:start={basicStart} bind:end={basicEnd} label="Basic" />
	<span class="opacity-50 tabular-nums">{basicStart} – {basicEnd}</span>
</div>

<h3 class="font-semibold mb-2">Price filter (value labels, step 10)</h3>
<div class="flex flex-wrap items-end gap-6 mb-8 pt-4">
	<RangeSlider
		bind:start={priceStart}
		bind:end={priceEnd}
		min={0}
		max={1000}
		step={10}
		label="Price"
		labelStart="Minimum price"
		labelEnd="Maximum price"
		class="w-72"
	>
		{#snippet valueLabel({ value })}
			{eur.format(value)}
		{/snippet}
	</RangeSlider>
	<span class="opacity-50 tabular-nums"
		>{eur.format(priceStart)} – {eur.format(priceEnd)}</span
	>
</div>

<h3 class="font-semibold mb-2">Sizes</h3>
<div class="flex flex-wrap items-center gap-6 mb-8">
	<span class="flex items-center gap-2"
		><RangeSlider size="sm" start={20} end={70} /> sm</span
	>
	<span class="flex items-center gap-2"
		><RangeSlider size="md" start={20} end={70} /> md</span
	>
	<span class="flex items-center gap-2"
		><RangeSlider size="lg" start={20} end={70} /> lg</span
	>
</div>

<h3 class="font-semibold mb-2">Intents</h3>
<div class="flex flex-wrap items-center gap-4 mb-8">
	<span class="flex items-center gap-1"
		><RangeSlider intent="primary" start={20} end={70} size="sm" /> primary</span
	>
	<span class="flex items-center gap-1"
		><RangeSlider intent="accent" start={20} end={70} size="sm" /> accent</span
	>
	<span class="flex items-center gap-1"
		><RangeSlider intent="success" start={20} end={70} size="sm" /> success</span
	>
	<span class="flex items-center gap-1"
		><RangeSlider intent="warning" start={20} end={70} size="sm" /> warning</span
	>
	<span class="flex items-center gap-1"
		><RangeSlider intent="destructive" start={20} end={70} size="sm" /> destructive</span
	>
</div>

<h3 class="font-semibold mb-2">
	Minimum distance <code class="text-xs opacity-60">minRange</code>
</h3>
<p class="text-sm opacity-60 mb-2">
	The thumbs can never get closer than 20. Try dragging one into the other, or pressing
	Home / End on a focused thumb.
</p>
<div class="flex flex-wrap items-center gap-6 mb-8">
	<RangeSlider bind:start={gapStart} bind:end={gapEnd} minRange={20} label="Gap" />
	<span class="opacity-50 tabular-nums"
		>{gapStart} – {gapEnd} (Δ {gapEnd - gapStart})</span
	>
</div>

<h3 class="font-semibold mb-2">Steps + ticks</h3>
<p class="text-sm opacity-60 mb-2">
	Ticks render in three complementary layers so they stay readable over the track and over
	the fill. Both thumb modes shown (thumbs / none).
</p>
<div class="flex flex-wrap items-center gap-6 mb-8">
	<RangeSlider
		min={0}
		max={24}
		step={1}
		ticks
		bind:start={hoursStart}
		bind:end={hoursEnd}
		label="Working hours"
		class="w-72"
	/>
	<span class="opacity-50 tabular-nums">{hoursStart}:00 – {hoursEnd}:00</span>
	<RangeSlider
		min={0}
		max={100}
		ticks={[0, 25, 50, 75, 100]}
		start={25}
		end={75}
		label="Quarters"
	/>
	<RangeSlider
		min={0}
		max={100}
		step={20}
		ticks
		thumb={false}
		start={20}
		end={60}
		label="Ticks no thumbs"
	/>
</div>

<h3 class="font-semibold mb-2">
	Rounded fill <code class="text-xs opacity-60">fillRounded</code> and fill-only (no thumbs)
</h3>
<div class="flex flex-wrap items-center gap-6 mb-8">
	<RangeSlider start={30} end={70} size="lg" fillRounded label="Rounded fill" />
	<RangeSlider
		start={30}
		end={70}
		size="lg"
		fillRounded
		thumb={false}
		label="Rounded fill no thumbs"
	/>
	<RangeSlider start={30} end={70} thumb={false} label="Fill only" />
</div>

<h3 class="font-semibold mb-2">Vertical</h3>
<p class="text-sm opacity-60 mb-2">Bottom is min, top is max; ArrowUp increases.</p>
<div class="flex flex-wrap items-end gap-6 mb-8">
	<RangeSlider
		orientation="vertical"
		bind:start={vStart}
		bind:end={vEnd}
		label="Vertical"
		class="h-40"
	/>
	<RangeSlider
		orientation="vertical"
		start={20}
		end={70}
		size="lg"
		fillRounded
		step={10}
		ticks
		label="Vertical ticks"
		class="h-40"
	/>
	<RangeSlider
		orientation="vertical"
		start={20}
		end={70}
		label="Vertical labeled"
		class="h-40"
	>
		{#snippet valueLabel({ value })}
			{value}%
		{/snippet}
	</RangeSlider>
	<span class="opacity-50 tabular-nums">{vStart} – {vEnd}</span>
</div>

<h3 class="font-semibold mb-2">RTL (horizontal flips automatically)</h3>
<div class="flex flex-wrap items-center gap-6 mb-8" dir="rtl">
	<RangeSlider bind:start={rtlStart} bind:end={rtlEnd} label="RTL" />
	<span class="opacity-50 tabular-nums">{rtlStart} – {rtlEnd}</span>
	<RangeSlider min={0} max={100} step={25} ticks start={25} end={75} label="RTL ticks" />
</div>

<h3 class="font-semibold mb-2">Custom thumb content + colors</h3>
<p class="text-sm opacity-60 mb-2">
	The snippet renders once per thumb; its context says which one (<code>thumb</code>).
</p>
<div class="flex flex-wrap items-center gap-6 mb-8">
	<RangeSlider
		start={30}
		end={70}
		size="lg"
		label="Chevrons"
		style="--stuic-range-slider-fill: var(--color-amber-400); --stuic-range-slider-thumb-foreground: var(--color-amber-600);"
	>
		{#snippet thumb({ thumb })}
			{@html (thumb === "start" ? iconLucideChevronLeft : iconLucideChevronRight)({
				size: 18,
			})}
		{/snippet}
	</RangeSlider>
	<RangeSlider
		start={30}
		end={70}
		trackClass="bg-violet-200 dark:bg-violet-950"
		fillClass="bg-violet-600"
		label="Violet"
	/>
</div>

<h3 class="font-semibold mb-2">Disabled</h3>
<div class="flex flex-wrap items-center gap-6 mb-8">
	<RangeSlider start={30} end={70} disabled label="Disabled" />
	<RangeSlider
		start={30}
		end={70}
		disabled
		orientation="vertical"
		class="h-24"
		label="Disabled vertical"
	/>
</div>

<h3 class="font-semibold mb-2">External control (bind proof)</h3>
<div class="flex flex-wrap items-center gap-6 mb-8">
	<RangeSlider bind:start={extStart} bind:end={extEnd} label="External" />
	<span class="opacity-50 tabular-nums">{extStart} – {extEnd}</span>
	<button
		class="underline opacity-50"
		onclick={() => {
			const a = Math.round(Math.random() * 100);
			const b = Math.round(Math.random() * 100);
			// a reversed pair is reordered by the component
			extStart = a;
			extEnd = b;
		}}
	>
		randomize from outside
	</button>
</div>

<h3 class="font-semibold mb-2">In a form (two hidden range inputs)</h3>
<form
	class="flex flex-wrap items-center gap-6 mb-8"
	onsubmit={(e) => {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);
		formOut = JSON.stringify(Object.fromEntries(fd.entries()));
	}}
>
	<RangeSlider
		nameStart="price_min"
		nameEnd="price_max"
		start={20}
		end={80}
		label="Price"
	/>
	<Button type="submit" size="sm">Submit</Button>
	<code class="text-xs opacity-60">{formOut || "…"}</code>
</form>

<h3 class="font-semibold mb-2">Validation (customValidator gets the pair)</h3>
<p class="text-sm opacity-60 mb-2">
	Drag the thumbs apart: the range must span at least 25.
</p>
<div class="flex flex-wrap items-center gap-6 mb-8">
	<RangeSlider
		bind:start={valStart}
		bind:end={valEnd}
		label="Validated"
		validate={{
			customValidator: (v) => {
				const { start, end } = v as { start: number; end: number };
				return end - start < 25 ? `Span at least 25 (now ${end - start})` : "";
			},
		}}
		setValidationResult={(res) => (validation = res)}
	/>
	<span class="opacity-50 tabular-nums">{valStart} – {valEnd}</span>
	{#if validation && !validation.valid}
		<span class="text-sm" style="color: var(--stuic-color-destructive)"
			>{validation.message}</span
		>
	{/if}
</div>
