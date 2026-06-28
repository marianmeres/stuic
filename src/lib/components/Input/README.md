# Input

A comprehensive form input system with multiple field components, validation support, and flexible layouts.

## Components

| Component         | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `FieldInput`      | Text, email, password, number, and other input types |
| `FieldMoney`      | Money amount stored as integer minor units (cents)   |
| `FieldTextarea`   | Multi-line text input with auto-grow                 |
| `FieldSelect`     | Dropdown select with option groups                   |
| `FieldCheckbox`   | Single checkbox with label                           |
| `FieldRadios`     | Radio button group                                   |
| `FieldSwitch`     | Toggle switch field                                  |
| `FieldFile`       | File upload input                                    |
| `FieldAssets`     | Asset/image upload with preview                      |
| `FieldKeyValues`  | Key-value pairs editor with JSON serialization       |
| `FieldLikeButton` | Like/favorite toggle button                          |
| `Fieldset`        | Fieldset with legend                                 |
| `Honeypot`        | Hidden anti-bot trap field (server-less)             |
| `TimeTrap`        | Anti-bot submit-timing primitive (server-less)       |

## Common Props (FieldInput, FieldTextarea, FieldSelect)

| Prop             | Type                         | Default    | Description                  |
| ---------------- | ---------------------------- | ---------- | ---------------------------- |
| `value`          | `string \| number`           | -          | Field value (bindable)       |
| `input`          | `HTMLInputElement`           | -          | Element reference (bindable) |
| `label`          | `Snippet \| THC`             | -          | Field label                  |
| `description`    | `Snippet \| THC`             | -          | Help text below field        |
| `id`             | `string`                     | auto       | Element ID                   |
| `renderSize`     | `"sm" \| "md" \| "lg"`       | `"md"`     | Visual size                  |
| `required`       | `boolean`                    | `false`    | Mark as required             |
| `disabled`       | `boolean`                    | `false`    | Disable field                |
| `validate`       | `boolean \| ValidateOptions` | -          | Enable validation            |
| `labelLeft`      | `boolean`                    | `false`    | Position label on left       |
| `labelLeftWidth` | `"normal" \| "wide"`         | `"normal"` | Left label width             |
| `useTrim`        | `boolean`                    | `true`     | Auto-trim whitespace         |
| `class`          | `string`                     | -          | Container CSS                |
| `classInput`     | `string`                     | -          | Input element CSS            |
| `classLabel`     | `string`                     | -          | Label CSS                    |

## Slot Props

| Prop          | Type             | Description                           |
| ------------- | ---------------- | ------------------------------------- |
| `labelAfter`  | `Snippet \| THC` | Content after label                   |
| `inputBefore` | `Snippet \| THC` | Content before input (inside wrapper) |
| `inputAfter`  | `Snippet \| THC` | Content after input (inside wrapper)  |
| `inputBelow`  | `Snippet \| THC` | Content below input                   |
| `below`       | `Snippet \| THC` | Content below entire field            |

## Shared wrapper class props (`InputWrapClassProps`)

Every `Field*` component that uses the shared label/input/description scaffolding accepts **the same 9 class props**, exported as the `InputWrapClassProps` interface from `@marianmeres/stuic`. Each Field extends that interface in its own `Props`, so the shape stays in sync and new wrapper targets are added in one place.

| Prop                       | Target                                                     |
| -------------------------- | ---------------------------------------------------------- |
| `classLabel`               | `<label>` element                                          |
| `classLabelBox`            | Wrapper around the label area                              |
| `classInputBox`            | Wrapper around the whole input area                        |
| `classInputBoxWrap`        | Inner input wrap (sibling to description/validation/below) |
| `classInputBoxWrapInvalid` | Added to `classInputBoxWrap` when validation fails         |
| `classDescBox`             | Description/help text box                                  |
| `classDescBoxToggle`       | Collapsible description's toggle button                    |
| `classBelowBox`            | "Below" slot (rendered under the description)              |
| `classValidationBox`       | Validation message box                                     |

