export {
	default as FieldsBuilder,
	type Props as FieldsBuilderProps,
} from "./FieldsBuilder.svelte";

export type {
	FieldDef,
	FieldLock,
	FieldOptionDef,
	FieldTypeDef,
	FieldTypeExtraBaseDef,
	FieldTypeExtraBooleanDef,
	FieldTypeExtraDef,
	FieldTypeExtraSelectDef,
	FieldTypeExtraStringDef,
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

export {
	createFieldsBuilderT,
	FIELDS_BUILDER_MESSAGES_EN,
	type FieldsBuilderMessageKey,
	type FieldsBuilderMessages,
} from "./i18n.js";

export {
	FIELDS_BUILDER_MESSAGES_SK,
	FIELDS_BUILDER_DEFAULT_TYPES_SK,
} from "./i18n-sk.js";
