# SlidingPanels

A two-panel layout with smooth sliding transitions between panels. Useful for master-detail views, wizard flows, or progressive disclosure.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initial` | `"A" \| "B"` | `"A"` | Initially active panel |
| `duration` | `number` | `300` | Transition duration (ms) |
| `destroyInactive` | `boolean` | `true` | Unmount inactive panel from DOM |
| `class` | `string` | - | CSS for container |
| `panelA` | `Snippet` | - | Content for Panel A (required) |
| `panelB` | `Snippet` | - | Content for Panel B |

## Snippet Props

Both panel snippets receive:

| Prop | Type | Description |
|------|------|-------------|
| `show` | `(panel: "A" \| "B") => Promise<boolean>` | Function to switch panels |
| `active` | `"A" \| "B"` | Currently active panel |
| `inTransition` | `boolean` | Whether transition is in progress |

## Methods

| Method | Description |
|--------|-------------|
| `show(panel)` | Switch to specified panel, returns `false` if already active or transitioning |
| `current()` | Returns object with `active` and `isTransitioning` getters |

## Usage

### Basic Two-Panel Layout

```svelte
<script lang="ts">
  import { SlidingPanels } from 'stuic';
</script>

<div class="h-96">
  <SlidingPanels>
    {#snippet panelA({ show })}
      <div class="p-4">
        <h2>Panel A</h2>
        <button onclick={() => show('B')}>Go to Panel B</button>
      </div>
    {/snippet}

    {#snippet panelB({ show })}
      <div class="p-4">
        <h2>Panel B</h2>
        <button onclick={() => show('A')}>Back to Panel A</button>
      </div>
    {/snippet}
  </SlidingPanels>
</div>
```

### Master-Detail Pattern

```svelte
<script lang="ts">
  let selectedItem = $state(null);
</script>

<SlidingPanels duration={200}>
  {#snippet panelA({ show })}
    <ul>
      {#each items as item}
        <li>
          <button onclick={() => {
            selectedItem = item;
            show('B');
          }}>
            {item.name}
          </button>
        </li>
      {/each}
    </ul>
  {/snippet}

  {#snippet panelB({ show })}
    {#if selectedItem}
      <article>
        <button onclick={() => show('A')}>← Back</button>
        <h1>{selectedItem.name}</h1>
        <p>{selectedItem.description}</p>
      </article>
    {/if}
  {/snippet}
</SlidingPanels>
```

### Keep Inactive Panel in DOM

```svelte
<SlidingPanels destroyInactive={false}>
  {#snippet panelA({ show })}
    <!-- Panel A content persists when switching -->
  {/snippet}
  {#snippet panelB({ show })}
    <!-- Panel B content persists when switching -->
  {/snippet}
</SlidingPanels>
```

### With Component Reference

```svelte
<script lang="ts">
  let panels: SlidingPanels;
</script>

<SlidingPanels bind:this={panels}>
  <!-- panels -->
</SlidingPanels>

<button onclick={() => panels.show('B')}>
  Go to B
</button>
```
