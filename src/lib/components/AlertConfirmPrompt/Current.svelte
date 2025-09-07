<script lang="ts">
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
		value?: any;
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
		classButton?: string;
		classSpinnerBox?: string;
	}

	let {
		acp,
		value = $bindable(),
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
		classButton,
		classSpinnerBox,
	}: Props = $props();

	let current = $derived(acp?.current!);

	let iconFn = $derived.by(() => {
		let out = current.iconFn;
		if (current.iconFn === true) {
			out = acpDefaultIcons[current.variant];
		}
		return out;
	});

	const createOnClick = (worker: CallableFunction) => async (e: Event) => {
		e.preventDefault();
		isPending = true;
		await Promise.resolve(worker(current.type === PROMPT ? value : true));
		isPending = false;
		value = null;
	};

	const debug = (c?: string, flag = 0) =>
		c && flag ? `outline outline-dashed ${c}` : "";

	// Default classes

	const _class = "p-1 sm:p-2 h-full flex flex-col overflow-hidden";

	const _classWrap = `flex-1 sm:flex sm:items-start overflow-hidden`;

	const _classIconBox = `size-12 sm:size-10
		mt-1 mb-4 sm:my-0 sm:mr-5
		mx-auto 
		flex flex-shrink-0 items-center justify-center 
		rounded-full 
		bg-neutral-950/10 text-neutral-950/80
		dark:bg-neutral-50/20 dark:text-neutral-50/80`;

	const _classContentBox = `mt-3 sm:mt-0 flex-1 overflow-hidden h-full flex flex-col`;

	const _classTitle = `text-center sm:text-left text-base font-semibold leading-6`;

	const _classContent = `mt-2 mx-3 sm:mx-0 text-center sm:text-left text-sm opacity-75`;

	const _classMenu = `mt-6 sm:flex sm:space-x-4 justify-end space-y-3 sm:space-y-0`;

	const _classMenuLi = `flex-1 sm:flex-none w-full sm:w-auto sm:inline-block`;

	const _classButton = "min-w-24 text-center w-full sm:w-auto";

	const _classSpinnerBox = `absolute inset-0 flex items-center justify-center bg-white/75 dark:bg-black/75`;
</script>

<div class={twMerge("stuic-acp", _class, classProp)}>
	<div class={twMerge("wrap", _classWrap, classWrap)}>
		{#if typeof iconFn === "function"}
			<div
				class={twMerge(
					"icon-box",
					debug("outline-green-500"),
					_classIconBox,
					classIconBox
				)}
			>
				{@html iconFn()}
			</div>
		{/if}
		<div class={twMerge("content-box", _classContentBox, classContentBox)}>
			<h1
				class={twMerge(
					"title",
					_classTitle,
					typeof iconFn === "function" && "pt-2",
					classTitle
				)}
			>
				<Thc thc={current.title} {forceAsHtml} />
			</h1>

			<div class="scrollable overflow-y-auto flex-1" style="scrollbar-width: thin;">
				{#if isTHCNotEmpty(current.content)}
					<div class={twMerge("content", _classContent, classContent)}>
						<Thc thc={current.content} {forceAsHtml} />
					</div>
				{/if}

				{#if current.type === PROMPT}
					<div class={twMerge("input-box", "mt-1 p-2", classInputBox)}>
						{#if current?.promptFieldProps?.options?.length}
							<FieldSelect
								bind:value
								class={twMerge("input", "m-0", classInput)}
								options={current.promptFieldProps.options}
								renderSize="sm"
								disabled={isPending}
								{...current.promptFieldProps}
							/>
						{:else}
							<FieldInput
								bind:value
								class={twMerge("input", classInput)}
								renderSize="sm"
								disabled={isPending}
								{...current?.promptFieldProps || {}}
							/>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>
	<menu class={twMerge(_classMenu, classMenu)}>
		{#if current.type !== ALERT}
			<li class={twMerge(_classMenuLi, classMenuLi)}>
				<Button
					class={twMerge("cancel", _classButton, classButton)}
					disabled={isPending}
					onclick={createOnClick(current.onCancel)}
				>
					<Thc thc={current.labelCancel} {forceAsHtml} />
				</Button>
			</li>
		{/if}
		{#if current.labelCustom && typeof current.onCustom === "function"}
			<li class={twMerge(_classMenuLi, classMenuLi)}>
				<Button
					class={twMerge("custom", _classButton, classButton)}
					disabled={isPending}
					onclick={createOnClick(current.onCustom)}
				>
					<Thc thc={current.labelCustom} {forceAsHtml} />
				</Button>
			</li>
		{/if}
		<li class={twMerge(_classMenuLi, classMenuLi)}>
			<Button
				class={twMerge("ok", _classButton, classButton)}
				variant="primary"
				disabled={isPending}
				onclick={createOnClick(current.onOk)}
			>
				<Thc thc={current.labelOk} {forceAsHtml} />
			</Button>
		</li>
	</menu>
	{#if isPending}
		<div class={twMerge("spinner-box", _classSpinnerBox, classSpinnerBox)}>
			<Spinner class="w-8" />
		</div>
	{/if}
</div>
