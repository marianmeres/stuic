# FieldsBuilder

A composite form control for **authoring an ordered list of field definitions** — the
"what properties does a thing have?" editor. The end user adds a field, names it, picks
its type, marks it required, reorders it, deletes it. The component's bindable `value`
is a plain `FieldDef[]`.

It is deliberately generic: the **type palette is a prop** (`types`), not a built-in
union. A CMS defining a content type, an issue tracker defining custom ticket fields,
and a form builder are all equally valid consumers. The component emits a field list —
**not** JSON Schema or any other schema language; compiling the list into whatever the
consumer's backend understands is the consumer's job.

```svelte
<script lang="ts">
	import {
		FieldsBuilder,
		FIELDS_BUILDER_DEFAULT_TYPES,
		type FieldDef,
	} from "@marianmeres/stuic";

	let value = $state<FieldDef[]>([]);
</script>

<FieldsBuilder
	bind:value
	name="fields"
	label="Fields"
	types={FIELDS_BUILDER_DEFAULT_TYPES}
/>
```

## The value shape

```ts
type LocalizedText = string | Record<string, string>;

interface FieldDef {
	key: string; // machine key, unique within the list
	type: string; // one of the `types` palette entries' `type`
	label: LocalizedText;
	description?: LocalizedText;
	required?: boolean;
	options?: { value: string; label: LocalizedText }[]; // edited for `supportsOptions` types
	extras?: Record<string, unknown>; // per-type flags declared by the palette
	lock?: FieldLock; // what the user may NOT change
}
```

Order is positional — the array order **is** the order (no `order`/`weight` property).

Value membership rules:

- Defs loaded from `value` always stay in `value` (even while temporarily invalid) —
  the component never silently drops a field.
- A field added in the session joins `value` once it has a key, and then stays until
  deleted: a transiently blank key mid-rename emits the def with `key: ""` (flagged by
  validation) rather than emitting an effective field deletion.
- When a field's type is changed away from a choice type, its `options` are
  **retained** on the def (switching back restores them); consumers compiling the list
  should ignore `options` on non-choice types.
- Palette `extras` defaults are materialized into `def.extras` when a field is added
  or its type changes; a def loaded _without_ an extra's key renders unchecked — the
  checkbox always reflects what `value` actually contains, never a phantom default.

## The palette

```ts
interface FieldTypeDef {
	type: string; // stored in FieldDef.type
	label: LocalizedText; // shown in the type picker
	description?: LocalizedText;
	icon?: string | Snippet; // html string or snippet, shown in the row's type chip
	supportsOptions?: boolean; // renders the option editor
	extras?: {
		key: string;
		label: LocalizedText;
		description?: LocalizedText;
		type: "boolean"; // v1: booleans only (a checkbox per extra)
		default?: boolean;
	}[];
	preview?: Snippet<[FieldDef]>; // per-type preview of a single field
}
```

`FIELDS_BUILDER_DEFAULT_TYPES` ships a small general-purpose palette
(text / longtext / number / checkbox / select / date) for demos and unopinionated
consumers — `types` is still a required prop, so nobody gets it by accident.

## Keys

The key is the machine identifier; once data exists under it, renaming orphans that
data. The component treats keys accordingly:

- **Derive-while-untouched** — typing the label "Vintage year" fills the key with
  `vintage_year` live (diacritics transliterated: "Ročník" → `rocnik`; collisions and
  `reservedKeys` auto-suffixed: `vintage_year_2`). The moment the user edits the key by
  hand, derivation stops for that row and never resumes.
- **`keysImmutable` (default `true`)** — keys present in `value` when it is (re)loaded
  render read-only; keys created during the session stay editable. `lock.key` overrides
  per-field in both directions. There is deliberately **no rename affordance**; a
  consumer that wants renaming owns the migration and passes `keysImmutable: false`.
- **Validation** — pattern (default `/^[a-z][a-z0-9_]{0,62}$/`), max length, uniqueness,
  `reservedKeys`; inline per-row errors, not a submit-time surprise.
- The key is visually secondary: shown small and monospaced in the row header, edited
  behind the row's "Advanced" disclosure.

## Deletion is destructive

- **`deleteMode: "mark"` (default)** — deleting a _pre-existing_ field strikes the row
  through, excludes it from `value`, and offers Undo; the row stays visible until the
  consumer saves and reloads. A field added in the current session is removed outright
  (there is no stored data to protect).
- **`deleteMode: "immediate"`** — rows are removed outright.
- **`onBeforeDelete`** veto — return `false` (or throw) to cancel. This is where a
  consumer puts its own confirm ("43 items have a value here"). No confirm dialog is
  built in.
- Changing the **type** of a pre-existing field is guarded the same way:
  `onBeforeTypeChange` veto plus a visible inline warning.

## What the component validates — and what it does not

Owns: key pattern / length / uniqueness / reserved, label non-empty, choice types have
at least one option with unique non-empty values, `maxFields`, `required` (at least one
field). `validate()` expands, scrolls to and focuses the first offender.

**Does not own:** whether the resulting list is acceptable to the consumer's backend.
The consumer persisting the list MUST re-validate server-side — this component is a
convenience, not a security boundary.

