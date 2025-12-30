import { tick } from "svelte";
import { waitForNextRepaint, waitForTwoRepaints } from "../utils/paint.js";

/**
 * A mock-friendly interface matching the browser's ValidityState.
 *
 * Each property corresponds to a constraint validation failure reason.
 * The `valid` property is true when no error flags are set.
 */
export interface ValidityStateLike {
	/** Input is required but empty */
	valueMissing: boolean;
	/** Value doesn't match the input type (email, url, etc.) */
	typeMismatch: boolean;
	/** Value doesn't match the pattern attribute regex */
	patternMismatch: boolean;
	/** Value exceeds maxlength */
	tooLong: boolean;
	/** Value is shorter than minlength */
	tooShort: boolean;
	/** Numeric value is below min */
	rangeUnderflow: boolean;
	/** Numeric value exceeds max */
	rangeOverflow: boolean;
	/** Numeric value doesn't match step */
	stepMismatch: boolean;
	/** Browser cannot parse the input */
	badInput: boolean;
	/** Custom validation failed (via setCustomValidity) */
	customError: boolean;
	/** True when all validation constraints pass */
	valid: boolean;
}

/**
 * Creates a ValidityStateLike object for testing/mocking validation states.
 *
 * @param overrides - Error flags to set (all default to false)
 * @returns A ValidityStateLike object with a computed `valid` property
 *
 * @example
 * ```ts
 * // Create a valid state
 * createValidityStateLike(); // { ..., valid: true }
 *
 * // Create state with valueMissing error
 * createValidityStateLike({ valueMissing: true }); // { ..., valid: false }
 * ```
 */
export function createValidityStateLike(
	overrides: Partial<Omit<ValidityStateLike, "valid">> = {}
): ValidityStateLike {
	const state = {
		valueMissing: false,
		typeMismatch: false,
		patternMismatch: false,
		tooLong: false,
		tooShort: false,
		rangeUnderflow: false,
		rangeOverflow: false,
		stepMismatch: false,
		badInput: false,
		customError: false,
		...overrides,
	};

	return {
		...state,
		get valid(): boolean {
			return !Object.values(state).some((v) => !!v);
		},
	};
}

/**
 * Creates a ValidationResult object for testing/mocking.
 *
 * @param message - Error message (empty string means valid)
 * @returns A ValidationResult object
 *
 * @example
 * ```ts
 * createValidationResult("");           // { message: "", valid: true }
 * createValidationResult("Required");   // { message: "Required", valid: false }
 * ```
 */
export function createValidationResult(message: string): ValidationResult {
	return { message, valid: !message };
}

/**
 * Result object returned after validation.
 *
 * Contains the validation state, failure reasons, and error message.
 */
export interface ValidationResult {
	/** The full ValidityState object from the element */
	validity?: ValidityState | ValidityStateLike;
	/** Array of validation constraint names that failed */
	reasons?: (keyof ValidityStateFlags)[];
	/** Whether the input is valid */
	valid: boolean;
	message: string;
}

type ReasonTranslate = (
	reason: keyof ValidityStateFlags,
	value: any,
	fallback: string
) => string;

/**
 * Known validity state reasons from the HTML constraint validation API.
 * @internal
 */
const KNOWN_REASONS = [
	"badInput",
	"customError",
	"patternMismatch",
	"rangeOverflow",
	"rangeUnderflow",
	"stepMismatch",
	"tooLong",
	"tooShort",
	"typeMismatch",
	"valueMissing",
];

/**
 * Options for the validate action.
 */
export interface ValidateOptions {
	enabled?: boolean;
	// anything, typically all form data
	context?: Record<string, any>;
	// custom validator fn
	customValidator?: (
		value: any,
		context: Record<string, any> | undefined,
		el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
	) => string | undefined;
	// on which event to trigger validation (default change)
	on?: "input" | "change"; // intentionally not 'blur'
	//
	setValidationResult?: (res: ValidationResult) => void;
	//
	t?: false | ReasonTranslate;
}

