import type { CodeBlockHighlighter, CodeBlockToken } from "./types.js";
import { highlightJson } from "./json.js";
import { highlightHttp } from "./http.js";
import { highlightShell } from "./shell.js";

export type {
	CodeBlockHighlighter,
	CodeBlockToken,
	CodeBlockTokenType,
} from "./types.js";
export { highlightJson, highlightHttp, highlightShell };

const BY_LANG: Record<string, (code: string) => CodeBlockToken[]> = {
	json: highlightJson,
	jsonc: highlightJson,
	json5: highlightJson,
	http: highlightHttp,
	bash: highlightShell,
	sh: highlightShell,
	shell: highlightShell,
	zsh: highlightShell,
	console: highlightShell,
	terminal: highlightShell,
	"shell-session": highlightShell,
	shellsession: highlightShell,
};

/** The `lang`s `highlightCode` knows (lower case). */
export const HIGHLIGHT_CODE_LANGS: readonly string[] = Object.keys(BY_LANG);

/**
 * `CodeBlock`'s built-in highlighter: JSON, HTTP and shell, picked by `lang` (case
 * insensitive — see `HIGHLIGHT_CODE_LANGS`). Any other `lang` gets no tokens. Compose it
 * to add a language: `(code, lang) => lang === "ts" ? myTs(code) : highlightCode(code, lang)`.
 */
export const highlightCode: CodeBlockHighlighter = (code, lang) => {
	const fn = lang ? BY_LANG[lang.trim().toLowerCase()] : undefined;
	return fn ? fn(code) : [];
};
