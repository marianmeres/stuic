# PhoneFrame

A phone-shaped bezel around a screenshot — the "picture of the product" on a landing page, a
preview of a page you are about to publish, a device mockup in docs. The screen holds an `<img>`
(`src`), or any content you render yourself (`children`: an iframe, a live component, a video).
With `href` the whole frame is a link to the page it pictures.

The frame is a block element and fills its container: **size it with `class`** (`w-64`,
`max-w-xs mx-auto`, a grid column). The screen is locked to a phone aspect ratio (`390 / 844`,
an iPhone 14 class screen in CSS px) and derives its height from the width, so the frame scales
with its column. Set `screenHeight` to turn the screen into a fixed-height window that shows only
the top of the content — what a visitor sees first — with the rest clipped.

## Props

| Prop            | Type                            | Default  | Description                                                                                                                        |
| --------------- | ------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `src`           | `string`                        | -        | Screenshot URL. Fills the screen (`object-fit: cover`, anchored to the top)                                                        |
| `alt`           | `string`                        | `""`     | Alt text of the screenshot. With `href` it is also the link's accessible name                                                      |
| `width`         | `number \| string`              | -        | Intrinsic pixel width of the screenshot (`<img width>`, reserves space before load). Does **not** size the frame — use `class`     |
| `height`        | `number \| string`              | -        | Intrinsic pixel height of the screenshot (`<img height>`)                                                                          |
| `srcset`        | `string`                        | -        | `<img srcset>` pass-through (1×/2× screenshots)                                                                                    |
| `sizes`         | `string`                        | -        | `<img sizes>` pass-through                                                                                                         |
| `loading`       | `"lazy" \| "eager"`             | `"lazy"` | Image loading. `eager` for a hero (above-the-fold) screenshot                                                                      |
| `fetchpriority` | `"high" \| "low" \| "auto"`     | -        | `<img fetchpriority>` pass-through. `high` for the LCP screenshot                                                                  |
| `children`      | `Snippet`                       | -        | Custom screen content; takes precedence over `src`. Make it fill the screen (`w-full h-full`)                                      |
| `href`          | `string`                        | -        | Makes the whole frame a link (`<a>` instead of `<div>`)                                                                            |
| `target`        | `string`                        | -        | Link target (e.g. `"_blank"`). Only with `href`                                                                                    |
| `rel`           | `string`                        | -        | Link `rel`. Defaults to `"noopener"` when `target` is `"_blank"`                                                                   |
| `aspectRatio`   | `string \| number`              | token    | Screen aspect ratio, any CSS `aspect-ratio` value (`"390 / 844"`, `390 / 844`, `0.46`). Ignored while `screenHeight` is set        |
| `screenHeight`  | `string`                        | -        | Fixed screen height (CSS length): a window showing the top of the content, the rest clipped, the ratio dropped. See Clipped window |
| `notch`         | `"none" \| "island" \| "notch"` | `"none"` | Camera cutout drawn over the top of the screen                                                                                     |
| `unstyled`      | `boolean`                       | `false`  | Skip all default styling                                                                                                           |
| `class`         | `string`                        | -        | Classes for the frame (the bezel). Size the frame here                                                                             |
| `classScreen`   | `string`                        | -        | Classes for the screen (the clipping window inside the bezel)                                                                      |
| `classImage`    | `string`                        | -        | Classes for the `<img>`                                                                                                            |
| `el`            | `HTMLElement`                   | -        | Bindable element reference (the `<div>` or `<a>`)                                                                                  |

Other attributes (`style`, `title`, `aria-*`, `data-*`, `onclick`, …) are spread onto the frame
element.

## Usage

### A screenshot

```svelte
<script lang="ts">
	import { PhoneFrame } from "@marianmeres/stuic";
</script>

<PhoneFrame
	class="w-64"
	src="/examples/apartment-page.webp"
	alt="The apartment's page on a phone: Wi-Fi name and password, the key box code"
	width={780}
	height={1688}
/>
```

