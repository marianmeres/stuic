<script lang="ts">
	import {
		Header,
		type HeaderNavItem,
		type HeaderLocaleItem,
		type HeaderActionItem,
		Avatar,
		Drawer,
		Button,
	} from "$lib/index.js";
	import {
		iconSettings,
		iconSearch,
		iconArrowLeft,
		iconMenu,
		iconUser,
	} from "$lib/icons/index.js";

	const locales: HeaderLocaleItem[] = [
		{ id: "en", label: "EN" },
		{ id: "sk", label: "SK" },
		{ id: "cs", label: "CS" },
	];

	let activeLocale = $state("en");
	let drawerOpenA = $state(false);
	let drawerOpenB = $state(false);
	let drawerOpenC = $state(false);
	let appContainerWidth = $state(1000);
	let hideNavContainerWidth = $state(1000);
	let searchActive = $state(false);

	const actions: HeaderActionItem[] = [
		{
			id: "search",
			icon: { html: iconSearch({ size: 18 }) },
			label: "Search",
			onclick: () => (searchActive = !searchActive),
		},
		{
			id: "notifications",
			icon: { html: iconUser({ size: 18 }) },
			label: "Notifications",
			onclick: () => alert("Notifications"),
		},
		{
			id: "settings",
			icon: { html: iconSettings({ size: 18 }) },
			label: "Settings",
			href: "#settings",
		},
	];

	const navItems: HeaderNavItem[] = [
		{ id: "home", label: "Home", href: "#home", active: true },
		{ id: "about", label: "About", href: "#about" },
		{ id: "docs", label: "Documentation", href: "#docs" },
		{ id: "pricing", label: "Pricing", href: "#pricing" },
		{ id: "contact", label: "Contact", href: "#contact" },
	];

	const navItemsWithIcons: HeaderNavItem[] = [
		{
			id: "home",
			label: "Home",
			href: "#home",
			active: true,
		},
		{
			id: "search",
			label: "Search",
			icon: { html: iconSearch({ size: 16 }) },
			onclick: () => alert("Search clicked"),
		},
		{
			id: "settings",
			label: "Settings",
			icon: { html: iconSettings({ size: 16 }) },
			href: "#settings",
		},
	];

	let containerWidth = $state(1000);
</script>

