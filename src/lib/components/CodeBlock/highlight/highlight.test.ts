import { describe, expect, test } from "vitest";
import {
	highlightCode,
	highlightHttp,
	highlightJson,
	highlightShell,
	HIGHLIGHT_CODE_LANGS,
	type CodeBlockToken,
} from "./index.js";

// Fast node tests for the built-in tokenizers. Tokens are read back as [text, type]
// pairs so a wrong offset shows up as the wrong text.

const read = (code: string, tokens: CodeBlockToken[]) =>
	tokens.map(([s, e, type]) => [code.slice(s, e), type]);

const typed = (code: string, tokens: CodeBlockToken[], type: string) =>
	read(code, tokens)
		.filter(([, t]) => t === type)
		.map(([s]) => s);

/** Tokens are in order and never overlap — the painter relies on neither, but a
 *  tokenizer that breaks this has a scanning bug. */
const assertWellFormed = (code: string, tokens: CodeBlockToken[]) => {
	let last = 0;
	for (const [s, e] of tokens) {
		expect(s).toBeGreaterThanOrEqual(last);
		expect(e).toBeGreaterThan(s);
		expect(e).toBeLessThanOrEqual(code.length);
		last = e;
	}
};

describe("highlightJson", () => {
	test("keys, strings, numbers, literals, punctuation", () => {
		const code = '{\n  "a": "x",\n  "b" : [1, -2.5e3, true, null],\n  "c": false\n}';
		const t = highlightJson(code);
		assertWellFormed(code, t);
		expect(typed(code, t, "property")).toEqual(['"a"', '"b"', '"c"']);
		expect(typed(code, t, "string")).toEqual(['"x"']);
		expect(typed(code, t, "number")).toEqual(["1", "-2.5e3"]);
		expect(typed(code, t, "literal")).toEqual(["true", "null", "false"]);
		expect(typed(code, t, "punctuation").join("")).toBe("{:,:[,,,],:}");
	});

	test("escaped quotes stay inside the string", () => {
		const code = '{"k": "say \\"hi\\""}';
		const t = highlightJson(code);
		expect(typed(code, t, "string")).toEqual(['"say \\"hi\\""']);
	});

	test("tolerates comments, placeholders and an unterminated string", () => {
		const code =
			'{\n  // note\n  "id": "0192f0c1-...", /* x */\n  ...\n  "open": "abc\n}';
		const t = highlightJson(code);
		assertWellFormed(code, t);
		expect(typed(code, t, "comment")).toEqual(["// note", "/* x */"]);
		// stops at the line end rather than eating the rest of the document
		expect(typed(code, t, "string")).toEqual(['"0192f0c1-..."', '"abc']);
		expect(read(code, t).at(-1)).toEqual(["}", "punctuation"]);
	});

	test("digits and literals inside words are not tokens", () => {
		const code = "abc123 nullable truely";
		expect(highlightJson(code)).toEqual([]);
	});
});

describe("highlightHttp", () => {
	test("a response: status line, headers, JSON body", () => {
		const code =
			'HTTP/1.1 429 Too Many Requests\nRetry-After: 12\nContent-Type: application/problem+json\n\n{\n  "status": 429\n}';
		const t = highlightHttp(code);
		assertWellFormed(code, t);
		expect(read(code, t).slice(0, 2)).toEqual([
			["HTTP/1.1", "meta"],
			["429", "number"],
		]);
		expect(typed(code, t, "property")).toEqual([
			"Retry-After",
			"Content-Type",
			// the body is JSON
			'"status"',
		]);
		expect(typed(code, t, "number")).toEqual(["429", "12", "429"]);
		expect(typed(code, t, "string")).toEqual(["application/problem+json"]);
	});

	test("a request line", () => {
		const code = "POST /api/v1/items HTTP/2\nAuthorization: Bearer x";
		const t = highlightHttp(code);
		expect(read(code, t).slice(0, 3)).toEqual([
			["POST", "keyword"],
			["/api/v1/items", "string"],
			["HTTP/2", "meta"],
		]);
		expect(typed(code, t, "string")).toContain("Bearer x");
	});

	test("headers alone", () => {
		const code = "RateLimit-Limit: 600\nRateLimit-Remaining: 421";
		const t = highlightHttp(code);
		expect(read(code, t)).toEqual([
			["RateLimit-Limit", "property"],
			[":", "punctuation"],
			["600", "number"],
			["RateLimit-Remaining", "property"],
			[":", "punctuation"],
			["421", "number"],
		]);
	});

	test("a non-JSON body stays plain; prose is not a request line", () => {
		const code = "HTTP/1.1 200 OK\n\nhello: world";
		expect(read(code, highlightHttp(code))).toEqual([
			["HTTP/1.1", "meta"],
			["200", "number"],
		]);
		expect(highlightHttp("Get the thing")).toEqual([]);
	});
});

