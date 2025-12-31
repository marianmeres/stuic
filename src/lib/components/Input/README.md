# Input

A comprehensive form input system with multiple field components, validation support, and flexible layouts.

## Components

| Component | Description |
|-----------|-------------|
| `FieldInput` | Text, email, password, number, and other input types |
| `FieldTextarea` | Multi-line text input with auto-grow |
| `FieldSelect` | Dropdown select with option groups |
| `FieldCheckbox` | Single checkbox with label |
| `FieldRadios` | Radio button group |
| `FieldSwitch` | Toggle switch field |
| `FieldFile` | File upload input |
| `FieldAssets` | Asset/image upload with preview |
| `FieldLikeButton` | Like/favorite toggle button |
| `Fieldset` | Fieldset with legend |

## Common Props (FieldInput, FieldTextarea, FieldSelect)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string \| number` | - | Field value (bindable) |
| `input` | `HTMLInputElement` | - | Element reference (bindable) |
| `label` | `Snippet \| THC` | - | Field label |
| `description` | `Snippet \| THC` | - | Help text below field |
| `id` | `string` | auto | Element ID |
| `renderSize` | `"sm" \| "md" \| "lg"` | `"md"` | Visual size |
| `required` | `boolean` | `false` | Mark as required |
| `disabled` | `boolean` | `false` | Disable field |
| `validate` | `boolean \| ValidateOptions` | - | Enable validation |
| `labelLeft` | `boolean` | `false` | Position label on left |
| `labelLeftWidth` | `"normal" \| "wide"` | `"normal"` | Left label width |
| `useTrim` | `boolean` | `true` | Auto-trim whitespace |
| `class` | `string` | - | Container CSS |
| `classInput` | `string` | - | Input element CSS |
| `classLabel` | `string` | - | Label CSS |

## Slot Props

| Prop | Type | Description |
|------|------|-------------|
| `labelAfter` | `Snippet \| THC` | Content after label |
| `inputBefore` | `Snippet \| THC` | Content before input (inside wrapper) |
| `inputAfter` | `Snippet \| THC` | Content after input (inside wrapper) |
| `inputBelow` | `Snippet \| THC` | Content below input |
| `below` | `Snippet \| THC` | Content below entire field |

## Usage

### Basic Text Input

```svelte
<script lang="ts">
  import { FieldInput } from 'stuic';

  let name = $state('');
</script>

<FieldInput
  label="Name"
  bind:value={name}
  placeholder="Enter your name"
  required
/>
```

### With Validation

```svelte
<FieldInput
  label="Email"
  type="email"
  bind:value={email}
  validate
  required
/>
```

### Select Field

```svelte
<script lang="ts">
  import { FieldSelect } from 'stuic';

  let country = $state('');
</script>

<FieldSelect
  label="Country"
  bind:value={country}
  options={[
    { label: 'United States', value: 'us' },
    { label: 'Canada', value: 'ca' },
    { label: 'Mexico', value: 'mx' }
  ]}
/>
```

### Grouped Select Options

```svelte
<FieldSelect
  label="City"
  options={[
    { label: 'New York', value: 'ny', optgroup: 'USA' },
    { label: 'Los Angeles', value: 'la', optgroup: 'USA' },
    { label: 'Toronto', value: 'to', optgroup: 'Canada' }
  ]}
/>
```

### Textarea with Auto-grow

```svelte
<script lang="ts">
  import { FieldTextarea } from 'stuic';

  let message = $state('');
</script>

<FieldTextarea
  label="Message"
  bind:value={message}
  useAutogrow
  rows={3}
/>
```

### Checkbox

```svelte
<script lang="ts">
  import { FieldCheckbox } from 'stuic';

  let agreed = $state(false);
</script>

<FieldCheckbox
  label="I agree to the terms"
  bind:checked={agreed}
  required
/>
```

### Input with Addons

```svelte
<FieldInput
  label="Price"
  type="number"
  bind:value={price}
>
  {#snippet inputBefore()}
    <span class="px-3 text-gray-500">$</span>
  {/snippet}
  {#snippet inputAfter()}
    <span class="px-3 text-gray-500">.00</span>
  {/snippet}
</FieldInput>
```

### Left-aligned Label

```svelte
<FieldInput
  label="Username"
  bind:value={username}
  labelLeft
  labelLeftWidth="wide"
/>
```

## Validation

Validation is handled by the `validate` action. Pass `validate={true}` for default HTML5 validation, or pass options:

```svelte
<FieldInput
  label="Custom"
  bind:value={val}
  validate={{
    validatorFn: (el) => {
      if (el.value.length < 3) {
        return { valid: false, message: 'Min 3 characters' };
      }
      return { valid: true };
    }
  }}
/>
```
