<script lang="ts" module>
	import { ItemCollection, type Item } from "@marianmeres/item-collection";
	import { ModalDialog } from "../ModalDialog/index.js";
	import { createClog } from "@marianmeres/clog";
	import { FieldInput } from "../Input/index.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import { iconSearch } from "#lib/icons/index.js";
	import { X } from "../X/index.js";
	import { Debounced } from "../../utils/debounced.svelte.js";
	import { watch } from "../../utils/watch.svelte.js";
	import { NotificationsStack } from "../Notifications/index.js";
	import { Spinner } from "../Spinner/index.js";
	import { ListItemButton } from "../ListItemButton/index.js";
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

	/** Third argument of `getOptions`: lets one query put options on screen in batches. */
	export interface GetOptionsContext {
		/**
		 * Puts these options on screen now, for this query only. The query's first batch
		 * (an `append` or the resolved array, whichever comes first) replaces the previous
		 * query's options; every later batch adds to them. An option whose id is already
		 * on screen is skipped. Ignored once a newer query supersedes this one, and after
		 * this query's promise has settled.
		 *
		 * `options.source` names who the batch is from (typically a remote source that
		 * answers on its own). Options appended with a source outlive their query: when
		 * the next query's first batch replaces the list they stay on screen, until the
		 * same source appends again (an empty array counts) or that query settles. That
		 * keeps a source's rows from vanishing on every keystroke only to come back a
		 * moment later.
		 */
		append: (items: Item[], options?: { source?: string }) => void;
		/** Aborted when a newer query supersedes this one, or when the component is destroyed. */
		signal: AbortSignal;
	}

	export interface Props {
		input?: HTMLInputElement;
		value: any;
		/**
		 * Fetches the options for a query. Resolve the (final) list, or call `ctx.append`
		 * to show options as they arrive before the promise settles. The spinner stays on
		 * until the promise settles, however many batches arrived before.
		 */
		getOptions: (q: string, current: Item[], ctx: GetOptionsContext) => Promise<Item[]>;
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
		/**
		 * How options are ordered. Default: by `"<optgroup>__<label>"`, so groups and the
		 * labels within them are alphabetical. A comparator replaces that order; `false`
		 * keeps the order the options arrived in (groups render in the order they first
		 * appear). Read once, when the component is created (like `itemIdPropName`).
		 */
		sortOptions?: false | ((a: Item, b: Item) => number);
		/** Skip stuic base classes (user provides their own styling) */
		unstyled?: boolean;
	}
</script>

