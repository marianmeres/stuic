<script lang="ts">
	import {
		DescriptionList,
		SplitPane,
		Pill,
		type DescriptionListItem,
	} from "$lib/index.js";

	const SHARE_URL = "https://example.com/share/9f4c2a71-3b8e-4d05-a6f1-7c2e0b93d5a8";
	// no "/" or "." to break at — the only kind of value that tells the wrap modes apart
	const UNBREAKABLE = "MFRGG2LOMNXW443UMFRGG2LOMNXW443UMFRGG2LO";

	// the shape this component exists for: a reference, a URL that is chrome, a count
	// with a qualifier line, and a value that is genuinely missing
	const detail: DescriptionListItem[] = [
		{
			label: "Reference",
			value: "REF-2026-0042",
			classValue: "font-mono text-base font-semibold",
		},
		{
			label: "Share link",
			value: SHARE_URL,
			href: SHARE_URL,
			wrap: "truncate",
		},
		{
			label: "Downloads (30 days)",
			value: 0,
			description: "since the last reset",
			classValue: "tabular-nums",
		},
		{ label: "Owner", value: "Alice Novak" },
		{ label: "Archived at", value: null },
	];

	const totals: DescriptionListItem[] = [
		{ label: "Subtotal", value: "$120.00" },
		{ label: "Shipping", value: "$0.00" },
		{ label: "Tax (21%)", value: "$25.20" },
		{
			label: "Total",
			value: "$145.20",
			emphasis: true,
			class: "border-t border-neutral-200 dark:border-neutral-700 mt-1 pt-2",
		},
	];

	const customer: DescriptionListItem[] = [
		{ label: "Name", value: "Alice Novak" },
		{ label: "Email", value: "alice@example.com" },
		{ label: "Phone", value: "+421 900 000 000" },
		{
			label: "Address",
			value: { html: "Dlhá 12<br>811 01 Bratislava<br>Slovakia" },
		},
	];

	let paneSize = $state(28);
	let layout = $state<"auto" | "stacked" | "columns">("auto");
	let divide = $state<"none" | "inside" | "outside">("inside");
</script>

