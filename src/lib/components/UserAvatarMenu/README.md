# UserAvatarMenu

A thin, opinionated wrapper around [`Avatar`](../Avatar/) + [`DropdownMenu`](../DropdownMenu/) for the common "user avatar in the header that opens a small menu" pattern. Renders sensibly in both authenticated and unauthenticated states from the same trigger position.

The component composes existing primitives and adds convention, not behavior. It owns **no** auth state, router, or i18n — consumers pass in the user (or `null`) and the handlers.

## Usage

### Minimal — logged in

```svelte
<UserAvatarMenu
	identity={{ email: user.email }}
	actions={{
		onProfile: () => goto("/me"),
		onLogout: () => goto("/logout"),
	}}
/>
```

### Minimal — logged out

```svelte
<UserAvatarMenu
	actions={{
		onLogin: () => openLoginModal(),
		onRegister: () => openRegisterModal(),
	}}
/>
```

### Full (i18n + extras)

```svelte
<UserAvatarMenu
	identity={{
		email: user.email,
		roles: user.roles,
	}}
	showRoles
	actions={{
		onProfile: () => goto("/account/profile"),
		onLogout: () => goto("/logout"),
	}}
	labels={{
		viewProfile: t.raw("dd_view_profile"),
		logout: t.raw("dd_logout"),
		lightMode: t.raw("dd_light_mode"),
		darkMode: t.raw("dd_dark_mode"),
	}}
	avatar={{ class: "size-[60px]", padding: "10px" }}
	classDropdown="min-w-56 rounded-lg border-primary border-3 border-solid"
/>
```

## Props

| Prop             | Type                                          | Default | Description                                                                                 |
| ---------------- | --------------------------------------------- | ------- | ------------------------------------------------------------------------------------------- |
| `identity`       | `UserAvatarMenuIdentity \| null`              | `null`  | Current user. `null` / `undefined` → unauthenticated mode.                                  |
| `actions`        | `UserAvatarMenuActions`                       | `{}`    | Handlers: `onProfile`, `onSettings`, `onLogout`, `onLogin`, `onRegister`. Missing → hidden. |
| `labels`         | `UserAvatarMenuLabels`                        | English | Translated strings for built-in items.                                                      |
| `colorScheme`    | `boolean \| { enabled?; onToggle?; isDark? }` | `true`  | Built-in dark/light toggle. `false` to disable. Object form overrides toggle / read.        |
| `showHeaderTile` | `boolean`                                     | `true`  | Render the avatar + email header tile when authenticated.                                   |
| `showRoles`      | `boolean`                                     | `false` | Render `identity.roles` under the email in the header tile.                                 |
| `extraItems`     | `DropdownMenuItem[]`                          | —       | Appended to the standard item set.                                                          |
| `items`          | `DropdownMenuItem[]`                          | —       | Full override of the item list. Trigger + dropdown shell still render.                      |
| `avatar`         | `Partial<AvatarProps>`                        | —       | Forwarded to the default trigger Avatar (and the header-tile Avatar).                       |
| `position`       | `DropdownMenuPosition`                        | —       | Forwarded to `DropdownMenu`.                                                                |
| `offset`         | `string`                                      | —       | Forwarded.                                                                                  |
| `maxHeight`      | `string`                                      | —       | Forwarded.                                                                                  |
| `closeOnSelect`  | `boolean`                                     | —       | Forwarded.                                                                                  |
| `classDropdown`  | `string`                                      | —       | Forwarded.                                                                                  |
| `classTrigger`   | `string`                                      | —       | Class merged onto the default trigger `<button>`.                                           |
| `isOpen`         | `boolean`                                     | `false` | Bindable open state.                                                                        |
| `trigger`        | `Snippet<[{ isOpen; toggle; triggerProps }]>` | —       | Custom trigger snippet; fully replaces the default.                                         |
| `headerTile`     | `Snippet<[{ identity }]>`                     | —       | Custom header-tile snippet; replaces the default avatar+email tile inside the dropdown.     |
| `unstyled`       | `boolean`                                     | `false` | Skip default styling.                                                                       |
| `class`          | `string`                                      | —       | Wrapper classes.                                                                            |
| `el`             | `HTMLDivElement`                              | —       | Bindable wrapper element.                                                                   |

### `UserAvatarMenuIdentity`

```ts
interface UserAvatarMenuIdentity {
	email: string;
	name?: string;
	src?: string; // photo URL
	roles?: string[];
}
```

### `UserAvatarMenuActions`

All handlers are optional. **Omitting a handler hides the corresponding item.** The three unauth handlers (`onLoginOrRegister`, `onLogin`, `onRegister`) are independent — pass any combination.

