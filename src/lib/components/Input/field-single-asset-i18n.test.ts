import { assert, test } from "vitest";
import {
	createFieldSingleAssetT,
	FIELD_SINGLE_ASSET_MESSAGES_EN,
	t_default,
} from "./field-single-asset-i18n.js";
import { FIELD_SINGLE_ASSET_MESSAGES_SK } from "./field-single-asset-i18n-sk.js";

const BUNDLED: Record<string, Record<string, string>> = {
	sk: FIELD_SINGLE_ASSET_MESSAGES_SK,
};

const placeholders = (s: string) => (s.match(/{{\s*\w+\s*}}/g) ?? []).sort();

test("bundled catalogs cover every english key, with no empty values", () => {
	const enKeys = Object.keys(FIELD_SINGLE_ASSET_MESSAGES_EN).sort();
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		assert.deepEqual(Object.keys(messages).sort(), enKeys, `${lang}: key drift`);
		for (const [k, v] of Object.entries(messages)) {
			assert.isTrue(!!v.trim(), `${lang}.${k} is empty`);
		}
	}
});

test("bundled catalogs keep the english placeholders", () => {
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		for (const [k, v] of Object.entries(FIELD_SINGLE_ASSET_MESSAGES_EN)) {
			assert.deepEqual(
				placeholders(messages[k]),
				placeholders(v),
				`${lang}.${k}: placeholder mismatch`
			);
		}
	}
});

test("the catalog covers every key the embedded AssetsPreview looks up", () => {
	for (const k of [
		"unable_to_preview",
		"download",
		"close",
		"zoom_in",
		"zoom_out",
		"delete",
	]) {
		assert.isTrue(k in FIELD_SINGLE_ASSET_MESSAGES_EN, `missing ${k}`);
	}
});

test("t_default keeps the built-in english texts and interpolates", () => {
	assert.equal(t_default("pick_file"), "Choose a file");
	assert.equal(t_default("replace_file", { name: "a.png" }), "Replace a.png");
	assert.equal(
		t_default("too_large", { size: "3 MB", max: "2 MB" }),
		"The file is too large (3 MB). The maximum is 2 MB."
	);
	assert.equal(t_default("uploading_progress", { percent: 42 }), "Uploading… 42%");
	// unknown key + no fallback -> empty
	assert.equal(t_default("nope"), "");
	assert.equal(t_default("nope", null, "hi"), "hi");
	// a non-string fallback must never reach the DOM as "true"
	assert.equal(t_default("nope", null, true), "nope");
});

test("createFieldSingleAssetT translates and falls back to english", () => {
	const t = createFieldSingleAssetT(FIELD_SINGLE_ASSET_MESSAGES_SK);
	assert.equal(t("pick_file"), "Vybrať súbor");
	assert.equal(t("removed", { name: "a.png" }), "Súbor a.png bol odstránený");

	// a partial catalog is fine — missing keys come from english
	const partial = createFieldSingleAssetT({ pick_file: "Vybrať súbor" });
	assert.equal(partial("pick_file"), "Vybrať súbor");
	assert.equal(partial("empty_hint"), FIELD_SINGLE_ASSET_MESSAGES_EN.empty_hint);
});

test("an explicit fallback catalog replaces english", () => {
	const t = createFieldSingleAssetT({ remove: "Rm" }, { undo: "Back" });
	assert.equal(t("remove"), "Rm");
	assert.equal(t("undo"), "Back");
	// not in either catalog, and no string fallback -> empty, never a raw key
	assert.equal(t("preview"), "");
});
