import { render } from "vitest-browser-svelte";
import { afterEach, describe, expect, test } from "vitest";
import { createRawSnippet, type Component } from "svelte";
import Button from "./Button/Button.svelte";
import Pill from "./Pill/Pill.svelte";
import "./Button/index.css";
import "./Pill/index.css";
import "./AlertConfirmPrompt/index.css";
import "./Calendar/index.css";
import "./Cart/index.css";
import "./Checkout/index.css";
import "./DismissibleMessage/index.css";
import "./EmailVerifyForm/index.css";
import "./FieldsBuilder/index.css";
import "./Gantt/index.css";
import "./Input/index.css";
import "./PricingTable/index.css";
import "./Stat/index.css";
import "./Stepper/index.css";
import "./Timeline/index.css";
import "./TrendChart/index.css";

// Button and Pill share one intent x variant colour contract (their stylesheets are built
// alike), so it is asserted once for both, here, instead of twice in the per-component files.
//
// The contract: an intent has two pairings, both read from the theme.
//   fill  {intent} + {intent}-foreground                    -> solid
//   tint  surface-{intent} + surface-{intent}-foreground    -> soft, outline, ghost, link
// The raw intent is a fill colour, so intent-coloured TEXT is never the raw intent.
//
// The second half of the file holds the rest of the library to the same rule, at the places
// that draw intent-coloured text or glyphs (src/lib/intent-text.test.ts is the static guard
// that finds them; this is the proof that their var() chains land on the right token).
//
// Component tests load no theme, so each test installs its own at :root, where a real theme
// lives. Every token gets a colour no other token has: an assertion can only pass on the
// token it names.

const INTENTS = ["primary", "accent", "destructive", "warning", "success"] as const;
const TINTED = ["soft", "outline", "ghost", "link"] as const;

const BACKGROUND = "rgb(250, 250, 250)";
const FOREGROUND = "rgb(20, 20, 20)";
const MUTED = "rgb(230, 231, 232)";
const MUTED_FOREGROUND = "rgb(110, 111, 112)";
const raw = (k: number) => `rgb(${200 + k}, 100, 50)`;
const rawForeground = (k: number) => `rgb(255, 254, ${200 + k})`;
const tint = (k: number) => `rgb(${220 + k}, 230, 240)`;
const onTint = (k: number) => `rgb(${40 + k}, 30, 20)`;
const tintBorder = (k: number) => `rgb(${180 + k}, 190, 200)`;
/** The tint as design-tokens derives it. */
const generatedTint = (k: number) => `color-mix(in srgb, ${raw(k)} 15%, ${BACKGROUND})`;

type Tokens = Record<string, string>;

function theme({ surfaces = true, tintOf = tint } = {}): Tokens {
	const t: Tokens = {
		"--stuic-color-background": BACKGROUND,
		"--stuic-color-foreground": FOREGROUND,
		"--stuic-color-muted": MUTED,
		"--stuic-color-muted-foreground": MUTED_FOREGROUND,
	};
	INTENTS.forEach((i, k) => {
		t[`--stuic-color-${i}`] = raw(k);
		t[`--stuic-color-${i}-foreground`] = rawForeground(k);
		if (surfaces) {
			t[`--stuic-color-surface-${i}`] = tintOf(k);
			t[`--stuic-color-surface-${i}-foreground`] = onTint(k);
			t[`--stuic-color-surface-${i}-border`] = tintBorder(k);
		}
	});
	return t;
}

let installed: string[] = [];
function install(tokens: Tokens) {
	for (const [name, value] of Object.entries(tokens)) {
		document.documentElement.style.setProperty(name, value);
	}
	installed = Object.keys(tokens);
}
afterEach(() => {
	for (const name of installed) document.documentElement.style.removeProperty(name);
	installed = [];
});

const text = (s: string) =>
	createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- two components, one prop bag
async function mount(component: Component<any>, props: Record<string, unknown>) {
	const screen = await render(component, { children: text("Label"), ...props });
	const el = screen.container.querySelector<HTMLElement>(".stuic-button, .stuic-pill")!;
	return { el, style: getComputedStyle(el), screen };
}

