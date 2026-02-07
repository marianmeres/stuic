# API

Complete API reference for `@marianmeres/stuic`.

---

## Components

All components support these universal props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `unstyled` | `boolean` | `false` | Skip all default styling |
| `class` | `string` | `undefined` | Additional CSS classes (merged via `twMerge`) |
| `el` | `HTMLElement` | `undefined` | Bindable element reference |

### Intent + Variant System

Components that support `intent` and `variant` props (Button, DismissibleMessage, etc.):

**Intent** (semantic color):

| Value | Purpose |
|-------|---------|
| `primary` | Main actions |
| `accent` | Secondary emphasis |
| `destructive` | Dangerous actions |
| `warning` | Caution states |
| `success` | Positive states |

**Variant** (visual treatment):

| Value | Purpose |
|-------|---------|
| `solid` | Filled background, contrasting text |
| `outline` | Transparent bg, colored border/text |
| `ghost` | Transparent bg, subtle hover |
| `soft` | Muted tinted background |
| `link` | Minimal, text decoration only |

```svelte
<Button intent="destructive" variant="outline">Delete</Button>
```

### Layout & Overlays

#### `AppShell`

Page layout with header, sidebar, and content areas.

```svelte
<AppShell>
  {#snippet header()}<nav>Header</nav>{/snippet}
  {#snippet sidebar()}<aside>Sidebar</aside>{/snippet}
  <main>Content</main>
</AppShell>
```

#### `Modal`

Overlay container with backdrop. Controlled programmatically.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Bindable open state |
| `closeOnBackdropClick` | `boolean` | `true` | Close when clicking backdrop |
| `closeOnEscape` | `boolean` | `true` | Close on Escape key |

```svelte
<Modal bind:open={isOpen}>
  {#snippet header()}<h2>Title</h2>{/snippet}
  <p>Content</p>
  {#snippet footer()}<Button onclick={() => isOpen = false}>Close</Button>{/snippet}
</Modal>
```

#### `ModalDialog`

Pre-styled modal dialog with title and action buttons.

#### `Drawer`

Side panel overlay (left or right).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Bindable open state |
| `side` | `"left" \| "right"` | `"left"` | Panel side |

#### `Backdrop`

Semi-transparent overlay background.

#### `Collapsible`

Expandable/collapsible content sections.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Bindable open state |

#### `SlidingPanels`

Panel-based navigation with slide transitions.

#### `Nav`

Navigation wrapper component.

---

### Interactive

#### `Button`

Action button with intent/variant/size system.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `intent` | `"primary" \| "accent" \| "destructive" \| "warning" \| "success"` | `"primary"` | Semantic color |
| `variant` | `"solid" \| "outline" \| "ghost" \| "soft" \| "link"` | `"solid"` | Visual treatment |
| `size` | `"xs" \| "sm" \| "md" \| "lg" \| "xl"` | `"md"` | Button size |
| `icon` | `IconRenderFn` | `undefined` | Icon render function |
| `iconRight` | `IconRenderFn` | `undefined` | Right-side icon |
| `loading` | `boolean` | `false` | Show loading spinner |
| `disabled` | `boolean` | `false` | Disable button |

```svelte
<Button intent="primary" variant="solid" size="lg">
  Click me
</Button>

<Button intent="destructive" variant="outline" icon={iconTrash}>
  Delete
</Button>
```

#### `ButtonGroupRadio`

Toggle button group for single selection.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `""` | Bindable selected value |
| `items` | `Array<{ value, label }>` | `[]` | Options |

```svelte
<ButtonGroupRadio
  bind:value={selected}
  items={[
    { value: "a", label: "Option A" },
    { value: "b", label: "Option B" },
  ]}
/>
```

#### `Switch`

Boolean toggle switch.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | `false` | Bindable checked state |

```svelte
<Switch bind:checked={enabled} />
```

#### `TwCheck`

Styled checkbox/radio replacement.

#### `DropdownMenu`

Popover-based dropdown menu.

