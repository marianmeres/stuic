import { createClogStr } from '@marianmeres/clog';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';
import { strict as assert } from 'node:assert';
import { createNotificationsStore, type Notification } from './notifications.js';

const clog = createClogStr(path.basename(fileURLToPath(import.meta.url)));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test('initial', async () => {
	const store = createNotificationsStore(['foo']);
	store.subscribe((notifs: Notification[]) => {
		// clog(notifs);
		assert(notifs.length === 1);
		assert(notifs[0].content === 'foo');
		assert(notifs[0].id);
		assert(notifs[0].created);
		assert(notifs[0].type === store.options.defaultType);
	})();
});

test('add', async () => {
	const store = createNotificationsStore([], { defaultTtl: 0 });

	store.subscribe((notifs: Notification[]) => {
		assert(!notifs.length);
	})();

	store.add('foo');

	store.subscribe((notifs: Notification[]) => {
		assert(notifs.length === 1);
		assert(notifs[0].content === 'foo');
		assert(notifs[0].id);
		assert(notifs[0].created);
	})();

	const old = { id: 'old', content: 'hoho', created: new Date(0), type: 'custom' };
	store.add(old);

	// test adding multiple times the same notification - must be ignored
	store.add(old);

	store.subscribe((notifs: Notification[]) => {
		// clog(notifs);
		// must be 2, not 3
		assert(notifs.length === 2);
		// must be sorted by created descending
		assert(notifs[0].created < notifs[1].created);
		assert(notifs[0] === old); // same instance
		assert(notifs[1].content === 'foo'); // same instance
	})();

	const notif = store.find('old');
	// clog(notif);
	assert(notif === old);

	store.remove(old.id);

	store.subscribe((notifs: Notification[]) => {
		assert(notifs.length === 1);
		assert(notifs[0].content === 'foo');
	})();
});

test('events', async () => {
	let log: any[] = [];
	const n = {
		id: 'some-id',
		content: 'some-text',
		on: (eventName: string, self: Notification, all: Notification[], data: any) =>
			log.push({ eventName, data, self, all }),
	};

	const store = createNotificationsStore([n, 'foo']);

	store.event(n.id, 'some', 123);
	store.event(n.id, 'another', 456);
	store.event('non-existing', 'another', 456);

	// clog(log);
	assert(log.length === 2);
	assert(log[0].eventName === 'some');

	assert(log[1].data === 456);

	// once removed, no more event listening
	store.remove(n.id);
	log = [];
	store.event(n.id, 'some', 123);
	assert(log.length === 0);
});

test('max capacity', async () => {
	const store = createNotificationsStore([], { maxCapacity: 2 });

	for (let n of 'abcd'.split('')) {
		// so the created by sort makes sense
		await sleep(10);
		store.add(n);
	}

	store.subscribe((notifs: Notification[]) => {
		// clog(notifs);
		assert(notifs.length === 2);
		// first 2 (a, b) must have been ignored
		assert(notifs[0].content === 'c');
		assert(notifs[1].content === 'd');
	})();
});

test('ttl', async () => {
	const store = createNotificationsStore([], { defaultTtl: 1 });
	store.add('foo');

	store.subscribe(async (notifs: Notification[]) => {
		assert(notifs.length);
	})();

	await sleep(1100);

	store.subscribe(async (notifs: Notification[]) => {
		assert(!notifs.length);
	})();
});

test('multiple same id increases count', async () => {
	const store = createNotificationsStore([
		{ id: 'foo', content: 'Foo' },
		{ id: 'bar', content: 'Bar' },
		{ id: 'foo', content: 'This will be ignored because same id' },
	]);
	store.subscribe((notifs: Notification[]) => {
		// clog(notifs);
		assert(notifs.length === 2);
		assert(notifs[0].content === 'Foo');
		assert(notifs[0].count === 2);

		assert(notifs[1].content === 'Bar');
		assert(notifs[1].count === 1);
	})();
});
