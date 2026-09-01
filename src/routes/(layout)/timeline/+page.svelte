<script lang="ts">
	import {
		Timeline,
		Avatar,
		Button,
		Pill,
		iconCheck,
		iconAlertWarning,
		iconUser,
		iconPencil,
		iconTrash,
		type TimelineItem,
	} from "$lib/index.js";

	const ORDER: TimelineItem[] = [
		{ title: "Order placed", description: "Ref #1001 · 3 items", time: "Mon, 09:00" },
		{ title: "Payment received", description: "Visa •••• 4242", time: "Mon, 09:05" },
		{ title: "Packed", time: "Mon, 14:20" },
		{
			title: "Shipped",
			description: "Tracking number sent to the customer",
			time: "Tue, 08:10",
		},
		{ title: "Delivered", time: "Wed, 11:45", intent: "success" },
	];

	const DEPLOY: TimelineItem[] = [
		{
			title: "Build passed",
			icon: { html: iconCheck() },
			intent: "success",
			time: "12:01",
		},
		{
			title: "Deployed to staging",
			description: "v3.170.0 · 42 files changed",
			icon: { html: iconUser() },
			intent: "primary",
			time: "12:04",
		},
		{
			title: "Health check failed",
			description: "GET /health → 503 (3 retries)",
			icon: { html: iconAlertWarning() },
			intent: "destructive",
			time: "12:06",
		},
		{ title: "Rolled back", intent: "warning", time: "12:07" },
		{ title: "Incident opened", description: "INC-2041", href: "#", time: "12:10" },
	];

	// audit log: machine timestamps + one formatter
	const fmt = new Intl.DateTimeFormat("en-GB", {
		dateStyle: "medium",
		timeStyle: "short",
	});
	const AUDIT: TimelineItem[] = [
		{
			title: { html: "<b>alice</b> changed status <i>Draft → Review</i>" },
			datetime: "2026-09-01T08:12:00Z",
		},
		{
			title: { html: "<b>bob</b> commented" },
			description: "Looks good, one nit on the pricing table.",
			datetime: "2026-09-01T09:40:00Z",
		},
		{
			title: { html: "<b>alice</b> changed status <i>Review → Published</i>" },
			datetime: "2026-09-02T07:05:00Z",
			intent: "success",
		},
	];

	const HISTORY: TimelineItem[] = [
		{ title: "Founded", description: "Two people, one laptop.", time: "2019" },
		{ title: "First customer", description: "A bakery in Bratislava.", time: "2020" },
		{
			title: "Series A",
			description: "Hired the first ten.",
			time: "2022",
			intent: "primary",
		},
		{ title: "1M users", description: "And counting.", time: "2025", intent: "success" },
	];

	type FeedItem = TimelineItem & { actor: string; avatar?: string };
	const FEED: FeedItem[] = [
		{
			actor: "Alice",
			avatar: "https://i.pravatar.cc/64?img=5",
			title: { html: "<b>Alice</b> assigned the ticket to <b>Bob</b>" },
			time: "2 hours ago",
		},
		{
			actor: "Bob",
			title: { html: "<b>Bob</b> added a comment" },
			description: "Reproduced on Safari 18 — it's the sticky header.",
			time: "1 hour ago",
		},
		{
			actor: "Alice",
			avatar: "https://i.pravatar.cc/64?img=9",
			title: { html: "<b>Alice</b> closed the ticket" },
			time: "just now",
			intent: "success",
		},
	];
</script>

