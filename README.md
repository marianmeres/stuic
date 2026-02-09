# @marianmeres/stuic

[![NPM](https://img.shields.io/npm/v/@marianmeres/stuic)](https://www.npmjs.com/package/@marianmeres/stuic)
[![License](https://img.shields.io/npm/l/@marianmeres/stuic)](LICENSE)

**S**velte **T**ailwind **UI** **C**omponents — an opinionated Svelte 5 component library built with Tailwind CSS v4. Featuring a centralized design token system for consistent theming across all components.

## Installation

```bash
npm install @marianmeres/stuic
```

## Usage

```svelte
<script>
  import { Button, Modal } from "@marianmeres/stuic";

  let open = $state(false);
</script>

<Button onclick={() => open = true}>Open Modal</Button>

<Modal bind:open>
  <p>Hello from Modal!</p>
</Modal>
```

## Theming System

STUIC uses a 3-layer CSS variable token system:

```
Layer 1: Theme Tokens (--stuic-color-*)
    ↓ (used as fallback defaults)
Layer 2: Component Tokens (--stuic-button-bg, --stuic-input-accent, etc.)
    ↓ (Tailwind utility class references)
Layer 3: Instance Overrides (inline styles, class props)
```

### Global Theming

Override theme tokens in your app's CSS:

```css
:root {
  --stuic-color-primary: #6366f1;
  --stuic-color-primary-hover: #4f46e5;
}

:root.dark {
  --stuic-color-primary: #818cf8;
}
```

### Per-Component Customization

Override specific component tokens:

```css
:root {
  --stuic-button-radius: 9999px;  /* Pill buttons */
  --stuic-switch-accent: #10b981; /* Green switches */
}
```

### Instance Overrides

Use `class` props or inline styles:

```svelte
<Button class="bg-purple-500 hover:bg-purple-600 text-white">
  Custom Button
</Button>

<!-- Or use unstyled mode for full control -->
<Button unstyled class="my-custom-button">
  Fully Custom
</Button>
```

### Dark Mode

Add `class="dark"` to the `<html>` element. All tokens switch automatically — no `dark:` Tailwind prefix needed.

### Themes

26 pre-built themes available. Default: `stone`.

```css
/* Use a different pre-built theme */
@import "@marianmeres/stuic/themes/css/blue-orange.css";
```

### Custom Themes

Create your own theme programmatically using the exported types and generation functions:

```ts
import type { ThemeSchema } from '@marianmeres/stuic';
import { generateThemeCss } from '@marianmeres/stuic';
import stone from '@marianmeres/stuic/themes/stone';

// Extend the stone theme with a custom primary color
const myTheme: ThemeSchema = {
  light: {
    ...stone.light,
    colors: {
      ...stone.light.colors,
      intent: {
        ...stone.light.colors.intent,
        primary: { DEFAULT: '#3b82f6', foreground: '#ffffff', hover: '#2563eb' },
      },
    },
  },
  dark: stone.dark,
};

// Generate CSS string — write to a file in your build pipeline
const css = generateThemeCss(myTheme);
```

See [API.md](API.md) for the full list of exported theme types (`ThemeSchema`, `TokenSchema`, `ColorPair`, `ColorValue`, `SingleColor`).

## Components

### Layout & Overlays
AppShell, Backdrop, Modal, ModalDialog, Drawer, Collapsible, SlidingPanels, Nav

### Forms & Inputs
FieldInput, FieldTextarea, FieldSelect, FieldCheckbox, FieldRadios, FieldFile, FieldAssets, FieldOptions, FieldKeyValues, FieldSwitch, FieldInputLocalized, FieldLikeButton, Fieldset

### Buttons & Controls
Button, ButtonGroupRadio, Switch, TwCheck, ListItemButton, X

### Feedback & Notifications
Notifications, AlertConfirmPrompt, DismissibleMessage, Progress, Spinner, Skeleton

### Navigation & Menus
CommandMenu, DropdownMenu, TabbedMenu, TypeaheadInput, KbdShortcut

### Display & Utility
Avatar, Carousel, AnimatedElipsis, ThemePreview, ColorScheme, Thc, HoverExpandableWidth, AssetsPreview, DataTable

### E-commerce
Cart, Checkout (CheckoutProgress, CheckoutOrderSummary, CheckoutCartReview, CheckoutGuestForm, CheckoutLoginForm, CheckoutAddressForm, CheckoutDeliveryOptions, CheckoutOrderReview, CheckoutOrderConfirmation, CheckoutReviewStep, CheckoutShippingStep, CheckoutConfirmStep, CheckoutCompleteStep)

## Actions

```svelte
<textarea use:autogrow />
<input use:validate={() => ({ customValidator: (v) => !v && "Required" })} />
<input use:trim />
<button use:tooltip aria-label="Save">Save</button>
<div use:focusTrap>...</div>
<div use:fileDropzone={() => ({ onDrop: handleFiles })}>Drop here</div>
```

`autogrow` · `validate` · `focusTrap` · `autoscroll` · `fileDropzone` · `highlightDragover` · `resizableWidth` · `trim` · `typeahead` · `onSubmitValidityCheck` · `popover` · `tooltip`

## TypeScript

All components export their Props types:

```ts
import type { ButtonProps, ModalProps, FieldInputProps } from "@marianmeres/stuic";
```

## API

See [API.md](API.md) for complete API documentation including all component props, actions, utilities, icons, and design token reference.

## Requirements

- Svelte 5 (runes mode)
- Tailwind CSS v4
- Modern browser with CSS custom properties support

## License

[MIT](LICENSE)