<div class="space-y-16 py-8">
	<!-- Basic Header -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Basic Header</h2>
		<p class="text-sm text-neutral-500 mb-4">Project name and nav links.</p>
		<div class="overflow-hidden">
			<Header projectName="My App" items={navItems} class="bg-(--stuic-color-surface)" />
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- With Logo Snippet and Avatar -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Logo + Avatar</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Custom logo snippet and avatar on the far right.
		</p>
		<div class="border rounded-lg overflow-hidden">
			<Header items={navItems}>
				{#snippet logo()}
					<div class="flex items-center gap-2">
						<div
							class="size-8 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-sm"
						>
							S
						</div>
						<span class="font-semibold text-lg">Studio</span>
					</div>
				{/snippet}
				{#snippet avatar()}
					<Avatar initials="JD" size="md" autoColor />
				{/snippet}
			</Header>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Nav Items with Icons -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Nav Items with Icons</h2>
		<p class="text-sm text-neutral-500 mb-4">Icons rendered before the label via THC.</p>
		<div class="border rounded-lg overflow-hidden">
			<Header projectName="Studio" items={navItemsWithIcons} />
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Locale Switcher -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Locale Switcher</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Built-in locale dropdown before the avatar. Active: <code
				class="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">{activeLocale}</code
			>
		</p>
		<div class="border rounded-lg overflow-hidden">
			<Header
				projectName="Multilang App"
				items={navItems}
				{locales}
				{activeLocale}
				onLocaleChange={(id) => (activeLocale = id)}
				avatarOnClick={() => alert("Avatar")}
			></Header>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Responsive Collapse -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Responsive Collapse</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Drag the slider to resize the container. Below the threshold (768px) the nav
			collapses into a hamburger + dropdown menu. The avatar moves into the dropdown when <code
				class="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">avatarOnClick</code
			>
			is set.
		</p>
		<input
			type="range"
			min="300"
			max="1200"
			bind:value={containerWidth}
			class="w-full mb-4"
		/>
		<p class="text-sm opacity-60 mb-2">Container width: {containerWidth}px</p>
		<div
			class="border rounded-lg overflow-hidden mx-auto"
			style="width: {containerWidth}px; max-width: 100%;"
		>
			<Header
				projectName="Responsive"
				items={navItems}
				{locales}
				{activeLocale}
				onLocaleChange={(id) => (activeLocale = id)}
				avatarOnClick={() => alert("Avatar clicked")}
				avatarLabel="My Account"
			>
				{#snippet avatar()}
					<Avatar initials="AB" size="md" autoColor />
				{/snippet}
			</Header>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- App-like mode: leading hamburger (always visible) wired to a Drawer -->
	<section>
		<h2 class="text-xl font-semibold mb-2">App-like Mode</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Leading (left-side) hamburger with <code
				class="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">leadingHamburger</code
			>
			that fires a callback. The header stays drawer-agnostic — the consumer wires up the Drawer
			separately. Click the hamburger to open the left drawer.
		</p>
		<div class="border rounded-lg overflow-hidden">
			<Header
				projectName="My App"
				leadingHamburger
				onLeadingHamburger={() => (drawerOpenA = true)}
				leadingHamburgerLabel="Open navigation"
				avatarOnClick={() => alert("Avatar")}
			>
				{#snippet avatar()}
					<Avatar initials="MM" autoColor padding="4px" class="hover:bg-gray-200" />
				{/snippet}
			</Header>
		</div>
		<Drawer bind:visible={drawerOpenA} position="left" class="bg-white">
			<div class="p-6 w-72">
				<h3 class="font-semibold mb-3">App navigation</h3>
				<p class="text-sm opacity-60 mb-4">
					This drawer lives outside the Header — the header just emits a callback.
				</p>
				<Button onclick={() => (drawerOpenA = false)}>Close</Button>
			</div>
		</Drawer>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Mobile-only leading hamburger -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Mobile-only Leading Hamburger</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Use <code class="bg-neutral-100 dark:bg-neutral-800 px-1 rounded"
				>leadingHamburger="collapsed"</code
			>
			to show the hamburger only when the header is below the
			<code class="bg-neutral-100 dark:bg-neutral-800 px-1 rounded"
				>collapseThreshold</code
			>. Drag the slider to see it appear.
		</p>
		<input
			type="range"
			min="300"
			max="1200"
			bind:value={appContainerWidth}
			class="w-full mb-4"
		/>
		<p class="text-sm opacity-60 mb-2">Container width: {appContainerWidth}px</p>
		<div
			class="border rounded-lg overflow-hidden mx-auto"
			style="width: {appContainerWidth}px; max-width: 100%;"
		>
			<Header
				projectName="Console"
				items={navItems}
				leadingHamburger="collapsed"
				onLeadingHamburger={() => (drawerOpenB = true)}
				avatarOnClick={() => alert("Avatar")}
			>
				{#snippet avatar()}
					<Avatar initials="JD" size="md" autoColor />
				{/snippet}
			</Header>
		</div>
		<Drawer bind:visible={drawerOpenB} position="left">
			<div class="p-6 w-72">
				<h3 class="font-semibold mb-3">Sidebar</h3>
				<Button onclick={() => (drawerOpenB = false)}>Close</Button>
			</div>
		</Drawer>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Custom leading slot -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Custom Leading Slot</h2>
		<p class="text-sm text-neutral-500 mb-4">
			The <code class="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">leading</code> snippet
			accepts any content — back arrow, breadcrumbs, custom icon button, etc. It overrides the
			built-in hamburger.
		</p>
		<div class="border rounded-lg overflow-hidden">
			<Header projectName="Detail view">
				{#snippet leading()}
					<Button
						variant="ghost"
						iconButton
						size="sm"
						onclick={() => alert("Back")}
						aria-label="Back"
					>
						{@html iconArrowLeft({ size: 20 })}
					</Button>
				{/snippet}
				{#snippet avatar()}
					<Avatar initials="AB" size="md" autoColor />
				{/snippet}
			</Header>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Custom leading hamburger icon -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Custom Leading Hamburger Icon</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Swap the menu icon via <code class="bg-neutral-100 dark:bg-neutral-800 px-1 rounded"
				>leadingHamburgerIcon</code
			> while keeping the built-in button styling and accessibility.
		</p>
		<div class="border rounded-lg overflow-hidden">
			<Header
				projectName="Custom Icon"
				leadingHamburger
				onLeadingHamburger={() => alert("Leading clicked")}
				leadingHamburgerIcon={{ html: iconMenu({ size: 20 }) }}
				leadingHamburgerLabel="Open sidebar"
			/>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Action buttons (between locale and avatar) -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Action Buttons</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Icon-only action buttons via <code
				class="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">actions</code
			> sit between the locale switcher and the avatar. They support <code
				class="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">onclick</code
			>,
			<code class="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">href</code>,
			<code class="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">active</code>, and
			<code class="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">disabled</code>. Search is
			active: <code class="bg-neutral-100 dark:bg-neutral-800 px-1 rounded"
				>{searchActive}</code
			>
		</p>
		<div class="border rounded-lg overflow-hidden">
			<Header
				projectName="Actions Demo"
				items={navItems}
				actions={actions.map((a) =>
					a.id === "search" ? { ...a, active: searchActive } : a
				)}
				{locales}
				{activeLocale}
				onLocaleChange={(id) => (activeLocale = id)}
				avatarOnClick={() => alert("Avatar")}
			>
				{#snippet avatar()}
					<Avatar initials="MM" size="md" autoColor />
				{/snippet}
			</Header>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- App-like collapse: hide nav, keep avatar always visible -->
	<section>
		<h2 class="text-xl font-semibold mb-2">App-like Collapse (hide nav)</h2>
		<p class="text-sm text-neutral-500 mb-4">
			With <code class="bg-neutral-100 dark:bg-neutral-800 px-1 rounded"
				>collapseMode="hide"</code
			> nav items disappear entirely below the threshold (no trailing hamburger), but the
			avatar stays — the well-known "profile always accessible" UX. A leading hamburger opens
			the drawer that owns the navigation. Drag the slider to see the transition.
		</p>
		<input
			type="range"
			min="300"
			max="1200"
			bind:value={hideNavContainerWidth}
			class="w-full mb-4"
		/>
		<p class="text-sm opacity-60 mb-2">Container width: {hideNavContainerWidth}px</p>
		<div
			class="border rounded-lg overflow-hidden mx-auto"
			style="width: {hideNavContainerWidth}px; max-width: 100%;"
		>
			<Header
				projectName="App"
				items={navItems}
				collapseMode="hide"
				leadingHamburger
				onLeadingHamburger={() => (drawerOpenC = true)}
				{locales}
				{activeLocale}
				onLocaleChange={(id) => (activeLocale = id)}
				keepLocaleOnCollapse
				avatarOnClick={() => alert("Profile")}
			>
				{#snippet avatar()}
					<Avatar initials="PP" size="md" autoColor />
				{/snippet}
			</Header>
		</div>
		<Drawer bind:visible={drawerOpenC} position="left">
			<div class="p-6 w-72">
				<h3 class="font-semibold mb-3">App navigation</h3>
				<p class="text-sm opacity-60 mb-4">
					Nav lives here in app-like mode; the header just emits a callback to open this
					drawer.
				</p>
				<Button onclick={() => (drawerOpenC = false)}>Close</Button>
			</div>
		</Drawer>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Content max-width: full-width bar with capped inner row -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Content Max-Width</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code class="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">contentMaxWidth</code>
			caps the inner content row while the outer
			<code class="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">&lt;header&gt;</code>
			stays 100% wide — the background bleeds edge to edge, the content row is centered. The
			collapse threshold checks the inner row width, so collapse still works as expected.
		</p>
		<div
			class="border rounded-lg overflow-hidden"
			style="--stuic-header-bg: var(--stuic-color-surface);"
		>
			<Header
				projectName="ContentWidth Demo"
				items={navItems}
				contentMaxWidth="48rem"
				{locales}
				{activeLocale}
				onLocaleChange={(id) => (activeLocale = id)}
				avatarOnClick={() => alert("Avatar")}
			>
				{#snippet avatar()}
					<Avatar initials="CW" size="md" autoColor />
				{/snippet}
			</Header>
		</div>
		<p class="text-xs opacity-60 mt-2">
			Tip: the outer header background fills the surface; the centered inner row is capped at
			<code class="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">48rem</code>.
		</p>
	</section>
</div>
