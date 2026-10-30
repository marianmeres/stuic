import { test, assert } from "vitest";
import { NotificationsStack } from "./notifications-stack.svelte.js";
import { sleep } from "../../index.js";

test("sanity check", async () => {
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

test("pause holds every clock, resume continues where it stopped", async () => {
	const n = new NotificationsStack(["foo"], {
		defaultTtl: 100,
		disposeInterval: 10,
		extraTtlPerChar: 0,
	});

	await sleep(40);
	n.pause();
	assert(n.paused);
	const progress = n.head!._ttlProgress;
	assert(progress > 0 && progress < 1);

	// well past the ttl: still there, progress frozen
	await sleep(200);
	assert.equal(n.head?.content, "foo");
	assert.equal(n.head?._ttlProgress, progress);

	// added while paused: its clock has not started yet
	n.info("bar");
	await sleep(50);
	n.resume();
	assert(!n.paused);

	// "foo" has ~60ms left, "bar" the full 100ms
	await sleep(30);
	assert.equal(n.stack.length, 2);
	await sleep(50);
	assert.deepEqual(
		n.stack.map((x) => x.content),
		["bar"]
	);
	await sleep(60);
	assert.equal(n.stack.length, 0);

	n.destroy();
});

test("pause/resume are idempotent", async () => {
	const n = new NotificationsStack(["foo"], {
		defaultTtl: 100,
		disposeInterval: 10,
		extraTtlPerChar: 0,
	});

	n.resume(); // not paused: no-op
	n.pause();
	await sleep(30);
	n.pause(); // must not restart the pause (would forget the first 30ms)
	await sleep(30);
	n.resume();
	n.resume();

	// paused the whole 60ms, so ~100ms left
	await sleep(60);
	assert.equal(n.stack.length, 1);
	await sleep(80);
	assert.equal(n.stack.length, 0);

	n.destroy();
});
