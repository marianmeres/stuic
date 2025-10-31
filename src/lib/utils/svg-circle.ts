export interface SvgCircleOptions {
	radius: number;
	strokeWidth: number;
	completeness: number; // 0 to 1, --> 1 is a full circle
	class: string; // css classes
	bgStrokeColor: string; // css classes
	roundedEdges: boolean;
	rotate: number;
	strokeWidthRatio: number;
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

/** Will construct and return svg circle DOM element based on input options */
export function svgCircle(options: Partial<SvgCircleOptions> = {}) {
	let {
		strokeWidth = 10,
		completeness = 1,
		bgStrokeColor = "",
		class: classProp = "",
		roundedEdges = true,
		rotate = 0,
		strokeWidthRatio = 0,
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