/**
 * A Svelte action for form field validation with custom validators and i18n support.
 *
 * Integrates with the HTML constraint validation API and extends it with custom validation
 * functions. Provides structured validation results with translatable error messages.
 *
 * Features:
 * - Works with native HTML validation attributes (required, pattern, min, max, etc.)
 * - Custom validation functions with access to form context
 * - Translatable error messages via `t` function
 * - Validates on input/change events and first blur
 * - Returns structured validation result with reasons
 *
 * @param el - The form field element to validate
 * @param fn - Function returning options (or just a boolean for enabled state)
 *
 * @example
 * ```svelte
 * <script>
 *   let validationResult: ValidationResult;
 * </script>
 *
 * <input
 *   required
 *   minlength="3"
 *   use:validate={() => ({
 *     enabled: true,
 *     setValidationResult: (res) => validationResult = res
 *   })}
 * />
 * {#if !validationResult?.valid}
 *   <span class="error">{validationResult?.message}</span>
 * {/if}
 *
 * <!-- With custom validator -->
 * <input
 *   use:validate={() => ({
 *     customValidator: (value) => {
 *       if (value !== 'secret') return 'Must be "secret"';
 *     },
 *     setValidationResult: (res) => result = res
 *   })}
 * />
 *
 * <!-- With form context -->
 * <input
 *   name="confirmPassword"
 *   use:validate={() => ({
 *     context: { password },
 *     customValidator: (value, ctx) => {
 *       if (value !== ctx?.password) return 'Passwords must match';
 *     },
 *     setValidationResult: (res) => result = res
 *   })}
 * />
 * ```
 *
 * @remarks
 * Set a global translation function via `validate.t` for i18n support:
 * ```ts
 * validate.t = (reason, value, fallback) => translations[reason] ?? fallback;
 * ```
 */
export function validate(
	el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
	fn?: () => boolean | ValidateOptions
) {
	$effect(() => {
		//
		let fnResult = fn?.() ?? {};
		let {
			enabled,
			context,
			customValidator,
			on = "change",
			setValidationResult,
			t,
		} = typeof fnResult === "boolean" ? { enabled: !!fnResult } : fnResult;

		//
		const _t = (reason: keyof ValidityStateFlags, value: any, fallback: string) => {
			// explicit false
			if (!reason || t === false) {
				return fallback;
			}
			// local t (if any)
			else if (typeof t === "function") {
				return t(reason, value, fallback);
			}
			// global t (if any)
			else if (typeof validate.t === "function") {
				return (validate as any).t(reason, value, fallback);
			}
			return fallback;
		};

		const _doValidate = () => {
			if (!enabled) return;

			el.checkValidity();

			if (typeof customValidator === "function") {
				el.setCustomValidity(customValidator(el.value, context, el) || "");
			}

			// this triggers the bubble, which is not what we want
			// el.reportValidity();

			const validityState = el.validity;
			const reasons: (keyof ValidityStateFlags)[] = KNOWN_REASONS.reduce(
				(m, k) => {
					if ((validityState as any)[k]) m.push(k as keyof ValidityStateFlags);
					return m;
				},
				[] as (keyof ValidityStateFlags)[]
			);

			// console.log(1111, validityState, el);

			// hm... Uncaught Svelte error: state_unsafe_mutation...
			// the `tick` await helps, but I'm not really sure I understand the internals...
			// tick().then(() => {
			setValidationResult?.({
				validity: validityState,
				reasons,
				valid: validityState?.valid,
				// use translate fn for first reason (if fn provided and allowed),
				// otherwise fallback to native msg
				message: _t(
					reasons?.[0],
					el.value,
					el.validationMessage ||
						// PROBLEM: hidden inputs do not report validationMessage-s even
						// if correctly reported as invalid. So all we can do, is
						// put only something generic here...
						"This field is invalid. Please review and try again."
				),
			});
			// });
		};

		el.addEventListener(on!, _doValidate);

		//
		let _touchCount = 0;
		const onFocus = (e: Event) => _touchCount++;
		el.addEventListener("focus", onFocus);

		// also validate on first blur
		const onBlur = (e: Event) => _touchCount === 1 && _doValidate();
		el.addEventListener("blur", onBlur);

		return () => {
			el.removeEventListener(on!, _doValidate);
			el.removeEventListener("focus", onFocus);
			el.removeEventListener("blur", onBlur);
		};
	});
}

// ReasonTranslate
const t: ReasonTranslate | null = null;
validate.t = t;
