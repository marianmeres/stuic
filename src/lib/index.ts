// Reexport your entry components here

//
export {
	default as AlertConfirmPrompt,
	AlertConfirmPromptConfig,
} from './components/AlertConfirmPrompt/AlertConfirmPrompt.svelte';
export {
	createAlertConfirmPromptStore,
	createAlert,
	createConfirm,
	createPrompt,
	AlertConfirmPromptType,
	type AlertConfirmPromptVariant,
	type AlertConfirmPromptOptions,
	type AlertConfirmPromptKnownClasses,
} from './components/AlertConfirmPrompt/alert-confirm-prompt.js';

//
export {
	default as AppShell,
	appShellSetHtmlBodyHeight,
} from './components/AppShell/AppShell.svelte';

//
export {
	default as Backdrop,
	BackdropConfig,
} from './components/Backdrop/Backdrop.svelte';

//
export { default as Button, ButtonConfig } from './components/Button/Button.svelte';

//
export { default as SystemAwareColorScheme } from './components/ColorScheme/SystemAwareColorScheme.svelte';
export { default as LocalColorScheme } from './components/ColorScheme/LocalColorScheme.svelte';
export { ColorScheme } from './components/ColorScheme/color-scheme.js';

//
export {
	default as DismissibleMessage,
	DismissibleMessageConfig,
} from './components/DismissibleMessage/DismissibleMessage.svelte';

//
export { default as Drawer, createDrawerStore } from './components/Drawer/Drawer.svelte';

//
export { default as HoverExpandableWidth } from './components/HoverExpandableWidth/HoverExpandableWidth.svelte';

//
export {
	default as Field,
	FieldConfig,
	type FieldConfigClasses,
} from './components/Input/Field.svelte';
export {
	default as FieldCheckbox,
	FieldCheckboxConfig,
	type FieldCheckboxConfigClasses,
	type FieldCheckboxConfigClassesBySize,
} from './components/Input/FieldCheckbox.svelte';
export {
	default as FieldRadios,
	FieldRadiosConfig,
	type FieldRadiosConfigClasses,
	type FieldRadiosConfigClassesBySize,
} from './components/Input/FieldRadios.svelte';
export {
	default as FieldSelect,
	FieldSelectConfig,
	type FieldSelectConfigClasses,
	type FieldSelectConfigClassesBySize,
} from './components/Input/FieldSelect.svelte';
export {
	default as Fieldset,
	FieldsetConfig,
	type FieldsetConfigClasses,
} from './components/Input/Fieldset.svelte';

export {
	default as ModalDialog,
	type ModalDialogAPI,
} from './components/ModalDialog/ModalDialog.svelte';

//
export {
	createNotificationsStore,
	NOTIFICATION_EVENT,
	type NotiticationsCreateStoreOptions,
	type NotificationCreateParam,
	type Notification,
	type NotificationInput,
	type NotificationType,
	type NotificationOnEventHandler,
	type NotificationsSortOrder,
	type NotificationKnownClasses,
} from './components/Notifications/notifications.js';
export {
	default as Notifications,
	NotificationsConfig,
	type NOTIFICATIONS_POSX,
	type NOTIFICATIONS_POSY,
} from './components/Notifications/Notifications.svelte';

//
export { default as Popover } from './components/Popover/Popover.svelte';

//
export {
	default as Switch,
	SwitchConfig,
	type SwitchPreHook,
} from './components/Switch/Switch.svelte';
export { default as Thc, type THC, isTHCNotEmpty } from './components/Thc/Thc.svelte';

//
export { default as X } from './components/X/X.svelte';

// actions
export { autogrow } from './actions/autogrow.js';
export { autoscroll } from './actions/autoscroll.js';
export {
	draggable,
	droppable,
	type DraggableOptions,
	type DroppableOptions,
} from './actions/drag-drop.js';
export { focusTrap, type FocusTrapOptions } from './actions/focus-trap.js';
export { onOutside } from './actions/on-outside.js';
export { preSubmitValidityCheck } from './actions/pre-submit-validity-check.js';
export {
	tooltip,
	TooltipConfig,
	type TooltipOptions,
} from './actions/tooltip/tooltip.js';
export { trim } from './actions/trim.js';
export {
	validate,
	type ValidateOptions,
	type ValidationResult,
} from './actions/validate.js';

// utils
export { calculateAlignment } from './utils/calculate-alignment.js';
export { DevicePointer } from './utils/device-pointer.js';
export { getId } from './utils/get-id.js';
export { windowSize, breakpoint } from './utils/window-size.js';
export type { TW_COLORS } from './utils/tw-types.js';
