import type { TranslateFn } from "../../types.js";
import { COPY_BUTTON_MESSAGES_EN, createCopyButtonT } from "../CopyButton/i18n.js";

/**
 * The built-in (English) message catalog of `CodeBlock`. It includes the `CopyButton`
 * keys, so the one `t` a block is given also localizes its copy button. Also the fallback
 * of every other bundled locale, so a locale missing a key still renders text.
 */
export const CODE_BLOCK_MESSAGES_EN = {
	...COPY_BUTTON_MESSAGES_EN,
	/** The collapse toggle while collapsed; `{count}` is the sample's line count */
	show_all_lines: "Show all {count} lines",
	/** The collapse toggle while expanded */
	show_less: "Show less",
};

/** Every message key `CodeBlock` may look up. */
export type CodeBlockMessageKey = keyof typeof CODE_BLOCK_MESSAGES_EN;

/** A (possibly partial) catalog for one locale. */
export type CodeBlockMessages = Record<CodeBlockMessageKey, string>;

/**
 * Builds the `t` prop of `CodeBlock` from a message catalog. Unknown or untranslated keys
 * fall back to `fallbackMessages` (English by default); `{name}` placeholders are
 * replaced from the values.
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
export function createCodeBlockT(
	messages: Partial<CodeBlockMessages> | Record<string, string>,
	fallbackMessages:
		Partial<CodeBlockMessages> | Record<string, string> = CODE_BLOCK_MESSAGES_EN
): TranslateFn {
	// same lookup + `{placeholder}` semantics as CopyButton's
	return createCopyButtonT(messages, fallbackMessages);
}

/** The component's built-in English `t`. */
export const t_default: TranslateFn = createCodeBlockT(CODE_BLOCK_MESSAGES_EN);
