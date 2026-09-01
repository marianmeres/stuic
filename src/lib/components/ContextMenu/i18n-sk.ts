import type { ContextMenuMessages } from "./i18n.js";

/**
 * Slovak message catalog for `ContextMenu`. Opt-in — English stays the built-in
 * default, and this module is only pulled into a bundle when it is actually imported
 * (the component itself never references it).
 *
 * @example
 * ```svelte
 * <script>
 *   import { ContextMenu, createContextMenuT, CONTEXT_MENU_MESSAGES_SK } from "@marianmeres/stuic";
 *   const t = createContextMenuT(CONTEXT_MENU_MESSAGES_SK);
 * </script>
 *
 * <ContextMenu {items} {t}>...</ContextMenu>
 * ```
 */
export const CONTEXT_MENU_MESSAGES_SK: ContextMenuMessages = {
	context_menu: "Kontextové menu",
};
