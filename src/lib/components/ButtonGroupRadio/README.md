# ButtonGroupRadio

A radio button group styled as a segmented button toggle. Supports keyboard navigation and async validation.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `(string \| FieldRadiosOption)[]` | - | Array of options |
| `value` | `string` | - | Selected value (bindable) |
| `activeIndex` | `number` | - | Selected index (bindable) |
| `size` | `"sm" \| "md" \| "lg" \| string` | `"md"` | Button size |
| `disabled` | `boolean` | `false` | Disable all buttons |
| `tabindex` | `number` | `0` | Tab index for active button |
| `class` | `string` | - | CSS for container |
| `classButton` | `string` | - | CSS for all buttons |
| `classButtonActive` | `string` | - | CSS for active button |
| `style` | `string` | - | Inline styles for container |
| `onButtonClick` | `(index, coll) => Promise<boolean> \| boolean` | - | Async validation hook (return `false` to prevent) |
| `buttonProps` | `(index, coll) => Record<string, any>` | - | Dynamic props per button |

## Option Format

```ts
// Simple string
'Option A'

// Or object
{
  label: 'Option A',
  value: 'a'  // optional, defaults to label
}
```

## Usage

### Basic

```svelte
<script lang="ts">
  import { ButtonGroupRadio } from 'stuic';

  let selected = $state('monthly');
</script>

<ButtonGroupRadio
  options={['daily', 'weekly', 'monthly']}
  bind:value={selected}
/>

<p>Selected: {selected}</p>
```

### With Object Options

```svelte
<script lang="ts">
  let plan = $state('pro');
</script>

<ButtonGroupRadio
  options={[
    { label: 'Free', value: 'free' },
    { label: 'Pro', value: 'pro' },
    { label: 'Enterprise', value: 'enterprise' }
  ]}
  bind:value={plan}
/>
```

### With Async Validation

```svelte
<script lang="ts">
  let value = $state('a');
</script>

<ButtonGroupRadio
  options={['a', 'b', 'c']}
  bind:value
  onButtonClick={async (index, coll) => {
    // Return false to prevent selection
    if (index === 2) {
      alert('Option C is disabled');
      return false;
    }
  }}
/>
```

## Keyboard Navigation

- **Arrow Left/Up**: Select previous option
- **Arrow Right/Down**: Select next option
