<script lang="ts">
	// Layout fixture: rows whose parts are DIRECT children of the <li> (a raw snippet can
	// only render one root element), plus a hand-written `children` form to compare.
	import ListGroup from "./ListGroup.svelte";

	interface Line {
		id: number;
		code: string;
		name: string;
		qty: number;
		location: string;
	}

	let {
		width = 1000,
		mode = "items",
		linked = false,
		showRow = false,
		style,
		title = "Loose items",
	}: {
		width?: number;
		mode?: "items" | "children" | "children-empty";
		linked?: boolean;
		showRow?: boolean;
		style?: string;
		title?: string;
	} = $props();

	const LINES: Line[] = [
		{
			id: 1,
			code: "7QMET2GD",
			name: "Folding chair",
			qty: 40,
			location: "hall-a.floor-a",
		},
		{
			id: 2,
			code: "89A6KMHY",
			name: "Carpet tape, double-sided",
			qty: 3,
			location: "hall-a-raca.rack-a2.shelf-a2-2.consumables-bin",
		},
	];
</script>

<!-- the theme is not loaded in browser tests: `--stuic-color-border` / `-ring` are undefined, which
     would make the rule and ring declarations invalid at computed-value time -->
<div
	data-testid="frame"
	style="width: {width}px; --stuic-list-group-rule-color: currentColor; --stuic-list-group-item-ring-color: currentColor;"
>
	{#if mode === "items"}
		<ListGroup
			items={LINES}
			getItemId={(l) => l.id}
			itemHref={linked ? (l) => `#/line/${l.id}` : undefined}
			{title}
			{style}
		>
			{#snippet renderItem({ item })}
				<span data-part="code">{item.code}</span>
				<span data-part="name" data-grow>{item.name}</span>
				<span data-part="qty">×{item.qty}</span>
				<span data-part="picked">picked {item.qty}/{item.qty}</span>
				<span data-part="location">{item.location}</span>
			{/snippet}
		</ListGroup>
	{:else if mode === "children"}
		<ListGroup {title} {style}>
			<li data-row="plain">
				<span data-part="code">7QMET2GD</span>
				<span data-part="name" data-grow>Folding chair</span>
			</li>
			<li data-row="link">
				<a href="#/search"><span data-part="name" data-grow>Search</span><kbd>/</kbd></a>
			</li>
			<li data-row="button">
				<button type="button"><span>A button row</span></button>
			</li>
			<li data-row="stuic">
				<button type="button" class="stuic-button">Kept</button>
			</li>
		</ListGroup>
	{:else}
		<ListGroup {title} footer="The footer">
			{#if showRow}<li>A row</li>{/if}
		</ListGroup>
	{/if}
</div>
