import { assert, test } from "vitest";
import { createStepperT, STEPPER_MESSAGES_EN, t_default } from "./i18n.js";
import { STEPPER_MESSAGES_SK } from "./i18n-sk.js";

const BUNDLED: Record<string, Record<string, string>> = {
	sk: STEPPER_MESSAGES_SK,
};

const placeholders = (s: string) => (s.match(/{\s*\w+\s*}/g) ?? []).sort();

test("bundled catalogs cover every english key, with no empty values", () => {
	const enKeys = Object.keys(STEPPER_MESSAGES_EN).sort();
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		assert.deepEqual(Object.keys(messages).sort(), enKeys, `${lang}: key drift`);
		for (const [k, v] of Object.entries(messages)) {
			assert.isTrue(!!v.trim(), `${lang}.${k} is empty`);
		}
	}
});

test("bundled catalogs keep the english placeholders", () => {
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		for (const [k, v] of Object.entries(STEPPER_MESSAGES_EN)) {
			assert.deepEqual(
				placeholders(messages[k]),
				placeholders(v),
				`${lang}.${k}: placeholder mismatch`
			);
		}
	}
});

test("t_default keeps the built-in english texts and interpolates", () => {
	assert.equal(t_default("stepper"), "Progress");
	assert.equal(t_default("step_x_of_y", { step: 2, stepCount: 5 }), "Step 2 of 5");
	assert.equal(t_default("completed"), "Completed");
	// unknown key + no fallback -> empty (same behavior as Pagination's t)
	assert.equal(t_default("nope"), "");
	assert.equal(t_default("nope", null, "hi"), "hi");
});

test("createStepperT translates and falls back to english", () => {
	const t = createStepperT(STEPPER_MESSAGES_SK);
	assert.equal(t("stepper"), "Priebeh");
	assert.equal(t("step_x_of_y", { step: 2, stepCount: 5 }), "Krok 2 z 5");

	// a partial catalog is fine — missing keys come from english
	const partial = createStepperT({ completed: "Hotovo" });
	assert.equal(partial("completed"), "Hotovo");
	assert.equal(partial("stepper"), STEPPER_MESSAGES_EN.stepper);
});
