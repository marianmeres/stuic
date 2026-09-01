<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";
	import type { TranslateFn } from "../../types.js";
	import type { BreadcrumbsJsonLdOptions } from "./json-ld.js";

	/** One crumb of the trail. */
	export interface BreadcrumbItem {
		/** Visible label (also the `name` in the JSON-LD output). */
		label: string;
		/**
		 * Link target. Omit to render a plain (non-link) crumb — typical for the
		 * last item, the current page.
		 */
		href?: string;
	}

	export interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
		/** The trail, first-to-current. The last item is marked as the current page. */
		items: BreadcrumbItem[];
		/** Separator text between crumbs (default "/"). See also `renderSeparator`. */
		separator?: string;
		/**
		 * Collapse the middle of a long trail into an expandable ellipsis button when
		 * there are more than `maxItems` crumbs. `0` (default) never collapses.
		 */
		maxItems?: number;
		/** How many leading crumbs stay visible when collapsed (default 1). */
		itemsBeforeCollapse?: number;
		/** How many trailing crumbs stay visible when collapsed (default 1). */
		itemsAfterCollapse?: number;
		/**
		 * Render schema.org `BreadcrumbList` JSON-LD (a
		 * `<script type="application/ld+json">`) along with the trail — the
		 * structured data search engines read. Pass `{ baseUrl }` to resolve
		 * relative `href`s to the absolute URLs Google recommends. Alternatively
		 * use the exported `breadcrumbsJsonLdScript()` helper in `<svelte:head>`.
		 */
		jsonLd?: boolean | BreadcrumbsJsonLdOptions;
		/** i18n translate function (see `createBreadcrumbsT`). */
		t?: TranslateFn;
		/** Override the rendering of every crumb; receives `(item, index, isLast)`. */
		renderItem?: Snippet<[BreadcrumbItem, number, boolean]>;
		/** Override the separator between crumbs. */
		renderSeparator?: Snippet;
		/** Skip all default styling */
		unstyled?: boolean;
		/** Additional CSS classes */
		class?: string;
		/** Class for every `<li>` */
		classItem?: string;
		/** Class for every crumb link */
		classLink?: string;
		/** Extra class for the current (last) crumb */
		classCurrent?: string;
		/** Class for the separator */
		classSeparator?: string;
		/** Bindable element reference */
		el?: HTMLElement;
	}

	type Entry = { item: BreadcrumbItem; index: number } | "ellipsis";
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import { t_default } from "./i18n.js";
	import { breadcrumbsJsonLdScript } from "./json-ld.js";

	let {
		items,
		separator = "/",
		maxItems = 0,
		itemsBeforeCollapse = 1,
		itemsAfterCollapse = 1,
		jsonLd = false,
		t = t_default,
		renderItem,
		renderSeparator,
		unstyled = false,
		class: classProp,
		classItem: classItemProp,
		classLink: classLinkProp,
		classCurrent: classCurrentProp,
		classSeparator: classSeparatorProp,
		el = $bindable(),
		...rest
	}: Props = $props();

	// expansion is keyed on the items reference, so a new trail (navigation)
	// automatically collapses again ($state.raw: plain $state would proxy the
	// stored array and break the identity comparison)
	let _expandedFor: BreadcrumbItem[] | undefined = $state.raw();
	let _expanded = $derived(_expandedFor === items);

	let _collapsible = $derived(
		maxItems > 0 &&
			items.length > maxItems &&
			items.length > itemsBeforeCollapse + itemsAfterCollapse
	);

	let _entries: Entry[] = $derived.by(() => {
		const all: Entry[] = items.map((item, index) => ({ item, index }));
		if (!_collapsible || _expanded) return all;
		return [
			...all.slice(0, itemsBeforeCollapse),
			"ellipsis",
			...all.slice(items.length - itemsAfterCollapse),
		];
	});

	let _class = $derived(unstyled ? classProp : twMerge("stuic-breadcrumbs", classProp));
	let _classItem = $derived(
		unstyled ? classItemProp : twMerge("stuic-breadcrumbs-item", classItemProp)
	);
	let _classLink = $derived(
		unstyled ? classLinkProp : twMerge("stuic-breadcrumbs-link", classLinkProp)
	);
	let _classSeparator = $derived(
		unstyled
			? classSeparatorProp
			: twMerge("stuic-breadcrumbs-separator", classSeparatorProp)
	);

	function _classCrumb(isLast: boolean, isLink: boolean) {
		const current = isLast
			? unstyled
				? classCurrentProp
				: twMerge("stuic-breadcrumbs-current", classCurrentProp)
			: undefined;
		const link = isLink ? _classLink : undefined;
		return twMerge(link, current) || undefined;
	}

	let _jsonLdScript = $derived(
		jsonLd ? breadcrumbsJsonLdScript(items, jsonLd === true ? undefined : jsonLd) : ""
	);
</script>

{#if items.length}
	<nav
		bind:this={el}
		class={_class}
		aria-label={t("breadcrumbs", null, "Breadcrumb")}
		{...rest}
	>
		<ol class={!unstyled ? "stuic-breadcrumbs-list" : undefined}>
			{#each _entries as entry, i (entry === "ellipsis" ? "ellipsis" : entry.index)}
				<li
					class={_classItem}
					data-current={entry !== "ellipsis" && entry.index === items.length - 1
						? "true"
						: undefined}
				>
					{#if i > 0}
						<span class={_classSeparator} aria-hidden="true">
							{#if renderSeparator}{@render renderSeparator()}{:else}{separator}{/if}
						</span>
					{/if}
					{#if entry === "ellipsis"}
						<button
							type="button"
							class={!unstyled ? "stuic-breadcrumbs-ellipsis" : undefined}
							aria-label={t("show_all", null, "Show all breadcrumbs")}
							onclick={() => (_expandedFor = items)}
						>
							&hellip;
						</button>
					{:else}
						{@const isLast = entry.index === items.length - 1}
						{#if renderItem}
							{@render renderItem(entry.item, entry.index, isLast)}
						{:else if entry.item.href}
							<a
								href={entry.item.href}
								class={_classCrumb(isLast, true)}
								aria-current={isLast ? "page" : undefined}
							>
								{entry.item.label}
							</a>
						{:else}
							<span
								class={_classCrumb(isLast, false)}
								aria-current={isLast ? "page" : undefined}
							>
								{entry.item.label}
							</span>
						{/if}
					{/if}
				</li>
			{/each}
		</ol>
		{#if _jsonLdScript}
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- helper escapes angle brackets -->
			{@html _jsonLdScript}
		{/if}
	</nav>
{/if}
