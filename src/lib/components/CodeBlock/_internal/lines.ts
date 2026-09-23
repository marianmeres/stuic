/**
 * Splits the displayed text into lines that each KEEP their trailing `\n`, so the lines
 * concatenate back to the exact text (the DOM's text content, a copied selection and the
 * highlight offsets all stay the text itself). A final `\n` does not start an extra,
 * empty line — just as it renders no extra line in a plain `<pre>`.
 */
export function splitLines(text: string): string[] {
	return text.match(/[^\n]*\n|[^\n]+$/g) ?? [];
}

/**
 * Parses a set of 1-based line positions: an array of numbers, or a string like
 * `"1, 3-5"`. Invalid or out-of-range parts (< 1, > `max`) are dropped; a reversed range
 * (`"5-3"`) is read as `"3-5"`. `max` also bounds the work a huge range can cause.
 */
export function parseLineSet(
	spec: number[] | string | undefined | null,
	max = 100_000
): Set<number> {
	const out = new Set<number>();
	const add = (n: number) => {
		if (Number.isInteger(n) && n >= 1 && n <= max) out.add(n);
	};
	if (Array.isArray(spec)) {
		spec.forEach(add);
	} else if (typeof spec === "string") {
		for (const part of spec.split(",")) {
			const m = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
			if (!m) continue;
			const a = Number(m[1]);
			const b = m[2] === undefined ? a : Number(m[2]);
			const [from, to] = a <= b ? [a, b] : [b, a];
			for (let k = from; k <= Math.min(to, max); k++) add(k);
		}
	}
	return out;
}
