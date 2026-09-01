import type { TranslateFn } from "../../types.js";
import { isPlainObject } from "../../utils/is-plain-object.js";
import { replaceMap } from "../../utils/replace-map.js";

/**
 * The built-in (English) message catalog of `Stepper`. Also the fallback of every
 * other bundled locale, so a locale missing a key still renders text.
 *
 * Placeholders are single-brace (`{step}`, `{stepCount}`).
 */
export const STEPPER_MESSAGES_EN = {
	stepper: "Progress",
	step_x_of_y: "Step {step} of {stepCount}",
	completed: "Completed",
	failed: "Failed",
};

/** Every message key `Stepper` may look up. */
export type StepperMessageKey = keyof typeof STEPPER_MESSAGES_EN;

/** A (possibly partial) catalog for one locale. */
export type StepperMessages = Record<StepperMessageKey, string>;

/**
 * Builds the `t` prop of `Stepper` from a message catalog. Unknown or untranslated
 * keys fall back to `fallbackMessages` (English by default), so a catalog may safely be
 * partial and never renders a raw key.
 *
 * @example
 * ```svelte
 * <script>
 *   import { Stepper, createStepperT, STEPPER_MESSAGES_SK } from "@marianmeres/stuic";
 *   const t = createStepperT(STEPPER_MESSAGES_SK);
 * </script>
 *
 * <Stepper {steps} {current} {t} />
 * ```
 */
export function createStepperT(
	messages: Partial<StepperMessages> | Record<string, string>,
	fallbackMessages:
		Partial<StepperMessages> | Record<string, string> = STEPPER_MESSAGES_EN
): TranslateFn {
	return (k, values = null, fallback = "") => {
		const out =
			(messages as Record<string, string>)[k] ??
			(fallbackMessages as Record<string, string>)[k] ??
			(typeof fallback === "string" ? fallback : k);
		return isPlainObject(values)
			? replaceMap(out, values as Record<string, string>, {
					preSearchKeyTransform: (k) => `{${k}}`,
				})
			: out;
	};
}

/** The component's built-in English `t`. */
export const t_default: TranslateFn = createStepperT(STEPPER_MESSAGES_EN);
