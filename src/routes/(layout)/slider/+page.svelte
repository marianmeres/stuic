<script lang="ts">
	import { Slider } from "$lib/index.js";
	import { iconLucideVolume2 } from "@marianmeres/icons-fns/lucide/iconLucideVolume2.js";
	import { iconLucideSun } from "@marianmeres/icons-fns/lucide/iconLucideSun.js";

	let volume1 = $state(100);
	let volume2 = $state(40);
	let volume3 = $state(65);
	let ios1 = $state(100);
	let ios2 = $state(45);
	let ios3 = $state(20);
	let basic = $state(30);
	let stepped = $state(4);
	let continuous = $state(33.3);
	let labeled = $state(50);
	let external = $state(20);
	let rtl = $state(30);
</script>

{#snippet volumeIcon()}
	{@html iconLucideVolume2({ size: 18 })}
{/snippet}

{#snippet volumeIconLg()}
	{@html iconLucideVolume2({ size: 22 })}
{/snippet}

<h3 class="font-semibold mb-2">Basic (horizontal)</h3>
<div class="flex flex-wrap items-center gap-6 mb-8">
	<Slider bind:value={basic} label="Basic" />
	<span class="opacity-50 tabular-nums">{basic}</span>
</div>

<h3 class="font-semibold mb-2">Sizes</h3>
<div class="flex flex-wrap items-center gap-6 mb-8">
	<span class="flex items-center gap-2"><Slider size="sm" value={40} /> sm</span>
	<span class="flex items-center gap-2"><Slider size="md" value={40} /> md</span>
	<span class="flex items-center gap-2"><Slider size="lg" value={40} /> lg</span>
</div>

<h3 class="font-semibold mb-2">Vertical volume (screenshot look)</h3>
<div
	class="inline-flex items-end gap-6 mb-8 p-6 rounded-2xl bg-neutral-700"
	style="--stuic-slider-track: rgb(255 255 255 / .25); --stuic-slider-fill: white; --stuic-slider-length: 11rem; --stuic-slider-thickness: 3.5rem;"
>
	<Slider
		orientation="vertical"
		bind:value={volume1}
		label="Volume 1"
		thumb={volumeIcon}
	/>
	<Slider
		orientation="vertical"
		bind:value={volume2}
		label="Volume 2"
		thumb={volumeIcon}
	/>
	<Slider
		orientation="vertical"
		bind:value={volume3}
		label="Volume 3"
		thumb={volumeIcon}
		style="--stuic-slider-radius: var(--radius-2xl);"
	/>
</div>

<h3 class="font-semibold mb-2">
	True iOS volume — icon pinned at the start, only the bar moves
	<code class="text-xs opacity-60">thumbPosition="start"</code>
</h3>
<p class="text-sm opacity-60 mb-2">
	Left/middle: bare icon (transparent thumb) + <code>fillRounded</code>. Right: the white
	knob stays pinned at the bottom.
</p>
<div
	class="inline-flex items-end gap-6 mb-8 p-6 rounded-2xl bg-neutral-700"
	style="--stuic-slider-track: rgb(255 255 255 / .25); --stuic-slider-fill: white; --stuic-slider-length: 11rem; --stuic-slider-thickness: 3.5rem;"
>
	<Slider
		orientation="vertical"
		bind:value={ios1}
		label="iOS volume 1"
		thumbPosition="start"
		fillRounded
		thumb={volumeIconLg}
		thumbClass="bg-transparent shadow-none"
		style="--stuic-slider-thumb-foreground: black; --stuic-slider-thumb-inset: 0.75rem;"
	/>
	<Slider
		orientation="vertical"
		bind:value={ios2}
		label="iOS volume 2"
		thumbPosition="start"
		fillRounded
		thumb={volumeIconLg}
		thumbClass="bg-transparent shadow-none"
		style="--stuic-slider-thumb-foreground: black; --stuic-slider-thumb-inset: 0.75rem;"
	/>
	<Slider
		orientation="vertical"
		bind:value={ios3}
		label="iOS volume 3"
		thumbPosition="start"
		fillRounded
		thumb={volumeIcon}
		style="--stuic-slider-thumb-inset: 0.625rem;"
	/>
</div>

<h3 class="font-semibold mb-2">
	Rounded fill <code class="text-xs opacity-60">fillRounded</code> (with a traveling thumb)
</h3>
<div class="flex flex-wrap items-center gap-6 mb-8">
	<Slider value={55} size="lg" fillRounded label="Rounded fill" />
	<Slider value={55} size="lg" fillRounded thumb={false} label="Rounded fill no thumb" />
	<Slider
		value={55}
		size="lg"
		fillRounded
		orientation="vertical"
		class="h-32"
		label="Rounded fill vertical"
	/>
</div>

<h3 class="font-semibold mb-2">Fill-only (no thumb, iOS overlay style)</h3>
<div class="flex flex-wrap items-center gap-6 mb-8">
	<Slider thumb={false} value={60} label="Brightness" />
	<Slider
		thumb={false}
		orientation="vertical"
		value={60}
		size="lg"
		class="h-32"
		label="Brightness vertical"
	/>
</div>

<h3 class="font-semibold mb-2">Intents</h3>
<div class="flex flex-wrap items-center gap-4 mb-8">
	<span class="flex items-center gap-1"
		><Slider intent="primary" value={60} size="sm" /> primary</span
	>
	<span class="flex items-center gap-1"
		><Slider intent="accent" value={60} size="sm" /> accent</span
	>
	<span class="flex items-center gap-1"
		><Slider intent="success" value={60} size="sm" /> success</span
	>
	<span class="flex items-center gap-1"
		><Slider intent="warning" value={60} size="sm" /> warning</span
	>
	<span class="flex items-center gap-1"
		><Slider intent="destructive" value={60} size="sm" /> destructive</span
	>
</div>

<h3 class="font-semibold mb-2">Steps + ticks</h3>
<p class="text-sm opacity-60 mb-2">
	Ticks render in two complementary layers so they stay readable over both the track and
	the fill. All three thumb modes shown (traveling / pinned / none).
</p>
<div class="flex flex-wrap items-center gap-6 mb-8">
	<Slider min={0} max={10} step={1} ticks bind:value={stepped} label="Rating" />
	<span class="opacity-50 tabular-nums">{stepped}</span>
	<Slider min={0} max={100} ticks={[0, 25, 50, 75, 100]} value={75} label="Quarters" />
	<Slider
		min={0}
		max={100}
		step={20}
		ticks
		thumb={false}
		value={60}
		label="Ticks no thumb"
	/>
	<Slider
		min={0}
		max={100}
		step={20}
		ticks
		thumbPosition="start"
		fillRounded
		value={60}
		size="lg"
		label="Ticks pinned thumb"
	/>
	<Slider
		min={0}
		max={100}
		step={25}
		ticks
		thumbPosition="start"
		fillRounded
		orientation="vertical"
		value={50}
		size="lg"
		class="h-32"
		label="Ticks pinned vertical"
	/>
</div>

<h3 class="font-semibold mb-2">RTL (horizontal flips automatically)</h3>
<div class="flex flex-wrap items-center gap-6 mb-8" dir="rtl">
	<Slider bind:value={rtl} label="RTL" />
	<span class="opacity-50 tabular-nums">{rtl}</span>
	<Slider min={0} max={100} step={25} ticks value={25} label="RTL ticks" />
</div>

<h3 class="font-semibold mb-2">Continuous (step="any") + value label</h3>
<div class="flex flex-wrap items-center gap-6 mb-12">
	<Slider step="any" bind:value={continuous} label="Gain">
		{#snippet valueLabel({ value })}
			{value.toFixed(1)}
		{/snippet}
	</Slider>
	<Slider
		min={0}
		max={100}
		bind:value={labeled}
		orientation="vertical"
		class="h-32"
		label="Vertical labeled"
	>
		{#snippet valueLabel({ value })}
			{value}%
		{/snippet}
	</Slider>
</div>

<h3 class="font-semibold mb-2">Custom colors + thumb content</h3>
<div class="flex flex-wrap items-center gap-6 mb-8">
	<Slider
		value={70}
		size="lg"
		label="Sunny"
		style="--stuic-slider-fill: var(--color-amber-400); --stuic-slider-thumb-foreground: var(--color-amber-500);"
	>
		{#snippet thumb()}
			{@html iconLucideSun({ size: 18 })}
		{/snippet}
	</Slider>
	<Slider
		value={40}
		trackClass="bg-violet-200 dark:bg-violet-950"
		fillClass="bg-violet-600"
		label="Violet"
	/>
</div>

<h3 class="font-semibold mb-2">Disabled</h3>
<div class="flex flex-wrap items-center gap-6 mb-8">
	<Slider value={40} disabled label="Disabled" />
	<Slider
		value={40}
		disabled
		orientation="vertical"
		class="h-24"
		label="Disabled vertical"
	/>
</div>

<h3 class="font-semibold mb-2">External control (bind proof)</h3>
<div class="flex flex-wrap items-center gap-6 mb-8">
	<Slider bind:value={external} label="External" />
	<span class="opacity-50 tabular-nums">{external}</span>
	<button
		class="underline opacity-50"
		onclick={() => (external = Math.round(Math.random() * 100))}
	>
		randomize from outside
	</button>
</div>
