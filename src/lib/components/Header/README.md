# Header

Top-bar component with leading slot, project logo, nav items, locale switcher, optional action buttons, avatar, and responsive collapse (either fold into a trailing hamburger dropdown OR hide nav entirely).

## Examples

### App-like collapse: avatar + actions visible, everything else hidden

Common "app shell" pattern: when the header collapses below `collapseThreshold`, the avatar and a few key actions (search, notifications, cart…) remain visible, the trailing hamburger is NOT shown, and the nav items + locale switcher are hidden entirely (the nav typically lives in a drawer triggered by the leading hamburger instead).

| Requirement | Where it's handled | How |
| --- | --- | --- |
| **Avatar stays visible** | [Header.svelte:626](./Header.svelte#L626) — `{#if avatar && !(_isCollapsed && _avatarInDropdown)}` | `_avatarInDropdown` requires `collapseMode === "hamburger"`. In `"hide"` mode it's always `false`, so the avatar always renders. |
| **Action buttons stay visible** | [Header.svelte:585](./Header.svelte#L585) — `<!-- Actions (icon buttons, always visible) -->` | The actions loop has no collapse gating — items render in both modes. |
| **No trailing hamburger** | [Header.svelte:642](./Header.svelte#L642) — `{#if _isCollapsed && _dropdownItems.length > 0}` | In `"hide"` mode, `_dropdownItems` short-circuits to `[]`, so the `{#if}` is false → no trailing hamburger. |
| **Nav items hidden** | [Header.svelte:516](./Header.svelte#L516) — `{#if !_isCollapsed && items.length > 0}` | Inline nav requires `!_isCollapsed`; combined with the empty `_dropdownItems` above, items don't reappear in a dropdown either. |
| **Locale hidden** | [Header.svelte:335](./Header.svelte#L335) — `!_isCollapsed \|\| (collapseMode === "hide" && keepLocaleOnCollapse)` | Default `keepLocaleOnCollapse={false}` hides the locale switcher in collapsed mode. |

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
