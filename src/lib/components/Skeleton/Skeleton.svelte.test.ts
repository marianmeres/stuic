import { render } from "vitest-browser-svelte";
import { expect, test } from "vitest";
import Skeleton from "./Skeleton.svelte";

// Browser-mode tests for the Skeleton loading placeholder.
// Contracts are tied to Skeleton.svelte + its index.css (variant -> class,
// lines -> N child elements, rounded -> class/inline border-radius,
// width/height/size -> inline style, a11y role/aria contract).

test("default rectangle renders role=status, aria-busy and rounded class", async () => {
	const screen = render(Skeleton);
	const el = screen.getByRole("status");
	await expect.element(el).toBeInTheDocument();
	await expect.element(el).toHaveAttribute("aria-busy", "true");
	// rounded defaults to true and variant !== "circle" -> stuic-skeleton-rounded
	await expect.element(el).toHaveClass("stuic-skeleton-rounded");
	// non-circle, non-multiline still has the base "block" class
	await expect.element(el).toHaveClass("block");
});

test("variant=circle adds the circle class and drops rounded class", async () => {
	const screen = render(Skeleton, { variant: "circle" });
	const el = screen.getByRole("status");
	await expect.element(el).toHaveClass("stuic-skeleton-circle");
	// rounded === true && variant !== "circle" is false here -> no rounded class
	await expect.element(el).not.toHaveClass("stuic-skeleton-rounded");
});

test("circle with size sets width and height inline from size", async () => {
	const screen = render(Skeleton, { variant: "circle", size: "48px" });
	const el = screen.getByRole("status");
	// source pushes `width: ${size}` and `height: ${size}` only for circle+size
	await expect.element(el).toHaveStyle({ width: "48px", height: "48px" });
});

test("width and height props are applied as inline style", async () => {
	const screen = render(Skeleton, { width: "200px", height: "100px" });
	const el = screen.getByRole("status");
	await expect.element(el).toHaveStyle({ width: "200px", height: "100px" });
});

test("rounded as a string sets inline border-radius", async () => {
	const screen = render(Skeleton, { rounded: "1rem" });
	const el = screen.getByRole("status");
	// typeof rounded === "string" -> styles.push(`border-radius: ${rounded}`)
	await expect.element(el).toHaveStyle({ borderRadius: "1rem" });
	// string radius means the rounded utility class is NOT added
	await expect.element(el).not.toHaveClass("stuic-skeleton-rounded");
});

test("text variant with lines>1 renders a container with N child placeholders", async () => {
	const lines = 3;
	const screen = render(Skeleton, {
		variant: "text",
		lines,
		// restProps spreads onto the container div; use it to grab the node
		"data-testid": "sk",
	});
	const container = screen.getByTestId("sk");
	await expect.element(container).toBeInTheDocument();
	await expect.element(container).toHaveClass("stuic-skeleton-text-container");
	// the container carries role=status (the multiline branch)
	await expect.element(container).toHaveAttribute("role", "status");
	// each line is a direct child <div>; assert exactly N of them
	const node = container.element() as HTMLElement;
	const lineDivs = node.querySelectorAll(":scope > div");
	expect(lineDivs.length).toBe(lines);
});

test("text variant last line uses default lastLineWidth (75%)", async () => {
	const screen = render(Skeleton, {
		variant: "text",
		lines: 2,
		"data-testid": "sk",
	});
	const container = screen.getByTestId("sk");
	await expect.element(container).toBeInTheDocument();
	const node = container.element() as HTMLElement;
	const lineDivs = node.querySelectorAll<HTMLElement>(":scope > div");
	const last = lineDivs[lineDivs.length - 1];
	// inline style on the last line is `... width: 75%`
	expect(last.style.width).toBe("75%");
});

test("ariaLabel sets aria-label and renders an sr-only span", async () => {
	const screen = render(Skeleton, { ariaLabel: "Loading content" });
	const el = screen.getByRole("status");
	await expect.element(el).toHaveAttribute("aria-label", "Loading content");
	await expect.element(screen.getByText("Loading content")).toHaveClass("sr-only");
});