<div class="space-y-16 py-8">
	<!-- Basic -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Basic</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Data-driven: <code>items</code> with <code>title</code>, <code>description</code>,
			<code>time</code>. Dots by default; <code>intent</code> colors the marker.
		</p>
		<Timeline items={ORDER} />
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Icons + intents -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Icons + Intents</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>icon</code> (THC, e.g. an icons-fns result) turns the dot into a bubble; an
			intent gives it a soft tint. Dots and bubbles mix freely in one list — the rail
			stays aligned.
			<code>href</code> renders the title as a link (last item).
		</p>
		<Timeline items={DEPLOY} />
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Opposite time -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Audit Log (time column + formatter)</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>timePosition="opposite"</code> puts the time in its own column. Items carry
			only a machine-readable <code>datetime</code> (rendered as
			<code>&lt;time datetime&gt;</code>); one <code>formatTime</code> produces the labels.
		</p>
		<Timeline
			items={AUDIT}
			timePosition="opposite"
			formatTime={(d) => fmt.format(new Date(d))}
			aria-label="Audit log"
		/>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Alternate -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Alternate</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>align="alternate"</code> — centered rail, content alternating sides. With
			<code>timePosition="opposite"</code> the time takes the free side (second example).
		</p>
		<Timeline items={HISTORY} align="alternate" class="mb-10" />
		<Timeline items={HISTORY} align="alternate" timePosition="opposite" />
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Custom markers -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Custom Markers (Avatars)</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>renderMarker</code> replaces the marker for every item; here an
			<code>Avatar</code>
			keyed on extra item data.
		</p>
		<Timeline items={FEED}>
			{#snippet renderMarker({ item })}
				{@const f = item as FeedItem}
				<Avatar src={f.avatar} initials={f.actor} size="sm" autoColor />
			{/snippet}
		</Timeline>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Footer -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Footer Actions</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>renderFooter</code> adds a per-item area under the description.
		</p>
		<Timeline items={ORDER.slice(0, 3)}>
			{#snippet renderFooter({ item, index })}
				<Button size="sm" variant="outline" onclick={() => alert(`edit #${index}`)}>
					{@html iconPencil({ size: 14 })} Edit
				</Button>
				<Button
					size="sm"
					variant="ghost"
					intent="destructive"
					onclick={() => alert(`delete ${item.title}`)}
				>
					{@html iconTrash({ size: 14 })} Delete
				</Button>
			{/snippet}
		</Timeline>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- renderItem -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Custom Item Content</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>renderItem</code> takes over the whole content cell; the rail and markers stay.
		</p>
		<Timeline items={DEPLOY.slice(0, 3)}>
			{#snippet renderItem({ item })}
				<div class="flex items-center gap-2 flex-wrap">
					<span class="font-medium"
						><b>{typeof item.title === "string" ? item.title : ""}</b></span
					>
					{#if item.intent}
						<Pill intent={item.intent} size="sm">{item.intent}</Pill>
					{/if}
					<span class="text-sm text-neutral-500 ms-auto">{item.time}</span>
				</div>
				{#if item.description}
					<pre
						class="mt-1 text-xs bg-neutral-100 dark:bg-neutral-800 rounded p-2">{typeof item.description ===
						"string"
							? item.description
							: ""}</pre>
				{/if}
			{/snippet}
		</Timeline>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Custom styling -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Custom Styling via CSS Variables</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Customized using CSS custom properties — inside a card, point the marker ring at the
			card background so the line still "breaks" around the markers.
		</p>
		<div
			class="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 p-6"
			style="
				--stuic-timeline-marker-ring-color: var(--color-neutral-50);
				--stuic-timeline-marker-size: 1rem;
				--stuic-timeline-marker-bg: var(--stuic-color-primary);
				--stuic-timeline-connector-thickness: 3px;
				--stuic-timeline-connector-bg: color-mix(in srgb, var(--stuic-color-primary) 30%, transparent);
				--stuic-timeline-gap-vertical: 2.5rem;
				--stuic-timeline-title-font-size: var(--text-lg);
			"
		>
			<Timeline
				items={ORDER.slice(0, 3)}
				class="dark:[--stuic-timeline-marker-ring-color:var(--color-neutral-900)]"
			/>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Unstyled -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Unstyled</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Using unstyled mode with custom Tailwind classes (no rail, no grid — just the list).
		</p>
		<Timeline
			unstyled
			items={ORDER.slice(0, 3)}
			class="space-y-2"
			classItem="flex items-baseline gap-3"
			classMarker="hidden"
			classTime="text-xs font-mono text-neutral-400 w-20 shrink-0"
			classContent="flex items-baseline gap-3 flex-wrap"
			classTitle="font-medium"
			classDescription="text-sm text-neutral-500"
		/>
	</section>
</div>
