<script lang="ts">
	import { tick } from "svelte";
	import { twMerge } from "../../utils/tw-merge.js";
	import Button from "../Button/Button.svelte";
	import FieldInput from "../Input/FieldInput.svelte";
	import FieldSelect from "../Input/FieldSelect.svelte";
	import Spinner from "../Spinner/Spinner.svelte";
	import Thc, { isTHCNotEmpty } from "../Thc/Thc.svelte";
	import { acpDefaultIcons } from "./acp-icons.js";
	import {
		AlertConfirmPromptType,
		type AlertConfirmPromptStack,
	} from "./alert-confirm-prompt-stack.svelte.js";

	const { ALERT, CONFIRM, PROMPT } = AlertConfirmPromptType;
	const isFn = (v: any) => typeof v === "function";

	interface Props {
		acp?: AlertConfirmPromptStack;
		isPending?: boolean;
		forceAsHtml?: boolean;
		class?: string;
		classWrap?: string;
		classIconBox?: string;
		classContentBox?: string;
		classTitle?: string;
		classContent?: string;
		classInputBox?: string;
		classInput?: string;
		classMenu?: string;
		classMenuLi?: string;
		//
		classMenuCustom?: string;
		classMenuLiCustom?: string;
		//
		classButton?: string;
		classButtonCancel?: string;
		classButtonCustom?: string;
		classButtonPrimary?: string;
		variantButtonCancel?: string;
		variantButtonCustom?: string;
		variantButtonPrimary?: string;
		classSpinnerBox?: string;
		defaultIcons?: Partial<
			Record<"info" | "success" | "warn" | "error" | "spinner", () => string | undefined>
		>;
	}

	let {
		acp,
		isPending = $bindable(false),
		forceAsHtml = true,
		class: classProp,
		classWrap,
		classIconBox,
		classContentBox,
		classTitle,
		classContent,
		classInputBox,
		classInput,
		classMenu,
		classMenuLi,
		classMenuCustom,
		classMenuLiCustom,
		classButton,
		classButtonCancel,
		classButtonCustom,
		classButtonPrimary,
		variantButtonCancel,
		variantButtonCustom,
		variantButtonPrimary = "primary",
		classSpinnerBox,
		defaultIcons = acpDefaultIcons,
	}: Props = $props();

	let current = $derived(acp?.current!);

	let iconHtml = $derived.by(() => {
		let fn = current.iconFn as any;
		if (current.iconFn === true) {
			fn = defaultIcons[current.variant];
		}
		return fn?.();
	});

	let CmpButtonOk = $derived(current.CmpButtonOk ?? Button);
	let CmpButtonCancel = $derived(current.CmpButtonCancel ?? Button);
	let CmpButtonCustom = $derived(current.CmpButtonCustom ?? Button);

	let inputEl = $state<any>();
	let okButtonEl = $state<any>();

	const createOnClick =
		(type: "cancel" | "ok" | "custom", worker: CallableFunction) =>
		async (e: Event | null) => {
			e?.preventDefault();

			// trigger validate
			if (inputEl && type === "ok" && current.type === PROMPT) {
				inputEl.dispatchEvent(new Event("input", { bubbles: true }));
				inputEl.dispatchEvent(new Event("change", { bubbles: true }));
				if (!inputEl.checkValidity()) return;
			}

			//
			isPending = true;
			await Promise.resolve(worker(current.type === PROMPT ? current.value : true));
			isPending = false;
		};

	const debug = (c?: string, flag = 0) =>
		c && flag ? `outline outline-dashed ${c}` : "";

	// Default classes

	const _class = "p-1 sm:p-2 h-full flex flex-col min-h-[150px]"; // overflow-hidden

	const _classWrap = `flex-1 sm:flex sm:items-start `; // overflow-hidden

	const _classIconBox = `size-12 sm:size-10
		mt-1 mb-4 sm:my-0 sm:mr-5
		mx-auto 
		flex flex-shrink-0 items-center justify-center 
		rounded-full 
		bg-neutral-950/10 text-neutral-950/80
		dark:bg-neutral-50/20 dark:text-neutral-50/80`;

	const _classContentBox = `mt-3 sm:mt-0 flex-1 h-full flex flex-col`; // overflow-hidden

	const _classTitle = `text-center sm:text-left text-base font-semibold leading-6`;

	const _classContent = `mt-2 mx-3 sm:mx-0 text-center sm:text-left text-sm opacity-75`;

	const _classMenu = `mt-6 sm:flex sm:space-x-4 justify-end space-y-4 sm:space-y-0`;

	const _classMenuLi = `flex-1 sm:flex-none w-full sm:w-auto sm:inline-block`;

	const _classButton = "min-w-24 text-center w-full sm:w-auto";

	const _classSpinnerBox = `absolute inset-0 flex items-center justify-center bg-white/75 dark:bg-black/75`;

	let hasCustom = $derived(current.labelCustom && typeof current.onCustom === "function");
