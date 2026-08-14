/**
 * Helpers for working with the containing block (CB) of `position: fixed`
 * elements.
 *
 * A fixed-positioned element resolves against the viewport UNLESS an ancestor
 * establishes a fixed containing block — via `transform`/`translate`/`rotate`/
 * `scale`/`perspective`/`filter`/`backdrop-filter`, a `will-change` naming any
 * of those, or layout/paint containment (`contain: layout|paint|strict|content`,
 * which `content-visibility: auto` also applies). Overlay code that measures
 * "does this fixed element fit" must therefore compare against the CB rect,
 * not `window.innerWidth/innerHeight` — the two only coincide in the (common)
 * no-such-ancestor case.
 */

/**
 * `will-change` values that force a fixed containing block: any property whose
 * non-initial value would form one. (Same set floating-ui checks.)
 */
const WILL_CHANGE_RE = /transform|translate|scale|rotate|perspective|filter/;

/** `contain` values that apply layout and/or paint containment. */
const CONTAIN_RE = /paint|layout|strict|content/;

let _isWebKit: boolean | undefined;

/**
 * WebKit (Safari) detection — the same probe floating-ui uses. Only Safari
 * supports the `-webkit-` prefixed backdrop-filter.
 */
function isWebKit(): boolean {
	if (_isWebKit === undefined) {
		_isWebKit =
			typeof CSS !== "undefined" &&
			typeof CSS.supports === "function" &&
			CSS.supports("-webkit-backdrop-filter", "none");
	}
	return _isWebKit;
}

function notNone(value: string | undefined): boolean {
	return !!value && value !== "none";
}

// Elements promoted to the TOP LAYER (modal dialogs via `showModal()`, open
// `[popover]`s, fullscreen elements) escape every ancestor containing block by
// design — their fixed descendants resolve against the viewport again. Each
// selector is probed separately: an engine that doesn't know one would
// otherwise reject the whole list.
const TOP_LAYER_SELECTORS = [":modal", ":popover-open", ":fullscreen"];

function isTopLayer(el: Element): boolean {
	return TOP_LAYER_SELECTORS.some((s) => {
		try {
			return el.matches(s);
		} catch {
			return false;
		}
	});
}

/**
 * Does this element establish a containing block for `position: fixed`
 * descendants?
 *
 * Mirrors floating-ui's battle-tested `isContainingBlock`, with the same two
 * deliberate omissions relative to a naive reading of MDN:
 *
 * - `filter`/`backdrop-filter` are ignored on WebKit: Safari historically does
 *   NOT form a fixed CB from them (plain `filter` was only fixed in Safari 26).
 *   Misdetecting a CB the browser doesn't honor would break correct layouts;
 *   missing one merely preserves the pre-CB-aware behavior.
 * - `container-type` is NOT checked: the CSSWG removed layout containment from
 *   it (2024, csswg-drafts#10544) and Chrome 129+/Firefox/Safari all shipped
 *   the change, so container queries no longer re-parent fixed descendants.
 */
export function isFixedContainingBlock(el: Element): boolean {
	const s = getComputedStyle(el);
	return (
		notNone(s.transform) ||
		notNone(s.translate) ||
		notNone(s.rotate) ||
		notNone(s.scale) ||
		notNone(s.perspective) ||
		(!isWebKit() && (notNone(s.filter) || notNone(s.backdropFilter))) ||
		s.contentVisibility === "auto" ||
		WILL_CHANGE_RE.test(s.willChange) ||
		CONTAIN_RE.test(s.contain)
	);
}

/**
 * The nearest ancestor of `el` that establishes a containing block for
 * `position: fixed` descendants, or `null` when fixed descendants resolve
 * against the viewport. The walk stops (returning `null`) at top-layer
 * elements — a modal `<dialog>`, an open `[popover]`, a fullscreen element —
 * since the top layer escapes every ancestor containing block by design
 * (unless such an element is itself CB-forming, e.g. a transformed dialog).
 */
export function fixedContainingBlockAncestor(el: HTMLElement): HTMLElement | null {
	for (let n = el.parentElement; n; n = n.parentElement) {
		if (isFixedContainingBlock(n)) return n;
		if (isTopLayer(n)) return null;
	}
	return null;
}

/**
 * The rect that `position: fixed` descendants of `el` actually resolve
 * against, in viewport (visual) coordinates.
 *
 * Walks up from `el`'s parent looking for the nearest containing-block-forming
 * ancestor (see {@link fixedContainingBlockAncestor}) and returns its padding
 * box — per CSS, the CB is the padding box, not the border box. When no such
 * ancestor exists (the overwhelmingly common case) it returns the viewport
 * rect based on `window.innerWidth/innerHeight`, byte-identical to what the
 * pre-CB-aware code measured.
 *
 * Known limitation: for a ROTATED CB ancestor the returned rect is the
 * axis-aligned bounding box of the rotated element — consumers comparing
 * rects (overflow checks, clamps) get an approximation there. Scaled
 * ancestors are handled (border widths are converted to visual px).
 */
export function fixedContainingBlockRect(el: HTMLElement): DOMRectReadOnly {
	const n = fixedContainingBlockAncestor(el);
	if (n) {
		const s = getComputedStyle(n);
		const r = n.getBoundingClientRect();
		// computed border widths are layout px; the rect is visual (post-
		// transform) px — convert via the ancestor's accumulated scale so the
		// inset is correct inside scaled wrappers too
		const sx = n.offsetWidth ? r.width / n.offsetWidth : 1;
		const sy = n.offsetHeight ? r.height / n.offsetHeight : 1;
		const bl = (parseFloat(s.borderLeftWidth) || 0) * sx;
		const bt = (parseFloat(s.borderTopWidth) || 0) * sy;
		const br = (parseFloat(s.borderRightWidth) || 0) * sx;
		const bb = (parseFloat(s.borderBottomWidth) || 0) * sy;
		return new DOMRectReadOnly(
			r.left + bl,
			r.top + bt,
			r.width - bl - br,
			r.height - bt - bb
		);
	}
	return new DOMRectReadOnly(0, 0, window.innerWidth, window.innerHeight);
}
