<script lang="ts">
	import {
		Breadcrumbs,
		breadcrumbsJsonLd,
		createBreadcrumbsT,
		BREADCRUMBS_MESSAGES_SK,
		type BreadcrumbItem,
	} from "$lib/components/Breadcrumbs/index.js";
	import { iconChevronRight } from "$lib/icons/index.js";

	const items: BreadcrumbItem[] = [
		{ label: "Home", href: "#/" },
		{ label: "Products", href: "#/products" },
		{ label: "Phones" },
	];

	const deep: BreadcrumbItem[] = [
		{ label: "Home", href: "#/" },
		{ label: "Catalog", href: "#/catalog" },
		{ label: "Electronics", href: "#/catalog/electronics" },
		{ label: "Audio", href: "#/catalog/electronics/audio" },
		{ label: "Headphones", href: "#/catalog/electronics/audio/headphones" },
		{ label: "Over-ear" },
	];

	const tSk = createBreadcrumbsT(BREADCRUMBS_MESSAGES_SK);
</script>

<h2 class="text-xl font-bold mb-4">Breadcrumbs</h2>

<h3 class="font-semibold mb-2">Basic (last crumb = current page, no href)</h3>
<div class="mb-8">
	<Breadcrumbs {items} />
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Custom separator ("›") and snippet (chevron icon)</h3>
<div class="mb-8 space-y-2">
	<Breadcrumbs {items} separator="›" />
	<Breadcrumbs {items}>
		{#snippet renderSeparator()}
			<span class="block size-3.5 opacity-75">{@html iconChevronRight()}</span>
		{/snippet}
	</Breadcrumbs>
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Long trail collapsed (maxItems=4, click the … )</h3>
<div class="mb-8">
	<Breadcrumbs items={deep} maxItems={4} itemsAfterCollapse={2} />
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Custom crumb rendering (renderItem)</h3>
<div class="mb-8">
	<Breadcrumbs {items}>
		{#snippet renderItem(item, index, isLast)}
			{#if isLast}
				<span aria-current="page" class="font-bold underline decoration-dotted">
					{item.label}
				</span>
			{:else}
				<a href={item.href} class="hover:underline">
					{index === 0 ? "🏠" : ""}
					{item.label}
				</a>
			{/if}
		{/snippet}
	</Breadcrumbs>
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">i18n (Slovak catalog — inspect the aria-labels)</h3>
<div class="mb-8">
	<Breadcrumbs items={deep} maxItems={3} t={tSk} />
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">SEO: JSON-LD structured data</h3>
<div class="mb-8 space-y-2">
	<p class="text-sm text-neutral-500">
		jsonLd renders a schema.org BreadcrumbList script tag along with the trail (inspect
		the DOM). The generated data:
	</p>
	<Breadcrumbs {items} jsonLd={{ baseUrl: "https://example.com" }} />
	<pre
		class="text-xs bg-neutral-100 dark:bg-neutral-900 rounded p-3 overflow-x-auto">{JSON.stringify(
			breadcrumbsJsonLd(items, { baseUrl: "https://example.com" }),
			null,
			2
		)}</pre>
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Token overrides</h3>
<div class="mb-8">
	<Breadcrumbs
		{items}
		separator="•"
		style="--stuic-breadcrumbs-font-size: 1rem; --stuic-breadcrumbs-gap: 0.75rem; --stuic-breadcrumbs-text-current: var(--stuic-color-primary);"
	/>
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Unstyled</h3>
<div class="mb-8">
	<Breadcrumbs {items} unstyled />
</div>
