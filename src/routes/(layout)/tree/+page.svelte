<script lang="ts">
	import { Tree } from "$lib/index.js";
	import type { TreeNodeDTO } from "@marianmeres/tree";
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
