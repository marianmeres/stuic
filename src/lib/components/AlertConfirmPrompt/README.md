# AlertConfirmPrompt

A modern, customizable replacement for native browser `alert()`, `confirm()`, and `prompt()` dialogs. Manages a FIFO queue of dialogs with visual variants and flexible content rendering.

## Props

| Prop                  | Type                            | Default | Description                                                                                                                                      |
| --------------------- | ------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `acp`                 | `AlertConfirmPromptStack`       | -       | Stack instance managing the dialog queue                                                                                                         |
| `forceAsHtml`         | `boolean`                       | `false` | Render all content as HTML                                                                                                                       |
| `class`               | `string`                        | -       | CSS classes for the modal dialog                                                                                                                 |
| `classWrap`           | `string`                        | -       | CSS for outer wrapper                                                                                                                            |
| `classIconBox`        | `string`                        | -       | CSS for icon container                                                                                                                           |
| `classTitle`          | `string`                        | -       | CSS for title text                                                                                                                               |
| `classContent`        | `string`                        | -       | CSS for content area                                                                                                                             |
| `classInput`          | `string`                        | -       | CSS for prompt input field                                                                                                                       |
| `classButton`         | `string`                        | -       | CSS for all buttons                                                                                                                              |
| `classButtonPrimary`  | `string`                        | -       | CSS for OK button                                                                                                                                |
| `classButtonCancel`   | `string`                        | -       | CSS for Cancel button                                                                                                                            |
| `intentButtonPrimary` | `IntentColorKey`                | -       | Intent of the OK button; defaults to `"primary"`, or `"destructive"` for `"warn"` confirm/prompt dialogs (a dialog option of the same name wins) |
| `intentButtonCancel`  | `IntentColorKey`                | -       | Intent of the Cancel button                                                                                                                      |
| `intentButtonCustom`  | `IntentColorKey`                | -       | Intent of the custom button                                                                                                                      |
| `defaultIcons`        | `Record<variant, () => string>` | -       | Custom icon functions per variant                                                                                                                |

## AlertConfirmPromptStack API

### Constructor Options

| Option        | Type                        | Default    | Description                               |
| ------------- | --------------------------- | ---------- | ----------------------------------------- |
| `labelOk`     | `THC`                       | `"OK"`     | Default OK button label                   |
| `labelCancel` | `THC`                       | `"Cancel"` | Default Cancel button label               |
| `iconFn`      | `(() => string) \| boolean` | `true`     | Icon function or `true` for default icons |

### Methods

- `alert(options)` - Show an alert dialog
- `confirm(onOk, options)` - Show a confirm dialog with callback
- `prompt(onOk, options)` - Show a prompt dialog with input field
- `shift()` - Remove current dialog from queue (revealing the next one, if any)
- `escape()` - Run the current dialog's `onEscape` handler (defaults to `shift`); no-op on an empty queue
- `reset()` - Clear all dialogs
- `dump()` - Snapshot of the queue (current dialog first)
- `current` / `length` - The dialog being shown / number of queued dialogs (reactive)

### Closing a dialog: the handler owns the close

A dialog leaves the queue only through `shift()`. Each of `onOk`, `onCancel` and `onEscape`
defaults to `shift` when you do not supply it (so a plain `alert()` closes itself), but as
soon as you pass your own handler, closing is your job: call `acp.shift()` from it when
done. The stack deliberately does not close for you, so an async handler can validate,
stage a second step, or keep a failed action's message on screen. The classic mistake is an
`onOk` that does its work and never shifts: the work happens, the dialog stays, and the user
clicks OK again.

While the promise returned by the handler is pending, the dialog is in a "pending" state
(buttons disabled, spinner shown, Escape refused). Return the promise rather than `void`-ing
it to keep that state for the whole of your work:

```ts
acp.confirm(
	async () => {
		await deleteItem(); // dialog stays up and disabled until this settles
		acp.shift();
	},
	{ title: "Delete?", variant: "warn" }
);
```

If all you want is a dialog that closes when the user answers, use the Promise-based
wrappers (`createAlert`, `createConfirm`, `createPrompt`) below; they shift for you.

### Dialog Options

| Option                                                                        | Type                                       | Description                                                                                     |
| ----------------------------------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `title`                                                                       | `THC`                                      | Dialog title                                                                                    |
| `content`                                                                     | `THC`                                      | Dialog message/content                                                                          |
| `variant`                                                                     | `"info" \| "success" \| "warn" \| "error"` | Visual style (for confirm/prompt, `"warn"` also renders the OK button as `destructive`)         |
| `value`                                                                       | `any`                                      | Initial value for prompt                                                                        |
| `labelOk`                                                                     | `THC`                                      | Custom OK button label                                                                          |
| `labelCancel`                                                                 | `THC`                                      | Custom Cancel button label                                                                      |
| `labelCustom`                                                                 | `THC`                                      | Optional third button label                                                                     |
| `onCustom`                                                                    | `(value) => void`                          | Custom button callback                                                                          |
| `classButton`, `classButtonPrimary`, `classButtonCancel`, `classButtonCustom` | `string`                                   | Per dialog button classes, merged on top of the same named component props                      |
| `intentButtonPrimary`, `intentButtonCancel`, `intentButtonCustom`             | `IntentColorKey`                           | Per dialog button intents, overriding the same named component props (and the `"warn"` default) |

## Usage

### Basic Setup

```svelte
<script lang="ts">
	import { AlertConfirmPrompt, AlertConfirmPromptStack } from "stuic";

	const acp = new AlertConfirmPromptStack();
</script>

<AlertConfirmPrompt {acp} />
```

### Alert

```svelte
<script lang="ts">
	// Simple alert
	acp.alert({ title: "Notice", content: "Operation completed!" });

	// Alert with variant
	acp.alert({
		title: "Error",
		content: "Something went wrong",
		variant: "error",
	});
</script>
```

### Confirm

Supplying `onOk` makes you responsible for closing (see above), hence the `acp.shift()`:

```svelte
<script lang="ts">
	acp.confirm(
		() => {
			console.log("User confirmed!");
			acp.shift();
		},
		{
			title: "Delete Item?",
			content: "This action cannot be undone.",
			variant: "warn",
		}
	);
</script>
```

### Prompt

Same rule: `onOk` receives the entered value and owns the close. The shift may happen at
any time, synchronously or after an `await`:

```svelte
<script lang="ts">
	acp.prompt(
		(value) => {
			console.log("User entered:", value);
			acp.shift();
		},
		{
			title: "Enter Name",
			content: "Please provide your username",
			value: "default_user",
		}
	);
</script>
```

### Promise-based API

```svelte
<script lang="ts">
	import { createAlert, createConfirm, createPrompt } from "stuic";

	const alert = createAlert(acp);
	const confirm = createConfirm(acp);
	const prompt = createPrompt(acp);

	// Use like native dialogs
	await alert("Hello!");

	if (await confirm("Are you sure?")) {
		const name = await prompt("Enter name:", "Anonymous");
		if (name !== null) {
			console.log("Name:", name);
		}
	}
</script>
```
