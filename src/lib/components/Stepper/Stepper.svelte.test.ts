import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import { createRawSnippet } from "svelte";
import Stepper, { type StepperStep, type StepperStepState } from "./Stepper.svelte";
import { createStepperT } from "./i18n.js";
import { STEPPER_MESSAGES_SK } from "./i18n-sk.js";

// Note: browser tests don't load the component index.css, so only structure,
// attributes and callback wiring are asserted here — never computed sizes.

const STEPS = ["Account", "Payment", "Confirm", "Done"];

const nav = (c: HTMLElement) => c.querySelector<HTMLElement>("nav");
const items = (c: HTMLElement) => [...c.querySelectorAll<HTMLElement>("li")];
const indicators = (c: HTMLElement) => [
	...c.querySelectorAll<HTMLElement>(".stuic-stepper-indicator"),
];
const connectors = (c: HTMLElement) => [
	...c.querySelectorAll<HTMLElement>(".stuic-stepper-connector"),
];
const buttons = (c: HTMLElement) => [...c.querySelectorAll<HTMLButtonElement>("button")];
const srTexts = (c: HTMLElement) =>
	[...c.querySelectorAll<HTMLElement>(".sr-only")].map((s) => s.textContent?.trim());

// ============================================================================
// structure + states
// ============================================================================

test("default: nav landmark, ol/li, states, aria-current, completed check, connectors", async () => {
	const { container } = await render(Stepper, { steps: STEPS, current: 2 });
	const root = nav(container)!;
	expect(root).not.toBeNull();
	expect(root.classList.contains("stuic-stepper")).toBe(true);
	expect(root.getAttribute("data-orientation")).toBe("horizontal");
	expect(root.getAttribute("data-label-position")).toBe("end");
	expect(root.getAttribute("aria-label")).toBe("Progress");
	expect(container.querySelector("ol.stuic-stepper-list")).not.toBeNull();

	const li = items(container);
	expect(li.length).toBe(4);
	expect(li.map((x) => x.getAttribute("data-state"))).toEqual([
		"completed",
		"completed",
		"current",
		"upcoming",
	]);
	// only the current item is aria-current="step"
	expect(li.map((x) => x.getAttribute("aria-current"))).toEqual([
		null,
		null,
		"step",
		null,
	]);

	// completed indicators render a check svg (no number), others the 1-based number
	const ind = indicators(container);
	expect(ind[0].querySelector("svg")).not.toBeNull();
	expect(ind[1].querySelector("svg")).not.toBeNull();
	expect(ind[2].textContent?.trim()).toBe("3");
	expect(ind[3].textContent?.trim()).toBe("4");
	// indicators are decorative — sr text carries the info
	expect(ind[0].getAttribute("aria-hidden")).toBe("true");

	// n-1 connectors; filled (data-state=completed) only after completed steps
	const conn = connectors(container);
	expect(conn.length).toBe(3);
	expect(conn.map((x) => x.getAttribute("data-state"))).toEqual([
		"completed",
		"completed",
		null,
	]);

	// labels visible
	for (const label of STEPS) {
		expect(root.textContent).toContain(label);
	}
	// display-only by default: no buttons
	expect(buttons(container).length).toBe(0);
});

test("sr-only text announces position and completed/failed state", async () => {
	const steps: (StepperStep | string)[] = ["One", { label: "Two", error: true }, "Three"];
	const { container } = await render(Stepper, { steps, current: 2 });
	expect(srTexts(container)).toEqual([
		"Step 1 of 3, Completed",
		"Step 2 of 3, Failed",
		"Step 3 of 3",
	]);
});

test("current=steps.length marks everything completed (wizard done)", async () => {
	const { container } = await render(Stepper, { steps: STEPS, current: STEPS.length });
	const li = items(container);
	expect(li.every((x) => x.getAttribute("data-state") === "completed")).toBe(true);
	expect(container.querySelector("[aria-current]")).toBeNull();
});

