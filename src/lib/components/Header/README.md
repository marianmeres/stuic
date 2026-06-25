# Header

Top-bar component with leading slot, project logo, nav items, locale switcher, optional action buttons, avatar, and responsive collapse (either fold into a trailing hamburger dropdown OR hide nav entirely).

## Examples

### App-like collapse: avatar + actions visible, everything else hidden

Common "app shell" pattern: when the header collapses below `collapseThreshold`, the avatar and a few key actions (search, notifications, cart…) remain visible, the trailing hamburger is NOT shown, and the nav items + locale switcher are hidden entirely (the nav typically lives in a drawer triggered by the leading hamburger instead).

| Requirement                     | Where it's handled                                                                                                 | How                                                                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| **Avatar stays visible**        | [Header.svelte:626](./Header.svelte#L626) — `{#if avatar && !(_isCollapsed && _avatarInDropdown)}`                 | `_avatarInDropdown` requires `collapseMode === "hamburger"`. In `"hide"` mode it's always `false`, so the avatar always renders. |
| **Action buttons stay visible** | [Header.svelte:585](./Header.svelte#L585) — `<!-- Actions (icon buttons, always visible) -->`                      | The actions loop has no collapse gating — items render in both modes.                                                            |
| **No trailing hamburger**       | [Header.svelte:642](./Header.svelte#L642) — `{#if _isCollapsed && _dropdownItems.length > 0}`                      | In `"hide"` mode, `_dropdownItems` short-circuits to `[]`, so the `{#if}` is false → no trailing hamburger.                      |
| **Nav items hidden**            | [Header.svelte:516](./Header.svelte#L516) — `{#if !_isCollapsed && items.length > 0}`                              | Inline nav requires `!_isCollapsed`; combined with the empty `_dropdownItems` above, items don't reappear in a dropdown either.  |
| **Locale hidden**               | [Header.svelte:335](./Header.svelte#L335) — `!_isCollapsed \|\| (collapseMode === "hide" && keepLocaleOnCollapse)` | Default `keepLocaleOnCollapse={false}` hides the locale switcher in collapsed mode.                                              |

Minimal config:

```svelte
<Header
    projectName="App"
    items={navItems}            <!-- shown expanded, hidden collapsed -->
    actions={[...]}             <!-- always visible -->
    collapseMode="hide"         <!-- no trailing hamburger; avatar stays -->
    leadingHamburger            <!-- optional: drives a drawer for the hidden nav -->
    onLeadingHamburger={() => (drawerOpen = true)}
    {locales} {activeLocale}    <!-- hidden in collapsed (keepLocaleOnCollapse defaults to false) -->
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
