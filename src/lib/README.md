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
- **FieldKeyValues** - Key-value pairs editor with JSON serialization
- **FieldSwitch** - Toggle switch within a form
- **Fieldset** - Group of form fields with legend

### Buttons & Controls

- **Button** - Styled button with variants (primary, secondary, ghost)
- **ButtonGroupRadio** - Radio-style button group
- **Switch** - Toggle switch component
- **ListItemButton** - Versatile button for list contexts (dropdowns, menus)
- **X** - Close/dismiss button icon

### Feedback & Notifications

- **Notifications** - Toast notification system
- **AlertConfirmPrompt** - Modal dialogs for alerts, confirms, and prompts
- **DismissibleMessage** - Closable message banner
- **Progress** - Progress bar indicator
- **Spinner** - Loading spinner animation
- **Skeleton** - Loading placeholder with shimmer animation

### Navigation & Menus

- **CommandMenu** - Keyboard-driven command palette
- **DropdownMenu** - Anchored dropdown menu with keyboard navigation
- **TabbedMenu** - Tab-based navigation component
- **TypeaheadInput** - Autocomplete text input
- **KbdShortcut** - Keyboard shortcut display

### Utilities

- **ColorScheme** - Dark/light mode management
- **Thc** - Render text, HTML, or component dynamically
- **SlidingPanels** - Animated panel transitions
- **HoverExpandableWidth** - Expand content on hover
- **AnimatedElipsis** - Animated loading dots
- **Collapsible** - Expandable/collapsible content sections
- **AssetsPreview** - Preview uploaded files/images
- **Circle** - Circular container/badge component

## Actions (use:action)

```svelte
<input use:autogrow use:validate={{ required: true }} />
<button use:tooltip aria-label="Tooltip text">Hover me</button>
```

- **autogrow** - Auto-expand textarea height
- **validate** - Form validation with custom validators
- **focusTrap** - Trap focus within element
- **tooltip** - Tooltip from aria-label (CSS anchor positioning)
- **popover** - Anchored popover (CSS anchor positioning)
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

## TypeScript

All components export their Props types:

```ts
import type { ButtonProps, ModalProps, ListItemButtonProps } from "@marianmeres/stuic";

const buttonConfig: Partial<ButtonProps> = {
	variant: "primary",
	size: "lg",
};
```

## Component Token Reference

Each component with customizable styling defines CSS custom properties:

| Component          | Prefix                          | Key Properties                                                     |
| ------------------ | ------------------------------- | ------------------------------------------------------------------ |
| Button             | `--stuic-button-*`              | `bg`, `text`, `border`, `border-focus`                             |
| Switch             | `--stuic-switch-*`              | `accent`                                                           |
| Input              | `--stuic-input-*`               | `accent`, `accent-error`                                           |
| Progress           | `--stuic-progress-*`            | `bg`, `accent`                                                     |
| Skeleton           | `--stuic-skeleton-*`            | `bg`, `bg-highlight`, `duration`                                   |
| ListItemButton     | `--stuic-list-item-button-*`    | `bg`, `text`, `border`, plus `-hover`, `-active`, `-focus` states  |
| ButtonGroupRadio   | `--stuic-button-group-*`        | `bg`, `text`, `border`, `accent`, `bg-active`, `text-active`       |
| TabbedMenu         | `--stuic-tabbed-menu-*`         | `tab-bg`, `tab-text`, `tab-bg-active`, `tab-text-active`, `border` |
| DismissibleMessage | `--stuic-dismissible-message-*` | `bg`, `text`, `border`                                             |
| Notifications      | `--stuic-notification-*`        | `bg`, `text`, `border`                                             |
| Tooltip            | `--stuic-tooltip-*`             | `bg`, `text`                                                       |
| Popover            | `--stuic-popover-*`             | `bg`, `text`, `border`                                             |

### CSS Variable Naming Convention

**Pattern:** `--stuic-{component}-{element?}-{property}-{state?}`

- Full component names (no abbreviations)
- State at end: `--stuic-button-bg-hover`
- No `-dark` suffix (use `.dark {}` selector)

See `AGENTS.md` for complete development guidelines.
