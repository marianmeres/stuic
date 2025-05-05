<script lang="ts" module>
	export interface Option {
		label: string;
		value: any;
	}

	// i18n ready
	function t_default(k: string) {
		const m: Record<string, string> = {
			field_req_att: "This field requires attention. Please review and try again.",
			cardinality_of: "of",
			cardinality_selected: "selected",
			submit: "Submit",
			select_all: "Select all",
			clear_all: "Clear all",
			search_placeholder: "Type to search...",
			cardinality_full: "Max selection reached",
			select_from_list: "Please select from the list",
			x_close: "Clear input or close [esc]",
			unknown_allowed: "Select from the list or type and submit any value",
			unknown_not_allowed: "Select values from the list only",
		};
		return m[k] ?? k;
	}
</script>

<script lang="ts">
	import { createClog } from "@marianmeres/clog";
	import { iconBsSearch } from "@marianmeres/icons-fns/bootstrap/iconBsSearch.js";
	import { iconLucideCheck } from "@marianmeres/icons-fns/lucide/iconLucideCheck.js";
	import { iconLucideCircle } from "@marianmeres/icons-fns/lucide/iconLucideCircle.js";
	import { iconLucideSquare } from "@marianmeres/icons-fns/lucide/iconLucideSquare.js";
	import { ItemCollection, type Item } from "@marianmeres/item-collection";
	import { Debounced, watch } from "runed";
	import { type Snippet } from "svelte";
	import { tooltip } from "../../actions/index.js";
	import { type ValidateOptions } from "../../actions/validate.svelte.js";
	import { getId } from "../../utils/get-id.js";
	import { maybeJsonParse } from "../../utils/maybe-json-parse.js";
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
	import { waitForNextRepaint } from "../../utils/paint.js";

	const clog = createClog("FieldOptions");

	const iconCheckboxEmpty = iconLucideSquare;
	const iconCheckboxCheck = iconLucideCheck;

	const iconRadioEmpty = iconLucideCircle;
	const iconRadioCheck = iconLucideCheck;

	type SnippetWithId = Snippet<[{ id: string }]>;

	interface Props extends Record<string, any> {
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
		//
		classModalField?: string;
		//
		style?: string;
		t?: (key: string) => string;
		//
		renderValue?: (strigifiedItems: string) => string;
		getOptions: (s: string, current: Item[]) => Promise<Item[]>;
		notifications?: NotificationsStack;
		// -1 no limit
		// +n max selected limit
		cardinality?: number;
		renderOptionLabel?: (item: Item) => string;
		// whether to allow adding unknown options
		allowUnknown?: boolean;
		showIcons?: boolean;
		searchPlaceholder?: string;
		name: string;
		itemIdPropName?: string;
	}

	let {
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
		//
		style,
		//
		classModalField,
		t = t_default,
		//
		renderValue,
		getOptions,
		notifications,
		cardinality = Infinity,
		renderOptionLabel,
		allowUnknown = false,
		showIcons = true,
		searchPlaceholder,
		name,
		itemIdPropName = "id",
		...rest
	}: Props = $props();

	let modal: Modal = $state()!;
	let innerValue = $state("");
	let isFetching = $state(false);
	let isMultiple = $derived(cardinality > 1);

	//
	let wrappedValidate: Omit<ValidateOptions, "setValidationResult"> = $derived({
		enabled: true,
		customValidator(value: any, context: Record<string, any> | undefined, el: any) {
			// NOTE: the below error message code will be ignore, so it's just cosmetics
			// built in JSON array validator which cannot be bypassed
			let selected = [];
			try {
				selected = JSON.parse(value);
				if (!Array.isArray(selected)) return "typeMismatch";
			} catch (e) {
				return "typeMismatch";
			}
			// cardinality check
			if (selected.length > cardinality) {
				return "rangeOverflow";
			}

			// continue with provided validator
			return (validate as any)?.customValidator?.(value, context, el) || "";
		},
		t(reason: keyof ValidityStateFlags, value: any, fallback: string) {
			// Unfortunately, with a hidden field, everything here is a `customError` reason.
			// So, we must generalize...
			return t("field_req_att");
		},
	});

	function _renderOptionLabel(item: Item): string {
		return renderOptionLabel?.(item) || `${item[itemIdPropName]}`;
	}

	function sortFn(a: Item, b: Item) {
		return _renderOptionLabel(a).localeCompare(_renderOptionLabel(b), undefined, {
			sensitivity: "base",
		});
	}

	// let's have two distinct collections for the job
	// first, the all available options
	const _optionsColl = new ItemCollection([], {
		allowNextPrevCycle: false,
		sortFn,
		idPropName: itemIdPropName,
		searchable: { getContent: (item) => _renderOptionLabel(item) },
	});

	const _selectedColl = new ItemCollection([], {
		cardinality,
		sortFn,
		idPropName: itemIdPropName,
	});

	// now, create the reactive, subscribed variants
	let options = $derived($_optionsColl);
	let selected = $derived($_selectedColl);
	// $inspect("options", options);
	// $inspect("selected", selected);

	let activeEl: HTMLButtonElement | undefined = $state();
	let optionsBox: HTMLUListElement | undefined = $state();
	let modalEl: HTMLDivElement | undefined = $state();

	// set value on open
	watch(
		() => modal.visibility().visible,
		(isVisible, wasVisible) => {
			// modal was just opened
			if (!wasVisible && isVisible) {
				const parsed = maybeJsonParse(value);
				_selectedColl.clear().addMany(parsed);
				// IMPORTANT: focus first selected so it scrolls into view on open
				if (_selectedColl.size) {
					waitForNextRepaint().then(() => {
						_optionsColl.setActive(_selectedColl.items[0]);
					});
				}
			}
		}
	);

	//
	$effect(() => {
		if (modal.visibility().visible && options.active?.[itemIdPropName]) {
			activeEl = qsa(`#${btnId(options.active[itemIdPropName])}`, optionsBox)[0] as any;
			activeEl?.scrollIntoView({ behavior: "smooth", block: "center" });
			activeEl?.focus();
		} else {
			activeEl = undefined;
		}
	});
	// $inspect(activeEl, options.active?.id);

	//
	const debounced = new Debounced(() => innerValue, 200);
	watch(
		[() => modal.visibility().visible, () => debounced.current],
		([isVisible, currVal]) => {
			if (!isVisible) return;
			isFetching = true;
			getOptions(currVal, selected.items)
				.then((res) => {
					// always update the existing with recent server data
					_selectedColl.patchMany(res);

					// continue normally, with (server) provided options...
					_optionsColl.clear().addMany(res);
				})
				.catch((e) => {
					console.error(e);
					notifications?.error(`${e}`);
				})
				.finally(() => (isFetching = false));
		}
	);

	function btnId(id: string | number, prefix = "btn-") {
		return prefix + strHash(`${id}`.repeat(3));
	}

	// this will set the outer bound value and close modal... further process is left on the consumer
	function submit() {
		// sets the opener's value (always strings);
		clog("modal submit", $state.snapshot(selected.items));
		value = JSON.stringify(selected.items);
		innerValue = "";
		_optionsColl.clear();
		modal.close();
	}

	/** cleans, closes, submits nothing */
	function escape() {
		innerValue = "";
		_optionsColl.clear();
		// _selectedColl.clear();
		modal?.close();
	}

	function toggleAdd(item: Item) {
		try {
			return _selectedColl.toggleAdd(item);
		} catch (e) {
			notifications?.error(`${e}`);
		}
	}

	function selectOne(item: Item, resetPrevious = true) {
		try {
			if (resetPrevious) _selectedColl.clear();
			_selectedColl.add(item);
			return true;
		} catch (e) {
			notifications?.error(`${e}`);
		}
		return false;
	}

	function selectMany(items: Item[]) {
		try {
			_selectedColl.addMany(items);
			return true;
		} catch (e) {
			notifications?.error(`${e}`);
		}
		return false;
	}
