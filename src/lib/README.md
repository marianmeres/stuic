# Stuic - Svelte Tailwind UI Components

An opinionated Svelte 5 component library built with TailwindCSS v4.

## Installation

```bash
npm install @marianmeres/stuic
```

## Quick Start

```svelte
<script>
	import { Button, Modal } from "@marianmeres/stuic";

	let modal;
</script>

<Button onclick={() => modal.open()}>Open Modal</Button>

<Modal bind:this={modal}>
	<p>Hello from Modal!</p>
</Modal>
```

## Components

### Layout & Overlays

- **AppShell** - Application layout wrapper with header, sidebar, main content
- **Backdrop** - Fullscreen overlay with transitions
- **Modal** - Dialog overlay with focus trap and scroll lock
- **ModalDialog** - Pre-styled modal with header/content/actions slots
- **Drawer** - Slide-in panel from screen edges

### Forms & Inputs

- **FieldInput** - Text input with label, validation, description
- **FieldTextarea** - Multiline text input with autogrow support
- **FieldSelect** - Native select dropdown
- **FieldCheckbox** - Checkbox with label and validation
- **FieldRadios** - Radio button group
- **FieldFile** - File upload input
- **FieldAssets** - Multi-file upload with preview
- **FieldOptions** - Modal-based multi-select picker
- **FieldSwitch** - Toggle switch within a form
- **Fieldset** - Group of form fields with legend

### Buttons & Controls

- **Button** - Styled button with variants (primary, secondary, ghost)
- **ButtonGroupRadio** - Radio-style button group
- **Switch** - Toggle switch component
- **X** - Close/dismiss button icon

### Feedback & Notifications

- **Notifications** - Toast notification system
- **AlertConfirmPrompt** - Modal dialogs for alerts, confirms, and prompts
- **DismissibleMessage** - Closable message banner
- **Progress** - Progress bar indicator
- **Spinner** - Loading spinner animation

### Navigation & Interaction

- **CommandMenu** - Keyboard-driven command palette
- **TypeaheadInput** - Autocomplete text input
- **KbdShortcut** - Keyboard shortcut display

### Utilities

- **ColorScheme** - Dark/light mode management
- **Thc** - Render text, HTML, or component dynamically
- **SlidingPanels** - Animated panel transitions
- **HoverExpandableWidth** - Expand content on hover
- **AnimatedElipsis** - Animated loading dots

## Actions (use:action)

```svelte
<input use:autogrow use:validate={{ required: true }} />
```

- **autogrow** - Auto-expand textarea height
- **validate** - Form validation with custom validators
- **focusTrap** - Trap focus within element
- **tooltip** - Tooltip from aria-label
- **fileDropzone** - Drag-and-drop file upload
- **highlightDragover** - Visual feedback for drag operations

## Utilities

```ts
import { debounce, throttle, twMerge, localStorageState } from "@marianmeres/stuic";
```

- **debounce/throttle** - Function rate limiting
- **twMerge** - Merge Tailwind classes intelligently
- **localStorageState** - Reactive localStorage wrapper
- **sessionStorageState** - Reactive sessionStorage wrapper
- **omit/pick** - Object key filtering
- **getId** - Generate unique IDs
- **EventEmitter** - Typed event emitter

## Theming

Components use CSS custom properties for theming. Override in your CSS:

```css
:root {
	--color-button-bg: theme("colors.blue.500");
	--color-button-text: white;
	--color-input-accent: theme("colors.blue.500");
	/* ... */
}
```

See `src/lib/theme.css` for all available custom properties.

## TypeScript

All components export their Props types:

```ts
import type { ButtonProps, ModalProps } from "@marianmeres/stuic";

const buttonConfig: Partial<ButtonProps> = {
	variant: "primary",
	size: "lg",
};
```
