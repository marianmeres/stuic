<script lang="ts">
	import { onClickOutside } from "runed";
	import { tick, type Snippet } from "svelte";
	import { focusTrap } from "../../actions/focus-trap.js";
	import { twMerge } from "../../utils/tw-merge.js";

	import "../../stuic.css";
	import "./modal-dialog.css";

	interface Props {
		visible?: boolean;
		class?: string;
		children: Snippet;
		noClickOutsideClose?: boolean;
		noEscapeClose?: boolean;
	}

	let {
		visible = $bindable(),
		class: classProp,
		children,
		noClickOutsideClose,
		noEscapeClose,
	}: Props = $props();

	let dialog = $state<HTMLDialogElement>()!;

	onClickOutside(
		() => dialog,
		() => !noClickOutsideClose && (visible = false)
	);

	$effect(() => {
		if (visible) {
			tick().then(() => dialog.showModal());
		} else {
			dialog?.close();
		}
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
{#if visible}
	<dialog
		bind:this={dialog}
		use:focusTrap
		class={twMerge("stuic-modal-dialog", classProp)}
		onkeydown={(e) => {
			if (e.key === "Escape") {
				e.preventDefault();
				!noEscapeClose && (visible = false);
			}
		}}
	>
		{@render children?.()}
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
