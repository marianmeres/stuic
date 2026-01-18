import {
	iconAlertWarning,
	iconAlertSuccess,
	iconAlertInfo,
	iconAlertError,
} from "$lib/icons/index.js";
import type { NotificationType } from "./notifications-stack.svelte.js";

export const notificationsDefaultIcons: Record<NotificationType, () => string> = {
	info: () => iconAlertInfo({ size: 29 }),
	success: () => iconAlertSuccess({ size: 29 }),
	warn: () => iconAlertWarning({ size: 29 }),
	error: () => iconAlertError({ size: 29 }),
};
