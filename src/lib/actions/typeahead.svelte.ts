import type { Item } from "@marianmeres/item-collection";
import { ItemCollection } from "@marianmeres/item-collection";
import { unaccent } from "../utils/unaccent.js";
import { createClog } from "@marianmeres/clog";

/**
 * Configuration options for the typeahead action.
 */
export interface TypeaheadOptions<T extends Item = Item> {
	/** Whether the typeahead functionality is enabled (default: true) */
	enabled?: boolean;
	/** Async function to fetch options based on the current query (required when enabled) */
	getOptions?: (query: string, current: T[]) => Promise<T[]>;
	/** Custom function to render the label for an item */
	renderOptionLabel?: (item: T) => string;
	/** Property name to use as item ID (default: "id") */
	itemIdPropName?: string;
	/** Debounce delay in milliseconds (default: 150) */
	debounceMs?: number;
	/** Callback when value is submitted (Enter, Tab, blur) */
	onSubmit?: (value: string) => void;
	/** Callback when Backspace is pressed at cursor position 0 */
	onDeleteRequest?: () => void;
	/** Callback when fetching state changes */
	onFetchingChange?: (isFetching: boolean) => void;
	/** Disable showing all options when arrow keys pressed on empty input */
	noListAllOnEmptyQ?: boolean;
	/** Hint text appended to the visible suggestion (default: " [tab]") */
	appendHint?: string;
	/** CSS class for the ghost input element */
	classGhost?: string;
	/** Callback that provides a reset function to clear ghost text programmatically */
	onResetGhost?: (resetFn: () => void) => void;
}

const DEFAULT_DEBOUNCE_MS = 150;
const DEFAULT_APPEND_HINT = " [tab]";

const clog = createClog("typeahead", { color: "auto" });

/**
 * A Svelte action that adds typeahead/autocomplete functionality to an input element.
 *
 * Creates a "ghost input" behind the main input to show suggestions. Supports keyboard
 * navigation with ArrowUp/Down, accepts suggestions with Tab/Enter/ArrowRight, and
 * handles accent-insensitive matching.
 *
 * @param el - The input element to add typeahead to
 * @param fn - Function returning configuration options
 *
 * @example
 * ```svelte
 * <input
 *   bind:value
 *   use:typeahead={() => ({
 *     getOptions: async (q) => fetchSuggestions(q),
 *     renderOptionLabel: (item) => item.name,
 *     onSubmit: (v) => console.log('Selected:', v),
 *   })}
 * />
 * ```
 */
