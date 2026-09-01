<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type {
		TrendChart as TrendChartInstance,
		TrendChartOptions,
		TrendData,
	} from "@marianmeres/trend-chart";

	export interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		/**
		 * The series: `DataPoint[]` or plain `number[]` shorthand (index becomes x).
		 * Reactive — the chart updates in place (keeping pan/zoom state) when it changes.
		 */
		data: TrendData;
		/**
		 * `@marianmeres/trend-chart` options, passed through. Reactive. When `sparkline`
		 * is set, these are merged OVER the sparkline preset (so any preset key can be
		 * overridden back).
		 */
		options?: TrendChartOptions;
		/**
		 * Preset for the axis-less, non-interactive mini chart look:
		 * no axes/grid/pan/zoom/points. Also switches the default height.
		 */
		sparkline?: boolean;
		/**
		 * Bindable underlying `TrendChart` instance for the imperative API
		 * (`setDomainX`, `resetDomain`, `getDomainX`, ...). `undefined` during SSR
		 * and before mount.
		 */
		chart?: TrendChartInstance;
		/** Skip all default styling (incl. the default height — size it yourself) */
		unstyled?: boolean;
		/** Additional CSS classes */
		class?: string;
		/** Bindable element reference (the chart's container) */
		el?: HTMLElement;
	}
</script>

<script lang="ts">
	import { untrack } from "svelte";
	import { TrendChart as TrendChartClass } from "@marianmeres/trend-chart";
	import { twMerge } from "../../utils/tw-merge.js";
	import "./index.css";

	const SPARKLINE_PRESET: Partial<TrendChartOptions> = {
		xAxis: false,
		yAxis: false,
		grid: false,
		pan: false,
		zoom: false,
		points: "none",
	};

	let {
		data,
		options,
		sparkline = false,
		chart = $bindable(),
		unstyled = false,
		class: classProp,
		el = $bindable(),
		...rest
	}: Props = $props();

	let _class = $derived(unstyled ? classProp : twMerge("stuic-trend-chart", classProp));

	let _options: TrendChartOptions = $derived({
		...(sparkline ? SPARKLINE_PRESET : {}),
		...options,
	});

	// Hand the library plain (non-proxied) data; reading the snapshot also makes
	// deep mutations of a $state-backed series reactive, not just reassignments.
	let _data = $derived($state.snapshot(data) as TrendData);

	// The internal wiring must not run through `el`/`chart`: those are write-out
	// mirrors a parent (or test harness) may overwrite as plain props at any time.
	let _container = $state<HTMLElement>();
	let _chart = $state<TrendChartInstance>();

	// Create once per container element; option/data changes below patch the
	// existing instance in place (preserving pan/zoom state) instead of rebuilding.
	$effect(() => {
		if (!_container) return;
		const instance = untrack(() => new TrendChartClass(_container!, _data, _options));
		_chart = instance;
		el = _container;
		chart = instance;
		return () => {
			instance.destroy();
			_chart = undefined;
			chart = undefined;
		};
	});

	$effect(() => {
		const d = _data;
		untrack(() => _chart)?.update(d);
	});

	$effect(() => {
		const o = _options;
		untrack(() => _chart)?.setOptions(o);
	});
</script>

<div
	bind:this={_container}
	class={_class}
	data-sparkline={!unstyled && sparkline ? "" : undefined}
	{...rest}
></div>
