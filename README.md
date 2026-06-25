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

<Button onclick={() => (open = true)}>Open Modal</Button>

<Modal bind:open>
	<p>Hello from Modal!</p>
</Modal>
```

## Theming System

STUIC uses a 4-layer CSS variable token system:

```
Layer 1: Theme Tokens (--stuic-color-*)
    ↓
Layer 2: Structural Tokens (--stuic-radius, --stuic-shadow, --stuic-border-width, --stuic-transition)
    ↓ (used as fallback defaults)
Layer 3: Component Tokens (--stuic-button-radius, --stuic-input-accent, etc.)
    ↓ (Tailwind utility class references)
Layer 4: Instance Overrides (inline styles, class props)
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

### Structural Tokens

Override shared structural tokens to change the entire library's visual character:

```css
/* Brutalist — sharp, flat, borderless */
:root {
	--stuic-radius: 0;
	--stuic-radius-container: 0;
	--stuic-shadow: none;
	--stuic-shadow-hover: none;
	--stuic-shadow-overlay: none;
	--stuic-shadow-dialog: none;
	--stuic-border-width: 0;
}
```

Available tokens: `--stuic-radius`, `--stuic-radius-container`, `--stuic-shadow`, `--stuic-shadow-hover`, `--stuic-shadow-overlay`, `--stuic-shadow-dialog`, `--stuic-border-width`, `--stuic-transition`.

### Per-Component Customization

Override specific component tokens:

```css
:root {
	--stuic-button-radius: 9999px; /* Pill buttons — overrides the shared --stuic-radius */
	--stuic-switch-accent: #10b981; /* Green switches */
}
```

### Instance Overrides

Use `class` props or inline styles:

```svelte
<Button class="bg-purple-500 hover:bg-purple-600 text-white">Custom Button</Button>

<!-- Or use unstyled mode for full control -->
<Button unstyled class="my-custom-button">Fully Custom</Button>
```

### Dark Mode

Add `class="dark"` to the `<html>` element. All tokens switch automatically — no `dark:` Tailwind prefix needed.

### Themes

42 pre-built themes available (from `@marianmeres/design-tokens`). Default: `stone`.

```css
/* Use a different pre-built theme */
@import "@marianmeres/design-tokens/css/blue-orange.css";
```

### Custom Themes

Create your own theme programmatically using the exported types and generation functions:

