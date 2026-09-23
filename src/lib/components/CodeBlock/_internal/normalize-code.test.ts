import { expect, test } from "vitest";
import { normalizeCode } from "./normalize-code.js";

// Fast node tests for the text CodeBlock displays and copies (unless `verbatim`).

test("drops blank (and whitespace-only) lines at both ends, keeps inner ones", () => {
	expect(normalizeCode("\n  \na\n\nb\n \t\n")).toBe("a\n\nb");
	expect(normalizeCode("\n\ta\n\nb\n")).toBe("\ta\n\nb");
});

test("removes the shared indentation, keeps the relative one", () => {
	expect(normalizeCode('    {\n      "a": 1\n    }')).toBe('{\n  "a": 1\n}');
});

test("the first line keeps its indentation relative to the rest (not String#trim)", () => {
	expect(normalizeCode("  a\n    b")).toBe("a\n  b");
	expect(normalizeCode("    a\n  b")).toBe("  a\nb");
});

test("flush-left code is untouched", () => {
	const code = 'curl -H "Authorization: Bearer $TOKEN" \\\n  https://x.test/me';
	expect(normalizeCode(code)).toBe(code);
});

test("inner blank lines don't count towards the indentation and end up empty", () => {
	expect(normalizeCode("\t\ta\n\n\t\t\tb\n \n\t\tc")).toBe("a\n\n\tb\n\nc");
});

test("tabs and spaces are different indentation", () => {
	expect(normalizeCode("\ta\n  b")).toBe("\ta\n  b");
	expect(normalizeCode("\t a\n\t  b")).toBe("a\n b");
});

test("CRLF and CR line endings become LF", () => {
	expect(normalizeCode("  a\r\n  b\r  c")).toBe("a\nb\nc");
});

test("empty and blank-only input give an empty string", () => {
	expect(normalizeCode("")).toBe("");
	expect(normalizeCode(" \n\t\n ")).toBe("");
});
