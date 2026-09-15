# Header

Top-bar component with leading slot, project logo, nav items, locale switcher, optional action buttons, avatar, and responsive collapse (either fold into a trailing hamburger dropdown OR hide nav entirely).

## Examples

### The locale switcher stays visible when collapsed

When the header collapses, the locale switcher does **not** fold into the trailing hamburger. It stays inline, immediately before the actions / avatar / hamburger, in **both** collapse modes. Nothing to configure — it is the default.

```svelte
<Header
	projectName="App"
	items={navItems}
	{locales}
	{activeLocale}
	onLocaleChange={(id) => (activeLocale = id)}
/>
<!-- collapsed:  [App]                              [EN ▾] [☰] -->
```

This is the one control `Header` deliberately treats differently from a nav item, and the reason is worth stating because it looks like an inconsistency:

> The person who most needs the language switch is the person who landed in a language they cannot read. A visible `EN ▾` trigger is self-describing to them — it shows the current language and it is obviously a control. An entry inside the hamburger is not: the trigger is an unlabeled icon, the section heading says "Language" in a language they do not speak, and past a handful of nav items it sits below the fold of a menu they have to scroll with a finger. It is reliably never found.

What follows from it:

| Behavior                                                                                                                                  | Why                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The trailing dropdown has **no** locale section while the inline trigger is visible.                                                      | Two routes to one setting, one of which nobody finds. `_dropdownItems` appends the locale section only when the inline switcher is hidden.                         |
| A header whose only collapsible content was the locale switcher renders **no hamburger at all**.                                          | `_dropdownItems` comes back empty, and the trailing `DropdownMenu` is gated on it being non-empty.                                                                 |
| The inline trigger shows `HeaderLocaleItem.shortLabel` (when set) **only** while collapsed.                                               | `"Slovenčina"` next to a hamburger on a 360px phone is what pushed the switcher into the menu in the first place. The dropdown list always shows the full `label`. |
| `keepLocaleOnCollapse={false}` restores the alternative: folds into the dropdown in `"hamburger"` mode, hidden entirely in `"hide"` mode. | For an end area already crowded with actions, or an app whose own drawer owns the language switch.                                                                 |

```ts
// Long locale names on a narrow header: short form on the inline trigger,
// full form in the dropdown list.
const locales: HeaderLocaleItem[] = [
	{ id: "en", label: "English", shortLabel: "EN" },
	{ id: "sk", label: "Slovenčina", shortLabel: "SK" },
];
```

### App-like collapse: avatar + actions visible, everything else hidden

Common "app shell" pattern: when the header collapses below `collapseThreshold`, the avatar, the locale switcher and a few key actions (search, notifications, cart…) remain visible, the trailing hamburger is NOT shown, and the nav items are hidden entirely (the nav typically lives in a drawer triggered by the leading hamburger instead).

| Requirement                     | Where it's handled                                                                                 | How                                                                                                                                                      |
| ------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Avatar stays visible**        | [Header.svelte:673](./Header.svelte#L673) — `{#if avatar && !(_isCollapsed && _avatarInDropdown)}` | `_avatarInDropdown` requires `collapseMode === "hamburger"`. In `"hide"` mode it's always `false`, so the avatar always renders.                         |
| **Action buttons stay visible** | [Header.svelte:632](./Header.svelte#L632) — `<!-- Actions (icon buttons, always visible) -->`      | The actions loop has no collapse gating — items render in both modes.                                                                                    |
| **No trailing hamburger**       | [Header.svelte:689](./Header.svelte#L689) — `{#if _isCollapsed && _dropdownItems.length > 0}`      | In `"hide"` mode, `_dropdownItems` short-circuits to `[]`, so the `{#if}` is false → no trailing hamburger.                                              |
| **Nav items hidden**            | [Header.svelte:564](./Header.svelte#L564) — `{#if !_isCollapsed && items.length > 0}`              | Inline nav requires `!_isCollapsed`; combined with the empty `_dropdownItems` above, items don't reappear in a dropdown either.                          |
| **Locale stays visible**        | [Header.svelte:369](./Header.svelte#L369) — `!_isCollapsed \|\| keepLocaleOnCollapse`              | `keepLocaleOnCollapse` defaults to `true` in both modes (see the section above). Pass `false` to hide it, e.g. when the drawer owns the language switch. |

Minimal config:

```svelte
<Header
    projectName="App"
    items={navItems}            <!-- shown expanded, hidden collapsed -->
    actions={[...]}             <!-- always visible -->
    collapseMode="hide"         <!-- no trailing hamburger; avatar stays -->
    leadingHamburger            <!-- optional: drives a drawer for the hidden nav -->
    onLeadingHamburger={() => (drawerOpen = true)}
    {locales} {activeLocale}    <!-- stays visible in collapsed (keepLocaleOnCollapse defaults to true) -->
    onLocaleChange={(id) => (activeLocale = id)}
    avatarOnClick={() => alert("Profile")}  <!-- safe in "hide" mode — won't move into dropdown -->
>
    {#snippet avatar()}<Avatar initials="MM" autoColor />{/snippet}
</Header>
```

## PWA safe area (`safeArea`)

When your app is installed and launched standalone (iOS Home Screen, Android/desktop PWA), the web view fills the **entire** screen, so a top app bar renders _under_ the status bar / notch / Dynamic Island, where the system swallows touches — the logo and hamburger become untappable.

Set `safeArea` on the **top app bar** to offset its content below the device safe-area insets. It pads the **top** (status bar / notch in portrait) plus the **left/right** insets (a side notch in landscape — both `0` in portrait). The padding lands on the **outer** `<header>` (the background-bearing, full-width element), so the brand color fills the inset strip and the inner content row keeps its own padding.

```svelte
<Header
	projectName="App"
	fixed
	safeArea
	leadingHamburger
	onLeadingHamburger={openDrawer}
/>
```

- **Default `false`.** No change to any existing render path. It's a **no-op in a browser tab** and on devices without an inset (`env()` → `0`).
- The insets are only non-zero when the consuming app sets `<meta name="viewport" content="..., viewport-fit=cover">` (the app's responsibility) **and** the device has an inset.
- **Only set it on the TOP app bar.** `Header` is reused as in-page, detail, and drawer-internal headers — those must NOT get `safeArea`, or they'd be wrongly padded.
- **Respects `unstyled`** (skipped, like every other `data-*` toggle).
- It is **independent of `fixed`** — you typically want both on a top app bar, but neither implies the other.

### Pick ONE layer (avoid double padding)

A nav **drawer** that contains its own stuic `Header` (logo + close button) is common. In that case set `safeArea` on the **inner `Header`** (so the header color fills the strip) and do **not** also offset the drawer panel — otherwise the top inset is applied twice. Each safe-area edge should be padded on exactly **one** element in any nesting chain.

> The underlying mechanism (and the reusable `.stuic-safe-area-*` utility classes / `--stuic-safe-area-*` CSS variables for any other edge-anchored element) is documented in the root README under "PWA safe-area insets".
