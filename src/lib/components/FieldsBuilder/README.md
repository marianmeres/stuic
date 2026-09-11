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
	columns?: FieldColumnDef[]; // edited for `supportsColumns` types, see Columns
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
  or its type changes; a def loaded _without_ an extra's key renders empty/unchecked —
  the control always reflects what `value` actually contains, never a phantom default.
  Extras are **retained** across a type change too (same rule as `options`), and so
  are `columns`.

## The palette

```ts
interface FieldTypeDef {
	type: string; // stored in FieldDef.type
	label: LocalizedText; // shown in the type picker
	description?: LocalizedText;
	icon?: string | Snippet; // html string or snippet, shown in the row's type chip
	supportsOptions?: boolean; // renders the option editor
	extras?: FieldTypeExtraDef[]; // per-type controls, see below
	supportsColumns?: boolean; // renders the column editor, see Columns
	columnTypes?: FieldTypeDef[]; // the palette a column may take
	maxColumns?: number; // cap on the column list
	preview?: Snippet<[FieldDef]>; // per-type preview of a single field
}
```

## Extras

`extras` declares extra per-field controls, each stored under `FieldDef.extras[key]`.
The component never interprets the values — it renders a control per declaration and
round-trips whatever is there. Discriminated by `type`:

```ts
type FieldTypeExtraDef =
	| { key; label; description?; type: "boolean"; default?: boolean }
	| {
			key;
			label;
			description?;
			type: "string";
			default?: string;
			placeholder?: LocalizedText;
			maxlength?: number;
	  }
	| {
			key;
			label;
			description?;
			type: "select";
			default?: string;
			placeholder?: LocalizedText;
			options: { value: string; label: LocalizedText }[];
	  };
```

```ts
{
	type: "number",
	label: "Number",
	extras: [
		// rendered after the number on the consumer's own page: "12.5 % vol"
		{ key: "unit", label: "Unit", type: "string", placeholder: "e.g. % vol", maxlength: 16 },
		{ key: "group", label: "Group", type: "select", placeholder: "— none —",
		  options: [{ value: "nutrition", label: "Nutrition declaration" }] },
	],
}
```

- **Empty means absent.** Emptying a `string` extra or picking a `select`'s blank entry
  **removes the key** (and removes `extras` itself once the bag is empty) rather than
  storing `""` — "no unit" has exactly one representation downstream. Consequence worth
  knowing: a `default` becomes eligible for re-seeding again, so a cleared extra
  reappears if the field's type is changed away and back.
- **Whitespace is trimmed on commit, not while typing** — trimming on every keystroke
  would make a trailing space untypable.
- **`maxlength` is checked twice** — the input's attribute bounds typing, and
  `validateFieldDefs` re-checks the stored value (the attribute does not constrain a
  programmatically seeded or imported one) and reports it as a row error.
- **A `select` value outside the declared `options` is preserved** and rendered as its
  own entry, the same stance the component takes on an unknown field `type` — it stays
  visible and round-trips instead of being silently coerced to blank.
- Extras have **no per-extra lock**; `FieldLock` does not cover them (the whole editor
  still honours `disabled`).

`FIELDS_BUILDER_DEFAULT_TYPES` ships a small general-purpose palette
(text / longtext / number / checkbox / select / date) for demos and unopinionated
consumers — `types` is still a required prop, so nobody gets it by accident.

## Columns

A palette entry may declare `supportsColumns`: its definition is then a **list of typed
columns** — a "table" field whose value (rows) is an array of objects keyed by column.
Editing the rows is not this component's job; authoring the columns is.

```ts
interface FieldColumnDef {
	key: string; // unique within the field's columns (not across fields)
	type: string; // one of the entry's `columnTypes`
	label: LocalizedText;
	options?: FieldOptionDef[]; // edited for a `supportsOptions` column type
	extras?: Record<string, unknown>; // driven by the column type's `extras`
}
```

```ts
{
	type: "table",
	label: "Table",
	supportsColumns: true,
	maxColumns: 8,
	columnTypes: [
		{ type: "text", label: "Text" },
		{ type: "number", label: "Number",
		  extras: [{ key: "unit", label: "Unit", type: "string", maxlength: 16 }] },
		{ type: "select", label: "Choice", supportsOptions: true },
	],
}
```

- **A column is a field in miniature.** One line per column: label (localized, like
  every other label), type, key, and — behind a settings toggle that appears only when
  the column type has `supportsOptions` or `extras` — the same option editor and extras
  controls a field gets. `columnTypes` is a full `FieldTypeDef[]` on purpose, so there is
  no new vocabulary: a number column declares its unit exactly as a number field does.
  Leave off the extras that only make sense per field.
- **Default palette.** Without `columnTypes`, a column may take any entry of `types`
  that does not itself `supportsColumns`. Columns never nest — a `supportsColumns` entry
  listed inside `columnTypes` is treated as a plain column type.
