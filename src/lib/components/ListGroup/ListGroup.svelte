<script lang="ts" module>
	import type { HTMLAttributes, HTMLLiAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";
	import type { THC } from "../Thc/Thc.svelte";

	/** Renders the title as `<h1>`…`<h6>`. Semantics only — the look never changes. */
	export type ListGroupTitleLevel = 1 | 2 | 3 | 4 | 5 | 6;

	export interface ListGroupSnippetArg<T = unknown> {
		item: T;
		index: number;
	}

	/**
	 * What `itemProps` may put on a row `<li>` — typically the `data-*` hooks a consumer's
	 * tests select on. `class` is a plain string so it can be merged after `classItem`.
	 */
	export type ListGroupItemProps = Omit<HTMLLiAttributes, "children" | "class"> & {
		class?: string;
	};

	/** Attributes for the `<ul>` itself (`class` is `classList`, `role` is fixed) */
	export type ListGroupListProps = Omit<
		HTMLAttributes<HTMLUListElement>,
		"children" | "class" | "role"
	>;

	export interface Props<T = unknown> extends Omit<
		HTMLAttributes<HTMLDivElement>,
		"children" | "title"
	> {
		/** The rows, in order. Data-driven form. */
		items?: T[];
		/**
		 * A row's content, rendered inside the `<li>` (or inside the `<a>` when `itemHref`
		 * returns a href). Without it an item is rendered as `THC`, so `items={["a", "b"]}`
		 * works as is.
		 */
		renderItem?: Snippet<[ListGroupSnippetArg<T>]>;
		/**
		 * Compositional form: rendered inside the `<ul>` *instead of* `items`. Write `<li>`s;
		 * the structural CSS styles them exactly like generated rows.
		 */
		children?: Snippet;
		/** Keyed `{#each}` identity. Defaults to the index. */
		getItemId?: (item: T, index: number) => string | number;
		/**
		 * Attributes spread onto each `<li>` — the `data-*` hooks consumers test against.
		 * A returned `class` is merged after `classItem`. `null`/`undefined` values omit the
		 * attribute. Identity comes from `getItemId`, never from here.
		 */
		itemProps?: (item: T, index: number) => ListGroupItemProps | undefined;
		/**
		 * When it returns a href, the row's content is wrapped in
		 * `<a class="stuic-list-group-item-link">` and the anchor becomes the row box
		 * (padding, hover, focus ring). Falsy → a plain row. A linked row must not contain
		 * other interactive content.
		 */
		itemHref?: (item: T, index: number) => string | undefined | null;
		/** The header's start side. Labels the list (`aria-labelledby`). */
		title?: THC;
		/** Render the title as `<hN>` instead of a `<div>`. Semantics only. */
		titleLevel?: ListGroupTitleLevel;
		/**
		 * The header's end side: a sum, a count, a shortfall, an action. Never an automatic
		 * row count — say what the figure is.
		 */
		aside?: THC;
		/** A line inside the box, under the rows, above a rule. */
		footer?: THC;
		/**
		 * Rendered in place of the `<ul>` when `items` is empty (or absent) and there are no
		 * `children`. Without it, a group with no rows renders nothing at all.
		 */
		empty?: THC;
		/**
		 * Attributes for the `<ul>`. The escape hatch for labelling a list that has no
		 * `title` (`aria-label`, or `aria-labelledby` pointing at a caption outside the box)
		 * — an `aria-label` on the root `<div>` would name nothing.
		 */
		listProps?: ListGroupListProps;
		/** Skip all default styling */
		unstyled?: boolean;
		/** Additional CSS classes for the root */
		class?: string;
		/** Class for the header row */
		classHeader?: string;
		/** Class for the title */
		classTitle?: string;
		/** Class for the aside */
		classAside?: string;
		/** Class for the `<ul>` */
		classList?: string;
		/** Class for every generated `<li>` */
		classItem?: string;
		/** Class for every generated `<a>` (`itemHref`) */
		classItemLink?: string;
		/** Class for the empty state */
		classEmpty?: string;
		/** Class for the footer */
		classFooter?: string;
		/** Bindable root element reference */
		el?: HTMLDivElement;
	}
</script>

<script lang="ts" generics="T = unknown">
	import { twMerge } from "../../utils/tw-merge.js";
	import { getId } from "../../utils/get-id.js";
	import Thc, { isTHCNotEmpty } from "../Thc/Thc.svelte";

	let {
		items,
		renderItem,
		children,
		getItemId = (_item: T, index: number) => index,
		itemProps,
		itemHref,
		title,
		titleLevel,
		aside,
		footer,
		empty,
		listProps,
		unstyled = false,
		class: classProp,
		classHeader: classHeaderProp,
		classTitle: classTitleProp,
		classAside: classAsideProp,
		classList: classListProp,
		classItem: classItemProp,
		classItemLink: classItemLinkProp,
		classEmpty: classEmptyProp,
		classFooter: classFooterProp,
		el = $bindable(),
		...rest
	}: Props<T> = $props();

	const titleId = getId("stuic-list-group-title-");

	let rows = $derived(items ?? []);
	let hasRows = $derived(!!children || rows.length > 0);
	let hasTitle = $derived(isTHCNotEmpty(title));
	let hasAside = $derived(isTHCNotEmpty(aside));
	let hasFooter = $derived(isTHCNotEmpty(footer));
	let hasEmpty = $derived(isTHCNotEmpty(empty));

	let _titleTag = $derived(
		titleLevel && titleLevel >= 1 && titleLevel <= 6 ? `h${titleLevel}` : "div"
	);

	// Under `unstyled` a part keeps only the consumer's classes — `undefined` rather than
	// `class=""` when there are none.
	const _cls = (base: string, ...extra: (string | undefined)[]) =>
		(unstyled ? twMerge(...extra) : twMerge(base, ...extra)) || undefined;

	let _class = $derived(unstyled ? classProp : twMerge("stuic-list-group", classProp));
	let _classHeader = $derived(_cls("stuic-list-group-header", classHeaderProp));
	let _classTitle = $derived(_cls("stuic-list-group-title", classTitleProp));
	let _classAside = $derived(_cls("stuic-list-group-aside", classAsideProp));
	let _classList = $derived(_cls("stuic-list-group-list", classListProp));
	let _classItemLink = $derived(_cls("stuic-list-group-item-link", classItemLinkProp));
	let _classEmpty = $derived(_cls("stuic-list-group-empty", classEmptyProp));
	let _classFooter = $derived(_cls("stuic-list-group-footer", classFooterProp));

	/** `itemProps` split into the attributes to spread and the class to merge */
	const _itemAttrs = (item: T, index: number) => {
		const { class: itemClass, ...attrs }: ListGroupItemProps =
			itemProps?.(item, index) ?? {};
		return { attrs, class: _cls("stuic-list-group-item", classItemProp, itemClass) };
	};
</script>

{#snippet content(item: T, index: number)}
	{#if renderItem}
		{@render renderItem({ item, index })}
	{:else}
		<Thc thc={item as THC} />
	{/if}
{/snippet}

{#if hasRows || hasEmpty}
	<div bind:this={el} class={_class} {...rest}>
		<!-- A <div>, not a <header>: outside <main>/sectioning content (a drawer, a
		     dialog) a <header> is a `banner` landmark, one per group. -->
		{#if hasTitle || hasAside}
			<div class={_classHeader}>
				{#if hasTitle}
					<svelte:element this={_titleTag} id={titleId} class={_classTitle}>
						<Thc thc={title!} />
					</svelte:element>
				{/if}
				{#if hasAside}
					<div class={_classAside}><Thc thc={aside!} /></div>
				{/if}
			</div>
		{/if}

		{#if hasRows}
			<!-- WebKit drops list semantics from a `list-style: none` <ul> without it -->
			<ul
				role="list"
				aria-labelledby={hasTitle ? titleId : undefined}
				{...listProps}
				class={_classList}
			>
				{#if children}
					{@render children()}
				{:else}
					{#each rows as item, index (getItemId(item, index))}
						{@const li = _itemAttrs(item, index)}
						{@const href = itemHref?.(item, index)}
						<li {...li.attrs} class={li.class}>
							{#if href}
								<a {href} class={_classItemLink}>{@render content(item, index)}</a>
							{:else}
								{@render content(item, index)}
							{/if}
						</li>
					{/each}
				{/if}
			</ul>
		{:else}
			<div class={_classEmpty}><Thc thc={empty!} /></div>
		{/if}

		<!-- A <div>, not a <footer>: same landmark reason as the header -->
		{#if hasFooter}
			<div class={_classFooter}><Thc thc={footer!} /></div>
		{/if}
	</div>
{/if}
