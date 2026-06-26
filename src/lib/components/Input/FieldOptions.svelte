<script lang="ts" module>
	import { createClog } from "@marianmeres/clog";
	import {
		iconSearch,
		iconCheck,
		iconCircle,
		iconSquare,
		iconChevronUp,
		iconChevronDown,
		iconArrowUpToLine,
		iconArrowDownToLine,
		iconTrash,
	} from "$lib/icons/index.js";
	import { ItemCollection, type Item } from "@marianmeres/item-collection";
	import { Debounced, watch } from "runed";
	import { onDestroy, tick, type Snippet } from "svelte";
	import { tooltip } from "../../actions/index.js";
	import {
		type ValidateOptions,
		type ValidationResult,
	} from "../../actions/validate.svelte.js";
	import type { TranslateFn } from "../../types.js";
	import { getId } from "../../utils/get-id.js";
	import { isPlainObject } from "../../utils/is-plain-object.js";
	import { maybeJsonParse } from "../../utils/maybe-json-parse.js";
	import { waitForNextRepaint } from "../../utils/paint.js";
	import { qsa } from "../../utils/qsa.js";
	import { replaceMap } from "../../utils/replace-map.js";
	import { strHash } from "../../utils/str-hash.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import Button from "../Button/Button.svelte";
	import { ModalDialog } from "../ModalDialog/index.js";
	import { NotificationsStack } from "../Notifications/index.js";
	import Spinner from "../Spinner/Spinner.svelte";
	import type { THC } from "../Thc/Thc.svelte";
	import X from "../X/X.svelte";
	import InputWrap from "./_internal/InputWrap.svelte";
	import FieldLikeButton from "./FieldLikeButton.svelte";
	import ListItemButton from "../ListItemButton/ListItemButton.svelte";
	import type { InputWrapClassProps } from "./types.js";

	export interface Option {
		label: string;
		value: any;
	}

	type SnippetWithId = Snippet<[{ id: string }]>;

	export interface Props extends InputWrapClassProps, Record<string, any> {
		trigger?: Snippet<[{ value: string; modal: ModalDialog }]>;
		modal?: ModalDialog;
		input?: HTMLInputElement;
		value: string;
		label?: SnippetWithId | THC;
		type?: string;
		description?: SnippetWithId | THC;
		class?: string;
		id?: string;
		tabindex?: number;
		renderSize?: "sm" | "md" | "lg" | string;
		useTrim?: boolean;
		required?: boolean;
		disabled?: boolean;
		validate?: boolean | Omit<ValidateOptions, "setValidationResult">;
		labelAfter?: SnippetWithId | THC;
		below?: SnippetWithId | THC;
		labelLeft?: boolean;
		labelLeftWidth?: "normal" | "wide";
		labelLeftBreakpoint?: number;
		/** Classes for the inner FieldLikeButton element */
		classInput?: string;
		classOption?: string;
		classOptionActive?: string;
		classOptgroup?: string;
		classModalField?: string;
		noScrollLock?: boolean;
		style?: string;
		t?: TranslateFn;
		renderValue?: (stringifiedItems: string) => string;
		getOptions: (q: string, current: Item[]) => Promise<{ found: Item[] }>;
		notifications?: NotificationsStack;
		cardinality?: number;
		renderOptionLabel?: (item: Item) => string;
		renderOptionGroup?: (s: string) => string;
		allowUnknown?: boolean;
		/**
		 * Opt-in: when true (and multi-select), exposes a dedicated "Arrange" screen in the
		 * modal that lets the user manually reorder the current selection (buttons only, no
		 * drag), plus "Sort A–Z" / "Reverse" shortcuts. The chosen order is what gets
		 * serialized to `value` on submit. No-op for single-select. Default `false`.
		 */
		ordered?: boolean;
		showIconsCheckbox?: boolean;
		showIconsRadio?: boolean;
		searchPlaceholder?: string;
		name: string;
		itemIdPropName?: string;
		onChange?: (value: string) => void;
	}

	// i18n ready
	function t_default(
		k: string,
		values: false | null | undefined | Record<string, string | number> = null,
		fallback: string | boolean = "",
		i18nSpanWrap: boolean = true
	) {
		const m: Record<string, string> = {
			field_req_att: "This field requires attention. Please review and try again.",
			cardinality_of: "of max",
			cardinality_selected: "selected",
			submit: "Submit",
			select_all: "Select all",
			clear_all: "Clear selected",
			clear: "Clear",
			search_placeholder: "Type to search...",
			search_submit_placeholder: "Type to search and submit...",
			cardinality_full: "Max selection reached",
			select_from_list: "Please select from the list only",
			x_close: "Clear input or close [esc]",
			close: "Close [esc]",
			unknown_allowed: "Select or type and submit",
			unknown_not_allowed: "Select from the list",
			no_results: "No results found.",
			add_new: 'Add "{{value}}"...',
			click_add_new: "You must add the value to continue",
			//
			pick_tab: "Pick",
			arrange_tab: "Arrange ({{value}})",
			arrange_help: "Reorder the selected items. Use the buttons to move them.",
			sort_az: "Sort A–Z",
			reverse: "Reverse",
			move_up: "Move up",
			move_down: "Move down",
			move_to_top: "Move to top",
			move_to_bottom: "Move to bottom",
			remove_item: "Remove",
			moved_up: "Moved {{value}} up",
			moved_down: "Moved {{value}} down",
			removed_item: "Removed {{value}}",
			sorted_az: "Sorted A to Z",
			reversed: "Order reversed",
		};
		let out = m[k] ?? fallback ?? k;

		return isPlainObject(values) ? replaceMap(out, values as any) : out;
	}
