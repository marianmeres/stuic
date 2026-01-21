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
| `FieldKeyValues` | Key-value pairs editor with JSON serialization |
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

### Key-Value Pairs

```svelte
<script lang="ts">
  import { FieldKeyValues } from 'stuic';

  // Value is a JSON string of {key: value, key2: value2, ...}
  let headers = $state('{}');
</script>

<FieldKeyValues
  label="HTTP Headers"
  description="Add custom headers as key-value pairs"
  bind:value={headers}
  name="headers"
  required
/>
```

#### FieldKeyValues Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `"{}"` | JSON string of `{key: value, ...}` (bindable) |
| `name` | `string` | - | Form field name |
| `keyPlaceholder` | `string` | `"Key"` | Placeholder for key input |
| `valuePlaceholder` | `string` | `"Value"` | Placeholder for value textarea |
| `addLabel` | `string` | `"Add"` | Label for add button |
| `emptyMessage` | `string` | `"No entries"` | Message when no entries |
| `classEntry` | `string` | - | CSS for each entry row |
| `classKeyInput` | `string` | - | CSS for key inputs |
| `classValueInput` | `string` | - | CSS for value textareas |
| `onChange` | `(value: string) => void` | - | Callback on value change |

Features:
- Add/remove key-value pairs with + and trash buttons
- Values support any JSON type (auto-detected): plain text → string, `42` → number, `true` → boolean, `{"a":1}` → object
- Duplicate keys are validated and rejected on form submission
- Value is serialized as plain object: `{key: value, key2: value2}`
- Validation at top level only (not individual pairs)

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

## CSS Variables

### Component Tokens

Override globally in `:root` or locally via `style` prop:

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-input-radius` | `--radius-md` | Border radius |
| `--stuic-input-font-family` | `--font-sans` | Font family |
| `--stuic-input-transition` | `150ms` | Transition duration |
| `--stuic-input-ring-width` | `4px` | Focus ring width |
| `--stuic-input-ring-color` | `--stuic-color-ring` | Focus ring color |
| `--stuic-input-accent` | `--stuic-color-primary` | Accent color |
| `--stuic-input-accent-error` | `--stuic-color-destructive` | Error/validation color |

### Color Tokens

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-input-bg` | `--stuic-color-input` | Background color |
| `--stuic-input-border` | `--stuic-color-border` | Border color |
| `--stuic-input-border-focus` | `--stuic-input-accent` | Border color on focus |
| `--stuic-input-text` | `--stuic-color-foreground` | Text color |
| `--stuic-input-placeholder` | `--stuic-color-muted-foreground` | Placeholder color |

### Size Tokens

Each size (sm, md, lg) has corresponding tokens:

| Variable | sm | md | lg |
|----------|----|----|-----|
| `--stuic-input-padding-x-{size}` | `calc(--spacing * 2.5)` | `calc(--spacing * 3)` | `calc(--spacing * 4)` |
| `--stuic-input-padding-y-{size}` | `calc(--spacing * 2)` | `calc(--spacing * 2.5)` | `calc(--spacing * 3)` |
| `--stuic-input-font-size-{size}` | `--text-sm` | `--text-base` | `--text-lg` |
| `--stuic-input-min-height-{size}` | `2.5rem` | `2.75rem` | `3rem` |

### Checkbox/Radio Tokens

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-checkbox-size` | `1.25rem` | Checkbox size |
| `--stuic-checkbox-radius` | `--radius-sm` | Checkbox border radius |
| `--stuic-radio-size` | `1rem` | Radio button size |
| `--stuic-checkbox-bg` | `--stuic-color-muted` | Unchecked background |
| `--stuic-checkbox-border` | `--stuic-color-border` | Unchecked border |
| `--stuic-checkbox-checked-bg` | `--stuic-input-accent` | Checked background |
| `--stuic-checkbox-checked-border` | `--stuic-input-accent` | Checked border |

### Range Input Tokens

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-input-range-thumb-size` | `18px` | Slider thumb size |
| `--stuic-input-range-track-height` | `4px` | Track height |
| `--stuic-input-range-track-radius` | `18px` | Track border radius |
| `--stuic-input-range-track-bg` | `--stuic-color-muted` | Track background |

### Customization Examples

```css
/* Global: Make all inputs have pill shape */
:root {
  --stuic-input-radius: 9999px;
}

/* Global: Custom accent color */
:root {
  --stuic-input-accent: var(--color-violet-600);
}
```

```svelte
<!-- Local: Custom radius for one input -->
<FieldInput
  label="Search"
  style="--stuic-input-radius: 9999px;"
/>
```

## Data Attributes

Components use data attributes for CSS styling:

- `data-size` - The size value ("sm", "md", "lg")

## Class Props

| Prop | Target |
|------|--------|
| `class` | Root container |
| `classInput` | Input element |
| `classLabel` | Label element |
| `classLabelBox` | Label container |
| `classInputBox` | Input container (outer) |
| `classInputBoxWrap` | Input wrapper (inner, has border) |
| `classInputBoxWrapInvalid` | Input wrapper when invalid |
| `classDescBox` | Description container |
| `classBelowBox` | Below slot container |
