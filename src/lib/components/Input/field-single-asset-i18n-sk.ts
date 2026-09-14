import type { FieldSingleAssetMessages } from "./field-single-asset-i18n.js";

/**
 * Slovak message catalog for `FieldSingleAsset`. Opt-in — English stays the built-in
 * default, and this module is only pulled into a bundle when it is actually imported
 * (the component itself never references it).
 *
 * @example
 * ```svelte
 * <script>
 *   import {
 *     FieldSingleAsset,
 *     createFieldSingleAssetT,
 *     FIELD_SINGLE_ASSET_MESSAGES_SK,
 *   } from "@marianmeres/stuic";
 *   const t = createFieldSingleAssetT(FIELD_SINGLE_ASSET_MESSAGES_SK);
 * </script>
 *
 * <FieldSingleAsset name="avatar" bind:value {processAsset} {t} />
 * ```
 */
export const FIELD_SINGLE_ASSET_MESSAGES_SK: FieldSingleAssetMessages = {
	field_req_att: "Toto pole vyžaduje pozornosť. Skontrolujte ho a skúste to znova.",
	pick_file: "Vybrať súbor",
	replace_file: "Nahradiť {{name}}",
	empty_hint: "Presuňte sem súbor alebo kliknite a vyberte ho",
	remove: "Odstrániť",
	removed: "Súbor {{name}} bol odstránený",
	undo: "Vrátiť späť",
	restored: "Súbor {{name}} bol obnovený",
	preview: "Náhľad",
	retry: "Skúsiť nahrať znova",
	discard: "Zahodiť",
	cancel_upload: "Zrušiť nahrávanie",
	uploading: "Nahráva sa {{name}}",
	uploading_short: "Nahráva sa…",
	uploading_progress: "Nahráva sa… {{percent}} %",
	uploaded: "Súbor {{name}} bol nahraný",
	upload_failed: "Nahrávanie zlyhalo",
	upload_failed_named: "Nahrávanie súboru {{name}} zlyhalo: {{error}}",
	invalid_type: "Tento typ súboru nie je podporovaný. Povolené: „{{accept}}“.",
	too_large: "Súbor je príliš veľký ({{size}}). Maximum je {{max}}.",
	single_only:
		"Sem je možné umiestniť iba jeden súbor. Presuňte alebo prilepte jeden súbor.",
	// AssetsPreview
	unable_to_preview: "Tento súbor nie je možné zobraziť",
	download: "Stiahnuť originál",
	close: "Zavrieť náhľad",
	zoom_in: "Priblížiť",
	zoom_out: "Oddialiť",
	delete: "Odstrániť",
};
