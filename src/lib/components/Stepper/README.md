# Stepper

Numbered multi-step progress header for wizard/checkout flows. Renders the steps as
an accessible `<nav>` landmark with an ordered list: completed steps get a check
mark and filled connector, the current step is highlighted (and marked
`aria-current="step"`), upcoming steps stay muted. Display-only by default; pass
`onSelect` to make steps clickable (completed-only by default — the "go back and
revisit" wizard rule).

Pairs naturally with [`@marianmeres/wizard`](https://github.com/marianmeres/wizard)
— `current` is a zero-based index, exactly the wizard's `step.index` (see below).

## Props

| Prop               | Type                             | Default        | Description                                                                                  |
| ------------------ | -------------------------------- | -------------- | -------------------------------------------------------------------------------------------- |
| `steps`            | `(StepperStep \| string)[]`      | required       | The steps; plain strings are shorthand for `{ label }`                                       |
| `current`          | `number`                         | `0`            | Zero-based current step index; `steps.length` = all completed (wizard done); clamped         |
| `onSelect`         | `(index, step) => void`          | -              | Navigation callback; when present, steps render as buttons                                   |
| `clickable`        | `"none" \| "completed" \| "all"` | `"completed"`  | Which steps may be clicked when `onSelect` is present (the current step never fires)         |
| `orientation`      | `"horizontal" \| "vertical"`     | `"horizontal"` | Layout direction                                                                             |
| `labelPosition`    | `"end" \| "below"`               | `"end"`        | Horizontal only: labels beside the indicator, or centered below it (classic checkout header) |
| `disabled`         | `boolean`                        | `false`        | Disable all interaction (e.g. while a step is submitting)                                    |
| `t`                | `TranslateFn`                    | English        | i18n translate function (see below)                                                          |
| `unstyled`         | `boolean`                        | `false`        | Skip all default styling                                                                     |
| `class`            | `string`                         | -              | Additional CSS classes (merged via twMerge)                                                  |
| `classStep`        | `string`                         | -              | Class for every step item (`li`)                                                             |
| `classIndicator`   | `string`                         | -              | Class for the indicator bubble                                                               |
| `classLabel`       | `string`                         | -              | Class for the label                                                                          |
| `classDescription` | `string`                         | -              | Class for the description                                                                    |
| `classConnector`   | `string`                         | -              | Class for the connector line between steps                                                   |
| `el`               | `HTMLElement`                    | -              | Element reference (bindable)                                                                 |

### `StepperStep`

| Field         | Type      | Description                                                                                       |
| ------------- | --------- | ------------------------------------------------------------------------------------------------- |
| `label`       | `THC`     | Step label (text, html, or component — see `Thc`)                                                 |
| `description` | `THC`     | Optional secondary line under the label                                                           |
| `icon`        | `string`  | Raw svg/html string rendered in the indicator instead of the number (completed/error markers win) |
| `error`       | `boolean` | Marks the step as failed — destructive coloring + "×" indicator                                   |
| `disabled`    | `boolean` | Never clickable, regardless of the `clickable` policy                                             |

## Snippet Props

| Snippet           | Description                                                    |
| ----------------- | -------------------------------------------------------------- |
| `renderIndicator` | Override the bubble content; receives `{ index, step, state }` |

## Usage

### Basic

```svelte
<script lang="ts">
	import { Stepper } from "@marianmeres/stuic";

	let current = $state(1);
</script>

<Stepper steps={["Account", "Payment", "Confirm"]} {current} />
```

### Clickable (go back to a completed step)

```svelte
<Stepper
	steps={["Account", "Payment", "Confirm"]}
	{current}
	onSelect={(index) => (current = index)}
/>

<!-- free navigation to any non-disabled step -->
<Stepper {steps} {current} clickable="all" onSelect={(index) => (current = index)} />
```

### Descriptions, error state

```svelte
<Stepper
	current={2}
	steps={[
		{ label: "Account", description: "Your credentials" },
		{ label: "Payment", description: "Card details", error: true },
		{ label: "Confirm", description: "Review the order" },
	]}
/>
```

### Vertical / labels below

```svelte
<Stepper {steps} {current} orientation="vertical" />
<Stepper {steps} {current} labelPosition="below" />
```

### With `@marianmeres/wizard`

`current` is a zero-based index, exactly the wizard's `step.index`:

```svelte
<script lang="ts">
	import { Stepper } from "@marianmeres/stuic";
	import { createWizard } from "@marianmeres/wizard";

	const wizard = createWizard("checkout", {
		steps: [{ label: "Account" }, { label: "Payment" }, { label: "Confirm" }],
	});
</script>

<Stepper
	steps={$wizard.steps.map((s) => ({ label: s.label, error: !!s.error }))}
	current={$wizard.isDone ? $wizard.steps.length : $wizard.step.index}
/>
```

### i18n

Built-in English; bundled Slovak (`STEPPER_MESSAGES_SK`) is opt-in. Only the `<nav>`
landmark label and the screen-reader-only step announcements are localized — the
step labels are yours.

```svelte
<script lang="ts">
	import { Stepper, createStepperT, STEPPER_MESSAGES_SK } from "@marianmeres/stuic";
	const t = createStepperT(STEPPER_MESSAGES_SK);
</script>

<Stepper {steps} {current} {t} />
```

### Custom indicator

```svelte
<Stepper {steps} {current}>
	{#snippet renderIndicator({ index, state })}
		{state === "completed" ? "✓" : index + 1}
	{/snippet}
</Stepper>
```

## Accessibility

- Renders a `<nav aria-label="Progress">` landmark (label localized via `t`) with an
  ordered list; the current step is marked `aria-current="step"`.
- The indicator bubble is `aria-hidden` — a visually hidden text announces
  "Step X of Y" plus the completed/failed state instead, so icon-only information is
  never lost to screen readers.
- Clickable steps are real `<button>`s; ineligible ones are disabled.

## CSS Variables

| Variable                                                               | Default                            | Description                              |
| ---------------------------------------------------------------------- | ---------------------------------- | ---------------------------------------- |
| `--stuic-stepper-gap`                                                  | `0.75rem`                          | Indicator↔label gap + step↔connector gap |
| `--stuic-stepper-gap-vertical`                                         | `1.75rem`                          | Vertical: distance between steps         |
| `--stuic-stepper-connector-min-length`                                 | `1.5rem`                           | Horizontal: shortest connector           |
| `--stuic-stepper-indicator-size`                                       | `2rem`                             | Bubble diameter                          |
| `--stuic-stepper-indicator-border-width`                               | `2px`                              | Bubble border width                      |
| `--stuic-stepper-indicator-radius`                                     | full circle                        | Bubble radius                            |
| `--stuic-stepper-indicator-font-size`                                  | `--text-sm`                        | Bubble number font size                  |
| `--stuic-stepper-indicator-bg` / `-text` / `-border`                   | upcoming colors                    | Bubble, upcoming state                   |
| `--stuic-stepper-indicator-bg-current` / `-text-current` / …           | `--stuic-color-primary` accents    | Bubble, current state                    |
| `--stuic-stepper-indicator-bg-completed` / `-text-completed` / …       | `--stuic-color-primary` filled     | Bubble, completed state                  |
| `--stuic-stepper-indicator-bg-error` / `-text-error` / `-border-error` | `--stuic-color-destructive` filled | Bubble, error state                      |
| `--stuic-stepper-label-font-size`                                      | `--text-base`                      | Label font size                          |
| `--stuic-stepper-label-text` / `-text-current` / `-text-completed` / … | muted / foreground / destructive   | Label color per state                    |
| `--stuic-stepper-description-font-size`                                | `--text-sm`                        | Description font size                    |
| `--stuic-stepper-description-text`                                     | `--stuic-color-muted-foreground`   | Description color                        |
| `--stuic-stepper-connector-thickness`                                  | `2px`                              | Connector line thickness                 |
| `--stuic-stepper-connector-bg` / `-bg-completed`                       | border / primary                   | Connector color                          |
| `--stuic-stepper-ring-width` / `--stuic-stepper-ring-color`            | `3px` / `--stuic-color-ring`       | Focus ring of clickable steps            |
| `--stuic-stepper-opacity-disabled`                                     | `0.5`                              | Disabled opacity                         |

## Data Attributes

- `data-orientation` - `"horizontal" | "vertical"` (root)
- `data-label-position` - `"end" | "below"` (root, horizontal only)
- `data-disabled` - empty attribute (root when `disabled`; step `li` when `step.disabled`)
- `data-state` - `"completed" | "current" | "upcoming"` (step `li`); `"completed"` on filled connectors
- `data-error` - empty attribute (step `li` when `step.error`)
