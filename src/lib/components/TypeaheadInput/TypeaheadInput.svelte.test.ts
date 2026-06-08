import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { expect, test, vi } from "vitest";
import TypeaheadInput from "./TypeaheadInput.svelte";

// TypeaheadInput is a thin wrapper: a single <input type="text"> bound to `value`
// and driven by the `typeahead` action (../../actions/typeahead.svelte.ts), plus a
// Spinner shown while `getOptions` is in flight. `getOptions` is a REQUIRED prop.
//
// IMPORTANT (verified against the action source): on mount the typeahead $effect sets
//   role="combobox", aria-autocomplete="inline", aria-expanded="false"
// on the input element. So the input is NOT discoverable via getByRole("textbox") —
// it resolves as a `combobox`. We therefore locate it via getByRole("combobox").
//
// getOptions invocation path (verified): input event -> onInput -> scheduleSearch(value)
//   -> setTimeout(..., debounceMs=150) -> performSearch -> getOptions(query, []).
// performSearch only calls getOptions when the query is non-empty (allowListAll is
// false here), so typing a non-empty value is what eventually triggers the call.
// We assert it is EVENTUALLY called via expect.poll — never an exact debounce time.

// Signature mirrors the `getOptions` prop: (query, current) => Promise<results>.
// Declaring both params matters for typing — vi.fn(noopOptions) infers its call-args
// tuple from this signature, so getOptions.mock.calls.at(-1) is [string, unknown[]]
// rather than an empty tuple (which would make destructuring a TS error).
const noopOptions = (_query: string, _current: unknown[]) => Promise.resolve([]);

test("renders an input with the given placeholder and name (combobox role from the action)", async () => {
	const screen = render(TypeaheadInput, {
		value: "",
		placeholder: "Search…",
		name: "city",
		getOptions: vi.fn(noopOptions),
	});
	// The action upgrades the input to role=combobox on mount; expect.element retries
	// until that $effect has applied, so this also proves the action wired up.
	const input = screen.getByRole("combobox");
	await expect.element(input).toBeInTheDocument();
	await expect.element(input).toHaveAttribute("type", "text");
	await expect.element(input).toHaveAttribute("placeholder", "Search…");
	await expect.element(input).toHaveAttribute("name", "city");
	// aria contract contributed by the typeahead action
	await expect.element(input).toHaveAttribute("aria-autocomplete", "inline");
	await expect.element(input).toHaveAttribute("aria-expanded", "false");
});

test("defaults name to 'text_input' when not provided", async () => {
	const screen = render(TypeaheadInput, { value: "", getOptions: vi.fn(noopOptions) });
	await expect
		.element(screen.getByRole("combobox"))
		.toHaveAttribute("name", "text_input");
});

test("value binding: initial value is reflected in the input", async () => {
	const screen = render(TypeaheadInput, {
		value: "hi",
		getOptions: vi.fn(noopOptions),
	});
	await expect.element(screen.getByRole("combobox")).toHaveValue("hi");
});

test("filling the input updates the visible value", async () => {
	const screen = render(TypeaheadInput, {
		value: "",
		getOptions: vi.fn(noopOptions),
	});
	const input = screen.getByRole("combobox");
	await input.fill("hello");
	await expect.element(input).toHaveValue("hello");
});

test("typing a non-empty query eventually calls getOptions", async () => {
	const getOptions = vi.fn(noopOptions);
	const screen = render(TypeaheadInput, { value: "", getOptions });
	await screen.getByRole("combobox").fill("abc");
	// Debounced (~150ms) + async; assert it fires without pinning exact timing.
	await expect
		.poll(() => getOptions.mock.calls.length, { timeout: 2000 })
		.toBeGreaterThan(0);
	// First arg is the typed query string; second is the current items array.
	const [query, current] = getOptions.mock.calls.at(-1)!;
	expect(query).toBe("abc");
	expect(Array.isArray(current)).toBe(true);
});

test("spinner is shown while getOptions is in flight (pending promise)", async () => {
	// Keep getOptions pending forever so isFetching stays true -> Spinner stays mounted.
	// The action calls onFetchingChange(true) immediately before awaiting getOptions.
	let resolve!: (v: never[]) => void;
	const getOptions = vi.fn(() => new Promise<never[]>((r) => (resolve = r)));
	const { container } = render(TypeaheadInput, { value: "", getOptions });
	const input = page.elementLocator(container.querySelector("input")!);
	await input.fill("xy");
	// Spinner.svelte renders <div class="stuic-spinner">; it appears once fetching=true.
	await expect.poll(() => container.querySelector(".stuic-spinner")).not.toBeNull();
	// Cleanly resolve to avoid leaving a dangling promise.
	resolve([]);
});

test("noSpinner suppresses the Spinner even while fetching", async () => {
	let resolve!: (v: never[]) => void;
	const getOptions = vi.fn(() => new Promise<never[]>((r) => (resolve = r)));
	const { container } = render(TypeaheadInput, {
		value: "",
		noSpinner: true,
		getOptions,
	});
	const input = page.elementLocator(container.querySelector("input")!);
	await input.fill("xy");
	// getOptions should still be invoked (the search runs), proving we are "fetching"...
	await expect.poll(() => getOptions.mock.calls.length).toBeGreaterThan(0);
	// ...but no spinner is rendered.
	expect(container.querySelector(".stuic-spinner")).toBeNull();
	resolve([]);
});
