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

export interface ValidateOptions {
	// anything, typically all form data
	context?: Record<string, any>;
	// custom validator fn
	customValidator?: (
		value: any,
		context: Record<string, any> | undefined,
		el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
	) => string | undefined;
	// on which event to trigger validation (default change)
	on?: 'input' | 'change'; // intentionally not 'blur'
	//
	setValidationResult?: (res: ValidationResult) => void;
	//
	t?: false | ReasonTranslate;
}

export const validate = (
	el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
	options: undefined | ValidateOptions
) => {
	let _doValidate = !!options;
	let context = options?.context;
	let customValidator = options?.customValidator;
	let onEventName = options?.on || 'change';

	const t = (reason: keyof ValidityStateFlags, value: any, fallback: string) => {
		if (!reason || options?.t === false) return fallback;
		// local t (if any)
		if (typeof options?.t === 'function') return options.t(reason, value, fallback);
		// global t (if any)
		if (typeof validate.t === 'function')
			return (validate as any).t(reason, value, fallback);
		//
		return fallback;
	};

	const doValidate = (event: Event) => {
		if (!_doValidate) return;

		el.checkValidity();

		if (typeof customValidator === 'function') {
			el.setCustomValidity(customValidator(el.value, context, el) || '');
		}

		// this triggers the bubble
		// el.reportValidity();

		const validityState = el.validity;
		// prettier-ignore
		const reasons: (keyof ValidityStateFlags)[] = [
            'badInput', 'customError', 'patternMismatch', 'rangeOverflow', 'rangeUnderflow',
            'stepMismatch', 'tooLong', 'tooShort', 'typeMismatch', 'valueMissing'
        ].reduce((m, k) => {
            if ((validityState as any)[k]) m.push(k as keyof ValidityStateFlags);
            return m;
        }, [] as (keyof ValidityStateFlags)[]);

		if (typeof options?.setValidationResult === 'function') {
			options.setValidationResult({
				validity: validityState,
				reasons,
				valid: validityState?.valid,
				// use translate fn for first reason (if fn provided and allowed),
				// otherwise fallback to native msg
				message: t(reasons?.[0], el.value, el.validationMessage),
			});
		}
	};

	el.addEventListener(onEventName, doValidate);

	//
	let _touchCount = 0;
	const onFocus = (e: Event) => _touchCount++;
	el.addEventListener('focus', onFocus);

	// also validate on first blur
	const onBlur = (e: Event) => _touchCount === 1 && doValidate(e);
	el.addEventListener('blur', onBlur);

	//
	// const onChange = (e) => doValidate(e);
	// el.addEventListener('change', onChange);

	//
	// const onInput = (e) => _touchCount > 1 && doValidate(e);
	// el.addEventListener('input', onInput);

	//
	return {
		update(newOptions: undefined | ValidateOptions) {
			_doValidate = !!newOptions;
			// allow only context to update
			context = newOptions?.context;
		},
		destroy() {
			el.removeEventListener(onEventName, doValidate);
			el.removeEventListener('focus', onFocus);
			el.removeEventListener('blur', onBlur);
			// el.removeEventListener('change', onChange);
			// el.removeEventListener('input', onInput);
		},
	};
};

// ReasonTranslate
const t: ReasonTranslate | null = null;
validate.t = t;
