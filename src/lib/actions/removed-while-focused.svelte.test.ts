/**
 * Chromium blurs a focused field while removing it from the DOM, and commits it first if
 * it was EDITED: a `change`, then a `blur`, both dispatched from inside the removal, on
 * a node that is still connected, and before the field's actions have been cleaned up.
 * Svelte removes DOM inside a block effect, where a `$state` write throws
 * `state_unsafe_mutation`.
 *
 * Three actions listen for those events. What each has to do with them:
 *
 * - `trim`       (`change`) still commit the trimmed value to the bound state, without
 *                throwing
 * - `validate`   (`change`, `blur`) nothing at all: no state write, and no run of the
 *                consumer's validator on a field that is going away
 * - `typeahead`  (`blur`) nothing at all: no `onSubmit` for text nobody confirmed
 *
 * The other cases are what must keep working through any fix: a field blurred before it
 * goes, a synthetic `change` validated synchronously (the submit check reads the result
 * at once), a real edit validated, a commit that re-runs the action, and a real blur
 * submitting a typeahead.
 */
import { flushSync } from "svelte";
import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import { page, userEvent } from "vitest/browser";
import Harness from "./RemovedWhileFocusedHarness.test.svelte";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Records what would otherwise go unnoticed: uncaught errors and Svelte's warnings. */
function watch() {
	const errors: string[] = [];
	const warnings: string[] = [];
	const onError = (event: ErrorEvent) => {
		errors.push(`${event.message}`.split("\n")[0] ?? "");
		event.preventDefault();
	};
	window.addEventListener("error", onError);
	const warn = vi.spyOn(console, "warn").mockImplementation((...args: unknown[]) => {
		const text = args.map(String).join(" ");
		if (text.includes("[svelte]"))
			warnings.push(text.match(/\[svelte\] (\w+)/)?.[1] ?? text);
	});
	return {
		errors,
		warnings,
		stop() {
			window.removeEventListener("error", onError);
			warn.mockRestore();
		},
	};
}

/** Takes the field away with the caret still in it, and waits out anything deferred. */
async function takeAway() {
	window.dispatchEvent(new Event("take-away"));
	flushSync();
	await sleep(50);
	expect(document.querySelector('[data-testid="field"]')).toBe(null);
}

/** What the browser dispatches on the field from here on, and whether it is still in the DOM. */
function record(el: HTMLElement) {
	const seen: string[] = [];
	for (const type of ["change", "blur"]) {
		el.addEventListener(
			type,
			() => seen.push(`${type}:connected=${el.isConnected}`),
			true
		);
	}
	return seen;
}

const boundValue = () => document.querySelector('[data-testid="value"]')?.textContent;

/** Mounts `variant`, types `  abc  ` into its field and removes it mid-edit. */
async function editThenTakeAway(variant: string, first?: "blur") {
	const watched = watch();
	try {
		await render(Harness, { variant });
		const field = page.getByTestId("field");
		await field.click();
		await userEvent.keyboard("  abc  ");
		const el = field.element() as HTMLInputElement;
		const seen = record(el);
		if (first === "blur") {
			el.blur();
			await sleep(30);
			seen.length = 0;
		}
		await takeAway();
		return { errors: watched.errors, seen, value: boundValue() };
	} finally {
		watched.stop();
	}
}

test("the removal itself dispatches `change`, then `blur`, on a node that is still connected", async () => {
	const out = await editThenTakeAway("default");
	// The premise of every case below. Chromium commits the edit and blurs the field
	// before it detaches it, which is why an `isConnected` guard in a listener cannot
	// tell this `change` from a real one. If this stops holding, the cases below pass
	// without testing anything.
	expect(out.seen).toEqual(["change:connected=true", "blur:connected=true"]);
	expect(out.errors).toEqual([]);
	expect(out.value).toBe("abc");
});

test("`trim` alone does not throw when its field is removed mid-edit, and the trim lands", async () => {
	const out = await editThenTakeAway("trim");
	expect(out.errors).toEqual([]);
	expect(out.value).toBe("abc");
});

test("`validate` alone does not throw when its field is removed mid-edit", async () => {
	expect((await editThenTakeAway("validate")).errors).toEqual([]);
});

test("a `FieldTextarea` removed mid-edit does not throw either, and is trimmed", async () => {
	const out = await editThenTakeAway("textarea");
	expect(out.errors).toEqual([]);
	expect(out.value).toBe("abc");
});

