import { render } from "vitest-browser-svelte";
import { expect, test } from "vitest";
import { createRawSnippet } from "svelte";
import PhoneFrame from "./PhoneFrame.svelte";
// the aspect-ratio / clipped-window tests measure real layout, so they need the stylesheet
import "./index.css";

// PhoneFrame renders <div|a.stuic-phone-frame> › <div.stuic-phone-frame-screen> ›
// (<img.stuic-phone-frame-image> | children) + optional <div.stuic-phone-frame-notch>.
// Asserted here: the element polymorphism (href → <a>, target → rel default), the
// <img> attribute contract, children-over-src precedence, the data-notch contract,
// unstyled/class merging, and the measured screen geometry — the aspect-ratio-locked
// height by default, and the fixed-height window (ratio dropped, width kept) with
// `screenHeight`. Theme color tokens are not loaded in tests; the geometry does not
// depend on them.

// 1x1 transparent PNG — a loadable image URL, so <img> never errors
const PNG =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

const text = (s: string) =>
	createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

function parts(screen: ReturnType<typeof render>) {
	const root = screen.container.querySelector<HTMLElement>(".stuic-phone-frame")!;
	const scr = root.querySelector<HTMLElement>(".stuic-phone-frame-screen")!;
	const img = root.querySelector<HTMLImageElement>("img");
	return { root, scr, img };
}

// Locators are page-scoped, so every render within one test gets its own testid / name.
// `target` is also a Svelte mount option name, so those renders go through `{ props }`.

test("renders a <div> by default and an <a> with href", async () => {
	const a = render(PhoneFrame, { src: PNG, alt: "Shot", "data-testid": "pf-div" });
	const div = a.getByTestId("pf-div");
	await expect.element(div).toBeInTheDocument();
	expect((div.element() as HTMLElement).tagName).toBe("DIV");
	expect((div.element() as HTMLElement).hasAttribute("href")).toBe(false);

	const b = render(PhoneFrame, { src: PNG, alt: "Linked shot", href: "/live" });
	const link = b.getByRole("link", { name: "Linked shot" });
	await expect.element(link).toHaveAttribute("href", "/live");
	expect((link.element() as HTMLElement).tagName).toBe("A");
});

test("target=_blank defaults rel to noopener; explicit rel wins; no target → no rel", async () => {
	const blank = render(PhoneFrame, {
		props: { src: PNG, alt: "Blank", href: "/x", target: "_blank" },
	});
	const blankLink = blank.getByRole("link", { name: "Blank" });
	await expect.element(blankLink).toHaveAttribute("rel", "noopener");
	await expect.element(blankLink).toHaveAttribute("target", "_blank");

	const explicit = render(PhoneFrame, {
		props: {
			src: PNG,
			alt: "Explicit",
			href: "/x",
			target: "_blank",
			rel: "noopener noreferrer",
		},
	});
	await expect
		.element(explicit.getByRole("link", { name: "Explicit" }))
		.toHaveAttribute("rel", "noopener noreferrer");

	const same = render(PhoneFrame, { src: PNG, alt: "Same tab", href: "/x" });
	const sameLink = same.getByRole("link", { name: "Same tab" });
	await expect.element(sameLink).toBeInTheDocument();
	expect((sameLink.element() as HTMLElement).hasAttribute("rel")).toBe(false);
});

test("img gets the attribute contract: lazy by default, eager/fetchpriority/srcset/sizes/size", async () => {
	const lazy = render(PhoneFrame, { src: PNG, alt: "Shot", width: 780, height: 1688 });
	const img = lazy.getByRole("img", { name: "Shot" });
	await expect.element(img).toHaveAttribute("src", PNG);
	await expect.element(img).toHaveAttribute("loading", "lazy");
	await expect.element(img).toHaveAttribute("decoding", "async");
	await expect.element(img).toHaveAttribute("width", "780");
	await expect.element(img).toHaveAttribute("height", "1688");
	await expect.element(img).toHaveClass("stuic-phone-frame-image");
	expect((img.element() as HTMLElement).hasAttribute("fetchpriority")).toBe(false);

	const eager = render(PhoneFrame, {
		src: PNG,
		alt: "Hero",
		loading: "eager",
		fetchpriority: "high",
		srcset: `${PNG} 2x`,
		sizes: "16rem",
	});
	const hero = eager.getByRole("img", { name: "Hero" });
	await expect.element(hero).toHaveAttribute("loading", "eager");
	await expect.element(hero).toHaveAttribute("fetchpriority", "high");
	await expect.element(hero).toHaveAttribute("srcset", `${PNG} 2x`);
	await expect.element(hero).toHaveAttribute("sizes", "16rem");
});

test("children render on the screen and take precedence over src", async () => {
	const screen = render(PhoneFrame, {
		src: PNG,
		alt: "Shot",
		children: text("Live app"),
	});
	await expect.element(screen.getByText("Live app")).toBeVisible();
	const { scr, img } = parts(screen);
	expect(img).toBeNull();
	expect(scr.contains(screen.getByText("Live app").element())).toBe(true);
});

test("no src and no children → an empty screen, no <img>", async () => {
	const screen = render(PhoneFrame, { "data-testid": "pf" });
	await expect.element(screen.getByTestId("pf")).toBeInTheDocument();
	const { scr, img } = parts(screen);
	expect(img).toBeNull();
	expect(scr.children.length).toBe(0);
});

