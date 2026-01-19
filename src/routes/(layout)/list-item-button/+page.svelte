<script>
	import {
		ListItemButton,
		iconUser,
		iconCheck,
		iconChevronRight,
		iconTrash,
	} from "$lib/index.js";

	let activeIdx = $state(1);
	let focusedIdx = $state(-1);
</script>

<h2 class="text-lg font-bold mb-4">Basic States</h2>
<div class="w-72 space-y-1 border rounded-lg p-2">
	<ListItemButton>Default</ListItemButton>
	<ListItemButton active>Active (selected)</ListItemButton>
	<ListItemButton focused>Focused (keyboard nav)</ListItemButton>
	<ListItemButton disabled>Disabled</ListItemButton>
</div>

<hr class="my-8" />

<h2 class="text-lg font-bold mb-4">Sizes</h2>
<div class="w-72 space-y-1 border rounded-lg p-2">
	<ListItemButton size="sm">Small</ListItemButton>
	<ListItemButton size="md">Medium (default)</ListItemButton>
	<ListItemButton size="lg">Large</ListItemButton>
</div>

<hr class="my-8" />

<h2 class="text-lg font-bold mb-4">Touch Friendly</h2>
<div class="w-72 space-y-1 border rounded-lg p-2">
	<ListItemButton size="sm" touchFriendly>Small + touchFriendly=true</ListItemButton>
	<ListItemButton size="sm" touchFriendly="auto"
		>Small + touchFriendly="auto"</ListItemButton
	>
</div>

<hr class="my-8" />

<h2 class="text-lg font-bold mb-4">With Icons</h2>
<div class="w-72 space-y-1 border rounded-lg p-2">
	<ListItemButton contentBefore={{ html: iconUser({}) }}>User Profile</ListItemButton>
	<ListItemButton
		contentBefore={{ html: iconTrash({}) }}
		class="text-red-600 dark:text-red-400"
	>
		Delete Item
	</ListItemButton>
	<ListItemButton contentAfter={{ html: iconChevronRight({}) }}>Settings</ListItemButton>
	<ListItemButton
		active
		contentBefore={{ html: iconCheck({}) }}
		contentAfter={{ html: iconChevronRight({}) }}
	>
		Selected Option
	</ListItemButton>
</div>

<hr class="my-8" />

<h2 class="text-lg font-bold mb-4">Interactive List</h2>
<div class="w-72 space-y-1 border rounded-lg p-2">
	{#each ["Option A", "Option B", "Option C"] as label, i}
		<ListItemButton
			active={activeIdx === i}
			focused={focusedIdx === i}
			onclick={() => (activeIdx = i)}
			onmouseenter={() => (focusedIdx = i)}
			onmouseleave={() => (focusedIdx = -1)}
		>
			{label}
		</ListItemButton>
	{/each}
</div>
<p class="mt-2 text-sm text-neutral-500">Active: {activeIdx}, Focused: {focusedIdx}</p>

<hr class="my-8" />

<h2 class="text-lg font-bold mb-4">Custom CSS Variables</h2>
<div
	class="w-72 space-y-1 border rounded-lg p-2"
	style="
		--color-stuic-lib-hover-bg: var(--color-blue-100);
		--color-stuic-lib-hover-bg-dark: var(--color-blue-900);
		--color-stuic-lib-active-bg: var(--color-blue-200);
		--color-stuic-lib-active-bg-dark: var(--color-blue-800);
	"
>
	<ListItemButton>Hover me (blue)</ListItemButton>
	<ListItemButton active>Active (blue)</ListItemButton>
</div>

<hr class="my-8" />

<h2 class="text-lg font-bold mb-4">As Link</h2>
<div class="w-72 space-y-1 border rounded-lg p-2">
	<ListItemButton href="#link1">Link Item 1</ListItemButton>
	<ListItemButton href="#link2" contentAfter={{ html: iconChevronRight({ size: 20 }) }}>
		Link Item 2
	</ListItemButton>
</div>

<hr class="my-8" />

<h2 class="text-lg font-bold mb-4">Unstyled</h2>
<div class="w-72 space-y-1 border rounded-lg p-2">
	<ListItemButton unstyled class="px-2 py-1 bg-pink-100 dark:bg-pink-900 rounded">
		Custom styled
	</ListItemButton>
</div>
