<script lang="ts">
	import { Button, EmptyState, ListGroup, SplitPane, iconInbox } from "$lib/index.js";

	// The reference: one kit group of a job's pick list. Rows share no columns — the
	// sixth carries a unit code the others lack, and the locations differ in length.
	interface Line {
		booking_id: number;
		code: string;
		name: string;
		requested: number;
		picked: number;
		free: number;
		unit?: string;
		location: string;
	}

	// prettier-ignore
	const lines: Line[] = [
		{ booking_id: 1, code: "7QMET2GD", name: "Folding chair", requested: 40, picked: 40, free: 118, location: "hall-a-raca.floor-a" },
		{ booking_id: 2, code: "FBNQ356V", name: "Stage deck 2×1 m", requested: 8, picked: 8, free: 30, location: "hall-a-raca.floor-a" },
		{ booking_id: 3, code: "H66HAWFW", name: "LED PAR 64", requested: 8, picked: 8, free: 23, location: "hall-a-raca.rack-a1.shelf-a1-1" },
		{ booking_id: 4, code: "ER9HMTMS", name: "Cable drum 25 m", requested: 4, picked: 4, free: 12, location: "hall-a-raca.rack-a1.shelf-a1-2" },
		{ booking_id: 5, code: "A1EKJE7F", name: "Wind-up stand 4 m", requested: 4, picked: 4, free: 10, location: "hall-a-raca.rack-a1.shelf-a1-2" },
		{ booking_id: 6, code: "491RM5TC", name: "Mixer Behringer X32", requested: 1, picked: 1, free: 3, unit: "1T688WTC", location: "hall-a-raca.rack-a2.shelf-a2-2" },
		{ booking_id: 7, code: "89A6KMHY", name: "Carpet tape, double-sided", requested: 3, picked: 3, free: 5, location: "hall-a-raca.rack-a2.shelf-a2-2.consumables-bin" },
		{ booking_id: 8, code: "M0FZ5402", name: "Gaffer tape 50 mm", requested: 2, picked: 1, free: 11, location: "hall-a-raca.rack-a2.shelf-a2-2.consumables-bin" },
	];

	const total = lines.reduce((sum, l) => sum + l.requested, 0);
	const short = lines.reduce((sum, l) => sum + (l.requested - l.picked), 0);

	const hits = [
		{ id: "7QMET2GD", label: "Folding chair", kind: "equipment", meta: "118 free" },
		{ id: "FBNQ356V", label: "Stage deck 2×1 m", kind: "equipment", meta: "30 free" },
		{ id: "J-2026-0412", label: "Summer fest — main stage", kind: "job", meta: "Sep 26" },
	];

	// prettier-ignore
	const crew = [
		{ id: 1, name: "Alice Novak", role: "Stage manager", load: "declared load: 3 jobs this week" },
		{ id: 2, name: "Peter Horváth", role: "Rigger", load: "declared load: 1 job this week", clash: "clashes with J-2026-0409 (Sep 26, 18:00)" },
		{ id: 3, name: "Van Transit 2.0 t", role: "Vehicle", load: undefined },
	];

	const checklist = [
		{ id: "a", label: "Unpack and count", done: "8/8" },
		{ id: "b", label: "Check cables for damage", done: "3/8" },
		{ id: "c", label: "Label every drum", done: "0/4" },
	];

	let paneSize = $state(62);
	let align = $state<"center" | "baseline">("center");
</script>

