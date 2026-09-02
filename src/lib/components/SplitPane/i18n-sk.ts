import type { SplitPaneMessages } from "./i18n.js";

/**
 * Slovak message catalog for `SplitPane`. Opt-in — English stays the built-in
 * default, and this module is only pulled into a bundle when it is actually
 * imported (the component itself never references it).
 *
 * @example
 * ```svelte
 * <script>
 *   import { SplitPane, createSplitPaneT, SPLIT_PANE_MESSAGES_SK } from "@marianmeres/stuic";
 *   const t = createSplitPaneT(SPLIT_PANE_MESSAGES_SK);
 * </script>
 *
 * <SplitPane {t}>…</SplitPane>
 * ```
 */
export const SPLIT_PANE_MESSAGES_SK: SplitPaneMessages = {
	resize: "Zmeniť veľkosť",
};
