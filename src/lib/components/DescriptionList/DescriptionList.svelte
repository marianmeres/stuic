<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";
	import type { THC } from "../Thc/Thc.svelte";

	/** Row shape: label above value, label beside value, or the former until there is room */
	export type DescriptionListLayout = "auto" | "stacked" | "columns";

	/**
	 * Where `layout="auto"` switches to columns, measured on the list's OWN inline size.
	 * The names and numbers of Tailwind's `@xs`…`@xl` container variants.
	 */
	export type DescriptionListColumnsFrom = "xs" | "sm" | "md" | "lg" | "xl";

	/** Hairlines: between rows only, around the whole list, or none */
	export type DescriptionListDivide = "none" | "inside" | "outside";

	/** How a long value behaves */
	export type DescriptionListWrap = "anywhere" | "truncate" | "normal";

	/** Text alignment of the value column */
	export type DescriptionListValueAlign = "start" | "end";

	export interface DescriptionListItem {
		/** Keyed `{#each}` identity. Falls back to the index. */
		key?: string | number;
		/** The term (`<dt>`) */
		label: THC;
		/**
		 * The details (`<dd>`). A number is `String()`-ed. `undefined`, `null` or `""`
		 * → `emptyValue` (`null` is accepted because that is what an API row holds).
		 */
		value?: THC | number | null;
		/**
		 * A second `<dd>` under the value — a unit, a qualifier, a "vs. last month".
		 * In the columns state it sits under the value column, never under the label.
		 */
		description?: THC | null;
		/**
		 * Wraps the value in `<a href>`. Plain link only; anything more (`target`, `rel`,
		 * `onclick`) is the snippet / `children` form — same rule as `Stat` and `Timeline`.
		 */
		href?: string | null;
		/**
		 * `title` attribute on the value `<dd>`. When the effective wrap is `"truncate"`
		 * and `value` is a non-empty plain string, it defaults to that value — a clipped
		 * value must stay reachable.
		 */
		title?: string;
		/** `lang` on the `<dt>` */
		labelLang?: string;
		/** `lang` on the value `<dd>` */
		valueLang?: string;
		/** `data-emphasis` on the row: full-strength label color and semibold value — the *Total* row */
		emphasis?: boolean;
		/** Per-row override of the list's `wrap` */
		wrap?: DescriptionListWrap;
		/** Class for this row (`div`), merged after `classItem` */
		class?: string;
		/** Class for this row's `<dt>`, merged after `classLabel` */
		classLabel?: string;
		/** Class for this row's value `<dd>`, merged after `classValue` */
		classValue?: string;
		/** Class for this row's description `<dd>`, merged after `classDescription` */
		classDescription?: string;
	}

	export interface DescriptionListSnippetArg {
		item: DescriptionListItem;
		index: number;
	}

	export interface Props extends Omit<HTMLAttributes<HTMLDListElement>, "children"> {
		/** The rows, in order. Data-driven form. */
		items?: DescriptionListItem[];
		/**
		 * Compositional form: rendered inside the `<dl>` *instead of* `items`. Write
		 * `<div><dt>…</dt><dd>…</dd></div>` per row; the structural CSS styles it identically.
		 */
		children?: Snippet;
		/**
		 * `"stacked"`: label above value, always. `"columns"`: label beside value, always.
		 * `"auto"` (default): stacked until the list itself is `columnsFrom` wide, then columns.
		 */
		layout?: DescriptionListLayout;
		/**
		 * The **list's own** inline size at which `"auto"` switches to columns:
		 * 20 / 24 / 28 / 32 / 36rem. Ignored unless `layout="auto"`.
		 */
		columnsFrom?: DescriptionListColumnsFrom;
		/**
		 * `"inside"` (default): a hairline *between* rows only (a list inside a card, drawer
		 * or panel — the box supplies the outer edge). `"outside"`: plus one above the first
		 * and below the last (a list loose on a page). `"none"`: no rules.
		 */
		divide?: DescriptionListDivide;
		/**
		 * How a long value behaves. `"anywhere"` (default) never lets a value push the page
		 * sideways. `"truncate"` clips to one line with an ellipsis. `"normal"` leaves the
		 * browser default. Per-item override via `item.wrap`.
		 */
		wrap?: DescriptionListWrap;
		/**
		 * Text alignment of the value column. `"end"` is the totals shape — pair it with
		 * `--stuic-description-list-label-width: 1fr`.
		 */
		valueAlign?: DescriptionListValueAlign;
		/**
		 * Rendered in the `<dd>` when an item's `value` is `undefined`, `null` or `""`.
		 * Pass `""` to render an empty cell.
		 */
		emptyValue?: THC;
		/** Override the `<dt>` content for every row */
		renderLabel?: Snippet<[DescriptionListSnippetArg]>;
		/** Override the value `<dd>` content for every row */
		renderValue?: Snippet<[DescriptionListSnippetArg]>;
		/** Override the whole row *content* (the `<div>` stays — it is what the grid is on) */
		renderItem?: Snippet<[DescriptionListSnippetArg]>;
		/** Skip all default styling */
		unstyled?: boolean;
		/** Additional CSS classes */
		class?: string;
		/** Class for every row (`div`) */
		classItem?: string;
		/** Class for every `<dt>` */
		classLabel?: string;
		/** Class for every value `<dd>` */
		classValue?: string;
		/** Class for every description `<dd>` */
		classDescription?: string;
		/** Bindable element reference */
		el?: HTMLDListElement;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import Thc, { isTHCNotEmpty } from "../Thc/Thc.svelte";

	let {
		items,
		children,
		layout = "auto",
		columnsFrom = "sm",
		divide = "inside",
		wrap = "anywhere",
		valueAlign = "start",
		emptyValue = "—",
		renderLabel,
		renderValue,
		renderItem,
		unstyled = false,
		class: classProp,
		classItem: classItemProp,
		classLabel: classLabelProp,
		classValue: classValueProp,
		classDescription: classDescriptionProp,
		el = $bindable(),
		...rest
	}: Props = $props();

	// `isTHCNotEmpty` only knows string/text/html/component — a snippet (bare or
	// `{ snippet }`) is renderable content it reports as empty, which would silently
	// drop a snippet description. Widen the test here.
	const _hasContent = (thc: THC | undefined | null): boolean =>
		typeof thc === "function" ||
		!!(thc && typeof thc === "object" && "snippet" in thc) ||
		isTHCNotEmpty(thc);

	/** Emptiness of a VALUE is deliberately not `isTHCNotEmpty`: `0` is a value, not empty. */
	const _isEmptyValue = (v: THC | number | undefined | null): boolean =>
		v === undefined || v === null || v === "";

	const _value = (item: DescriptionListItem): THC => {
		if (_isEmptyValue(item.value)) return emptyValue;
		return typeof item.value === "number" ? String(item.value) : (item.value as THC);
	};

	const _wrap = (item: DescriptionListItem): DescriptionListWrap => item.wrap ?? wrap;

	// A clipped value must stay reachable. Only a plain string can become a title —
	// html/component/snippet values have no string to put there (pass `item.title`).
	const _title = (item: DescriptionListItem): string | undefined => {
		if (item.title !== undefined) return item.title;
		if (_wrap(item) !== "truncate") return undefined;
		return typeof item.value === "string" && item.value !== "" ? item.value : undefined;
	};

	let _class = $derived(
		unstyled ? classProp : twMerge("stuic-description-list", classProp)
	);

	const _classItem = (item: DescriptionListItem) =>
		unstyled
			? twMerge(classItemProp, item.class)
			: twMerge("stuic-description-list-item", classItemProp, item.class);

	const _classLabel = (item: DescriptionListItem) =>
		unstyled
			? twMerge(classLabelProp, item.classLabel)
			: twMerge("stuic-description-list-label", classLabelProp, item.classLabel);

	const _classValue = (item: DescriptionListItem) =>
		unstyled
			? twMerge(classValueProp, item.classValue)
			: twMerge("stuic-description-list-value", classValueProp, item.classValue);

	const _classDescription = (item: DescriptionListItem) =>
		unstyled
			? twMerge(classDescriptionProp, item.classDescription)
			: twMerge(
					"stuic-description-list-description",
					classDescriptionProp,
					item.classDescription
				);

	// An empty list with `divide="outside"` would draw two rules around a void.
	let _render = $derived(!!children || !!items?.length);
</script>

{#if _render}
	<dl
		bind:this={el}
		class={_class}
		data-layout={!unstyled ? layout : undefined}
		data-columns-from={!unstyled && layout === "auto" ? columnsFrom : undefined}
		data-divide={!unstyled ? divide : undefined}
		data-wrap={!unstyled ? wrap : undefined}
		data-value-align={!unstyled ? valueAlign : undefined}
		{...rest}
	>
		{#if children}
			{@render children()}
		{:else}
			{#each items ?? [] as item, index (item.key ?? index)}
				<div
					class={_classItem(item)}
					data-emphasis={!unstyled && item.emphasis ? "" : undefined}
					data-wrap={!unstyled ? item.wrap : undefined}
				>
					{#if renderItem}
						{@render renderItem({ item, index })}
					{:else}
						<dt class={_classLabel(item)} lang={item.labelLang}>
							{#if renderLabel}
								{@render renderLabel({ item, index })}
							{:else}
								<Thc thc={item.label} />
							{/if}
						</dt>
						<dd class={_classValue(item)} lang={item.valueLang} title={_title(item)}>
							{#if renderValue}
								{@render renderValue({ item, index })}
							{:else if item.href}
								<a href={item.href}><Thc thc={_value(item)} /></a>
							{:else}
								<Thc thc={_value(item)} />
							{/if}
						</dd>
						{#if _hasContent(item.description)}
							<dd class={_classDescription(item)}>
								<Thc thc={item.description!} />
							</dd>
						{/if}
					{/if}
				</div>
			{/each}
		{/if}
	</dl>
{/if}