#### `CommandMenu`

Keyboard-driven command palette (Ctrl+K style).

#### `TypeaheadInput`

Autocomplete input with async search support.

#### `ListItemButton`

Styled list item with interactive states.

---

### Form Fields

All form fields share common props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `undefined` | Field label |
| `error` | `string` | `undefined` | Error message |
| `hint` | `string` | `undefined` | Help text |
| `required` | `boolean` | `false` | Required indicator |

#### `FieldInput`

Text input field with label, error, and hint support.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `""` | Bindable input value |
| `type` | `string` | `"text"` | Input type |

```svelte
<FieldInput bind:value={name} label="Name" required />
```

#### `FieldTextarea`

Multi-line text input.

#### `FieldSelect`

Dropdown select field.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `""` | Bindable selected value |
| `options` | `Array<{ value, label }>` | `[]` | Select options |

#### `FieldCheckbox`

Checkbox field with label.

#### `FieldRadios`

Radio button group.

#### `FieldFile`

File upload input.

#### `FieldSwitch`

Form-wrapped switch toggle.

#### `FieldOptions`

Multi-select options field.

#### `FieldAssets`

File/asset management field with preview.

#### `FieldKeyValues`

Key-value pair editor.

#### `FieldInputLocalized`

Multi-language input field.

#### `FieldLikeButton`

Toggle button styled as a "like" action.

#### `Fieldset`

Form field grouping with legend.

---

### Feedback & Notifications

#### `Notifications`

Toast notification system.

```svelte
<script>
  import { Notifications, createNotificationsStore } from "@marianmeres/stuic";
  const notifications = createNotificationsStore();
</script>

<Notifications store={notifications} />

<Button onclick={() => notifications.add({ text: "Saved!", type: "success" })}>
  Notify
</Button>
```

#### `AlertConfirmPrompt`

Dialog factory for alert, confirm, and prompt dialogs.

#### `DismissibleMessage`

Closeable message banner with intent styling.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `intent` | `"primary" \| "accent" \| "destructive" \| "warning" \| "success"` | `"primary"` | Semantic color |
| `dismissible` | `boolean` | `true` | Show close button |

```svelte
<DismissibleMessage intent="warning">
  Please review your changes.
</DismissibleMessage>
```

#### `Progress`

Progress bar.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | `0` | Current progress (0-100) |

#### `Spinner`

Loading spinner indicator.

#### `Skeleton`

Loading placeholder with animation.

---

### Display

#### `Avatar`

User avatar with fallback to initials or icon.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | `undefined` | Image source |
| `alt` | `string` | `""` | Alt text / name for initials fallback |
| `size` | `number` | `40` | Size in pixels |

```svelte
<Avatar src="/photo.jpg" alt="John Doe" size={48} />
<Avatar alt="John Doe" /> <!-- Shows "JD" initials -->
```

#### `KbdShortcut`

Keyboard shortcut display.

```svelte
<KbdShortcut keys={["Ctrl", "K"]} />
```

#### `Carousel`

Image/content slider with navigation.

#### `AnimatedElipsis`

Animated loading dots ("...").

#### `ThemePreview`

Theme color swatch preview.

---

### Utility Components

#### `ColorScheme`

Dark/light mode toggle management.

#### `Thc`

Theme-aware container component.

#### `HoverExpandableWidth`

Element that expands width on hover.

#### `AssetsPreview`

Asset/file preview grid.

#### `X`

Close button (X icon).

---

## Actions

Svelte use-directives for reusable DOM behavior. Import from `@marianmeres/stuic`.

### `validate`

Form field validation with i18n support.

```svelte
<input
  use:validate={() => ({
    enabled: true,
    customValidator: (value) => {
      if (!value) return "Required";
      if (value.length < 3) return "Min 3 characters";
    },
    setValidationResult: (result) => {
      validationState = result;
    }
  })}
/>
```

### `focusTrap`

Trap keyboard focus within an element (for modals/dialogs).

