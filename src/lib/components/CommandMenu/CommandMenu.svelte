<script lang="ts" module>
	import { ItemCollection, type Item } from "@marianmeres/item-collection";
	import { Modal } from "../Modal/index.js";
	import { createClog } from "@marianmeres/clog";
	import { FieldInput } from "../Input/index.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import { iconBsSearch as iconSearch } from "@marianmeres/icons-fns/bootstrap/iconBsSearch.js";
	import { X } from "../X/index.js";
	import { Debounced, watch } from "runed";

	// export interface Option {
	// 	label: string;
	// 	value: any;
	// }

	// i18n ready
	function t_default(k: string) {
		const m: Record<string, string> = {
			// field_req_att: "This field requires attention. Please review and try again.",
			// cardinality_of: "of",
			// cardinality_selected: "selected",
			// submit: "Submit",
			// select_all: "Select all",
			// clear_all: "Clear all",
			// clear: "Clear",
			// search_placeholder: "Type to search...",
			// search_submit_placeholder: "Type to search and/or submit...",
			// cardinality_full: "Max selection reached",
			// select_from_list: "Please select from the list",
			// x_close: "Clear input or close [esc]",
			// unknown_allowed: "Select from the list or type and submit any value",
			// unknown_not_allowed: "Select values from the list only",
		};
		return m[k] ?? k;
	}
</script>

<script lang="ts">
	const clog = createClog("CommandMenu");

	interface Props {
		input?: HTMLInputElement;
		value: any;
		getOptions: (s: string, current: Item[]) => Promise<Item[]>;
		renderOptionLabel?: (item: Item) => string;
		t?: (key: string) => string;
		itemIdPropName?: string;
		//
		noScrollLock?: boolean;
	}

	let {
		input = $bindable(),
		value = $bindable(),
		t = t_default,
		noScrollLock = false,
		renderOptionLabel,
		itemIdPropName = "id",
	}: Props = $props();

	function _renderOptionLabel(item: Item): string {
		return renderOptionLabel?.(item) || `${item[itemIdPropName]}`;
	}

	function sortFn(a: Item, b: Item) {
		return _renderOptionLabel(a).localeCompare(_renderOptionLabel(b), undefined, {
			sensitivity: "base",
		});
	}

	const _optionsColl = new ItemCollection([], {
		allowNextPrevCycle: false,
		// sortFn,
		idPropName: itemIdPropName,
		searchable: { getContent: (item) => _renderOptionLabel(item) },
	});

	let modal: Modal = $state()!;
	let q: any = $state();
	let isFetching = $state(false);
	let modalEl: HTMLDivElement | undefined = $state();
	// let input: undefined | HTMLInputElement = $state();

	export function close() {
		modal.close();
	}

	export function open(openerOrEvent?: null | HTMLElement | MouseEvent) {
		modal.open(openerOrEvent);
	}

	$inspect("q", q).with(clog);
	$inspect("value", value).with(clog);
</script>

<Modal
	bind:this={modal}
	onEscape={modal?.close}
	class="bg-transparent dark:bg-transparent"
	classInner="max-w-2xl"
	bind:el={modalEl}
	{noScrollLock}
>
	<form
		onsubmit={(e) => {
			e.preventDefault();
			// collection.setQuery(`${q}`.trim());
			modal.close();
			// clog("TODO save", `${q}`.trim());
		}}
		class=""
	>
		<FieldInput
			type="text"
			name="q"
			bind:value={q}
			class="search m-4 mb-12 shadow-xl"
			classLabelBox="m-0"
			placeholder={t("placeholder")}
			classInputBoxWrap={twMerge(
				// always look like focused
				`border-primary border-input-accent dark:border-input-accent-dark`,
				`ring-input-accent/20 dark:ring-input-accent-dark/20 ring-4`
			)}
			autocomplete="off"
			onkeydown={(e) => {
				// clog("keydown", e);
				if (["ArrowDown", "ArrowUp"].includes(e.key)) {
					// e.preventDefault();
					//
					clog("TODO suggest");
				}
			}}
			bind:input
		>
			{#snippet inputBefore()}
				<div class="flex flex-col items-center justify-center pl-3 opacity-50">
					{@html iconSearch({ size: 14 })}
				</div>
			{/snippet}
			{#snippet inputAfter()}
				<button
					type="button"
					class="closer opacity-50 hover:opacity-100 focus-visible:opacity-100"
					onclick={(e) => {
						e.preventDefault();
						if (!`${q || ""}`.trim()) {
							// collection.setQuery("");
							return modal.close();
						}
						q = "";
						input?.focus();
					}}
				>
					<X class="m-2 size-4 " />
				</button>
			{/snippet}
			{#snippet inputBelow()}
				<div class="h-full border-t p-2 border-black/20">input below</div>
			{/snippet}
		</FieldInput>
	</form>
</Modal>

<style>
	ul.options {
		scrollbar-width: thin;
	}
</style>