/**
 * A computed colour as [r, g, b], 0-255. Chromium serialises a resolved color-mix() as
 * `color(srgb r g b)` with fractions of 1; everything else here comes back as `rgb()`.
 */
function rgb(css: string): number[] {
	const n = (css.match(/\d*\.?\d+(?:e-?\d+)?/g) ?? []).map(Number).slice(0, 3);
	return css.startsWith("color(srgb") ? n.map((x) => x * 255) : n;
}

/**
 * What a colour expression resolves to in the scope of `el`: a literal, or one of the
 * component's internal variables (`var(--_bg-hover)`), which is how the hover and pressed
 * colours are read without driving the pointer. Read off `background-color`, which is not
 * inherited: an undefined variable comes back transparent instead of borrowing a colour.
 */
function resolve(el: HTMLElement, expression: string): number[] {
	const probe = document.createElement("i");
	probe.style.backgroundColor = expression;
	el.append(probe);
	const out = rgb(getComputedStyle(probe).backgroundColor);
	probe.remove();
	return out;
}

/** Equal within rounding (one step of an 8-bit channel). */
function expectSameColor(actual: number[], expected: number[]) {
	expect(actual).toHaveLength(3);
	actual.forEach((channel, i) =>
		expect(
			Math.abs(channel - expected[i]),
			`${actual} vs ${expected}`
		).toBeLessThanOrEqual(1)
	);
}

describe.each([
	["Button", Button],
	["Pill", Pill],
] as const)("%s intent colours", (_name, component) => {
	test.each(TINTED)(
		"%s: intent text is the theme's surface-{intent}-foreground",
		async (variant) => {
			install(theme());
			for (const [k, intent] of INTENTS.entries()) {
				const { style, screen } = await mount(component, { intent, variant });
				expect(style.color, `${intent} ${variant}`).toBe(onTint(k));
				await screen.unmount();
			}
		}
	);

	test("soft: the background is the theme's surface-{intent}", async () => {
		install(theme());
		for (const [k, intent] of INTENTS.entries()) {
			const { style, screen } = await mount(component, { intent, variant: "soft" });
			expect(style.backgroundColor, intent).toBe(tint(k));
			await screen.unmount();
		}
	});

	// The generator's tint is the 15% the component used to mix itself, so reading it from the
	// theme must not move the three steps.
	test("soft: rest, hover and pressed backgrounds are still the 15% / 25% / 35% mixes", async () => {
		install(theme({ tintOf: generatedTint }));
		for (const [k, intent] of INTENTS.entries()) {
			const { el, screen } = await mount(component, { intent, variant: "soft" });
			const mix = (pct: number) =>
				resolve(el, `color-mix(in srgb, ${raw(k)} ${pct}%, ${BACKGROUND})`);
			expectSameColor(resolve(el, "var(--_bg)"), mix(15));
			expectSameColor(resolve(el, "var(--_bg-hover)"), mix(25));
			expectSameColor(resolve(el, "var(--_bg-active)"), mix(35));
			await screen.unmount();
		}
	});

	test.each(["soft", "outline", "ghost"] as const)(
		"%s: the text holds its colour on hover and pressed (the background marks the state)",
		async (variant) => {
			install(theme());
			const { el } = await mount(component, { intent: "primary", variant });
			expectSameColor(resolve(el, "var(--_text-hover)"), rgb(onTint(0)));
			expectSameColor(resolve(el, "var(--_text-active)"), rgb(onTint(0)));
		}
	);

	// link has no background to mark the state on: without a text step it would have no
	// hover or pressed feedback at all.
	test("link: the text steps toward the foreground on hover and pressed", async () => {
		install(theme());
		const { el } = await mount(component, { intent: "primary", variant: "link" });
		const step = (pct: number) =>
			resolve(el, `color-mix(in srgb, ${onTint(0)}, ${FOREGROUND} ${pct}%)`);
		expectSameColor(resolve(el, "var(--_text)"), rgb(onTint(0)));
		expectSameColor(resolve(el, "var(--_text-hover)"), step(25));
		expectSameColor(resolve(el, "var(--_text-active)"), step(50));
		expect(resolve(el, "var(--_text-hover)")).not.toEqual(resolve(el, "var(--_text)"));
	});

	test("outline: the border stays the raw intent (a border is not text)", async () => {
		install(theme());
		const { style } = await mount(component, { intent: "warning", variant: "outline" });
		expect(style.borderTopColor).toBe(raw(INTENTS.indexOf("warning")));
	});

	test("a theme without the surface-{intent} tokens falls back to the raw intent", async () => {
		install(theme({ surfaces: false }));
		for (const variant of TINTED) {
			for (const [k, intent] of INTENTS.entries()) {
				const { el, style, screen } = await mount(component, { intent, variant });
				expect(style.color, `${intent} ${variant}`).toBe(raw(k));
				if (variant === "soft") {
					expectSameColor(rgb(style.backgroundColor), resolve(el, generatedTint(k)));
				}
				await screen.unmount();
			}
		}
	});

	test("solid: the fill pairing, {intent} under {intent}-foreground", async () => {
		install(theme());
		for (const [k, intent] of INTENTS.entries()) {
			const { style, screen } = await mount(component, { intent, variant: "solid" });
			expect(style.backgroundColor, intent).toBe(raw(k));
			expect(style.color, intent).toBe(rawForeground(k));
			await screen.unmount();
		}
	});

	test("no intent: neutral role colours, whatever the surface tokens say", async () => {
		install(theme());
		for (const variant of ["solid", ...TINTED]) {
			const { style, screen } = await mount(component, { variant });
			expect(style.color, variant).toBe(
				variant === "link" ? MUTED_FOREGROUND : FOREGROUND
			);
			if (variant === "solid" || variant === "soft") {
				expect(style.backgroundColor, variant).toBe(MUTED);
			}
			await screen.unmount();
		}
	});
});

