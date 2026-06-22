import { render } from "vitest-browser-svelte";
import { expect, test } from "vitest";
import Honeypot from "./Honeypot.svelte";

// Honeypot renders an aria-hidden, off-screen <div class="stuic-honeypot"> wrapping
// a <label> + text <input>. Two contracts matter:
//   (a) the trap is hidden from real users AND assistive tech / keyboard, so it
//       never produces a false positive;
//   (b) it is still a real, in-DOM text input so naive bots fill it.
// Browser tests load NO component CSS, so hiding is asserted via the INLINE style
// the primitive applies on purpose (it must hide without the library stylesheet).

function wrap(container: HTMLElement): HTMLElement {
	const el = container.querySelector<HTMLElement>(".stuic-honeypot");
	if (!el) throw new Error("missing .stuic-honeypot wrapper");
	return el;
}

test("wrapper is aria-hidden and inline-hidden off-screen (not display:none)", async () => {
	const { container } = await render(Honeypot, {});
	const el = wrap(container);
	expect(el.getAttribute("aria-hidden")).toBe("true");
	// Assert via the parsed style object — the browser reserializes the inline
	// string (spaces, 0 -> 0px, reordering), so raw substring checks are brittle.
	expect(el.style.position).toBe("absolute");
	expect(el.style.overflow).toBe("hidden");
	expect(el.style.width).toBe("1px");
	expect(el.style.clip).toContain("rect(");
	// the standard recipe keeps it off-screen rather than removing it
	expect(el.style.display).not.toBe("none");
});

test("default trap input: name=link, type=text, tabindex=-1, autocomplete=new-password", async () => {
	const { container } = await render(Honeypot, {});
	const input = container.querySelector<HTMLInputElement>(".stuic-honeypot input");
	expect(input).not.toBeNull();
	// "link" is tempting to bots but NOT a browser-autofill token
	expect(input!.getAttribute("name")).toBe("link");
	expect(input!.getAttribute("type")).toBe("text");
	expect(input!.getAttribute("tabindex")).toBe("-1");
	// "new-password" (not "off") is the value browsers actually honor as do-not-autofill
	expect(input!.getAttribute("autocomplete")).toBe("new-password");
});

test("custom name maps through and value populates the input", async () => {
	const { container } = await render(Honeypot, { name: "homepage", value: "x" });
	const input = container.querySelector<HTMLInputElement>('input[name="homepage"]');
	expect(input).not.toBeNull();
	expect(input!.value).toBe("x");
});

test("unstyled drops the stuic-honeypot class but stays hidden", async () => {
	const { container } = await render(Honeypot, { unstyled: true, name: "trap" });
	expect(container.querySelector(".stuic-honeypot")).toBeNull();
	const input = container.querySelector<HTMLInputElement>('input[name="trap"]');
	expect(input).not.toBeNull();
	const wrapper = input!.closest("div") as HTMLElement;
	expect(wrapper.getAttribute("aria-hidden")).toBe("true");
	expect(wrapper.style.position).toBe("absolute");
});
