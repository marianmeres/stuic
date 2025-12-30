/**
 * Configuration options for creating an SVG circle element.
 */
export interface SvgCircleOptions {
	/** Radius of the circle (currently unused, calculated from viewBox) */
	radius: number;
	/** Width of the stroke in viewBox units (default: 10) */
	strokeWidth: number;
	/** Completion percentage from 0 to 1, where 1 is a full circle */
	completeness: number;
	/** CSS classes to apply to the SVG element */
	class: string;
	/** CSS color for an optional background circle stroke */
	bgStrokeColor: string;
	/** Whether to use rounded line caps (default: true) */
	roundedEdges: boolean;
	/** Rotation angle in degrees (default: 0) */
	rotate: number;
	/** Maximum stroke width as a ratio of radius (0 = no limit) */
	strokeWidthRatio: number;
	/** Inline CSS styles to apply to the circle element */
	circleStyle: string;
}

function _normalize_completness(v: number) {
	return Math.max(0, Math.min(1, v));
}

function _normalize_rotate(v: number) {
	return v % 360;
}

function _normalize_cls(v: string) {
	return [
		...new Set(
			v
				.split(" ")
				.map((v) => v.trim())
				.filter(Boolean)
		),
	];
}

/**
 * Creates an SVG circle element suitable for progress indicators or decorative rings.
 *
 * The circle uses a 100x100 viewBox and scales to fit its container.
 * Supports partial completion (for progress indicators), rotation, and optional
 * background circle.
 *
 * @param options - Configuration options for the circle
 * @returns Object containing the SVG element and methods to update it
 *
 * @example
 * ```ts
 * // Create a 75% complete progress ring
 * const { svg, setCompleteness } = svgCircle({
 *   completeness: 0.75,
 *   strokeWidth: 8,
 *   bgStrokeColor: "#e5e5e5"
 * });
 * document.body.appendChild(svg);
 *
 * // Update progress later
 * setCompleteness(0.9);
 * ```
 *
 * @example
 * ```ts
 * // Create a spinning indicator
 * const { svg, setRotate } = svgCircle({
 *   completeness: 0.25,
 *   rotate: -90
 * });
 * ```
 */
export function svgCircle(options: Partial<SvgCircleOptions> = {}) {
	let {
		strokeWidth = 10,
		completeness = 1,
		bgStrokeColor = "",
		class: classProp = "",
		roundedEdges = true,
		rotate = 0,
		strokeWidthRatio = 0,
		circleStyle,
	} = options ?? {};

	completeness = _normalize_completness(completeness);

	// calculate radius based on viewBox, leaving room for stroke
	let actualStrokeWidth = strokeWidth;
	if (strokeWidthRatio) {
		const maxStrokeWidth = strokeWidthRatio * 50; // percentage of radius
		actualStrokeWidth = Math.min(strokeWidth, maxStrokeWidth);
	}
	const radius = 50 - actualStrokeWidth / 2;

	const center = 50;
	const circumference = 2 * Math.PI * radius;
	const dashArray = circumference;
	const dashOffset = circumference * (1 - completeness);
	const linecap = roundedEdges ? "round" : "butt";

	// the svg element
	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute("width", "100%");
	svg.setAttribute("height", "100%");
	svg.setAttribute("viewBox", "0 0 100 100");
	svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
	if (classProp) svg.classList.add(..._normalize_cls(classProp));

	// optional background
	if (bgStrokeColor) {
		const bgCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		bgCircle.setAttribute("cx", `${center}`);
		bgCircle.setAttribute("cy", `${center}`);
		bgCircle.setAttribute("r", `${radius}`);
		bgCircle.setAttribute("fill", "none");
		bgCircle.setAttribute("stroke", bgStrokeColor);
		bgCircle.setAttribute("stroke-width", `${actualStrokeWidth}`);
		svg.appendChild(bgCircle);
	}

	// the circle
	const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
	circle.setAttribute("cx", `${center}`);
	circle.setAttribute("cy", `${center}`);
	circle.setAttribute("r", `${radius}`);
	circle.setAttribute("fill", "none");
	circle.setAttribute("stroke", "currentColor");
	circle.setAttribute("stroke-width", `${actualStrokeWidth}`);
	circle.setAttribute("stroke-dasharray", `${dashArray}`);
	circle.setAttribute("stroke-dashoffset", `${dashOffset}`);
	circle.setAttribute("stroke-linecap", linecap);
	circle.setAttribute("transform-origin", "center");
	circle.setAttribute("transform", `rotate(${_normalize_rotate(rotate)})`);
	if (circleStyle) circle.style.cssText += circleStyle;

	//
	svg.appendChild(circle);

	return {
		svg,
		setCompleteness(completeness: number) {
			completeness = _normalize_completness(completeness);
			const dashOffset = circumference * (1 - completeness);
			circle.setAttribute("stroke-dashoffset", `${dashOffset}`);
		},
		setRotate(rotate: number) {
			circle.setAttribute("transform", `rotate(${_normalize_rotate(rotate)})`);
		},
	};
}
