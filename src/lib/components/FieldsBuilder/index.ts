export {
	default as FieldsBuilder,
	type Props as FieldsBuilderProps,
} from "./FieldsBuilder.svelte";

export type {
	FieldDef,
	FieldLock,
	FieldOptionDef,
	FieldTypeDef,
	FieldTypeExtraDef,
	LocalizedText,
} from "./types.js";

export {
	DEFAULT_FIELD_TYPES as FIELDS_BUILDER_DEFAULT_TYPES,
	DEFAULT_KEY_PATTERN as FIELDS_BUILDER_DEFAULT_KEY_PATTERN,
	getLocalizedText,
	slugifyKey,
	uniqueKey,
	validateFieldDefs,
	type FieldDefRowErrors,
	type FieldDefsValidationResult,
	type ValidateFieldDefsOptions,
} from "./utils.js";
