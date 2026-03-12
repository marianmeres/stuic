<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { ValidateOptions } from "../../actions/validate.svelte.js";
	import type { THC } from "../Thc/Thc.svelte";

	type SnippetWithId = Snippet<[{ id: string }]>;

	export interface CronPreset {
		label: string;
		value: string;
	}

	export type CronInputMode = "predefined" | "manual";

	export interface Props {
		// Core
		value?: string;
		el?: HTMLElement;
		id?: string;

		// Mode toggle (overrides show* flags when defined)
		mode?: CronInputMode;

		// InputWrap standard props
		label?: SnippetWithId | THC;
		description?: SnippetWithId | THC;
		renderSize?: "sm" | "md" | "lg" | string;
		required?: boolean;
		disabled?: boolean;
		validate?: boolean | Omit<ValidateOptions, "setValidationResult">;
		class?: string;
		style?: string;

		// InputWrap layout
		labelLeft?: boolean;
		labelLeftWidth?: "normal" | "wide";
		labelLeftBreakpoint?: number;
		labelAfter?: SnippetWithId | THC;
		below?: SnippetWithId | THC;

		// CronInput-specific
		showPresets?: boolean;
		showFields?: boolean;
		showRawInput?: boolean;
		showDescription?: boolean;
		showNextRun?: boolean;
		presets?: CronPreset[];
		onchange?: (expression: string, valid: boolean) => void;

		// Sub-element class overrides
		classLabel?: string;
		classLabelBox?: string;
		classInputBox?: string;
		classInputBoxWrap?: string;
		classInputBoxWrapInvalid?: string;
		classDescBox?: string;
		classBelowBox?: string;
		classFields?: string;
		classField?: string;
		classFieldLabel?: string;
		classFieldInput?: string;
		classPreset?: string;
		classRaw?: string;
		classSummary?: string;
		classToggleButton?: string;
	}

	export const DEFAULT_PRESETS: CronPreset[] = [
		{ label: "Every minute", value: "* * * * *" },
		{ label: "Every 5 minutes", value: "*/5 * * * *" },
		{ label: "Every 15 minutes", value: "*/15 * * * *" },
		{ label: "Every 30 minutes", value: "*/30 * * * *" },
		{ label: "Every hour", value: "0 * * * *" },
		{ label: "Every 6 hours", value: "0 */6 * * *" },
		{ label: "Daily at midnight", value: "0 0 * * *" },
		{ label: "Daily at noon", value: "0 12 * * *" },
		{ label: "Weekdays at 9:00", value: "0 9 * * 1-5" },
		{ label: "Weekly (Sunday midnight)", value: "0 0 * * 0" },
		{ label: "Monthly (1st at midnight)", value: "0 0 1 * *" },
	];

	const FIELD_DEFS = [
		{ key: "minute", label: "Min", placeholder: "0-59" },
		{ key: "hour", label: "Hour", placeholder: "0-23" },
		{ key: "dayOfMonth", label: "Day", placeholder: "1-31" },
		{ key: "month", label: "Month", placeholder: "1-12" },
		{ key: "dayOfWeek", label: "Wday", placeholder: "0-6" },
	] as const;

	const MONTH_NAMES = [
		"", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
		"Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
	];

	const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

	type FieldKey = (typeof FIELD_DEFS)[number]["key"];

	function cronToHuman(expression: string): string {
		const parts = expression.trim().split(/\s+/);
		if (parts.length !== 5) return "";

		const [minute, hour, dom, month, dow] = parts;
		const segments: string[] = [];

		// Minute
		if (minute === "*") {
			segments.push("every minute");
		} else if (minute.startsWith("*/")) {
			segments.push(`every ${minute.slice(2)} minutes`);
		} else {
			segments.push(`at minute ${minute}`);
		}

		// Hour
		if (hour === "*") {
			// implied by "every minute/N minutes"
		} else if (hour.startsWith("*/")) {
			segments.push(`every ${hour.slice(2)} hours`);
		} else {
			segments.push(`at ${hour.padStart(2, "0")}:${minute === "*" ? "00" : minute.padStart(2, "0")}`);
			// remove the minute segment if we have a specific hour
			if (minute !== "*" && !minute.includes("/")) {
				segments.length = 0;
				segments.push(`at ${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`);
			}
		}

		// Day of month
		if (dom !== "*") {
			if (dom.includes("-")) {
				segments.push(`on days ${dom} of the month`);
			} else if (dom.includes(",")) {
				segments.push(`on days ${dom} of the month`);
			} else {
				const n = parseInt(dom);
				const suffix = n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
				segments.push(`on the ${n}${suffix}`);
			}
		}

		// Month
		if (month !== "*") {
			if (month.includes("-")) {
				const [s, e] = month.split("-").map(Number);
				segments.push(`in ${MONTH_NAMES[s]}-${MONTH_NAMES[e]}`);
			} else if (month.includes(",")) {
				const names = month.split(",").map((m) => MONTH_NAMES[parseInt(m)] || m);
				segments.push(`in ${names.join(", ")}`);
			} else {
				segments.push(`in ${MONTH_NAMES[parseInt(month)] || month}`);
			}
		}

		// Day of week
		if (dow !== "*") {
			if (dow.includes("-")) {
				const [s, e] = dow.split("-").map(Number);
				segments.push(`on ${DAY_NAMES[s]}-${DAY_NAMES[e]}`);
			} else if (dow.includes(",")) {
				const names = dow.split(",").map((d) => DAY_NAMES[parseInt(d)] || d);
				segments.push(`on ${names.join(", ")}`);
			} else {
				segments.push(`on ${DAY_NAMES[parseInt(dow)] || dow}`);
			}
		}

		return segments.length ? segments[0].charAt(0).toUpperCase() + segments.join(", ").slice(1) : "";
	}
