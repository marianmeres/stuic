export {
	default as Gantt,
	type Props as GanttProps,
	type GanttRow,
	type GanttBar,
	type GanttBarLabels,
	type GanttSelectDetail,
} from "./Gantt.svelte";

export {
	buildGanttAxis,
	placeRange,
	placePoint,
	dayToFraction,
	boundsOf,
	isoWeekNumber,
	GANTT_MAX_COLUMNS,
	type GanttAxis,
	type GanttAxisOptions,
	type GanttColumn,
	type GanttGroup,
	type GanttPlacement,
	type GanttDateInput,
	type GanttUnit,
} from "./gantt-geometry.js";
