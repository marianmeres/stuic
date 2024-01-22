import { createClogStr } from '@marianmeres/clog';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';
import { strict as assert } from 'node:assert';
import {
	AlertConfirmPromptType,
	createAlertConfirmPromptStore,
} from './alert-confirm-prompt.js';

const clog = createClogStr(path.basename(fileURLToPath(import.meta.url)));

test('basic flow', async () => {
	const acp = createAlertConfirmPromptStore();
	let log;

	assert(acp.get().length === 0);

	acp.alert();

	assert(acp.get().length === 1);
	assert(acp.get()[0].type === AlertConfirmPromptType.ALERT);

	acp.get()[0].onOk(null);

	assert(acp.get().length === 0);

	acp.confirm(acp.close);

	acp.prompt((value: string) => {
		log = value;
		acp.close();
		acp.alert();
	});

	assert(acp.get().length === 2);

	acp.get()[0].onOk(null);
	assert(log === undefined);

	assert(acp.get().length === 1);

	acp.get()[0].onOk(123);
	assert(log === 123);

	assert(acp.get().length === 1);
	assert(acp.get()[0].type === AlertConfirmPromptType.ALERT);
});
