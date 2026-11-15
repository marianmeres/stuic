<script lang="ts">
	import {
		Nav,
		type NavItem,
		type NavGroup,
		type NavGroupEntry,
		type NavItemEntry,
	} from "#lib/components/Nav/index.js";
	import { iconLucideFile } from "@marianmeres/icons-fns/lucide/iconLucideFile.js";
	import { iconLucideFolder } from "@marianmeres/icons-fns/lucide/iconLucideFolder.js";
	import { iconLucideImage } from "@marianmeres/icons-fns/lucide/iconLucideImage.js";
	import { iconLucideSettings } from "@marianmeres/icons-fns/lucide/iconLucideSettings.js";
	import { iconLucideUser } from "@marianmeres/icons-fns/lucide/iconLucideUser.js";
	import { iconLucideShoppingCart } from "@marianmeres/icons-fns/lucide/iconLucideShoppingCart.js";
	import { iconLucideTag } from "@marianmeres/icons-fns/lucide/iconLucideTag.js";
	import { iconLucideDatabase } from "@marianmeres/icons-fns/lucide/iconLucideDatabase.js";
	import { iconLucideDownload } from "@marianmeres/icons-fns/lucide/iconLucideDownload.js";
	import { iconLucideShare } from "@marianmeres/icons-fns/lucide/iconLucideShare.js";
	import { iconLucidePencil } from "@marianmeres/icons-fns/lucide/iconLucidePencil.js";
	import { iconLucideHouse } from "@marianmeres/icons-fns/lucide/iconLucideHouse.js";
	import { iconLucideCircleHelp } from "@marianmeres/icons-fns/lucide/iconLucideCircleHelp.js";
	import { iconLucideInbox } from "@marianmeres/icons-fns/lucide/iconLucideInbox.js";
	import { iconLucideLayers } from "@marianmeres/icons-fns/lucide/iconLucideLayers.js";
	import { iconLucideBoxes } from "@marianmeres/icons-fns/lucide/iconLucideBoxes.js";
	import { iconLucidePackage } from "@marianmeres/icons-fns/lucide/iconLucidePackage.js";
	import { iconLucideReceipt } from "@marianmeres/icons-fns/lucide/iconLucideReceipt.js";
	import { iconLucideUpload } from "@marianmeres/icons-fns/lucide/iconLucideUpload.js";
	import { iconLucideTrash2 } from "@marianmeres/icons-fns/lucide/iconLucideTrash2.js";
	import { iconLucideHistory } from "@marianmeres/icons-fns/lucide/iconLucideHistory.js";
	import { iconLucideUndo2 } from "@marianmeres/icons-fns/lucide/iconLucideUndo2.js";
	import { iconLucideUsers } from "@marianmeres/icons-fns/lucide/iconLucideUsers.js";
	import { iconLucideChartColumn } from "@marianmeres/icons-fns/lucide/iconLucideChartColumn.js";

	let lastAction = $state<string | null>(null);
	let activeId = $state<string>("products-inventory");

	// Sidebar collapsed state demo
	let isCollapsed = $state(false);
	let isExpanding = $state(false);

	// Touch-friendly collapsed state demo
	let touchIsCollapsed = $state(false);
	let touchIsExpanding = $state(false);

	// Basic navigation group
	const contentGroup: NavGroup = {
		title: "Content",
		// defaultExpanded: true,
		items: [
			{
				id: "pages",
				label: "Pages",
				href: "#/pages",
				icon: { html: iconLucideFile({}) },
			},
			{
				id: "media",
				label: "Media Library",
				href: "#/media",
				icon: { html: iconLucideImage({}) },
			},
			{
				id: "files",
				label: "Files",
				href: "#/files",
				icon: { html: iconLucideFolder({}) },
			},
		],
	};

	// Group with nested children (flat after level 1)
	const productsGroup: NavGroup = {
		title: "E-commerce",
		// defaultExpanded: true,
		items: [
			{
				id: "products",
				label: "Products",
				href: "#/products",
				icon: { html: iconLucideTag({}) },
				children: [
					{ id: "products-all", label: "All Products", href: "#/products/all" },
					{
						id: "products-categories",
						label: "Categories",
						href: "#/products/categories",
					},
					{ id: "products-inventory", label: "Inventory", href: "#/products/inventory" },
				],
			},
			{
				id: "orders",
				label: "Orders",
				href: "#/orders",
				icon: { html: iconLucideShoppingCart({}) },
			},
			{
				id: "customers",
				label: "Customers",
				href: "#/customers",
				icon: { html: iconLucideUser({}) },
			},
		],
	};

	// Group with onClick handlers
	const actionsGroup: NavGroup = {
		title: "Quick Actions",
		// defaultExpanded: true,
		items: [
			{
				id: "dashboard",
				label: "Dashboard",
				onClick: () => (lastAction = "Navigated to Dashboard"),
				icon: { html: iconLucideFolder({}) },
			},
			{
				id: "analytics",
				label: "Analytics",
				onClick: () => (lastAction = "Opening Analytics..."),
				icon: { html: iconLucideShare({}) },
			},
			{
				id: "settings",
				label: "Settings",
				onClick: () => (lastAction = "Opening Settings..."),
				icon: { html: iconLucideSettings({}) },
			},
			{
				id: "logout",
				label: "Log Out",
				onClick: () => (lastAction = "Logging out..."),
				icon: { html: iconLucideDownload({}) },
			},
		],
	};

	// Group with disabled items
	const adminGroup: NavGroup = {
		title: "Administration",
		// defaultExpanded: true,
		items: [
			{
				id: "users",
				label: "User Management",
				href: "#/admin/users",
				icon: { html: iconLucideUser({}) },
			},
			{
				id: "database",
				label: "Database (Disabled)",
				href: "#/admin/database",
				icon: { html: iconLucideDatabase({}) },
				disabled: true,
			},
			{
				id: "emails",
				label: "Email Templates",
				href: "#/admin/emails",
				icon: { html: iconLucidePencil({}) },
			},
		],
	};

	// Group with localized labels
	const localizedGroup: NavGroup = {
		title: { en: "Localized", sk: "Lokalizované", de: "Lokalisiert" },
		// defaultExpanded: true,
		items: [
			{
				id: "loc-home",
				label: { en: "Home", sk: "Domov", de: "Startseite" },
				href: "#/home",
				icon: { html: iconLucideFolder({}) },
			},
			{
				id: "loc-settings",
				label: { en: "Settings", sk: "Nastavenia", de: "Einstellungen" },
				href: "#/settings",
				icon: { html: iconLucideSettings({}) },
			},
		],
	};

	let locale = $state("en");

	// Deep nested example (all render flat after level 1)
	const deepNestedGroup: NavGroup = {
		title: "Deep Nesting Demo",
		// defaultExpanded: true,
		items: [
			{
				id: "level1",
				label: "Level 1 Item",
				href: "#/level1",
				icon: { html: iconLucideFolder({}) },
				children: [
					{
						id: "level2a",
						label: "Level 2A",
						href: "#/level2a",
						children: [
							{ id: "level3a", label: "Level 3A", href: "#/level3a" },
							{ id: "level3b", label: "Level 3B", href: "#/level3b" },
						],
					},
					{ id: "level2b", label: "Level 2B", href: "#/level2b" },
				],
			},
		],
	};

	// Expanded by default (demonstrating defaultExpanded: true)
	const expandedGroup: NavGroup = {
		title: "Expanded by Default",
		defaultExpanded: true,
		items: [
			{ id: "visible1", label: "Visible Item 1", href: "#/visible1" },
			{ id: "visible2", label: "Visible Item 2", href: "#/visible2" },
		],
	};

	// Groups WITHOUT items (act as regular nav items, no chevron)
	const homeGroup: NavGroup = {
		id: "home",
		title: "Home",
		href: "#/home",
		icon: { html: iconLucideHouse({}) },
	};

	const helpGroup: NavGroup = {
		id: "help",
		title: "Help & Support",
		onClick: () => (lastAction = "Opening Help..."),
		icon: { html: iconLucideCircleHelp({}) },
	};

	const settingsItemGroup: NavGroup = {
		id: "settings-item",
		title: "Settings",
		href: "#/settings",
		icon: { html: iconLucideSettings({}) },
	};

	// Dividers & headers: a long sidebar sectioned without extra nesting, at every level
	// (among groups, among a group's items, among an item's children).
	let sectionedCollapsed = $state(false);
	let sectionedExpanding = $state(false);
	let restricted = $state(false);

	const sectionedGroups: NavGroupEntry[] = [
		{ id: "ds-home", title: "Home", href: "#/home", icon: { html: iconLucideHouse({}) } },
		{
			id: "ds-inbox",
			title: "Inbox",
			href: "#/inbox",
			icon: { html: iconLucideInbox({}) },
		},
		{ type: "divider" },
		{ type: "header", label: "Workspace" },
		{
			id: "ds-catalog",
			title: "Catalog",
			defaultExpanded: true,
			items: [
				{
					id: "ds-products",
					label: "Products",
					href: "#/products",
					icon: { html: iconLucideTag({}) },
				},
				{
					id: "ds-categories",
					label: "Categories",
					href: "#/categories",
					icon: { html: iconLucideLayers({}) },
				},
				{
					id: "ds-collections",
					label: "Collections",
					href: "#/collections",
					icon: { html: iconLucideBoxes({}) },
				},
				{ type: "divider", line: false },
				{
					id: "ds-inventory",
					label: "Inventory",
					href: "#/inventory",
					icon: { html: iconLucidePackage({}) },
				},
				{
					id: "ds-prices",
					label: "Price lists",
					href: "#/prices",
					icon: { html: iconLucideReceipt({}) },
				},
				{
					id: "ds-io",
					label: "Imports & exports",
					icon: { html: iconLucideUpload({}) },
					children: [
						{ type: "header", label: "Import" },
						{ id: "ds-import-csv", label: "From CSV", href: "#/import/csv" },
						{ id: "ds-import-feed", label: "From a feed", href: "#/import/feed" },
						{ type: "header", label: "Export" },
						{ id: "ds-export-csv", label: "To CSV", href: "#/export/csv" },
						{
							id: "ds-export-market",
							label: "To a marketplace",
							href: "#/export/market",
						},
					],
				},
				{ type: "divider" },
				{ type: "header", label: "Danger zone" },
				{
					id: "ds-bulk-delete",
					label: "Bulk delete",
					href: "#/bulk-delete",
					icon: { html: iconLucideTrash2({}) },
					data: { adminOnly: true },
				},
				{
					id: "ds-audit-log",
					label: "Audit log",
					href: "#/audit-log",
					icon: { html: iconLucideHistory({}) },
					data: { adminOnly: true },
				},
			],
		},
		{
			id: "ds-sales",
			title: "Sales",
			items: [
				{
					id: "ds-orders",
					label: "Orders",
					href: "#/orders",
					icon: { html: iconLucideShoppingCart({}) },
				},
				{
					id: "ds-returns",
					label: "Returns",
					href: "#/returns",
					icon: { html: iconLucideUndo2({}) },
				},
				{
					id: "ds-invoices",
					label: "Invoices",
					href: "#/invoices",
					icon: { html: iconLucideReceipt({}) },
				},
				{ type: "divider" },
				{
					id: "ds-customers",
					label: "Customers",
					href: "#/customers",
					icon: { html: iconLucideUser({}) },
				},
				{
					id: "ds-segments",
					label: "Segments",
					href: "#/segments",
					icon: { html: iconLucideUsers({}) },
				},
				{ type: "divider", line: false },
				{
					id: "ds-reports",
					label: "Reports",
					href: "#/reports",
					icon: { html: iconLucideChartColumn({}) },
				},
			],
		},
		{ type: "divider" },
		{ type: "header", label: "Administration" },
		{
			id: "ds-admin-users",
			title: "Users",
			href: "#/admin/users",
			icon: { html: iconLucideUsers({}) },
		},
		{
			id: "ds-admin-database",
			title: "Database",
			href: "#/admin/database",
			icon: { html: iconLucideDatabase({}) },
		},
		{ type: "divider" },
		{
			id: "ds-help",
			title: "Help & Support",
			href: "#/help",
			icon: { html: iconLucideCircleHelp({}) },
		},
	];

	// What a non-admin sees: the admin-only entries are simply filtered out, leaving the
	// dividers and headers around them for Nav to tidy away.
	const ADMIN_GROUPS = new Set(["ds-admin-users", "ds-admin-database"]);
	const isAdminItem = (e: NavItemEntry) =>
		e.type !== "divider" && e.type !== "header" && !!e.data?.adminOnly;

	let sectionedVisible = $derived<NavGroupEntry[]>(
		restricted
			? sectionedGroups
					.filter(
						(g) =>
							g.type === "divider" || g.type === "header" || !ADMIN_GROUPS.has(g.id ?? "")
					)
					.map((g) =>
						g.type === "divider" || g.type === "header" || !g.items
							? g
							: { ...g, items: g.items.filter((i) => !isAdminItem(i)) }
					)
			: sectionedGroups
	);

	function handleSelect(item: NavItem) {
		lastAction = `Selected item: ${typeof item.label === "string" ? item.label : item.label.en || item.id}`;
		activeId = item.id;
	}

	function handleGroupSelect(group: NavGroup) {
		lastAction = `Selected group: ${typeof group.title === "string" ? group.title : group.title.en || group.id}`;
		if (group.id) {
			activeId = group.id;
		}
	}
