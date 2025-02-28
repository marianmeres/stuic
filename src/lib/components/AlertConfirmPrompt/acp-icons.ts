import { iconFeatherAlertTriangle } from "@marianmeres/icons-fns/feather/iconFeatherAlertTriangle.js";
import { iconFeatherCheckCircle } from "@marianmeres/icons-fns/feather/iconFeatherCheckCircle.js";
import { iconFeatherInfo } from "@marianmeres/icons-fns/feather/iconFeatherInfo.js";
import { iconFeatherRefreshCw } from "@marianmeres/icons-fns/feather/iconFeatherRefreshCw.js";
import { iconFeatherXOctagon } from "@marianmeres/icons-fns/feather/iconFeatherXOctagon.js";

export const acpDefaultIcons = {
	info: () => iconFeatherInfo({ size: 24 }),
	success: () => iconFeatherCheckCircle({}),
	warn: () => iconFeatherAlertTriangle({ class: "-mt-[3px]" }), // move up a little because it looks better with the triangle
	error: () => iconFeatherXOctagon({}),
	spinner: () => iconFeatherRefreshCw({ size: 32, class: "opacity-50" }),
};
