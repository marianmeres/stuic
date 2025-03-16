<script lang="ts">
	import { onClickOutside } from "runed";
	import { onMount, tick, type Snippet } from "svelte";
	import { focusTrap } from "../../actions/focus-trap.js";
	import { stopPropagation } from "../../utils/event-modifiers.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import { createClog } from "@marianmeres/clog";
	import { waitForNextRepaint } from "../../utils/paint.js";

	const clog = createClog("ModalDialog").debug;

	interface Props {
		// idea is, that the `dialog` element, should not be needed to customize
		classDialog?: string;
		class?: string;
		children: Snippet;
		noClickOutsideClose?: boolean;
		noEscapeClose?: boolean;
		// optional ui hint
		type?: string;
		// pre close hooks... escape is considered special close strategy which may be
		// handled separately
		preEscapeClose?: () => any;
		preClose?: () => any;
	}

	let {
		class: classProp,
		classDialog,
		children,
		noClickOutsideClose,
		type,
		noEscapeClose,
		preEscapeClose,
		preClose,
	}: Props = $props();

	let visible = $state(false);
	let dialog = $state<HTMLDialogElement>()!;
	let box = $state<HTMLDivElement>()!;

	export function open() {
		visible = true;
		clog("will showModal");
		// dialog must be rendered in the DOM before it can be opened...
		waitForNextRepaint().then(() => {
			clog("dialog.showModal()");
			dialog.showModal();
		});
	}

	export function close() {
		(async () => {
			const allowed = await preClose?.();
			// explicit false prevents close
			if (allowed !== false) {
				clog("dialog.close()");
				dialog?.close();
				visible = false;
			}
		})();
	}

	onClickOutside(
		() => box,
		() => !noClickOutsideClose && close()
	);

	// $inspect("Modal dialog mounted, is visible:", visible).with(clog);
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
{#if visible}
	<dialog
		bind:this={dialog}
		use:focusTrap
		data-type={type}
		class={twMerge(
			"stuic-modal-dialog",
			`fixed inset-4 m-auto size-auto
			flex justify-center items-center
			focus:outline-none focus-visible:outline-none
			bg-transparent backdrop:bg-black/40`,
			classDialog
		)}
		onkeydown={async (e) => {
			if (e.key === "Escape" && visible) {
				clog("on Escape keydown, preventing default and stopping propagation");

				// do not allow built-in close on escape
				e.preventDefault();
				// do not bubble
				e.stopPropagation();
				// ???: do not allow additional onkeydown listeners on this dialog (should there be any...)
				e.stopImmediatePropagation();

				if (!noEscapeClose) {
					// explicit false prevents close
					let allowed = await preEscapeClose?.();
					if (allowed !== false) {
						// `preClose` will be handled next
						close();
					}
				}
			}
		}}
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- 
			The `onpointerdown={stopPropagation()}` is for cases where we have
			multiple dialogs on top of each other (which is questionable by itself) and we
			do not want close the below ones just by interacting (clicking) on the top one 
			(the `onClickOutside` uses `onpointerdown` with potential `onclick`)
		-->
		<div
			bind:this={box}
			onpointerdown={stopPropagation()}
			onclick={stopPropagation()}
			data-type={type}
			class={twMerge(
				`box relative size-full overflow-auto
				text-black dark:text-white bg-white dark:bg-neutral-800`,
				classProp
			)}
		>
			{@render children?.()}
		</div>
	</dialog>
{/if}

<style>
	dialog[open]::backdrop {
		animation: fadeIn 0.15s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
