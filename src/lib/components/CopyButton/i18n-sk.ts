import type { CopyButtonMessages } from "./i18n.js";

/**
 * Slovak message catalog for `CopyButton`. Opt-in — English stays the built-in
 * default, and this module is only pulled into a bundle when it is actually imported
 * (the component itself never references it).
 *
 * @example
 * ```svelte
 * <script>
 *   import { CopyButton, createCopyButtonT, COPY_BUTTON_MESSAGES_SK } from "@marianmeres/stuic";
 *   const t = createCopyButtonT(COPY_BUTTON_MESSAGES_SK);
 * </script>
 *
 * <CopyButton text={url} {t} />
 * ```
 */
export const COPY_BUTTON_MESSAGES_SK: CopyButtonMessages = {
	copy: "Kopírovať",
	copied: "Skopírované",
	copy_failed: "Kopírovanie zlyhalo",
};