</script>

<script lang="ts">
	import { CronParser } from "@marianmeres/cron";
	import {
		validate as validateAction,
		type ValidationResult,
	} from "../../actions/validate.svelte.js";
	import { tooltip } from "../../actions/index.js";
	import { iconList, iconSlidersHorizontal } from "../../icons/index.js";
	import { getId } from "../../utils/get-id.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import InputWrap from "../Input/_internal/InputWrap.svelte";

	let {
		value = $bindable("* * * * *"),
		el = $bindable(),
		id = getId(),
		//
		mode = $bindable<CronInputMode | undefined>("predefined"),
		//
		label,
		description,
		renderSize = "md",
		required = false,
		disabled = false,
		validate,
		class: classProp,
		style,
		//
		labelLeft = false,
		labelLeftWidth = "normal",
		labelLeftBreakpoint = 480,
		labelAfter,
		below,
		//
		showPresets = true,
		showFields = true,
		showRawInput = true,
		showDescription = true,
		showNextRun = true,
		presets,
		onchange,
		//
		classLabel,
		classLabelBox,
		classInputBox,
		classInputBoxWrap,
		classInputBoxWrapInvalid,
		classDescBox,
		classBelowBox,
		classFields,
		classField,
		classFieldLabel,
		classFieldInput,
		classPreset,
		classRaw,
		classSummary,
		classToggleButton,
	}: Props = $props();

	// Mode toggle
	const hasModeToggle = $derived(mode !== undefined);

	function toggleMode() {
		if (mode === "predefined") mode = "manual";
		else mode = "predefined";
	}

	// Effective show flags — mode overrides explicit props when defined
	let _showPresets = $derived(
		hasModeToggle ? mode === "predefined" : showPresets
	);
	let _showFields = $derived(
		hasModeToggle ? mode === "manual" : showFields
	);
	let _showRawInput = $derived(
		hasModeToggle ? false : showRawInput
	);
	let _showDescription = $derived(
		hasModeToggle ? mode === "manual" : showDescription
	);
	let _showNextRun = $derived(
		hasModeToggle ? mode === "manual" : showNextRun
	);

	const BTN_CLS = [
		"toggle-btn",
		"px-2 rounded-r block",
		"min-w-[44px] min-h-[44px]",
		"flex items-center justify-center",
	].join(" ");

	// Internal field state
	let fields = $state<Record<FieldKey, string>>({
		minute: "*",
		hour: "*",
		dayOfMonth: "*",
		month: "*",
		dayOfWeek: "*",
	});

	let rawValue = $state("* * * * *");
	let selectedPreset = $state("");
	let error = $state("");

	// Validation integration
	let validation: ValidationResult | undefined = $state();
	const setValidationResult = (res: ValidationResult) => (validation = res);

	// Track sync source to avoid loops
	let _syncSource: "value" | "fields" | "raw" | "preset" | "" = "";

	const _presets = $derived(presets ?? DEFAULT_PRESETS);

	// Combine fields into expression
	function fieldsToExpression(): string {
		return FIELD_DEFS.map((d) => fields[d.key] || "*").join(" ");
	}

	// Split expression into fields
	function expressionToFields(expr: string) {
		const parts = expr.trim().split(/\s+/);
		if (parts.length === 5) {
			FIELD_DEFS.forEach((d, i) => {
				fields[d.key] = parts[i];
			});
		}
	}

	// Match current expression to a preset
	function matchPreset(expr: string): string {
		const normalized = expr.trim().replace(/\s+/g, " ");
		return _presets.find((p) => p.value === normalized)?.value ?? "";
	}

	// Validate expression using CronParser
	function validateExpression(expr: string): boolean {
		try {
			new CronParser(expr);
			error = "";
			validation = undefined;
			return true;
		} catch (e: any) {
			error = e.message || "Invalid cron expression";
			validation = { valid: false, message: error };
			return false;
		}
	}

	// Sync external value → internal state
	$effect(() => {
		const v = value;
		if (_syncSource === "fields" || _syncSource === "raw" || _syncSource === "preset") {
			return;
		}
		_syncSource = "value";
		expressionToFields(v);
		rawValue = v;
		selectedPreset = matchPreset(v);
		validateExpression(v);
		_syncSource = "";
	});

	// Handle field input changes
	function onFieldInput() {
		_syncSource = "fields";
		const expr = fieldsToExpression();
		rawValue = expr;
		selectedPreset = matchPreset(expr);
		const valid = validateExpression(expr);
		if (valid) {
			value = expr;
		}
		onchange?.(expr, valid);
		_syncSource = "";
	}

	// Handle raw input changes
	function onRawInput() {
		_syncSource = "raw";
		const expr = rawValue;
		expressionToFields(expr);
		selectedPreset = matchPreset(expr);
		const valid = validateExpression(expr);
		if (valid) {
			value = expr;
		}
		onchange?.(expr, valid);
		_syncSource = "";
	}

	// Handle preset selection
	function onPresetChange() {
		if (!selectedPreset) return;
		_syncSource = "preset";
		const expr = selectedPreset;
		expressionToFields(expr);
		rawValue = expr;
		const valid = validateExpression(expr);
		if (valid) {
			value = expr;
		}
		onchange?.(expr, valid);
		_syncSource = "";
	}

	// When only presets are visible, render as a plain select (no extra padding/border)
	let presetsOnly = $derived(_showPresets && !_showFields && !_showRawInput && !_showDescription && !_showNextRun);

	// Minute tick — triggers re-evaluation of "Next: ..." every 60s
	let _tick = $state(0);
	$effect(() => {
		if (!_showNextRun) return;
		const id = setInterval(() => _tick++, 60_000);
		return () => clearInterval(id);
	});

	// Human-readable description
	let humanDescription = $derived.by(() => {
		if (!_showDescription && !_showNextRun) return "";
		const desc = _showDescription ? cronToHuman(rawValue) : "";
		if (!_showNextRun || error) return desc;
		// read _tick to create reactive dependency
		void _tick;
		try {
			const parser = new CronParser(rawValue);
			const next = parser.getNextRun();
			const fmt = next.toLocaleString("sv-SE", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
			});
			return desc ? `${desc}. Next: ${fmt}` : `Next: ${fmt}`;
		} catch {
			return desc;
		}
	});
