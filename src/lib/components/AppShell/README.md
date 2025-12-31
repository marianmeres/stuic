# AppShell

A complete application layout shell with flexible regions: rail, header, sidebars, main content area with page header/footer, and footer.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | `"shell"` | Shell element ID |
| `scrollbarGutter` | `"auto" \| "stable" \| "both-edges"` | `"auto"` | Scrollbar gutter behavior |
| `pageFlexGrow` | `0-5` | `3` | Flex grow ratio for main page area |
| `class` | `string` | - | CSS for shell container |
| `railClass` | `string` | - | CSS for rail (vertical sidebar) |
| `headerClass` | `string` | - | CSS for top header |
| `sidebarLeftClass` | `string` | - | CSS for left sidebar |
| `pageClass` | `string` | - | CSS for page container |
| `pageHeaderClass` | `string` | - | CSS for page header |
| `pageMainClass` | `string` | - | CSS for main content |
| `pageFooterClass` | `string` | - | CSS for page footer |
| `sidebarRightClass` | `string` | - | CSS for right sidebar |
| `footerClass` | `string` | - | CSS for bottom footer |

## Snippets

| Snippet | Description |
|---------|-------------|
| `rail` | Narrow vertical sidebar (icon navigation) |
| `header` | Top header bar |
| `sidebarLeft` | Left sidebar content |
| `pageHeader` | Header within main page area |
| `children` | Main page content |
| `pageFooter` | Footer within main page area |
| `sidebarRight` | Right sidebar content |
| `footer` | Bottom footer bar |

## Bindable Elements

All regions expose bindable element refs: `elShell`, `elRail`, `elHeader`, `elSidebarLeft`, `elPage`, `elPageHeader`, `elPageMain`, `elPageFooter`, `elSidebarRight`, `elFooter`.

## Usage

### Basic Layout

```svelte
<script lang="ts">
  import { AppShell, appShellSetHtmlBodyHeight } from 'stuic';
  import { onMount } from 'svelte';

  onMount(appShellSetHtmlBodyHeight);
</script>

<AppShell>
  {#snippet header()}
    <nav class="p-4 border-b">My App</nav>
  {/snippet}

  {#snippet sidebarLeft()}
    <aside class="w-64 p-4 border-r">Navigation</aside>
  {/snippet}

  <main class="p-4">
    Main content goes here
  </main>

  {#snippet footer()}
    <footer class="p-4 border-t">Footer</footer>
  {/snippet}
</AppShell>
```

### With Rail Navigation

```svelte
<AppShell pageFlexGrow={3}>
  {#snippet rail()}
    <div class="w-16 h-full bg-gray-900 flex flex-col items-center py-4">
      <button>Icon 1</button>
      <button>Icon 2</button>
    </div>
  {/snippet}

  {#snippet sidebarLeft()}
    <nav class="w-64">Expanded menu</nav>
  {/snippet}

  Content area
</AppShell>
```

## Helper Function

```ts
import { appShellSetHtmlBodyHeight } from 'stuic';
import { onMount } from 'svelte';

// Sets body height to 100vh with overflow hidden
// Returns cleanup function automatically
onMount(appShellSetHtmlBodyHeight);
```