<div class="space-y-16 py-8">
	<!-- The reference -->
	<section>
		<h2 class="mb-2 text-xl font-semibold">The kit group — one wrapping line per row</h2>
		<p class="mb-4 text-sm text-neutral-500">
			Drag the separator. Each row is one flex line that wraps: the name carries
			<code>data-grow</code>, so it claims <code>10rem</code> and all the slack, pushing the
			facts to the end while they fit — then they drop under it one by one. Nothing lines up
			across rows, on purpose. No layout utility is left on the consumer side; the header text
			and the row text start at the same x by construction.
		</p>
		<div class="h-[34rem] rounded border border-neutral-200 dark:border-neutral-700">
			<SplitPane bind:size={paneSize} min={20} max={95}>
				{#snippet start()}
					<div class="h-full overflow-auto p-4">
						<ListGroup
							class="text-sm"
							items={lines}
							getItemId={(line) => line.booking_id}
							itemProps={(line) => ({
								"data-line": "",
								"data-booking-id": line.booking_id,
								"data-short": line.requested - line.picked || null,
							})}
							titleLevel={3}
							data-kit-group
							data-kit="loose"
						>
							{#snippet title()}
								Loose items
								<span class="font-normal text-(--stuic-color-muted-foreground)"
									>optional</span
								>
							{/snippet}
							{#snippet aside()}
								<span>{total} pc</span>
								{#if short > 0}
									<span class="text-(--stuic-color-destructive)">−{short}</span>
								{/if}
							{/snippet}
							{#snippet renderItem({ item: line })}
								<span class="font-mono">{line.code}</span>
								<span data-grow>{line.name}</span>
								<span>×{line.requested}</span>
								<span class="text-(--stuic-color-muted-foreground)">
									picked {line.picked}/{line.requested}
								</span>
								<span class="text-(--stuic-color-success)">free {line.free}</span>
								{#if line.unit}
									<span class="font-mono">{line.unit}</span>
								{/if}
								<span class="text-(--stuic-color-muted-foreground)">{line.location}</span>
							{/snippet}
						</ListGroup>
					</div>
				{/snippet}
				{#snippet end()}
					<div class="h-full p-4 text-sm text-neutral-500">drag the separator ←→</div>
				{/snippet}
			</SplitPane>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Linked rows + footer -->
	<section>
		<h2 class="mb-2 text-xl font-semibold">Linked rows and a footer</h2>
		<p class="mb-4 text-sm text-neutral-500">
			<code>itemHref</code> wraps a row's content in an anchor that <em>becomes</em> the
			row box — the whole row is the hit area, keyboard- and middle-click-reachable, with
			an inset focus ring that survives the clipped corners. A linked row must not hold
			other interactive content. <code>footer</code> is a line inside the box, under a
			rule. The larger name shows what
			<code>--stuic-list-group-item-align: baseline</code>
			is for — rows that align on text rather than on pills and buttons.
		</p>
		<div class="flex flex-wrap gap-4 mb-4 text-sm">
			<label class="flex items-center gap-2">
				item-align
				<select
					bind:value={align}
					class="rounded border border-neutral-300 bg-transparent px-2 py-1 dark:border-neutral-700"
				>
					<option value="center">center</option>
					<option value="baseline">baseline</option>
				</select>
			</label>
		</div>
		<ListGroup
			class="max-w-xl text-sm"
			style="--stuic-list-group-item-align: {align};"
			items={hits}
			getItemId={(hit) => hit.id}
			itemHref={(hit) => `#/find/${hit.kind}/${hit.id}`}
			title="Search results"
			aside="3 of 15"
			footer="+12 more — narrow the search."
		>
			{#snippet renderItem({ item: hit })}
				<span class="font-mono">{hit.id}</span>
				<span data-grow class="text-base">{hit.label}</span>
				<span class="text-(--stuic-color-muted-foreground)">{hit.kind} · {hit.meta}</span>
			{/snippet}
		</ListGroup>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Second lines -->
	<section>
		<h2 class="mb-2 text-xl font-semibold">Second lines</h2>
		<p class="mb-4 text-sm text-neutral-500">
			A row part with <code>basis-full</code> forces a new line inside the same wrapping
			row; the row gap replaces a hand-written <code>mt-1</code>. No attribute needed.
		</p>
		<ListGroup
			class="max-w-xl text-sm"
			items={crew}
			getItemId={(c) => c.id}
			title="Crew & vehicles"
			titleLevel={3}
		>
			{#snippet renderItem({ item: c })}
				<span data-grow class="font-medium">{c.name}</span>
				<span class="text-(--stuic-color-muted-foreground)">{c.role}</span>
				{#if c.load}
					<span class="basis-full text-(--stuic-color-muted-foreground)">{c.load}</span>
				{/if}
				{#if c.clash}
					<span class="basis-full text-(--stuic-color-destructive)">{c.clash}</span>
				{/if}
			{/snippet}
		</ListGroup>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Empty -->
	<section>
		<h2 class="mb-2 text-xl font-semibold">No rows</h2>
		<p class="mb-4 text-sm text-neutral-500">
			<code>empty</code> is rendered <em>in place of</em> the list, never as an
			<code>&lt;li&gt;</code> — a list whose only item says there are no items announces
			"list, 1 item". Without <code>empty</code>, a group with no rows renders nothing at
			all, header included (the third box below is not there).
		</p>
		<div class="grid max-w-3xl items-start gap-4 sm:grid-cols-2">
			<ListGroup
				class="text-sm"
				items={[]}
				title="Crew & vehicles"
				empty="Nobody and nothing booked for this job yet."
			/>
			<ListGroup class="text-sm" items={[]} title="Scanned" aside="0 pc">
				{#snippet empty()}
					<EmptyState
						size="sm"
						icon={{ html: iconInbox() }}
						title="Nothing scanned yet"
						description="Scan a label to add it here."
					/>
				{/snippet}
			</ListGroup>
			<ListGroup class="text-sm" items={[]} title="Added at check-out" />
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- children form -->
	<section>
		<h2 class="mb-2 text-xl font-semibold">The <code>children</code> form</h2>
		<p class="mb-4 text-sm text-neutral-500">
			Write <code>&lt;li&gt;</code>s; the CSS selects structurally, so they render exactly
			like generated rows. A row whose only child is a plain <code>&lt;a&gt;</code> or
			<code>&lt;button&gt;</code> hands the row box to it. A stuic component alone in a
			row (the
			<code>Button</code> in the last row) keeps its own box.
		</p>
		<ListGroup title="Shortcuts" class="max-w-xl text-sm">
			<li><span data-grow>Open the scan hub</span><kbd>S</kbd></li>
			<li>
				<a href="#/find/search"><span data-grow>Search</span><kbd>/</kbd></a>
			</li>
			<li>
				<button type="button" onclick={() => alert("clicked")}>
					<span data-grow>A button row</span><kbd>B</kbd>
				</button>
			</li>
			<li><Button size="sm" variant="outline">A stuic Button, left alone</Button></li>
		</ListGroup>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Tokens -->
	<section>
		<h2 class="mb-2 text-xl font-semibold">Density and a muted header, via tokens</h2>
		<p class="mb-4 text-sm text-neutral-500">
			<code>--stuic-list-group-item-padding-x: 1rem</code> and
			<code>-padding-y: 0.75rem</code>, a muted header, a semibold title and a background.
			The header follows the row padding — the left edges line up whatever the value.
		</p>
		<ListGroup
			class="max-w-xl"
			style="--stuic-list-group-item-padding-x: 1rem;
				--stuic-list-group-item-padding-y: 0.75rem;
				--stuic-list-group-bg: var(--stuic-color-background);
				--stuic-list-group-header-bg: var(--stuic-color-muted);
				--stuic-list-group-title-font-weight: var(--font-weight-semibold);
				--stuic-list-group-title-text: var(--stuic-color-muted-foreground);"
			items={checklist}
			getItemId={(c) => c.id}
			itemHref={(c) => `#/checklist/${c.id}`}
			title="Before the job"
		>
			{#snippet renderItem({ item: c })}
				<span data-grow>{c.label}</span>
				<span class="tabular-nums text-(--stuic-color-muted-foreground)">{c.done}</span>
			{/snippet}
		</ListGroup>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Plain + unstyled -->
	<section>
		<h2 class="mb-2 text-xl font-semibold">Plain items and <code>unstyled</code></h2>
		<p class="mb-4 text-sm text-neutral-500">
			Without <code>renderItem</code> an item renders as <code>THC</code>, so an array of
			strings works as is. <code>unstyled</code> drops every class and keeps the semantics
			(<code>role="list"</code>, <code>aria-labelledby</code>).
		</p>
		<div class="grid max-w-3xl gap-6 sm:grid-cols-2">
			<ListGroup items={["Alpha", "Beta", "Gamma"]} title="Strings" />
			<ListGroup unstyled items={["Alpha", "Beta", "Gamma"]} title="Unstyled" />
		</div>
	</section>
</div>