- **Keys follow the field-key policy**: derived from the label while untouched
  (transliterated, unique among the sibling columns, bounded by `keyMaxLength`; a
  `deriveKeyFromLabel` function is used here too), frozen by the first manual edit, and
  with `keysImmutable` read-only for every column that was present when `value` was
  (re)loaded — a column added this session stays editable, also after the row is
  collapsed and re-expanded. `keyPattern` / `keyMaxLength` apply; `reservedKeys` does
  **not** (it guards the field-key namespace, a column key lives inside one field's rows).
- **Removal is immediate** — there is no mark-delete for columns. The safety net is
  `onBeforeColumnDelete(field, column)`: return `false` (or throw) to cancel. It fires
  only for stored columns, never for one added this session. Changing a stored column's
  type is guarded the same way (`onBeforeColumnTypeChange(field, column, newType)`, plus
  an inline warning), and keeps the column's `options` / `extras` like a field does.
- **`lock.columns`** renders the column list read-only (the counterpart of
  `lock.options`).
- **Retained across a field type change**: `table → text → table` restores the columns.
  Consumers compiling the list should ignore `columns` on types without
  `supportsColumns`.
- **Unknown column type** (not in the column palette): rendered as a degraded read-only
  line with a warning, not validated, round-tripped untouched — its key still counts
  toward uniqueness. The same stance as an unknown field type.

Validation adds, for a `supportsColumns` field: at least one column, at most
`maxColumns` (a seeded list above the cap is an error, never truncated), and per column
the label / key / options / string-extra rules above. `validateFieldDefs` reports them
as `rowErrors[i].columnErrors` (index-aligned with `def.columns`, `null` for a clean
column) and a row summary `rowErrors[i].columns` ("Column 2: Label is required").
`validate()` expands the row, opens the column's settings when needed, and focuses the
offending control. Consumer-specific budgets (say "fields plus columns ≤ 80") belong to
the consumer: `validate.customValidator` runs after the built-in rules.

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
field), and for `supportsColumns` types the column rules (see Columns). `validate()`
expands, scrolls to and focuses the first offender.

**Does not own:** whether the resulting list is acceptable to the consumer's backend.
The consumer persisting the list MUST re-validate server-side — this component is a
convenience, not a security boundary.

Corollary: a `FieldDef` whose `type` is not in `types` is rendered as a degraded
read-only row with a visible warning, round-trips through `value` untouched, and does
not block validation. It is never silently dropped.

## Props

| Prop                                                          | Type                                                 | Default           | Description                                                                     |
| ------------------------------------------------------------- | ---------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------- |
| `value`                                                       | `FieldDef[]`                                         | required          | Bindable ordered field list                                                     |
| `name`                                                        | `string`                                             | required          | Hidden-input name (form participation)                                          |
| `types`                                                       | `FieldTypeDef[]`                                     | required          | The type palette                                                                |
| `label`                                                       | `Snippet \| THC`                                     | —                 | Field label                                                                     |
| `description`                                                 | `Snippet \| THC`                                     | —                 | Help text below                                                                 |
| `languages`                                                   | `string[]`                                           | —                 | Enables multi-language label/description/option labels                          |
| `defaultLanguage`                                             | `string`                                             | `languages[0]`    | Canonical language: key derivation, required-label rule, editors' primary input |
| `displayLanguage`                                             | `string`                                             | `defaultLanguage` | Translation shown in read-only spots (row list, palette, extras); see i18n      |
| `languageLabels`                                              | `Record<string, string>`                             | —                 | Display names for language codes                                                |
| `keyPattern`                                                  | `RegExp`                                             | snake_case        | Key validation pattern                                                          |
| `keyMaxLength`                                                | `number`                                             | `63`              | Key length limit                                                                |
| `reservedKeys`                                                | `string[] \| (key) => boolean`                       | —                 | Keys the user may not use                                                       |
| `keysImmutable`                                               | `boolean`                                            | `true`            | Freeze keys loaded from `value`                                                 |
| `deriveKeyFromLabel`                                          | `boolean \| (label) => string`                       | `true`            | Live key derivation (custom slugifier allowed)                                  |
| `maxFields`                                                   | `number`                                             | —                 | Disables adding beyond the limit                                                |
| `deleteMode`                                                  | `"mark" \| "immediate"`                              | `"mark"`          | Delete UX (see above)                                                           |
| `onBeforeDelete`                                              | `(field) => void \| false \| Promise<void \| false>` | —                 | Delete veto hook                                                                |
| `onBeforeTypeChange`                                          | `(field, newType) => void \| false \| Promise<...>`  | —                 | Type-change veto hook (pre-existing fields)                                     |
| `onBeforeColumnDelete`                                        | `(field, column) => void \| false \| Promise<...>`   | —                 | Column removal veto hook (stored columns of `supportsColumns` fields)           |
| `onBeforeColumnTypeChange`                                    | `(field, column, newType) => void \| false \| ...`   | —                 | Column type-change veto hook (stored columns)                                   |
| `onChange`                                                    | `(value: FieldDef[]) => void`                        | —                 | Fired after every change                                                        |
| `preview`                                                     | `Snippet<[{ fields: FieldDef[] }]>`                  | —                 | Preview pane content (see below)                                                |
| `previewBreakpoint`                                           | `number`                                             | `768`             | Component width for side-by-side preview; `0` = below                           |
| `required`                                                    | `boolean`                                            | `false`           | At least one field required                                                     |
| `validate`                                                    | `boolean \| ValidateOptions`                         | `true`            | Validate-action options                                                         |
| `renderSize`                                                  | `"sm" \| "md" \| "lg"`                               | `"sm"`            | InputWrap size                                                                  |
| `addLabel`, `emptyMessage`                                    | `string`                                             | —                 | Text overrides                                                                  |
| `classRow`, `classRowHeader`, `classRowBody`, `classPreview`  | `string`                                             | —                 | Class hooks                                                                     |
| `t`                                                           | `TranslateFn`                                        | built-in (en)     | i18n override for all texts (see below)                                         |
| `disabled`, `id`, `tabindex`, `style`, `labelLeft*`, `class*` |                                                      |                   | Standard `Field*`/InputWrap pass-throughs                                       |

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

