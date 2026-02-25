# Component Dev Memory

## Confirmed Patterns

### Effect-based cycling (async timer + preload)
When a component must advance state after an async side effect (e.g. image preload + delay),
using `$effect` that assigns a `$state` variable is the accepted pattern. `$derived` cannot
model this because the trigger is a resolved Promise, not a synchronous dependency graph.
The autofixer will warn about it — those warnings are safe to ignore for this use case.

### `bind:this` with `el = $bindable()`
All STUIC components use `bind:this={el}` with `el = $bindable()` as the standard pattern
for element refs. The autofixer may suggest replacing it with an action/attachment — ignore.

### CSS import insertion point
Component CSS imports in `src/lib/index.css` are ordered alphabetically by component name.
Insert new `@import` entries in their correct alphabetical position.

### index.ts export insertion point
Same alphabetical ordering applies to `src/lib/index.ts` component exports.

### twMerge import path
`import { twMerge } from "../../utils/tw-merge.js";`
(not from `tailwind-merge` directly)

### preloadImg import path
`import { preloadImg } from "../../utils/preload-img.js";`
Function signature: `preloadImg({ src: string, srcset?, sizes?, debug? }): Promise<HTMLImageElement>`

### Snippet props pattern
Snippet props are typed as `Snippet<[{ ...args }]>` and rendered with `{@render snippetProp({ ...args })}`.
They are NOT included in `Omit<HTMLXAttributes, "children">` extends — they are standalone Props interfaces.

### Props interface for non-element-wrapping components
Components that render a custom element tree (not a single HTML element wrapper) declare
`Props` as a plain interface without `extends Omit<HTMLXAttributes, ...>`.
