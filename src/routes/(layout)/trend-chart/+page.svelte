<script lang="ts">
	import type { TrendChart as TrendChartInstance } from "@marianmeres/trend-chart";
	import { TrendChart } from "$lib/components/TrendChart/index.js";
	import { Stat, Button } from "$lib/index.js";

	// deterministic pseudo-random walk (mulberry32) so the demo is stable
	function walk(seed: number, n: number, start = 50): number[] {
		let a = seed;
		const rnd = () => {
			a |= 0;
			a = (a + 0x6d2b79f5) | 0;
			let t = Math.imul(a ^ (a >>> 15), 1 | a);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
		const out = [start];
		for (let i = 1; i < n; i++) out.push(out[i - 1] + (rnd() - 0.45) * 10);
		return out;
	}

	const DAY = 24 * 60 * 60 * 1000;
	const t0 = Date.UTC(2026, 7, 1);
	const daily = walk(7, 30).map((y, i) => ({ x: t0 + i * DAY, y: Math.round(y) }));

	let live = $state(walk(42, 40));
	const pushPoint = () => {
		live = [...live.slice(1), live[live.length - 1] + (Math.random() - 0.45) * 10];
	};

	let chart = $state<TrendChartInstance>();
</script>

<div class="space-y-16 py-8">
	<!-- Intro / peer dep note -->
	<section>
		<h2 class="text-xl font-semibold mb-2">TrendChart</h2>
		<p class="text-sm text-neutral-500 mb-1">
			Svelte wrapper for <code>@marianmeres/trend-chart</code> — an
			<b>optional peer dependency</b>, imported via the
			<code>@marianmeres/stuic/trend-chart</code>
			subpath (not the main barrel), so consumers who don't use it never bundle it.
		</p>
		<p class="text-sm text-neutral-500 mb-4">
			Colors follow the active stuic theme (try the theme picker / dark toggle above).
		</p>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Full chart -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Full Chart</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Default look: y axis, x labels, gridlines. Drag to pan, wheel/pinch to zoom.
		</p>
		<div class="max-w-2xl" style="--stuic-trend-chart-height: 14rem;">
			<TrendChart
				data={daily}
				options={{
					smooth: true,
					endDot: true,
					formatX: (x) =>
						new Date(x).toLocaleDateString(undefined, { day: "numeric", month: "short" }),
				}}
			/>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Sparkline -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Sparkline</h2>
		<p class="text-sm text-neutral-500 mb-4">
			The <code>sparkline</code> preset: no axes, grid, or interaction; compact height. A
			plain <code>number[]</code> works as data.
		</p>
		<div class="max-w-xs">
			<TrendChart data={walk(3, 25)} sparkline />
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Stat integration -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Stat (KPI Card) Integration</h2>
		<p class="text-sm text-neutral-500 mb-4">
			The first-class pairing: a sparkline in the <code>Stat</code> footer via
			<code>renderFooter</code>.
		</p>
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
			<Stat label="Requests" value="1.2M" delta="+8.4%" trend="up" hint="last 7 days">
				{#snippet renderFooter()}
					<TrendChart data={walk(11, 30)} sparkline />
				{/snippet}
			</Stat>
			<Stat
				label="Error Rate"
				value="0.42%"
				delta="-0.11pp"
				trend="down"
				trendIntent="success"
				hint="lower is better"
			>
				{#snippet renderFooter()}
					<TrendChart
						data={walk(23, 30).map((y) => 120 - y)}
						sparkline
						style="--stuic-trend-chart-line: var(--stuic-color-success); --stuic-trend-chart-fill: var(--stuic-color-success);"
					/>
				{/snippet}
			</Stat>
			<Stat
				label="P95 Latency"
				value="187ms"
				delta="+12ms"
				trend="up"
				trendIntent="warning"
			>
				{#snippet renderFooter()}
					<TrendChart
						data={walk(31, 30)}
						sparkline
						style="--stuic-trend-chart-line: var(--stuic-color-warning); --stuic-trend-chart-fill: var(--stuic-color-warning);"
					/>
				{/snippet}
			</Stat>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Live updates + imperative API -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Reactive Data & Imperative API</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Reassigning <code>data</code> patches the chart in place (pan/zoom survives).
			<code>bind:chart</code> exposes the underlying instance.
		</p>
		<div class="max-w-2xl space-y-2">
			<TrendChart data={live} bind:chart options={{ endDot: true }} />
			<div class="flex gap-2">
				<Button size="sm" onclick={pushPoint}>Push data point</Button>
				<Button size="sm" variant="outline" onclick={() => chart?.resetDomain()}>
					Reset zoom
				</Button>
			</div>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Zones -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Value Zones</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Any <code>@marianmeres/trend-chart</code> option passes through — e.g. value-zone coloring.
		</p>
		<div class="max-w-2xl" style="--stuic-trend-chart-height: 12rem;">
			<TrendChart
				data={walk(5, 40, 90)}
				options={{
					zones: {
						boundaries: [40, 70, 100, 130],
						colors: ["#22c55e", "#eab308", "#ef4444"],
						labels: ["ok", "elevated", "critical"],
					},
				}}
			/>
		</div>
	</section>
</div>
