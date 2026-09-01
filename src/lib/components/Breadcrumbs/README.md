# Breadcrumbs

Breadcrumb navigation trail — `<nav>` + ordered list of links with the current page
marked, an optional collapse of long trails into an expandable ellipsis, and
schema.org `BreadcrumbList` JSON-LD helpers for SEO.

## Props

| Prop                  | Type                     | Default | Description                                                        |
| --------------------- | ------------------------ | ------- | ------------------------------------------------------------------ |
| `items`               | `BreadcrumbItem[]`       | -       | The trail, first-to-current; the last item is the current page     |
| `separator`           | `string`                 | `"/"`   | Separator text between crumbs                                      |
| `maxItems`            | `number`                 | `0`     | Collapse when there are more crumbs than this; `0` never collapses |
| `itemsBeforeCollapse` | `number`                 | `1`     | Leading crumbs kept visible when collapsed                         |
| `itemsAfterCollapse`  | `number`                 | `1`     | Trailing crumbs kept visible when collapsed                        |
| `jsonLd`              | `boolean \| { baseUrl }` | `false` | Render schema.org `BreadcrumbList` JSON-LD along with the trail    |
| `t`                   | `TranslateFn`            | English | i18n translate function (see below)                                |
| `unstyled`            | `boolean`                | `false` | Skip all default styling                                           |
| `class`               | `string`                 | -       | Additional CSS classes (merged via twMerge)                        |
| `classItem`           | `string`                 | -       | Class for every `<li>`                                             |
| `classLink`           | `string`                 | -       | Class for every crumb link                                         |
| `classCurrent`        | `string`                 | -       | Extra class for the current (last) crumb                           |
| `classSeparator`      | `string`                 | -       | Class for the separator                                            |
| `el`                  | `HTMLElement`            | -       | Element reference (bindable)                                       |

`BreadcrumbItem`: `{ label: string; href?: string }` — omit `href` to render a plain
(non-link) crumb, typical for the last item (the current page).

## Snippet Props

| Snippet           | Description                                            |
| ----------------- | ------------------------------------------------------ |
| `renderItem`      | Override every crumb; receives `(item, index, isLast)` |
| `renderSeparator` | Override the separator between crumbs                  |

## Usage

### Basic

```svelte
<script lang="ts">
	import { Breadcrumbs } from "@marianmeres/stuic";

	const items = [
		{ label: "Home", href: "/" },
		{ label: "Products", href: "/products" },
		{ label: "Phones" }, // current page — no href
	];
</script>

<Breadcrumbs {items} />
```

### Custom separator

```svelte
<Breadcrumbs {items} separator="›" />

<!-- or any markup -->
<Breadcrumbs {items}>
	{#snippet renderSeparator()}
		<ChevronIcon />
	{/snippet}
</Breadcrumbs>
```

### Long trails (collapse)

Trails longer than `maxItems` collapse their middle into an ellipsis button;
clicking it expands the full trail. A new `items` array (navigation) collapses it
again.

```svelte
<Breadcrumbs {items} maxItems={4} itemsBeforeCollapse={1} itemsAfterCollapse={2} />
```

### SEO structured data (JSON-LD)

Search engines read breadcrumb trails from schema.org `BreadcrumbList` structured
data. Either let the component render it inline (JSON-LD is valid anywhere in the
document):

```svelte
<Breadcrumbs {items} jsonLd={{ baseUrl: page.url.origin }} />
```

...or keep it in the head via the pure helper (SvelteKit):

```svelte
<script lang="ts">
	import { Breadcrumbs, breadcrumbsJsonLdScript } from "@marianmeres/stuic";
	import { page } from "$app/state";
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- helper escapes angle brackets -->
	{@html breadcrumbsJsonLdScript(items, { baseUrl: page.url.origin })}
</svelte:head>

<Breadcrumbs {items} />
```

Notes:

- crumbs without `href` (the current page) are emitted without `item`, exactly per
  Google's guidelines;
- `baseUrl` resolves relative `href`s to the absolute URLs Google recommends;
- the emitted JSON is `\uXXXX`-escaped (`<`, `>`, `&`), so it is safe for `{@html}`
  — a label can never break out of the script element;
- `breadcrumbsJsonLd(items, options?)` returns the raw object if you prefer to
  serialize yourself.

### Custom crumb rendering

```svelte
<Breadcrumbs {items}>
	{#snippet renderItem(item, index, isLast)}
		{#if index === 0}
			<a href={item.href} aria-label={item.label}><HomeIcon /></a>
		{:else if isLast}
			<span aria-current="page">{item.label}</span>
		{:else}
			<a href={item.href}>{item.label}</a>
		{/if}
	{/snippet}
</Breadcrumbs>
```

### i18n

Built-in English; bundled Slovak (`BREADCRUMBS_MESSAGES_SK`) is opt-in.

```svelte
<script lang="ts">
	import {
		Breadcrumbs,
		createBreadcrumbsT,
		BREADCRUMBS_MESSAGES_SK,
	} from "@marianmeres/stuic";
	const t = createBreadcrumbsT(BREADCRUMBS_MESSAGES_SK);
</script>

<Breadcrumbs {items} {t} />
```

## Accessibility

- Renders a `<nav aria-label="Breadcrumb">` landmark (label localized via `t`)
  containing an ordered list — the WAI-ARIA APG breadcrumb pattern.
- The last crumb carries `aria-current="page"` (link or plain span alike).
- Separators are `aria-hidden`.
- The collapse ellipsis is a real `<button>` with a localized `aria-label`.

## Exports

Besides the component: `breadcrumbsJsonLd` / `breadcrumbsJsonLdScript` (schema.org
`BreadcrumbList` helpers), `createBreadcrumbsT` + message catalogs (i18n).

## CSS Variables

| Variable                                  | Default                          | Description                          |
| ----------------------------------------- | -------------------------------- | ------------------------------------ |
| `--stuic-breadcrumbs-gap`                 | `0.375rem`                       | Gap between crumbs and separators    |
| `--stuic-breadcrumbs-font-size`           | `--text-sm`                      | Trail font size                      |
| `--stuic-breadcrumbs-text`                | `--stuic-color-muted-foreground` | Link / plain crumb color             |
| `--stuic-breadcrumbs-text-hover`          | `--stuic-color-foreground`       | Link hover color                     |
| `--stuic-breadcrumbs-text-current`        | `--stuic-color-foreground`       | Current crumb color                  |
| `--stuic-breadcrumbs-font-weight-current` | `500`                            | Current crumb font weight            |
| `--stuic-breadcrumbs-separator-text`      | `--stuic-color-muted-foreground` | Separator color                      |
| `--stuic-breadcrumbs-transition`          | `--stuic-transition`             | Hover transition duration (fallback) |

## Data Attributes

- `data-current` - `"true"` on the current (last) crumb's `<li>`