<div class="space-y-16 py-8">
	<!-- The point of the component: a container query -->
	<section>
		<h2 class="text-xl font-semibold mb-2">
			<code>layout="auto"</code> — the list measures itself
		</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Drag the separator. The list flips between stacked and two columns at
			<code>columnsFrom="sm"</code> (24rem = 384px) of <em>its own</em> width — the viewport
			never changes, so a media query could not do this. The left pane is the shape that motivates
			it: a fixed 128px preview with the list beside it inside a resizable panel — exactly the
			case where the viewport answers a different question.
		</p>
		<div class="border rounded h-96 border-neutral-200 dark:border-neutral-700">
			<SplitPane bind:size={paneSize} min={15} max={85}>
				{#snippet start()}
					<div class="h-full p-4 flex gap-4">
						<div
							class="size-32 shrink-0 rounded bg-neutral-200 dark:bg-neutral-800
								grid place-items-center text-xs text-neutral-500"
						>
							preview 128px
						</div>
						<DescriptionList class="flex-1 text-sm" items={detail} />
					</div>
				{/snippet}
				{#snippet end()}
					<div class="h-full p-4 text-sm text-neutral-500">drag the separator ←→</div>
				{/snippet}
			</SplitPane>
		</div>
		<p class="text-sm text-neutral-500 mt-3">
			Note the third row: <code>value: 0</code> renders <code>0</code>, not the em dash —
			only
			<code>undefined</code>, <code>null</code> and <code>""</code> are empty (see the
			last row). The URL is <code>wrap="truncate"</code>, so it clips to one line and
			keeps the whole address in its <code>title</code>.
		</p>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Layout / divide matrix -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Layout and dividers</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>layout</code>: <code>"auto"</code> (container query), <code>"stacked"</code>
			(always label over value), <code>"columns"</code> (always beside).
			<code>divide</code>: <code>"inside"</code> draws n−1 rules (a list in a box),
			<code>"outside"</code> n+1 (a list loose on a page), <code>"none"</code> zero.
		</p>
		<div class="flex flex-wrap gap-4 mb-4 text-sm">
			<label class="flex items-center gap-2">
				layout
				<select
					bind:value={layout}
					class="border rounded px-2 py-1 bg-transparent border-neutral-300 dark:border-neutral-700"
				>
					<option value="auto">auto</option>
					<option value="stacked">stacked</option>
					<option value="columns">columns</option>
				</select>
			</label>
			<label class="flex items-center gap-2">
				divide
				<select
					bind:value={divide}
					class="border rounded px-2 py-1 bg-transparent border-neutral-300 dark:border-neutral-700"
				>
					<option value="inside">inside</option>
					<option value="outside">outside</option>
					<option value="none">none</option>
				</select>
			</label>
		</div>
		<div class="max-w-2xl rounded border p-4 border-neutral-200 dark:border-neutral-700">
			<DescriptionList class="text-sm" items={customer} {layout} {divide} />
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Totals -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Totals</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>layout="columns" valueAlign="end" divide="none"</code> with
			<code>--stuic-description-list-label-width: 1fr</code> and
			<code>emphasis</code> on the last item. The total row's own rule is a
			<code>class</code> on that item — a one-off, not a prop.
		</p>
		<div class="max-w-sm rounded border p-4 border-neutral-200 dark:border-neutral-700">
			<DescriptionList
				class="text-sm"
				items={totals}
				layout="columns"
				valueAlign="end"
				divide="none"
				classValue="tabular-nums"
				style="--stuic-description-list-label-width: 1fr;"
			/>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- children form -->
	<section>
		<h2 class="text-xl font-semibold mb-2">The <code>children</code> form</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Write <code
				>&lt;div&gt;&lt;dt&gt;…&lt;/dt&gt;&lt;dd&gt;…&lt;/dd&gt;&lt;/div&gt;</code
			>
			per row and the same structural CSS applies — no layout utility on the consumer side.
			For rows the data form cannot express: a link with <code>target</code>/<code
				>rel</code
			>, a component in the value, a conditional row. <code>data-wrap</code> and
			<code>data-emphasis</code> on a hand-written row are the row-level contract.
		</p>
		<div class="max-w-2xl rounded border p-4 border-neutral-200 dark:border-neutral-700">
			<DescriptionList class="text-sm">
				<div>
					<dt>Reference</dt>
					<dd class="font-mono text-base font-semibold">REF-2026-0042</dd>
				</div>
				<div data-wrap="truncate">
					<dt>Share link</dt>
					<dd title={SHARE_URL}>
						<a
							href={SHARE_URL}
							target="_blank"
							rel="noopener noreferrer"
							class="underline">{SHARE_URL}</a
						>
					</dd>
				</div>
				<div>
					<dt>Status</dt>
					<dd><Pill intent="success" size="sm">active</Pill></dd>
				</div>
				<div>
					<dt>Downloads (30 days)</dt>
					<dd class="tabular-nums">128</dd>
					<dd>since the last reset</dd>
				</div>
			</DescriptionList>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Wrapping -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Wrapping</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Deliberately narrow lists holding an unbreakable token, so the difference shows.
			<code>"anywhere"</code> (default) breaks it and never pushes the layout sideways;
			<code>"truncate"</code> clips to one line (hover for the <code>title</code>);
			<code>"normal"</code> is the browser default, which has no break opportunity here
			and therefore overflows its column. A URL would not tell them apart — browsers may
			break one after a <code>/</code>.
		</p>
		<div class="grid gap-6 sm:grid-cols-3 max-w-3xl">
			{#each ["anywhere", "truncate", "normal"] as const as w (w)}
				<div
					class="rounded border p-3 min-w-0 border-neutral-200 dark:border-neutral-700"
				>
					<div class="mb-2 font-mono text-xs text-neutral-500">wrap="{w}"</div>
					<DescriptionList
						class="text-sm"
						wrap={w}
						layout="stacked"
						items={[{ label: "Signing key", value: UNBREAKABLE }]}
					/>
				</div>
			{/each}
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Tokens -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Tokens</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Local overrides via <code>style</code>: a wider label track, a bigger column gap and
			a colored rule. <code>--stuic-description-list-label-width</code> takes any
			<code>grid-template-columns</code> track (<code>auto</code> shrink-wraps the label).
		</p>
		<div class="max-w-2xl rounded border p-4 border-neutral-200 dark:border-neutral-700">
			<DescriptionList
				class="text-sm"
				items={customer}
				layout="columns"
				style="--stuic-description-list-label-width: auto;
					--stuic-description-list-gap-x: 3rem;
					--stuic-description-list-rule-color: var(--stuic-color-primary);
					--stuic-description-list-item-padding-y: 0.75rem;"
			/>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Snippets + unstyled -->
	<section>
		<h2 class="text-xl font-semibold mb-2">
			Snippet overrides and <code>unstyled</code>
		</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>renderValue</code> receives <code>{"{ item, index }"}</code> and replaces
			every value; <code>unstyled</code> keeps the structure and drops every class and
			data attribute (nothing but the browser's own <code>&lt;dl&gt;</code> styling is left).
		</p>
		<div class="grid gap-6 sm:grid-cols-2 max-w-3xl">
			<div class="rounded border p-4 border-neutral-200 dark:border-neutral-700">
				<div class="mb-2 font-mono text-xs text-neutral-500">renderValue</div>
				<DescriptionList
					class="text-sm"
					items={[
						{ label: "Status", value: "active" },
						{ label: "Plan", value: "pro" },
					]}
				>
					{#snippet renderValue({ item })}
						<Pill intent="primary" size="sm">{String(item.value)}</Pill>
					{/snippet}
				</DescriptionList>
			</div>
			<div class="rounded border p-4 border-neutral-200 dark:border-neutral-700">
				<div class="mb-2 font-mono text-xs text-neutral-500">unstyled</div>
				<DescriptionList unstyled items={customer.slice(0, 3)} />
			</div>
		</div>
	</section>
</div>