Component-specific targets (e.g. `classInput` for the inner `<input>`/`<select>`/`<textarea>`, `classFileList` on `FieldFile`, `classOption`/`classOptgroup` on `FieldOptions`, `classPrefixTrigger` on `FieldPhoneNumber`, etc.) live on the component itself alongside these shared props.

> `FieldCheckbox` and `FieldRadios` have bespoke inline layouts and don't use the shared wrapper — they declare only the class props relevant to their own layout.

## Usage

### Basic Text Input

```svelte
<script lang="ts">
	import { FieldInput } from "stuic";

	let name = $state("");
</script>

<FieldInput label="Name" bind:value={name} placeholder="Enter your name" required />
```

### With Validation

```svelte
<FieldInput label="Email" type="email" bind:value={email} validate required />
```

### Select Field

```svelte
<script lang="ts">
	import { FieldSelect } from "stuic";

	let country = $state("");
</script>

<FieldSelect
	label="Country"
	bind:value={country}
	options={[
		{ label: "United States", value: "us" },
		{ label: "Canada", value: "ca" },
		{ label: "Mexico", value: "mx" },
	]}
/>
```

### Grouped Select Options

```svelte
<FieldSelect
	label="City"
	options={[
		{ label: "New York", value: "ny", optgroup: "USA" },
		{ label: "Los Angeles", value: "la", optgroup: "USA" },
		{ label: "Toronto", value: "to", optgroup: "Canada" },
	]}
/>
```

### Textarea with Auto-grow

```svelte
<script lang="ts">
	import { FieldTextarea } from "stuic";

	let message = $state("");
</script>

<FieldTextarea label="Message" bind:value={message} useAutogrow rows={3} />
```

### Checkbox

```svelte
<script lang="ts">
	import { FieldCheckbox } from "stuic";

	let agreed = $state(false);
</script>

<FieldCheckbox label="I agree to the terms" bind:checked={agreed} required />
```

### Input with Addons

```svelte
<FieldInput label="Price" type="number" bind:value={price}>
	{#snippet inputBefore()}
		<span class="px-3 text-gray-500">$</span>
	{/snippet}
	{#snippet inputAfter()}
		<span class="px-3 text-gray-500">.00</span>
	{/snippet}
</FieldInput>
```

### Money Input

`FieldMoney` edits a money amount whose canonical value is an **integer in minor
units** (e.g. cents), while the user sees and types a major-unit decimal
("12.34"). It wraps `FieldInput`, so all the common props (label, validation,
sizing, class props, the imperative API) work as usual.

```svelte
<script lang="ts">
	import { FieldMoney } from "stuic";

	// bound value is the integer amount of minor units (e.g. 1999 = $19.99)
	let priceCents = $state(1999);
</script>

<FieldMoney label="Price" name="price" bind:value={priceCents} min={0} />
```

The `name` is applied to a hidden input carrying the integer minor units — the
visible input stays name-less so a `<form>` never serializes the display string.
A built-in numeric guard rejects non-numeric input and enforces the optional
major-unit `min` / `max`. Use `scale` / `decimals` for non-cents currencies
(e.g. `scale={1000} decimals={3}`). The matching `formatMinorUnits`,
`parseToMinorUnits`, and `money` helpers are exported from `@marianmeres/stuic`
for display elsewhere.

### Left-aligned Label

```svelte
<FieldInput label="Username" bind:value={username} labelLeft labelLeftWidth="wide" />
```

### Key-Value Pairs

```svelte
<script lang="ts">
	import { FieldKeyValues } from "stuic";

	// Value is a JSON string of {key: value, key2: value2, ...}
	let headers = $state("{}");
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

| Prop               | Type                      | Default        | Description                                   |
| ------------------ | ------------------------- | -------------- | --------------------------------------------- |
| `value`            | `string`                  | `"{}"`         | JSON string of `{key: value, ...}` (bindable) |
| `name`             | `string`                  | -              | Form field name                               |
| `keyPlaceholder`   | `string`                  | `"Key"`        | Placeholder for key input                     |
| `valuePlaceholder` | `string`                  | `"Value"`      | Placeholder for value textarea                |
| `addLabel`         | `string`                  | `"Add"`        | Label for add button                          |
| `emptyMessage`     | `string`                  | `"No entries"` | Message when no entries                       |
| `classEntry`       | `string`                  | -              | CSS for each entry row                        |
| `classKeyInput`    | `string`                  | -              | CSS for key inputs                            |
| `classValueInput`  | `string`                  | -              | CSS for value textareas                       |
| `onChange`         | `(value: string) => void` | -              | Callback on value change                      |

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
				return { valid: false, message: "Min 3 characters" };
			}
			return { valid: true };
		},
	}}
/>
```

