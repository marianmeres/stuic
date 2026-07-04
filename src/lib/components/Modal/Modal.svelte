<script lang="ts" module>
	import type { Snippet } from "svelte";

	/**
	 * Return type of `Modal`'s `onEscape` handler.
	 *
	 * Resolve to `false` to VETO the Escape-close and keep the modal open; any
	 * other value (including `undefined`) closes as before. May be async — the
	 * modal stays open until the returned promise resolves.
	 */
	export type EscapeVeto = void | boolean | Promise<void | boolean>;

	export interface Props {
		visible?: boolean;
		children: Snippet;
		header?: Snippet;
		footer?: Snippet;
		/** Classes for the inner container (constrains content width) */
		classInner?: string;
		class?: string;
		classHeader?: string;
		classMain?: string;
		classFooter?: string;
		classDialog?: string;
		/** ID reference for aria-labelledby */
		labelledby?: string;
		/** ID reference for aria-describedby */
		describedby?: string;
		el?: HTMLDivElement;
		/**
		 * Called when Escape is pressed while the modal is open.
		 * Return (or resolve to) `false` to VETO the close and keep the modal
		 * open; any other value (incl. `undefined`) closes as before. May be
		 * async — the modal stays open until the returned promise resolves.
		 */
		onEscape?: () => EscapeVeto;
		/** Disable body scroll lock when modal is open */
		noScrollLock?: boolean;
		/** Disable close on backdrop / outside click */
		noClickOutsideClose?: boolean;
	}
</script>

<script lang="ts">
	import ModalDialog from "../ModalDialog/ModalDialog.svelte";
	import { twMerge } from "../../utils/tw-merge.js";

	let {
		visible = $bindable(false),
		children,
		header,
		footer,
		classInner,
		class: classProp,
		classHeader,
		classMain,
		classFooter,
		classDialog,
		labelledby,
		describedby,
		el = $bindable(),
		onEscape,
		noScrollLock = false,
		noClickOutsideClose = false,
	}: Props = $props();

	let modalDialog: ModalDialog = $state()!;

	export function close() {
		modalDialog.close();
	}

	export function open(openerOrEvent?: null | HTMLElement | MouseEvent) {
		modalDialog.open(openerOrEvent);
		visible = true;
	}

	export function setOpener(opener?: null | HTMLElement) {
		modalDialog.setOpener(opener);
	}

	export function visibility() {
		return modalDialog.visibility();
	}

	// Sync visible prop with ModalDialog - when visible becomes true externally, open the dialog
	$effect(() => {
		if (visible && !modalDialog?.visibility().visible) {
			modalDialog?.open();
		}
	});

	function handlePreClose() {
		visible = false;
		// return undefined to allow close
	}

	function handlePreEscapeClose() {
		// Forward to ModalDialog.preEscapeClose, which closes only when the result
		// is !== false and already awaits it — so an async veto is honoured and a
		// `false` return keeps the modal open (preClose sets visible = false only
		// when the close is actually allowed to proceed).
		return onEscape?.();
	}
</script>

<ModalDialog
	bind:this={modalDialog}
	ariaLabelledby={labelledby}
	ariaDescribedby={describedby}
	{noScrollLock}
	{noClickOutsideClose}
	preEscapeClose={handlePreEscapeClose}
	preClose={handlePreClose}
	class={twMerge(
		"bg-transparent size-full md:size-auto pointer-events-none",
		classDialog
	)}
>
	<div
		bind:this={el}
		class={twMerge(
			"overflow-x-hidden overflow-y-hidden flex flex-col",
			"w-full md:w-3xl md:max-w-[calc(100vw-2rem)]",
			"h-full md:h-auto md:min-h-48 md:max-h-[80dvh]",
			"pointer-events-auto",
			classInner
		)}
	>
		<div
			class={twMerge(
				"stuic-modal",
				"flex flex-col overflow-hidden",
				"w-full flex-1",
				classProp
			)}
		>
			{#if header}
				<div class={twMerge("header", classHeader)}>
					{@render header()}
				</div>
			{/if}
			<div class={twMerge("main overflow-auto flex-1", classMain)}>
				{@render children()}
			</div>
			{#if footer}
				<div class={twMerge("footer", classFooter)}>
					{@render footer()}
				</div>
			{/if}
		</div>
	</div>
</ModalDialog>
