import { assert, test } from "vitest";
import { ItemCollection } from "./item-collection.svelte.js";

test("string collection works", () => {
	const c = new ItemCollection<string>(["a", "b", "c"]);
	assert.equal(c.length, 3);

	assert.equal(c.current, "a");
	assert.equal(c.next().current, "b");
	assert.equal(c.next().current, "c");
	assert.equal(c.next().current, "a");

	c.configure({ allowCycle: false });
	assert.equal(c.next().next().next().current, "c"); // not "a"

	assert.equal(c.previous().current, "b");
	assert.equal(c.previous().current, "a");
	assert.equal(c.previous().current, "a");

	c.configure({ allowCycle: true });
	assert.equal(c.previous().current, "c");

	c.add("dd");
	assert.equal(c.length, 4);

	c.add("dd");
	assert.equal(c.length, 4); // still 4, unique by default

	assert.equal(c.next().current, "dd");

	assert.equal(c.at(0), "a");
	assert.equal(c.at(3), "dd");

	assert.equal(c.findIndex("dd"), 3);

	assert.equal(c.findIndexBy("length", 1), 0); // first (a, b, c are equal in length 1)... "a"
	assert.equal(c.findIndexBy("length", 2), 3); // "dd"

	c.remove("dd");
	c.remove("asdf"); // noop
	assert.equal(c.dump().join(), "a,b,c");

	// select by raw value
	assert(c.select("b").isSelected("b"));
	assert(!c.isSelected("c"));
	assert(!c.isSelected("x"));
});

test("selection works", () => {
	const c = new ItemCollection<{ id: number }>([{ id: 1 }, { id: 2 }, { id: 3 }]);

	c.select(c.findIndexBy("id", 1));
	assert.equal(c.selection.join(), [0].join());
	assert(c.isSelected(0));
	assert(!c.isSelected(1));

	c.select(c.findIndexBy("id", 2));
	assert.equal(c.selection.join(), [1].join());
	assert(c.isSelected(1));
	assert(!c.isSelected(0));

	c.configure({ multiple: true });
	c.select(c.findIndexBy("id", 1));
	c.select(c.findIndexBy("id", 2)); // noop, alread selected
	assert.equal(c.selection.toSorted().join(), [0, 1].join());
	assert(c.isSelected(0));
	assert(c.isSelected(1));

	c.toggleSelect(c.findIndexBy("id", 2)); // unselects id: 2 (index 1)
	c.toggleSelect(c.findIndexBy("id", 3)); // selects id: 3 (index 2)
	assert.equal(c.selection.toSorted().join(), [0, 2].join());

	assert(!c.isSelected(456));

	// toggle all
	assert.equal(c.toggleSelection().selection.join(), [1].join());
	assert.equal(c.toggleSelection().selection.join(), [0, 2].join());

	// select none/all
	assert.equal(c.select(false).selection.length, 0);
	assert.equal(c.select(true).selection.join(), [0, 1, 2].join());
});
