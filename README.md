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

## Subpath exports

Most of the library is on the main entry. A few things live behind subpaths:

| Subpath                               | Contents                                                      |
| ------------------------------------- | ------------------------------------------------------------- |
| `@marianmeres/stuic`                  | Components, actions, icons, utils — everything below excepted |
| `@marianmeres/stuic/utils`            | Utilities only, without pulling in components                 |
| `@marianmeres/stuic/phone-validation` | Phone validation helpers                                      |
| `@marianmeres/stuic/markdown-editor`  | `MarkdownEditor` — requires optional peer deps                |
| `@marianmeres/stuic/comment-input`    | `CommentInput` — requires optional peer deps                  |

The last two are **not** on the main entry by design: they depend on Milkdown and
CodeMirror, which are declared as _optional_ peer dependencies. Keeping them off the
barrel means consumers who don't use them never have to install that stack — and,
more importantly, their builds don't fail for want of it.

```ts
import { CommentInput } from "@marianmeres/stuic/comment-input";
```

See each component's README for the peer set to install.

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

FieldInput, FieldMoney, FieldDate, FieldDateRange, Calendar, FieldTextarea, FieldSelect, FieldCheckbox, FieldRadios, FieldFile, FieldAssets, FieldOptions, FieldKeyValues, FieldObject, FieldSwitch, FieldInputLocalized, FieldLikeButton, FieldPhoneNumber, FieldCountry, CronInput, Fieldset, LoginForm, LoginFormModal, RegisterForm, RegisterFormModal, LoginOrRegisterForm, LoginOrRegisterFormModal, EmailVerifyForm, OtpInput

### Buttons & Controls

Button, ButtonGroupRadio, Switch, Slider, TwCheck, ListItemButton, X

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

## Ratio-locked frame (letterbox)

Lock a box to an aspect ratio, size it to whichever axis binds first, centre it, and let the leftover space become letterboxing — a phone-proportioned column on a desktop, a portrait game board, a 16:9 scene nested under a header. The whole idea is one line:

```
width = min(available-width, available-height × ratio)   /* aspect-ratio supplies the height */
```

That formula (plus two guards nobody remembers) is all stuic ships, because it is the only part Tailwind cannot express. The letterbox parent itself is plain utilities: `grid`, `overflow-hidden`, `fixed inset-0`, `bg-*`, and — where you need them — `contain-layout contain-paint`, `overflow-y-auto`, `@container-size`.

**Classes:**

- `.stuic-frame` — the ratio-locked box. Sized against the viewport (`100vw` / `100dvh`), centred with `margin: auto`, `overflow: hidden`.
- `.stuic-frame-cq` — the same box sized in container-query units, for a frame nested inside a layout rather than anchored to the window. Combine with `.stuic-frame`. **Requires** an ancestor with `container-type: size` (Tailwind `@container-size`); `inline-size` is not enough — `cqh` then falls through to the next container, or silently to the viewport, and you get a ratio-correct but wrongly-scaled frame that tracks the window as you resize.
- `.stuic-frame-col` — re-align a viewport-space element (a top-layer `<dialog>`, or an overlay portalled to `<body>`) onto the frame's column.

**Tokens** — all three are your inputs. stuic declares none of them anywhere; the defaults below live only as `var()` fallbacks at the usage sites, so a scoped override on the frame element or on any ancestor works:

| Token                        | Default                             | Meaning                                                          |
| ---------------------------- | ----------------------------------- | ---------------------------------------------------------------- |
| `--stuic-frame-aspect-ratio` | `1`                                 | width ÷ height — anything `aspect-ratio:` accepts                |
| `--stuic-frame-width`        | `min(100vw, 100dvh × aspect-ratio)` | wholesale width override (bail-out value: `100vw`)               |
| `--stuic-frame-height`       | `auto` (⇒ ratio-locked)             | wholesale height override (`100dvh` ⇒ fill height, derive width) |

**Viewport letterbox** — full screen, bars on exactly one axis:

```svelte
<div class="fixed inset-0 grid overflow-hidden bg-neutral-800">
	<div
		class="stuic-frame bg-[var(--stuic-color-surface)]"
		style="--stuic-frame-aspect-ratio: 0.5"
	>
		…
	</div>
</div>
```

**Nested frame** — sized against its parent box instead of the window:

```svelte
<div class="flex h-dvh flex-col">
	<header>…</header>
	<div class="@container-size grid min-h-0 grow overflow-hidden bg-neutral-800">
		<div
			class="stuic-frame stuic-frame-cq bg-[var(--stuic-color-surface)]"
			style="--stuic-frame-aspect-ratio: calc(16 / 9)"
		>
			…
		</div>
	</div>
</div>
```

> ⚠️ **Don't reach for `max-width: 100%; max-height: 100%; aspect-ratio: R`** — the formulation everyone tries first. `max-*` never _grows_ a box, so in a centred grid/flex parent an empty frame measures **0×0**, and one with content shrink-wraps that content and overflows the parent. The ratio usually survives; the size is what's wrong.

> ⚠️ **Never make the frame both the fixed containing block and the scroll container.** `contain-layout contain-paint` together with `overflow-y-auto` on the same element demotes every `position: fixed` descendant to `absolute` against the scroll origin: at `scrollTop: 600` a `Drawer` and its backdrop render at `y = -600`, so the user taps and nothing appears — and `BodyScroll` cannot rescue it, because `document.body` has nothing to scroll in that layout. Scroll an inner element instead, or keep overlays in viewport space and reconcile them with `.stuic-frame-col`.

> ⚠️ **`--stuic-frame-height: 100dvh` is not ratio-locking.** An explicit height beats `aspect-ratio` unconditionally (which is exactly why the bail-out below needs no `!important`), so whenever `100vw < 100dvh × ratio` the frame degenerates to the raw viewport with zero bars on both axes. It looks perfect on a wide desktop and is wrong on the handset you were aiming at. Set it only inside a deliberate bail-out query, and gate that query on more than width:

```css
@media (max-width: 40rem) and (max-aspect-ratio: 3 / 5) {
	:root {
		--stuic-frame-width: 100vw;
		--stuic-frame-height: 100dvh;
	}
}
```

See [CSS presets](docs/domains/css-presets.md) for the classes, the token contract and the decision tree, and [Ratio-Locked Frame](docs/RATIO_LOCKED_FRAME.md) for the full recipe set (including the unit-free `max-*` variant that _does_ work, given a positioned parent) and the measured gotcha list.

> **This preset does not make stuic's own overlays frame-aware.** `Backdrop`, `Modal`, `Drawer` and `Notifications` measure in viewport units — and top-layer geometry (`showModal()`, `popover`) ignores the frame outright, even for a DOM descendant of it. The portalled actions (`popover`, `spotlight`, `dimBehind`) additionally default to `document.body`, so they leave the frame entirely. Either way they fill the window, not the frame. Pass their `container` option where one exists, apply `.stuic-frame-col`, or tweak the affected call sites.

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