```svelte
<div use:focusTrap>
  <button>First</button>
  <button>Last</button>
</div>
```

### `autogrow`

Auto-resize textarea height to match content.

```svelte
<textarea use:autogrow />
```

### `autoscroll`

Auto-scroll a container to the bottom on content changes.

```svelte
<div use:autoscroll>
  {#each messages as msg}<p>{msg}</p>{/each}
</div>
```

### `fileDropzone`

Drag-and-drop file handling.

```svelte
<div
  use:fileDropzone={() => ({
    accept: "image/*",
    multiple: true,
    onDrop: (files) => handleFiles(files),
  })}
>
  Drop files here
</div>
```

### `highlightDragover`

Visual feedback (class toggle) on drag-over.

```svelte
<div use:highlightDragover>Drop target</div>
```

### `resizableWidth`

Make an element's width draggable.

```svelte
<div use:resizableWidth={() => ({ minWidth: 200, maxWidth: 600 })}>
  Resizable
</div>
```

### `trim`

Auto-trim whitespace from input values.

```svelte
<input use:trim />
```

### `typeahead`

Advanced autocomplete behavior for inputs.

### `onSubmitValidityCheck`

Form-level submit validation.

```svelte
<form use:onSubmitValidityCheck>
  <input required />
  <button type="submit">Submit</button>
</form>
```

### `popover`

Anchored popover positioning.

```svelte
<button use:popover={{ content: "Popover text" }}>
  Hover me
</button>
```

### `tooltip`

Tooltip display from `aria-label`.

```svelte
<button use:tooltip aria-label="Save changes">
  Save
</button>
```

---

## Utilities

Import from `@marianmeres/stuic`.

### Reactive State

#### `localStorageState(key, initial)`

Persist reactive state to localStorage.

**Parameters:**
- `key` (string) — Storage key
- `initial` (T) — Initial value

**Returns:** `{ value: T }` — Reactive state object

```ts
import { localStorageState } from "@marianmeres/stuic";
let theme = localStorageState("theme", "light");
theme.value = "dark"; // Persisted and reactive
```

#### `sessionStorageState(key, initial)`

Same as `localStorageState` but uses sessionStorage.

#### `breakpoint()`

Reactive responsive breakpoint detection.

```ts
import { breakpoint } from "@marianmeres/stuic";
let bp = breakpoint();
// bp.current — "sm" | "md" | "lg" | "xl" | "2xl"
```

#### `devicePointer()`

Detect pointer type (mouse/touch).

#### `prefersReducedMotion()`

Detect user's reduced motion preference.

#### `observeExists(selector)`

Reactively observe whether a DOM element matching a selector exists.

#### `inputHistory(initial)`

Input undo/redo history manager.

#### `switchState(initial)`

Toggle state factory.

### DOM

#### `qsa(selector, parent?)`

Type-safe `querySelectorAll` wrapper.

**Parameters:**
- `selector` (string) — CSS selector
- `parent` (Element, optional) — Parent element. Default: `document`

**Returns:** `Element[]`

#### `bodyScrollLocker`

Lock/unlock body scroll (for modals).

```ts
import { bodyScrollLocker } from "@marianmeres/stuic";
bodyScrollLocker.lock();
bodyScrollLocker.unlock();
```

#### `anchorName(prefix?)`

Generate CSS anchor-positioning names.

#### `getId(prefix?)`

Generate unique DOM IDs.

### String & Data

#### `ucfirst(str)`

Capitalize first letter.

#### `nl2br(str)`

Convert newlines to `<br>` tags.

#### `unaccent(str)`

Remove diacritics from string.

#### `escapeRegex(str)`

Escape regex special characters.

#### `strHash(str)`

Simple string hash function.

#### `tr(key, translations, params?)`

Simple i18n translation helper.

```ts
import { tr } from "@marianmeres/stuic";
const t = tr("greeting", { en: "Hello {name}", sk: "Ahoj {name}" }, { name: "World" });
```

#### `replaceMap(str, map)`

Bulk string replacement.

### Functions