## CSS Variables

### Component Tokens

Override globally in `:root` or locally via `style` prop:

| Variable                     | Default                     | Description            |
| ---------------------------- | --------------------------- | ---------------------- |
| `--stuic-input-radius`       | `--radius-md`               | Border radius          |
| `--stuic-input-font-family`  | `--font-sans`               | Font family            |
| `--stuic-input-transition`   | `150ms`                     | Transition duration    |
| `--stuic-input-ring-width`   | `4px`                       | Focus ring width       |
| `--stuic-input-ring-color`   | `--stuic-color-ring`        | Focus ring color       |
| `--stuic-input-accent`       | `--stuic-color-primary`     | Accent color           |
| `--stuic-input-accent-error` | `--stuic-color-destructive` | Error/validation color |

### Color Tokens

| Variable                     | Default                          | Description           |
| ---------------------------- | -------------------------------- | --------------------- |
| `--stuic-input-bg`           | `--stuic-color-input`            | Background color      |
| `--stuic-input-border`       | `--stuic-color-border`           | Border color          |
| `--stuic-input-border-focus` | `--stuic-input-accent`           | Border color on focus |
| `--stuic-input-text`         | `--stuic-color-foreground`       | Text color            |
| `--stuic-input-placeholder`  | `--stuic-color-muted-foreground` | Placeholder color     |

### Size Tokens

Each size (sm, md, lg) has corresponding tokens:

| Variable                          | sm                      | md                      | lg                    |
| --------------------------------- | ----------------------- | ----------------------- | --------------------- |
| `--stuic-input-padding-x-{size}`  | `calc(--spacing * 2.5)` | `calc(--spacing * 3)`   | `calc(--spacing * 4)` |
| `--stuic-input-padding-y-{size}`  | `calc(--spacing * 2)`   | `calc(--spacing * 2.5)` | `calc(--spacing * 3)` |
| `--stuic-input-font-size-{size}`  | `--text-sm`             | `--text-base`           | `--text-lg`           |
| `--stuic-input-min-height-{size}` | `2.5rem`                | `2.75rem`               | `3rem`                |

### Checkbox/Radio Tokens

| Variable                          | Default                | Description            |
| --------------------------------- | ---------------------- | ---------------------- |
| `--stuic-checkbox-size`           | `1.25rem`              | Checkbox size          |
| `--stuic-checkbox-radius`         | `--radius-sm`          | Checkbox border radius |
| `--stuic-radio-size`              | `1rem`                 | Radio button size      |
| `--stuic-checkbox-bg`             | `--stuic-color-muted`  | Unchecked background   |
| `--stuic-checkbox-border`         | `--stuic-color-border` | Unchecked border       |
| `--stuic-checkbox-checked-bg`     | `--stuic-input-accent` | Checked background     |
| `--stuic-checkbox-checked-border` | `--stuic-input-accent` | Checked border         |

### Range Input Tokens

