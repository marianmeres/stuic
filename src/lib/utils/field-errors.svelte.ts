import { untrack } from "svelte";
import type { ValidatableField } from "./validate-fields.js";

/**
 * Minimal shape of a `errors` entry — every STUIC form's `*ValidationError`
 * type structurally satisfies it.
 */
export interface FieldError {
	field: string;
	message: string;
}

export interface ExternalFieldErrorsOptions<E extends FieldError> {
	/** The consumer-supplied `errors` prop. Read reactively — pass a getter. */
	errors: () => E[];
	/**
	 * Is this error's field currently rendered — i.e. is there something on
	 * screen the user could edit to answer it?
	 *
	 * Fields that are not (a field the consumer renders itself from a slot, or
	 * one switched off by a `show*` prop) keep the original behavior: they apply
	 * until the consumer drops them from `errors`. Auto-clearing those would let
	 * the form post past a block the consumer set deliberately — an unchecked
	 * terms box, a failed captcha, a pending availability check.
	 */
	isRendered: (field: string) => boolean;
	/** Comparable current value of a rendered field. */
	valueOf: (field: string) => string;
}

export interface ExternalFieldErrors<E extends FieldError> {
	/** The subset of `errors` that still applies — stale entries filtered out. */
	readonly live: E[];
	/**
	 * Mark that a server round-trip is starting. Call it wherever the form hands
	 * data to the consumer (its `onSubmit`, and its exported `validate()` for
	 * consumers posting from their own handler).
	 */
	markSubmitted(): void;
}

/** Content — not array identity, not order — of a set of errors. */
function errorsKey(errs: FieldError[]): string {
	return JSON.stringify(errs.map((e) => [e.field, e.message]).sort());
}

/**
 * Give a form's consumer-supplied `errors` prop a lifecycle.
 *
 * `errors` is consumer-owned: a form can render it but cannot clear it. Taken
 * literally that wedges the form permanently — the field's `customValidator`
 * keeps reporting the server error whatever the user types, so
 * `onSubmitValidityCheck` routes every later submit to `submit_invalid` and
 * `onSubmit` never fires again, *including* the consumer's own handler that
 * would have cleared the errors. (Forms without that action hit the same wall
 * through their `externalErrors.length === 0` submit gate.)
 *
 * So: remember the value each field held when a set of errors was delivered.
 * An error on a rendered field stays live while that field still holds that
 * value and goes stale once the user edits it — dropped from the inline
 * messages and from the submit gate, the same lifecycle internal validation
 * errors already have. Typing the rejected value back in makes it live again,
 * which is correct: that exact value is known-bad.
 *
 * Two details that look like over-engineering and are not:
 *
 * - Delivery is detected by the errors' **content**, never by array identity.
 *   Consumers routinely pass an inline literal or a freshly derived array whose
 *   identity changes on every parent re-render; re-snapshotting mid-typing would
 *   resurrect the error and restore the deadlock.
 * - Because of that, an identical error redelivered after a resubmit would look
 *   like the previous, already-answered one. `markSubmitted()` disambiguates:
 *   the next delivery after it counts as fresh even when byte-identical.
 *
 * Must be called during component initialization (it registers an `$effect`).
 *
 * @example
 * ```svelte
 * <script>
 *   let { errors: externalErrors = [], formData = $bindable(...) } = $props();
 *
 *   const external = createExternalFieldErrors({
 *     errors: () => externalErrors,
 *     isRendered: (f) => f === "email" || f === "password",
 *     valueOf: (f) => (f === "email" ? formData.email : formData.password) ?? "",
 *   });
 *
 *   function handleSubmitValid() {
 *     // ...
 *     if (!validationErrors.length && !external.live.length) {
 *       external.markSubmitted();
 *       onSubmit(formData);
 *     }
 *   }
 * </script>
 * ```
 */
export function createExternalFieldErrors<E extends FieldError>(
	options: ExternalFieldErrorsOptions<E>
): ExternalFieldErrors<E> {
	// Reassigned wholesale, never mutated — that is what makes it reactive, so a
	// plain Map is correct here (a SvelteMap would only add overhead).
	let snapshot = $state.raw<Map<string, string>>(new Map());

	// Deliberately NOT `$state`: these must not re-trigger the effect below.
	let submittedSinceSnapshot = false;
	let lastKey: string | null = null;

	$effect(() => {
		const errs = options.errors();
		const key = errorsKey(errs);
		untrack(() => {
			if (key === lastKey && !submittedSinceSnapshot) return;
			lastKey = key;
			submittedSinceSnapshot = false;
			const next = new Map<string, string>();
			for (const e of errs) {
				if (options.isRendered(e.field)) next.set(e.field, options.valueOf(e.field));
			}
			snapshot = next;
		});
	});

	const live = $derived(
		options.errors().filter((e) => {
			if (!options.isRendered(e.field)) return true;
			const snapped = snapshot.get(e.field);
			// no snapshot yet (first paint, before the effect above runs) => live
			return snapped === undefined || snapped === options.valueOf(e.field);
		})
	);

	return {
		get live() {
			return live;
		},
		markSubmitted() {
			submittedSinceSnapshot = true;
		},
	};
}

/**
 * Render a field's error message as soon as it exists, instead of waiting for
 * the user's next interaction.
 *
 * Inline messages come from each field's own validation run, and the `validate`
 * action fires on `change` / first blur. An error that appears *after* the
 * validators last ran therefore paints nothing:
 *
 * - a form's own validator result is computed on `submit_valid`, i.e. after
 *   `onSubmitValidityCheck` has already re-run every field's validator, so a
 *   rule with no DOM equivalent (a password mismatch, a custom validator, an
 *   email that satisfies `type="email"` but not a stricter regex) produced a
 *   completely silent first click — the CTA appeared to do nothing;
 * - a server `errors` delivery lands once the submit is over, so it stayed
 *   invisible until the user clicked again.
 *
 * Only fields gaining an error are re-validated; clearing is left to the field's
 * own next change/blur, so fixing one field doesn't wipe the messages still
 * standing on its siblings.
 *
 * Must be called during component initialization (it registers an `$effect`).
 *
 * @param errors - all currently applicable errors (internal + live external)
 * @param fieldByName - resolves a field name to its rendered component, if any
 */
export function repaintFieldErrors(
	errors: () => FieldError[],
	fieldByName: (field: string) => ValidatableField | undefined
): void {
	$effect(() => {
		const named = errors().map((e) => e.field);
		if (!named.length) return;
		untrack(() => {
			for (const name of named) fieldByName(name)?.validate?.();
		});
	});
}
