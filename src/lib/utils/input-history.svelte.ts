import { localStorageState } from "./persistent-state.svelte.js";

/**
 * Configuration options for InputHistory
 */
export interface InputHistoryOptions {
	/** Composite key parts for namespacing (e.g., [projectId, domain, entity, type]) */
	keyParts: string[];
	/** Maximum number of entries to store (default: 10) */
	maxEntries?: number;
	/** App ID prefix for the storage key (default: "app") */
	appId?: string;
	/** Feature name for the key (default: "input-history") */
	featureName?: string;
}

/**
 * A reactive input history manager with localStorage persistence and arrow key navigation.
 *
 * @example
 * ```ts
 * const history = new InputHistory({
 *   keyParts: [projectId, domain, entity, type],
 *   appId: "joy",
 *   featureName: "filter-history"
 * });
 *
 * // Add entry on submit
 * history.add(query);
 *
 * // Navigate with arrow keys
 * history.navigateUp();    // Go to older entry
 * history.navigateDown();  // Go to newer entry
 *
 * // Get current entry for display
 * const current = history.getCurrent();
 *
 * // Reset navigation when user starts typing
 * history.reset();
 * ```
 */
export class InputHistory {
	/** Storage key for this history instance */
	readonly key: string;

	/** Maximum entries to store */
	readonly maxEntries: number;

	/** Persistent state for stored history entries */
	#storage: ReturnType<typeof localStorageState<string[]>>;

	/** Current navigation index (-1 means "not navigating", 0 is newest, length-1 is oldest) */
	#navigationIndex = $state(-1);

	/** Temporary value holder for current input before navigation started */
	#tempValue = $state<string>("");

	constructor(options: InputHistoryOptions) {
		const {
			keyParts,
			maxEntries = 10,
			appId = "app",
			featureName = "input-history",
		} = options;

		this.maxEntries = maxEntries;

		// Build composite key: "joy:input-history:projectId:domain:entity:type"
		this.key = [appId, featureName, ...keyParts].filter(Boolean).join(":");

		// Initialize persistent storage
		this.#storage = localStorageState<string[]>(this.key, []);

		// Register this instance for cleanup
		InputHistory.#register(this.key);
	}

	// ─────────────────────────────────────────────────────────────
	// Public API
	// ─────────────────────────────────────────────────────────────

	/** Get the stored history entries (newest first) */
	get entries(): string[] {
		return this.#storage.current;
	}

	/** Get current navigation index (-1 when not navigating) */
	get navigationIndex(): number {
		return this.#navigationIndex;
	}

	/** Check if currently navigating through history */
	get isNavigating(): boolean {
		return this.#navigationIndex >= 0;
	}

	/**
	 * Add a new query to history (called on Enter/submit).
	 * Deduplicates and limits to maxEntries.
	 */
	add(query: string): void {
		query = query.trim();
		if (!query) return;

		const current = [...this.#storage.current];

		// Remove duplicates (case-sensitive)
		const filtered = current.filter((item) => item !== query);

		// Add to beginning (newest first)
		filtered.unshift(query);

		// Limit to maxEntries
		this.#storage.current = filtered.slice(0, this.maxEntries);

		// Reset navigation after adding
		this.reset();
	}

	/**
	 * Navigate up (to older entries).
	 * On first call, saves current input value.
	 * @param currentValue - The current input value (saved on first navigation)
	 */
	navigateUp(currentValue?: string): string | null {
		const entries = this.entries;
		if (entries.length === 0) return null;

		// If not navigating yet, save current value and start
		if (this.#navigationIndex < 0) {
			this.#tempValue = currentValue ?? "";
			this.#navigationIndex = 0;
		} else if (this.#navigationIndex < entries.length - 1) {
			// Move to older entry
			this.#navigationIndex++;
		}
		// At oldest entry, stay there

		return this.getCurrent();
	}

	/**
	 * Navigate down (to newer entries).
	 * When reaching past newest, returns to temp value.
	 */
	navigateDown(): string | null {
		if (this.#navigationIndex < 0) return null;

		if (this.#navigationIndex > 0) {
			// Move to newer entry
			this.#navigationIndex--;
			return this.getCurrent();
		} else {
			// At newest entry, go back to temp value
			const temp = this.#tempValue;
			this.reset();
			return temp;
		}
	}

	/**
	 * Get the current history entry based on navigation index.
	 * Returns null if not navigating.
	 */
	getCurrent(): string | null {
		if (this.#navigationIndex < 0) return null;
		return this.entries[this.#navigationIndex] ?? null;
	}

	/**
	 * Reset navigation state (call when user starts typing).
	 */
	reset(): void {
		this.#navigationIndex = -1;
		this.#tempValue = "";
	}

	/**
	 * Clear all history for this key.
	 */
	clear(): void {
		this.#storage.current = [];
		this.reset();
	}

	// ─────────────────────────────────────────────────────────────
	// Static cleanup registration
	// ─────────────────────────────────────────────────────────────

	/** Registry of all history keys (for cleanup on logout) */
	static #registeredKeys = new Set<string>();

	/** Register a key for potential cleanup */
	static #register(key: string): void {
		InputHistory.#registeredKeys.add(key);
	}

	/**
	 * Clear all histories matching a pattern prefix.
	 * Call this on logout to clean up user data.
	 *
	 * @param pattern - Key prefix to match (e.g., "joy:input-history")
	 *
	 * @example
	 * ```ts
	 * // On logout, clear all input histories
	 * InputHistory.clearAllMatching("joy:input-history");
	 * ```
	 */
	static clearAllMatching(pattern: string): void {
		// Clear from our registry
		for (const key of InputHistory.#registeredKeys) {
			if (key.startsWith(pattern)) {
				localStorage.removeItem(key);
				InputHistory.#registeredKeys.delete(key);
			}
		}

		// Also scan localStorage for any keys we might have missed
		// (e.g., from previous sessions)
		for (let i = localStorage.length - 1; i >= 0; i--) {
			const key = localStorage.key(i);
			if (key?.startsWith(pattern)) {
				localStorage.removeItem(key);
			}
		}
	}

	/**
	 * Clear all registered histories (nuclear option).
	 */
	static clearAll(): void {
		for (const key of InputHistory.#registeredKeys) {
			localStorage.removeItem(key);
		}
		InputHistory.#registeredKeys.clear();
	}

	/**
	 * Get all registered history keys (for debugging).
	 */
	static getRegisteredKeys(): string[] {
		return [...InputHistory.#registeredKeys];
	}
}