test("notch: none by default; island/notch set data-notch and render the cutout", async () => {
	const none = render(PhoneFrame, { src: PNG, alt: "A", "data-testid": "pf-none" });
	const noneRoot = none.getByTestId("pf-none");
	await expect.element(noneRoot).toBeInTheDocument();
	const noneNode = noneRoot.element() as HTMLElement;
	expect(noneNode.hasAttribute("data-notch")).toBe(false);
	expect(noneNode.querySelector(".stuic-phone-frame-notch")).toBeNull();

	for (const notch of ["island", "notch"] as const) {
		const screen = render(PhoneFrame, {
			src: PNG,
			alt: "A",
			notch,
			"data-testid": `pf-${notch}`,
		});
		const root = screen.getByTestId(`pf-${notch}`);
		await expect.element(root).toHaveAttribute("data-notch", notch);
		const cutout = (root.element() as HTMLElement).querySelector<HTMLElement>(
			".stuic-phone-frame-notch"
		);
		expect(cutout).not.toBeNull();
		expect(cutout!.getAttribute("aria-hidden")).toBe("true");
	}
});

test("class props merge onto frame, screen and image; rest props land on the root", async () => {
	const screen = render(PhoneFrame, {
		src: PNG,
		alt: "A",
		class: "w-64 custom-frame",
		classScreen: "custom-screen",
		classImage: "custom-image",
		"aria-label": "Phone preview",
		"data-testid": "pf",
	});
	const root = screen.getByTestId("pf");
	await expect.element(root).toHaveClass("stuic-phone-frame");
	await expect.element(root).toHaveClass("custom-frame");
	await expect.element(root).toHaveClass("w-64");
	await expect.element(root).toHaveAttribute("aria-label", "Phone preview");
	const { scr, img } = parts(screen);
	expect(scr.classList.contains("stuic-phone-frame-screen")).toBe(true);
	expect(scr.classList.contains("custom-screen")).toBe(true);
	expect(img!.classList.contains("stuic-phone-frame-image")).toBe(true);
	expect(img!.classList.contains("custom-image")).toBe(true);
});

test("unstyled drops every stuic class, the data-notch attribute and the cutout", async () => {
	const screen = render(PhoneFrame, {
		src: PNG,
		alt: "A",
		notch: "island",
		unstyled: true,
		class: "only-mine",
		classScreen: "only-screen",
		classImage: "only-img",
		"data-testid": "pf",
	});
	const root = screen.getByTestId("pf");
	await expect.element(root).toHaveClass("only-mine");
	await expect.element(root).not.toHaveClass("stuic-phone-frame");
	const node = root.element() as HTMLElement;
	expect(node.hasAttribute("data-notch")).toBe(false);
	expect(node.querySelector(".stuic-phone-frame-notch")).toBeNull();
	expect(node.querySelector("[class*='stuic-']")).toBeNull();
	expect(node.querySelector(".only-screen")).not.toBeNull();
	expect(node.querySelector("img.only-img")).not.toBeNull();
});

test("default screen geometry: height derived from width by the 390/844 ratio", async () => {
	const screen = render(PhoneFrame, {
		src: PNG,
		alt: "A",
		style: "width: 300px",
		"data-testid": "pf",
	});
	await expect.element(screen.getByTestId("pf")).toBeInTheDocument();
	const { scr } = parts(screen);
	await expect.poll(() => scr.offsetWidth).toBeGreaterThan(0);
	const w = scr.getBoundingClientRect().width;
	const h = scr.getBoundingClientRect().height;
	expect(Math.abs(h - (w * 844) / 390)).toBeLessThan(1);
});

test("aspectRatio prop changes the derived height", async () => {
	const screen = render(PhoneFrame, {
		src: PNG,
		alt: "A",
		aspectRatio: "1 / 2",
		style: "width: 300px",
		"data-testid": "pf",
	});
	await expect.element(screen.getByTestId("pf")).toBeInTheDocument();
	const { scr } = parts(screen);
	await expect.poll(() => scr.offsetWidth).toBeGreaterThan(0);
	expect(scr.getAttribute("style")).toContain(
		"--stuic-phone-frame-screen-aspect-ratio: 1 / 2"
	);
	const r = scr.getBoundingClientRect();
	expect(Math.abs(r.height - r.width * 2)).toBeLessThan(1);
});

test("screenHeight makes a fixed-height window: height = value, width still fills the bezel", async () => {
	const screen = render(PhoneFrame, {
		src: PNG,
		alt: "A",
		screenHeight: "200px",
		style: "width: 300px",
		"data-testid": "pf",
	});
	await expect.element(screen.getByTestId("pf")).toBeInTheDocument();
	const { root, scr } = parts(screen);
	await expect.poll(() => scr.offsetWidth).toBeGreaterThan(0);
	const r = scr.getBoundingClientRect();
	expect(Math.round(r.height)).toBe(200);
	// the ratio is NOT applied: the screen keeps the bezel's full content width
	const rootInner = root.clientWidth - 2 * parseFloat(getComputedStyle(root).paddingLeft);
	expect(Math.abs(r.width - rootInner)).toBeLessThan(1);
	expect(r.width).toBeGreaterThan(250);
	// and the screen clips (the window shows the top only)
	expect(getComputedStyle(scr).overflow).toBe("hidden");
});

test("the --stuic-phone-frame-screen-height token set on the root (inherited) clips too", async () => {
	// what the responsive recipe relies on: a token set via `class`/`style` on the frame
	// is inherited by the screen when the prop is not given
	const screen = render(PhoneFrame, {
		src: PNG,
		alt: "A",
		style: "width: 300px; --stuic-phone-frame-screen-height: 120px",
		"data-testid": "pf",
	});
	await expect.element(screen.getByTestId("pf")).toBeInTheDocument();
	const { scr } = parts(screen);
	await expect.poll(() => scr.offsetWidth).toBeGreaterThan(0);
	expect(Math.round(scr.getBoundingClientRect().height)).toBe(120);
});
