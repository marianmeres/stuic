import {
	iconAlertInfo,
	iconAlertSuccess,
	iconAlertWarning,
	iconAlertError,
	iconRefresh,
} from "$lib/icons/index.js";

const size = 23;

export const acpDefaultIcons = {
	info: () => iconAlertInfo({ size }),
	success: () => iconAlertSuccess({ size }),
	warn: () => iconAlertWarning({ size, class: "-mt-[2px]" }), // move up a little because it looks better with the triangle
	error: () => iconAlertError({ size }),
	spinner: () => iconRefresh({ size: 32, class: "opacity-50" }),
};
