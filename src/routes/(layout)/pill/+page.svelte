<script lang="ts">
	import {
		Pill,
		type IntentColorKey,
		type PillVariant,
		type PillSize,
		iconCheck,
		iconArrowRight,
		iconUser,
		iconTrash,
	} from "$lib/index.js";

	const intents: (IntentColorKey | undefined)[] = [
		undefined,
		"primary",
		"accent",
		"destructive",
		"warning",
		"success",
	];

	const variants: PillVariant[] = ["solid", "outline", "ghost", "soft", "link"];
	const sizes: PillSize[] = ["sm", "md", "lg"];

	// dismissible demo state
	let tags = $state(["svelte", "tailwind", "stuic", "design-tokens", "typescript"]);
	function dismissTag(t: string) {
		tags = tags.filter((x) => x !== t);
	}

	// active/filter chip demo state
	let filters = $state(new Set<string>(["new"]));
	const filterOptions = ["new", "popular", "discounted", "in-stock"];
	function toggleFilter(f: string) {
		if (filters.has(f)) filters.delete(f);
		else filters.add(f);
		filters = new Set(filters);
	}

	let clickedCount = $state(0);
</script>

<h2 class="text-xl font-semibold mb-4">Intent x Variant Matrix</h2>

<div class="space-y-3">
	{#each intents as intent}
		<div class="flex flex-wrap gap-3 items-center">
			<span class="w-24 text-sm text-neutral-500">{intent || "default"}</span>
			{#each variants as variant}
				<Pill {intent} {variant}>{variant}</Pill>
			{/each}
		</div>
	{/each}
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">Sizes</h2>

<div class="flex flex-wrap gap-3 items-center">
	{#each sizes as size}
		<Pill intent="primary" {size}>{size}</Pill>
	{/each}
	<span class="text-sm text-neutral-500">— pills are smaller than buttons</span>
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">Polymorphic: span / link / button</h2>

<div class="flex flex-wrap gap-3 items-center">
	<Pill intent="primary">plain &lt;span&gt;</Pill>
	<Pill intent="accent" href="https://svelte.dev" target="_blank">&lt;a&gt; link</Pill>
	<Pill intent="success" onclick={() => clickedCount++}>
		clicked {clickedCount}x
	</Pill>
	<Pill intent="destructive" onclick={() => alert("Removed!")} variant="outline">
		clickable outline
	</Pill>
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">Status dot</h2>

<div class="flex flex-wrap gap-3 items-center">
	<Pill intent="success" dot>Online</Pill>
	<Pill intent="warning" dot>Idle</Pill>
	<Pill intent="destructive" dot>Offline</Pill>
	<Pill intent="primary" dot variant="outline">Active</Pill>
	<Pill dot>Unknown</Pill>
	<Pill intent="success" dot variant="solid">Solid + dot</Pill>
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">contentBefore / contentAfter</h2>

<div class="flex flex-wrap gap-3 items-center">
	<Pill intent="success" contentBefore={{ html: iconCheck() }}>Verified</Pill>
	<Pill intent="primary" contentAfter={{ html: iconArrowRight() }}>Next</Pill>
	<Pill
		intent="accent"
		variant="outline"
		contentBefore={{ html: iconUser() }}
		contentAfter={{ html: iconArrowRight() }}
	>
		Profile
	</Pill>
	<Pill
		intent="destructive"
		variant="soft"
		size="lg"
		contentBefore={{ html: iconTrash() }}
	>
		Deleted
	</Pill>
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">Dismissible (tags)</h2>

<p class="text-sm text-neutral-500 mb-2">
	Click the X to remove. Re-render the page to reset.
</p>

<div class="flex flex-wrap gap-2 items-center min-h-8">
	{#each tags as tag (tag)}
		<Pill
			intent="primary"
			variant="soft"
			dismissible
			ondismiss={() => dismissTag(tag)}
		>
			{tag}
		</Pill>
	{/each}
	{#if tags.length === 0}
		<span class="text-sm text-neutral-500 italic">— no tags left —</span>
	{/if}
</div>

<h3 class="text-sm font-semibold mt-6 mb-2">Dismissible + clickable</h3>
<div class="flex flex-wrap gap-2 items-center">
	<Pill
		intent="accent"
		variant="solid"
		dismissible
		onclick={() => alert("clicked main")}
		ondismiss={() => alert("dismissed (no main click)")}
	>
		click me / dismiss me
	</Pill>
	<Pill
		intent="success"
		variant="outline"
		dismissible
		href="https://svelte.dev"
		target="_blank"
		ondismiss={() => alert("dismissed (no nav)")}
	>
		link + dismiss
	</Pill>
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">Active / Filter chips</h2>

<p class="text-sm text-neutral-500 mb-2">Click to toggle.</p>

<div class="flex flex-wrap gap-2 items-center">
	{#each filterOptions as opt}
		<Pill
			intent="primary"
			variant="outline"
			active={filters.has(opt)}
			onclick={() => toggleFilter(opt)}
		>
			{opt}
		</Pill>
	{/each}
</div>

<p class="text-sm text-neutral-500 mt-2">
	Selected: {[...filters].join(", ") || "(none)"}
</p>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">Muted</h2>

<div class="flex flex-wrap gap-3 items-center">
	<Pill intent="primary">Normal</Pill>
	<Pill intent="primary" muted>Muted</Pill>
	<Pill intent="destructive" variant="solid">Normal solid</Pill>
	<Pill intent="destructive" variant="solid" muted>Muted solid</Pill>
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">Block (full width)</h2>

<div class="space-y-2 max-w-md">
	<Pill intent="primary" block>Block-level pill (fills its container)</Pill>
	<Pill intent="success" block dot>Online &mdash; with dot</Pill>
	<Pill
		intent="accent"
		variant="outline"
		block
		dismissible
		ondismiss={() => alert("dismissed")}
	>
		Block + dismissible
	</Pill>
	<Pill
		intent="warning"
		variant="soft"
		block
		contentBefore={{ html: iconCheck() }}
		contentAfter={{ html: iconArrowRight() }}
	>
		Block with leading + trailing
	</Pill>
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">Rounded vs Squared</h2>

<div class="flex flex-wrap gap-3 items-center">
	<Pill intent="primary">Rounded full (default)</Pill>
	<Pill intent="primary" roundedFull={false}>Element radius</Pill>
	<Pill intent="primary" style="--stuic-pill-radius: 4px;">Custom 4px</Pill>
	<Pill intent="primary" style="--stuic-pill-radius: 0;">Squared</Pill>
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">Disabled (interactive)</h2>

<div class="flex flex-wrap gap-3 items-center">
	<Pill intent="primary" onclick={() => {}} disabled>disabled button</Pill>
	<Pill intent="destructive" variant="outline" onclick={() => {}} disabled>
		disabled outline
	</Pill>
	<Pill
		intent="accent"
		dismissible
		onclick={() => {}}
		ondismiss={() => {}}
		disabled
	>
		disabled dismissible
	</Pill>
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">Theming via CSS variables</h2>

<div class="flex flex-wrap gap-3 items-center">
	<div style="--stuic-pill-radius: 0;">
		<Pill intent="primary">Squared section</Pill>
	</div>
	<div style="--stuic-pill-font-weight: 700; --stuic-pill-font-size-md: 0.75rem;">
		<Pill intent="accent">Bold &amp; small</Pill>
	</div>
	<Pill
		intent="success"
		style="--stuic-pill-padding-x-md: 1.5rem; --stuic-pill-padding-y-md: 0.5rem;"
	>
		Generous padding
	</Pill>
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">Inline in text</h2>

<p class="leading-7">
	You can drop a <Pill intent="primary" size="sm">tag</Pill> right into a paragraph,
	or call out a <Pill intent="success" size="sm" dot>shipped</Pill> status,
	or mark something as <Pill intent="destructive" variant="outline" size="sm">deprecated</Pill>
	&mdash; pills align nicely with surrounding text.
</p>
