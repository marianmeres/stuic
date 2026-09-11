<!--
	INTERNAL to FieldsBuilder — not exported from the package.

	The controls of one `extras` bag (`Record<string, unknown>`), one per
	declared `FieldTypeExtraDef` (boolean / string / select). Rendered by a
	field row for the palette entry's extras and by a column line for the
	column type's extras — the same bag rule applies to both.

	Every arm displays the ACTUAL bag value only (no `?? ex.default` fallback):
	defaults are materialized into the bag on add / type change, but a def
	loaded without the key must not render as if it held the default while
	emitting nothing — the control must always match what `value` says.

	"Empty means absent": `undefined` REMOVES the key, and an emptied bag
	removes `extras` itself — "no value" must have exactly one representation
	downstream. A consumer reading `extras.unit` to decide whether to render a
	suffix should never have to special-case `""`, nor a `{}` that means
	nothing.
-->
<script lang="ts">
	import { twMerge } from "../../../utils/tw-merge.js";
	import type { FieldTypeExtraDef, LocalizedText } from "../types.js";
	import { getLocalizedText } from "../utils.js";

	interface Props {
		extras?: Record<string, unknown>;
		/** The declarations (the palette entry's `extras`). */
		defs: FieldTypeExtraDef[];
		/** Display fallback chain for the declarations' labels / placeholders. */
		displayLanguages?: string[];
		/** Unique prefix for the control ids (label association). */
		idPrefix: string;
		disabled?: boolean;
		tabindex?: number;
		/** Rendered below the controls; also marks the string inputs invalid. */
		error?: string;
		class?: string;
		/** Fired after any change to `extras`. */
		onChange?: () => void;
	}

	let {
		// no fallback on purpose — the parent binds a possibly-undefined bag
		extras = $bindable(),
		defs,
		displayLanguages,
		idPrefix,
		disabled = false,
		tabindex = 0,
		error,
		class: classProp,
		onChange,
	}: Props = $props();

	const errId = $derived(`${idPrefix}-extras-err`);

	function displayText(text: LocalizedText | null | undefined): string {
		return getLocalizedText(text, displayLanguages);
	}

	function setExtra(key: string, value: unknown) {
		const next = { ...(extras ?? {}) };
		if (value === undefined) delete next[key];
		else next[key] = value;
		extras = Object.keys(next).length ? next : undefined;
		onChange?.();
	}

	/** Display value of a string/select extra (a non-string is shown, not eaten). */
	function extraText(key: string): string {
		const v = extras?.[key];
		return v == null ? "" : String(v);
	}

	// while typing, the RAW value is stored (trimming here would fight the
	// caret: a written-back trimmed value makes a trailing space untypable) —
	// only the emptiness test is trimmed; `onchange` normalizes on commit
	function onStringInput(key: string, raw: string) {
		setExtra(key, raw.trim() ? raw : undefined);
	}

	function onStringChange(key: string, raw: string) {
		setExtra(key, raw.trim() || undefined);
	}

	const INPUT_CLS = [
		"rounded bg-(--stuic-color-input)",
		"border border-(--stuic-color-border)",
		"focus:border-(--stuic-color-border-hover)",
		"focus:outline-none focus:ring-0",
		"focus-visible:outline-none focus-visible:ring-0",
	].join(" ");
</script>

<div class={twMerge("fb-extras fb-field flex flex-col gap-2.5", classProp)}>
	{#each defs as ex, exIdx (ex.key)}
		{#if ex.type === "string" || ex.type === "select"}
			{@const exId = `${idPrefix}-extra-${exIdx}`}
			{@const exValue = extraText(ex.key)}
			<div class="fb-extra">
				<label class="fb-sub-label" for={exId}>
					{displayText(ex.label)}
				</label>
				{#if ex.type === "string"}
					<input
						id={exId}
						type="text"
						class={twMerge(INPUT_CLS, "fb-extra-input w-full")}
						value={exValue}
						maxlength={ex.maxlength}
						placeholder={displayText(ex.placeholder) || undefined}
						oninput={(e) => onStringInput(ex.key, e.currentTarget.value)}
						onchange={(e) => onStringChange(ex.key, e.currentTarget.value)}
						{disabled}
						{tabindex}
						aria-invalid={!!error || undefined}
						aria-describedby={error ? errId : undefined}
					/>
				{:else}
					<select
						id={exId}
						class={twMerge(INPUT_CLS, "fb-extra-input w-full")}
						value={exValue}
						onchange={(e) => setExtra(ex.key, e.currentTarget.value || undefined)}
						{disabled}
						{tabindex}
					>
						<option value="">
							{displayText(ex.placeholder)}
						</option>
						{#each ex.options as opt (opt.value)}
							<option value={opt.value}>
								{displayText(opt.label)}
							</option>
						{/each}
						<!-- a stored value outside the declared list stays visible and
						     round-trips (same stance as an unknown field type) -->
						{#if exValue && !ex.options.some((o) => o.value === exValue)}
							<option value={exValue}>{exValue}</option>
						{/if}
					</select>
				{/if}
				{#if ex.description}
					<div class="fb-hint text-xs mt-0.5">
						{displayText(ex.description)}
					</div>
				{/if}
			</div>
		{:else}
			<label class="stuic-checkbox fb-extra flex items-start gap-2 cursor-pointer">
				<input
					type="checkbox"
					checked={!!extras?.[ex.key]}
					onchange={(e) => setExtra(ex.key, e.currentTarget.checked)}
					{disabled}
					{tabindex}
				/>
				<span class="text-sm">
					{displayText(ex.label)}
					{#if ex.description}
						<span class="fb-hint block text-xs">
							{displayText(ex.description)}
						</span>
					{/if}
				</span>
			</label>
		{/if}
	{/each}
	{#if error}
		<div id={errId} class="fb-error-text text-sm">
			{error}
		</div>
	{/if}
</div>