describe("highlightShell", () => {
	test("a curl call with a continuation", () => {
		const code =
			'curl -H "Authorization: Bearer $TOKEN" \\\n  "https://x.test/items?limit=10" --data-binary=@f';
		const t = highlightShell(code);
		assertWellFormed(code, t);
		expect(read(code, t)).toEqual([
			["curl", "function"],
			["-H", "parameter"],
			['"Authorization: Bearer ', "string"],
			["$TOKEN", "variable"],
			['"', "string"],
			["\\", "punctuation"],
			['"https://x.test/items?limit=10"', "string"],
			["--data-binary", "parameter"],
		]);
	});

	test("prompts, comments, operators, next commands", () => {
		const code = "$ npm i foo # install\n$ npm run build && deno task test | tee log";
		const t = highlightShell(code);
		assertWellFormed(code, t);
		expect(typed(code, t, "meta")).toEqual(["$", "$"]);
		expect(typed(code, t, "comment")).toEqual(["# install"]);
		expect(typed(code, t, "function")).toEqual(["npm", "npm", "deno", "tee"]);
		expect(typed(code, t, "operator")).toEqual(["&&", "|"]);
	});

	test("assignments, keywords, expansions, substitutions", () => {
		const code =
			"BASE=https://x.test/v1 curl \"$BASE/items\"\nexport TOKEN=abc\nfor f in *.json; do cat ${f}; done\necho $(date) '$literal' $1";
		const t = highlightShell(code);
		assertWellFormed(code, t);
		expect(typed(code, t, "variable")).toEqual(["BASE", "$BASE", "TOKEN", "${f}", "$1"]);
		expect(typed(code, t, "keyword")).toEqual(["export", "for", "in", "do", "done"]);
		expect(typed(code, t, "function")).toEqual(["curl", "cat", "echo", "date"]);
		// single quotes don't expand
		expect(typed(code, t, "string")).toContain("'$literal'");
	});

	test("a mid-word # is not a comment", () => {
		const code = "open https://x.test/#top";
		expect(typed(code, highlightShell(code), "comment")).toEqual([]);
	});

	test("unterminated quotes run to the end without throwing", () => {
		const code = 'echo "open\nstill';
		const t = highlightShell(code);
		assertWellFormed(code, t);
		expect(typed(code, t, "string")).toEqual(['"open\nstill']);
	});
});

describe("highlightCode", () => {
	test("dispatches by lang, case-insensitively; unknown langs get nothing", () => {
		expect(highlightCode('{"a":1}', "JSON").length).toBeGreaterThan(0);
		expect(highlightCode("GET / HTTP/1.1", "http").length).toBeGreaterThan(0);
		expect(highlightCode("ls -la", " Bash ").length).toBeGreaterThan(0);
		expect(highlightCode("const a = 1", "ts")).toEqual([]);
		expect(highlightCode("ls", undefined)).toEqual([]);
		expect(HIGHLIGHT_CODE_LANGS).toContain("shell");
	});
});
