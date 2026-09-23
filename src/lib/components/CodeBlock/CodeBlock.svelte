<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { THC } from "../Thc/Thc.svelte";
	import type { Props as CopyButtonProps } from "../CopyButton/CopyButton.svelte";
	import type { TranslateFn } from "../../types.js";
	import type { CodeBlockHighlighter, CodeBlockToken } from "./highlight/types.js";

	/** One sample of a tabbed block — the same thing in another language or tool. */
	export interface CodeBlockSample {
		/** The sample (rendered as text) */
		code: string;
		/** What it is written in — the tab label (unless `label`), and what is highlighted */
		lang?: string;
		/** The tab label, in place of `lang` */
		label?: THC;
		/**
		 * Identity for `active`. Defaults to a string `label`, else `lang`, else the index —
		 * so blocks sharing one bound `active` stay in sync by what the reader sees.
		 */
		id?: string;
		/** Lines to highlight in this sample (overrides the block's `highlightLines`) */
		highlightLines?: number[] | string;
		/** What the copy button copies for this sample, in place of the displayed text */
		copyText?: string;
	}

	export interface Props extends Omit<
		HTMLAttributes<HTMLDivElement>,
		"children" | "title"
	> {
		/** The sample. Always rendered as text, never as HTML. Ignored with `samples`. */
		code?: string;
		/**
		 * What the sample is written in. A label, and the highlighter's hint: it is the header
		 * label (unless `title` is set), `data-lang` on the root, and a `language-*` class on
		 * the `<code>`. Ignored with `samples` (each has its own).
		 */
		lang?: string;
		/**
		 * Header label in place of `lang` — e.g. a file name. `""` hides the label. With
		 * `samples` it is shown before the tabs and names the tab list.
		 */
		title?: THC;
		/** Several samples of the same thing (curl / fetch / Python…), switched by tabs */
		samples?: CodeBlockSample[];
		/**
		 * The id of the shown sample (see `CodeBlockSample.id`); bindable. Unset → the first
		 * sample. An id this block doesn't have leaves it on the sample it showed, and the
		 * value is never rewritten — so several blocks can share one bound `active`.
		 */
		active?: string;
		/**
		 * Render the code exactly as given. By default the blank lines at both ends and the
		 * indentation all lines share are dropped (from the display and the copy alike).
		 */
		verbatim?: boolean;
		/** Soft-wrap long lines instead of scrolling horizontally */
		wrap?: boolean;
		/**
		 * Syntax highlighting. `true` (default): the built-in `highlightCode` (JSON, HTTP,
		 * shell — other languages stay plain). A function: your own tokenizer. `false`: off.
		 * Painted with the CSS Custom Highlight API — no markup; browsers without it show
		 * plain text.
		 */
		highlight?: boolean | CodeBlockHighlighter;
		/** Show line numbers (not selectable, not copied) */
		lineNumbers?: boolean;
		/** The first line's number (default `1`) */
		lineNumbersStart?: number;
		/**
		 * Lines to highlight: 1-based positions in the sample (not the displayed numbers),
		 * as an array or a string like `"1, 3-5"`.
		 */
		highlightLines?: number[] | string;
		/**
		 * Collapse samples longer than this many lines to this many, with a "Show all N
		 * lines" toggle.
		 */
		collapsedLines?: number;
		/** Whether a collapsible sample is expanded; bindable */
		expanded?: boolean;
		/** Render the copy button (default `true`) */
		copy?: boolean;
		/**
		 * Props for the copy button (a `CopyButton`: `label`, `variant`, `onCopied`, …). A
		 * `text` here overrides what gets copied — e.g. a shell sample without its `$ `
		 * prompts (a sample's own `copyText` wins over it).
		 */
		copyButtonProps?: Partial<CopyButtonProps>;
		/** i18n translate function (see `createCodeBlockT`); also passed to the copy button */
		t?: TranslateFn;
		/** Skip all default styling */
		unstyled?: boolean;
		/** Additional CSS classes for the root */
		class?: string;
		/** Class for the header row */
		classHeader?: string;
		/** Class for the header label */
		classTitle?: string;
		/** Class for the tab list */
		classTabs?: string;
		/** Class for every tab */
		classTab?: string;
		/** Class for the `<pre>` */
		classPre?: string;
		/** Class for the `<code>` */
		classCode?: string;
		/** Class for every line (only rendered with `lineNumbers` / `highlightLines`) */
		classLine?: string;
		/** Class for the footer holding the collapse toggle */
		classFooter?: string;
		/** Class for the collapse toggle */
		classToggle?: string;
		/** Bindable root element reference */
		el?: HTMLDivElement;
	}
