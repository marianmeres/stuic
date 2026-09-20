<script lang="ts">
	import {
		Gantt,
		Button,
		ButtonGroupRadio,
		EmptyState,
		iconCalendar,
		type GanttRow,
		type GanttSelectDetail,
		type GanttUnit,
	} from "$lib/index.js";

	// A classic project plan: one bar per task, progress, milestones.
	const PLAN: GanttRow[] = [
		{
			id: "discovery",
			label: "Discovery",
			description: "Research & scoping",
			bars: [
				{
					from: "2026-09-01",
					to: "2026-09-08",
					label: "Interviews",
					intent: "accent",
					progress: 1,
				},
			],
		},
		{
			id: "design",
			label: "Design",
			description: "2 people",
			bars: [
				{
					from: "2026-09-07",
					to: "2026-09-18",
					label: "Wireframes → hi-fi",
					intent: "primary",
					progress: 0.65,
				},
			],
		},
		{
			id: "build",
			label: "Build",
			description: "Frontend + API",
			bars: [
				{
					from: "2026-09-15",
					to: "2026-10-09",
					label: "Implementation",
					intent: "primary",
					progress: 0.2,
				},
			],
		},
		{
			id: "qa",
			label: "QA",
			bars: [
				{ from: "2026-10-05", to: "2026-10-14", label: "Test pass", intent: "warning" },
			],
		},
		{
			id: "launch",
			label: "Launch",
			bars: [
				{ from: "2026-09-18", milestone: true, label: "Design freeze" },
				{ from: "2026-10-15", milestone: true, label: "Go live", intent: "success" },
			],
		},
		{
			id: "blocked",
			label: "Legal review",
			description: "waiting on counsel",
			bars: [{ from: "2026-09-22", to: "2026-09-25", label: "On hold", disabled: true }],
		},
	];

	// A resource lane view: several bars per row, and an `inset` emphasis range —
	// the wide bar is the truck's whole occupancy, the thin one the event days.
	const FLEET: GanttRow[] = [
		{
			id: "truck-1",
			label: "Truck #1",
			description: "7.5t",
			bars: [
				{
					from: "2026-09-02",
					to: "2026-09-06",
					intent: "primary",
					title: "Job A — transport out to return",
				},
				{
					from: "2026-09-03",
					to: "2026-09-05",
					inset: true,
					intent: "success",
					title: "Job A — event days",
				},
				{ from: "2026-09-10", to: "2026-09-12", intent: "primary", title: "Job C" },
			],
		},
		{
			id: "truck-2",
			label: "Truck #2",
			description: "3.5t",
			bars: [
				{ from: "2026-09-04", to: "2026-09-09", intent: "accent", title: "Job B" },
				{
					from: "2026-09-08",
					to: "2026-09-11",
					intent: "destructive",
					title: "Job D — double booked",
				},
			],
		},
		{
			id: "crew-mm",
			label: "M. Meres",
			description: "crew",
			bars: [
				{ from: "2026-09-01", to: "2026-09-03", intent: "accent" },
				{ from: "2026-09-07", to: "2026-09-14", intent: "accent" },
			],
		},
	];

	// ButtonGroupRadio binds a plain string; the union is derived from it
	let unitValue = $state("day");
	let unit = $derived(unitValue as GanttUnit);
	let unitWidth = $state(34);
	let selected = $state<string>("");

	function onSelect(d: GanttSelectDetail) {
		selected = `${d.row.label} · bar ${d.barIndex} · ${d.bar.from}${
			d.bar.to ? ` → ${d.bar.to}` : ""
		}`;
	}
</script>

<div class="space-y-10 p-4">
	<div>
		<h1 class="mb-2 text-2xl font-bold">Gantt</h1>
		<p class="text-muted-foreground">
			Whole-day ranges on a shared time axis. Rows are lanes, bars are ranges (inclusive
			at both ends), milestones are points.
		</p>
	</div>

	<!-- ------------------------------------------------------------------ -->
	<section class="space-y-3">
		<h2 class="text-lg font-semibold">Project plan — progress, milestones, today</h2>
		<div class="flex flex-wrap items-center gap-4">
			<ButtonGroupRadio
				bind:value={unitValue}
				options={[
					{ value: "day", label: "Day" },
					{ value: "week", label: "Week" },
					{ value: "month", label: "Month" },
				]}
				size="sm"
			/>
			<label class="flex items-center gap-2 text-sm">
				Zoom
				<input type="range" min="12" max="80" bind:value={unitWidth} />
				<span class="tabular-nums">{unitWidth}px</span>
			</label>
		</div>

		<Gantt rows={PLAN} {unit} {unitWidth} today="2026-09-24" locale="en-GB" {onSelect} />

		<p class="text-muted-foreground text-sm">
			Selected: <code>{selected || "—"}</code>
		</p>
	</section>

	<!-- ------------------------------------------------------------------ -->
	<section class="space-y-3">
		<h2 class="text-lg font-semibold">
			Resource lanes — several bars per row, <code>inset</code> emphasis
		</h2>
		<Gantt
			rows={FLEET}
			from="2026-08-31"
			to="2026-09-20"
			today="2026-09-08"
			locale="en-GB"
			unitWidth={38}
		>
			{#snippet renderCorner()}
				<span class="text-muted-foreground">Resource</span>
			{/snippet}
		</Gantt>
	</section>

	<!-- ------------------------------------------------------------------ -->
	<section class="space-y-3">
		<h2 class="text-lg font-semibold">
			<code>unitWidth="fit"</code> — no scroll, labels after the bars
		</h2>
		<Gantt
			rows={PLAN.slice(0, 4)}
			unit="week"
			unitWidth="fit"
			barLabels="after"
			today="2026-09-24"
			locale="en-GB"
		/>
	</section>

	<!-- ------------------------------------------------------------------ -->
	<section class="space-y-3">
		<h2 class="text-lg font-semibold">No labels, sticky header, month scale</h2>
		<Gantt
			rows={PLAN.map((r) => ({ ...r, label: undefined, description: undefined }))}
			unit="month"
			barLabels="none"
			from="2026-01-01"
			to="2026-12-31"
			today="2026-09-24"
			locale="en-GB"
			style="--stuic-gantt-max-height: 11rem;"
		/>
	</section>

	<!-- ------------------------------------------------------------------ -->
	<section class="space-y-3">
		<h2 class="text-lg font-semibold">Empty</h2>
		<Gantt rows={[]} from="2026-09-01" to="2026-09-21" today="2026-09-08">
			{#snippet empty()}
				<EmptyState
					icon={{ html: iconCalendar({ size: 40 }) }}
					title="Nothing planned"
					description="Widen the window, or the calendar really is clear."
				>
					{#snippet actions()}
						<Button size="sm">Add a task</Button>
					{/snippet}
				</EmptyState>
			{/snippet}
		</Gantt>
	</section>
</div>
