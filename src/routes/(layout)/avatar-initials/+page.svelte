<script lang="ts">
	import { AvatarInitials } from "../../../lib/index.js";

	let clickCount = $state(0);

	// Sample users to demonstrate autoColor with hashSource
	const users = [
		{ name: "Marcus Miller", email: "marcus.miller@example.com" },
		{ name: "Marian Meres", email: "marian.meres@example.com" },
		{ name: "John Doe", email: "john.doe@example.com" },
		{ name: "Jane Smith", email: "jane.smith@example.com" },
		{ name: "Alice Brown", email: "alice.brown@example.com" },
		{ name: "Bob Wilson", email: "bob.wilson@example.com" },
		{ name: "Charlie Davis", email: "charlie.davis@example.com" },
		{ name: "Diana Evans", email: "diana.evans@example.com" },
	];
</script>

<h2 class="text-lg font-semibold mb-4">Basic Usage</h2>
<div class="flex items-center gap-4">
	<AvatarInitials input="AB" />
	<AvatarInitials input="CD" />
	<AvatarInitials input="EF" />
	<AvatarInitials input="" />
</div>

<hr class="my-6" />

<h2 class="text-lg font-semibold mb-4">Size Variations</h2>
<div class="flex items-center gap-4">
	<AvatarInitials input="SM" size="sm" />
	<AvatarInitials input="MD" size="md" />
	<AvatarInitials input="LG" size="lg" />
	<AvatarInitials input="XL" size="size-20 text-xl" />
</div>

<hr class="my-6" />

<h2 class="text-lg font-semibold mb-4">Auto-Color (deterministic from input)</h2>
<p class="text-sm text-neutral-500 mb-4">
	Same initials, same colors - refresh the page to verify consistency.
</p>
<div class="flex items-center gap-4">
	<AvatarInitials input="AB" autoColor />
	<AvatarInitials input="CD" autoColor />
	<AvatarInitials input="EF" autoColor />
	<AvatarInitials input="GH" autoColor />
</div>

<hr class="my-6" />

<h2 class="text-lg font-semibold mb-4">Email-based Initials</h2>
<p class="text-sm text-neutral-500 mb-4">
	Extracts initials from email usernames (john.doe@... = JD, marcus_miller@... = MM).
</p>
<div class="flex items-center gap-4">
	<div class="text-center">
		<AvatarInitials input="john.doe@example.com" autoColor />
		<div class="text-xs mt-1">john.doe@...</div>
	</div>
	<div class="text-center">
		<AvatarInitials input="marcus_miller@example.com" autoColor />
		<div class="text-xs mt-1">marcus_miller@...</div>
	</div>
	<div class="text-center">
		<AvatarInitials input="alice-brown@example.com" autoColor />
		<div class="text-xs mt-1">alice-brown@...</div>
	</div>
	<div class="text-center">
		<AvatarInitials input="bob@example.com" autoColor />
		<div class="text-xs mt-1">bob@... (no separator)</div>
	</div>
</div>

<hr class="my-6" />

<h2 class="text-lg font-semibold mb-4">Auto-Color with hashSource</h2>
<p class="text-sm text-neutral-500 mb-4">
	Both show "MM" initials but different colors (based on different emails).
</p>
<div class="flex items-center gap-4">
	<div class="text-center">
		<AvatarInitials input="MM" hashSource="MM-marcus.miller@example.com" autoColor />
		<div class="text-xs mt-1">Marcus Miller</div>
	</div>
	<div class="text-center">
		<AvatarInitials input="MM" hashSource="MM-marian.meres@example.com" autoColor />
		<div class="text-xs mt-1">Marian Meres</div>
	</div>
</div>

<hr class="my-6" />

<h2 class="text-lg font-semibold mb-4">User List Example</h2>
<div class="flex flex-wrap gap-3">
	{#each users as user}
		<div
			class="flex items-center gap-2 p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800"
		>
			<AvatarInitials
				input={user.name}
				hashSource={JSON.stringify(user)}
				autoColor
				size="sm"
			/>
			<div class="text-sm">{user.name}</div>
		</div>
	{/each}
</div>

<hr class="my-6" />

<h2 class="text-lg font-semibold mb-4">Custom Colors</h2>
<div class="flex items-center gap-4">
	<AvatarInitials input="BL" bg="bg-blue-500" textColor="text-white" />
	<AvatarInitials input="GR" bg="bg-green-600" textColor="text-white" />
	<AvatarInitials input="RD" bg="bg-red-500" textColor="text-white" />
	<AvatarInitials input="YL" bg="bg-yellow-400" textColor="text-yellow-900" />
</div>

<hr class="my-6" />

<h2 class="text-lg font-semibold mb-4">Clickable</h2>
<p class="text-sm text-neutral-500 mb-4">Click count: {clickCount}</p>
<div class="flex items-center gap-4">
	<AvatarInitials input="Click Me" autoColor onclick={() => clickCount++} />
	<AvatarInitials
		input="Me Too"
		autoColor
		hashSource="different"
		onclick={() => clickCount++}
	/>
</div>

<hr class="my-6" />

<h2 class="text-lg font-semibold mb-4">Dark Mode Test</h2>
<p class="text-sm text-neutral-500 mb-4">
	Toggle dark mode to see how avatars look on different backgrounds.
</p>
<div class="flex gap-8">
	<div class="p-4 rounded-lg bg-white">
		<div class="flex items-center gap-2">
			<AvatarInitials input="DK" autoColor />
			<span class="text-neutral-900">Light bg</span>
		</div>
	</div>
	<div class="p-4 rounded-lg bg-neutral-900">
		<div class="flex items-center gap-2">
			<AvatarInitials input="DK" autoColor />
			<span class="text-white">Dark bg</span>
		</div>
	</div>
</div>
