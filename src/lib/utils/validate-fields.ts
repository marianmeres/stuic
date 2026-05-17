import type { ValidationResult } from "../actions/validate.svelte.js";

/**
 * Minimal shape any STUIC field component implements once it exposes the
 * imperative validate API. Form-level helpers and consumer aggregators consume
 * this — they don't care what specific field type they're dealing with.
 *
 * Every STUIC `Field*` component (FieldInput, FieldPhoneNumber, FieldCountry,
 * FieldSelect, FieldCheckbox, FieldTextarea, FieldFile, FieldObject,
 * FieldAssets, FieldInputLocalized, FieldKeyValues, FieldLikeButton,
 * FieldRadios, FieldSwitch) satisfies this interface via `export function`.
 */
export interface ValidatableField {
	/** Run the validator now. Renders the inline error if invalid. */
	validate(): ValidationResult | undefined;
	/** Reset the inline error and clear `el.setCustomValidity`. */
	clearValidation?(): void;
	/** Current validation state, or undefined if validator has never run. */
	getValidation?(): ValidationResult | undefined;
	/** Focus the visible interactive element. */
	focus?(): void;
	/** Scroll the field into view. Defaults to smooth + center. */
	scrollIntoView?(opts?: ScrollIntoViewOptions): void;
}

type FieldArg = ValidatableField | undefined | null;

/**
 * Run `validate()` on every provided field. Returns `true` if all are valid.
 *
 * `undefined` / `null` entries are skipped so callers can spread conditional
 * refs without filtering first.
 *
 * @example
 * ```svelte
 * <script>
 *   let nameField = $state();
 *   let emailField = $state();
 *
 *   function handleSubmit() {
 *     if (!validateAllFields([nameField, emailField])) {
 *       scrollToFirstInvalidField([nameField, emailField]);
 *       return;
 *     }
 *     // ...submit
 *   }
 * </script>
 * ```
 */
export function validateAllFields(fields: FieldArg[]): boolean {
	let allValid = true;
	for (const f of fields) {
		if (!f) continue;
		const res = f.validate();
		if (res && !res.valid) allValid = false;
	}
	return allValid;
}

/**
 * Return the first field whose current validation state is invalid, or
 * `undefined` if all are valid (or never validated).
 *
 * Reads cached state via `getValidation()` — call `validateAllFields()` first
 * if you need fresh results.
 */
export function findFirstInvalidField(
	fields: FieldArg[]
): ValidatableField | undefined {
	for (const f of fields) {
		if (!f) continue;
		const v = f.getValidation?.();
		if (v && !v.valid) return f;
	}
	return undefined;
}

/**
 * Scroll the first invalid field into view and (by default) focus it.
 * Returns `true` if a field was scrolled, `false` if all were valid.
 *
 * Call **after** `validateAllFields()` — this reads cached validation state.
 *
 * @param fields - Field refs (in display order — first match wins)
 * @param opts.focus - Whether to also call `focus()` on the field. Default true.
 * @param opts.behavior - ScrollIntoView behavior. Default `"smooth"`.
 * @param opts.block - ScrollIntoView block alignment. Default `"center"`.
 */
export function scrollToFirstInvalidField(
	fields: FieldArg[],
	opts?: {
		focus?: boolean;
		behavior?: ScrollBehavior;
		block?: ScrollLogicalPosition;
	}
): boolean {
	const field = findFirstInvalidField(fields);
	if (!field) return false;
	field.scrollIntoView?.({
		behavior: opts?.behavior ?? "smooth",
		block: opts?.block ?? "center",
	});
	if (opts?.focus !== false) field.focus?.();
	return true;
}
