# AvatarInitials

A circular avatar component displaying initials extracted from names or emails, with optional auto-generated colors and size presets.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `input` | `string` | - | String to extract initials from (name, initials, or email) |
| `hashSource` | `string` | - | Optional string for color hash calculation (falls back to `input`) |
| `size` | `"sm" \| "md" \| "lg" \| "xl" \| string` | `"md"` | Size preset or custom Tailwind class |
| `onclick` | `(event: MouseEvent) => void` | - | Click handler (renders as button when provided) |
| `bg` | `string` | - | Background color Tailwind class (ignored if autoColor) |
| `textColor` | `string` | - | Text color Tailwind class (ignored if autoColor) |
| `autoColor` | `boolean` | `false` | Generate deterministic pastel colors from input |
| `class` | `string` | - | Additional CSS classes |
| `el` | `HTMLDivElement \| HTMLButtonElement` | - | Element reference (bindable) |

## Size Presets

| Size | Dimensions | Font Size |
|------|------------|-----------|
| `sm` | 32px (size-8) | text-xs |
| `md` | 40px (size-10) | text-sm |
| `lg` | 56px (size-14) | text-base |
| `xl` | 64px (size-16) | text-lg |

Custom sizes can be passed as Tailwind classes: `size="size-20 text-2xl"`

## Initials Extraction Logic

The component intelligently extracts up to 2 characters from the input:

1. **Email addresses** (`john.doe@example.com`):
   - Splits username by `.`, `_`, `+`, `-`
   - Takes first letter of each part
   - Result: `JD`

2. **Full names** (`John Doe`):
   - Splits by whitespace
   - Takes first letter of each word
   - Result: `JD`

3. **Short strings** (`AB` or `Jo`):
   - Takes first 2 characters
   - Result: `AB` or `JO`

4. **Empty input**:
   - Returns `?`

All initials are uppercase.

## Auto Color Generation

When `autoColor` is enabled, the component generates deterministic pastel colors:

- Colors are derived from a hash of `hashSource` or `input`
- Same input always produces the same color
- Colors are designed as accessible pastel tones
- Text color automatically contrasts with background

## Usage

### Basic Display

```svelte
<script lang="ts">
  import { AvatarInitials } from 'stuic';
</script>

<AvatarInitials input="John Doe" />
<AvatarInitials input="jane.smith@example.com" />
<AvatarInitials input="AB" />
```

### Size Variants

```svelte
<AvatarInitials input="JD" size="sm" />
<AvatarInitials input="JD" size="md" />
<AvatarInitials input="JD" size="lg" />
<AvatarInitials input="JD" size="xl" />

<!-- Custom size -->
<AvatarInitials input="JD" size="size-24 text-3xl" />
```

### Auto Color (Deterministic)

```svelte
<!-- Same email always produces same color -->
<AvatarInitials input="john@example.com" autoColor />
<AvatarInitials input="jane@example.com" autoColor />

<!-- Use ID for consistent color regardless of display name -->
<AvatarInitials input="John Doe" hashSource="user-123" autoColor />
```

### Custom Colors

```svelte
<AvatarInitials
  input="JD"
  bg="bg-blue-500"
  textColor="text-white"
/>

<AvatarInitials
  input="AB"
  bg="bg-gradient-to-br from-purple-500 to-pink-500"
  textColor="text-white"
/>
```

### Clickable Avatar

```svelte
<script lang="ts">
  function handleClick() {
    console.log('Avatar clicked');
  }
</script>

<AvatarInitials
  input="john@example.com"
  autoColor
  onclick={handleClick}
/>
```

### In Header Dropdown

```svelte
<script lang="ts">
  import { AvatarInitials, DropdownMenu } from 'stuic';
</script>

<DropdownMenu
  items={[
    { type: "action", id: "profile", label: "View Profile" },
    { type: "action", id: "logout", label: "Logout" },
  ]}
>
  {#snippet trigger({ toggle })}
    <AvatarInitials
      input={userEmail}
      onclick={toggle}
      autoColor
      class="cursor-pointer hover:ring-2 hover:ring-blue-500"
    />
  {/snippet}
</DropdownMenu>
```

### Avatar List

```svelte
<div class="flex -space-x-2">
  {#each users as user}
    <AvatarInitials
      input={user.email}
      hashSource={user.id}
      autoColor
      size="sm"
      class="ring-2 ring-white"
    />
  {/each}
</div>
```
