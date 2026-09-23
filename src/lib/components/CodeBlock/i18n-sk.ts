import type { CodeBlockMessages } from "./i18n.js";
import { COPY_BUTTON_MESSAGES_SK } from "../CopyButton/i18n-sk.js";

/**
 * Slovak message catalog for `CodeBlock` (its copy button included). Opt-in — English
 * stays the built-in default, and this module is only pulled into a bundle when it is
 * actually imported.
 *
 * @example
 * ```svelte
 * <script>
 *   import { CodeBlock, createCodeBlockT, CODE_BLOCK_MESSAGES_SK } from "@marianmeres/stuic";
 *   const t = createCodeBlockT(CODE_BLOCK_MESSAGES_SK);
 * </script>
 *
 * <CodeBlock lang="bash" code={sample} {t} />
 * ```
 */
export const CODE_BLOCK_MESSAGES_SK: CodeBlockMessages = {
	...COPY_BUTTON_MESSAGES_SK,
	// "všetky riadky" reads right for any count; the number stays out of the plural
	show_all_lines: "Zobraziť všetky riadky ({count})",
	show_less: "Zobraziť menej",
};
