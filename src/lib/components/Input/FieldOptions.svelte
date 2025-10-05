<script lang="ts" module>
	import { createClog } from "@marianmeres/clog";
	import { iconBsSearch } from "@marianmeres/icons-fns/bootstrap/iconBsSearch.js";
	import { iconLucideCheck } from "@marianmeres/icons-fns/lucide/iconLucideCheck.js";
	import { iconLucideCircle } from "@marianmeres/icons-fns/lucide/iconLucideCircle.js";
	import { iconLucideSquare } from "@marianmeres/icons-fns/lucide/iconLucideSquare.js";
	import { ItemCollection, type Item } from "@marianmeres/item-collection";
	import { Debounced, watch } from "runed";
	import { tick, type Snippet } from "svelte";
	import { tooltip } from "../../actions/index.js";
	import { type ValidateOptions } from "../../actions/validate.svelte.js";
	import { getId } from "../../utils/get-id.js";
	import { maybeJsonParse } from "../../utils/maybe-json-parse.js";
	import { waitForNextRepaint } from "../../utils/paint.js";
	import { qsa } from "../../utils/qsa.js";
	import { strHash } from "../../utils/str-hash.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import Button from "../Button/Button.svelte";
	import Modal from "../Modal/Modal.svelte";
	import { NotificationsStack } from "../Notifications/index.js";
	import Spinner from "../Spinner/Spinner.svelte";
	import type { THC } from "../Thc/Thc.svelte";
	import X from "../X/X.svelte";
	import InputWrap from "./_internal/InputWrap.svelte";
	import FieldLikeButton from "./FieldLikeButton.svelte";
	import { replaceMap } from "../../utils/replace-map.js";
	import { isPlainObject } from "../../utils/is-plain-object.js";
	import type { TranslateFn } from "../../types.js";

	export interface Option {
		label: string;
		value: any;
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
			search_submit_placeholder: "Type to search and/or submit...",
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

	const iconCheckboxEmpty = iconLucideSquare;
	const iconCheckboxCheck = iconLucideCheck;

	const iconRadioEmpty = iconLucideCircle;
	const iconRadioCheck = iconLucideCheck;

	type SnippetWithId = Snippet<[{ id: string }]>;

	interface Props extends Record<string, any> {
		trigger?: Snippet<[{ value: string; modal: Modal }]>;
		input?: HTMLInputElement;
		value: string;
		label?: SnippetWithId | THC;
		type?: string;
		description?: SnippetWithId | THC;
		class?: string;
		id?: string;
		tabindex?: number; // tooShort
		renderSize?: "sm" | "md" | "lg" | string;
		useTrim?: boolean;
		//
		required?: boolean;
		disabled?: boolean;
		//
		validate?: boolean | Omit<ValidateOptions, "setValidationResult">;
		// wrap snippets
		labelAfter?: SnippetWithId | THC;
		below?: SnippetWithId | THC;
		//
		labelLeft?: boolean;
		labelLeftWidth?: "normal" | "wide";
		labelLeftBreakpoint?: number;
		//
		classInput?: string;
		classLabel?: string;
		classLabelBox?: string;
		classInputBox?: string;
		classInputBoxWrap?: string;
		classDescBox?: string;
		classBelowBox?: string;
		//
		classOption?: string;
		classOptionActive?: string;
		classOptgroup?: string;
		//
		classModalField?: string;
		noScrollLock?: boolean;
		//
		style?: string;
		t?: TranslateFn;
		//
		renderValue?: (strigifiedItems: string) => string;
		getOptions: (
			q: string,
			current: Item[]
		) => Promise<{ coll?: ItemCollection<Item>; found: Item[] }>;
		notifications?: NotificationsStack;
		// -1 no limit
		// +n max selected limit
		cardinality?: number;
		renderOptionLabel?: (item: Item) => string;
		renderOptionGroup?: (s: string) => string;
		// whether to allow adding unknown options
		allowUnknown?: boolean;
		showIconsCheckbox?: boolean;
		showIconsRadio?: boolean;
		searchPlaceholder?: string;
		name: string;
		itemIdPropName?: string;
		// for custom stuff...
		onChange?: (value: string) => void;
	}

	let {
		trigger,
		input = $bindable(),
		value = $bindable(), //
		label = "",
		id = getId(),
		type = "text",
		tabindex = 0,
		description,
		class: classProp,
		renderSize = "md",
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

	let modal: Modal = $state()!;
	let innerValue = $state("");
	let isFetching = $state(false);
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

	function sortFn(a: Item, b: Item) {
		const withOptGroup = (i: Item) => `${i.optgroup || ""}__${_renderOptionLabel(i)}`;
		return withOptGroup(a).localeCompare(withOptGroup(b), undefined, {
			sensitivity: "base",
		});
	}

	// let's have two distinct collections for the job, they are independent on each other
	// first, the all available options
	const _optionsColl = new ItemCollection([], {
		allowNextPrevCycle: false,
		sortFn,
		idPropName: itemIdPropName,
		searchable: { getContent: (item) => _renderOptionLabel(item) },
	});

	// second, the selected ones
	const _selectedColl = new ItemCollection([], {
		// svelte-ignore state_referenced_locally
		cardinality,
		sortFn,
		idPropName: itemIdPropName,
	});

	// reconfigure if the prop ever changes during runtime (most likely will NOT)
	$effect(() => {
		_selectedColl.configure({ cardinality });
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

	// $inspect("options", options);
	// $inspect("selected", selected);
	// $inspect("lastQuery", lastQuery, innerValue);

	// hidden input which holds the final value (upon which validation happens)
	let parentHiddenInputEl: HTMLInputElement | undefined = $state();

	let activeEl: HTMLButtonElement | undefined = $state();
	let optionsBox: HTMLDivElement | undefined = $state();
	let modalEl: HTMLDivElement | undefined = $state();

	// add_new dance...
	let addNewBtn: HTMLButtonElement | undefined = $state();
	let isAddNewBtnActive = $state(false);

	// set value on open
	watch(
		() => modal.visibility().visible,
		(isVisible, wasVisible) => {
			// modal was just opened
			if (!wasVisible && isVisible) {
				_selectedColl.clear().addMany(maybeJsonParse(value));
				// IMPORTANT: focus first selected so it scrolls into view on open
				if (_selectedColl.size) {
					waitForNextRepaint().then(() => {
						_optionsColl.setActive(_selectedColl.items[0]);
					});
				}
			}
		}
	);

	// scroll the active option into view
	$effect(() => {
		if (modal.visibility().visible && options.active?.[itemIdPropName]) {
			activeEl = qsa(`#${btn_id(options.active[itemIdPropName])}`, optionsBox)[0] as any;
			activeEl?.scrollIntoView({ behavior: "smooth", block: "center" });
			activeEl?.focus();
		} else {
			activeEl = undefined;
		}
	});

	// suggest options as a typeahead feature
	const debounced = new Debounced(() => innerValue, 150);
	watch(
		[() => modal.visibility().visible, () => debounced.current],
		([isVisible, currVal]) => {
			if (!isVisible) return;
			isFetching = true;
			getOptions(currVal, selected.items)
				.then((res) => {
					const { found, coll } = res;

					// always update the existing with recent server data
					_selectedColl.patchMany(found);
					// continue normally, with (server) provided options...
					_optionsColl.clear().addMany(found);
				})
				.catch((e) => {
					console.error(e);
					notifications?.error(`${e}`);
				})
				.finally(() => (isFetching = false));
		}
	);

	// internal DRY
	function btn_id(id: string | number, prefix = "btn-") {
		return prefix + strHash(`${id}`.repeat(3));
	}

	// "inner" submit
	function try_submit(force = false) {
		// clog("try_submit", innerValue);
		if (innerValue) {
			let found = have_option_label_like(_optionsColl.items, innerValue);
			if (!found && !allowUnknown) {
				return notifications?.error(t("select_from_list"), { ttl: 1000 });
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
		modal.close();
		_dispatch_change_to_owner();
		onChange?.(value);
	}

	// clears, closes, submits nothing
	function escape() {
		innerValue = "";
		_optionsColl.clear();
		modal?.close();
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

	const BTN_CLS = [
		"no-focus-visible",
		"text-left rounded-md py-2 px-2.5 flex items-center space-x-2",
		"w-full",
		"border border-transparent",
		"focus:outline-0 focus:border-neutral-400 dark:focus:border-neutral-500",
		"focus-visible:outline-0 focus-visible:ring-0",
		"hover:border-neutral-400 dark:hover:border-neutral-500",
	];

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
		if (modal.visibility().visible) {
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
		{@render trigger({ value, modal })}
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
					extra = `, ... <span class="text-sm opacity-50">(+${(origLength - limit)})</span>`;
				}
				return vals.map(_renderOptionLabel).join(", ") + extra;
			} catch (e) {
				clog.warn(e);
				return `${e}`; // either invalid json or not array...
			}
			}}
			onclick={modal?.open}
		/>
	{/if}

	<Modal
		bind:this={modal}
		onEscape={escape}
		class="bg-transparent dark:bg-transparent"
		classInner="max-w-2xl"
		bind:el={modalEl}
		{noScrollLock}
	>
		<InputWrap
			size={renderSize}
			class={twMerge("m-2 mb-12 shadow-xl", classModalField)}
			classInputBoxWrap={twMerge(
				// always look like focused
				`border border-input-accent dark:border-input-accent-dark`,
				`ring-input-accent/20 dark:ring-input-accent-dark/20 ring-4`
			)}
			{id}
			{required}
		>
			<input
				bind:value={innerValue}
				bind:this={input}
				{type}
				{id}
				class={twMerge("form-input", renderSize, classInput)}
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
				name={`rand-${Math.random().toString(36).slice(2)}`}
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
									"control flex items-center p-1 m-1 text-xs opacity-75 underline rounded",
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
								"control flex items-center p-1 m-1 text-xs opacity-75 underline rounded",
								"hover:opacity-100 focus-visible:outline-neutral-400 focus-visible:opacity-100"
							)}
							class:opacity-20={!selected.items.length}
							tabindex={5}
							disabled={!selected.items.length}
						>
							{@html t(cardinality === 1 ? "clear" : "clear_all")}
						</button>

						<span class="p-1 m-1 text-xs">&nbsp;</span>
						<span class="flex-1 block justify-end opacity-50 text-right text-xs p-1 pr-2">
							{selected.items.length}
							{#if cardinality > 0 && cardinality < Infinity}
								{@html t("cardinality_of")} {cardinality}
							{/if}
							{@html t("cardinality_selected")}
						</span>
					</div>

					<!-- {#if options.items.length} -->
					<div
						class={[
							"options overflow-y-auto overflow-x-hidden space-y-1",
							"h-[220px] max-h-[220px]",
						]}
						bind:this={optionsBox}
						tabindex="-1"
					>
						{#if isFetching && !options.items.length}
							<!-- <div class="p-4 opacity-50"> -->
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
								<button
									type="button"
									bind:this={addNewBtn}
									onclick={add_new}
									class={twMerge(
										BTN_CLS,
										classOption,
										isAddNewBtnActive && classOptionActive
									)}
								>
									{t("add_new", { value: innerValue })}
								</button>
							</div>
						{/if}

						{#each _normalize_and_group_options(options.items) as [_optgroup, _opts]}
							{#if _optgroup}
								<div
									class={twMerge(
										"text-xs capitalize opacity-50 border-b border-black/10 mb-0.5 p-1 mx-1",
										classOptgroup
									)}
								>
									{_optgroup}
								</div>
							{/if}
							<ul class="space-y-0.5">
								<!-- {#each options.items as item} -->
								{#each _opts as item (item[itemIdPropName])}
									{@const active =
										item[itemIdPropName] === options.active?.[itemIdPropName]}
									{@const isSelected =
										selected.items && _selectedColl.exists(item[itemIdPropName])}
									<li class:active class="px-1">
										<button
											type="button"
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
											class:active
											class:selected={isSelected}
											class={twMerge(
												BTN_CLS,
												isSelected && "bg-neutral-200 dark:bg-neutral-800",
												classOption,
												// active && "border-neutral-400",
												active && classOptionActive
											)}
											tabindex="-1"
											role="checkbox"
											aria-checked={isSelected}
										>
											{#if showIcons}
												<span class={isSelected ? "opacity-100" : "opacity-25"}>
													{#if isMultiple}
														{#if isSelected}
															{@html iconCheckboxCheck()}
														{:else}
															{@html iconCheckboxEmpty()}
														{/if}
													{:else if isSelected}
														{@html iconRadioCheck()}
													{:else}
														{@html iconRadioEmpty()}
													{/if}
												</span>
											{/if}
											<span
												class={twMerge(
													"min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
												)}>{_renderOptionLabel(item)}</span
											>
										</button>
									</li>
								{/each}
							</ul>
						{/each}
					</div>
					<!-- {/if} -->
					<div class="p-2 px-3 flex items-end justify-between">
						<div class="text-xs opacity-50">
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
								variant="primary"
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
					<button
						type="button"
						class={twMerge(
							"opacity-50 rounded",
							"hover:opacity-100 hover:bg-neutral-200 dark:hover:bg-neutral-800",
							"focus-visible:opacity-100 focus-visible:outline-0",
							"focus-visible:bg-neutral-200 dark:focus-visible:bg-neutral-800"
						)}
						use:tooltip
						aria-label={t("x_close")}
						onclick={(e) => {
							e.preventDefault();
							if (innerValue.trim() == "") {
								return escape();
							}
							innerValue = "";
							input?.focus();
						}}
						tabindex={2}
					>
						<X class="m-2 size-4 " />
					</button>
				</div>
			{/snippet}

			{#snippet inputBefore()}
				<div class="flex flex-col items-center justify-center pl-3 opacity-50">
					{@html iconBsSearch({ size: 14 })}
				</div>
			{/snippet}
		</InputWrap>
	</Modal>
</div>

<style>
	ul.options {
		scrollbar-width: thin;
	}
</style>
