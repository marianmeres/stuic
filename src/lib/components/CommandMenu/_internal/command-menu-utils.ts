import type { Item } from "@marianmeres/item-collection";

/**
 * Pure option/result helpers for CommandMenu, extracted from the component so they
 * can be unit-tested in the fast node project (no DOM). The actual searchable
 * matching is delegated to `@marianmeres/item-collection`; these are the structural
 * pieces around the results — how a result's label is derived, how results sort, and
 * how they group by optgroup for rendering.
 */

/** Derive an option's display label: the consumer renderer, else its id prop. */
export function renderOptionLabelOf(
	item: Item,
	renderOptionLabel: ((item: Item) => string) | undefined,
	itemIdPropName: string
): string {
	return renderOptionLabel?.(item) || `${item[itemIdPropName]}`;
}

/**
 * Compare two options by "{optgroup}__{label}" using a case-insensitive locale
 * compare, so options sort grouped-then-alphabetical. `renderLabel` derives the
 * label part (typically `renderOptionLabelOf` bound to the component's props).
 */
export function sortByOptgroupLabel(
	a: Item,
	b: Item,
	renderLabel: (item: Item) => string
): number {
	const withOptGroup = (i: Item) => `${i.optgroup || ""}__${renderLabel(i)}`;
	return withOptGroup(a).localeCompare(withOptGroup(b), undefined, {
		sensitivity: "base",
	});
}

/**
 * Group options into a Map keyed by their (rendered) optgroup label, preserving
 * input order within each group. `renderOptionGroup` maps a raw optgroup key to its
 * display label (e.g. underscores → spaces).
 */
export function normalizeAndGroupOptions(
	opts: Item[],
	renderOptionGroup: (s: string) => string
): Map<string, Item[]> {
	const groupped = new Map<string, Item[]>();
	opts.forEach((o) => {
		const optgLabel = renderOptionGroup(o.optgroup || "");
		if (!groupped.has(optgLabel)) groupped.set(optgLabel, []);
		groupped.get(optgLabel)!.push(o);
	});
	return groupped;
}
