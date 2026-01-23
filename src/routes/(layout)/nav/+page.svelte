<script lang="ts">
	import { Nav, type NavItem, type NavGroup } from "$lib/components/Nav/index.js";
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

	let lastAction = $state<string | null>(null);
	let activeId = $state<string>("pages");

	// Sidebar collapsed state demo
	let isCollapsed = $state(false);
	let isExpanding = $state(false);

	// Basic navigation group
	const contentGroup: NavGroup = {
		title: "Content",
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

	// Collapsed by default
	const collapsedGroup: NavGroup = {
		title: "Collapsed by Default",
		defaultCollapsed: true,
		items: [
			{ id: "hidden1", label: "Hidden Item 1", href: "#/hidden1" },
			{ id: "hidden2", label: "Hidden Item 2", href: "#/hidden2" },
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
		without items (act as regular nav items), and localization.
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
					groups={[homeGroup, contentGroup, helpGroup]}
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
		<h2 class="text-xl font-semibold">Collapsed by Default</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Groups can start collapsed using defaultCollapsed.
		</p>

		<div class="w-64 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-2">
			<Nav groups={[collapsedGroup]} {activeId} onSelect={handleSelect} />
		</div>
	</section>

	<hr class="my-4" />

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Touch-Friendly Mode</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Larger touch targets for mobile devices.
		</p>

		<div class="w-64 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-2">
			<Nav
				groups={[contentGroup]}
				{activeId}
				touchFriendly={true}
				onSelect={handleSelect}
			/>
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
