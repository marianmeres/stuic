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