</script>

<script lang="ts">
	import { tick } from "svelte";
	import { twMerge } from "../../utils/tw-merge.js";
	import { getId } from "../../utils/get-id.js";
	import { iconChevronDown } from "../../icons/index.js";
	import Thc, { isTHCNotEmpty } from "../Thc/Thc.svelte";
	import Button from "../Button/Button.svelte";
	import CopyButton from "../CopyButton/CopyButton.svelte";
	import { highlightCode } from "./highlight/index.js";
	import { normalizeCode } from "./_internal/normalize-code.js";
	import { parseLineSet, splitLines } from "./_internal/lines.js";
	import { paintTokens } from "./_internal/paint.js";
	import { t_default } from "./i18n.js";

	let {
		code,
		lang,
		title,
		samples,
		active = $bindable(),
		verbatim = false,
		wrap = false,
		highlight = true,
		lineNumbers = false,
		lineNumbersStart = 1,
		highlightLines,
		collapsedLines,
		expanded = $bindable(false),
		copy = true,
		copyButtonProps,
		t = t_default,
		unstyled = false,
		class: classProp,
		classHeader: classHeaderProp,
		classTitle: classTitleProp,
		classTabs: classTabsProp,
		classTab: classTabProp,
		classPre: classPreProp,
		classCode: classCodeProp,
		classLine: classLineProp,
		classFooter: classFooterProp,
		classToggle: classToggleProp,
		el = $bindable(),
		...rest
	}: Props = $props();

	const uid = getId("stuic-code-block-");
	const preId = `${uid}-code`;
	const titleId = `${uid}-title`;
	const tabId = (i: number) => `${uid}-tab-${i}`;

	// --- samples (tabs) ---------------------------------------------------------------

	let _samples = $derived(samples?.length ? samples : undefined);

	// Ids as documented, deduplicated so every tab stays selectable.
	let sampleIds = $derived.by(() => {
		const seen = new Set<string>();
		return (_samples ?? []).map((s, i) => {
			let id =
				s.id ?? (typeof s.label === "string" && s.label ? s.label : s.lang) ?? `${i}`;
			if (seen.has(id)) id = `${id}-${i}`;
			seen.add(id);
			return id;
		});
	});

	// An `active` this block doesn't have (another block's language, when several share
	// one bound value) keeps showing what it showed — initially the first sample.
	let lastIndex = 0;
	let activeIndex = $derived.by(() => {
		if (!_samples) return -1;
		const i = sampleIds.indexOf(active as string);
		if (i >= 0) lastIndex = i;
		return i >= 0 ? i : Math.min(lastIndex, _samples.length - 1);
	});
	let current = $derived(_samples?.[activeIndex]);

	// Keyed by index, written through `bind:this`; only read in handlers.
	const tabEls: HTMLButtonElement[] = [];

	function selectTab(i: number, focus = false) {
		active = sampleIds[i];
		if (focus) tabEls[i]?.focus();
	}

	function onTabKeydown(e: KeyboardEvent, i: number) {
		const n = sampleIds.length;
		const next =
			e.key === "ArrowRight"
				? (i + 1) % n
				: e.key === "ArrowLeft"
					? (i - 1 + n) % n
					: e.key === "Home"
						? 0
						: e.key === "End"
							? n - 1
							: -1;
		if (next < 0) return;
		e.preventDefault();
		selectTab(next, true);
	}

	// --- the displayed text -------------------------------------------------------------

	let _code = $derived(current ? current.code : (code ?? ""));
	let _lang = $derived(current ? current.lang : lang);
	let text = $derived(verbatim ? (_code ?? "") : normalizeCode(_code));
	let lines = $derived(splitLines(text));

	let _highlighted = $derived(
		parseLineSet(current?.highlightLines ?? highlightLines, lines.length)
	);
	// one <span> per line only when something needs it; otherwise a single text node
	let lined = $derived(lineNumbers || _highlighted.size > 0);
	let digits = $derived(String(lineNumbersStart + Math.max(lines.length, 1) - 1).length);

	let _title = $derived(_samples ? title : (title ?? lang));
	let hasTitle = $derived(isTHCNotEmpty(_title));

	let copyText = $derived(current?.copyText ?? copyButtonProps?.text ?? text);

	// --- collapse ---------------------------------------------------------------------

	let collapsible = $derived(
		!!collapsedLines && collapsedLines > 0 && lines.length > collapsedLines
	);
	let collapsed = $derived(collapsible && !expanded);

	async function toggle() {
		expanded = !expanded;
		if (!expanded) {
			// collapsing a long sample can leave the reader far below the block
			await tick();
			if (el && el.getBoundingClientRect().top < 0)
				el.scrollIntoView({ block: "nearest" });
		}
	}

	// --- keyboard reachability ----------------------------------------------------------

	// A scroll container must be reachable by keyboard, or its overflow can't be read
	// without a mouse. Measured rather than always on, so a sample that fits costs no tab
	// stop. Re-measured on resize and whenever the content or the layout changes (a longer
	// single line does not resize the box). A collapsed sample's vertical overflow is
	// hidden, not scrollable — the toggle is its way in. A tab panel is always a tab stop.
	let preEl = $state<HTMLPreElement>();
	let scrollable = $state(false);
	$effect(() => {
		const pre = preEl;
		if (!pre) return;
		void text;
		void wrap;
		void lined;
		const isCollapsed = collapsed;
		const measure = () => {
			scrollable =
				pre.scrollWidth > pre.clientWidth ||
				(!isCollapsed && pre.scrollHeight > pre.clientHeight);
		};
		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(pre);
		return () => ro.disconnect();
	});

	// --- syntax highlighting ------------------------------------------------------------

	let codeEl = $state<HTMLElement>();
	$effect(() => {
		const root = codeEl;
		const fn = highlight === true ? highlightCode : highlight || undefined;
		if (!root || !fn) return;
		void lined; // the DOM structure the ranges point into
		// the ranges index the rendered text — never paint a DOM that disagrees with it
		if (root.textContent !== text) return;
		let tokens: CodeBlockToken[];
		try {
			tokens = fn(text, _lang);
		} catch (e) {
			// a failing highlighter must not take the sample down with it
			console.error(e);
			return;
		}
		return paintTokens(root, tokens ?? []);
	});

	// --- classes ------------------------------------------------------------------------

	// Under `unstyled` a part keeps only the consumer's classes — `undefined` rather than
	// `class=""` when there are none.
	const _cls = (base: string, ...extra: (string | undefined)[]) =>
		(unstyled ? twMerge(...extra) : twMerge(base, ...extra)) || undefined;

	// `not-prose`: a code block is the component most likely to sit in a typography
	// column, whose plugin would otherwise restyle the <pre>, the <code> (adding
	// backticks) and the button. Inert where the plugin isn't installed.
	let _class = $derived(
		unstyled ? classProp : twMerge("stuic-code-block not-prose", classProp)
	);
	let _classHeader = $derived(_cls("stuic-code-block-header", classHeaderProp));
	let _classTitle = $derived(_cls("stuic-code-block-title", classTitleProp));
	let _classTabs = $derived(_cls("stuic-code-block-tabs", classTabsProp));
	let _classTab = $derived(_cls("stuic-code-block-tab", classTabProp));
	let _classPre = $derived(_cls("stuic-code-block-pre", classPreProp));
	// the `language-*` class is semantics, not styling — it survives `unstyled`
	let _classCode = $derived(
		_cls(
			"stuic-code-block-code",
			_lang ? `language-${_lang.trim().replace(/\s+/g, "-")}` : undefined,
			classCodeProp
		)
	);
	let _classLine = $derived(_cls("stuic-code-block-line", classLineProp));
	let _classFooter = $derived(_cls("stuic-code-block-footer", classFooterProp));
	let _classToggle = $derived(_cls("stuic-code-block-toggle", classToggleProp));
	let _classCopy = $derived(_cls("stuic-code-block-copy", copyButtonProps?.class));
