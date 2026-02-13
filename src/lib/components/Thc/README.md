# Thc

A flexible content renderer supporting multiple content formats: Text, Html, or Component (THC). Used throughout stuic for flexible content rendering in labels, messages, and other dynamic content areas.

## THC Type

```ts
type THC =
	| string // Plain string
	| { text: string } // Explicit text
	| { html: string } // HTML (rendered with @html)
	| { component: Component; props?: {} } // Svelte component
	| { snippet: Snippet } // Svelte snippet
	| Snippet; // Direct snippet function
```

## Props

| Prop                        | Type      | Default | Description                  |
| --------------------------- | --------- | ------- | ---------------------------- |
| `thc`                       | `THC`     | -       | Content to render            |
| `forceAsHtml`               | `boolean` | `false` | Render strings as HTML       |
| `allowCastToStringFallback` | `boolean` | `true`  | Cast unknown types to string |

## Utility Functions

### `isTHCNotEmpty(value)`

Checks if a THC value has renderable content.

```ts
isTHCNotEmpty("Hello"); // true
isTHCNotEmpty({ text: "Hi" }); // true
isTHCNotEmpty(""); // false
isTHCNotEmpty(null); // false
```

### `getTHCStringContent(value)`

Extracts string content from a THC value.

```ts
getTHCStringContent("Hello"); // "Hello"
getTHCStringContent({ text: "Hi" }); // "Hi"
getTHCStringContent({ html: "<b>X</b>" }); // "<b>X</b>"
getTHCStringContent(null); // ""
```

## Usage

### Plain String

```svelte
<script lang="ts">
	import { Thc } from "stuic";
</script>

<Thc thc="Hello World" />
```

### HTML Content

```svelte
<Thc thc={{ html: "<strong>Bold</strong> and <em>italic</em>" }} />
```

### Force String as HTML

```svelte
<Thc thc="<strong>Bold</strong>" forceAsHtml />
```

### Component Content

```svelte
<script lang="ts">
	import MyIcon from "./MyIcon.svelte";
</script>

<Thc
	thc={{
		component: MyIcon,
		props: { size: 24, color: "blue" },
	}}
/>
```

### Snippet Content

```svelte
{#snippet myContent()}
	<span class="custom">Custom snippet content</span>
{/snippet}

<Thc thc={{ snippet: myContent }} />

<!-- Or directly -->
<Thc thc={myContent} />
```

### In Other Components

Many stuic components accept THC for labels and content:

```svelte
<FieldInput
	label="Username"
	description={{ html: "Enter your <strong>unique</strong> username" }}
/>

<DismissibleMessage message={{ text: "Operation completed" }} theme="green" />
```