test("out-of-range current is clamped", async () => {
	const neg = await render(Stepper, { steps: STEPS, current: -5 });
	expect(items(neg.container)[0].getAttribute("data-state")).toBe("current");

	const huge = await render(Stepper, { steps: STEPS, current: 99 });
	expect(
		items(huge.container).every((x) => x.getAttribute("data-state") === "completed")
	).toBe(true);
});

test("empty steps render nothing", async () => {
	const { container } = await render(Stepper, { steps: [] });
	expect(nav(container)).toBeNull();
});

test("description renders under the label; step objects and strings mix", async () => {
	const { container } = await render(Stepper, {
		steps: [{ label: "Account", description: "Your credentials" }, "Payment"],
	});
	const desc = container.querySelector(".stuic-stepper-description");
	expect(desc?.textContent).toBe("Your credentials");
	expect(nav(container)!.textContent).toContain("Payment");
});

// ============================================================================
// interaction
// ============================================================================

test("onSelect (default clickable=completed): completed enabled, current+upcoming disabled", async () => {
	const onSelect = vi.fn();
	const { container } = await render(Stepper, { steps: STEPS, current: 2, onSelect });
	const btns = buttons(container);
	expect(btns.length).toBe(4);
	expect(btns.map((b) => b.disabled)).toEqual([false, false, true, true]);

	btns[1].click();
	expect(onSelect).toHaveBeenLastCalledWith(1, { label: "Payment" });

	// disabled buttons fire nothing
	btns[2].click();
	btns[3].click();
	expect(onSelect).toHaveBeenCalledTimes(1);
});

test("clickable=all enables upcoming too; per-step disabled stays off", async () => {
	const onSelect = vi.fn();
	const steps: (StepperStep | string)[] = [
		"One",
		"Two",
		{ label: "Three", disabled: true },
		"Four",
	];
	const { container } = await render(Stepper, {
		steps,
		current: 1,
		onSelect,
		clickable: "all",
	});
	const btns = buttons(container);
	// current (1) and step-disabled (2) stay disabled
	expect(btns.map((b) => b.disabled)).toEqual([false, true, true, false]);
	expect(items(container)[2].getAttribute("data-disabled")).toBe("");

	btns[3].click();
	expect(onSelect).toHaveBeenLastCalledWith(3, { label: "Four" });
});

test("clickable=none renders no buttons even with onSelect", async () => {
	const { container } = await render(Stepper, {
		steps: STEPS,
		current: 2,
		onSelect: vi.fn(),
		clickable: "none",
	});
	expect(buttons(container).length).toBe(0);
});

test("disabled disables every button and sets data-disabled on the root", async () => {
	const { container } = await render(Stepper, {
		steps: STEPS,
		current: 2,
		onSelect: vi.fn(),
		disabled: true,
	});
	expect(nav(container)!.getAttribute("data-disabled")).toBe("");
	expect(buttons(container).every((b) => b.disabled)).toBe(true);
});

// ============================================================================
// error + icons
// ============================================================================

test("error step: data-error, X svg instead of number, even when completed", async () => {
	const steps: (StepperStep | string)[] = [{ label: "Failed one", error: true }, "Two"];
	const { container } = await render(Stepper, { steps, current: 1 });
	const li = items(container);
	expect(li[0].getAttribute("data-error")).toBe("");
	expect(li[0].getAttribute("data-state")).toBe("completed");
	expect(li[1].hasAttribute("data-error")).toBe(false);
	// error icon wins over the completed check — still an svg, so assert via sr text
	expect(srTexts(container)[0]).toBe("Step 1 of 2, Failed");
	expect(indicators(container)[0].querySelector("svg")).not.toBeNull();
});

test("step.icon renders custom content in the indicator (unless completed)", async () => {
	const steps: (StepperStep | string)[] = [
		{ label: "One", icon: '<i data-testid="custom-ico">@</i>' },
		{ label: "Two", icon: '<i data-testid="custom-ico2">#</i>' },
	];
	const { container } = await render(Stepper, { steps, current: 1 });
	// step 0 is completed -> check icon wins over custom icon
	expect(container.querySelector('[data-testid="custom-ico"]')).toBeNull();
	// step 1 is current -> custom icon renders
	expect(container.querySelector('[data-testid="custom-ico2"]')).not.toBeNull();
});