| Handler             | Item              | Visible in      |
| ------------------- | ----------------- | --------------- |
| `onProfile`         | View profile      | Authenticated   |
| `onSettings`        | Settings          | Authenticated   |
| `onLogout`          | Logout            | Authenticated   |
| `onLoginOrRegister` | Login or register | Unauthenticated |
| `onLogin`           | Login             | Unauthenticated |
| `onRegister`        | Register          | Unauthenticated |

### `UserAvatarMenuLabels`

```ts
interface UserAvatarMenuLabels {
	viewProfile?: string; // "View profile"
	settings?: string; // "Settings"
	logout?: string; // "Logout"
	loginOrRegister?: string; // "Login or register"
	login?: string; // "Login"
	register?: string; // "Register"
	lightMode?: string; // "Light mode"
	darkMode?: string; // "Dark mode"
	triggerAuthed?: string; // "User menu"  (aria-label)
	triggerAnon?: string; // "Sign in"    (aria-label)
}
```

## Default item order

Predictable so consumers can reason about position when adding `extraItems`.

### Authenticated

1. Header tile (when `showHeaderTile !== false`)
2. View profile (when `actions.onProfile`)
3. Settings (when `actions.onSettings`)
4. Color scheme toggle (when `colorScheme !== false`) — sun/moon icon, label flips
5. Divider (when there was at least one item above **and** `actions.onLogout`)
6. Logout (when `actions.onLogout`) — with `iconLogOut`
7. `extraItems` (appended)

### Unauthenticated

1. Login or register (when `actions.onLoginOrRegister`) — the typical case, wire to a `LoginOrRegisterFormModal`
2. Login (when `actions.onLogin`)
3. Register (when `actions.onRegister`)
4. Color scheme toggle
5. `extraItems`

No header tile in unauth mode.

### `items` override

When `items` is passed, the entire default set is bypassed. The trigger + shell still render.

## Opinionated decisions

- **Color scheme is the one built-in side effect.** The component calls `ColorScheme.toggle()` and re-reads `ColorScheme.getValue()` on select. Label/icon flip without consumer involvement. Opt out with `colorScheme={false}`, or override via the object form: `colorScheme={{ onToggle, isDark }}`.
- **English defaults.** Pass `labels` for i18n. The component never imports an i18n library; consumers pass already-translated strings.
- **No auth ownership.** No state observation, no log-out call, no router. All side effects are consumer callbacks.
- **No modal triggering.** "Login" doesn't open a `LoginOrRegisterFormModal` — that's your `onLogin` handler.
- **Trigger is just `Avatar`.** No wrapper element by default. In unauth mode `Avatar` falls back to `iconUser`. Use the `trigger` snippet for full control.

## CSS Tokens

Prefix: `--stuic-user-avatar-menu-*`

| Token                                             | Default                               |
| ------------------------------------------------- | ------------------------------------- |
| `--stuic-user-avatar-menu-dropdown-width`         | `16rem`                               |
| `--stuic-user-avatar-menu-trigger-radius`         | `var(--stuic-radius)`                 |
| `--stuic-user-avatar-menu-trigger-opacity-hover`  | `0.85`                                |
| `--stuic-user-avatar-menu-trigger-outline-color`  | `var(--stuic-color-primary)`          |
| `--stuic-user-avatar-menu-transition`             | `var(--stuic-transition)`             |
| `--stuic-user-avatar-menu-header-gap`             | `0.5rem`                              |
| `--stuic-user-avatar-menu-header-padding`         | `0.75rem 0.5rem`                      |
| `--stuic-user-avatar-menu-header-margin-bottom`   | `0.25rem`                             |
| `--stuic-user-avatar-menu-header-bg`              | `var(--stuic-color-muted)`            |
| `--stuic-user-avatar-menu-header-color`           | `var(--stuic-color-muted-foreground)` |
| `--stuic-user-avatar-menu-header-radius`          | `var(--stuic-radius)`                 |
| `--stuic-user-avatar-menu-header-email-font-size` | `inherit`                             |
| `--stuic-user-avatar-menu-header-email-color`     | `inherit`                             |
| `--stuic-user-avatar-menu-header-roles-font-size` | `0.75rem`                             |
| `--stuic-user-avatar-menu-header-roles-color`     | `var(--stuic-color-muted-foreground)` |
| `--stuic-user-avatar-menu-header-roles-opacity`   | `0.7`                                 |

The dropdown has a fixed `width` so every instance opens at the same size, regardless of content. Long emails/names truncate with `text-overflow: ellipsis` against that fixed width. Override `--stuic-user-avatar-menu-dropdown-width` (or pass `classDropdown="!w-72"` for one-off overrides).

## See also

- [`Avatar`](../Avatar/) — trigger / header-tile primitive
- [`DropdownMenu`](../DropdownMenu/) — menu shell (item shapes, position values, search)
- [`ColorScheme`](../ColorScheme/) — class used by the built-in toggle
