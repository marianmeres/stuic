<script lang="ts" context="module">
	import { createEventDispatcher, onMount } from 'svelte';
	import { focusTrap } from '../../actions/focus-trap.js';
	import { writable, type Writable } from 'svelte/store';

	export interface ModalDialogAPI {
		open: () => void;
		close: () => void;
		isOpen: Writable<boolean>;
	}
</script>

<script lang="ts">
	const dispatch = createEventDispatcher();

	// sane defaults
	export let openOnMount = false;
	export let closeOnOutsideClick = true;
	export let closeOnEscape = true;

	// classes and styles here are meant for special cases (typically drop shadow, transparent bg)...
	// all other styling should be preferably done within the internal slot
	let _class = '';
	export { _class as class };
	export let style = '';

	export let backdropFadeIn: false | 'normal' | 'slow' = 'normal';

	//
	let _el: HTMLDialogElement;
	let _open = !!openOnMount;

	// for parent consumption
	export function toggle() {
		_open = !_open;
	}
	export function open() {
		_open = true;
	}
	export function close() {
		_open = false;
	}

	//
	$: _open ? _el?.showModal() : _el?.close();
	$: dispatch(_open ? 'open' : 'close');

	// readonly for parent consumption
	export const isOpen = writable<boolean>(_open);
	$: $isOpen = _open;

	onMount(() => {
		const _unsubs: CallableFunction[] = [];

		//
		const _handleClose = (e: Event) => close();
		_el.addEventListener('close', _handleClose);
		_unsubs.push(() => _el.removeEventListener('close', _handleClose));

		// prevent builtin cancel
		const _handleCancel = (e: Event) => e.preventDefault();
		_el.addEventListener('cancel', _handleCancel);
		_unsubs.push(() => _el.removeEventListener('cancel', _handleCancel));

		// handle cancel manually
		const _handleKeyDown = (e: KeyboardEvent) => {
			if (_open && closeOnEscape && e.key === 'Escape') {
				e.stopPropagation();
				close();
			}
		};
		document.addEventListener('keydown', _handleKeyDown, true);
		_unsubs.push(() => document.removeEventListener('keydown', _handleKeyDown, true));

		// close on outside click ("outside" is actualy the dialog's backdrop here... that's
		// why we're not using the onOutside action)
		const _handleClick = (e: MouseEvent) => {
			_open && closeOnOutsideClick && /dialog/i.test(e.target?.tagName) && close();
		};
		_el.addEventListener('click', _handleClick);
		_unsubs.push(() => _el.removeEventListener('click', _handleClick));

		// return unsub all
		return () => _unsubs.forEach((fn) => fn());
	});
</script>

<!-- 
    NOTE: the below padding:0 is important because of otherwise not-trivial onOutsideClick implementation
-->
<dialog
	bind:this={_el}
	use:focusTrap={{ enabled: _open }}
	style="{style ? `${style}; ` : ''}padding: 0 !important;"
	class={`${_class} ${backdropFadeIn || ''}`}
>
	{#if _open}
		<slot />
	{/if}
</dialog>

<style>
	dialog.normal[open]::backdrop {
		animation: fade 0.15s ease-out;
	}

	dialog.slow[open]::backdrop {
		animation: fade 0.5s ease-out;
	}

	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
