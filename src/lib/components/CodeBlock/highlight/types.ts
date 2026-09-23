/**
 * The token types the built-in highlighters emit, and the ones `CodeBlock`'s stylesheet
 * colors (all but `punctuation`, which is emitted but left in the text color).
 */
export type CodeBlockTokenType =
	| "comment"
	| "string"
	| "number"
	| "literal"
	| "keyword"
	| "property"
	| "variable"
	| "function"
	| "parameter"
	| "operator"
	| "punctuation"
	| "meta";

/**
 * One highlighted span: `[start, end)` offsets into the code as displayed (after
 * normalization), and its type. A custom type is allowed — it is painted by
 * `::highlight(stuic-code-block-<type>)`, which the consumer styles.
 */
export type CodeBlockToken = [
	start: number,
	end: number,
	type: CodeBlockTokenType | (string & {}),
];

/** Turns a sample into tokens. `lang` is whatever the block was given. */
export type CodeBlockHighlighter = (code: string, lang?: string) => CodeBlockToken[];
