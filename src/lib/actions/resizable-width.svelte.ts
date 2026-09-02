import { resizable, type ResizableOptions } from "../attachments/resizable.js";

/**
 * Options for the {@link resizableWidth} action — the `x`-axis
 * {@link ResizableOptions} of the `resizable` attachment with the legacy
 * `onResize` payload shape (`width` instead of `size`).
 */
export interface ResizableWidthOptions extends Omit<
	ResizableOptions,
	"axis" | "onResize"
> {
	onResize?: (info: { width: number; units: "px" | "%"; container: number }) => void;
}

/**
 * A Svelte action that makes an element's width resizable via a drag handle on its
 * right (or, with `reverse`, left) edge.
 *
 * Kept for back-compat: it is a thin wrapper over the `resizable` attachment
 * (`axis: "x"`), so it has everything the attachment has — the handle is a focusable
 * `role="separator"` with arrow / Home / End / Enter keyboard resizing, Pointer Events
 * cover mouse, touch and pen, `min` / `max` clamp, `key` persists, double-click resets.
 * For new code (and for heights) use `{@attach resizable(...)}` directly.
 *
 * @param el - The element to make resizable
 * @param fn - Function returning configuration options (re-runs the action on reactive change)
 *
 * @remarks
 * The `units` option should not be changed dynamically after initialization.
 *
 * @example
 * ```svelte
 * <div
 *   use:resizableWidth={() => ({
 *     initial: 300,
 *     min: 200,
 *     max: 600,
 *     key: 'sidebar',
 *     storage: 'local',
 *     onResize: ({ width }) => console.log('Width:', width)
 *   })}
 *   class="h-full"
 * >
 *   Resizable sidebar content
 * </div>
 *
 * <!-- With percentage units -->
 * <div use:resizableWidth={() => ({ initial: 25, units: '%', max: 50 })}>
 *   ...
 * </div>
 * ```
 */
export function resizableWidth(el: HTMLElement, fn?: () => ResizableWidthOptions) {
	$effect(() => {
		const { onResize, ...rest } = fn?.() || {};
		return resizable({
			...rest,
			axis: "x",
			onResize:
				onResize &&
				(({ size, units, container }) => onResize({ width: size, units, container })),
		})(el);
	});
}
