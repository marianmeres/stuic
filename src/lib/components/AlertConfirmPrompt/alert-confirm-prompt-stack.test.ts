import { assert, test } from "vitest";
import { AlertConfirmPromptStack, AlertConfirmPromptType } from "./index.js";

test("basic flow", () => {
	const acp = new AlertConfirmPromptStack();
	let log;

	assert.equal(acp.length, 0);
	acp.alert();
	assert.equal(acp.length, 1);
	assert.equal(acp.current.type, AlertConfirmPromptType.ALERT);

	acp.current?.onOk?.(null);
	assert.equal(acp.length, 0);

	acp.confirm(acp.shift);
	acp.prompt((value: string) => {
		log = value;
		acp.shift();
		acp.alert();
	});

	assert.equal(acp.length, 2);
	acp.current?.onOk?.(null);
	assert.isUndefined(log);

	assert.equal(acp.length, 1);

	acp.current?.onOk?.(123);
	assert.equal(log, 123);

	assert.equal(acp.length, 1);
	assert.equal(acp.current.type, AlertConfirmPromptType.ALERT);

	assert.equal(acp.dump()[0], acp.current);
});

// `escape()` runs the current dialog's `onEscape` and nothing else: the handler owns
// the close (it defaults to `shift`), so a stack of two must lose exactly one entry.
// The old implementation shifted on its own after the handler, popping the queued
// dialog behind the escaped one without it ever being shown.
test("escape: default onEscape pops exactly the current dialog", () => {
	const acp = new AlertConfirmPromptStack();
	acp.alert("first");
	acp.alert("second");
	assert.equal(acp.length, 2);

	acp.escape();

	assert.equal(acp.length, 1);
	assert.equal(acp.current.title, "second");
});

test("escape: a custom onEscape that shifts pops exactly one entry", () => {
	const acp = new AlertConfirmPromptStack();
	let escaped = 0;
	acp.confirm(acp.shift, {
		onEscape: () => {
			escaped++;
			acp.shift();
		},
	});
	acp.alert("queued");

	acp.escape();

	assert.equal(escaped, 1);
	assert.equal(acp.length, 1);
	assert.equal(acp.current.title, "queued");
});

test("escape: a custom onEscape that does not shift keeps the dialog", () => {
	const acp = new AlertConfirmPromptStack();
	let escaped = 0;
	acp.confirm(acp.shift, { title: "stay", onEscape: () => void escaped++ });

	acp.escape();

	assert.equal(escaped, 1);
	assert.equal(acp.length, 1);
	assert.equal(acp.current.title, "stay");
});

test("escape: no-op on an empty stack", () => {
	const acp = new AlertConfirmPromptStack();
	assert.doesNotThrow(() => acp.escape());
	assert.equal(acp.length, 0);
});
