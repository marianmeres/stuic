import { expect, test, assert } from "vitest";
import { NotificationsStack } from "./notifications.svelte.js";
import { sleep } from "../../index.js";

test.only("sanity check", async () => {
	const n = new NotificationsStack(["foo"], {
		defaultTtl: 50,
		disposeInterval: 10,
		extraTtlPerChar: 0,
	});

	assert.equal(n.stack.length, 1);
	assert.equal(n.stack[0], n.head);
	assert.equal(n.head?.type, n.options.defaultType);
	assert.equal(n.head?.count, 1);
	assert(n.head?.id);

	// checking progress update
	let lastProgress = n.head._ttlProgress;
	await sleep(15);
	assert(lastProgress < n.head._ttlProgress);
	lastProgress = n.head._ttlProgress;
	await sleep(15);
	assert(lastProgress < n.head._ttlProgress);
	lastProgress = n.head._ttlProgress;

	// sleep long enough to trigger disposal
	await sleep(100);
	assert(!n.head);

	n.destroy();
});

test("add", async () => {
	const n = new NotificationsStack();

	n.warn("foo");
	n.warn("foo");

	assert.equal(n.stack.length, 1);
	assert.equal(n.head?.count, 2);

	n.reset();
	assert.equal(n.stack.length, 0);

	// same id will be considered same notif (regardless of type - the first wins)
	n.warn("foo", { id: "123" });
	n.error("bar", { id: "123" });
	assert.equal(n.stack.length, 1);
	assert.equal(n.head?.count, 2);
	assert.equal(n.head?.type, "warn"); // first wins

	n.reset();

	// same content but different type is not identical
	n.warn("foo");
	n.error("foo");
	n.info("foo");
	assert.equal(n.stack.length, 3);

	n.removeById(n.head!.id);
	assert.equal(n.stack.length, 2);

	n.destroy();
});

test("max capacity", async () => {
	const n = new NotificationsStack([], {
		maxCapacity: 2,
	});

	for (const i of [1, 2, 3, 4]) {
		n.info(`${i}`);
		await sleep(10); // sorted by created, so sleep a little
	}

	assert.equal(n.stack.length, 2);
	assert.equal(n.stack[0].content, "3");
	assert.equal(n.stack[1].content, "4");

	n.destroy();
});
