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
