<script lang="ts">
	import {
		DropdownMenu,
		type DropdownMenuItem,
		type DropdownMenuPosition,
	} from "$lib/components/DropdownMenu/index.js";
	import { iconLucideCopy } from "@marianmeres/icons-fns/lucide/iconLucideCopy.js";
	import { iconLucidePencil } from "@marianmeres/icons-fns/lucide/iconLucidePencil.js";
	import { iconLucideTrash2 } from "@marianmeres/icons-fns/lucide/iconLucideTrash2.js";
	import { iconLucideSettings } from "@marianmeres/icons-fns/lucide/iconLucideSettings.js";
	import { iconLucideUser } from "@marianmeres/icons-fns/lucide/iconLucideUser.js";
	import { iconLucideFolder } from "@marianmeres/icons-fns/lucide/iconLucideFolder.js";
	import { iconLucideFile } from "@marianmeres/icons-fns/lucide/iconLucideFile.js";
	import { iconLucideDownload } from "@marianmeres/icons-fns/lucide/iconLucideDownload.js";
	import { iconLucideShare } from "@marianmeres/icons-fns/lucide/iconLucideShare.js";

	let lastAction = $state<string | null>(null);

	// Basic menu items
	const basicItems: DropdownMenuItem[] = [
		{
			type: "action",
			id: "edit",
			label: "Edit",
			icon: { html: iconLucidePencil({ size: 16 }) },
		},
		{
			type: "action",
			id: "copy",
			label: "Copy",
			icon: { html: iconLucideCopy({ size: 16 }) },
		},
		{ type: "divider" },
		{
			type: "action",
			id: "delete",
			label: "Delete",
			icon: { html: iconLucideTrash2({ size: 16 }) },
			class: "text-red-600 dark:text-red-400",
		},
	];

	// Menu with headers and shortcuts
	const menuWithHeaders: DropdownMenuItem[] = [
		{ type: "header", label: "File Operations" },
		{
			type: "action",
			id: "new",
			label: "New File",
			shortcut: "Cmd+N",
			icon: { html: iconLucideFile({ size: 16 }) },
		},
		{
			type: "action",
			id: "open",
			label: "Open",
			shortcut: "Cmd+O",
			icon: { html: iconLucideFolder({ size: 16 }) },
		},
		{
			type: "action",
			id: "save",
			label: "Save",
			shortcut: "Cmd+S",
			icon: { html: iconLucideDownload({ size: 16 }) },
		},
		{ type: "divider" },
		{ type: "header", label: "Share" },
		{
			type: "action",
			id: "share",
			label: "Share...",
			icon: { html: iconLucideShare({ size: 16 }) },
		},
	];

	// Menu with expandable sections
	const expandableItems: DropdownMenuItem[] = [
		{
			type: "action",
			id: "profile",
			label: "Profile",
			icon: { html: iconLucideUser({ size: 16 }) },
		},
		{
			type: "expandable",
			id: "settings",
			label: "Settings",
			icon: { html: iconLucideSettings({ size: 16 }) },
			items: [
				{ type: "action", id: "general", label: "General" },
				{ type: "action", id: "privacy", label: "Privacy" },
				{ type: "action", id: "notifications", label: "Notifications" },
			],
		},
		{
			type: "expandable",
			id: "files",
			label: "Recent Files",
			icon: { html: iconLucideFolder({ size: 16 }) },
			defaultExpanded: true,
			items: [
				{ type: "action", id: "file1", label: "document.pdf" },
				{ type: "action", id: "file2", label: "image.png" },
				{ type: "action", id: "file3", label: "notes.txt" },
			],
		},
		{ type: "divider" },
		{ type: "action", id: "logout", label: "Log out" },
	];

	// Menu with custom content
	const customContentItems: DropdownMenuItem[] = [
		{
			type: "custom",
			content: {
				html: `<div class="px-2 py-3 text-center border-b border-dropdown-divider dark:border-dropdown-divider-dark">
					<div class="w-12 h-12 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">JD</div>
					<div class="font-semibold">John Doe</div>
					<div class="text-sm text-dropdown-header dark:text-dropdown-header-dark">john@example.com</div>
				</div>`,
			},
		},
		{ type: "action", id: "profile2", label: "View Profile" },
		{ type: "action", id: "account", label: "Account Settings" },
		{ type: "divider" },
		{ type: "action", id: "signout", label: "Sign Out" },
	];

	// Items with disabled state
	const disabledItems: DropdownMenuItem[] = [
		{ type: "action", id: "available", label: "Available Action" },
		{ type: "action", id: "disabled1", label: "Disabled Action", disabled: true },
		{ type: "divider" },
		{
			type: "expandable",
			id: "disabled-section",
			label: "Disabled Section",
			disabled: true,
			items: [{ type: "action", id: "child", label: "Child Item" }],
		},
	];

	// Long list for scrolling
	const longList: DropdownMenuItem[] = Array.from({ length: 20 }, (_, i) => ({
		type: "action" as const,
		id: `item-${i + 1}`,
		label: `Menu Item ${i + 1}`,
	}));

	function handleSelect(item: any) {
		lastAction = item.label;
	}
