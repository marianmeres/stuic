import type { StepperMessages } from "./i18n.js";

/**
 * Slovak message catalog for `Stepper`. Opt-in — English stays the built-in default,
 * and this module is only pulled into a bundle when it is actually imported (the
 * component itself never references it).
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
export const STEPPER_MESSAGES_SK: StepperMessages = {
	stepper: "Priebeh",
	step_x_of_y: "Krok {step} z {stepCount}",
	completed: "Dokončený",
	failed: "Zlyhal",
};
