<script lang="ts" module>
	import { createClog } from "@marianmeres/clog";
	import { iconSearch, iconCheck, iconCircle, iconSquare } from "$lib/icons/index.js";
	import { ItemCollection, type Item } from "@marianmeres/item-collection";
	import { Debounced, watch } from "runed";
	import { onDestroy, tick, type Snippet } from "svelte";
	import { tooltip } from "../../actions/index.js";
	import { type ValidateOptions } from "../../actions/validate.svelte.js";
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

	export interface Option {
		label: string;
		value: any;
	}

	type SnippetWithId = Snippet<[{ id: string }]>;

	export interface Props extends Record<string, any> {
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
		classInput?: string;
		classLabel?: string;
		classLabelBox?: string;
		classInputBox?: string;
		classInputBoxWrap?: string;
		classDescBox?: string;
		classBelowBox?: string;
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
			select_all: "Select results",
			clear_all: "Clear selected",
			clear: "Clear",
			search_placeholder: "Type to search...",
			search_submit_placeholder: "Type to search and submit...",
			cardinality_full: "Max selection reached",
			select_from_list: "Please select from the list only",
			x_close: "Clear input or close [esc]",
			unknown_allowed: "Select or type and submit",
			unknown_not_allowed: "Select from the list",
			no_results: "No results found.",
			add_new: 'Add "{{value}}"...',
			click_add_new: "You must add the value to continue",
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
		validate,
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
		classDescBox,
		classBelowBox,
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
	let innerValue = $state("");
	let isFetching = $state(false);
	let isUnmounted = false;
	onDestroy(() => {
		isUnmounted = true;
	});
	let cardinality = $derived(_cardinality === -1 ? Infinity : _cardinality);
	let isMultiple = $derived(cardinality > 1);
	let showIcons = $derived(isMultiple ? showIconsCheckbox : showIconsRadio);

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
			return (validate as any)?.customValidator?.(value, context, el) || "";
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
		if (isMultiple) {
			return { html: isSelected ? iconCheckboxCheck() : iconCheckboxEmpty() };
		}
		return { html: isSelected ? iconRadioCheck() : iconRadioEmpty() };
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
		_selectedColl.configure({ cardinality });
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

	$effect(() => {
		if (modalDialog.visibility().visible && touch) {
			_selectedColl.clear().addMany(maybeJsonParse(value) as Item[]);
			// IMPORTANT: focus first selected so it scrolls into view on open
			if (_selectedColl.size) {
				waitForNextRepaint().then(() => {
					if (!isUnmounted) _optionsColl.setActive(_selectedColl.items[0]);
				});
			}
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
		_optionsColl.clear();
		modalDialog.close();
		_dispatch_change_to_owner();
		onChange?.(value);
	}

	// clears state and dispatches change; close is handled by ModalDialog's preEscapeClose
	function escape() {
		innerValue = "";
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
		if (modalDialog.visibility().visible) {
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
			{classDescBox}
			{classBelowBox}
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
					extra = `, ... <span class="text-sm opacity-75">(+${(origLength - limit)})</span>`;
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
		class="w-full max-w-2xl bg-transparent pointer-events-none"
		ariaLabelledby={id}
		{noScrollLock}
	>
		<div class="pt-0 md:pt-[20vh] w-full">
			<div class="pointer-events-auto">
				<InputWrap
					size={renderSize}
					class={twMerge("m-2 mb-12 shadow-xl", classModalField)}
					classInputBoxWrap={twMerge(
						// always look like focused
						`border border-(--stuic-input-accent)`,
						`ring-(--stuic-input-accent)/20 ring-4`
					)}
					{id}
					{required}
				>
					<input
						bind:value={innerValue}
						bind:this={input}
						{type}
						{id}
						class={twMerge(renderSize, classInput)}
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
						<div class="h-full border-t p-2 border-black/20">
							<div class="text-sm -mt-1 flex items-center">
								{#if isMultiple}
									<button
										type="button"
										onclick={() => _selectedColl.addMany(options.items)}
										class={twMerge(
											"control flex items-center p-1 m-1 text-sm opacity-75 underline rounded",
											"hover:opacity-100 focus-visible:outline-neutral-400 focus-visible:opacity-100"
										)}
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
									class={twMerge(
										"control flex items-center p-1 m-1 text-sm opacity-75 underline rounded",
										"hover:opacity-100 focus-visible:outline-neutral-400 focus-visible:opacity-100"
									)}
									class:opacity-20={!selected.items.length}
									tabindex={5}
									disabled={!selected.items.length}
								>
									{@html t(cardinality === 1 ? "clear" : "clear_all")}
								</button>

								<span class="p-1 m-1 text-sm">&nbsp;</span>
								<span
									class="flex-1 block justify-end opacity-75 text-right text-xs p-1 pr-2"
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
									<div class="flex opacity-50 text-sm h-full items-center justify-center">
										<Spinner class="w-4" />
									</div>
								{:else if !options.items.length && !allowUnknown}
									<div class="flex opacity-50 text-sm h-full items-center justify-center">
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
												"mb-1 p-1 text-xs font-semibold uppercase tracking-wide",
												"text-neutral-500 dark:text-neutral-400",
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
													classContentBefore={isSelected ? "opacity-100" : "opacity-50"}
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
							<div class="p-2 px-3 flex items-end justify-between">
								<div class="text-xs opacity-75">
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
						</div>
					{/snippet}

					{#snippet inputAfter()}
						<div class="flex pl-2 items-center justify-center opacity-50">
							{#if isFetching}
								<Spinner class="w-4" />
							{/if}
						</div>
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
					{/snippet}

					{#snippet inputBefore()}
						<div class="flex flex-col items-center justify-center pl-3 opacity-75">
							{@html iconSearch({ size: 19, strokeWidth: 3 })}
						</div>
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