</script>

<div class="space-y-8 p-4">
	<h1 class="text-2xl font-bold">DropdownMenu Component</h1>

	<p class="text-sm text-neutral-600 dark:text-neutral-400">
		A flexible dropdown menu component with keyboard navigation, expandable sections, and
		full accessibility support. Uses CSS Anchor Positioning when available.
	</p>

	{#if lastAction}
		<div
			class="p-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm"
		>
			Last action: <strong>{lastAction}</strong>
		</div>
	{/if}

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Basic Menu</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Simple menu with action items, icons, and a divider.
		</p>

		<div class="flex gap-4 flex-wrap">
			<DropdownMenu items={basicItems} onSelect={handleSelect}>Actions</DropdownMenu>
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Menu with Headers & Shortcuts</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Grouped items with section headers and keyboard shortcut hints.
		</p>

		<div class="flex gap-4 flex-wrap">
			<DropdownMenu items={menuWithHeaders} onSelect={handleSelect}
				>File Menu</DropdownMenu
			>
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Expandable Sections</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Menu with collapsible nested sections. Multiple sections can be expanded
			independently.
		</p>

		<div class="flex gap-4 flex-wrap">
			<DropdownMenu items={expandableItems} onSelect={handleSelect}
				>User Menu</DropdownMenu
			>
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Custom Content</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Menu with custom HTML content (like a user profile card).
		</p>

		<div class="flex gap-4 flex-wrap">
			<DropdownMenu
				items={customContentItems}
				onSelect={handleSelect}
				classDropdown="min-w-56"
			>
				Account
			</DropdownMenu>
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Disabled Items</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Menu items and sections can be disabled.
		</p>

		<div class="flex gap-4 flex-wrap">
			<DropdownMenu items={disabledItems} onSelect={handleSelect}
				>With Disabled</DropdownMenu
			>
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Positions</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Different positioning options. CSS Anchor Positioning provides automatic flipping
			when needed.
		</p>

		<div class="flex gap-3 flex-wrap items-center justify-center py-16">
			{#each ["top", "top-left", "top-right", "top-span-left", "top-span-right", "bottom", "bottom-left", "bottom-right", "bottom-span-left", "bottom-span-right", "left", "right"] as pos (pos)}
				{@const position = pos as DropdownMenuPosition}
				<DropdownMenu
					items={basicItems}
					{position}
					onSelect={handleSelect}
					classTrigger="px-3 py-1 bg-neutral-200 dark:bg-neutral-700 rounded text-sm"
				>
					{pos}
				</DropdownMenu>
			{/each}
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Scrollable Content</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Long menus scroll within a configurable max-height (default: 300px).
		</p>

		<div class="flex gap-4 flex-wrap items-start">
			<DropdownMenu items={longList} onSelect={handleSelect}
				>Long List (default)</DropdownMenu
			>

			<DropdownMenu items={longList} maxHeight="150px" onSelect={handleSelect}>
				Max Height 150px
			</DropdownMenu>
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Custom Trigger</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Use the trigger snippet to provide a custom trigger with full control over the
			button.
		</p>

		<div class="flex gap-4 flex-wrap">
			<DropdownMenu items={basicItems} onSelect={handleSelect}>
				{#snippet trigger({ isOpen, toggle, triggerProps })}
					<button
						class="px-4 py-2 bg-purple-500 text-white rounded-lg flex items-center gap-2 hover:bg-purple-600"
						onclick={toggle}
						{...triggerProps}
					>
						{@html iconLucideSettings({ size: 16 })}
						<span>{isOpen ? "Close" : "Open"} Settings</span>
					</button>
				{/snippet}
			</DropdownMenu>
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Keep Open on Select</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Menu stays open after selecting an item when closeOnSelect is false.
		</p>

		<div class="flex gap-4 flex-wrap">
			<DropdownMenu items={basicItems} closeOnSelect={false} onSelect={handleSelect}>
				Multi-Select Mode
			</DropdownMenu>
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Custom Styling</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Override styles using class props for the trigger, dropdown, and items.
		</p>

		<div class="flex gap-4 flex-wrap">
			<DropdownMenu
				items={basicItems}
				onSelect={handleSelect}
				classTrigger="bg-blue-500 text-white hover:bg-blue-600 border-blue-600"
				classDropdown="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
				classItem="hover:bg-blue-100 dark:hover:bg-blue-900"
			>
				Blue Theme
			</DropdownMenu>

			<DropdownMenu
				items={basicItems}
				onSelect={handleSelect}
				classTrigger="rounded-full px-4"
				classDropdown="rounded-xl shadow-xl"
				classItem="rounded-lg"
			>
				Rounded Style
			</DropdownMenu>
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Keyboard Navigation</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">Full keyboard support:</p>
		<ul
			class="text-sm text-neutral-600 dark:text-neutral-400 list-disc list-inside space-y-1"
		>
			<li>
				<kbd class="px-1 bg-neutral-200 dark:bg-neutral-700 rounded">Arrow Up/Down</kbd> - Navigate
				items
			</li>
			<li>
				<kbd class="px-1 bg-neutral-200 dark:bg-neutral-700 rounded">Arrow Right/Left</kbd
				> - Expand/collapse expandable sections
			</li>
			<li>
				<kbd class="px-1 bg-neutral-200 dark:bg-neutral-700 rounded">Home/End</kbd> - Jump to
				first/last item
			</li>
			<li>
				<kbd class="px-1 bg-neutral-200 dark:bg-neutral-700 rounded">Enter/Space</kbd> - Select
				item or toggle expandable
			</li>
			<li>
				<kbd class="px-1 bg-neutral-200 dark:bg-neutral-700 rounded">Escape</kbd> - Close menu
			</li>
			<li>
				<kbd class="px-1 bg-neutral-200 dark:bg-neutral-700 rounded">Tab</kbd> - Close menu
				and continue navigation
			</li>
		</ul>

		<div class="flex gap-4 flex-wrap">
			<DropdownMenu items={expandableItems} onSelect={handleSelect}>
				Try Keyboard Navigation
			</DropdownMenu>
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Force Fallback Mode</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Test the absolute positioning fallback mode (used when CSS Anchor Positioning is not
			supported).
		</p>

		<div class="flex gap-4 flex-wrap">
			<DropdownMenu items={basicItems} forceFallback onSelect={handleSelect}>
				Fallback Mode
			</DropdownMenu>

			<DropdownMenu
				items={basicItems}
				forceFallback
				position="top"
				onSelect={handleSelect}
			>
				Fallback Top
			</DropdownMenu>

			<DropdownMenu
				items={basicItems}
				forceFallback
				position="right"
				onSelect={handleSelect}
			>
				Fallback Right
			</DropdownMenu>

			<DropdownMenu
				items={basicItems}
				forceFallback
				position="left"
				onSelect={handleSelect}
			>
				Fallback Left
			</DropdownMenu>
		</div>
	</section>
</div>