</script>

<div class={twMerge("stuic-acp", _class, classProp)}>
	<div class={twMerge("wrap", _classWrap, classWrap)}>
		{#if iconHtml}
			<div
				class={twMerge(
					"icon-box",
					debug("outline-green-500"),
					_classIconBox,
					classIconBox
				)}
			>
				{@html iconHtml}
			</div>
		{/if}
		<div class={twMerge("content-box", _classContentBox, classContentBox)}>
			<h1
				class={twMerge(
					"title",
					_classTitle,
					typeof iconHtml === "function" && "pt-2",
					classTitle
				)}
			>
				<Thc thc={current.title} {forceAsHtml} />
			</h1>

			<div
				class="scrollable overflow-y-auto flex-1 max-h-[30vh]"
				style="scrollbar-width: thin;"
			>
				{#if isTHCNotEmpty(current.content)}
					<div class={twMerge("content", _classContent, classContent)}>
						<Thc thc={current.content} {forceAsHtml} />
					</div>
				{/if}

				{#if current.type === PROMPT}
					<div class={twMerge("input-box", "mt-3 p-1", classInputBox)}>
						{#if current?.promptFieldProps?.options?.length}
							<FieldSelect
								bind:value={current.value}
								bind:input={inputEl}
								class={twMerge("input", "m-0", classInput)}
								options={current.promptFieldProps.options}
								renderSize="sm"
								disabled={isPending}
								{...current.promptFieldProps}
							/>
						{:else}
							<FieldInput
								bind:value={current.value}
								bind:input={inputEl}
								class={twMerge("input", "m-0", classInput)}
								renderSize="sm"
								disabled={isPending}
								{...current?.promptFieldProps || {}}
								onkeydown={(e) => {
									if (e.key === "Enter" && inputEl.checkValidity()) {
										okButtonEl?.focus()?.click(); // hm...
									}
								}}
							/>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>
	<menu class={twMerge(_classMenu, classMenu, hasCustom && classMenuCustom)}>
		{#if current.type !== ALERT}
			<li class={twMerge(_classMenuLi, classMenuLi, hasCustom && classMenuLiCustom)}>
				<CmpButtonCancel
					class={twMerge("cancel", _classButton, classButton, classButtonCancel)}
					variant={variantButtonCancel}
					disabled={isPending}
					onclick={createOnClick("cancel", current.onCancel)}
				>
					<Thc thc={current.labelCancel} {forceAsHtml} />
				</CmpButtonCancel>
			</li>
		{/if}
		{#if hasCustom}
			<li class={twMerge(_classMenuLi, classMenuLi, classMenuLiCustom)}>
				<CmpButtonCustom
					class={twMerge("custom", _classButton, classButton, classButtonCustom)}
					variant={variantButtonCustom}
					disabled={isPending}
					onclick={createOnClick("custom", current.onCustom!)}
				>
					<Thc thc={current.labelCustom!} {forceAsHtml} />
				</CmpButtonCustom>
			</li>
		{/if}
		<li class={twMerge(_classMenuLi, classMenuLi, hasCustom && classMenuLiCustom)}>
			<CmpButtonOk
				class={twMerge("ok", _classButton, classButton, classButtonPrimary)}
				variant={variantButtonPrimary}
				disabled={isPending}
				onclick={createOnClick("ok", current.onOk)}
				bind:el={okButtonEl}
			>
				<Thc thc={current.labelOk} {forceAsHtml} />
			</CmpButtonOk>
		</li>
	</menu>
	{#if isPending}
		<div class={twMerge("spinner-box", _classSpinnerBox, classSpinnerBox)}>
			<Spinner class="w-8" />
		</div>
	{/if}
</div>