Corollary: a `FieldDef` whose `type` is not in `types` is rendered as a degraded
read-only row with a visible warning, round-trips through `value` untouched, and does
not block validation. It is never silently dropped.

## Props

| Prop                                                          | Type                                                 | Default        | Description                                            |
| ------------------------------------------------------------- | ---------------------------------------------------- | -------------- | ------------------------------------------------------ |
| `value`                                                       | `FieldDef[]`                                         | required       | Bindable ordered field list                            |
| `name`                                                        | `string`                                             | required       | Hidden-input name (form participation)                 |
| `types`                                                       | `FieldTypeDef[]`                                     | required       | The type palette                                       |
| `label`                                                       | `Snippet \| THC`                                     | —              | Field label                                            |
| `description`                                                 | `Snippet \| THC`                                     | —              | Help text below                                        |
| `languages`                                                   | `string[]`                                           | —              | Enables multi-language label/description/option labels |
| `defaultLanguage`                                             | `string`                                             | `languages[0]` | Drives key derivation and display texts                |
| `languageLabels`                                              | `Record<string, string>`                             | —              | Display names for language codes                       |
| `keyPattern`                                                  | `RegExp`                                             | snake_case     | Key validation pattern                                 |
| `keyMaxLength`                                                | `number`                                             | `63`           | Key length limit                                       |
| `reservedKeys`                                                | `string[] \| (key) => boolean`                       | —              | Keys the user may not use                              |
| `keysImmutable`                                               | `boolean`                                            | `true`         | Freeze keys loaded from `value`                        |
| `deriveKeyFromLabel`                                          | `boolean \| (label) => string`                       | `true`         | Live key derivation (custom slugifier allowed)         |
| `maxFields`                                                   | `number`                                             | —              | Disables adding beyond the limit                       |
| `deleteMode`                                                  | `"mark" \| "immediate"`                              | `"mark"`       | Delete UX (see above)                                  |
| `onBeforeDelete`                                              | `(field) => void \| false \| Promise<void \| false>` | —              | Delete veto hook                                       |
| `onBeforeTypeChange`                                          | `(field, newType) => void \| false \| Promise<...>`  | —              | Type-change veto hook (pre-existing fields)            |
| `onChange`                                                    | `(value: FieldDef[]) => void`                        | —              | Fired after every change                               |
| `preview`                                                     | `Snippet<[{ fields: FieldDef[] }]>`                  | —              | Preview pane content (see below)                       |
| `previewBreakpoint`                                           | `number`                                             | `768`          | Component width for side-by-side preview; `0` = below  |
| `required`                                                    | `boolean`                                            | `false`        | At least one field required                            |
| `validate`                                                    | `boolean \| ValidateOptions`                         | `true`         | Validate-action options                                |
| `renderSize`                                                  | `"sm" \| "md" \| "lg"`                               | `"sm"`         | InputWrap size                                         |
| `addLabel`, `emptyMessage`                                    | `string`                                             | —              | Text overrides                                         |
| `classRow`, `classRowHeader`, `classRowBody`, `classPreview`  | `string`                                             | —              | Class hooks                                            |
| `t`                                                           | `TranslateFn`                                        | built-in       | i18n override for all texts                            |
| `disabled`, `id`, `tabindex`, `style`, `labelLeft*`, `class*` |                                                      |                | Standard `Field*`/InputWrap pass-throughs              |

Imperative API (via `bind:this`), same as every `Field*`:
`validate()`, `clearValidation()`, `getValidation()`, `focus()`, `scrollIntoView()`.

## Preview

Pass a `preview` snippet to get a live pane the component keeps in sync (side-by-side
when wide, stacked below when narrow). Alternatively, palette entries may carry a
per-type `preview` snippet; rows without one fall back to a minimal label line. What a
rendered field looks like is entirely the consumer's decision — there is deliberately
no built-in mapping from palette types to stuic `Field*` components.

```svelte
<FieldsBuilder bind:value name="fields" {types}>
	{#snippet preview({ fields })}
		{#each fields as f}<MyFieldPreview def={f} />{/each}
	{/snippet}
</FieldsBuilder>
```

## Locks

Per-field `lock` flags: `key`, `type`, `required`, `options`, `delete`, `reorder`.
A `lock.reorder` field is position-pinned — it cannot be dragged and no other move may
change its index. **Label and description are always editable**, even on fully locked
fields: the consumer owns a system field's identity, the user owns what it is called.

## Accessibility

- Reorder is never drag-only: every row has Move up / Move down buttons (focus follows
  the moved row) alongside the drag handle; moves, deletes and restores are announced
  via a polite `aria-live` region.
- Rows are a `list`/`listitem` structure; the row header is a real button with
  `aria-expanded`.

## CSS Variables

Prefix: `--stuic-fields-builder-*`

`row-border`, `row-toggle-bg-hover`, `key-text`, `chip-bg`, `chip-text`, `chip-radius`,
`muted-text`, `warning-text`, `error-text`, `drop-indicator-color`,
`drop-indicator-height`, `row-opacity-dragging`, `row-opacity-deleted`,
`preview-border`
