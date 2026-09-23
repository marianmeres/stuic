import type { CodeBlockToken } from "./types.js";
import { tokenizeJsonInto } from "./json.js";

const METHODS = "GET|HEAD|POST|PUT|PATCH|DELETE|OPTIONS|CONNECT|TRACE";
const REQUEST_LINE = new RegExp(
	`^(${METHODS})([ \\t]+)(\\S+)(?:([ \\t]+)(HTTP\\/[\\d.]+))?[ \\t]*$`
);
const STATUS_LINE = /^(HTTP\/[\d.]+)([ \t]+)(\d{3})\b/;
const HEADER = /^([!#$%&'*+.^_`|~0-9A-Za-z-]+)(:)([ \t]*)(.*?)[ \t]*$/;

/**
 * Highlights an HTTP message — a request or status line, headers, and a JSON body (after
 * the blank line) — or just a block of headers. A non-JSON body is left plain.
 */
export function highlightHttp(code: string): CodeBlockToken[] {
	const out: CodeBlockToken[] = [];
	let pos = 0;
	let started = false;

	while (pos <= code.length) {
		const nl = code.indexOf("\n", pos);
		const end = nl < 0 ? code.length : nl;
		const line = code.slice(pos, end).replace(/\r$/, "");

		if (!line.trim()) {
			// the blank line after the head: the rest is the body
			if (started) {
				const body = code.slice(end + 1);
				if (/^\s*[{[]/.test(body)) tokenizeJsonInto(body, end + 1, out);
				break;
			}
		} else {
			started = true;
			let m: RegExpExecArray | null;
			if ((m = REQUEST_LINE.exec(line))) {
				const [, method, gap1, target, gap2, version] = m;
				let at = pos;
				out.push([at, (at += method.length), "keyword"]);
				at += gap1.length;
				out.push([at, (at += target.length), "string"]);
				if (version) {
					at += gap2.length;
					out.push([at, at + version.length, "meta"]);
				}
			} else if ((m = STATUS_LINE.exec(line))) {
				const [, version, gap, status] = m;
				out.push([pos, pos + version.length, "meta"]);
				const at = pos + version.length + gap.length;
				out.push([at, at + status.length, "number"]);
			} else if ((m = HEADER.exec(line))) {
				const [, name, colon, gap, value] = m;
				let at = pos;
				out.push([at, (at += name.length), "property"]);
				out.push([at, (at += colon.length), "punctuation"]);
				at += gap.length;
				if (value)
					out.push([at, at + value.length, /^\d+$/.test(value) ? "number" : "string"]);
			}
		}

		if (nl < 0) break;
		pos = nl + 1;
	}

	return out;
}
