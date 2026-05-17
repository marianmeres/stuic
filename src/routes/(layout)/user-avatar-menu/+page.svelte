<script lang="ts">
	import { createClog } from "@marianmeres/clog";
	import {
		UserAvatarMenu,
		ColorScheme,
		type UserAvatarMenuIdentity,
		type DropdownMenuItem,
		iconLanguages,
	} from "../../../lib/index.js";

	const clog = createClog("UserAvatarMenu");

	const user: UserAvatarMenuIdentity = {
		email: "marian.meres@example.com",
		roles: ["admin", "developer"],
	};

	const userWithPhoto: UserAvatarMenuIdentity = {
		email: "alice.brown@example.com",
		name: "Alice Brown",
		src: "https://i.pravatar.cc/150?img=5",
	};

	const userWithLongEmail: UserAvatarMenuIdentity = {
		email: "very.long.email.address.that.should.truncate@really-long-domain.example.com",
		roles: ["super-admin-with-a-long-role-name", "another-very-long-role"],
	};

	// scenario 5 — full items override (still uses identity for the trigger)
	const customItems: DropdownMenuItem[] = [
		{
			type: "header",
			id: "h1",
			label: "Quick links",
		},
		{
			type: "action",
			id: "billing",
			label: "Billing",
			onSelect: () => clog("billing"),
		},
		{
			type: "action",
			id: "team",
			label: "Team",
			onSelect: () => clog("team"),
		},
		{ type: "divider" },
		{
			type: "action",
			id: "signout",
			label: "Sign out",
			onSelect: () => clog("signout"),
		},
	];

	// scenario 6 — consumer-owned theme toggle in extraItems
	let isDarkExternal = $state(ColorScheme.getValue() === "dark");
	function consumerToggle() {
		ColorScheme.toggle();
		isDarkExternal = ColorScheme.getValue() === "dark";
	}
	const consumerExtraItems = $derived<DropdownMenuItem[]>([
		{
			type: "action",
			id: "consumer-theme",
			label: isDarkExternal ? "→ Switch to light" : "→ Switch to dark",
			onSelect: consumerToggle,
		},
		{
			type: "action",
			id: "consumer-lang",
			label: "Language",
			contentBefore: { html: iconLanguages({ size: 16 }) },
			onSelect: () => clog("change lang"),
		},
	]);
</script>

<h1 class="text-2xl font-bold mb-2">UserAvatarMenu</h1>
<p class="text-sm text-neutral-500 mb-6">
	Avatar trigger + dropdown menu. Authed + unauthed states, color-scheme toggle, header
	tile.
</p>

<hr class="my-6" />

<!-- 1 -->
<section>
	<h2 class="text-lg font-semibold mb-2">1 — Authenticated, all standard actions</h2>
	<p class="text-sm text-neutral-500 mb-4">
		Header tile + Profile + Color scheme + Logout. Color scheme toggles via the built-in <code
			>ColorScheme.toggle()</code
		>.
	</p>
	<UserAvatarMenu
		identity={user}
		actions={{
			onProfile: () => clog("profile"),
			onLogout: () => clog("logout"),
		}}
	/>
</section>

<hr class="my-6" />

<!-- 2 -->
<section>
	<h2 class="text-lg font-semibold mb-2">2 — Authenticated with photo + roles</h2>
	<p class="text-sm text-neutral-500 mb-4">
		<code>identity.src</code> is forwarded to <code>Avatar</code>;
		<code>showRoles</code> renders <code>identity.roles</code> under the email.
	</p>
	<UserAvatarMenu
		identity={userWithPhoto}
		showRoles
		actions={{
			onProfile: () => clog("profile"),
			onSettings: () => clog("settings"),
			onLogout: () => clog("logout"),
		}}
	/>
</section>

<hr class="my-6" />

<!-- 2b — long email truncation -->
<section>
	<h2 class="text-lg font-semibold mb-2">2b — Long email + long roles (truncation)</h2>
	<p class="text-sm text-neutral-500 mb-4">
		Long email/name and long role labels are truncated with an ellipsis and never stretch
		the dropdown.
	</p>
	<UserAvatarMenu
		identity={userWithLongEmail}
		showRoles
		actions={{
			onProfile: () => clog("profile"),
			onLogout: () => clog("logout"),
		}}
	/>