</script>

<div
	bind:this={el}
	class={_class}
	data-lang={_lang || undefined}
	data-wrap={wrap ? "true" : undefined}
	data-samples={_samples ? "true" : undefined}
	data-copy={copy ? "true" : undefined}
	data-lines={lined ? "true" : undefined}
	data-line-numbers={lined && lineNumbers ? "true" : undefined}
	data-collapsed={collapsed ? "true" : undefined}
	{...rest}
>
	<!-- A <div>, not a <header>: outside <main>/sectioning content a <header> is a
	     `banner` landmark, one per block. -->
	{#if hasTitle || _samples || copy}
		<div class={_classHeader}>
			{#if hasTitle}
				<span id={_samples ? titleId : undefined} class={_classTitle}
					><Thc thc={_title!} /></span
				>
			{/if}
			{#if _samples}
				<div
					role="tablist"
					aria-labelledby={hasTitle ? titleId : undefined}
					class={_classTabs}
				>
					{#each _samples as sample, i (sampleIds[i])}
						<button
							bind:this={tabEls[i]}
							type="button"
							role="tab"
							id={tabId(i)}
							class={_classTab}
							aria-selected={i === activeIndex}
							aria-controls={preId}
							tabindex={i === activeIndex ? 0 : -1}
							data-active={i === activeIndex ? "true" : undefined}
							onclick={() => selectTab(i)}
							onkeydown={(e) => onTabKeydown(e, i)}
						>
							<Thc thc={sample.label ?? sample.lang ?? `${i + 1}`} />
						</button>
					{/each}
				</div>
			{/if}
			{#if copy}
				<CopyButton
					label
					variant="ghost"
					size="sm"
					{t}
					{unstyled}
					{...copyButtonProps}
					text={copyText}
					class={_classCopy}
				/>
			{/if}
		</div>
	{/if}
	<!-- tabindex: while it scrolls (axe `scrollable-region-focusable`), or as a tab panel -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<pre
		bind:this={preEl}
		id={preId}
		class={_classPre}
		role={_samples ? "tabpanel" : undefined}
		aria-labelledby={_samples ? tabId(activeIndex) : undefined}
		tabindex={_samples || scrollable ? 0 : undefined}
		style:--_collapsed-lines={collapsed ? collapsedLines : undefined}
		style:--_digits={lined && lineNumbers ? digits : undefined}><code
			bind:this={codeEl}
			class={_classCode}
			>{#if lined}{#each lines as line, i}<span
						class={_classLine}
						data-line={lineNumbers ? lineNumbersStart + i : undefined}
						data-highlighted={_highlighted.has(i + 1) ? "true" : undefined}>{line}</span
					>{/each}{:else}{text}{/if}</code
		></pre>
	{#if collapsible}
		<div class={_classFooter}>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				class={_classToggle}
				aria-expanded={expanded}
				aria-controls={preId}
				{unstyled}
				onclick={toggle}
			>
				<span
					class={unstyled ? undefined : "stuic-code-block-toggle-icon"}
					aria-hidden="true">{@html iconChevronDown()}</span
				>
				<span
					>{expanded
						? t("show_less")
						: t("show_all_lines", { count: lines.length })}</span
				>
			</Button>
		</div>
	{/if}
</div>
