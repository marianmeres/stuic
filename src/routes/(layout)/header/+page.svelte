<script lang="ts">
	import { Header, type HeaderNavItem, Avatar } from "$lib/index.js";
	import { iconSettings, iconSearch } from "$lib/icons/index.js";

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
					<Avatar initials="JD" size="sm" autoColor />
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
				avatarOnClick={() => alert("Avatar clicked")}
				avatarLabel="My Account"
			>
				{#snippet avatar()}
					<Avatar initials="AB" size="sm" autoColor />
				{/snippet}
			</Header>
		</div>
	</section>
</div>
