<script lang="ts">
	import Button from "../../../lib/components/Button/Button.svelte";
	import { Avatar, iconUser, iconAlertInfo } from "../../../lib/index.js";

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

	// Demo photo URLs
	const validPhotoUrl = "https://i.pravatar.cc/150?img=3";
	const invalidPhotoUrl = "https://invalid-url-that-will-fail.com/photo.jpg";
</script>

<h2 class="text-lg font-semibold mb-4">Icon Mode (Default)</h2>
<p class="text-sm text-neutral-500 mb-4">
	Default mode with no props shows the user icon.
</p>
<div class="flex items-center gap-4">
	<Avatar />
	<Avatar autoColor hashSource="user-1" />
	<Avatar autoColor hashSource="user-2" />

	<Avatar icon={iconAlertInfo} class="bg-zinc-400" />
	<Button x roundedFull aspect1 class="bg-zinc-400" />
	(this is a button - default sizes should match)
</div>

<hr class="my-6" />

<h2 class="text-lg font-semibold mb-4">Photo Mode</h2>
<p class="text-sm text-neutral-500 mb-4">Shows an image when src is provided.</p>
<div class="flex items-center gap-4">
	<Avatar src={validPhotoUrl} alt="Sample user" />
	<Avatar src={validPhotoUrl} alt="Sample user" size="lg" />
	<Avatar src={validPhotoUrl} alt="Sample user" size="xl" />
</div>

<hr class="my-6" />

<h2 class="text-lg font-semibold mb-4">Photo Mode with Fallback</h2>
<p class="text-sm text-neutral-500 mb-4">
	When photo fails to load, shows fallback (icon by default, or initials).
</p>
<div class="flex items-center gap-4">
	<div class="text-center">
		<Avatar src={invalidPhotoUrl} alt="Fallback to icon" />
		<div class="text-xs mt-1">fallback: icon (default)</div>
	</div>
	<div class="text-center">
		<Avatar
			src={invalidPhotoUrl}
			alt="Fallback to initials"
			fallback="initials"
			initials="John Doe"
		/>
		<div class="text-xs mt-1">fallback: initials</div>
	</div>
	<div class="text-center">
		<Avatar
			src={invalidPhotoUrl}
			alt="Fallback to custom initials"
			fallback={{ initials: "jane@example.com" }}
			autoColor
		/>
		<div class="text-xs mt-1">fallback: custom initials</div>
	</div>
	<div class="text-center">
		<Avatar
			src={invalidPhotoUrl}
			alt="Fallback to custom icon"
			fallback={{ icon: iconAlertInfo }}
		/>
		<div class="text-xs mt-1">fallback: custom icon</div>
	</div>
</div>

<hr class="my-6" />

<h2 class="text-lg font-semibold mb-4">Initials Mode - Basic</h2>
<div class="flex items-center gap-4">
	<Avatar initials="AB" />
	<Avatar initials="CD" />
	<Avatar initials="EF" />
	<Avatar initials="GH" initialsLength={1} />
	<Avatar initials="" />
</div>

<hr class="my-6" />

<h2 class="text-lg font-semibold mb-4">Size Variations</h2>
<div class="flex items-center gap-4">
	<Avatar initials="SM" size="sm" />
	<Avatar initials="MD" size="md" />
	<Avatar initials="LG" size="lg" />
	<Avatar initials="XL" size="xl" />
	<Avatar initials="2XL" size="2xl" />
</div>

<div class="flex items-center gap-4 mt-2">
	<Avatar size="sm" />
	<Avatar size="md" />
	<Avatar size="lg" />
	<Avatar size="xl" />
	<Avatar size="2xl" />
</div>

<hr class="my-6" />

<h2 class="text-lg font-semibold mb-4">Auto-Color (deterministic from initials)</h2>
<p class="text-sm text-neutral-500 mb-4">
	Same initials, same colors - refresh the page to verify consistency.
</p>
<div class="flex items-center gap-4">
	<Avatar initials="AB" autoColor />
	<Avatar initials="CD" autoColor />
	<Avatar initials="EF" autoColor />
	<Avatar initials="GH" autoColor />
</div>

<hr class="my-6" />

<h2 class="text-lg font-semibold mb-4">Email-based Initials</h2>
<p class="text-sm text-neutral-500 mb-4">
	Extracts initials from email usernames (john.doe@... = JD, marcus_miller@... = MM).
</p>
<div class="flex items-center gap-4">
	<div class="text-center">
		<Avatar initials="john.doe@example.com" autoColor />
		<div class="text-xs mt-1">john.doe@...</div>
	</div>
	<div class="text-center">
		<Avatar initials="marcus_miller@example.com" autoColor />
		<div class="text-xs mt-1">marcus_miller@...</div>
	</div>
	<div class="text-center">
		<Avatar initials="alice-brown@example.com" autoColor />
		<div class="text-xs mt-1">alice-brown@...</div>
	</div>
	<div class="text-center">
		<Avatar initials="bob@example.com" autoColor />
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
		<Avatar initials="MM" hashSource="MM-marcus.miller@example.com" autoColor />
		<div class="text-xs mt-1">Marcus Miller</div>
	</div>
	<div class="text-center">
		<Avatar initials="MM" hashSource="MM-marian.meres@example.com" autoColor />
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
			<Avatar
				initials={user.name}
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
	<Avatar initials="BL" bg="bg-blue-500" textColor="text-white" />
	<Avatar initials="GR" bg="bg-green-600" textColor="text-white" />
	<Avatar initials="RD" bg="bg-red-500" textColor="text-white" />
	<Avatar initials="YL" bg="bg-yellow-400" textColor="text-yellow-900" />
</div>

<hr class="my-6" />

<h2 class="text-lg font-semibold mb-4">Clickable</h2>
<p class="text-sm text-neutral-500 mb-4">Click count: {clickCount}</p>
<div class="flex items-center gap-4">
	<Avatar initials="Click Me" autoColor onclick={() => clickCount++} />
	<Avatar
		initials="Me Too"
		autoColor
		hashSource="different"
		onclick={() => clickCount++}
	/>
	<Avatar autoColor hashSource="icon-click" onclick={() => clickCount++} />
</div>

<hr class="my-6" />

<h2 class="text-lg font-semibold mb-4">Dark Mode Test</h2>
<p class="text-sm text-neutral-500 mb-4">
	Toggle dark mode to see how avatars look on different backgrounds.
</p>
<div class="flex gap-8">
	<div class="p-4 rounded-lg bg-white">
		<div class="flex items-center gap-2">
			<Avatar initials="DK" autoColor />
			<span class="text-neutral-900">Light bg</span>
		</div>
	</div>
	<div class="p-4 rounded-lg bg-neutral-900">
		<div class="flex items-center gap-2">
			<Avatar initials="DK" autoColor />
			<span class="text-white">Dark bg</span>
		</div>
	</div>
</div>
