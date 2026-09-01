<script lang="ts" module>
	import type { HTMLOlAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";
	import type { THC } from "../Thc/Thc.svelte";
	import type { IntentColorKey } from "../../utils/design-tokens.js";

	/** Which side of the rail the content sits on */
	export type TimelineAlign = "start" | "alternate";

	/** Where the time label renders */
	export type TimelineTimePosition = "inline" | "opposite";

	/** What the marker renders as (`data-marker` on the marker element) */
	export type TimelineMarkerKind = "dot" | "icon" | "custom";

	export interface TimelineItem {
		/** Primary line (the event) */
		title?: THC;
		/** Secondary text under the title */
		description?: THC;
		/**
		 * Time label, preformatted ("2 hours ago", "Sep 1, 14:32"). When omitted and
		 * `datetime` is set, the component's `formatTime` (if any) produces it.
		 */
		time?: THC;
		/**
		 * Machine-readable timestamp — renders the label as `<time datetime="…">`
		 * (a `Date` is serialized to ISO 8601). Never displayed on its own.
		 */
		datetime?: string | Date;
		/**
		 * Marker content (typically `{ html: iconCheck() }`). Its presence switches the
		 * marker from the small dot to the icon bubble.
		 */
		icon?: THC;
		/** Semantic marker color (dot fill, or the bubble's soft tint) */
		intent?: IntentColorKey;
		/** When set, the title renders as a link */
		href?: string;
	}

	export interface TimelineSnippetArg {
		item: TimelineItem;
		index: number;
	}

	export interface Props extends Omit<HTMLOlAttributes, "children"> {
		/** The events, in the order they should appear (sort them yourself) */
		items: TimelineItem[];
		/**
		 * `"start"` (default): rail on the start side, content after it.
		 * `"alternate"`: centered rail, content alternating sides (history pages).
		 */
		align?: TimelineAlign;
		/**
		 * `"inline"` (default): the time label above the title, inside the content.
		 * `"opposite"`: its own column on the other side of the rail (audit-log look).
		 */
		timePosition?: TimelineTimePosition;
		/**
		 * Fallback formatter for items that have `datetime` but no `time`. Return
		 * value is THC, so a plain string is fine.
		 */
		formatTime?: (datetime: string | Date, item: TimelineItem) => THC;
		/** Override the marker content entirely (avatars, badges…) */
		renderMarker?: Snippet<[TimelineSnippetArg]>;
		/** Override the whole content cell (time, title, description, footer) */
		renderItem?: Snippet<[TimelineSnippetArg]>;
		/** Per-item footer area below the description (actions, attachments…) */
		renderFooter?: Snippet<[TimelineSnippetArg]>;
		/** Skip all default styling */
		unstyled?: boolean;
		/** Additional CSS classes */
		class?: string;
		/** Class for every item (`li`) */
		classItem?: string;
		/** Class for the marker */
		classMarker?: string;
		/** Class for the content cell */
		classContent?: string;
		/** Class for the time label (inline or opposite) */
		classTime?: string;
		/** Class for the title */
		classTitle?: string;
		/** Class for the description */
		classDescription?: string;
		/** Class for the footer area */
		classFooter?: string;
		/** Bindable element reference */
		el?: HTMLOListElement;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import Thc from "../Thc/Thc.svelte";

	let {
		items,
		align = "start",
		timePosition = "inline",
		formatTime,
		renderMarker,
		renderItem,
		renderFooter,
		unstyled = false,
		class: classProp,
		classItem: classItemProp,
		classMarker: classMarkerProp,
		classContent: classContentProp,
		classTime: classTimeProp,
		classTitle: classTitleProp,
		classDescription: classDescriptionProp,
		classFooter: classFooterProp,
		el = $bindable(),
		...rest
	}: Props = $props();

	let _class = $derived(unstyled ? classProp : twMerge("stuic-timeline", classProp));
	let _classItem = $derived(
		unstyled ? classItemProp : twMerge("stuic-timeline-item", classItemProp)
	);
	let _classMarker = $derived(
		unstyled ? classMarkerProp : twMerge("stuic-timeline-marker", classMarkerProp)
	);
	let _classContent = $derived(
		unstyled ? classContentProp : twMerge("stuic-timeline-content", classContentProp)
	);
	let _classTime = $derived(
		unstyled ? classTimeProp : twMerge("stuic-timeline-time", classTimeProp)
	);
	let _classTitle = $derived(
		unstyled ? classTitleProp : twMerge("stuic-timeline-title", classTitleProp)
	);
	let _classDescription = $derived(
		unstyled
			? classDescriptionProp
			: twMerge("stuic-timeline-description", classDescriptionProp)
	);
	let _classFooter = $derived(
		unstyled ? classFooterProp : twMerge("stuic-timeline-footer", classFooterProp)
	);

	function markerKind(item: TimelineItem): TimelineMarkerKind {
		if (renderMarker) return "custom";
		if (item.icon) return "icon";
		return "dot";
	}

	function timeLabel(item: TimelineItem): THC | undefined {
		if (item.time !== undefined && item.time !== null && item.time !== "")
			return item.time;
		if (item.datetime !== undefined && formatTime) return formatTime(item.datetime, item);
		return undefined;
	}

	function datetimeAttr(item: TimelineItem): string | undefined {
		if (item.datetime === undefined) return undefined;
		return item.datetime instanceof Date ? item.datetime.toISOString() : item.datetime;
	}
</script>

{#snippet timeEl(item: TimelineItem, label: THC)}
	{@const datetime = datetimeAttr(item)}
	<!-- <time> only when it can carry a machine-readable value -->
	<svelte:element this={datetime ? "time" : "span"} class={_classTime} {datetime}>
		<Thc thc={label} />
	</svelte:element>
{/snippet}

{#if items.length}
	<!-- svelte-ignore a11y_no_redundant_roles -->
	<ol
		bind:this={el}
		class={_class}
		role="list"
		data-align={!unstyled ? align : undefined}
		data-time-position={!unstyled ? timePosition : undefined}
		{...rest}
	>
		{#each items as item, index (index)}
			{@const label = timeLabel(item)}
			{@const kind = markerKind(item)}
			<li
				class={_classItem}
				data-intent={!unstyled && item.intent ? item.intent : undefined}
			>
				{#if timePosition === "opposite"}
					<div class={unstyled ? undefined : "stuic-timeline-opposite"}>
						{#if label !== undefined}
							{@render timeEl(item, label)}
						{/if}
					</div>
				{/if}

				<div class={unstyled ? undefined : "stuic-timeline-rail"}>
					<span
						class={_classMarker}
						data-marker={!unstyled ? kind : undefined}
						aria-hidden="true"
					>
						{#if renderMarker}
							{@render renderMarker({ item, index })}
						{:else if item.icon}
							<Thc thc={item.icon} />
						{/if}
					</span>
				</div>

				<div class={_classContent}>
					{#if renderItem}
						{@render renderItem({ item, index })}
					{:else}
						{#if timePosition === "inline" && label !== undefined}
							{@render timeEl(item, label)}
						{/if}
						{#if item.title}
							<div class={_classTitle}>
								{#if item.href}
									<a
										href={item.href}
										class={unstyled ? undefined : "stuic-timeline-link"}
									>
										<Thc thc={item.title} />
									</a>
								{:else}
									<Thc thc={item.title} />
								{/if}
							</div>
						{/if}
						{#if item.description}
							<div class={_classDescription}>
								<Thc thc={item.description} />
							</div>
						{/if}
						{#if renderFooter}
							<div class={_classFooter}>
								{@render renderFooter({ item, index })}
							</div>
						{/if}
					{/if}
				</div>
			</li>
		{/each}
	</ol>
{/if}
