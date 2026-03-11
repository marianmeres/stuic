<script lang="ts">
	import { Tree } from "$lib/index.js";
	import type { TreeNodeDTO, TreeMoveEvent } from "$lib/index.js";
	import { iconLucideFolder } from "@marianmeres/icons-fns/lucide/iconLucideFolder.js";
	import { iconLucideFolderOpen } from "@marianmeres/icons-fns/lucide/iconLucideFolderOpen.js";
	import { iconBsFileEarmark } from "@marianmeres/icons-fns/bootstrap/iconBsFileEarmark.js";

	// Example 1: Simple string tree
	const categories: TreeNodeDTO<string>[] = [
		{
			id: "electronics",
			value: "Electronics",
			children: [
				{
					id: "phones",
					value: "Phones",
					children: [
						{ id: "iphone", value: "iPhone", children: [] },
						{ id: "android", value: "Android", children: [] },
					],
				},
				{
					id: "laptops",
					value: "Laptops",
					children: [
						{ id: "macbook", value: "MacBook", children: [] },
						{ id: "thinkpad", value: "ThinkPad", children: [] },
					],
				},
				{ id: "tablets", value: "Tablets", children: [] },
			],
		},
		{
			id: "clothing",
			value: "Clothing",
			children: [
				{ id: "shirts", value: "Shirts", children: [] },
				{ id: "pants", value: "Pants", children: [] },
			],
		},
		{ id: "books", value: "Books", children: [] },
	];

	// Example 2: File tree with typed value
	interface FileInfo {
		name: string;
		type: "file" | "folder";
	}

	const files: TreeNodeDTO<FileInfo>[] = [
		{
			id: "src",
			value: { name: "src", type: "folder" },
			children: [
				{
					id: "src/lib",
					value: { name: "lib", type: "folder" },
					children: [
						{
							id: "src/lib/components",
							value: { name: "components", type: "folder" },
							children: [
								{
									id: "src/lib/components/Tree",
									value: { name: "Tree", type: "folder" },
									children: [
										{ id: "src/lib/components/Tree/Tree.svelte", value: { name: "Tree.svelte", type: "file" }, children: [] },
										{ id: "src/lib/components/Tree/index.css", value: { name: "index.css", type: "file" }, children: [] },
										{ id: "src/lib/components/Tree/index.ts", value: { name: "index.ts", type: "file" }, children: [] },
									],
								},
							],
						},
						{ id: "src/lib/index.ts", value: { name: "index.ts", type: "file" }, children: [] },
						{ id: "src/lib/index.css", value: { name: "index.css", type: "file" }, children: [] },
					],
				},
				{ id: "src/app.html", value: { name: "app.html", type: "file" }, children: [] },
			],
		},
		{ id: "package.json", value: { name: "package.json", type: "file" }, children: [] },
		{ id: "README.md", value: { name: "README.md", type: "file" }, children: [] },
	];

	let activeCategory = $state<string>("");
	let activeFile = $state<string>("");
	let lastSelected = $state<string>("");

	// Example 3: Drag and drop
	let dndItems = $state<TreeNodeDTO<string>[]>([
		{
			id: "fruits",
			value: "Fruits",
			children: [
				{ id: "apple", value: "Apple", children: [] },
				{ id: "banana", value: "Banana", children: [] },
				{ id: "cherry", value: "Cherry", children: [] },
			],
		},
		{
			id: "vegetables",
			value: "Vegetables",
			children: [
				{ id: "carrot", value: "Carrot", children: [] },
				{ id: "broccoli", value: "Broccoli", children: [] },
			],
		},
		{ id: "bread", value: "Bread", children: [] },
	]);
	let dndLog = $state<string>("");

	// Deep clone helper
	function cloneItems<V>(items: TreeNodeDTO<V>[]): TreeNodeDTO<V>[] {
		return items.map((item) => ({
			...item,
			children: cloneItems(item.children),
		}));
	}

	// Remove a node by id from the tree, returns the removed node or null
	function removeNode<V>(
		items: TreeNodeDTO<V>[],
		id: string
	): TreeNodeDTO<V> | null {
		for (let i = 0; i < items.length; i++) {
			if (items[i].id === id) {
				return items.splice(i, 1)[0];
			}
			const found = removeNode(items[i].children, id);
			if (found) return found;
		}
		return null;
	}

	// Find the parent array and index for a given node id
	function findParentArray<V>(
		items: TreeNodeDTO<V>[],
		id: string
	): { arr: TreeNodeDTO<V>[]; index: number } | null {
		for (let i = 0; i < items.length; i++) {
			if (items[i].id === id) return { arr: items, index: i };
			const found = findParentArray(items[i].children, id);
			if (found) return found;
		}
		return null;
	}

	function findNode<V>(items: TreeNodeDTO<V>[], id: string): TreeNodeDTO<V> | null {
		for (const item of items) {
			if (item.id === id) return item;
			const found = findNode(item.children, id);
			if (found) return found;
		}
		return null;
	}

	// Check if a node is a top-level item (not nested inside a group)
	function isTopLevel(items: TreeNodeDTO<string>[], id: string): boolean {
		return items.some((item) => item.id === id);
	}

	function handleMove(event: TreeMoveEvent<string>): void | false {
		const { source, target, position } = event;

		// Example business rule: "Bread" cannot be moved into a group.
		// This triggers when dropping directly "inside" a group, OR when dropping
		// before/after an item that is already nested inside a group.
		if (source.id === "bread") {
			const wouldNest =
				position === "inside" || !isTopLevel(dndItems, target.id);
			if (wouldNest) {
				throw new Error(
					`"${source.value}" cannot be placed inside a group`
				);
			}
		}

		const clone = cloneItems(dndItems);
		const node = removeNode(clone, source.id);
		if (!node) return false;

		if (position === "inside") {
			const t = findNode(clone, target.id);
			if (t) t.children.push(node);
		} else {
			const ref = findParentArray(clone, target.id);
			if (ref) {
				const idx = position === "before" ? ref.index : ref.index + 1;
				ref.arr.splice(idx, 0, node);
			}
		}

		dndItems = clone;
		dndLog = `Moved "${source.value}" ${position} "${target.value}"`;
	}

	function handleMoveError(error: unknown) {
		dndLog = `Error: ${error instanceof Error ? error.message : String(error)}`;
	}