Per-field `lock` flags: `key`, `type`, `required`, `options`, `columns`, `delete`,
`reorder`.
A `lock.reorder` field is position-pinned — it cannot be dragged and no other move may
change its index. **Label and description are always editable**, even on fully locked
fields: the consumer owns a system field's identity, the user owns what it is called.

## i18n

All UI texts go through the `t` prop. English is the built-in default; Slovak ships
bundled and opt-in (importing it is what pulls it into your bundle — English-only
consumers pay nothing).

```svelte
<script>
	import {
		FieldsBuilder,
		createFieldsBuilderT,
		FIELDS_BUILDER_MESSAGES_SK,
		FIELDS_BUILDER_DEFAULT_TYPES_SK,
	} from "@marianmeres/stuic";

	const t = createFieldsBuilderT(FIELDS_BUILDER_MESSAGES_SK);
</script>

<FieldsBuilder bind:value name="fields" types={FIELDS_BUILDER_DEFAULT_TYPES_SK} {t} />
```

`createFieldsBuilderT(messages, fallbackMessages?)` falls back to
`FIELDS_BUILDER_MESSAGES_EN` for any key the catalog does not define, so a partial
catalog is fine and a raw key is never rendered — pass your own object to translate
into a language that is not bundled, or to override individual bundled texts:

```ts
const t = createFieldsBuilderT({
	...FIELDS_BUILDER_MESSAGES_SK,
	label_label: "Otázka",
});
```

Note the palette is separate: `types` is consumer-owned data, so translating the
messages alone would leave the type select in English. `FIELDS_BUILDER_DEFAULT_TYPES_SK`
is the Slovak twin of `FIELDS_BUILDER_DEFAULT_TYPES` (identical `type` values — the
stored defs are unaffected by which one you pass). A palette entry's `label` /
`description` also accept a per-language map (`{ en: "Text", sk: "Text" }`), resolved
against `displayLanguage`.

### Display language vs. default language

With `languages` set, two languages play different roles:

- **`defaultLanguage`** (default `languages[0]`) is the _canonical_ one: the key is
  derived from its label, the "label required" rule checks its entry, and the
  label/description/option editors open on it (the other translations sit behind the
  toggle).
- **`displayLanguage`** (default `defaultLanguage`) is what the component _shows_
  wherever it renders localized data read-only: the collapsed row titles and the
  reorder/delete announcements, the type chips and the type picker, the palette
  descriptions, extras labels/placeholders/descriptions, the built-in preview fallback,
  and the extra's name in `err_extra_maxlength`. A missing translation falls back to
  `defaultLanguage`, then to the first non-empty entry.

So a Slovak user of a schema whose canonical language is English gets a Slovak list and
Slovak chrome (`t`), and still edits the canonical English label first:

```svelte
<FieldsBuilder
	bind:value
	name="fields"
	types={FIELDS_BUILDER_DEFAULT_TYPES_SK}
	languages={["en", "sk"]}
	displayLanguage={user.locale}
	t={createFieldsBuilderT(FIELDS_BUILDER_MESSAGES_SK)}
/>
```

`getLocalizedText(text, preferred)` — exported — accepts the same fallback chain as an
array: `getLocalizedText(label, ["sk", "en"])`. It is the library-wide `tr()` under this
component's name (`LocalizedText` is an alias of `MaybeLocalized`), so a label resolved in
your own `preview` snippet and one resolved by `Nav` or `TabbedMenu` degrade identically.

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
