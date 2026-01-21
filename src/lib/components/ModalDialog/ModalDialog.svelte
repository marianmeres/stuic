<script lang="ts" module>
	import type { Snippet } from "svelte";

	export interface Props {
		classDialog?: string;
		class?: string;
		children: Snippet;
		noClickOutsideClose?: boolean;
		noEscapeClose?: boolean;
		/** Optional UI hint */
		type?: string;
		/** Pre-close hook for escape. Return false to prevent close. */
		preEscapeClose?: () => any;
		/** Pre-close hook. Return false to prevent close. */
		preClose?: () => any;
		/** ID reference for aria-labelledby */
		ariaLabelledby?: string;
		/** ID reference for aria-describedby */
		ariaDescribedby?: string;
		/** Disable body scroll lock when dialog is open */
		noScrollLock?: boolean;
	}
</script>

<script lang="ts">
	import { onClickOutside } from "runed";
	import { onDestroy, onMount, tick } from "svelte";
	import { focusTrap } from "../../actions/focus-trap.js";
	import { stopPropagation } from "../../utils/event-modifiers.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import { createClog } from "@marianmeres/clog";
	import { waitForNextRepaint } from "../../utils/paint.js";
	import { BodyScroll } from "../../utils/body-scroll-locker.js";

	const clog = createClog("ModalDialog").debug;

	let {
		class: classProp,
		classDialog,
		children,
		noClickOutsideClose,
		type,
		noEscapeClose,
		preEscapeClose,
		preClose,
		ariaLabelledby,
		ariaDescribedby,
		noScrollLock,
	}: Props = $props();

	// important to start as undefined (because of scroll save/restore)
	let visible: boolean | undefined = $state(undefined);

	let dialog = $state<HTMLDialogElement>()!;
	let box = $state<HTMLDivElement>()!;
	let _opener: undefined | null | HTMLElement = $state();
	let _isClosing = false;

	export function open(openerOrEvent?: null | HTMLElement | MouseEvent) {
		if (visible) return; // Already open
		visible = true;
		setOpener(
			openerOrEvent instanceof MouseEvent
				? (openerOrEvent.currentTarget as HTMLElement)
				: openerOrEvent ?? (document.activeElement as HTMLElement)
		);
		// dialog must be rendered in the DOM before it can be opened...
		waitForNextRepaint().then(() => {
			try {
				dialog?.showModal();
			} catch (e) {
				console.error("ModalDialog: Failed to open dialog:", e);
				visible = false;
			}
		});
	}

	export function close() {
		if (_isClosing || !visible) return;
		_isClosing = true;
		(async () => {
			try {
				const allowed = await preClose?.();
				// explicit false prevents close
				if (allowed !== false) {
					dialog?.close();
					visible = false;
					_opener?.focus();
					_opener = null;
				}
			} finally {
				_isClosing = false;
			}
		})();
	}

	export function setOpener(opener?: null | HTMLElement) {
		_opener = opener;
	}

	export function visibility() {
		return {
			get visible() {
				return visible;
			},
		};
	}

	onClickOutside(
		() => box,
		() => !noClickOutsideClose && close()
	);

	$effect(() => {
		// noop if we're undefined ($effect runs immediately as onMount)
		if (visible === undefined || noScrollLock) return;
		visible ? BodyScroll.lock() : BodyScroll.unlock();
	});

	// we need onDestroy as well
	// Note, that this will also reset if nested... (which is not desired, but ignoring)
	onDestroy(BodyScroll.unlock);

	// $inspect("Modal dialog mounted, is visible:", visible).with(clog);
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
{#if visible}
	<dialog
		bind:this={dialog}
		use:focusTrap
		data-type={type}
		aria-labelledby={ariaLabelledby}
		aria-describedby={ariaDescribedby}
		class={twMerge(
			"stuic-modal-dialog",
			"fixed inset-4 m-auto size-auto",
			"flex justify-center items-center",
			"focus:outline-none focus-visible:outline-none",
			"bg-transparent",
			classDialog
		)}
		onclick={(e) => {
			// Close when clicking directly on the dialog (backdrop area), not its children
			if (e.target === dialog && !noClickOutsideClose) {
				close();
			}
		}}
		onkeydown={async (e) => {
			if (e.key === "Escape" && visible) {
				// clog("on Escape keydown, preventing default and stopping propagation");

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
			class={twMerge("box relative size-full overflow-auto", classProp)}
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
