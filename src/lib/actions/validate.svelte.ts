import { tick } from "svelte";
import { waitForNextRepaint, waitForTwoRepaints } from "../utils/paint.js";

export interface ValidationResult {
	validity: ValidityState;
	reasons: (keyof ValidityStateFlags)[];
	valid: boolean;
	message: string;
}

type ReasonTranslate = (
	reason: keyof ValidityStateFlags,
	value: any,
	fallback: string
) => string;

/**
 *
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

/** */
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

/** Main action api */
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