<script lang="ts">
	import { onDestroy } from "svelte";
	import Button from "../Button/Button.svelte";
	import {
		normalizeAndGroupOptions,
		renderOptionLabelOf,
		sortByOptgroupLabel,
	} from "./_internal/command-menu-utils.js";

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
		sortOptions,
		unstyled = false,
	}: Props = $props();

	// Pure helpers extracted to _internal/command-menu-utils.ts (node-tested). These
	// thin wrappers keep reading the live props/closures and delegate the logic.
	function _renderOptionLabel(item: Item): string {
		return renderOptionLabelOf(item, renderOptionLabel, itemIdPropName);
	}

	function defaultSortFn(a: Item, b: Item) {
		return sortByOptgroupLabel(a, b, _renderOptionLabel);
	}

	let modalDialog: ModalDialog = $state()!;
	let isFetching = $state(false);
	let optionsBox: HTMLDivElement | undefined = $state();
	let activeEl: HTMLButtonElement | undefined = $state();
	let fetchRequestId = 0;
	let inflight: AbortController | undefined;

	// Without a sortFn the collection keeps insertion order (its `sort()` is a no-op).
	// svelte-ignore state_referenced_locally
	const _optionsColl = new ItemCollection([], {
		allowNextPrevCycle: false,
		sortFn: sortOptions === false ? undefined : (sortOptions ?? defaultSortFn),
		idPropName: itemIdPropName,
		searchable: { getContent: (item) => _renderOptionLabel(item) },
	});
	let options = $derived($_optionsColl);

	// Which on-screen options a batch appended with a `source` (id → source), and which
	// of those belong to a query that has been replaced since: they stay up, stale,
	// until their source answers again or the current query settles. Plain bookkeeping,
	// nothing renders from it.
	const sourceOf = new Map<unknown, string>();
	const stale = new Set<unknown>();
	// a batch may name an option as a bare id (the collection turns it into an item)
	const idOf = (o: Item | string) => (typeof o === "string" ? o : o?.[itemIdPropName]);

	function dropStale(match: (id: unknown) => boolean = () => true) {
		for (const id of [...stale]) {
			if (!match(id)) continue;
			stale.delete(id);
			sourceOf.delete(id);
			_optionsColl.removeAllBy(itemIdPropName, id);
		}
	}

	// Removing the active option moves the collection's marker onto its neighbour. Here
	// that would highlight (and focus) a row the person never chose, mid-typing: the
	// highlight stays on the same option while it is on screen, and goes with it.
	function keepActive(id: unknown) {
		if (_optionsColl.active?.[itemIdPropName] === id) return;
		const item = id == null ? undefined : _optionsColl.findById(id as string);
		if (item) _optionsColl.setActive(item);
		else _optionsColl.unsetActive();
	}

	// The active option's id is a primitive, so an effect keyed on it re-runs only when
	// the active option actually changes — not on every publish of the collection (each
	// batch a progressive `getOptions` appends is a publish, and must not scroll or
	// pull focus while the person is typing).
	let activeId = $derived(
		options.active?.[itemIdPropName] as string | number | undefined
	);

	// scroll the active option into view
	$effect(() => {
		if (modalDialog.visibility().visible && activeId != null) {
			activeEl = qsa(`#${btn_id(activeId)}`, optionsBox)[0] as any;
			activeEl?.scrollIntoView({ behavior: "smooth", block: "center" });
			activeEl?.focus();
		} else {
			activeEl = undefined;
		}
	});

	//
	const debounced = new Debounced(() => q, 150);
	watch([() => debounced.current], ([currQ]) => {
		// A new (or emptied) query supersedes whatever is in flight: abort it and bump the
		// id, so its late batches and rejection are ignored and it cannot reset the spinner.
		inflight?.abort();
		const currentRequest = ++fetchRequestId;

		if (!currQ && !showAllOnEmptyQ) {
			_optionsColl.clear();
			sourceOf.clear();
			stale.clear();
			isFetching = false;
			return;
		}

		const controller = (inflight = new AbortController());
		let replaced = false;
		let settled = false;
		const live = () => !settled && currentRequest === fetchRequestId;

		// A batch is an `append` call or the resolved array. The query's first batch
		// replaces the previous query's options (which stay up until then, so the list
		// does not flash empty on every keystroke); later batches add to them. The
		// collection is `unique`, so the first batch to name an id wins.
		//
		// The exception to "replaces" are options appended with a `source`: they stay,
		// stale, until that source's first batch of this query (or until it settles).
		// One `batch()` is one publish, so whatever a batch removes and adds reaches
		// the DOM in one step.
		const append = (items: Item[], { source }: { source?: string } = {}) => {
			if (!live()) return;
			items = items ?? [];
			const wasActive = _optionsColl.active?.[itemIdPropName];
			_optionsColl.batch(() => {
				// what the previous query's sources said, held over (first batch only)
				let held: Item[] = [];
				if (!replaced) {
					replaced = true;
					held = _optionsColl.items.filter((o) => sourceOf.has(idOf(o)));
					for (const o of held) stale.add(idOf(o));
					_optionsColl.clear(); // publishes, so an empty first batch still empties the list
				}
				// this source has answered: what it said to the previous query goes
				if (source != null) dropStale((id) => sourceOf.get(id) === source);
				// a fresh option replaces a stale one of the same id, whoever held it
				const ids = new Set(items.map(idOf));
				dropStale((id) => ids.has(id));
				if (source != null) {
					// only what this batch really adds (an id already on screen is skipped)
					for (const id of ids) {
						if (id != null && !_optionsColl.findById(id)) sourceOf.set(id, source);
					}
				}
				_optionsColl.addMany(items);
				// after the batch's own rows: in arrival order, this query's rows lead
				_optionsColl.addMany(held.filter((o) => stale.has(idOf(o))));
				keepActive(wasActive);
			});
		};

		isFetching = true;
		// the Promise wrapper turns a synchronous throw of `getOptions` into a rejection
		new Promise<Item[]>((resolve) =>
			resolve(getOptions(`${currQ}`, [], { append, signal: controller.signal }))
		)
			.then((res) => append(res ?? []))
			.catch((e) => {
				// Surface errors only for the latest in-flight request, and never for one
				// we aborted ourselves (a superseded query, or the component going away).
				if (!live() || controller.signal.aborted) return;
				console.error(e);
				notifications?.error(`${e}`);
			})
			.finally(() => {
				settled = true;
				if (currentRequest !== fetchRequestId) return;
				// Only the latest request toggles the fetching state back off
				// so the spinner doesn't flicker when a stale response arrives late.
				isFetching = false;
				// The sources that did not answer this query: what they said to the previous
				// one goes now. (A query that never got to a first batch replaced nothing.)
				if (replaced && stale.size) {
					const wasActive = _optionsColl.active?.[itemIdPropName];
					_optionsColl.batch(() => {
						dropStale();
						keepActive(wasActive);
					});
				}
			});
	});

	onDestroy(() => inflight?.abort());

	//
	function _normalize_and_group_options(opts: Item[]): Map<string, Item[]> {
		return normalizeAndGroupOptions(opts, renderOptionGroup);
	}

	export function close() {
		modalDialog.close();
	}

	export function open(openerOrEvent?: null | HTMLElement | MouseEvent) {
		modalDialog.open(openerOrEvent);
	}

	// internal DRY
	const rand = Math.random().toString(36).slice(2);
	const listId = `cmd-menu-list-${rand}`;
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
	class="w-full max-w-3xl bg-transparent shadow-none pointer-events-none"
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
				aria-autocomplete="list"
				aria-controls={options.size ? listId : undefined}
				aria-activedescendant={options.active
					? btn_id(options.active[itemIdPropName])
					: undefined}
				placeholder={searchPlaceholder ?? t("search_placeholder")}
				classInputBoxWrap={twMerge(
					// always look like focused
					`border-primary border-(--stuic-input-accent)`,
					`ring-(--stuic-input-accent)/20 ring-4`
				)}
				onkeydown={(e) => {
					if (e.key === "Enter") {
						e.preventDefault();
						submit();
					}
				}}
			>
				{#snippet inputBefore()}
					<div
						class={twMerge(
							"flex flex-col items-center justify-center pl-3",
							!unstyled && "stuic-command-menu-muted"
						)}
					>
						{@html iconSearch({ size: 19 })}
					</div>
				{/snippet}
				{#snippet inputAfter()}
					<div
						class={twMerge(
							"flex pl-2 items-center justify-center",
							!unstyled && "stuic-command-menu-placeholder"
						)}
					>
						{#if isFetching}
							<Spinner class="w-4" />
						{/if}
					</div>
					<div class="flex items-center justify-center">
						<Button
							x
							variant="ghost"
							roundedFull
							type="button"
							onclick={(e) => {
								e.preventDefault();
								if (!`${q || ""}`.trim()) {
									return modalDialog.close();
								}
								q = "";
								input?.focus();
							}}
						/>
					</div>
				{/snippet}
				{#snippet inputBelow()}
					<div class="sr-only" aria-live="polite" aria-atomic="true">
						{#if options.size}
							{options.size} results available
						{/if}
					</div>
					{#if options.size}
						<div
							class={twMerge(
								!unstyled && "stuic-command-menu-options",
								"block space-y-1 p-1",
								// mt-1 mirrors the lg input-wrap's top padding, so the search row
								// stays vertically centered above the divider
								"overflow-y-auto overflow-x-hidden my-1",
								"border-t"
							)}
							bind:this={optionsBox}
							tabindex="-1"
							role="listbox"
							id={listId}
							aria-label="Search results"
						>
							<!-- keyed, or a group landing above others would rebuild every row below it -->
							{#each _normalize_and_group_options(options.items) as [_optgroup, _opts] (_optgroup)}
								<div class="p-1">
									{#if _optgroup}
										<div
											class={twMerge(
												"mb-1 p-1 font-semibold uppercase tracking-wide",
												!unstyled && "stuic-command-menu-group-header"
											)}
										>
											{_optgroup}
										</div>
									{/if}
									<ul role="presentation" class="space-y-1">
										{#each _opts as item (item[itemIdPropName])}
											{@const active =
												item[itemIdPropName] === options.active?.[itemIdPropName]}
											<li class:active role="presentation">
												<ListItemButton
													id={btn_id(item[itemIdPropName])}
													role="option"
													aria-selected={active}
													{active}
													tabindex={-1}
													class={classOption}
													classActive={classOptionActive}
													onclick={() => {
														_optionsColl.setActive(item);
														submit();
													}}
													onkeydown={(e) => {
														if (e.key === "Tab") {
															e.preventDefault();
															input?.focus();
														}
													}}
												>
													{_renderOptionLabel(item)}
												</ListItemButton>
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
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
