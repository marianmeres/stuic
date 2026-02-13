/**
 * @packageDocumentation
 *
 * Stuic - Svelte Tailwind UI Components
 *
 * An opinionated Svelte 5 component library built with TailwindCSS v4.
 *
 * @remarks
 * This package provides a collection of accessible, customizable UI components,
 * utility functions, and Svelte actions for building modern web applications.
 *
 * @example
 * ```ts
 * // Import components
 * import { Button, Modal, Notifications } from '@marianmeres/stuic';
 *
 * // Import utilities
 * import { twMerge, debounce, localStorageState } from '@marianmeres/stuic';
 *
 * // Import actions
 * import { focusTrap, validate, autogrow } from '@marianmeres/stuic';
 * ```
 */

// components
export * from "./components/AlertConfirmPrompt/index.js";
export * from "./components/AnimatedElipsis/index.js";
export * from "./components/AppShell/index.js";
export * from "./components/AssetsPreview/index.js";
export * from "./components/Avatar/index.js";
export * from "./components/Backdrop/index.js";
export * from "./components/Book/index.js";
export * from "./components/Button/index.js";
export * from "./components/ButtonGroupRadio/index.js";
export * from "./components/Cart/index.js";
export * from "./components/Carousel/index.js";
export * from "./components/Checkout/index.js";
export * from "./components/Collapsible/index.js";
export * from "./components/ColorScheme/index.js";
export * from "./components/CommandMenu/index.js";
export * from "./components/DataTable/index.js";
export * from "./components/DismissibleMessage/index.js";
export * from "./components/Drawer/index.js";
export * from "./components/DropdownMenu/index.js";
export * from "./components/HoverExpandableWidth/index.js";
export * from "./components/IconSwap/index.js";
export * from "./components/Input/index.js";
export * from "./components/KbdShortcut/index.js";
export * from "./components/ListItemButton/index.js";
export * from "./components/Modal/index.js";
export * from "./components/ModalDialog/index.js";
export * from "./components/Nav/index.js";
export * from "./components/Notifications/index.js";
export * from "./components/Progress/index.js";
export * from "./components/Skeleton/index.js";
export * from "./components/SlidingPanels/index.js";
export * from "./components/Spinner/index.js";
export * from "./components/Switch/index.js";
export * from "./components/TabbedMenu/index.js";
export * from "./components/Thc/index.js";
export * from "./components/ThemePreview/index.js";
export * from "./components/TwCheck/index.js";
export * from "./components/TypeaheadInput/index.js";
export * from "./components/WithSidePanel/index.js";
export * from "./components/X/index.js";

// utils
export * from "./utils/index.js";

// actions
export * from "./actions/index.js";

// icons
export * from "./icons/index.js";