// ---------------------------------------------------------------------------
// The rest of the library
// ---------------------------------------------------------------------------
// Stylesheet-level: each row is the smallest markup its rule matches, not a mounted
// component. What is under test is the var() chain behind the rule, in a real cascade.

type Intent = (typeof INTENTS)[number];
type Row = {
	name: string;
	html: string;
	/** The element to read, inside `html`. */
	at: string;
	intent: Intent;
	/** `color` is the paired text; the others are checked when the rule sets them. */
	background?: "tint";
	border?: "tintBorder";
	/** false: the rule reads `surface-{intent}` with no fallback mix behind it. */
	tintFallback?: false;
};

const TEXT_ROWS: Row[] = [
	{
		name: "Input validation message",
		html: `<div class="stuic-input"><div class="validation-box">Required</div></div>`,
		at: ".validation-box",
		intent: "destructive",
	},
	{
		name: "Checkbox validation message",
		html: `<div class="stuic-checkbox"><div class="validation-box">Required</div></div>`,
		at: ".validation-box",
		intent: "destructive",
	},
	{
		name: "Radios validation message",
		html: `<div class="stuic-radios"><div class="validation-box">Required</div></div>`,
		at: ".validation-box",
		intent: "destructive",
	},
	{
		name: "FieldTable cell message",
		html: `<div class="stuic-field-table"><div class="stuic-field-table-cell-error">Bad</div></div>`,
		at: ".stuic-field-table-cell-error",
		intent: "destructive",
	},
	{
		name: "FieldStruct field message",
		html: `<div class="stuic-field-struct"><div class="stuic-field-struct-error">Bad</div></div>`,
		at: ".stuic-field-struct-error",
		intent: "destructive",
	},
	{
		name: "FieldsBuilder error",
		html: `<div class="stuic-fields-builder"><span class="fb-error-text">Bad</span></div>`,
		at: ".fb-error-text",
		intent: "destructive",
	},
	{
		name: "Checkout field error",
		html: `<div class="stuic-checkout-field-error">Bad</div>`,
		at: ".stuic-checkout-field-error",
		intent: "destructive",
	},
	{
		name: "Checkout confirm-step validation box",
		html: `<div class="stuic-checkout-confirm-step-validation">Bad</div>`,
		at: ".stuic-checkout-confirm-step-validation",
		intent: "destructive",
		background: "tint",
		border: "tintBorder",
		tintFallback: false,
	},
	{
		name: "Cart remove button",
		html: `<button class="stuic-cart-remove">Remove</button>`,
		at: ".stuic-cart-remove",
		intent: "destructive",
	},
	{
		name: "Stepper error label",
		html: `<div class="stuic-stepper-item" data-error><span class="stuic-stepper-label">Pay</span></div>`,
		at: ".stuic-stepper-label",
		intent: "destructive",
	},
	{
		name: "Stepper current bubble",
		html: `<div class="stuic-stepper-item" data-state="current"><span class="stuic-stepper-indicator">2</span></div>`,
		at: ".stuic-stepper-indicator",
		intent: "primary",
	},
	{
		name: "Calendar today",
		html: `<button class="stuic-calendar-day" data-today>14</button>`,
		at: ".stuic-calendar-day",
		intent: "primary",
	},
	{
		name: "EmailVerifyForm resend flash",
		html: `<span class="stuic-email-verify-form-resend-flash">Sent</span>`,
		at: ".stuic-email-verify-form-resend-flash",
		intent: "primary",
	},
	{
		name: "Gantt today flag",
		html: `<div class="stuic-gantt-unit" data-today>14</div>`,
		at: ".stuic-gantt-unit",
		intent: "destructive",
	},
	...(["success", "destructive", "warning"] as const).map((intent): Row => ({
		name: `Stat delta (${intent})`,
		html: `<div class="stuic-stat" data-trend-intent="${intent}"><span class="stuic-stat-delta">+4%</span></div>`,
		at: ".stuic-stat-delta",
		intent,
	})),
	{
		name: "PricingTable discount badge",
		html: `<span class="stuic-pricing-table-discount-badge">-20%</span>`,
		at: ".stuic-pricing-table-discount-badge",
		intent: "success",
	},
	{
		name: "PricingTable included-feature icon",
		html: `<li class="stuic-pricing-table-feature-item" data-included><span class="stuic-pricing-table-feature-icon">✓</span></li>`,
		at: ".stuic-pricing-table-feature-icon",
		intent: "success",
	},
	...INTENTS.map((intent): Row => ({
		name: `Timeline icon bubble (${intent})`,
		html: `<li class="stuic-timeline-item" data-intent="${intent}"><span class="stuic-timeline-marker" data-marker="icon"></span></li>`,
		at: ".stuic-timeline-marker",
		intent,
		background: "tint",
	})),
	{
		name: "AlertConfirmPrompt icon box (info)",
		html: `<div class="stuic-acp" data-variant="info"><div class="icon-box"></div></div>`,
		at: ".icon-box",
		intent: "primary",
		background: "tint",
	},
	{
		name: "AlertConfirmPrompt icon box (error)",
		html: `<div class="stuic-acp" data-variant="error"><div class="icon-box"></div></div>`,
		at: ".icon-box",
		intent: "destructive",
		background: "tint",
	},
	...(["destructive", "warning", "success"] as const).map((intent): Row => ({
		name: `DismissibleMessage (${intent})`,
		html: `<div class="stuic-dismissible-message" data-intent="${intent}"><div class="content">Saved</div></div>`,
		at: ".stuic-dismissible-message",
		intent,
		background: "tint",
		border: "tintBorder",
	})),
];