test("renderIndicator snippet overrides the bubble content", async () => {
	const renderIndicator = createRawSnippet<
		[{ index: number; step: StepperStep; state: StepperStepState }]
	>((getArg) => ({
		render: () => `<b data-testid="custom-ind">${getArg().index}:${getArg().state}</b>`,
	}));
	const { container } = await render(Stepper, {
		steps: ["One", "Two"],
		current: 1,
		renderIndicator,
	});
	const custom = [...container.querySelectorAll('[data-testid="custom-ind"]')];
	expect(custom.map((x) => x.textContent)).toEqual(["0:completed", "1:current"]);
});

// ============================================================================
// orientation + label position
// ============================================================================

test("orientation=vertical sets data-orientation and drops data-label-position", async () => {
	const { container } = await render(Stepper, {
		steps: STEPS,
		orientation: "vertical",
		labelPosition: "below",
	});
	const root = nav(container)!;
	expect(root.getAttribute("data-orientation")).toBe("vertical");
	expect(root.hasAttribute("data-label-position")).toBe(false);
});

test("labelPosition=below sets data-label-position on horizontal", async () => {
	const { container } = await render(Stepper, { steps: STEPS, labelPosition: "below" });
	expect(nav(container)!.getAttribute("data-label-position")).toBe("below");
});

// ============================================================================
// i18n
// ============================================================================

test("t prop localizes the landmark and sr texts (SK catalog)", async () => {
	const { container } = await render(Stepper, {
		steps: ["Jeden", "Dva"],
		current: 1,
		t: createStepperT(STEPPER_MESSAGES_SK),
	});
	expect(nav(container)!.getAttribute("aria-label")).toBe("Priebeh");
	expect(srTexts(container)).toEqual(["Krok 1 z 2, Dokončený", "Krok 2 z 2"]);
});

// ============================================================================
// customization
// ============================================================================

test("class props merge; rest props pass through", async () => {
	const { container } = await render(Stepper, {
		steps: STEPS,
		current: 1,
		class: "my-extra",
		classStep: "my-step",
		classIndicator: "my-ind",
		classLabel: "my-label",
		classConnector: "my-conn",
		"data-testid": "stp",
	});
	const root = nav(container)!;
	expect(root.classList.contains("stuic-stepper")).toBe(true);
	expect(root.classList.contains("my-extra")).toBe(true);
	expect(root.getAttribute("data-testid")).toBe("stp");

	const li = items(container)[0];
	expect(li.classList.contains("stuic-stepper-item")).toBe(true);
	expect(li.classList.contains("my-step")).toBe(true);
	expect(indicators(container)[0].classList.contains("my-ind")).toBe(true);
	expect(
		container.querySelector(".stuic-stepper-label")!.classList.contains("my-label")
	).toBe(true);
	expect(connectors(container)[0].classList.contains("my-conn")).toBe(true);
});

test("unstyled drops stuic classes and data attributes, keeps structure + sr text", async () => {
	const { container } = await render(Stepper, {
		steps: STEPS,
		current: 2,
		unstyled: true,
	});
	const root = nav(container)!;
	expect(root.classList.contains("stuic-stepper")).toBe(false);
	expect(root.hasAttribute("data-orientation")).toBe(false);
	expect(root.hasAttribute("data-label-position")).toBe(false);
	expect(container.querySelector(".stuic-stepper-list")).toBeNull();
	expect(container.querySelector(".stuic-stepper-indicator")).toBeNull();
	expect(items(container)[0].hasAttribute("data-state")).toBe(false);
	// a11y survives unstyled
	expect(items(container)[2].getAttribute("aria-current")).toBe("step");
	expect(srTexts(container)[0]).toBe("Step 1 of 4, Completed");
});