test("the consumer's validator is not run on a field that is going away", async () => {
	const onValidatorCall = vi.fn();
	const watched = watch();
	try {
		await render(Harness, { variant: "child", onValidatorCall });
		const field = page.getByTestId("field");
		// A first, ordinary commit: the validator runs, and its `$derived` gets a value.
		// (Without one, the read below would be the derived's first, which never warns.)
		await field.click();
		await userEvent.keyboard("x");
		await userEvent.keyboard("{Tab}");
		await expect.poll(() => onValidatorCall.mock.calls.length).toBeGreaterThan(0);
		await sleep(30);
		const before = onValidatorCall.mock.calls.length;

		// A second edit, left uncommitted: the `$derived` is stale when the field goes.
		await field.click();
		await userEvent.keyboard("y");
		const seen = record(field.element() as HTMLElement);
		await takeAway();

		expect(seen).toContain("change:connected=true");
		expect(onValidatorCall.mock.calls.length).toBe(before);
		// Svelte's `derived_inert`: the validator read a `$derived` of a dying component.
		expect(watched.warnings).toEqual([]);
		expect(watched.errors).toEqual([]);
	} finally {
		watched.stop();
	}
});

test("a field that was blurred first is removed quietly, and was trimmed", async () => {
	const out = await editThenTakeAway("default", "blur");
	expect(out.seen).toEqual([]);
	expect(out.errors).toEqual([]);
	expect(out.value).toBe("abc");
});

test("a synthetic `change` is validated synchronously, as a submit check reads it", async () => {
	await render(Harness, { variant: "required" });
	const el = page.getByTestId("field").element() as HTMLInputElement;
	// `onSubmitValidityCheck` dispatches this and reads the result at once, so the
	// validation it triggers must not be deferred.
	el.dispatchEvent(new Event("change", { bubbles: true }));
	flushSync();
	expect(document.querySelector(".validation-box")).not.toBe(null);
});

test("a real edit committed by Tab is validated", async () => {
	await render(Harness, { variant: "email" });
	await page.getByTestId("field").click();
	await userEvent.keyboard("not an address");
	await userEvent.keyboard("{Tab}");
	await expect.poll(() => document.querySelector(".validation-box")).not.toBe(null);
});

test("a commit that re-runs the `validate` action is still validated", async () => {
	await render(Harness, { variant: "rerun" });
	const field = page.getByTestId("field");
	await field.click();
	await userEvent.keyboard("  abc  ");
	// Committed from script, as focus management does (`next.focus()`): `change` is
	// dispatched with script on the stack, so no microtask runs between its listeners.
	// `trim` writes the bound value, the `validate` options depend on it, and the
	// action is re-run before the deferred validation fires. The validation must not
	// be lost with the superseded run.
	(field.element() as HTMLInputElement).blur();
	await expect
		.poll(() => document.querySelector(".validation-box")?.textContent ?? "")
		.toContain("Taken");
	expect(boundValue()).toBe("abc");
});

test("a typeahead removed while focused does not submit what was typed", async () => {
	const onSubmitCall = vi.fn();
	const watched = watch();
	try {
		await render(Harness, { variant: "typeahead", onSubmitCall });
		const field = page.getByTestId("field");
		await field.click();
		await userEvent.keyboard("abc");
		const seen = record(field.element() as HTMLElement);
		await takeAway();

		// No edit is needed for this one: the removal's `blur` is enough.
		expect(seen).toContain("blur:connected=true");
		expect(onSubmitCall).not.toHaveBeenCalled();
		expect(document.querySelector('[data-testid="submitted"]')?.textContent).toBe("");
		expect(watched.errors).toEqual([]);
	} finally {
		watched.stop();
	}
});

test("a typeahead the user really leaves still submits, once", async () => {
	const onSubmitCall = vi.fn();
	await render(Harness, { variant: "typeahead", onSubmitCall });
	await page.getByTestId("field").click();
	await userEvent.keyboard("abc");
	await userEvent.keyboard("{Tab}");
	await expect.poll(() => onSubmitCall.mock.calls).toEqual([["abc"]]);
	await sleep(30);
	expect(onSubmitCall).toHaveBeenCalledTimes(1);
});

test("…and so does one blurred from script", async () => {
	const onSubmitCall = vi.fn();
	await render(Harness, { variant: "typeahead", onSubmitCall });
	const field = page.getByTestId("field");
	await field.click();
	await userEvent.keyboard("abc");
	(field.element() as HTMLInputElement).blur();
	await expect.poll(() => onSubmitCall.mock.calls).toEqual([["abc"]]);
});