</section>

<hr class="my-6" />

<!-- 3 -->
<section>
	<h2 class="text-lg font-semibold mb-2">3 — Custom <code>headerTile</code> snippet</h2>
	<p class="text-sm text-neutral-500 mb-4">
		Replace the default avatar+email tile with arbitrary content.
	</p>
	<UserAvatarMenu identity={user} actions={{ onLogout: () => clog("logout") }}>
		{#snippet headerTile({ identity })}
			<div class="px-3 py-2 text-sm">
				<div class="font-semibold">Hi, {identity.email.split("@")[0]} 👋</div>
				<div class="text-neutral-500 text-xs">Last login: just now</div>
			</div>
		{/snippet}
	</UserAvatarMenu>
</section>

<hr class="my-6" />

<!-- 4 -->
<section>
	<h2 class="text-lg font-semibold mb-2">4 — Unauthenticated variants</h2>
	<p class="text-sm text-neutral-500 mb-4">
		<code>identity</code> omitted → unauth mode. All three handlers are independent: pass
		<code>onLoginOrRegister</code>
		for the typical "open the combined modal" flow, or <code>onLogin</code> /
		<code>onRegister</code>
		separately. Avatar falls back to <code>iconUser</code>; no header tile.
	</p>
	<div class="flex items-start gap-12">
		<div>
			<div class="text-xs text-neutral-500 mb-2">Combined (typical)</div>
			<UserAvatarMenu
				actions={{
					onLoginOrRegister: () => clog("loginOrRegister"),
				}}
			/>
		</div>
		<div>
			<div class="text-xs text-neutral-500 mb-2">Separate items</div>
			<UserAvatarMenu
				actions={{
					onLogin: () => clog("login"),
					onRegister: () => clog("register"),
				}}
			/>
		</div>
		<div>
			<div class="text-xs text-neutral-500 mb-2">All three (rare)</div>
			<UserAvatarMenu
				actions={{
					onLoginOrRegister: () => clog("loginOrRegister"),
					onLogin: () => clog("login"),
					onRegister: () => clog("register"),
				}}
			/>
		</div>
	</div>
</section>

<hr class="my-6" />

<!-- 5 -->
<section>
	<h2 class="text-lg font-semibold mb-2">5 — Full <code>items</code> override</h2>
	<p class="text-sm text-neutral-500 mb-4">
		Standard set bypassed entirely; consumer controls the items array. Trigger and
		dropdown shell still render.
	</p>
	<UserAvatarMenu identity={user} items={customItems} />
</section>

<hr class="my-6" />

<!-- 6 -->
<section>
	<h2 class="text-lg font-semibold mb-2">
		6 — <code>colorScheme={"{false}"}</code> + consumer-owned theme toggle via
		<code>extraItems</code>
	</h2>
	<p class="text-sm text-neutral-500 mb-4">
		Opt out of the built-in color-scheme item; wire your own through
		<code>extraItems</code>.
	</p>
	<UserAvatarMenu
		identity={user}
		colorScheme={false}
		actions={{
			onProfile: () => clog("profile"),
			onLogout: () => clog("logout"),
		}}
		extraItems={consumerExtraItems}
	/>
</section>

<hr class="my-6" />

<!-- Joy parity smell test -->
<section>
	<h2 class="text-lg font-semibold mb-2">Smell test — joy parity (~10 lines)</h2>
	<p class="text-sm text-neutral-500 mb-4">
		Mirrors the carsinc joy header — confirms the "if consumer can't drop to ~10 lines,
		the API is wrong" smell test in the spec.
	</p>
	<UserAvatarMenu
		identity={{ email: user.email }}
		actions={{
			onProfile: () => clog("/account/profile"),
			onLogout: () => clog("/logout"),
		}}
		labels={{
			viewProfile: "View profile",
			logout: "Logout",
			lightMode: "Light mode",
			darkMode: "Dark mode",
		}}
		avatar={{ class: "size-[60px]", padding: "10px" }}
		avatarHeader={{ class: "size-[80px]", padding: "12px" }}
		classDropdown="min-w-56 rounded-lg border-primary border-3 border-solid"
	/>
</section>