</script>

<div bind:this={el}>
	<InputWrap
		{description}
		class={classProp}
		size={renderSize}
		{id}
		{label}
		{labelAfter}
		{below}
		{required}
		{disabled}
		{labelLeft}
		{labelLeftWidth}
		{labelLeftBreakpoint}
		{classLabel}
		{classLabelBox}
		{classInputBox}
		{classInputBoxWrap}
		classInputBoxWrapInvalid={twMerge(classInputBoxWrapInvalid)}
		{classDescBox}
		{classBelowBox}
		{validation}
		{style}
	>
		<div class="w-full flex">
			<div
				class={twMerge("stuic-cron-input-content", error && "has-error")}
				data-presets-only={presetsOnly ? "" : undefined}
			>
				{#if _showPresets}
					<select
						class={twMerge("stuic-cron-input-preset", classPreset)}
						bind:value={selectedPreset}
						onchange={onPresetChange}
						{disabled}
					>
						<option value="">Custom</option>
						{#each _presets as p}
							<option value={p.value}>{p.label}</option>
						{/each}
					</select>
				{/if}

				{#if _showFields}
				<div class={twMerge("stuic-cron-input-fields", classFields)}>
					{#each FIELD_DEFS as def}
						<div class={twMerge("stuic-cron-input-field", classField)}>
							<span class={twMerge("stuic-cron-input-field-label", classFieldLabel)}>
								{def.label}
							</span>
							<input
								type="text"
								class={twMerge("stuic-cron-input-field-input", classFieldInput)}
								bind:value={fields[def.key]}
								oninput={onFieldInput}
								placeholder={def.placeholder}
								{disabled}
								autocomplete="off"
								spellcheck={false}
							/>
						</div>
					{/each}
				</div>
				{/if}

				{#if _showRawInput}
					<input
						type="text"
						class={twMerge("stuic-cron-input-raw", classRaw)}
						bind:value={rawValue}
						oninput={onRawInput}
						placeholder="* * * * *"
						{disabled}
						autocomplete="off"
						spellcheck={false}
					/>
				{/if}

				{#if (_showDescription || _showNextRun) && humanDescription}
					<div class={twMerge("stuic-cron-input-summary", classSummary)}>
						{humanDescription}
					</div>
				{/if}

			</div>
			{#if hasModeToggle}
				<button
					type="button"
					class={twMerge(BTN_CLS, classToggleButton)}
					onclick={toggleMode}
					{disabled}
					use:tooltip={() => ({
						enabled: true,
						content: mode === "predefined" ? "Manual input" : "Predefined presets",
					})}
				>
					{#if mode === "predefined"}
						{@html iconSlidersHorizontal({ size: 19 })}
					{:else}
						{@html iconList({ size: 19 })}
					{/if}
				</button>
			{/if}
		</div>
	</InputWrap>
</div>
