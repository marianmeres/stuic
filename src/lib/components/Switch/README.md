# Switch

A toggle switch component with size variants, keyboard support, and optional async validation.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | - | Toggle state (bindable) |
| `size` | `"xs" \| "sm" \| "md" \| "lg" \| "xl" \| string` | `"md"` | Switch size |
| `name` | `string` | - | Form field name for hidden checkbox |
| `label` | `string` | - | Screen reader label (visually hidden) |
| `required` | `boolean` | `false` | Mark as required |
| `disabled` | `boolean` | `false` | Disable toggle |
| `tabindex` | `number` | `0` | Tab index |
| `preHook` | `(current: boolean) => Promise<false \| any>` | - | Async validation (return `false` to prevent) |
| `validate` | `boolean \| ValidateOptions` | - | Enable validation |
| `class` | `string` | - | CSS for switch container |
| `dotClass` | `string` | - | CSS for toggle knob |
| `button` | `HTMLButtonElement` | - | Button element reference (bindable) |

## Snippets

| Snippet | Description |
|---------|-------------|
| `on` | Content inside knob when checked |
| `off` | Content inside knob when unchecked |

## Usage

### Basic Toggle

```svelte
<script lang="ts">
  import { Switch } from 'stuic';

  let enabled = $state(false);
</script>

<Switch bind:checked={enabled} />
<span>{enabled ? 'On' : 'Off'}</span>
```

### Different Sizes

```svelte
<Switch size="xs" />
<Switch size="sm" />
<Switch size="md" />
<Switch size="lg" />
<Switch size="xl" />
```

### With Icons Inside

```svelte
<Switch bind:checked={darkMode}>
  {#snippet on()}
    <span class="text-xs">🌙</span>
  {/snippet}
  {#snippet off()}
    <span class="text-xs">☀️</span>
  {/snippet}
</Switch>
```

### With Async Validation

```svelte
<script lang="ts">
  let premium = $state(false);

  async function checkPremium(current: boolean) {
    if (!current) {
      // Turning on - check if user can enable premium
      const canEnable = await checkSubscription();
      if (!canEnable) {
        alert('Premium subscription required');
        return false; // Prevent toggle
      }
    }
    return true;
  }
</script>

<Switch
  bind:checked={premium}
  preHook={checkPremium}
/>
```

### In a Form

```svelte
<form>
  <label class="flex items-center gap-2">
    <Switch name="notifications" bind:checked={notifications} />
    <span>Enable notifications</span>
  </label>
</form>
```

### Disabled State

```svelte
<Switch checked={true} disabled />
<Switch checked={false} disabled />
```

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-switch-accent` | `--stuic-accent` | Active (checked) color |

### Example Override

```css
:root {
  /* Green switches globally */
  --stuic-switch-accent: var(--color-green-500);
}
```

## Keyboard Support

- **Space**: Toggle switch
- **Enter**: Toggle switch