</script>

<script lang="ts">
	const clog = createClog("FieldOptions");

	const iconCheckboxEmpty = iconSquare;
	const iconCheckboxCheck = iconCheck;

	const iconRadioEmpty = iconCircle;
	const iconRadioCheck = iconCheck;

	let {
		trigger,
		modal = $bindable(),
		input = $bindable(),
		value = $bindable(), //
		label = "",
		id = getId(),
		type = "text",
		tabindex = 0,
		description,
		class: classProp,
		renderSize = "lg",
		useTrim = true,
		//
		required = false,
		disabled = false,
		//
		// Renamed local binding to avoid collision with `export function validate()` below.
		validate: validateProp,
		//
		labelAfter,
		below,
		//
		labelLeft = false,
		labelLeftWidth = "normal",
		labelLeftBreakpoint = 480,
		//
		classInput,
		classLabel,
		classLabelBox,
		classInputBox,
		classInputBoxWrap,
		classInputBoxWrapInvalid,
		classDescBox,
		classDescBoxToggle,
		classBelowBox,
		classValidationBox,
		//
		classOption,
		classOptionActive,
		classOptgroup,
		//
		style,
		//
		classModalField,
		noScrollLock = false,
		t = t_default,
		//
		renderValue,
		getOptions,
		notifications,
		cardinality: _cardinality = Infinity,
		renderOptionLabel,
		renderOptionGroup = (s: string) => `${s}`.replaceAll("_", " "),
		allowUnknown = false,
		ordered = false,
		showIconsCheckbox = true,
		showIconsRadio = false,
		searchPlaceholder,
		name,
		itemIdPropName = "id",
		onChange,
		...rest
	}: Props = $props();

	let modalDialog: ModalDialog = $state()!;
	// Sync internal modal state to bindable prop for external access
	$effect(() => {
		modal = modalDialog;
	});

	// Imperative API delegates to the inner FieldLikeButton trigger.
	let triggerRef: FieldLikeButton | undefined = $state();

	/** Trigger validation now. Renders the inline message if invalid. */
	export function validate(): ValidationResult | undefined {
		return triggerRef?.validate();
	}

	/** Clear the inline validation message. */
	export function clearValidation(): void {
		triggerRef?.clearValidation?.();
	}

	/** Current validation state. */
	export function getValidation(): ValidationResult | undefined {
		return triggerRef?.getValidation?.();
	}

	/** Focus the visible trigger button. */
	export function focus(): void {
		triggerRef?.focus?.();
	}

	/** Scroll the field into view. */
	export function scrollIntoView(opts?: ScrollIntoViewOptions): void {
		triggerRef?.scrollIntoView?.(opts);
	}
	let innerValue = $state("");
	let isFetching = $state(false);
	let isUnmounted = false;
	onDestroy(() => {
		isUnmounted = true;
	});
	let cardinality = $derived(_cardinality === -1 ? Infinity : _cardinality);
	let isMultiple = $derived(cardinality > 1);
	let showIcons = $derived(isMultiple ? showIconsCheckbox : showIconsRadio);

	// the "Arrange" (manual ordering) feature is opt-in and only meaningful for multi-select
	let canArrange = $derived(ordered && isMultiple);
	// false = "Pick" screen (search + options), true = "Arrange" screen (reorder selection)
	let arrangeMode = $state(false);
	// aria-live announcement text for reorder/remove actions
	let liveAnnouncement = $state("");
	// the arrange list scroller (for focus management)
	let arrangeListBox: HTMLDivElement | undefined = $state();
	// hydrate-once tracker (ordered mode): the `value` we last loaded the selection from
	let hydratedValue: string | undefined = undefined;
	// keep arrange state clean if the feature gets disabled at runtime (e.g. cardinality -> 1)
	$effect(() => {
		if (!canArrange && arrangeMode) arrangeMode = false;
	});

	//
	let wrappedValidate: Omit<ValidateOptions, "setValidationResult"> = $derived({
		enabled: true,
		customValidator(value: any, context: Record<string, any> | undefined, el: any) {
			// NOTE: the below error message code will be ignored, so it's just cosmetics.
			// This, built-in JSON array validator cannot be bypassed. Strictly expecting array.
			let selected = [];
			try {
				selected = JSON.parse(value);
				if (!Array.isArray(selected)) return "typeMismatch";
			} catch (e) {
				return "typeMismatch";
			}
			// cardinality check
			if (selected.length > cardinality) return "rangeOverflow";

			// continue with provided validator
			return (validateProp as any)?.customValidator?.(value, context, el) || "";
		},
		t(reason: keyof ValidityStateFlags, value: any, fallback: string) {
			// Unfortunately, for hidden, everything is a `customError` reason. So, we must generalize...
			return t("field_req_att");
		},
	});

	function _renderOptionLabel(item: Item): string {
		return renderOptionLabel?.(item) || `${item[itemIdPropName]}`;
	}

	function getIconThc(isSelected: boolean): { html: string } {
		const size = 19;
		if (isMultiple) {
			return {
				html: isSelected ? iconCheckboxCheck({ size }) : iconCheckboxEmpty({ size }),
			};
		}
		return { html: isSelected ? iconRadioCheck({ size }) : iconRadioEmpty({ size }) };
	}

	function sortFn(a: Item, b: Item) {
		const withOptGroup = (i: Item) => `${i.optgroup || ""}__${_renderOptionLabel(i)}`;
		return withOptGroup(a).localeCompare(withOptGroup(b), undefined, {
			sensitivity: "base",
		});
	}

	// let's have two distinct collections for the job, they are independent on each other
	// first, the all available options
	// svelte-ignore state_referenced_locally
	const _optionsColl = new ItemCollection([], {
		allowNextPrevCycle: false,
		sortFn,
		idPropName: itemIdPropName,
	});

	// second, the selected ones
	// svelte-ignore state_referenced_locally
	const _selectedColl = new ItemCollection([], {
		cardinality,
		sortFn,
		idPropName: itemIdPropName,
	});

	// reconfigure if the prop ever changes during runtime (most likely will NOT)
	$effect(() => {
		// In "arrange" mode we UNSET the sortFn (item-collection: `null` unsets, a function
		// keeps it) so the selection keeps its manual/insertion order instead of being
		// auto-sorted alphabetically. Default mode keeps the alpha sortFn => byte-identical.
		_selectedColl.configure({
			cardinality,
			sortFn: canArrange ? (null as any) : sortFn,
		});
		// trim excess selections if cardinality was reduced
		if (_selectedColl.size > cardinality) {
			const trimmed = _selectedColl.items.slice(0, cardinality);
			_selectedColl.clear().addMany(trimmed);
		}
	});

	// now, create the reactive, subscribed variants
	let options = $derived($_optionsColl);
	let selected = $derived($_selectedColl);

	// we need to know whether to show "Add xyz"...
	function have_option_label_like(items: Item[], s: string) {
		return items.some(
			(item) => _renderOptionLabel(item).toLowerCase() === `${s}`.toLowerCase()
		);
	}

	// hidden input which holds the final value (upon which validation happens)
	let parentHiddenInputEl: HTMLInputElement | undefined = $state();

	let activeEl: HTMLButtonElement | undefined = $state();
	let optionsBox: HTMLDivElement | undefined = $state();

	// add_new dance...
	let addNewBtn: HTMLButtonElement | undefined = $state();
	let isAddNewBtnActive = $state(false);
	let touch = $state(new Date());

	// suggest options as a typeahead feature
	const debounced = new Debounced(() => innerValue, 150);
	let fetchRequestId = 0;
	watch(
		[() => modalDialog.visibility().visible, () => debounced.current],
		([isVisible, currVal]) => {
			if (!isVisible) return;
			isFetching = true;
			const currentRequest = ++fetchRequestId;
			getOptions(currVal, selected.items)
				.then((res) => {
					// ignore stale responses
					if (currentRequest !== fetchRequestId) return;

					const { found } = res;

					// continue normally, with (server) provided options...
					_optionsColl.clear().addMany(found);
					// always update the existing with recent server data
					_selectedColl.patchMany(found);

					// update signal...
					touch = new Date();
				})
				.catch((e) => {
					console.error(e);
					notifications?.error(`${e}`);
				})
				.finally(() => (isFetching = false));
		}
	);

	function _hydrateSelectedFromValue(v: string) {
		_selectedColl.clear().addMany(maybeJsonParse(v) as Item[]);
		// IMPORTANT: focus first selected so it scrolls into view on open
		if (_selectedColl.size) {
			waitForNextRepaint().then(() => {
				if (!isUnmounted) _optionsColl.setActive(_selectedColl.items[0]);
			});
		}
	}

	$effect(() => {
		const visible = modalDialog.visibility().visible;
		if (canArrange) {
			// ORDERED MODE: hydrate the selection from `value` ONLY on open / external value
			// change — deliberately NOT on every fetch (`touch`), otherwise a manual reorder
			// (or any not-yet-submitted pick) would be silently reset on the next keystroke.
			const v = value;
			if (!visible) {
				hydratedValue = undefined;
				return;
			}
			if (hydratedValue === v) return;
			hydratedValue = v;
			// ensure the sortFn is unset before addMany, so the saved order survives the load
			_selectedColl.configure({ sortFn: null as any }, false);
			_hydrateSelectedFromValue(v);
		} else {
			// DEFAULT MODE: unchanged behavior (re-sync to `value` whenever visible & touched)
			if (visible && touch) _hydrateSelectedFromValue(value);
		}
	});

	// scroll the active option into view
	$effect(() => {
		if (options.active?.[itemIdPropName]) {
			activeEl = qsa(`#${btn_id(options.active[itemIdPropName])}`, optionsBox)[0] as any;
			activeEl?.scrollIntoView({ behavior: "smooth", block: "center" });
			activeEl?.focus();
		} else {
			activeEl = undefined;
		}
	});

	// internal DRY
	function btn_id(id: string | number, prefix = "btn-") {
		return prefix + strHash(`${id}`.repeat(3));
	}

	// --- Arrange (ordered) screen helpers ---

	function arrange_row_id(id: string | number) {
		return btn_id(id, "arr-");
	}

	function _announce(key: string, item: Item) {
		liveAnnouncement = t(key, { value: _renderOptionLabel(item) }) as string;
	}

	// re-focus the same logical button on the row that moved, so repeated presses keep
	// walking the item; if that button is now disabled (a boundary), fall back to an enabled one
	function focusRowButton(itemId: string | number, which: "up" | "down") {
		tick().then(() => {
			const row = arrangeListBox?.querySelector(`#${arrange_row_id(itemId)}`);
			if (!row) return;
			let btn = row.querySelector<HTMLButtonElement>(`[data-arrange-btn="${which}"]`);
			if (!btn || btn.disabled) {
				btn =
					row.querySelector<HTMLButtonElement>(
						`[data-arrange-btn="up"]:not([disabled])`
					) ||
					row.querySelector<HTMLButtonElement>(
						`[data-arrange-btn="down"]:not([disabled])`
					);
			}
			btn?.focus();
		});
	}

	function moveItem(from: number, to: number) {
		if (to < 0 || to >= _selectedColl.size || from === to) return;
		const item = _selectedColl.items[from];
		if (!_selectedColl.move(from, to)) return;
		if (item) {
			_announce(to < from ? "moved_up" : "moved_down", item);
			focusRowButton(item[itemIdPropName], to < from ? "up" : "down");
		}
	}

	function removeItem(i: number) {
		const item = _selectedColl.items[i];
		_selectedColl.removeAt(i);
		if (item) _announce("removed_item", item);
		tick().then(() => {
			if (!_selectedColl.size) return enterPick();
			const next = _selectedColl.items[Math.min(i, _selectedColl.size - 1)];
			if (next) focusRowButton(next[itemIdPropName], "down");
		});
	}

	// one-shot sort by visible label (does NOT re-enable auto-sort; subsequent adds still append)
	function sortAZ() {
		_selectedColl.sort((a, b) =>
			_renderOptionLabel(a).localeCompare(_renderOptionLabel(b), undefined, {
				sensitivity: "base",
			})
		);
		liveAnnouncement = t("sorted_az") as string;
	}

	// no reverse() on the collection; snapshot, clear (no publish), re-add in reversed order
	function reverse() {
		const reversed = [...selected.items].reverse();
		_selectedColl.clear(false).addMany(reversed);
		liveAnnouncement = t("reversed") as string;
	}

	function enterArrange() {
		if (!selected.items.length) return;
		arrangeMode = true;
		input?.blur(); // dismiss the soft keyboard (no text input on this screen)
		const first = selected.items[0];
		if (first) focusRowButton(first[itemIdPropName], "down");
	}

	function enterPick() {
		arrangeMode = false;
		tick().then(() => input?.focus());
	}

	// "inner" submit
	function try_submit(force = false) {
		// clog("try_submit", innerValue, _selectedColl.dump());
		if (innerValue) {
			let found = have_option_label_like(_optionsColl.items, innerValue);
			// clog("found", found, allowUnknown, _selectedColl.dump());
			if (!found && !allowUnknown) {
				if (isMultiple && _selectedColl.size) {
					// this is actually ok... (not simplifying the outer if so its easily readable)
				} else {
					return notifications?.error(t("select_from_list"), { ttl: 1000 });
				}
			}

			if (!found && !_optionsColl.size) {
				return notifications?.error(t("click_add_new", { value: innerValue }), {
					ttl: 1000,
				});
			}

			// maybe submit
			if (_selectedColl.isFull || force) submit();
		}
		// enter on empty input always submits
		else {
			submit();
		}
	}

	function add_new() {
		// should be noop if called multiple times with same value
		if (allowUnknown && innerValue) {
			const item = { [itemIdPropName]: innerValue };
			if (!isMultiple) _selectedColl.clear();
			// actual selection addon
			_selectedColl.add(item);
			// we might have added a new one, so add it to options as well
			// (will be noop if already exists)...
			_optionsColl.add(item);
			_optionsColl.setActive(item);
		}
	}

	function _dispatch_change_to_owner() {
		// trigger validation on the parent on each submit (emulate typical browser behaviour)
		tick().then(() => {
			parentHiddenInputEl?.dispatchEvent(new Event("change", { bubbles: true }));
		});
	}

	// "outer" submit - will set the outer bound value (always string) and close modal...
	// further process is left on the consumer
	function submit() {
		// clog("modal submit", $state.snapshot(selected.items));
		value = JSON.stringify(selected.items);
		innerValue = "";
		arrangeMode = false;
		_optionsColl.clear();
		modalDialog.close();
		_dispatch_change_to_owner();
		onChange?.(value);
	}

	// clears state and dispatches change; close is handled by ModalDialog's preEscapeClose
	function escape() {
		innerValue = "";
		arrangeMode = false;
		_optionsColl.clear();
		_dispatch_change_to_owner();
	}

	function _normalize_and_group_options(opts: Item[]): Map<string, Item[]> {
		const groupped = new Map<string, Item[]>();
		opts.forEach((o) => {
			const optgLabel = renderOptionGroup(o.optgroup || "");
			if (!groupped.has(optgLabel)) groupped.set(optgLabel, []);
			const optgroup = groupped.get(optgLabel);
			optgroup!.push(o);
		});
		return groupped;
	}

	let groupedOptions = $derived(_normalize_and_group_options(options.items));

	// add new dance
	$effect(() => {
		if (addNewBtn && isAddNewBtnActive) {
			addNewBtn?.focus();
			_optionsColl.unsetActive(); // make sure to reset
		}
		if (!addNewBtn) {
			isAddNewBtnActive = false;
		}
	});

	function maybe_activate_add_new(isDown: boolean, isMeta: boolean) {
		// no button, no activation
		if (!addNewBtn) return false;
		const isUp = !isDown;

		// separating below into distinct ifs, so it's easily readable

		// if first arrow down
		if (!isAddNewBtnActive && isDown && _optionsColl.activeIndex === undefined) {
			return true;
		}

		// isActive and isUp (this is a noop, but we must break)
		if (isAddNewBtnActive && isUp) {
			return true;
		}

		// isUp from first, or is metaUp
		if (!isAddNewBtnActive && isUp && (_optionsColl.activeIndex === 0 || isMeta)) {
			return true;
		}

		return false;
	}
