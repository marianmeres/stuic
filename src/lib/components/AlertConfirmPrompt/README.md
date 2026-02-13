# AlertConfirmPrompt

A modern, customizable replacement for native browser `alert()`, `confirm()`, and `prompt()` dialogs. Manages a FIFO queue of dialogs with visual variants and flexible content rendering.

## Props

| Prop                 | Type                            | Default | Description                              |
| -------------------- | ------------------------------- | ------- | ---------------------------------------- |
| `acp`                | `AlertConfirmPromptStack`       | -       | Stack instance managing the dialog queue |
| `forceAsHtml`        | `boolean`                       | `false` | Render all content as HTML               |
| `class`              | `string`                        | -       | CSS classes for the modal dialog         |
| `classWrap`          | `string`                        | -       | CSS for outer wrapper                    |
| `classIconBox`       | `string`                        | -       | CSS for icon container                   |
| `classTitle`         | `string`                        | -       | CSS for title text                       |
| `classContent`       | `string`                        | -       | CSS for content area                     |
| `classInput`         | `string`                        | -       | CSS for prompt input field               |
| `classButton`        | `string`                        | -       | CSS for all buttons                      |
| `classButtonPrimary` | `string`                        | -       | CSS for OK button                        |
| `classButtonCancel`  | `string`                        | -       | CSS for Cancel button                    |
| `defaultIcons`       | `Record<variant, () => string>` | -       | Custom icon functions per variant        |

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
- `shift()` - Remove current dialog from queue
- `reset()` - Clear all dialogs

### Dialog Options

| Option        | Type                                       | Description                 |
| ------------- | ------------------------------------------ | --------------------------- |
| `title`       | `THC`                                      | Dialog title                |
| `content`     | `THC`                                      | Dialog message/content      |
| `variant`     | `"info" \| "success" \| "warn" \| "error"` | Visual style                |
| `value`       | `any`                                      | Initial value for prompt    |
| `labelOk`     | `THC`                                      | Custom OK button label      |
| `labelCancel` | `THC`                                      | Custom Cancel button label  |
| `labelCustom` | `THC`                                      | Optional third button label |
| `onCustom`    | `(value) => void`                          | Custom button callback      |

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