| Variable                           | Default               | Description         |
| ---------------------------------- | --------------------- | ------------------- |
| `--stuic-input-range-thumb-size`   | `18px`                | Slider thumb size   |
| `--stuic-input-range-track-height` | `4px`                 | Track height        |
| `--stuic-input-range-track-radius` | `18px`                | Track border radius |
| `--stuic-input-range-track-bg`     | `--stuic-color-muted` | Track background    |

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
<FieldInput label="Search" style="--stuic-input-radius: 9999px;" />
```

## Data Attributes

Components use data attributes for CSS styling:

- `data-size` - The size value ("sm", "md", "lg")

## Class Props

| Prop                       | Target                            |
| -------------------------- | --------------------------------- |
| `class`                    | Root container                    |
| `classInput`               | Input element                     |
| `classLabel`               | Label element                     |
| `classLabelBox`            | Label container                   |
| `classInputBox`            | Input container (outer)           |
| `classInputBoxWrap`        | Input wrapper (inner, has border) |
| `classInputBoxWrapInvalid` | Input wrapper when invalid        |
| `classDescBox`             | Description container             |
| `classBelowBox`            | Below slot container              |

---

## FieldOptions

A modal-based multi-select/single-select component with search functionality, typeahead support, and option grouping.

### Props

| Prop                | Type                                                       | Default    | Description                                                                         |
| ------------------- | ---------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------- |
| `value`             | `string`                                                   | `"[]"`     | JSON array of selected items (bindable)                                             |
| `name`              | `string`                                                   | -          | Form field name                                                                     |
| `getOptions`        | `(q: string, current: Item[]) => Promise<{found: Item[]}>` | -          | Async function to fetch options                                                     |
| `cardinality`       | `number`                                                   | `Infinity` | Max selections (-1 for unlimited)                                                   |
| `allowUnknown`      | `boolean`                                                  | `false`    | Allow typing custom values                                                          |
| `ordered`           | `boolean`                                                  | `false`    | Opt-in: add an "Arrange" screen to manually order the selection (multi-select only) |
| `renderOptionLabel` | `(item: Item) => string`                                   | -          | Custom option label renderer                                                        |
| `renderOptionGroup` | `(s: string) => string`                                    | -          | Custom optgroup label renderer                                                      |
| `renderValue`       | `(stringifiedItems: string) => string`                     | -          | Custom value display renderer                                                       |
| `showIconsCheckbox` | `boolean`                                                  | `true`     | Show checkbox icons in multi-select                                                 |
| `showIconsRadio`    | `boolean`                                                  | `false`    | Show radio icons in single-select                                                   |
| `searchPlaceholder` | `string`                                                   | -          | Custom search placeholder                                                           |
| `itemIdPropName`    | `string`                                                   | `"id"`     | Property name for item ID                                                           |
| `notifications`     | `NotificationsStack`                                       | -          | Notification handler for errors                                                     |

### Class Props

| Prop                | Target                       |
| ------------------- | ---------------------------- |
| `classOption`       | Option item (ListItemButton) |
| `classOptionActive` | Active/selected option       |
| `classOptgroup`     | Option group label           |
| `classModalField`   | Modal field wrapper          |

### CSS Variables

#### Component Tokens

| Variable                                   | Default                          | Description                     |
| ------------------------------------------ | -------------------------------- | ------------------------------- |
| `--stuic-field-options-divider`            | `--stuic-color-border`           | Divider/separator color         |
| `--stuic-field-options-control-text`       | `--stuic-color-muted-foreground` | Control button text color       |
| `--stuic-field-options-control-text-hover` | `--stuic-color-foreground`       | Control button hover text color |
| `--stuic-field-options-control-ring`       | `--stuic-color-ring`             | Control button focus ring       |
| `--stuic-field-options-muted-text`         | `--stuic-color-muted-foreground` | Muted/secondary text color      |
| `--stuic-field-options-optgroup-text`      | `--stuic-color-muted-foreground` | Option group label color        |

### Usage

```svelte
<script lang="ts">
	import { FieldOptions } from "stuic";

	let value = $state("[]");

	async function getOptions(query: string, current: any[]) {
		const response = await fetch(`/api/search?q=${query}`);
		const data = await response.json();
		return { found: data.items };
	}
</script>

<FieldOptions
	label="Select Tags"
	name="tags"
	bind:value
	{getOptions}
	cardinality={5}
	allowUnknown
/>
```

### Ordering the selection (`ordered`)

By default the selected items are serialized to `value` in alphabetical order. For
relations where the order matters, opt in with `ordered` (multi-select only). This adds a
`Pick | Arrange` tab header inside the modal. The **Arrange** screen shows the current
selection as a flat list where each row has **Move up / down** (and, on wider screens,
**Move to top / bottom**) plus **Remove** buttons — buttons only, no drag — and offers
**Sort A–Z** / **Reverse** shortcuts. The order you set is what gets serialized to `value`
on submit (and round-trips on reopen). Single-select fields ignore the prop.

```svelte
<FieldOptions
	label="Steps (in order)"
	name="steps"
	bind:value
	{getOptions}
	cardinality={-1}
	ordered
