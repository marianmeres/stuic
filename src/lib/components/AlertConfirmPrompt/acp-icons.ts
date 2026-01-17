import {
	iconAlertInfo,
	iconAlertSuccess,
	iconAlertWarning,
	iconAlertError,
	iconRefresh,
} from "$lib/icons/index.js";

export const acpDefaultIcons = {
	info: () => iconAlertInfo({ size: 24 }),
	success: () => iconAlertSuccess({}),
	warn: () => iconAlertWarning({ class: "-mt-[3px]" }), // move up a little because it looks better with the triangle
	error: () => iconAlertError({}),
	spinner: () => iconRefresh({ size: 32, class: "opacity-50" }),
};