</script>

<div class="space-y-8 p-4">
	<h1 class="text-2xl font-bold">Nav Component</h1>

	<p class="text-sm text-neutral-600 dark:text-neutral-400">
		A reusable navigation component for sidebar navigation. Supports multiple groups,
		section titles, collapsed mode, nested items (rendered flat after level 1), groups
		without items (act as regular nav items), dividers and headers at every level, and
		localization.
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
		<h2 class="text-xl font-semibold">Groups Without Items (No Chevron)</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Groups with empty items array act as regular navigation items - clickable without
			expand/collapse chevron.
		</p>

		<div class="w-64 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-2">
			<Nav
				groups={[homeGroup, settingsItemGroup, helpGroup]}
				{activeId}
				onSelect={handleSelect}
				onGroupSelect={handleGroupSelect}
			/>
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Mixed Groups (With and Without Items)</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Combine groups with items (expandable) and groups without items (simple nav items).
		</p>

		<div class="w-64 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-2">
			<Nav
				groups={[homeGroup, contentGroup, productsGroup, helpGroup]}
				{activeId}
				onSelect={handleSelect}
				onGroupSelect={handleGroupSelect}
			/>
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Dividers & Headers</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Separate a long list logically without nesting it. Mix these entries in among
			<code>groups</code>, among a group's <code>items</code>, or among an item's
			<code>children</code>:
		</p>
		<ul
			class="text-sm text-neutral-600 dark:text-neutral-400 list-disc list-inside space-y-1"
		>
			<li><code>{`{ type: "divider" }`}</code> — a subtle line</li>
			<li>
				<code>{`{ type: "divider", line: false }`}</code> — a blank break of the same height
			</li>
			<li>
				<code>{`{ type: "header", label }`}</code> — a non-interactive label for the entries
				after it, up to the next divider or header
			</li>
		</ul>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Below: dividers and headers among the groups ("Workspace", "Administration"), among
			Catalog's and Sales' items (incl. blank breaks), and among the children of "Imports
			& exports". A divider or header left with nothing to separate is not rendered — tick
			"Hide admin-only entries" to filter out the admin items and watch the "Danger zone"
			and "Administration" headers and their dividers go with them. In collapsed mode,
			headers turn into lines.
		</p>

		<div class="flex flex-wrap gap-4 items-center">
			<button
				class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
				onclick={() => {
					if (!sectionedCollapsed) {
						sectionedCollapsed = true;
					} else {
						sectionedExpanding = true;
						sectionedCollapsed = false;
						setTimeout(() => (sectionedExpanding = false), 200);
					}
				}}
			>
				{sectionedCollapsed ? "Expand" : "Collapse"}
			</button>
			<label class="flex items-center gap-2 text-sm">
				<input type="checkbox" bind:checked={restricted} />
				Hide admin-only entries
			</label>
		</div>

		<div
			class="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-2 transition-all duration-200"
			style:width={sectionedCollapsed ? "4rem" : "16rem"}
		>
			<Nav
				groups={sectionedVisible}
				storageKeyPrefix="stuic-nav-sectioned-demo"
				{activeId}
				isCollapsed={sectionedCollapsed}
				isExpanding={sectionedExpanding}
				onSelect={handleSelect}
				onGroupSelect={handleGroupSelect}
			/>
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Section Title</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Optional section title rendered above the groups (uppercase, non-interactive).
		</p>

		<div class="w-64 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-2">
			<Nav title="Main" groups={[contentGroup]} {activeId} onSelect={handleSelect} />
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Collapsible Section Title (opt-in)</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Pass <code>collapsibleTitle</code> to make the section title clickable. Clicking it toggles
			all groups beneath it; the state is persisted via localStorage.
		</p>

		<div class="w-64 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-2">
			<Nav
				title="Main"
				groups={[contentGroup, productsGroup]}
				collapsibleTitle
				storageKeyPrefix="stuic-nav-collapsible-title-demo"
				{activeId}
				onSelect={handleSelect}
			/>
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Multiple Groups</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			A single Nav component can render multiple groups.
		</p>

		<div class="w-64 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-2">
			<Nav
				groups={[contentGroup, productsGroup, actionsGroup]}
				{activeId}
				onSelect={handleSelect}
			/>
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Nested Items (Flat After Level 1)</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Children are rendered at the same indent level as their parents. Click "Products" to
			see its children.
		</p>

		<div class="w-64 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-2">
			<Nav groups={[productsGroup]} {activeId} onSelect={handleSelect} />
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">onClick Handlers</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Items can use onClick callbacks instead of href links.
		</p>

		<div class="w-64 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-2">
			<Nav groups={[actionsGroup]} {activeId} onSelect={handleSelect} />
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Disabled Items</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Individual items can be disabled.
		</p>

		<div class="w-64 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-2">
			<Nav groups={[adminGroup]} {activeId} onSelect={handleSelect} />
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Collapsed Sidebar Mode</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Toggle between expanded and collapsed (icon-only) mode. Hover for tooltips in
			collapsed mode.
		</p>

		<div class="flex gap-4 items-start">
			<button
				class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
				onclick={() => {
					if (!isCollapsed) {
						isCollapsed = true;
					} else {
						isExpanding = true;
						isCollapsed = false;
						setTimeout(() => (isExpanding = false), 200);
					}
				}}
			>
				{isCollapsed ? "Expand" : "Collapse"}
			</button>

			<div
				class="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-2 transition-all duration-200"
				style:width={isCollapsed ? "4rem" : "16rem"}
			>
				<Nav
					title="Collapsible"
					groups={[homeGroup, contentGroup, productsGroup, deepNestedGroup, helpGroup]}
					{activeId}
					{isCollapsed}
					{isExpanding}
					onSelect={handleSelect}
					onGroupSelect={handleGroupSelect}
				/>
			</div>
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Localization Support</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Labels can be localized objects with language keys.
		</p>

		<div class="flex gap-2 mb-4">
			{#each ["en", "sk", "de"] as lang}
				<button
					class="px-3 py-1 rounded text-sm"
					class:bg-blue-500={locale === lang}
					class:text-white={locale === lang}
					class:bg-neutral-200={locale !== lang}
					class:dark:bg-neutral-700={locale !== lang}
					onclick={() => (locale = lang)}
				>
					{lang.toUpperCase()}
				</button>
			{/each}
		</div>

		<div class="w-64 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-2">
			<Nav groups={[localizedGroup]} {locale} {activeId} onSelect={handleSelect} />
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Deep Nesting</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Even deeply nested items render at the same indent level (flat after level 1).
		</p>

		<div class="w-64 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-2">
			<Nav groups={[deepNestedGroup]} {activeId} onSelect={handleSelect} />
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Expanded by Default</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Groups are collapsed by default. Use defaultExpanded: true to start expanded.
		</p>

		<div class="w-64 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-2">
			<Nav groups={[expandedGroup]} {activeId} onSelect={handleSelect} />
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Touch-Friendly Mode</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Larger touch targets for mobile devices.
		</p>

		<div class="flex gap-4 items-start">
			<button
				class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
				onclick={() => {
					if (!touchIsCollapsed) {
						touchIsCollapsed = true;
					} else {
						touchIsExpanding = true;
						touchIsCollapsed = false;
						setTimeout(() => (touchIsExpanding = false), 200);
					}
				}}
			>
				{touchIsCollapsed ? "Expand" : "Collapse"}
			</button>

			<div
				class="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-2 transition-all duration-200"
				style:width={touchIsCollapsed ? "4rem" : "16rem"}
			>
				<Nav
					groups={[contentGroup]}
					{activeId}
					touchFriendly={true}
					isCollapsed={touchIsCollapsed}
					isExpanding={touchIsExpanding}
					onSelect={handleSelect}
				/>
			</div>
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Custom isActive Callback</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Use isActive callback for custom active state logic (e.g., URL matching).
		</p>

		<div class="w-64 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-2">
			<Nav
				groups={[contentGroup]}
				isActive={(item) => item.id === "media"}
				onSelect={handleSelect}
			/>
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Keyboard Navigation</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Uses browser-native keyboard navigation:
		</p>
		<ul
			class="text-sm text-neutral-600 dark:text-neutral-400 list-disc list-inside space-y-1"
		>
			<li>
				<kbd class="px-1 bg-neutral-200 dark:bg-neutral-700 rounded">Tab</kbd> - Navigate between
				items
			</li>
			<li>
				<kbd class="px-1 bg-neutral-200 dark:bg-neutral-700 rounded">Enter/Space</kbd> - Select
				focused item
			</li>
		</ul>
	</section>
</div>
