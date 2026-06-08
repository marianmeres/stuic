import type {
	DropdownMenuItem,
	DropdownMenuActionItem,
	DropdownMenuExpandableItem,
} from "../DropdownMenu.svelte";

/**
 * Pure search/filter logic for DropdownMenu, extracted from the component so it can
 * be unit-tested in the fast node project (no DOM). The component delegates the actual
 * fuzzy/prefix matching to `@marianmeres/item-collection`; these helpers are the
 * structural pieces around it — which items are searchable, and which survive a match.
 */

/**
 * Flatten the menu's item list to the set that participates in search: top-level
 * action items, expandable section headers, and the action children nested inside
 * expandables. Dividers, headers and custom items are not searchable.
 */
export function extractSearchableItems(
	items: DropdownMenuItem[]
): (DropdownMenuActionItem | DropdownMenuExpandableItem)[] {
	const result: (DropdownMenuActionItem | DropdownMenuExpandableItem)[] = [];
	for (const item of items) {
		if (item.type === "action") result.push(item);
		if (item.type === "expandable") {
			result.push(item);
			for (const child of item.items) {
				if (child.type === "action") result.push(child);
			}
		}
	}
	return result;
}

/**
 * Given the set of ids a search matched, return the items that should remain visible:
 * - dividers / headers / custom items are hidden entirely during an active search,
 * - action items survive iff their id matched,
 * - expandable sections survive iff the section itself matched OR any of its action
 *   children matched.
 */
export function filterItemsByMatchedIds(
	items: DropdownMenuItem[],
	matchedIds: Set<string | number>
): DropdownMenuItem[] {
	return items.filter((item) => {
		if (item.type === "divider" || item.type === "header" || item.type === "custom") {
			return false;
		}
		if (item.type === "action") return matchedIds.has(item.id);
		if (item.type === "expandable") {
			return (
				matchedIds.has(item.id) ||
				item.items.some((c) => c.type === "action" && matchedIds.has(c.id))
			);
		}
		return false;
	});
}
