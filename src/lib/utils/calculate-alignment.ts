export interface AreaLike {
	width: number;
	height: number;
}

export interface PositionLike {
	x: number;
	y: number;
}

export interface RectLike extends AreaLike, PositionLike {}

// "anchor alignment" relative perspective
export type Alignment =
	| 'top'
	| 'topRight'
	| 'topLeft'
	| 'right'
	| 'rightTop'
	| 'rightBottom'
	| 'bottom'
	| 'bottomRight'
	| 'bottomLeft'
	| 'left'
	| 'leftTop'
	| 'leftBottom';

const clog = console.log;

// just basic plus/minus stuff
export const calculateAlignment = (
	boundaryRoot: RectLike,
	// anchor box
	anchor: RectLike,
	//  element to be placed (the one we're calculating position for)
	el: AreaLike,
	// in px
	offset: number = 5
) => {
	const anchorHalfWidth = anchor.width / 2;
	const anchorHalfHeight = anchor.height / 2;

	// x/y of the origin (center of the anchor with applied offset) position
	const originTop = { x: anchor.x + anchorHalfWidth, y: anchor.y - offset };
	const originBottom = {
		x: anchor.x + anchorHalfWidth,
		y: anchor.y + anchor.height + offset,
	};
	const originLeft = { x: anchor.x - offset, y: anchor.y + anchorHalfHeight };
	const originRight = {
		x: anchor.x + anchor.width + offset,
		y: anchor.y + anchorHalfHeight,
	};

	const origin = {
		top: originTop,
		topRight: originTop,
		topLeft: originTop,
		//
		bottom: originBottom,
		bottomRight: originBottom,
		bottomLeft: originBottom,
		//
		left: originLeft,
		leftTop: originLeft,
		leftBottom: originLeft,
		//
		right: originRight,
		rightTop: originRight,
		rightBottom: originRight,
	};

	const elHalfWidth = el.width / 2;
	const elHalfHeigh = el.height / 2;

	// position is named from the "anchor alignment" relative perspective
	const position: Record<
		Alignment,
		PositionLike & { safeY: boolean; safeX: boolean; safe: boolean }
	> = {
		//
		top: {
			x: origin.top.x - elHalfWidth,
			y: origin.top.y - el.height,
			safeX: true,
			safeY: true,
			safe: true,
		},
		topRight: {
			x: origin.top.x + anchorHalfWidth - el.width,
			y: origin.top.y - el.height,
			safeX: true,
			safeY: true,
			safe: true,
		},
		topLeft: {
			x: origin.top.x - anchorHalfWidth,
			y: origin.top.y - el.height,
			safeX: true,
			safeY: true,
			safe: true,
		},
		right: {
			x: origin.right.x,
			y: origin.right.y - elHalfHeigh,
			safeX: true,
			safeY: true,
			safe: true,
		},
		rightTop: {
			x: origin.right.x,
			y: origin.right.y - anchorHalfHeight,
			safeX: true,
			safeY: true,
			safe: true,
		},
		rightBottom: {
			x: origin.right.x,
			y: origin.right.y + anchorHalfHeight - el.height,
			safeX: true,
			safeY: true,
			safe: true,
		},
		//
		bottom: {
			x: origin.bottom.x - elHalfWidth,
			y: origin.bottom.y,
			safeX: true,
			safeY: true,
			safe: true,
		},
		bottomLeft: {
			x: origin.bottom.x - anchorHalfWidth,
			y: origin.bottom.y,
			safeX: true,
			safeY: true,
			safe: true,
		},
		bottomRight: {
			x: origin.bottom.x + anchorHalfWidth - el.width,
			y: origin.bottom.y,
			safeX: true,
			safeY: true,
			safe: true,
		},
		//
		left: {
			x: origin.left.x - el.width,
			y: origin.left.y - elHalfHeigh,
			safeX: true,
			safeY: true,
			safe: true,
		},
		leftTop: {
			x: origin.left.x - el.width,
			y: origin.left.y - anchorHalfHeight,
			safeX: true,
			safeY: true,
			safe: true,
		},
		leftBottom: {
			x: origin.left.x - el.width,
			y: origin.left.y + anchorHalfHeight - el.height,
			safeX: true,
			safeY: true,
			safe: true,
		},
	};

	const isSafeX = (x: number) =>
		x >= boundaryRoot.x && x + el.width <= boundaryRoot.x + boundaryRoot.width;

	const isSafeY = (y: number) =>
		y >= boundaryRoot.y && y + el.height <= boundaryRoot.y + boundaryRoot.height;

	//
	Object.entries(position).forEach((entry) => {
		const [plc, { x, y }] = entry as [Alignment, PositionLike];
		position[plc].safeX = isSafeX(x);
		position[plc].safeY = isSafeY(y);
		position[plc].safe = position[plc].safeX && position[plc].safeY;
	});

	// now, the positions were calculated, but so far, we're too strict, so there will
	// be unnecessary false negatives, which can be relaxed using "fluid" approach

	// must come below safety check above
	const fluid: Record<string, any> = {
		x: {
			top: Math.max(0, position.top.x),
			topLeft: position.topLeft.x - (position.topLeft.x + el.width - boundaryRoot.width),
			topRight: Math.max(0, position.topRight.x),
			//
			bottom: Math.max(0, position.bottom.x),
			bottomLeft:
				position.bottomLeft.x - (position.bottomLeft.x + el.width - boundaryRoot.width),
			bottomRight: Math.max(0, position.bottomRight.x),
		},
		y: {
			// right: position.top.y - (position.top.y + el.height - boundaryRoot.height),
			right: Math.max(0, position.right.y),
			rightTop: Math.max(0, position.rightTop.y),
			rightBottom: Math.max(0, position.rightBottom.y),
		},
	};

	// x axis
	if (el.width < boundaryRoot.width && anchor.x > 0) {
		(
			['top', 'topLeft', 'topRight', 'bottom', 'bottomLeft', 'bottomRight'] as Alignment[]
		).forEach((k) => {
			if (!position[k].safeX && fluid.x?.[k] !== undefined) {
				position[k].x = fluid.x[k];
				position[k].safeX = isSafeX(position[k].x);
				position[k].safe = position[k].safeX && position[k].safeY;
			}
		});
	}

	// y
	if (el.height < boundaryRoot.height && anchor.y > 0) {
		(
			['right', 'rightTop', 'rightBottom', 'left', 'leftTop', 'leftBottom'] as Alignment[]
		).forEach((k) => {
			if (!position[k].safeY && fluid.y?.[k] !== undefined) {
				position[k].y = fluid.y[k];
				position[k].safeY = isSafeY(position[k].y);
				position[k].safe = position[k].safeX && position[k].safeY;
			}
		});
	}

	// todo y fluids

	return { origin, position };
};
