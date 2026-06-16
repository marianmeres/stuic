export { default as Float, type Props as FloatProps } from "./Float.svelte";
export {
	type FloatPlacement,
	type FloatPoint,
	type FloatSize,
	FLOAT_PLACEMENTS,
	resolvePlacement,
	clampToViewport,
	normalizeOffset,
} from "./float-utils.js";
