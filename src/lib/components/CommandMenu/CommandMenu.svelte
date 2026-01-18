<script lang="ts" module>
	import { ItemCollection, type Item } from "@marianmeres/item-collection";
	import { ModalDialog } from "../ModalDialog/index.js";
	import { createClog } from "@marianmeres/clog";
	import { FieldInput } from "../Input/index.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import { iconSearch } from "$lib/icons/index.js";
	import { X } from "../X/index.js";
	import { Debounced, watch } from "runed";
	import { NotificationsStack } from "../Notifications/index.js";
	import { Spinner } from "../Spinner/index.js";
	import { strHash } from "../../utils/str-hash.js";
	import { qsa } from "../../utils/qsa.js";
	import { replaceMap } from "../../utils/index.js";
	import { isPlainObject } from "../../utils/is-plain-object.js";
	import type { TranslateFn } from "../../types.js";

	// i18n ready
	function t_default(
		k: string,
		values: false | null | undefined | Record<string, string | number> = null,
		fallback: string | boolean = "",
		i18nSpanWrap: boolean = true
	) {
		// special case args shortcut: ak values je explicit false, tak to chapeme ako
		// i18nSpanWrap = false
		if (values === false) {
			values = null;
			fallback = "";
			i18nSpanWrap = false;
		}
		const m: Record<string, string> = {
			search_placeholder: "Type to search...",
			x_close: "Clear input or close [esc]",
			no_results: 'No results found for "{{q}}".',
			select_from_list: "Please select from the list",
		};
		let out = m[k] ?? fallback ?? k;

		return isPlainObject(values) ? replaceMap(out, values as any) : out;
	}

	export interface Props {
		input?: HTMLInputElement;
		value: any;
		getOptions: (s: string, current: Item[]) => Promise<Item[]>;
		renderOptionLabel?: (item: Item) => string;
		renderOptionGroup?: (s: string) => string;
		t?: TranslateFn;
		notifications?: NotificationsStack;
		itemIdPropName?: string;
		searchPlaceholder?: string;
		//
		noScrollLock?: boolean;
		q?: string;
		//
		classOption?: string;
		classOptionActive?: string;
		showAllOnEmptyQ?: boolean;
	}
</script>

<script lang="ts">
	const clog = createClog("CommandMenu");

	let {
		input = $bindable(),
		value = $bindable(),
		classOption,
		classOptionActive,
		q = "",
		noScrollLock = false,
		getOptions,
		renderOptionLabel,
		renderOptionGroup = (s: string) => `${s}`.replaceAll("_", " "),
		t = t_default,
		notifications,
		itemIdPropName = "id",
		searchPlaceholder,
		showAllOnEmptyQ,
	}: Props = $props();

	function _renderOptionLabel(item: Item): string {
		return renderOptionLabel?.(item) || `${item[itemIdPropName]}`;
	}

	function sortFn(a: Item, b: Item) {
		const withOptGroup = (i: Item) => `${i.optgroup || ""}__${_renderOptionLabel(i)}`;
		return withOptGroup(a).localeCompare(withOptGroup(b), undefined, {
			sensitivity: "base",
		});
	}

	let modalDialog: ModalDialog = $state()!;
	let isFetching = $state(false);
	let optionsBox: HTMLDivElement | undefined = $state();
	let activeEl: HTMLButtonElement | undefined = $state();

	//
	// svelte-ignore state_referenced_locally
	const _optionsColl = new ItemCollection([], {
		allowNextPrevCycle: false,
		sortFn,
		idPropName: itemIdPropName,
		searchable: { getContent: (item) => _renderOptionLabel(item) },
	});
	let options = $derived($_optionsColl);

	// scroll the active option into view
	$effect(() => {
		if (modalDialog.visibility().visible && options.active?.[itemIdPropName]) {
			activeEl = qsa(`#${btn_id(options.active[itemIdPropName])}`, optionsBox)[0] as any;
			activeEl?.scrollIntoView({ behavior: "smooth", block: "center" });
			activeEl?.focus();
		} else {
			activeEl = undefined;
		}
	});

	//
	const debounced = new Debounced(() => q, 150);
	watch([() => debounced.current], ([currQ], [oldQ]) => {
		if (!currQ && !showAllOnEmptyQ) {
			_optionsColl.clear();
			return;
		}

		isFetching = true;
		getOptions(`${currQ}`, [])
			.then((res) => {
				_optionsColl.clear().addMany(res);
			})
			.catch((e) => {
				console.error(e);
				notifications?.error(`${e}`);
			})
			.finally(() => (isFetching = false));
	});

	//
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

	export function close() {
		modalDialog.close();
	}

	export function open(openerOrEvent?: null | HTMLElement | MouseEvent) {
		modalDialog.open(openerOrEvent);
	}

	// internal DRY
	const rand = Math.random().toString(36).slice(2);
	function btn_id(id: string | number, prefix = "btn-") {
		return prefix + rand + strHash(`${id}`.repeat(3));
	}

	function submit() {
		// happy flow
		if (options.active) {
			value = options.active;
			q = "";
			return close();
		}

		// seems like we hit enter, but did not choose any option
		if (options.size) {
			return notifications?.error(t("select_from_list"), {
				ttl: 1000,
			});
		}

		// nothing found...
		if (q) {
			return notifications?.error(t("no_results", { q }), {
				ttl: 1000,
			});
		}
	}

	// $inspect("options", options).with(clog);
	// $inspect("q", q).with(clog);
	// $inspect("value", value).with(clog);
