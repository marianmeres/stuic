import type { THC } from "../Thc/Thc.svelte";

export interface FieldSelectOption {
	label: string;
	value?: string;
	optgroup?: string;
}

export interface FieldRadiosOption {
	label: string;
	value?: string;
	description?: THC;
}

/**
 * Class props forwarded to the shared `InputWrap` scaffolding used by every
 * `Field*` component that has a label/input/description layout.
 *
 * Field components extend this interface in their own `Props` so the class-prop
 * shape stays consistent across the library. Component-specific class props
 * (e.g. `classInput`, `classFileList`, `classOption`) live on the component itself.
 */
export interface InputWrapClassProps {
	/** Classes for the <label> element */
	classLabel?: string;
	/** Classes for the wrapper around the label area */
	classLabelBox?: string;
	/** Classes for the wrapper around the input area (contains input + inputBefore/After/Below) */
	classInputBox?: string;
	/** Classes for the inner input wrap (sibling to description/validation/below) */
	classInputBoxWrap?: string;
	/** Extra classes applied to `classInputBoxWrap` when the field is invalid */
	classInputBoxWrapInvalid?: string;
	/** Classes for the description box (the subtle hint below the input) */
	classDescBox?: string;
	/** Classes for the description's collapsible toggle button */
	classDescBoxToggle?: string;
	/** Classes for the "below" slot — rendered under the description */
	classBelowBox?: string;
	/** Classes for the validation message box */
	classValidationBox?: string;
}