</script>

<h1 class="text-2xl font-bold mb-8">Tree</h1>

<div class="space-y-12 max-w-md">
	<!-- Basic categories -->
	<section>
		<h2 class="text-lg font-semibold mb-2">Categories (string values)</h2>
		<p class="text-sm opacity-60 mb-4">
			Simple tree with string values. Click to select, click branches to expand/collapse.
		</p>
		<div class="p-4 bg-neutral-100 dark:bg-neutral-800 rounded">
			<Tree
				items={categories}
				activeId={activeCategory}
				onSelect={(item) => {
					activeCategory = item.id;
					lastSelected = `Category: ${item.value}`;
				}}
				defaultExpanded
			/>
		</div>
		{#if lastSelected}
			<p class="text-sm mt-2 opacity-70">Last selected: {lastSelected}</p>
		{/if}
	</section>

	<!-- File tree with custom rendering -->
	<section>
		<h2 class="text-lg font-semibold mb-2">File tree (custom icons)</h2>
		<p class="text-sm opacity-60 mb-4">
			Uses <code>renderItem</code> and <code>renderIcon</code> snippets for file-specific display.
		</p>
		<div class="p-4 bg-neutral-100 dark:bg-neutral-800 rounded">
			<Tree
				items={files}
				activeId={activeFile}
				onSelect={(item) => (activeFile = item.id)}
			>
				{#snippet renderItem(item)}
					{item.value.name}
				{/snippet}

				{#snippet renderIcon(item, _depth, isExpanded)}
					{#if item.children.length > 0}
						{@html isExpanded ? iconLucideFolderOpen({ size: 15 }) : iconLucideFolder({ size: 15 })}
					{:else}
						{@html iconBsFileEarmark({ size: 14 })}
					{/if}
				{/snippet}
			</Tree>
		</div>
	</section>

	<!-- Drag and drop -->
	<section>
		<h2 class="text-lg font-semibold mb-2">Drag and drop</h2>
		<p class="text-sm opacity-60 mb-4">
			Drag items to reorder. Business rule: "Bread" cannot be placed <em>inside</em>
			a group (throws error).
		</p>
		<div class="p-4 bg-neutral-100 dark:bg-neutral-800 rounded">
			<Tree
				items={dndItems}
				draggable
				defaultExpanded
				onMove={handleMove}
				onError={handleMoveError}
			/>
		</div>
		{#if dndLog}
			<p class="text-sm mt-2 opacity-70">{dndLog}</p>
		{/if}
	</section>

	<!-- Unstyled -->
	<section>
		<h2 class="text-lg font-semibold mb-2">Unstyled</h2>
		<p class="text-sm opacity-60 mb-4">
			With <code>unstyled</code> prop - no default styles applied.
		</p>
		<div class="p-4 bg-neutral-100 dark:bg-neutral-800 rounded">
			<Tree items={categories} unstyled defaultExpanded />
		</div>
	</section>
</div>