</script>

<!-- this must be on window as we're catching any typing anywhere -->
<svelte:window
	onkeydown={(e) => {
		if (modalDialog.visibility().visible) {
			// arrow navigation
			if (["ArrowDown", "ArrowUp"].includes(e.key)) {
				e.preventDefault();
				if (e.key === "ArrowUp") {
					e.metaKey ? _optionsColl.setActiveFirst() : _optionsColl.setActivePrevious();
				} else if (e.key === "ArrowDown") {
					e.metaKey ? _optionsColl.setActiveLast() : _optionsColl.setActiveNext();
				}
			}
			// everything else (except controls) "forward" as an input search
			else if (!["Tab", " ", "Enter"].includes(e.key)) {
				input?.focus();
			}
		}
	}}
/>

<ModalDialog
	bind:this={modalDialog}
	classDialog="items-start"
	class="w-full max-w-3xl bg-transparent pointer-events-none"
	{noScrollLock}
>
	<div class="pt-0 md:pt-[20vh] w-full">
		<form
			class="pointer-events-auto"
			onsubmit={(e) => {
				e.preventDefault();
				modalDialog.close();
			}}
		>
			<FieldInput
				type="text"
				name="q"
				renderSize="lg"
				bind:input
				bind:value={q}
				class="search m-2 shadow-xl"
				classLabelBox="m-0"
				autocomplete="off"
				placeholder={searchPlaceholder ?? t("search_placeholder")}
				classInputBoxWrap={twMerge(
					// always look like focused
					`border-primary border-input-accent dark:border-input-accent-dark`,
					`ring-input-accent/20 dark:ring-input-accent-dark/20 ring-4`
				)}
				onkeydown={(e) => {
					if (e.key === "Enter") {
						e.preventDefault();
						submit();
					}
				}}
			>
				{#snippet inputBefore()}
					<div class="flex flex-col items-center justify-center pl-3 opacity-75">
						{@html iconSearch({ size: 19, strokeWidth: 3 })}
					</div>
				{/snippet}
				{#snippet inputAfter()}
					<div class="flex pl-2 items-center justify-center opacity-50">
						{#if isFetching}
							<Spinner class="w-4" />
						{/if}
					</div>
					<div class="flex items-center justify-center">
						<button
							type="button"
							class={twMerge(
								"rounded m-1 opacity-75",
								"hover:opacity-100 hover:bg-neutral-200 dark:hover:bg-neutral-800",
								"focus-visible:opacity-100 focus-visible:outline-0",
								"focus-visible:bg-neutral-200 dark:focus-visible:bg-neutral-800"
							)}
							onclick={(e) => {
								e.preventDefault();
								if (!`${q || ""}`.trim()) {
									return modalDialog.close();
								}
								q = "";
								input?.focus();
							}}
						>
							<X class="m-2 size-6" />
						</button>
					</div>
				{/snippet}
				{#snippet inputBelow()}
					{#if options.size}
						<div
							class={twMerge(
								"options block space-y-1 p-1",
								"overflow-y-auto overflow-x-hidden mb-1",
								"border-t border-black/20",
								"max-h-60"
							)}
							bind:this={optionsBox}
							tabindex="-1"
						>
							{#each _normalize_and_group_options(options.items) as [_optgroup, _opts]}
								<!-- {console.log(11111, _optgroup, _opts)} -->
								<div class="p-1">
									{#if _optgroup}
										<div
											class="text-sm capitalize opacity-50 border-b border-black/10 mb-1 p-1"
										>
											{_optgroup}
										</div>
									{/if}
									<ul>
										{#each _opts as item (item.id)}
											{@const active =
												item[itemIdPropName] === options.active?.[itemIdPropName]}
											<!-- {@const isSelected = false} -->
											<li class:active>
												<button
													class:active
													type="button"
													class={twMerge(
														"no-focus-visible",
														"text-left rounded-md py-2 px-2.5",
														"min-w-0 w-full overflow-hidden text-ellipsis whitespace-nowrap",
														"border border-transparent",
														"focus:outline-0 focus:border-neutral-400 dark:focus:border-neutral-500",
														"focus-visible:outline-0 focus-visible:ring-0",
														"hover:border-neutral-400 dark:hover:border-neutral-500",
														active && "bg-neutral-200 dark:bg-neutral-800",
														classOption,
														// active && "border-neutral-400",
														active && classOptionActive
													)}
													id={btn_id(item[itemIdPropName])}
													tabindex="-1"
													onclick={() => {
														_optionsColl.setActive(item);
														submit();
													}}
													onkeydown={(e) => {
														// need to handle tab here, because the tabindex="-1" is ignored
														// in the focus-trap selectors... so, on Tab, manually focusin input
														if (e.key === "Tab") {
															e.preventDefault();
															input?.focus();
														}
													}}
												>
													<!-- role="checkbox"
											aria-checked={active} -->
													{_renderOptionLabel(item)}
												</button>
											</li>
										{/each}
									</ul>
								</div>
							{/each}
						</div>
					{/if}
				{/snippet}
			</FieldInput>
		</form>
	</div>
</ModalDialog>

<style>
	.options {
		scrollbar-width: thin;
	}
</style>