</script>

<!-- this must (?) be on window as we're catching any typing to focus -->
<svelte:window
	onkeydown={(e) => {
		if (modal.visibility().visible) {
			if (["ArrowDown", "ArrowUp"].includes(e.key)) {
				e.preventDefault();

				if (e.key === "ArrowUp") {
					e.metaKey ? _optionsColl.first() : _optionsColl.previous();
				} else if (e.key === "ArrowDown") {
					e.metaKey ? _optionsColl.last() : _optionsColl.next();
				}

				// convention: radios are selected by arrows
				if (!isMultiple && _optionsColl.active) {
					_selectedColl.clear().add(_optionsColl.active!);
				}
			} else if (!["Tab", " ", "Enter"].includes(e.key)) {
				input?.focus();
			}
		}
	}}
/>

<!-- must wrap both -->
<div>
	<FieldLikeButton
		bind:value
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
			// prettier-ignore
			try {
				return JSON.parse(v).map(_renderOptionLabel).join(", ");
			} catch (e) {
				return `${e}`; // either invalid json or not array...
			}
		}}
		onclick={modal?.open}
	/>

	<Modal
		bind:this={modal}
		onEscape={escape}
		class="bg-transparent dark:bg-transparent"
		classInner="max-w-2xl"
		bind:el={modalEl}
	>
		<InputWrap
			size={renderSize}
			class={twMerge("m-4 mb-12 shadow-xl", classModalField)}
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
				placeholder={searchPlaceholder ?? t("search_placeholder")}
				onkeydown={(e) => {
					if (e.key === "Enter") {
						e.preventDefault();

						if (innerValue) {
							// doing label search, taking first result
							let found = _optionsColl.search(innerValue)?.[0];
							if (!found) {
								if (!allowUnknown) {
									return notifications?.error(t("select_from_list"), { ttl: 1000 });
								}
								found = { [itemIdPropName]: innerValue };
							}

							if (!isMultiple) {
								_selectedColl.clear();
							}

							// actual selection addon
							_selectedColl.add(found);

							// we might have added a new one, so add it to options as well
							// (will be noop if already exists)...
							if (allowUnknown) {
								_optionsColl.add(found);
								_optionsColl.setActive(found);
							}

							// maybe submit
							if (_selectedColl.isFull) submit();
						}
						// enter on empty input always submits
						else {
							submit();
						}
					}
				}}
				autocomplete="off"
				name={`rand-${Math.random().toString(36).slice(2)}`}
				{...rest}
			/>

			{#snippet inputBelow()}
				<div class="h-full border-t p-2 border-black/20">
					<!-- {JSON.stringify(selected.items)} -->
					<!-- {#if selected.items.length} -->
					<div class="text-sm -mt-1 flex items-center">
						{#if isMultiple}
							<button
								type="button"
								onclick={() => selectMany(options.items)}
								class={twMerge(
									"control flex items-center p-1 m-1 text-xs opacity-75 underline rounded",
									"hover:opacity-100 focus-visible:outline-neutral-400 focus-visible:opacity-100"
								)}
								tabindex={4}
							>
								{@html t("select_all")}
							</button>
						{/if}
						<!-- {#if selected.items.length} -->
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
							{@html t("clear_all")}
						</button>
						<!-- {/if} -->
						<span class="p-1 m-1 text-xs">&nbsp;</span>
						<span class="flex-1 block justify-end opacity-50 text-right text-xs p-1 pr-2">
							{selected.items.length}
							{#if cardinality > 0 && cardinality < Infinity}
								{@html t("cardinality_of")} {cardinality}
							{/if}
							{@html t("cardinality_selected")}
						</span>
					</div>
					<!-- {/if} -->

					<ul
						class={twMerge(
							"options block h-[250px] max-h-[250px] overflow-y-auto overflow-x-hidden space-y-1"
						)}
						bind:this={optionsBox}
						tabindex="-1"
					>
						{#each options.items as item}
							{@const active = item[itemIdPropName] === options.active?.[itemIdPropName]}
							{@const isSelected =
								selected.items && _selectedColl.exists(item[itemIdPropName])}
							<li class:active class="px-2">
								<button
									type="button"
									id={btnId(item[itemIdPropName])}
									onclick={() => {
										if (isMultiple) {
											if (selected.isFull && !_selectedColl.exists(item)) {
												return notifications?.error(t("cardinality_full"), { ttl: 1000 });
											}
											toggleAdd(item);
										} else {
											selectOne(item, true) && submit();
										}
									}}
									class:active
									class:selected={isSelected}
									class={twMerge(
										"no-focus-visible",
										"w-full text-left rounded-md py-2 px-2.5 flex items-center space-x-2",
										"text-ellipsis border border-transparent",
										"focus:outline-0 focus:border-neutral-400 dark:focus:border-neutral-500",
										"focus-visible:outline-0 focus-visible:ring-0",
										"hover:border-neutral-400 dark:hover:border-neutral-500",
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
									<span>{_renderOptionLabel(item)}</span>
								</button>
							</li>
						{/each}
					</ul>
					<div class="p-2 flex items-end justify-between">
						<div class="text-xs opacity-50">
							<!-- Use arrows to navigate. Spacebar to select. Enter to submit. -->
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
								onclick={(e) => {
									e.preventDefault();
									submit();
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
							" focus-visible:bg-neutral-200 dark:focus-visible:bg-neutral-800"
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
