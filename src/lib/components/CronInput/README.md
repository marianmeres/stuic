# CronInput

A cron-expression editor with three progressive surfaces: **preset picker**, **5-field visual editor**, and **raw expression input** — plus a human-readable summary and the next-run preview. Backed by [`@marianmeres/cron`](https://www.npmjs.com/package/@marianmeres/cron).

The cron expression string is the single source of truth; field / preset / raw surfaces are all views over it. All three stay in sync automatically when the bound `value` changes.

## Usage

### Basic (preset picker + manual editor toggle)

```svelte
<script lang="ts">
    import { CronInput } from "@marianmeres/stuic";

    let expression = $state("0 9 * * 1-5");
</script>

<CronInput bind:value={expression} label="Schedule" />
```

Default `mode` is `"predefined"` — users see the preset picker with a toggle button to flip into `"manual"` (5 fields + raw + summary). Setting `mode={undefined}` removes the toggle and shows all surfaces that the `show*` flags enable.

### Flat layout (no toggle, explicit surfaces)

```svelte
<CronInput
    bind:value={expression}
    mode={undefined}
    showPresets
    showFields
    showRawInput
    showDescription
    showNextRun
/>
```

### Custom presets

```svelte
<script lang="ts">
    import { CronInput, type CronPreset } from "@marianmeres/stuic";

    const presets: CronPreset[] = [
        { label: "Top of every hour", value: "0 * * * *" },
        { label: "Daily at 09:00", value: "0 9 * * *" },
        { label: "Every 5 minutes", value: "*/5 * * * *" },
    ];
</script>

<CronInput bind:value={expression} {presets} />
```

### Watching next-run externally

For places outside the CronInput that need the next-fire time (e.g. a dashboard card), use the exported `CronNextRun` helper:

```svelte
<script lang="ts">
    import { CronNextRun } from "@marianmeres/stuic";
    import { onDestroy } from "svelte";

    const nr = new CronNextRun("0 9 * * 1-5");
    onDestroy(() => nr.destroy());
</script>

<p>Next run: {nr.nextRunFormatted}</p>
```

> ⚠️ `CronNextRun` starts a 60-second interval in its constructor. **Always call `destroy()` on teardown**, or it will leak timers for the lifetime of the page.

## Modes

The `mode` prop controls which surfaces are visible and whether the toggle button is shown:

| `mode`              | Toggle shown | Visible surfaces                                     |
| ------------------- | ------------ | ---------------------------------------------------- |
| `"predefined"`      | yes          | preset picker                                        |
| `"manual"`          | yes          | fields + raw + description + next-run                |
| `undefined`         | no           | whatever the `show*` flags enable (full control)     |

When `mode` is defined, it **overrides** the individual `show*` flags. Set `mode={undefined}` if you want to pick surfaces yourself.

## Expression ↔ fields sync

The `value` string is canonical. Internally:

- User edits a field → fields are composed back into an expression; `value` is set only if the result validates.
- User edits the raw input → fields are re-derived from it; invalid input surfaces as a validation message.
- User picks a preset → `value` is set directly.
- External `value` change → fields & raw mirror it (unless the change came from this component in the same tick).

Off-by-one conventions match standard cron:

| Field        | Range  | Notes                                |
| ------------ | ------ | ------------------------------------ |
| minute       | 0-59   |                                      |
| hour         | 0-23   |                                      |
| day of month | 1-31   |                                      |
| month        | 1-12   | 1 = January                          |
| day of week  | 0-6    | 0 = Sunday                           |

## Validation

The component uses `new CronParser(value)` to validate. When invalid:

- The visual invalid state comes from `InputWrap`'s standard validation wrapper (the same mechanism used by every `Field*` component — override via `classInputBoxWrapInvalid`).
- The content div gets a `has-error` class hook you can target with your own CSS. No built-in style is applied to it — it's purely an extension point.
- The `validate` prop (same shape as `FieldInput`'s) is supported; the component reports the parser's error message through the usual validation channel.

## Timezone

All next-run calculations use the **host's local timezone**. There is no `timezone` prop today. DST transitions are handled correctly by `@marianmeres/cron`, but the displayed "next run" will naturally follow local-time semantics.

## Props

| Prop                  | Type                                  | Default         | Description                                          |
| --------------------- | ------------------------------------- | --------------- | ---------------------------------------------------- |
| `value`               | `string`                              | `"* * * * *"`   | Cron expression (bindable)                           |
| `mode`                | `"predefined" \| "manual" \| undefined` | `"predefined"` | Editor mode; `undefined` hides the toggle            |
| `presets`             | `CronPreset[]`                        | `DEFAULT_PRESETS` | Preset options                                     |
| `showPresets`         | `boolean`                             | `true`          | (Ignored when `mode` is defined)                     |
| `showFields`          | `boolean`                             | `true`          | (Ignored when `mode` is defined)                     |
| `showRawInput`        | `boolean`                             | `true`          | (Ignored when `mode` is defined)                     |
| `showDescription`     | `boolean`                             | `true`          | (Ignored when `mode` is defined)                     |
| `showNextRun`         | `boolean`                             | `true`          | (Ignored when `mode` is defined)                     |
| `onchange`            | `(expr, valid) => void`               | -               | Fires on every valid or invalid change               |
| `unstyled`            | `boolean`                             | `false`         | Skip stuic base classes (user provides all styling)  |
| `class`               | `string`                              | -               | Wrapper class                                        |
| `el`                  | `HTMLElement`                         | -               | Bindable wrapper element                             |
| `classFields`/`classField`/`classFieldLabel`/`classFieldInput`/`classPreset`/`classRaw`/`classSummary`/`classToggleButton` | `string` | - | Per-element class overrides |

Plus all standard `InputWrap` wrapper class props (`classLabel`, `classLabelBox`, `classInputBox`, `classInputBoxWrap`, `classInputBoxWrapInvalid`, `classDescBox`, `classBelowBox`) — same pattern as every other `Field*` component.

## Accessibility notes

- The preset select has `aria-label="Cron schedule preset"`.
- Each of the 5 field inputs has `aria-label` combining the short label and its range (e.g. `"Min (0-59)"`).
- The mode toggle button has a dynamic `aria-label` that reflects the target mode.
- Validation errors are announced via the underlying `InputWrap`'s validation message region.

## Limitations

- **No timezone override** — uses host local time.
- **Validation happens on full expression** — no per-field pre-validation; a malformed single field makes the whole expression invalid.
- **Preset match is exact** — if a user's expression is semantically equivalent but formatted differently (e.g. `"0 0 * * 0"` vs `"0 0 * * 7"`) the preset picker shows "Custom".
