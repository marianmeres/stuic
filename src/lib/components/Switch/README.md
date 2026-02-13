# Switch

A toggle switch component with size variants, semantic intents, keyboard support, and optional async validation.

## Props

| Prop       | Type                                                               | Default | Description                                  |
| ---------- | ------------------------------------------------------------------ | ------- | -------------------------------------------- |
| `checked`  | `boolean`                                                          | -       | Toggle state (bindable)                      |
| `size`     | `"sm" \| "md" \| "lg" \| "xl" \| string`                           | `"lg"`  | Switch size                                  |
| `intent`   | `"primary" \| "accent" \| "success" \| "warning" \| "destructive"` | -       | Semantic color intent                        |
| `name`     | `string`                                                           | -       | Form field name for hidden checkbox          |
| `label`    | `string`                                                           | -       | Screen reader label (visually hidden)        |
| `required` | `boolean`                                                          | `false` | Mark as required                             |
| `disabled` | `boolean`                                                          | `false` | Disable toggle                               |
| `tabindex` | `number`                                                           | `0`     | Tab index                                    |
| `preHook`  | `(current: boolean) => Promise<false \| any>`                      | -       | Async validation (return `false` to prevent) |
| `validate` | `boolean \| ValidateOptions`                                       | -       | Enable validation                            |
| `class`    | `string`                                                           | -       | CSS for switch container                     |
| `dotClass` | `string`                                                           | -       | CSS for toggle knob                          |

## Snippets

| Snippet | Description                        |
| ------- | ---------------------------------- |
| `on`    | Content inside knob when checked   |
| `off`   | Content inside knob when unchecked |

## Usage

### Basic Toggle

```svelte
<script lang="ts">
	import { Switch } from "@marianmeres/stuic";

	let enabled = $state(false);
</script>

<Switch bind:checked={enabled} />
```

### Different Sizes

```svelte
<Switch size="sm" />
<Switch size="md" />
<Switch size="lg" />
<Switch size="xl" />
```

### Semantic Intents

```svelte
<Switch intent="primary" checked />
<Switch intent="success" checked />
<Switch intent="warning" checked />
<Switch intent="destructive" checked />
```

### With Icons Inside

```svelte
<Switch bind:checked={darkMode}>
	{#snippet on()}
		<span class="text-xs">ON</span>
	{/snippet}
	{#snippet off()}
		<span class="text-xs">OFF</span>
	{/snippet}
</Switch>
```

### With Async Validation

```svelte
<script lang="ts">
	let premium = $state(false);

	async function checkPremium(current: boolean) {
		if (!current) {
			const canEnable = await checkSubscription();
			if (!canEnable) {
				alert("Premium subscription required");
				return false;
			}
		}
		return true;
	}
</script>

<Switch bind:checked={premium} preHook={checkPremium} />
```

### In a Form

```svelte
<form>
	<label class="flex items-center gap-2">
		<Switch name="notifications" bind:checked={notifications} />
		<span>Enable notifications</span>
	</label>
</form>
```

### Disabled State

```svelte
<Switch checked={true} disabled />
<Switch checked={false} disabled />
```

## CSS Variables

### Component Tokens

| Variable                        | Default                    | Description           |
| ------------------------------- | -------------------------- | --------------------- |
| `--stuic-switch-track`          | `--stuic-color-border`     | Unchecked track color |
| `--stuic-switch-track-checked`  | `--stuic-color-primary`    | Checked track color   |
| `--stuic-switch-dot`            | `--color-white`            | Knob background color |
| `--stuic-switch-dot-foreground` | `--stuic-color-foreground` | Knob text/icon color  |
| `--stuic-switch-ring-width`     | `4px`                      | Focus ring width      |
| `--stuic-switch-ring-color`     | `--stuic-color-ring`       | Focus ring color      |
| `--stuic-switch-transition`     | `100ms`                    | Transition duration   |

### Example Overrides

```css
/* Global: green switches */
:root {
	--stuic-switch-track-checked: var(--color-green-500);
}
```

```svelte
<!-- Local: orange switch -->
<Switch style="--stuic-switch-track-checked: var(--color-orange-500);" />
```

## Keyboard Support

- **Space**: Toggle switch
- **Enter**: Toggle switch
