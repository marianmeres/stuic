export {
	default as CodeBlock,
	type Props as CodeBlockProps,
	type CodeBlockSample,
} from "./CodeBlock.svelte";

export {
	highlightCode,
	highlightJson,
	highlightHttp,
	highlightShell,
	HIGHLIGHT_CODE_LANGS,
	type CodeBlockHighlighter,
	type CodeBlockToken,
	type CodeBlockTokenType,
} from "./highlight/index.js";

export {
	createCodeBlockT,
	CODE_BLOCK_MESSAGES_EN,
	type CodeBlockMessageKey,
	type CodeBlockMessages,
} from "./i18n.js";

export { CODE_BLOCK_MESSAGES_SK } from "./i18n-sk.js";
