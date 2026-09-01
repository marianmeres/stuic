import { assert, test } from "vitest";
import { breadcrumbsJsonLd, breadcrumbsJsonLdScript } from "./json-ld.js";
import type { BreadcrumbItem } from "./Breadcrumbs.svelte";

const ITEMS: BreadcrumbItem[] = [
	{ label: "Home", href: "/" },
	{ label: "Products", href: "/products" },
	{ label: "Phones" },
];

test("breadcrumbsJsonLd: BreadcrumbList with 1-based positions and names", () => {
	const data = breadcrumbsJsonLd(ITEMS);
	assert.equal(data["@context"], "https://schema.org");
	assert.equal(data["@type"], "BreadcrumbList");
	assert.deepEqual(data.itemListElement, [
		{ "@type": "ListItem", position: 1, name: "Home", item: "/" },
		{ "@type": "ListItem", position: 2, name: "Products", item: "/products" },
		// no href (the current page) -> no `item`, per Google's guidelines
		{ "@type": "ListItem", position: 3, name: "Phones" },
	]);
});

test("baseUrl resolves relative hrefs; absolute hrefs keep their own origin", () => {
	const data = breadcrumbsJsonLd(
		[
			{ label: "Home", href: "/" },
			{ label: "Ext", href: "https://other.example/x" },
			{ label: "Rel", href: "products/phones" },
		],
		{ baseUrl: "https://example.com/base/" }
	);
	const urls = data.itemListElement.map((i) => i.item);
	assert.deepEqual(urls, [
		"https://example.com/",
		"https://other.example/x",
		"https://example.com/base/products/phones",
	]);
});

test("baseUrl accepts a URL instance", () => {
	const data = breadcrumbsJsonLd([{ label: "Home", href: "/" }], {
		baseUrl: new URL("https://example.com"),
	});
	assert.equal(data.itemListElement[0].item, "https://example.com/");
});

test("script: wraps in application/ld+json and parses back", () => {
	const script = breadcrumbsJsonLdScript(ITEMS, { baseUrl: "https://example.com" });
	const m = script.match(/^<script type="application\/ld\+json">(.*)<\/script>$/s);
	assert.ok(m, "script tag shape");
	const data = JSON.parse(m![1]);
	assert.equal(data["@type"], "BreadcrumbList");
	assert.equal(data.itemListElement[1].item, "https://example.com/products");
});

test("script: hostile labels cannot break out of the script element", () => {
	const script = breadcrumbsJsonLdScript([
		{ label: "</script><img src=x onerror=alert(1)>", href: "/a?b=1&c=2" },
	]);
	// no raw angle brackets or ampersands anywhere in the payload
	const payload = script.slice(
		'<script type="application/ld+json">'.length,
		-"</script>".length
	);
	assert.notInclude(payload, "<");
	assert.notInclude(payload, ">");
	assert.notInclude(payload, "&");
	// ...and it still round-trips to the original label
	const data = JSON.parse(payload);
	assert.equal(data.itemListElement[0].name, "</script><img src=x onerror=alert(1)>");
	assert.equal(data.itemListElement[0].item, "/a?b=1&c=2");
});