export function typeahead<T extends Item = Item>(
	el: HTMLInputElement,
	fn?: () => TypeaheadOptions<T>
) {
	let ghostEl: HTMLInputElement | null = null;
	let options: ItemCollection<T> | null = null;
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	let previousKey = "";
	let allowListAll = false;

	// Current resolved options
	let currentOpts: TypeaheadOptions<T> = { getOptions: async () => [] };

	// Helper: render option label
	function renderLabel(item: T): string {
		return (
			currentOpts.renderOptionLabel?.(item) ??
			`${item[currentOpts.itemIdPropName || "id"]}`
		);
	}

	// Helper: get current suggestion string
	function getSuggestion(): string {
		const active = options?.active;
		if (!active) return "";

		const value = el.value || "";
		const suggestion = renderLabel(active);
		// Preserve user's case, append rest from suggestion
		return value + suggestion.slice(value.length);
	}

	// Helper: get visible suggestion (with hint, or empty if matches value)
	function getVisibleSuggestion(): string {
		const suggestion = getSuggestion();
		const value = el.value || "";

		if (
			!suggestion ||
			unaccent(suggestion.toLowerCase()) === unaccent(value.toLowerCase())
		) {
			return "";
		}

		const hint = currentOpts.appendHint ?? DEFAULT_APPEND_HINT;
		return suggestion ? suggestion + hint : "";
	}

	// Update ghost input value
	function updateGhost() {
		if (ghostEl) {
			ghostEl.value = getVisibleSuggestion();
		}
	}

	// Create ghost input element
	function createGhost() {
		if (ghostEl) return;

		ghostEl = document.createElement("input");
		ghostEl.type = "text";
		ghostEl.tabIndex = -1;
		ghostEl.readOnly = true;
		ghostEl.setAttribute("aria-hidden", "true");
		ghostEl.setAttribute("autocomplete", "off");

		// Ensure parent has relative positioning
		const parent = el.parentElement;
		if (parent) {
			const parentPos = getComputedStyle(parent).position;
			if (parentPos === "static") {
				parent.style.position = "relative";
			}
		}

		// Style main input for proper layering
		el.style.position = "relative";
		el.style.zIndex = "10";
		el.style.background = "transparent";

		// Style ghost input
		applyGhostStyles();

		// Insert after main input
		el.insertAdjacentElement("afterend", ghostEl);
	}

	function applyGhostStyles() {
		if (!ghostEl) return;

		const computed = getComputedStyle(el);

		// Copy relevant styles from main input
		ghostEl.style.position = "absolute";
		ghostEl.style.inset = "0";
		ghostEl.style.pointerEvents = "none";
		ghostEl.style.opacity = "0.4";
		ghostEl.style.zIndex = "0";
		ghostEl.style.font = computed.font;
		ghostEl.style.padding = computed.padding;
		ghostEl.style.borderColor = "transparent";
		ghostEl.style.background = "transparent";
		ghostEl.style.color = "inherit";
		ghostEl.style.outline = "none";
		ghostEl.style.width = "100%";
		ghostEl.style.boxSizing = "border-box";
		ghostEl.style.transition = "none";

		// Apply custom class if provided
		if (currentOpts.classGhost) {
			ghostEl.className = currentOpts.classGhost;
		}
	}

	// Debounced search
	function scheduleSearch(query: string) {
		if (debounceTimer) clearTimeout(debounceTimer);

		debounceTimer = setTimeout(async () => {
			await performSearch(query);
		}, currentOpts.debounceMs ?? DEFAULT_DEBOUNCE_MS);
	}

	async function performSearch(query: string) {
		if (!options || !currentOpts.getOptions) return;

		options.clear();

		if (!allowListAll && !query) {
			updateGhost();
			return;
		}

		currentOpts.onFetchingChange?.(true);

		try {
			const results = await currentOpts.getOptions(query, []);

			if (!results.length) {
				updateGhost();
				return;
			}

			// Filter for exact "starts with" match
			let found = results;
			if (query) {
				found = results.filter((item) => {
					const label = unaccent(renderLabel(item).toLowerCase());
					return label.startsWith(unaccent(query.toLowerCase()));
				});
			}

			if (!found.length) {
				updateGhost();
				return;
			}

			options.addMany(found);
			options.setActiveFirst();
			updateGhost();
		} catch (err) {
			clog.error(err);
		} finally {
			currentOpts.onFetchingChange?.(false);
		}
	}

	// Submit handler
	function handleSubmit(value: string) {
		value = (value || "").trim();
		if (value) {
			currentOpts.onSubmit?.(value);
		}
		allowListAll = false;
	}

	// Set input value (triggers Svelte binding update via input event)
	function setInputValue(newValue: string) {
		el.value = newValue;
		el.dispatchEvent(new Event("input", { bubbles: true }));
	}

	// Keyboard handler
	function onKeyDown(e: KeyboardEvent) {
		// Ignore with modifier keys
		if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;

		const cursorPos = el.selectionStart ?? 0;
		const value = el.value || "";

		// ArrowRight only applies if cursor at end
		if (value.length && e.key === "ArrowRight" && cursorPos < value.length) {
			return;
		}

		// Tab after Enter should behave normally
		if (previousKey === "Enter" && e.key === "Tab") {
			return;
		}

		// Allow listing all on arrow keys with empty value
		allowListAll =
			!value.length &&
			!currentOpts.noListAllOnEmptyQ &&
			["ArrowDown", "ArrowUp"].includes(e.key);

		if (allowListAll) {
			scheduleSearch("");
		}

		const suggestion = options?.active ? renderLabel(options.active) : null;

		if (e.key === "ArrowDown") {
			options?.setActiveNext();
			updateGhost();
			e.preventDefault();
		} else if (e.key === "ArrowUp") {
			options?.setActivePrevious();
			updateGhost();
			e.preventDefault();
		} else if (["ArrowRight", "Tab"].includes(e.key) && suggestion) {
			if (e.key === "Tab" && value !== suggestion) {
				e.preventDefault();
			}
			setInputValue(suggestion);
			// Clear options and ghost immediately after accepting suggestion
			options?.clear();
			updateGhost();
			if (e.key === "Tab") handleSubmit(suggestion);
		} else if (e.key === "Enter") {
			options?.clear();
			handleSubmit(value);
		} else if (e.key === "Backspace" && cursorPos === 0) {
			currentOpts.onDeleteRequest?.();
		}

		previousKey = e.key;
	}

	// Input handler (for value changes)
	function onInput() {
		const value = el.value || "";

		// Quick clear if needed
		if ((!allowListAll && !value) || !options?.active) {
			options?.clear();
			updateGhost();
		} else if (options?.active) {
			// Check if current suggestion still matches
			const suggestion = renderLabel(options.active);
			if (!suggestion.toLowerCase().startsWith(value.toLowerCase())) {
				options.clear();
				updateGhost();
			}
		}

		// Schedule new search
		scheduleSearch(value);
	}

	// Blur handler
	function onBlur() {
		handleSubmit(el.value || "");
	}

	// Remove ghost and cleanup
	function destroyGhost() {
		ghostEl?.remove();
		ghostEl = null;

		// Reset main input styles
		el.style.position = "";
		el.style.zIndex = "";
		el.style.background = "";
	}

	// Main effect for setup/cleanup
	$effect(() => {
		const opts = fn?.() || { getOptions: async () => [] };

		currentOpts = {
			enabled: opts.enabled ?? true,
			getOptions: opts.getOptions,
			renderOptionLabel: opts.renderOptionLabel,
			itemIdPropName: opts.itemIdPropName || "id",
			debounceMs: opts.debounceMs ?? DEFAULT_DEBOUNCE_MS,
			onSubmit: opts.onSubmit,
			onDeleteRequest: opts.onDeleteRequest,
			onFetchingChange: opts.onFetchingChange,
			noListAllOnEmptyQ: opts.noListAllOnEmptyQ ?? false,
			appendHint: opts.appendHint ?? DEFAULT_APPEND_HINT,
			classGhost: opts.classGhost,
			onResetGhost: opts.onResetGhost,
		};

		if (!currentOpts.enabled || !currentOpts.getOptions) {
			// Cleanup if disabled or no getOptions provided
			destroyGhost();
			return;
		}

		// Initialize ItemCollection if needed
		if (!options) {
			options = new ItemCollection<T>([], {
				idPropName: currentOpts.itemIdPropName,
				searchable: { getContent: (item) => renderLabel(item) },
				allowNextPrevCycle: true,
				sortFn: (a, b) => {
					const _a = renderLabel(a).toLowerCase();
					const _b = renderLabel(b).toLowerCase();
					return _a.localeCompare(_b);
				},
			});
		}

		// Create ghost input
		createGhost();

		// Provide reset function via callback
		currentOpts.onResetGhost?.(() => {
			// Cancel any pending search
			if (debounceTimer) {
				clearTimeout(debounceTimer);
				debounceTimer = null;
			}
			options?.clear();
			updateGhost();
		});

		// Add event listeners
		el.addEventListener("keydown", onKeyDown);
		el.addEventListener("input", onInput);
		el.addEventListener("blur", onBlur);

		// Set autocomplete off
		el.setAttribute("autocomplete", "off");

		return () => {
			// Cleanup
			el.removeEventListener("keydown", onKeyDown);
			el.removeEventListener("input", onInput);
			el.removeEventListener("blur", onBlur);

			destroyGhost();

			if (debounceTimer) clearTimeout(debounceTimer);
		};
	});
}