let hosts: HTMLElement[] = [];
function fixture(row: Pick<Row, "html" | "at">) {
	const host = document.createElement("div");
	host.innerHTML = row.html;
	document.body.append(host);
	hosts.push(host);
	const el = host.querySelector<HTMLElement>(row.at)!;
	return { el, style: getComputedStyle(el) };
}
afterEach(() => {
	for (const host of hosts) host.remove();
	hosts = [];
});

describe("intent-coloured text across the library", () => {
	test.each(TEXT_ROWS)("$name reads surface-{intent}-foreground", (row) => {
		install(theme());
		const k = INTENTS.indexOf(row.intent);
		const { style } = fixture(row);
		expect(style.color).toBe(onTint(k));
		if (row.background) expect(style.backgroundColor).toBe(tint(k));
		if (row.border) expect(style.borderTopColor).toBe(tintBorder(k));
	});

	test.each(TEXT_ROWS)(
		"$name falls back to the raw intent without the surface tokens",
		(row) => {
			install(theme({ surfaces: false }));
			const k = INTENTS.indexOf(row.intent);
			const { el, style } = fixture(row);
			expect(style.color).toBe(raw(k));
			if (row.background && row.tintFallback !== false) {
				expectSameColor(rgb(style.backgroundColor), resolve(el, generatedTint(k)));
			}
		}
	);

	// One variable in the chart library draws the annotation rule AND its label, so the
	// default has to be the text-safe colour.
	test("TrendChart annotations default to surface-warning-foreground", () => {
		install(theme());
		const { el } = fixture({ html: `<div class="stuic-trend-chart"></div>`, at: "div" });
		expect(resolve(el, "var(--trend-chart-annotation)")).toEqual(
			rgb(onTint(INTENTS.indexOf("warning")))
		);
	});

	// Dual-role tokens. Not declared by the library, so each role has its own default
	// behind the token, and setting the token still moves both.
	describe("--stuic-input-accent-error", () => {
		const HTML = `<div class="stuic-input invalid"><div class="input-wrap"></div><div class="validation-box">Required</div></div>`;
		const destructive = INTENTS.indexOf("destructive");

		test("unset: the border is the raw intent, the message its paired text", () => {
			install(theme());
			expect(fixture({ html: HTML, at: ".input-wrap" }).style.borderTopColor).toBe(
				raw(destructive)
			);
			expect(fixture({ html: HTML, at: ".validation-box" }).style.color).toBe(
				onTint(destructive)
			);
		});

		test("set: border and message both follow it", () => {
			install({ ...theme(), "--stuic-input-accent-error": "rgb(1, 2, 3)" });
			expect(fixture({ html: HTML, at: ".input-wrap" }).style.borderTopColor).toBe(
				"rgb(1, 2, 3)"
			);
			expect(fixture({ html: HTML, at: ".validation-box" }).style.color).toBe(
				"rgb(1, 2, 3)"
			);
		});

		test("set: FieldTable and FieldStruct messages follow it, and their own token wins", () => {
			const TABLE = `<div class="stuic-field-table"><div class="stuic-field-table-cell-error">Bad</div></div>`;
			const STRUCT = `<div class="stuic-field-struct"><div class="stuic-field-struct-error">Bad</div></div>`;
			install({ ...theme(), "--stuic-input-accent-error": "rgb(1, 2, 3)" });
			expect(
				fixture({ html: TABLE, at: ".stuic-field-table-cell-error" }).style.color
			).toBe("rgb(1, 2, 3)");
			expect(fixture({ html: STRUCT, at: ".stuic-field-struct-error" }).style.color).toBe(
				"rgb(1, 2, 3)"
			);

			document.documentElement.style.setProperty(
				"--stuic-field-table-invalid-color",
				"rgb(4, 5, 6)"
			);
			installed.push("--stuic-field-table-invalid-color");
			expect(
				fixture({ html: TABLE, at: ".stuic-field-table-cell-error" }).style.color
			).toBe("rgb(4, 5, 6)");
		});
	});

	describe("--stuic-gantt-today-color", () => {
		const HTML = `<div class="stuic-gantt-unit" data-today>14</div><div class="stuic-gantt-today"></div>`;
		const destructive = INTENTS.indexOf("destructive");

		test("unset: the line is the raw intent, the header flag its paired text", () => {
			install(theme());
			expect(
				fixture({ html: HTML, at: ".stuic-gantt-today" }).style.backgroundColor
			).toBe(raw(destructive));
			expect(fixture({ html: HTML, at: ".stuic-gantt-unit" }).style.color).toBe(
				onTint(destructive)
			);
		});

		test("set: line and flag both follow it", () => {
			install({ ...theme(), "--stuic-gantt-today-color": "rgb(1, 2, 3)" });
			expect(
				fixture({ html: HTML, at: ".stuic-gantt-today" }).style.backgroundColor
			).toBe("rgb(1, 2, 3)");
			expect(fixture({ html: HTML, at: ".stuic-gantt-unit" }).style.color).toBe(
				"rgb(1, 2, 3)"
			);
		});
	});
});
