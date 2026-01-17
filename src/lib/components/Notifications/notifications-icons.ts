import {
	iconAlertWarning,
	iconAlertSuccess,
	iconAlertInfo,
	iconAlertError,
} from "$lib/icons/index.js";
import type { NotificationType } from "./notifications-stack.svelte.js";

export const notificationsDefaultIcons: Record<NotificationType, () => string> = {
	info: () => iconAlertInfo({}),
	success: () => iconAlertSuccess({}),
	warn: () => iconAlertWarning({}),
	error: () => iconAlertError({}),
};