#### `debounce(fn, delay)`

Debounce function calls.

**Parameters:**
- `fn` (Function) — Function to debounce
- `delay` (number) — Delay in milliseconds

**Returns:** Debounced function with `.cancel()` method

```ts
import { debounce } from "@marianmeres/stuic";
const search = debounce((q: string) => fetchResults(q), 300);
```

#### `throttle(fn, delay)`

Throttle function calls.

#### `sleep(ms)`

Promise-based delay.

```ts
import { sleep } from "@marianmeres/stuic";
await sleep(1000);
```

#### `seconds(n)`

Convert seconds to milliseconds.

#### `eventEmitter()`

Pub/sub event pattern.

```ts
import { eventEmitter } from "@marianmeres/stuic";
const emitter = eventEmitter();
emitter.on("change", (data) => console.log(data));
emitter.emit("change", { value: 42 });
```

#### `eventModifiers`

Keyboard/mouse event helpers (e.g., `onEnter`, `onEscape`).

### Type Checks

#### `isNullish(value)`

Check if value is `null` or `undefined`.

#### `isPlainObject(value)`

Check if value is a plain object.

#### `isImage(file)`

Check if a file is an image (by MIME type or extension).

#### `isBrowser`

Boolean — `true` in browser environment.

#### `isMac`

Boolean — `true` on macOS.

### Data Handling

#### `maybeJsonParse(str)`

Safe `JSON.parse` — returns `undefined` on failure instead of throwing.

#### `maybeJsonStringify(value)`

Safe `JSON.stringify`.

#### `toInteger(value, fallback?)`

Safe integer conversion.

#### `omit(obj, keys)`

Omit keys from object.

#### `pick(obj, keys)`

Pick keys from object.

### Visual

#### `twMerge(...classes)`

Tailwind-aware class merging. Handles conflicts correctly.

```ts
import { twMerge } from "@marianmeres/stuic";
twMerge("px-4 py-2", "px-6"); // => "py-2 px-6"
```

#### `colors`

Color manipulation utilities.

#### `avatarColors(name)`

Generate deterministic avatar colors from a name string.

#### `paint(hue)`

HSL color generation.

#### `svgCircle(radius, strokeWidth)`

Generate SVG circle path data.

#### `oscillate(min, max, step)`

Value oscillation for animations.

### Files

#### `fileFromBlobUrl(blobUrl, filename)`

Convert a blob URL to a File object.

#### `forceDownload(url, filename)`

Trigger browser file download.

#### `preloadImg(src)`

Preload an image and return a Promise.

#### `getFileTypeLabel(filename)`

Human-readable file type label from filename.

### Design Tokens

#### `generateThemeCss(schema, prefix?)`

Generate a complete CSS string for a theme, including both light and dark mode blocks.

**Parameters:**
- `schema` (ThemeSchema) — Theme definition with `light` and optional `dark` modes
- `prefix` (string, optional) — CSS variable prefix. Default: `"stuic-"`

**Returns:** `string` — Complete CSS with `:root {}` and `:root.dark {}` blocks

**Example:**
```ts
import type { ThemeSchema } from '@marianmeres/stuic';
import { generateThemeCss } from '@marianmeres/stuic';
import stone from '@marianmeres/stuic/themes/stone';

const custom: ThemeSchema = {
  light: {
    ...stone.light,
    colors: {
      ...stone.light.colors,
      intent: {
        ...stone.light.colors.intent,
        primary: { DEFAULT: '#3b82f6', foreground: '#ffffff', hover: '#2563eb' },
      },
    },
  },
  dark: stone.dark,
};

const css = generateThemeCss(custom);
```

#### `generateCssTokens(schema, prefix?, mode?)`

Lower-level function: convert a single `TokenSchema` to a token record.

**Parameters:**
- `schema` (TokenSchema) — Single-mode schema (light or dark)
- `prefix` (string, optional) — CSS variable prefix. Default: `"stuic-"`
- `mode` (`"light" | "dark"`, optional) — Affects surface-intent derivation. Default: `"light"`