Take the screenshot at the screen's CSS size (390×844) on a 2× display and pass the file's pixel
size as `width`/`height`. With `object-fit: cover` a screenshot of a different ratio still fills the
screen; the top stays visible and the bottom is cropped.

### A link to the live page

```svelte
<PhoneFrame
	class="w-64"
	src="/examples/apartment-page.webp"
	alt="Open the live apartment page"
	width={780}
	height={1688}
	href="/i/abc123"
	target="_blank"
/>
```

`target="_blank"` gets `rel="noopener"` unless you pass `rel` yourself. The `alt` is the link's
name — write it as the action, not as a picture description.

### The hero screenshot (LCP)

Everything below the fold stays lazy; the one in the hero should not:

```svelte
<PhoneFrame
	class="w-72"
	{src}
	{alt}
	{width}
	{height}
	loading="eager"
	fetchpriority="high"
/>
```

### Clipped window: the first screen only

On a narrow viewport a whole phone is a tall picture of mostly scrolled-away content. Show the
top rows at a fixed height instead:

```svelte
<PhoneFrame class="w-64" {src} {alt} {width} {height} screenHeight="20rem" />
```

For the common responsive version — clipped on narrow screens, the whole phone from a breakpoint
up — set the token through `class` (it is inherited by the screen) and leave `screenHeight` unset:

```svelte
<PhoneFrame
	class="w-full lg:w-72 [--stuic-phone-frame-screen-height:20rem] lg:[--stuic-phone-frame-screen-height:auto]"
	{src}
	{alt}
	{width}
	{height}
/>
```

Don't combine the two: the `screenHeight` prop is an inline declaration on the screen and beats
an inherited token at every breakpoint.

### Phone cut off by the section edge

The other hero pattern — a phone emerging from the bottom of the section — needs no component
support. Clip the frame with your own wrapper:

```svelte
<div class="max-h-80 overflow-hidden">
	<PhoneFrame class="w-72" {src} {alt} {width} {height} />
</div>
```

### Camera cutout

```svelte
<PhoneFrame class="w-64" {src} {alt} notch="island" />
<PhoneFrame class="w-64" {src} {alt} notch="notch" />
```

The cutout is painted over the screen content in the bezel color, so a screenshot taken in a plain
browser window (no status bar) gets its top few pixels covered. It is `pointer-events: none` and
`aria-hidden`.

### Your own screen content

```svelte
<PhoneFrame class="w-72">
	<iframe src="/preview" title="Live preview" class="w-full h-full border-0"></iframe>
</PhoneFrame>

<PhoneFrame class="w-72" notch="island">
	<div class="w-full h-full overflow-y-auto bg-white p-4 pt-10">
		<!-- a live component tree -->
	</div>
</PhoneFrame>
```

The screen clips (`overflow: hidden`) and has a definite height, so `h-full` on the content
works. Scrolling content needs its own `overflow-y-auto`.

### Another device ratio

```svelte
<!-- a tablet: 3:4 screen, bigger bezel radius -->
<PhoneFrame
	class="w-96"
	aspectRatio="3 / 4"
	style="--stuic-phone-frame-radius: 1.25rem; --stuic-phone-frame-padding: 0.75rem;"
	{src}
	{alt}
/>
```

### Unstyled

```svelte
<PhoneFrame
	unstyled
	class="rounded-3xl bg-zinc-800 p-3"
	classScreen="aspect-[9/19.5] overflow-hidden rounded-2xl"
	classImage="h-full w-full object-cover"
	{src}
	{alt}
/>
```

`unstyled` drops every `stuic-phone-frame*` class and the cutout; the three class props are then
the only styling.

## CSS Variables

### Component Tokens

Override globally in `:root` or locally via the `style` prop:

| Variable                                  | Default                    | Description                                                                                       |
| ----------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------- |
| `--stuic-phone-frame-bg`                  | `#171717`                  | Bezel color                                                                                       |
| `--stuic-phone-frame-padding`             | `0.5rem`                   | Bezel thickness                                                                                   |
| `--stuic-phone-frame-radius`              | `1.75rem`                  | Bezel (outer) corner radius                                                                       |
| `--stuic-phone-frame-border-width`        | `--stuic-border-width`     | Hairline around the bezel (fallback: the shared border-width tier)                                |
| `--stuic-phone-frame-border-color`        | `rgb(0 0 0 / 0.4)`         | Hairline color (`rgb(255 255 255 / 0.15)` in dark mode)                                           |
| `--stuic-phone-frame-shadow`              | `--stuic-shadow-dialog`    | Drop shadow (fallback: the shared dialog shadow tier)                                             |
| `--stuic-phone-frame-screen-bg`           | `--stuic-color-background` | Screen color, visible before the image loads or behind letterboxed content                        |
| `--stuic-phone-frame-screen-radius`       | concentric                 | Screen corner radius. Default: bezel radius − padding − border width                              |
| `--stuic-phone-frame-screen-aspect-ratio` | `390 / 844`                | Screen ratio while the height is `auto`. The `aspectRatio` prop sets it inline                    |
| `--stuic-phone-frame-screen-height`       | `auto`                     | A length makes the screen a clipped window of that height. The `screenHeight` prop sets it inline |
| `--stuic-phone-frame-island-width`        | `32%`                      | Dynamic-island width, relative to the screen width (the height follows, 126:37)                   |
| `--stuic-phone-frame-island-top`          | `3%`                       | Dynamic-island offset from the top. A `%` is relative to the screen **width** (it is a margin)    |
| `--stuic-phone-frame-notch-width`         | `54%`                      | Classic notch width, relative to the screen width (the height follows, 209:30)                    |
| `--stuic-phone-frame-notch-radius`        | `1rem`                     | Classic notch bottom corner radius                                                                |
| `--stuic-phone-frame-notch-bg`            | `--stuic-phone-frame-bg`   | Cutout color (both variants)                                                                      |
| `--stuic-phone-frame-ring-width`          | `3px`                      | Focus ring width (linked frames, `:focus-visible`)                                                |
| `--stuic-phone-frame-ring-offset`         | `2px`                      | Focus ring offset                                                                                 |
| `--stuic-phone-frame-ring-color`          | `--stuic-color-ring`       | Focus ring color                                                                                  |

The radius, border width and shadow intentionally do **not** follow `--stuic-radius-container`:
a device bezel is a hardware shape, not UI chrome. The hairline and shadow do follow the shared
tiers, so a flat theme (`--stuic-border-width: 0; --stuic-shadow-dialog: none`) flattens the phone
too.

### Customization Examples

```css
/* Global — a light "silver" phone */
:root {
	--stuic-phone-frame-bg: #e5e5e5;
	--stuic-phone-frame-border-color: rgb(0 0 0 / 0.15);
}

/* Global — thicker bezel, keeps the screen corners concentric */
:root {
	--stuic-phone-frame-padding: 0.75rem;
	--stuic-phone-frame-radius: 2.25rem;
}
```

```svelte
<!-- Local — no shadow, flat corners -->
<PhoneFrame
	style="--stuic-phone-frame-shadow: none; --stuic-phone-frame-radius: 0.5rem;"
	{src}
	{alt}
/>
```

## Accessibility

- With `href` the frame is a link whose accessible name is the image's `alt` (or your
  `children`'s text). Give it one: an empty `alt` on a linked frame is an unnamed link.
- Without `href` the frame is a plain container; the image is the only content a screen reader
  sees, so a decorative screenshot can keep the default empty `alt`.
- The camera cutout is `aria-hidden` and ignores pointer events.
- Linked frames show a focus ring on `:focus-visible` (`--stuic-phone-frame-ring-*`).

## Theming

Only the screen background (`--stuic-color-background`) and the focus ring (`--stuic-color-ring`)
come from the theme; the bezel is a fixed near-black in both schemes, with a lighter hairline in
dark mode so it keeps an edge against dark page backgrounds.