/>
```

> Note: with `ordered`, **Select all** appends in the options' (alphabetical) order as a
> starting point — use the per-row buttons or the Sort/Reverse shortcuts to arrange from
> there. The `value` must hold full item objects (with their label), which is already the
> default contract, so the Arrange list can render selected items even when they aren't in
> the current search results.

### Customization Examples

```css
/* Make optgroup labels more prominent */
:root {
	--stuic-field-options-optgroup-text: var(--stuic-color-primary);
}

/* Custom control button colors */
:root {
	--stuic-field-options-control-text: var(--stuic-color-primary);
	--stuic-field-options-control-text-hover: var(--stuic-color-primary-hover);
}
```

```svelte
<!-- Local customization -->
<FieldOptions style="--stuic-field-options-divider: var(--color-red-500);" ... />
```

---

## FieldAssets

Asset/image upload field with an inline thumbnail grid and a built-in lightbox preview
(`AssetsPreview`). Files are added via the picker button, by dragging them onto the field,
or (opt-in) by pasting from the clipboard; each shows as a thumbnail with its filename (and
an upload progress indicator while processing).

### Paste from the clipboard (`pasteable`)

Opt in with `pasteable` to let users paste image/file data from the clipboard (Ctrl/Cmd-V) —
a screenshot, a copied image, etc. It is **focus-scoped**: a paste is consumed only while the
field (or a control inside it) holds focus. Clicking anywhere in the field focuses it, so no
Tab is needed, and a `:focus-within` ring on the input box signals the paste-ready state.
Pasted files go through the same path as the picker and drag-and-drop, so `accept`,
`cardinality` and `processAssets` all apply. No-op unless `processAssets` is provided.

```svelte
<FieldAssets
	label="Screenshots"
	name="screenshots"
	bind:value
	{processAssets}
	accept="image/*"
	pasteable
/>
```

### Ordering the assets (`ordered`)

By default assets keep their upload order. Opt in with `ordered` to let users reorder them
manually: each thumbnail gains **Move earlier** / **Move later** controls (revealed on
hover/focus) that shift the asset one position in the sequence. Buttons only, no drag — the
field's drag gesture is reserved for file drops — with full keyboard support and aria-live
announcements. The chosen order is serialized to `value`.

```svelte
<FieldAssets
	label="Gallery (ordered)"
	name="gallery"
	bind:value
	{processAssets}
	ordered