**Returns:** `GeneratedTokens` — `Record<string, string>` of CSS custom property names to values

#### `toCssString(tokens, selector?)`

Format a token record as a CSS selector block.

**Parameters:**
- `tokens` (GeneratedTokens) — Token record from `generateCssTokens`
- `selector` (string, optional) — CSS selector. Default: `":root"`

**Returns:** `string` — CSS block string

#### `createDarkOverride(baseTokens, overrides)`

Create a filtered dark mode token set from base tokens and overrides.

**Parameters:**
- `baseTokens` (GeneratedTokens) — Light mode tokens (used as key filter)
- `overrides` (Partial\<GeneratedTokens\>) — Dark mode values

**Returns:** `GeneratedTokens`

---

## Icons

Re-exported icon render functions from `@marianmeres/icons-fns`. Import from `@marianmeres/stuic`.

### File Type Icons

`iconFile`, `iconFileBinary`, `iconFileCode`, `iconFileImage`, `iconFileMusic`, `iconFilePdf`, `iconFileRichtext`, `iconFileSlides`, `iconFileSpreadsheet`, `iconFileText`, `iconFileWord`, `iconFileZip`

### Alert Icons

`iconAlertSuccess`, `iconAlertInfo`, `iconAlertError`, `iconAlertWarning`, `iconRefresh`

### Action Icons

`iconArrowDown`, `iconArrowLeft`, `iconArrowRight`, `iconArrowUp`, `iconDownload`, `iconMinus`, `iconPlus`, `iconTrash`, `iconZoomIn`, `iconZoomOut`

### UI Control Icons

`iconCheck`, `iconChevronDown`, `iconChevronLeft`, `iconChevronRight`, `iconChevronUp`, `iconCircle`, `iconDot`, `iconEllipsisVertical`, `iconLanguages`, `iconMenu`, `iconSearch`, `iconSettings`, `iconSquare`, `iconUser`, `iconX`

---

## Types

All components export their Props type:

```ts
import type {
  ButtonProps,
  ModalProps,
  FieldInputProps,
  ListItemButtonProps,
} from "@marianmeres/stuic";
```

Naming pattern: `{ComponentName}Props`

Additional exported types include:
- `FieldAsset`, `FieldAssetUrlObj`, `FieldAssetWithBlobUrl` — Asset field types
- `FieldOption` — Option type for FieldOptions
- `KeyValueEntry` — Entry type for FieldKeyValues
- `ButtonVariant`, `ButtonSize` — Button enum types

### Theme Types

```ts
import type {
  ThemeSchema,     // { light: TokenSchema; dark?: TokenSchema }
  TokenSchema,     // Core schema for a single mode (light or dark)
  ColorPair,       // { DEFAULT, foreground, hover?, active?, foregroundHover?, foregroundActive? }
  ColorValue,      // { DEFAULT, hover?, active? }
  SingleColor,     // string | ColorValue
  IntentColorKey,  // "primary" | "accent" | "destructive" | "warning" | "success"
  RolePairedKey,   // "background" | "surface" | "muted"
  RoleSingleKey,   // "foreground" | "border" | "input" | "ring"
  GeneratedTokens, // Record<string, string>
} from '@marianmeres/stuic';
```

---

## Design Tokens

### Global Theme Tokens

Defined in theme CSS files (`src/lib/themes/css/`). Override in `:root {}`.

#### Intent Colors

Each intent (`primary`, `accent`, `destructive`, `warning`, `success`) provides:

| Token | Purpose |
|-------|---------|
| `--stuic-color-{intent}` | Base color |
| `--stuic-color-{intent}-hover` | Hover state |
| `--stuic-color-{intent}-active` | Active/pressed state |
| `--stuic-color-{intent}-foreground` | Text on base |
| `--stuic-color-{intent}-foreground-hover` | Text on hover |
| `--stuic-color-{intent}-foreground-active` | Text on active |

#### Surface Intent Colors

