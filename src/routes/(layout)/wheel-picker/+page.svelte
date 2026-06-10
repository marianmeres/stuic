<script lang="ts">
	import { WheelPicker } from "$lib/index.js";
	import Button from "$lib/components/Button/Button.svelte";
	import FieldSwitch from "$lib/components/Input/FieldSwitch.svelte";

	const range = (n: number, start = 0) => Array.from({ length: n }, (_, i) => i + start);
	const pad = (n: number) => ({ label: String(n).padStart(2, "0"), value: n });

	// --- 1. Time picker ---
	let hour = $state(9);
	let minute = $state(30);
	let second = $state(0);

	const hours = range(24).map(pad);
	const minutes = range(60).map(pad);
	const seconds = range(60).map(pad);

	function setNow() {
		const d = new Date();
		hour = d.getHours();
		minute = d.getMinutes();
		second = d.getSeconds();
	}

	let liveClock = $state(false);
	$effect(() => {
		if (!liveClock) return;
		const id = setInterval(setNow, 1000);
		setNow();
		return () => clearInterval(id);
	});

	const time = $derived(`${pad(hour).label}:${pad(minute).label}:${pad(second).label}`);

	// --- 2. Loop vs clamp ---
	let loop = $state(true);
	let day = $state(15);
	const days = range(31, 1); // 1..31

	// --- 3. Objects + disabled + onchange ---
	let size = $state("m");
	let lastChange = $state<string | null>(null);
	const sizes = [
		{ label: "XS", value: "xs" },
		{ label: "S", value: "s" },
		{ label: "M", value: "m" },
		{ label: "L (sold out)", value: "l", disabled: true },
		{ label: "XL", value: "xl" },
	];

	// --- 4. Appearance / geometry ---
	let visibleCount = $state(5);
	let itemHeight = $state(36);
	let unstyled = $state(false);
	let weekday = $state("Wed");
	const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
</script>

<h1 class="text-2xl font-bold mb-8">WheelPicker</h1>

<p class="text-sm opacity-60 mb-10 max-w-2xl">
	iOS-style scrolling wheel / drum picker. Built on native scroll + CSS scroll-snap, so
	momentum feels native on touch. Supports infinite <code>loop</code> (scroll past the
	last option and the first reappears). Drag with the mouse, flick on a trackpad/touch,
	use the scroll wheel, or focus a wheel and use <code>↑ ↓ PgUp PgDn Home End</code>.
</p>

<!-- ============================================================ -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Time picker (the classic use)</h2>
	<p class="text-sm opacity-60 mb-4">
		Three looping wheels. Minutes/seconds wrap 59&nbsp;→&nbsp;00. Toggle the live clock to
		watch external <code>bind:value</code> updates drive the wheels (deferred while you drag).
	</p>

	<div class="max-w-sm mb-4 space-y-2">
		<FieldSwitch
			bind:checked={liveClock}
			label="Live clock (ticks every second)"
			name="wp-clock"
			renderSize="sm"
		/>
	</div>

	<div class="inline-flex items-center gap-1 rounded-xl border border-border p-2">
		<WheelPicker options={hours} bind:value={hour} loop label="Hour" />
		<span class="text-xl opacity-40 select-none">:</span>
		<WheelPicker options={minutes} bind:value={minute} loop label="Minute" />
		<span class="text-xl opacity-40 select-none">:</span>
		<WheelPicker options={seconds} bind:value={second} loop label="Second" />
	</div>

	<div class="mt-4 flex items-center gap-3">
		<Button size="sm" onclick={setNow}>Set to now</Button>
		<Button size="sm" onclick={() => ((hour = 0), (minute = 0), (second = 0))}
			>Midnight</Button
		>
		<pre class="text-xs bg-muted p-3 rounded-md">{time}</pre>
	</div>
</section>

<!-- ============================================================ -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Looping vs. clamped</h2>
	<p class="text-sm opacity-60 mb-4">
		The same day-of-month wheel with <code>loop</code> on/off. Clamped stops at 1 and 31; looping
		wraps both ways.
	</p>

	<div class="max-w-sm mb-4 space-y-2">
		<FieldSwitch bind:checked={loop} label="loop" name="wp-loop" renderSize="sm" />
	</div>

	<div class="inline-block rounded-xl border border-border p-2">
		<WheelPicker options={days} bind:value={day} {loop} label="Day of month" />
	</div>
	<pre
		class="text-xs bg-muted p-3 rounded-md mt-3 inline-block ml-4 align-middle">{JSON.stringify(
			{ day, loop }
		)}</pre>
</section>

<!-- ============================================================ -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Object options, disabled rows &amp; onchange</h2>
	<p class="text-sm opacity-60 mb-4">
		Options can be <code>{"{ label, value, disabled }"}</code> objects. A disabled row is
		auto-skipped when it would land in the center. <code>onchange</code> fires on settle.
	</p>

	<div class="inline-block rounded-xl border border-border p-2">
		<WheelPicker
			options={sizes}
			bind:value={size}
			label="Size"
			onchange={(opt) => (lastChange = `${opt.label} (${opt.value})`)}
		/>
	</div>
	<pre
		class="text-xs bg-muted p-3 rounded-md mt-3 inline-block ml-4 align-middle">{JSON.stringify(
			{ size, lastChange }
		)}</pre>
</section>

<!-- ============================================================ -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Appearance &amp; geometry</h2>
	<p class="text-sm opacity-60 mb-4">
		<code>visibleCount</code> (forced odd) and <code>itemHeight</code> are props (they
		drive the scroll math). <code>unstyled</code> drops all built-in CSS.
	</p>

	<div class="flex flex-wrap gap-3 items-center mb-4">
		<span class="text-sm">visibleCount:</span>
		{#each [3, 5, 7] as v (v)}
			<Button
				size="sm"
				variant={visibleCount === v ? "solid" : "outline"}
				onclick={() => (visibleCount = v)}
			>
				{v}
			</Button>
		{/each}
		<span class="text-sm ml-4">itemHeight:</span>
		{#each [28, 36, 48] as h (h)}
			<Button
				size="sm"
				variant={itemHeight === h ? "solid" : "outline"}
				onclick={() => (itemHeight = h)}
			>
				{h}px
			</Button>
		{/each}
	</div>

	<div class="max-w-sm mb-4">
		<FieldSwitch
			bind:checked={unstyled}
			label="unstyled (no built-in CSS)"
			name="wp-unstyled"
			renderSize="sm"
		/>
	</div>

	<div class="inline-block rounded-xl border border-border p-2">
		<WheelPicker
			options={weekdays}
			bind:value={weekday}
			loop
			{visibleCount}
			{itemHeight}
			{unstyled}
			label="Weekday"
		/>
	</div>
	<pre
		class="text-xs bg-muted p-3 rounded-md mt-3 inline-block ml-4 align-middle">{JSON.stringify(
			{ weekday, visibleCount, itemHeight, unstyled }
		)}</pre>
</section>