/>
```

### Lazy / auth-gated download (`onDownload`)

By default the preview's **Download** button fetches `asset.url.original` with a plain
unauthenticated request. When the bytes live behind an authenticated route (a Bearer
token, a signed request, …), or you'd rather fetch them **only on download-click** instead
of pre-resolving an object URL for every asset up front, pass `onDownload`. It receives the
full `FieldAsset` (including `_raw`, so you can recover your own model id) plus its index,
and replaces the default download entirely. It may be async — the button shows a busy state
until it settles, and a rejection is caught so a failed download never breaks the preview.

```svelte
<FieldAssets
	label="Attachments"
	name="attachments"
	bind:value
	{processAssets}
	onDownload={async (asset) => {
		const id = (asset._raw as { model_id: string }).model_id;
		const res = await fetch(`/todo/attachment/${id}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		const objUrl = URL.createObjectURL(await res.blob());
		const a = document.createElement("a");
		a.href = objUrl;
		a.download = asset.name || "download";
		document.body.appendChild(a);
		a.click();
		a.remove();
		setTimeout(() => URL.revokeObjectURL(objUrl), 10_000);
	}}
/>
```

> With this, non-image attachments need **no** pre-fetched object URL at all — they render
> as a file icon and only fetch bytes when the user actually clicks Download.

---

## Honeypot & TimeTrap (anti-bot primitives)

Two small, **client-side, server-less** primitives for cheap spam mitigation. They produce **signals** — they do not block anything. Read the signal, then enforce on your server (the only place enforcement is trustworthy). Both are reusable on any form; [`ContactUsForm`](../ContactUsForm/README.md) composes them by default.

> These stop a large share of commodity drive-by spam (no UX friction, no external dependency, no privacy/GDPR concern). They do **not** stop a targeted or headless-browser bot — for that you still want a real challenge (Cloudflare Turnstile / hCaptcha) verified server-side.

### `Honeypot`

A visually-hidden, `aria-hidden`, off-screen text input that real users and assistive tech never reach, but naive bots fill. A non-empty value is a strong bot signal. The hiding styles are applied **inline** so the trap stays hidden even without the library stylesheet. The input uses `autocomplete="new-password"` (the value browsers actually honor as do-not-autofill — `autocomplete="off"` is ignored on text fields) so browser/profile autofill won't write into the trap and flag a real user.

```svelte
<script lang="ts">
	import { Honeypot } from "@marianmeres/stuic";

	let trap = $state("");
	// On submit: if trap.trim() !== "" treat as a bot (server-side).
</script>

<form onsubmit={...}>
	<!-- ...your real fields... -->
	<Honeypot bind:value={trap} />
</form>
```

| Prop                 | Type          | Default                    | Description                                                                                               |
| -------------------- | ------------- | -------------------------- | --------------------------------------------------------------------------------------------------------- |
| `value`              | `string`      | `""`                       | Trap value (bindable). Non-empty ⇒ likely a bot.                                                          |
| `name`               | `string`      | `"link"`                   | Field name. Default avoids autofill tokens (`url`/`name`/`email`/…). Pick one your real form doesn't use. |
| `label`              | `string`      | `"Leave this field empty"` | Screen-reader fallback (wrapper is `aria-hidden`).                                                        |
| `el` / `input`       | `HTMLElement` | -                          | Bindable wrapper / input refs.                                                                            |
| `unstyled` / `class` | -             | -                          | Drop / extend the `stuic-honeypot` class (hiding is always applied).                                      |

**Method:** `isFilled(): boolean` (via `bind:this`).

> **Naming caveat:** keep the field name tempting to bots but **not** a token browser autofill recognizes. Names like `url`/`website`/`email`/`name`/`phone`/`address` get autofilled into the off-screen trap from the user's saved profile, producing false positives. The default `"link"` and `autocomplete="new-password"` avoid this.

### `TimeTrap`

Records form mount time and flags submits that arrive faster than `minMs`. Renders a single hidden timestamp input (handy for native form POSTs) and exposes reactive `isTooFast` / `elapsedMs` bindings plus a `check()` snapshot for exact submit-time reads.

```svelte
<script lang="ts">
	import { TimeTrap } from "@marianmeres/stuic";

	let tooFast = $state(true);
	let trap = $state<TimeTrap>();
	// On submit: const { elapsedMs, isTooFast } = trap.check();
</script>

<TimeTrap bind:this={trap} bind:isTooFast={tooFast} minMs={2000} />
```

| Prop        | Type      | Default | Description                                                     |
| ----------- | --------- | ------- | --------------------------------------------------------------- |
| `minMs`     | `number`  | `2000`  | Minimum plausible human fill time (ms).                         |
| `enabled`   | `boolean` | `true`  | When false, `isTooFast` stays `false` and no timer runs.        |
| `isTooFast` | `boolean` | `true`  | Bindable, reactive; `true` until `minMs` elapses.               |
| `elapsedMs` | `number`  | `0`     | Bindable; updated on the flip and on `check()`.                 |
| `startedAt` | `number`  | -       | Bindable; epoch ms captured at mount; also in the hidden input. |
| `name`      | `string`  | `"_ts"` | Name of the rendered hidden timestamp input.                    |

**Methods:** `check(): { elapsedMs, isTooFast, startedAt }`, `reset()` (via `bind:this`).

> The timestamp is a client clock and is **not** tamper-proof. Treat `isTooFast` as a heuristic and pair it with real server-side rate limiting.
