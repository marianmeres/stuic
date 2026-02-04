# Utils Domain

## Overview

45+ utility functions for common tasks. Organized by category.

---

## Reactive State (.svelte.ts)

State utilities using Svelte 5 runes:

| Util | Purpose |
|------|---------|
| `localStorageState` | Persist state to localStorage |
| `sessionStorageState` | Persist state to sessionStorage |
| `breakpoint` | Reactive responsive breakpoint |
| `devicePointer` | Detect pointer type (mouse/touch) |
| `prefersReducedMotion` | Detect motion preference |
| `observeExists` | Observe element existence |
| `inputHistory` | Input undo/redo history |
| `switch` | Toggle state factory |

### Example: Persistent State

```ts
import { localStorageState } from "@marianmeres/stuic";

let theme = localStorageState("theme", "light");
// theme.value is reactive and persisted
theme.value = "dark";
```

---

## DOM Utilities

| Util | Purpose |
|------|---------|
| `qsa` | querySelectorAll wrapper |
| `bodyScrollLocker` | Lock/unlock body scroll |
| `anchorName` | Generate CSS anchor-positioning names |
| `getId` | Generate unique IDs |

---

## String / Data

| Util | Purpose |
|------|---------|
| `ucfirst` | Capitalize first letter |
| `nl2br` | Convert newlines to `<br>` |
| `unaccent` | Remove diacritics |
| `escapeRegex` | Escape regex special chars |
| `strHash` | Simple string hash |
| `tr` | Simple i18n translation helper |
| `replaceMap` | Bulk string replacement |

---

## Functions

| Util | Purpose |
|------|---------|
| `debounce` | Debounce function calls |
| `throttle` | Throttle function calls |
| `sleep` | Promise-based delay |
| `seconds` | Time unit conversion |
| `eventEmitter` | Pub/sub event pattern |
| `eventModifiers` | Keyboard/mouse event helpers |

### Example: Debounce

```ts
import { debounce } from "@marianmeres/stuic";

const search = debounce((query: string) => {
  fetchResults(query);
}, 300);
```

---

## Type Checks

| Util | Purpose |
|------|---------|
| `isNullish` | Check null/undefined |
| `isPlainObject` | Check plain object |
| `isImage` | Check if file is image |
| `isBrowser` | Check browser environment |
| `isMac` | Check macOS |

---

## Data Handling

| Util | Purpose |
|------|---------|
| `maybeJsonParse` | Safe JSON.parse |
| `maybeJsonStringify` | Safe JSON.stringify |
| `toInteger` | Safe integer conversion |
| `omit` | Omit object keys |
| `pick` | Pick object keys |
| `moveArrayItem` | Reorder array items |

---

## Visual

| Util | Purpose |
|------|---------|
| `twMerge` | Tailwind class merging |
| `colors` | Color manipulation |
| `avatarColors` | Deterministic avatar colors |
| `paint` | HSL color generation |
| `svgCircle` | SVG circle path |
| `oscillate` | Value oscillation for animation |

### Example: Class Merging

```ts
import { twMerge } from "@marianmeres/stuic";

// Handles Tailwind class conflicts
twMerge("px-4 py-2", "px-6"); // => "py-2 px-6"
```

---

## Files

| Util | Purpose |
|------|---------|
| `fileFromBlobUrl` | Convert blob URL to File |
| `forceDownload` | Trigger file download |
| `preloadImg` | Preload images |
| `getFileTypeLabel` | Human-readable file type |

---

## Design Tokens

| Util | Purpose |
|------|---------|
| `generateCssTokens` | Convert token schema to CSS |
| `toCssString` | Format tokens as CSS string |
| `createDarkOverride` | Generate dark mode overrides |

---

## Key Files

| File | Purpose |
|------|---------|
| src/lib/utils/index.ts | All utility exports |
| src/lib/utils/tw-merge.ts | Critical for class merging |
| src/lib/utils/persistent-state.svelte.ts | Reactive storage pattern |
| src/lib/utils/design-tokens.ts | Theme token types |
