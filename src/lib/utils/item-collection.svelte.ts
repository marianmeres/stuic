export interface ItemCollectionOptions {
	multiple: boolean;
	allowCycle: boolean;
	unique: boolean;
}

/**
 * Abstraction over collection of T items
 */
export class ItemCollection<T> {
	/** Internal set of options */
	#items: T[] = $state([]);

	/** Current active index (whatever that may mean for the consumer). */
	#index: number = $state(0);

	/** Will set index back to first if end was reached (or vice-versa). */
	#allowCycle: boolean = true;

	/** List of one or more (if multiple allowed) selected indexes */
	#selected: Set<number> = $state(new Set());

	/** Allow multiple selected items? */
	#multiple: boolean = false;

	/** Disallow duplicates in collection? */
	#unique?: boolean = true;

	constructor(
		initial: T[] = [],
		initialIndex = 0,
		options: Partial<ItemCollectionOptions> = {}
	) {
		this.configure(options);

		this.#items = this.#unique ? [...new Set(initial)] : initial;

		if (initialIndex >= 0 && initialIndex < this.#items.length) {
			this.#index = initialIndex;
		}
	}

	/** Will set options */
	configure(options: Partial<ItemCollectionOptions> = {}) {
		if (options.multiple !== undefined) {
			this.#multiple = Boolean(options.multiple);
		}
		if (options.allowCycle !== undefined) {
			this.#allowCycle = Boolean(options.allowCycle);
		}
		if (options.unique !== undefined) {
			this.#unique = Boolean(options.unique);
		}
	}

	[Symbol.iterator]() {
		return this.#items.values();
	}

	dump() {
		return [...this.#items];
	}

	get length() {
		return this.#items.length;
	}

	get current() {
		return this.#items[this.#index];
	}

	at(index: number) {
		return this.#items.at(index);
	}

	findIndex(item: T) {
		return this.#items.indexOf(item);
	}

	findIndexBy(prop: any, value: any) {
		return this.#items.findIndex((item: any) => item?.[prop] === value);
	}

	add(item: T) {
		if (this.#unique) {
			const exists = this.#items.indexOf(item) !== -1;
			if (exists) return false;
		}
		this.#items.push(item);
		return true;
	}

	remove(item: T) {
		const indexOf = this.#items.indexOf(item);
		if (indexOf !== -1) {
			this.#items.splice(indexOf, 1);
			this.#index = 0;
			return true;
		}
		return false;
	}

	/** Will move the current index to next */
	next() {
		let next = this.#index + 1;
		if (next >= this.#items.length) {
			next = this.#allowCycle ? 0 : this.#index;
		}
		this.#index = next;
		return this;
	}

	/** Will move the current index to previous */
	previous() {
		let prev = this.#index - 1;
		if (prev < 0) {
			prev = this.#allowCycle ? this.#items.length - 1 : 0;
		}
		this.#index = prev;
		return this;
	}

	/** Will mark the index as selected (respecting internal state), or
	 * will select all/none if the index is boolean */
	select(index: number | boolean | T) {
		if (typeof index === "boolean") {
			this.#selected = new Set(index ? [...Array(this.#items.length).keys()] : []);
			return this;
		}

		if (typeof index !== "number") {
			index = this.#items.indexOf(index);
		}

		if (this.#items[index] === undefined) return this;

		if (this.#multiple) {
			this.#selected.add(index);
		} else {
			this.#selected = new Set([index]);
		}

		return this;
	}

	/** Will toggle selection for the given index */
	toggleSelect(index: number | T) {
		if (typeof index !== "number") {
			index = this.#items.indexOf(index);
		}

		if (this.#items[index] === undefined) return false;

		if (this.#selected.has(index)) {
			this.#selected.delete(index);
		} else {
			this.select(index);
		}

		return true;
	}

	/** Will toggle all currently selected */
	toggleSelection() {
		this.#selected = this.#items.reduce((m, item, idx) => {
			if (!this.#selected.has(idx)) {
				m.add(idx);
			}
			return m;
		}, new Set<number>([]));
		return this;
	}

	/** Checks whether given index is selected */
	isSelected(index: number | T) {
		if (typeof index !== "number") {
			index = this.#items.indexOf(index);
		}
		if (this.#items[index] === undefined) return false;
		return this.#selected.has(index);
	}

	/** Returns clone of currently selected indexes */
	get selection() {
		return [...this.#selected];
	}
}
