import { iconFeatherAlertTriangle } from "@marianmeres/icons-fns/feather/iconFeatherAlertTriangle.js";
import { iconFeatherCheckCircle } from "@marianmeres/icons-fns/feather/iconFeatherCheckCircle.js";
import { iconFeatherInfo } from "@marianmeres/icons-fns/feather/iconFeatherInfo.js";
import { iconFeatherXOctagon } from "@marianmeres/icons-fns/feather/iconFeatherXOctagon.js";
import type { NotificationType } from "./notifications-stack.svelte.js";

export const notificationsDefaultIcons: Record<NotificationType, () => string> = {
	info: () => iconFeatherInfo({}),
	success: () => iconFeatherCheckCircle({}),
	warn: () => iconFeatherAlertTriangle({}),
	error: () => iconFeatherXOctagon({}),
};