```ts
import type { ThemeSchema } from "@marianmeres/stuic";
import { generateThemeCss } from "@marianmeres/stuic";
import { stone } from "@marianmeres/design-tokens/themes";

// Extend the stone theme with a custom primary color
const myTheme: ThemeSchema = {
	light: {
		...stone.light,
		colors: {
			...stone.light.colors,
			intent: {
				...stone.light.colors.intent,
				primary: { DEFAULT: "#3b82f6", foreground: "#ffffff", hover: "#2563eb" },
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

AppShell, Accordion, Backdrop, Modal, ModalDialog, Drawer, Collapsible, Header, SlidingPanels, Nav, WithSidePanel

### Forms & Inputs

FieldInput, FieldMoney, FieldTextarea, FieldSelect, FieldCheckbox, FieldRadios, FieldFile, FieldAssets, FieldOptions, FieldKeyValues, FieldObject, FieldSwitch, FieldInputLocalized, FieldLikeButton, FieldPhoneNumber, FieldCountry, CronInput, Fieldset, LoginForm, LoginFormModal, RegisterForm, RegisterFormModal, LoginOrRegisterForm, LoginOrRegisterFormModal, EmailVerifyForm, OtpInput

### Buttons & Controls

Button, ButtonGroupRadio, Switch, TwCheck, ListItemButton, X

### Feedback & Notifications

Notifications, AlertConfirmPrompt, DismissibleMessage, Progress, Spinner (SpinnerCircle, SpinnerCircleOscillate, SpinnerUnicode), Skeleton

### Navigation & Menus

CommandMenu, DropdownMenu, TabbedMenu, TypeaheadInput, KbdShortcut

### Display & Utility

Avatar, Pill, Book, BookResponsive, Card, Carousel, Circle, AnimatedElipsis, H, IconSwap, ImageCycler, Separator, ThemePreview, Tree, ColorScheme, Thc, HoverExpandableWidth, AssetsPreview, AssetsPreviewInline, DataTable

### E-commerce

Cart, Checkout (CheckoutProgress, CheckoutOrderSummary, CheckoutCartReview, CheckoutGuestForm, CheckoutLoginForm, CheckoutGuestOrLoginForm, CheckoutAddressForm, CheckoutDeliveryOptions, CheckoutOrderReview, CheckoutOrderConfirmation, CheckoutReviewStep, CheckoutShippingStep, CheckoutConfirmStep, CheckoutCompleteStep)

## Actions

```svelte
<textarea use:autogrow />
<input use:validate={() => ({ customValidator: (v) => !v && "Required" })} />
<input use:trim />
<button use:tooltip aria-label="Save">Save</button>
<div use:focusTrap>...</div>
<div use:fileDropzone={() => ({ onDrop: handleFiles })}>Drop here</div>
```

`autogrow` · `validate` · `focusTrap` · `autoscroll` · `dimBehind` · `fileDropzone` · `highlightDragover` · `resizableWidth` · `spotlight` · `trim` · `typeahead` · `onSubmitValidityCheck` · `popover` · `tooltip` · `createTour` / `tourStep` (onboarding)

## PWA safe-area insets

When a stuic app is installed and launched standalone (iOS Home Screen, Android/desktop PWA), the web view fills the entire screen, so edge-anchored chrome can render under the status bar / notch / home indicator. stuic ships an **opt-in** safe-area layer that is **inert in a normal browser tab** (`env()` → `0`) and only engages under `@media (display-mode: standalone), (display-mode: fullscreen)`.

> The insets are only non-zero when your app sets `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` (your responsibility) **and** the device has an inset.

**Component props (opt-in):**

- `Header` — `safeArea` offsets the top app bar below the top + side insets. See the [Header README](src/lib/components/Header/README.md). Set it only on the **top** app bar, never on in-page / detail / drawer-internal headers.

**Automatic:**

- `Notifications` — the toast stack always keeps clear of the insets in standalone (you never want a toast under the home indicator).
- `Modal` — when full-bleed (below the `md` breakpoint, where it fills the screen), its content is padded by the insets so header / content / footer clear the system UI. Centered desktop modals are untouched.
- `AssetsPreview` — the lightbox image stays edge-to-edge, but the overlay controls (close, prev/next, dots, filename) are offset so they clear the insets.

All three are no-ops in a browser tab and need no prop.

**Utility classes** — offset any edge-anchored element without writing your own `env()` rule. They are active in standalone only:

```html
<header class="my-top-bar stuic-safe-area-top">…</header>
<footer class="my-bottom-bar stuic-safe-area-bottom">…</footer>
<!-- also: stuic-safe-area-left / stuic-safe-area-right -->
```

> ⚠️ These **set** the padding on their axis (they replace, not add). Apply them only to an element that doesn't already pad that side. To **add** inset on top of existing padding, compose the variables below instead.

**CSS variables** — composable insets (`0px` everywhere, real device insets in standalone):

```css
.my-bottom-bar {
	/* keep my own 1rem and add the home-indicator inset on top */
	padding-bottom: calc(1rem + var(--stuic-safe-area-bottom));
}
/* also: --stuic-safe-area-top / --stuic-safe-area-left / --stuic-safe-area-right */
```

**Pick ONE layer.** Don't pad the same edge twice in a nesting chain. E.g. a nav `Drawer` whose content is its own stuic `Header`: put `safeArea` on the inner `Header`, not also on the drawer panel/wrapper.

**Not covered:** remaining fixed/edge-anchored components (e.g. `Float`, or a bare `ModalDialog` used directly) do not auto-handle insets — apply a `stuic-safe-area-*` class or the variables to their content as needed.

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