Derived via `color-mix()` for callouts/alerts:

| Token | Purpose |
|-------|---------|
| `--stuic-color-surface-{intent}` | 15% tint of intent on background |
| `--stuic-color-surface-{intent}-foreground` | Contrast text |
| `--stuic-color-surface-{intent}-border` | 30% tint border |

#### Role Colors

| Token | Purpose | Variants |
|-------|---------|----------|
| `--stuic-color-background` | Page background | `-hover`, `-active`, `-foreground` |
| `--stuic-color-surface` | Cards, modals | `-hover`, `-active`, `-foreground` |
| `--stuic-color-surface-1` | Deeper surface | `-hover`, `-active`, `-foreground` |
| `--stuic-color-muted` | De-emphasized | `-hover`, `-active`, `-foreground` |
| `--stuic-color-foreground` | Default text | `-hover`, `-active` |
| `--stuic-color-border` | Default borders | `-hover`, `-active` |
| `--stuic-color-input` | Form field bg | `-hover`, `-active` |
| `--stuic-color-ring` | Focus ring | |

### Component Tokens

Each component defines customization tokens. Override globally in `:root {}` or locally via `style` attribute.

| Component | Prefix | Key Tokens |
|-----------|--------|------------|
| Button | `--stuic-button-*` | `bg`, `text`, `border`, `ring-color`, `radius`, `padding-x-{size}` |
| Switch | `--stuic-switch-*` | `accent` |
| Input | `--stuic-input-*` | `accent`, `accent-error` |
| Progress | `--stuic-progress-*` | `bg`, `accent` |
| ListItemButton | `--stuic-list-item-button-*` | `bg`, `text`, `border`, `bg-hover`, `text-hover` |
| ButtonGroupRadio | `--stuic-button-group-*` | `bg`, `text`, `border`, `accent`, `bg-active`, `text-active` |
| TabbedMenu | `--stuic-tabbed-menu-*` | `tab-bg`, `tab-text`, `tab-bg-active`, `tab-text-active`, `border` |
| DismissibleMessage | `--stuic-dismissible-message-*` | `bg`, `text`, `border` |
| Notifications | `--stuic-notification-*` | `bg`, `text`, `border` |
| Tooltip | `--stuic-tooltip-*` | `bg`, `text` |
| Popover | `--stuic-popover-*` | `bg`, `text`, `border` |
| Skeleton | `--stuic-skeleton-*` | `bg`, `bg-highlight`, `duration` |

### CSS Variable Naming Convention

```
--stuic-{component}-{element?}-{property}-{state?}
```

| Segment | Examples |
|---------|----------|
| component | `button`, `list-item-button`, `modal` (full names, no abbreviations) |
| element | `track`, `thumb`, `icon` (optional) |
| property | `bg`, `text`, `border`, `ring`, `shadow`, `radius`, `padding` |
| state | `hover`, `active`, `focus`, `disabled`, `error` |

### Available Themes (26)

Default theme: `stone`.

```ts
// Import pre-built CSS
import '@marianmeres/stuic/themes/css/blue-orange.css';

// Import theme definition object (to extend/customize)
import stone from '@marianmeres/stuic/themes/stone';
```

stone, gray, blue-orange, cyan-red, cyan-slate, emerald-amber-forest, emerald-pink, fuchsia-emerald, indigo-amber, lime-fuchsia-neon, orange-pink-sunset, pink-emerald, pink-teal, purple-yellow, rainbow, red-blue, red-cyan, red-sky, rose-teal, sky-amber, slate-cyan, slate-teal-ocean, stone-orange-earth, teal-rose, violet-lime, violet-rose-dusk

### Dark Mode

Dark mode is controlled by adding `class="dark"` to the `<html>` element. Theme tokens automatically switch values. No `dark:` Tailwind prefix needed.

```css
/* Override dark mode tokens */
:root.dark {
  --stuic-color-background: var(--color-stone-900);
  --stuic-color-foreground: var(--color-stone-50);
}
```
