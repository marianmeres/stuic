import { assert, test } from "vitest";
import { CALENDAR_MESSAGES_EN, createCalendarT, t_default } from "./calendar-i18n.js";
import { CALENDAR_MESSAGES_SK } from "./calendar-i18n-sk.js";

const BUNDLED: Record<string, Record<string, string>> = {
	sk: CALENDAR_MESSAGES_SK,
};

const placeholders = (s: string) => (s.match(/{{\s*\w+\s*}}/g) ?? []).sort();

test("bundled catalogs cover every english key, with no empty values", () => {
	const enKeys = Object.keys(CALENDAR_MESSAGES_EN).sort();
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		assert.deepEqual(Object.keys(messages).sort(), enKeys, `${lang}: key drift`);
		for (const [k, v] of Object.entries(messages)) {
			assert.isTrue(!!v.trim(), `${lang}.${k} is empty`);
		}
	}
});

test("bundled catalogs keep the english placeholders", () => {
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		for (const [k, v] of Object.entries(CALENDAR_MESSAGES_EN)) {
			assert.deepEqual(
				placeholders(messages[k]),
				placeholders(v),
				`${lang}.${k}: placeholder mismatch`
			);
		}
	}
});

test("t_default keeps the built-in english texts and interpolates", () => {
	assert.equal(t_default("today"), "Today");
	assert.equal(t_default("placeholder_date"), "Select a date");
	assert.equal(t_default("week_number", { value: 36 }), "Week 36");
	assert.equal(t_default("selected_range", { start: "A", end: "B" }), "Selected A to B");
	assert.equal(
		t_default("date_before_min", { value: "Sep 1, 2026" }),
		"Date must be on or after Sep 1, 2026."
	);
	// unknown key + no fallback -> empty, never a raw key
	assert.equal(t_default("nope"), "");
	assert.equal(t_default("nope", null, "hi"), "hi");
	// a non-string fallback must never reach the DOM as "true"
	assert.equal(t_default("nope", null, true), "nope");
});

test("createCalendarT translates and falls back to english", () => {
	const t = createCalendarT(CALENDAR_MESSAGES_SK);
	assert.equal(t("today"), "Dnes");
	assert.equal(t("week_number", { value: 3 }), "Týždeň 3");

	// a partial catalog is fine — missing keys come from english
	const partial = createCalendarT({ placeholder_date: "Date of birth" });
	assert.equal(partial("placeholder_date"), "Date of birth");
	assert.equal(partial("today"), CALENDAR_MESSAGES_EN.today);
});

test("an explicit fallback catalog replaces english", () => {
	const t = createCalendarT({ today: "Now" }, { clear: "Reset" });
	assert.equal(t("today"), "Now");
	assert.equal(t("clear"), "Reset");
	// not in either catalog, and no string fallback -> empty, never a raw key
	assert.equal(t("done"), "");
});