</script>

<!-- this must be on window as we're catching any typing anywhere -->
<svelte:window
	onkeydown={(e) => {
		// on the Arrange screen the reorder buttons own the keyboard; the option-list
		// navigation + "any key focuses search" behavior must NOT run there
		if (modalDialog.visibility().visible && !arrangeMode) {
			// arrow navigation
			if (["ArrowDown", "ArrowUp"].includes(e.key)) {
				e.preventDefault();

				isAddNewBtnActive = maybe_activate_add_new(e.key === "ArrowDown", e.metaKey);

				if (!isAddNewBtnActive) {
					if (e.key === "ArrowUp") {
						e.metaKey ? _optionsColl.setActiveFirst() : _optionsColl.setActivePrevious();
					} else if (e.key === "ArrowDown") {
						e.metaKey ? _optionsColl.setActiveLast() : _optionsColl.setActiveNext();
					}
				}

				// common UI convention: radios are selected by arrows
				if (!isMultiple && _optionsColl.active) {
					_selectedColl.clear().add(_optionsColl.active!);
				}
			}
			// everything else (except controls) "forward" as an input search
			else if (!["Tab", " ", "Enter"].includes(e.key)) {
				input?.focus();
			}
		}
	}}
/>

<!-- must wrap both -->
<div>
	{#if trigger}
		{@render trigger({ value, modal: modalDialog })}
	{:else}
		<FieldLikeButton
			bind:this={triggerRef}
			bind:value
			bind:input={parentHiddenInputEl}
			{name}
			class={classProp}
			{label}
			{description}
			{labelLeft}
			{labelAfter}
			{below}
			{labelLeftWidth}
			{labelLeftBreakpoint}
			{classLabel}
			{classLabelBox}
			{classInputBox}
			{classInputBoxWrap}
			{classInputBoxWrapInvalid}
			{classDescBox}
			{classDescBoxToggle}
			{classBelowBox}
			{classValidationBox}
			{style}
			validate={wrappedValidate}
			{required}
			{disabled}
			renderValue={(v) => {
				if (typeof renderValue === "function") return renderValue(v);
				// console.log(123123, "renderValue", v);
				// prettier-ignore
				try {
				// defensive
				if (!v) v = "[]";

				const limit = 5;
				let vals: any[] = JSON.parse(v);
				if (!Array.isArray(vals)) throw new Error('Expecting value to be an array');
				const origLength = vals.length;
				let extra = '';
				if (vals.length > limit) {
					vals = vals.slice(0, limit);
					extra = `, ... <span class="text-sm stuic-field-options-muted">(+${(origLength - limit)})</span>`;
				}
				return vals.filter(v => v != null).map(_renderOptionLabel).join(", ") + extra;
			} catch (e) {
				clog.warn(e);
				return `${e}`; // either invalid json or not array...
			}
			}}
			onclick={modalDialog?.open}
		/>
	{/if}

	<ModalDialog
		bind:this={modalDialog}
		preEscapeClose={escape}
		classDialog="items-start"
		class={twMerge("w-full max-w-2xl bg-transparent shadow-none pointer-events-none")}
		ariaLabelledby={id}
		{noScrollLock}
	>
		<div class="pt-0 md:pt-[20vh] w-full">
			<div class="pointer-events-auto">
				<!-- screen-reader announcements for reorder / remove actions -->
				<div class="sr-only" aria-live="polite" aria-atomic="true">
					{liveAnnouncement}
				</div>

				<InputWrap
					size={renderSize}
					class={twMerge("m-1 sm:m-2 mb-12 shadow-xl", classModalField)}
					classInputBoxWrap={twMerge(
						// always look like focused
						`border border-(--stuic-input-accent)`,
						`ring-(--stuic-input-accent)/20 ring-4`
					)}
					{id}
					{required}
				>
					{#snippet inputAbove()}
						{#if canArrange}
							<!-- Pick | Arrange tab header — lives INSIDE the card (solid bg) -->
							<div
								class="relative flex items-stretch px-2 border-b"
								style={`border-color: var(--stuic-field-options-divider); min-height: var(--stuic-input-min-height-${renderSize}, 3rem);`}
							>
								<!-- full-height tabs => titles are vertically centered in the row -->
								<div role="tablist" class="flex items-stretch gap-1">
									<button
										type="button"
										role="tab"
										aria-selected={!arrangeMode}
										onclick={enterPick}
										class={twMerge(
											// keep font-weight constant across states so the tab doesn't reflow
											"flex items-center px-3 -mb-px text-sm font-semibold border-b-2",
											!arrangeMode
												? "border-(--stuic-input-accent) text-(--stuic-input-accent)"
												: "border-transparent stuic-field-options-muted"
										)}
									>
										{@html t("pick_tab")}
									</button>
									<button
										type="button"
										role="tab"
										aria-selected={arrangeMode}
										disabled={!selected.items.length}
										onclick={enterArrange}
										class={twMerge(
											// keep font-weight constant across states so the tab doesn't reflow
											"flex items-center px-3 -mb-px text-sm font-semibold border-b-2",
											arrangeMode
												? "border-(--stuic-input-accent) text-(--stuic-input-accent)"
												: "border-transparent stuic-field-options-muted"
										)}
									>
										{@html t("arrange_tab", { value: selected.items.length })}
									</button>
								</div>

								<!-- modal close lives in the tab header whenever tabs exist (both screens).
								Absolutely positioned + height-matched row, so it never causes a jump. -->
								<div class="absolute inset-y-0 right-1 flex items-center">
									<Button
										x
										size="sm"
										variant="ghost"
										roundedFull
										type="button"
										tooltip={t("close")}
										onclick={(e) => {
											e.preventDefault();
											escape();
											modalDialog.close();
										}}
									/>
								</div>
							</div>
						{/if}
					{/snippet}

					<input
						bind:value={innerValue}
						bind:this={input}
						{type}
						{id}
						class={twMerge(renderSize, classInput, arrangeMode && "hidden")}
						tabindex={1}
						{required}
						{disabled}
						placeholder={searchPlaceholder ??
							t(allowUnknown ? "search_submit_placeholder" : "search_placeholder")}
						onkeydown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								try_submit();
							}
						}}
						autocomplete="off"
						aria-controls={`${id}-options`}
						name={`field-${id}`}
						{...rest}
					/>

					{#snippet inputBelow()}
						<div
							class={twMerge("h-full p-2", !arrangeMode && "border-t")}
							style="border-color: var(--stuic-field-options-divider);"
						>
							{#snippet footerSubmitBtn()}
								<div>
									<Button
										class="control"
										type="button"
										intent="primary"
										onclick={async (e) => {
											e.preventDefault();
											try_submit(true);
										}}
										tabindex={3}
									>
										{@html t("submit")}
									</Button>
								</div>
							{/snippet}

							{#if canArrange && arrangeMode}
								<!-- ARRANGE screen: reorder the current selection (buttons only, no drag) -->
								<div class="text-sm -mt-1 flex items-center">
									<button
										type="button"
										onclick={sortAZ}
										disabled={selected.items.length < 2}
										class="control flex items-center p-1 m-1 text-sm underline rounded stuic-field-options-control"
										tabindex={4}
									>
										{@html t("sort_az")}
									</button>
									<button
										type="button"
										onclick={reverse}
										disabled={selected.items.length < 2}
										class="control flex items-center p-1 m-1 text-sm underline rounded stuic-field-options-control"
										tabindex={5}
									>
										{@html t("reverse")}
									</button>
									<span
										class="flex-1 block justify-end text-right text-xs p-1 pr-2 stuic-field-options-muted"
									>
										{selected.items.length}
										{#if cardinality > 0 && cardinality < Infinity}
											{@html t("cardinality_of")} {cardinality}
										{/if}
										{@html t("cardinality_selected")}
									</span>
								</div>

								<div
									class={[
										"options overflow-y-auto overflow-x-hidden space-y-1 scrollbar-thin",
										"h-55 max-h-55",
									]}
									bind:this={arrangeListBox}
									tabindex="-1"
								>
									{#each selected.items as item, i (item[itemIdPropName])}
										{@const last = selected.items.length - 1}
										<div
											id={arrange_row_id(item[itemIdPropName])}
											class="flex items-center gap-1 px-1 py-0.5"
										>
											<span class="flex-1 min-w-0 truncate text-sm"
												>{_renderOptionLabel(item)}</span
											>
											<span class="hidden sm:inline-flex">
												<Button
													iconButton
													variant="ghost"
													type="button"
													aria-label={t("move_to_top")}
													tooltip={t("move_to_top")}
													data-arrange-btn="top"
													disabled={i === 0}
													onclick={() => moveItem(i, 0)}
												>
													{@html iconArrowUpToLine({ size: 18 })}
												</Button>
											</span>
											<Button
												iconButton
												variant="ghost"
												type="button"
												aria-label={t("move_up")}
												tooltip={t("move_up")}
												data-arrange-btn="up"
												disabled={i === 0}
												onclick={() => moveItem(i, i - 1)}
											>
												{@html iconChevronUp({ size: 18 })}
											</Button>
											<Button
												iconButton
												variant="ghost"
												type="button"
												aria-label={t("move_down")}
												tooltip={t("move_down")}
												data-arrange-btn="down"
												disabled={i === last}
												onclick={() => moveItem(i, i + 1)}
											>
												{@html iconChevronDown({ size: 18 })}
											</Button>
											<span class="hidden sm:inline-flex">
												<Button
													iconButton
													variant="ghost"
													type="button"
													aria-label={t("move_to_bottom")}
													tooltip={t("move_to_bottom")}
													data-arrange-btn="bottom"
													disabled={i === last}
													onclick={() => moveItem(i, last)}
												>
													{@html iconArrowDownToLine({ size: 18 })}
												</Button>
											</span>
											<Button
												iconButton
												variant="ghost"
												type="button"
												aria-label={t("remove_item")}
												tooltip={t("remove_item")}
												data-arrange-btn="remove"
												onclick={() => removeItem(i)}
											>
												{@html iconTrash({ size: 18 })}
											</Button>
										</div>
									{/each}
								</div>

								<div class="pt-3 pl-1 flex items-end justify-between">
									<div class="text-xs stuic-field-options-muted">
										{@html t("arrange_help")}
									</div>
									{@render footerSubmitBtn()}
								</div>
							{:else}
								<div class="text-sm -mt-1 flex items-center">
									{#if isMultiple}
										<button
											type="button"
											onclick={() => _selectedColl.addMany(options.items)}
											class="control flex items-center p-1 m-1 text-sm underline rounded stuic-field-options-control"
											tabindex={4}
											disabled={!options.size}
										>
											{@html t("select_all")}
										</button>
									{/if}
									<button
										type="button"
										onclick={() => {
											_selectedColl.clear();
											input?.focus();
										}}
										class="control flex items-center p-1 m-1 text-sm underline rounded stuic-field-options-control"
										data-disabled={!selected.items.length || undefined}
										tabindex={5}
										disabled={!selected.items.length}
									>
										{@html t(cardinality === 1 ? "clear" : "clear_all")}
									</button>

									<span class="p-1 m-1 text-sm">&nbsp;</span>
									<span
										class="flex-1 block justify-end text-right text-xs p-1 pr-2 stuic-field-options-muted"
									>
										{selected.items.length}
										{#if cardinality > 0 && cardinality < Infinity}
											{@html t("cardinality_of")} {cardinality}
										{/if}
										{@html t("cardinality_selected")}
									</span>
								</div>

								<!-- {#if options.items.length} -->
								<div
									id={`${id}-options`}
									class={[
										"options overflow-y-auto overflow-x-hidden space-y-1 scrollbar-thin",
										"h-55 max-h-55",
									]}
									bind:this={optionsBox}
									tabindex="-1"
								>
									{#if isFetching && !options.items.length}
										<div
											class="flex text-sm h-full items-center justify-center stuic-field-options-placeholder"
										>
											<Spinner class="w-4" />
										</div>
									{:else if !options.items.length && !allowUnknown}
										<div
											class="flex text-sm h-full items-center justify-center stuic-field-options-placeholder"
										>
											{@html t("no_results")}
										</div>
									{/if}

									{#if !isFetching && allowUnknown && innerValue && !have_option_label_like(options.items, innerValue)}
										<div class="px-1">
											<ListItemButton
												bind:el={addNewBtn}
												onclick={add_new}
												focused={isAddNewBtnActive}
												class={classOption}
												classFocused={classOptionActive}
											>
												{t("add_new", { value: innerValue })}
											</ListItemButton>
										</div>
									{/if}

									{#each groupedOptions as [_optgroup, _opts]}
										{#if _optgroup}
											<div
												class={twMerge(
													"mb-1 p-1 text-xs font-semibold uppercase tracking-wide stuic-field-options-optgroup",
													classOptgroup
												)}
											>
												{_optgroup}
											</div>
										{/if}
										<ul role="presentation" class="space-y-1">
											<!-- {#each options.items as item} -->
											{#each _opts as item (item[itemIdPropName])}
												{@const active =
													item[itemIdPropName] === options.active?.[itemIdPropName]}
												{@const isSelected =
													selected.items && _selectedColl.exists(item[itemIdPropName])}
												<li class:active role="presentation" class="px-1">
													<ListItemButton
														id={btn_id(item[itemIdPropName])}
														onclick={() => {
															if (isMultiple) {
																if (selected.isFull && !_selectedColl.exists(item)) {
																	return notifications?.error(t("cardinality_full"), {
																		ttl: 1000,
																	});
																}
																_selectedColl.toggleAdd(item);
															} else {
																_selectedColl.clear();
																_selectedColl.add(item);
																submit();
															}
														}}
														active={isSelected}
														focused={active}
														contentBefore={showIcons ? getIconThc(isSelected) : undefined}
														classContentBefore={isSelected
															? "stuic-field-options-icon stuic-field-options-icon--selected"
															: "stuic-field-options-icon"}
														class={classOption}
														classActive={classOptionActive}
														classFocused={classOptionActive}
														tabindex={-1}
														role={isMultiple ? "checkbox" : "radio"}
														aria-checked={isSelected}
													>
														{_renderOptionLabel(item)}
													</ListItemButton>
												</li>
											{/each}
										</ul>
									{/each}
								</div>
								<!-- {/if} -->
								<div class="pt-3 pl-1 flex items-end justify-between">
									<div class="text-xs stuic-field-options-muted">
										<!-- Use arrows to navigate. Spacebar and Enter to select and/or submit. -->
										{#if allowUnknown}
											{@html t("unknown_allowed")}
										{:else}
											{@html t("unknown_not_allowed")}
										{/if}
									</div>
									<div>
										<Button
											class="control"
											type="button"
											intent="primary"
											onclick={async (e) => {
												e.preventDefault();
												try_submit(true);
											}}
											tabindex={3}
										>
											{@html t("submit")}
										</Button>
									</div>
								</div>
							{/if}
						</div>
					{/snippet}

					{#snippet inputAfter()}
						<!-- the whole search row is hidden on the Arrange screen (close moves to the tabs) -->
						{#if !arrangeMode}
							<div
								class="flex pl-2 items-center justify-center stuic-field-options-placeholder"
							>
								{#if isFetching}
									<Spinner class="w-4" />
								{/if}
							</div>
							<!-- ordered fields have a single close ✕ in the tab header, so the
							search row drops its own ✕ (avoids a confusing double-✕) -->
							{#if !canArrange}
								<div class="flex pl-2 pr-1 items-center justify-center">
									<Button
										x
										variant="ghost"
										roundedFull
										type="button"
										tooltip={t("x_close")}
										onclick={(e) => {
											e.preventDefault();
											if (innerValue.trim() == "") {
												escape();
												return modalDialog.close();
											}
											innerValue = "";
											input?.focus();
										}}
										tabindex={2}
									/>
								</div>
							{/if}
						{/if}
					{/snippet}

					{#snippet inputBefore()}
						{#if !arrangeMode}
							<div
								class="flex flex-col items-center justify-center pl-3 stuic-field-options-muted"
							>
								{@html iconSearch({ size: 19 })}
							</div>
						{/if}
					{/snippet}
				</InputWrap>
			</div>
		</div>
	</ModalDialog>
</div>

<style>
	div.options {
		scrollbar-width: thin;
	}
</style>
