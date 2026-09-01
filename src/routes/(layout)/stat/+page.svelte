<script lang="ts">
	import { Stat, iconUser, iconDownload, iconTrendingUp, iconCheck } from "$lib/index.js";
	// deliberately a subpath import — TrendChart is NOT on the main barrel
	// (optional @marianmeres/trend-chart peer dep)
	import { TrendChart } from "$lib/components/TrendChart/index.js";
</script>

<div class="space-y-16 py-8">
	<!-- KPI Dashboard Grid -->
	<section>
		<h2 class="text-xl font-semibold mb-2">KPI Dashboard Grid</h2>
		<p class="text-sm text-neutral-500 mb-4">
			The classic use case: a grid of metric cards with label, value, delta, and icon.
		</p>
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			<Stat
				label="Total Revenue"
				value="$45,231.89"
				delta="+20.1%"
				trend="up"
				hint="vs. last month"
			>
				{#snippet renderIcon()}
					{@html iconTrendingUp({ size: 18 })}
				{/snippet}
			</Stat>
			<Stat
				label="Subscriptions"
				value="+2,350"
				delta="+180.1%"
				trend="up"
				hint="vs. last month"
			>
				{#snippet renderIcon()}
					{@html iconUser({ size: 18 })}
				{/snippet}
			</Stat>
			<Stat label="Downloads" value="12,234" delta="-19%" trend="down" hint="this week">
				{#snippet renderIcon()}
					{@html iconDownload({ size: 18 })}
				{/snippet}
			</Stat>
			<Stat label="Uptime" value="99.98%" delta="0.00%" trend="flat" hint="last 30 days">
				{#snippet renderIcon()}
					{@html iconCheck({ size: 18 })}
				{/snippet}
			</Stat>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Trend Directions -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Trend Directions</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>trend</code> drives the arrow and (by default) the delta color: up→success, down→destructive,
			flat→neutral.
		</p>
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
			<Stat label="Trend Up" value="1,024" delta="+12.5%" trend="up" />
			<Stat label="Trend Down" value="768" delta="-4.2%" trend="down" />
			<Stat label="Trend Flat" value="512" delta="±0%" trend="flat" />
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Inverted Semantics -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Inverted Semantics (trendIntent)</h2>
		<p class="text-sm text-neutral-500 mb-4">
			For metrics where down is good (churn, costs, error rate), the arrow direction and
			the color are independent: <code>trend="down" trendIntent="success"</code>.
		</p>
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
			<Stat
				label="Churn Rate"
				value="2.1%"
				delta="-0.4%"
				trend="down"
				trendIntent="success"
				hint="lower is better"
			/>
			<Stat
				label="Infra Costs"
				value="$8,120"
				delta="+3.1%"
				trend="up"
				trendIntent="destructive"
				hint="higher is worse"
			/>
			<Stat
				label="Queue Depth"
				value="341"
				delta="+12"
				trend="up"
				trendIntent="warning"
				hint="approaching limit"
			/>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Without Arrow / Minimal -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Minimal Forms</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Label + value only; delta without arrow (<code
				>showTrendArrow=&#123;false&#125;</code
			>); numeric value.
		</p>
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
			<Stat label="Label + Value" value="42" />
			<Stat
				label="No Arrow"
				value="87.5%"
				delta="+1.2pp"
				trend="up"
				showTrendArrow={false}
			/>
			<Stat value="1,000,000" hint="value + hint, no label" />
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Clickable -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Clickable</h2>
		<p class="text-sm text-neutral-500 mb-4">
			With <code>href</code> the stat renders as an anchor, with <code>onclick</code> as a button.
			Hover to see the interactive styling.
		</p>
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
			<Stat
				href="#revenue-details"
				label="Revenue (link)"
				value="$45,231"
				delta="+20.1%"
				trend="up"
				hint="click for details"
			/>
			<Stat
				onclick={() => alert("Stat clicked!")}
				label="Sessions (button)"
				value="8,412"
				delta="-2.3%"
				trend="down"
			/>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Footer / Sparkline -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Footer (Sparkline)</h2>
		<p class="text-sm text-neutral-500 mb-4">
			The <code>renderFooter</code> snippet is a free-form area. The first-class pairing
			is the <code>TrendChart</code> wrapper (subpath import
			<code>@marianmeres/stuic/trend-chart</code>, optional
			<code>@marianmeres/trend-chart</code> peer dep — see the
			<a class="underline" href="trend-chart">trend-chart</a> demo). Any markup works too —
			right: a hand-rolled inline SVG.
		</p>
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
			<Stat label="Requests" value="1.2M" delta="+8.4%" trend="up" hint="last 7 days">
				{#snippet renderFooter()}
					<TrendChart data={[42, 51, 48, 63, 58, 71, 68, 84]} sparkline />
				{/snippet}
			</Stat>
			<Stat label="Bandwidth" value="2.4TB" delta="+3.1%" trend="up" hint="last 7 days">
				{#snippet renderFooter()}
					<svg
						viewBox="0 0 100 24"
						preserveAspectRatio="none"
						class="w-full h-6 text-neutral-400 dark:text-neutral-600"
					>
						<polyline
							points="0,20 15,16 30,18 45,10 60,13 75,6 100,2"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						/>
					</svg>
				{/snippet}
			</Stat>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Custom Styling via CSS Variables -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Custom Styling via CSS Variables</h2>
		<p class="text-sm text-neutral-500 mb-4">Customized using CSS custom properties.</p>
		<div
			class="max-w-xs"
			style="
				--stuic-stat-radius: 0;
				--stuic-stat-shadow: none;
				--stuic-stat-border-width: 2px;
				--stuic-stat-value-font-size: 3rem;
				--stuic-stat-value-font-weight: 900;
				--stuic-stat-label-font-size: 0.65rem;
			"
		>
			<Stat
				label="BRUTALIST KPI"
				value="9,001"
				delta="+42%"
				trend="up"
				hint="over 9000"
			/>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Disabled -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Disabled</h2>
		<p class="text-sm text-neutral-500 mb-4">Reduced opacity and no interaction.</p>
		<div class="max-w-xs">
			<Stat
				disabled
				onclick={() => alert("Should not fire")}
				label="Unavailable"
				value="—"
				hint="no data source connected"
			/>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Unstyled -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Unstyled</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Using unstyled mode with custom Tailwind classes.
		</p>
		<div class="max-w-xs">
			<Stat
				unstyled
				class="block p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white"
				classLabel="text-xs uppercase tracking-widest opacity-80"
				classValue="text-3xl font-black"
				classDelta="text-sm font-semibold"
				label="Gradient Stat"
				value="$1,337"
				delta="+99%"
				trend="up"
			/>
		</div>
	</section>
</div>
