<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import ModalDialog from "../ModalDialog/ModalDialog.svelte";
	import { isTHCNotEmpty } from "../Thc/Thc.svelte";
	import {
		AlertConfirmPromptType,
		type AlertConfirmPromptStack,
	} from "./alert-confirm-prompt-stack.svelte.js";
	import Current from "./Current.svelte";

	const { ALERT, CONFIRM, PROMPT } = AlertConfirmPromptType;

	interface Props {
		acp?: AlertConfirmPromptStack;
		forceAsHtml?: boolean;
		class?: string;
		classModalInnerBox?: string;
		//
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
		forceAsHtml,
		class: classProp,
		classModalInnerBox,
		//
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
		defaultIcons,
		classButtonCancel,
		classButtonCustom,
		classButtonPrimary,
		variantButtonCancel,
		variantButtonCustom,
		variantButtonPrimary,
	}: Props = $props();

	let modal = $state<ModalDialog>();

	$effect(() => {
		if (modal) {
			acp?.current ? modal.open() : modal.close();
		}
	});

	let isPending = $state(false);
</script>

{#if acp?.current}
	<!-- 
        // always allow escape - this emulates native alert/confirm/prompt
        preEscapeClose={acp?.current?.onEscape}
        // do not close modal if stack is not empty (this is just `ModalDialog` render business)
        preClose={() => !acp.length}
        // do not allow close on outside click - this emulates native alert/confirm/prompt
        noClickOutsideClose
    -->
	<ModalDialog
		bind:this={modal}
		preEscapeClose={() => {
			return isPending ? false : acp?.current.onEscape?.();
		}}
		preClose={() => !acp.length}
		noClickOutsideClose
		type={acp?.current?.type}
		class={twMerge(
			"max-w-xl justify-end max-h-[62vh] h-auto border p-4 rounded-lg",
			// different max-h based on not/existing content
			// isTHCNotEmpty(acp?.current?.content) ? "sm:max-h-[200px]" : "sm:max-h-[150px]",
			// acp?.current?.type === PROMPT && "sm:max-h-[250px]",
			classProp
		)}
	>
		<Current
			bind:isPending
			{acp}
			{classWrap}
			{classIconBox}
			{classContentBox}
			{classTitle}
			{classContent}
			{classInputBox}
			{classInput}
			{classMenu}
			{classMenuLi}
			{classButton}
			{classSpinnerBox}
			{defaultIcons}
			{classButtonCancel}
			{classButtonCustom}
			{classButtonPrimary}
			{variantButtonCancel}
			{variantButtonCustom}
			{variantButtonPrimary}
		/>
	</ModalDialog>
{/if}
