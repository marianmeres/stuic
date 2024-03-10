<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { focusTrap } from '../../actions/focus-trap.js';

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

	//
	let _el: HTMLDialogElement;
	let _open = !!openOnMount;

	// for parent consumption
	export const doToggle = () => (_open = !_open);
	export const doOpen = () => (_open = true);
	export const doClose = () => (_open = false);

	//
	$: _open ? _el?.showModal() : _el?.close();
	$: dispatch(_open ? 'open' : 'close');

	// readonly for parent consumption
	export let isOpen = _open;
	$: isOpen = _open;

	onMount(() => {
		const _unsubs: CallableFunction[] = [];

		//
		const _handleClose = (e: Event) => doClose();
		_el.addEventListener('close', _handleClose);
		_unsubs.push(() => _el.removeEventListener('close', _handleClose));

		// prevent builtin cancel
		const _handleCancel = (e: Event) => e.preventDefault();
		_el.addEventListener('cancel', _handleCancel);
		_unsubs.push(() => _el.removeEventListener('cancel', _handleCancel));

		// handle cancel manually
		const _handleKeyDown = (e: KeyboardEvent) =>
			closeOnEscape && e.key === 'Escape' && doClose();
		document.addEventListener('keydown', _handleKeyDown, true);
		_unsubs.push(() => document.removeEventListener('keydown', _handleKeyDown, true));

		// close on outside click ("outside" is actualy the dialog's backdrop here... that's
		// why we're not using the onOutside action)
		const _handleClick = (e: MouseEvent) => {
			closeOnOutsideClick && /dialog/i.test(e.target?.tagName) && doClose();
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
	class={_class}
>
	<slot />
</dialog>
