<script lang="ts">
	import { createClog } from '@marianmeres/clog';
	import { iconBsEye } from '@marianmeres/icons-fns/bootstrap/iconBsEye.js';
	import { iconBsEyeSlash } from '@marianmeres/icons-fns/bootstrap/iconBsEyeSlash.js';
	import { createEventDispatcher } from 'svelte';
	import { twMerge } from 'tailwind-merge';
	import { trim } from '../../actions/trim.js';
	import { validate as validateAction } from '../../actions/validate.js';
	import type { ValidateOptions, ValidationResult } from '../../actions/validate.js';
	import { getId } from '../../utils/get-id.js';
	import { iconBsX } from '@marianmeres/icons-fns/bootstrap/iconBsX.js';

	const dispatch = createEventDispatcher();
	const clog = createClog('PinInput');

	export let tabindex = 0;

	export let id = getId();
	export let name: string;
	export let value: string;
	export let inputClass: string;
	export let placeholder: string | undefined;
	export let length: number = 4;

	export let pattern: string | undefined = undefined;
	export let autofocus: true | undefined = undefined;
	export let disabled = false;
	export let readonly = false;
	export let required = false; // valueMissing

	//
	export let validate: ValidateOptions | true | undefined = undefined;

	// let validation: ValidationResult;
	// const setValidationResult = (res: ValidationResult) => (validation = res);
	// export let validation: ValidationResult;
	export let setValidationResult;

	//
	export let masked: boolean = false;
	let _unmasked = false;

	export let showX = false;

	export let pinCellClass = '';

	let _inputEl: HTMLInputElement | HTMLTextAreaElement;
	$: if (_inputEl) dispatch('input_mounted', _inputEl);

	//
	$: if (length < 2) length = 2;
	$: if (length > 12) length = 12;

	//
	$: if (value.length > length) value = value.slice(0, length);
	$: _chars = value
		.split('')
		.slice(0, length)
		.map((c) => {
			return masked && !_unmasked ? '*' : c;
		});
	$: _cells = new Array(length);

	//
	let w = 0;

	// prettier-ignore
	const gridCols = [
		'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5', 'grid-cols-6',
		'grid-cols-7', 'grid-cols-8', 'grid-cols-9', 'grid-cols-10', 'grid-cols-11',
		'grid-cols-12',
	];

	// this is too buggy
	// let cursorPos = -1;
	// const getCursorPos = () => {
	// 	const start = _inputEl?.selectionStart ?? 0;
	// 	const end = _inputEl?.selectionEnd ?? 0;
	// 	cursorPos = start === end ? start : -1;
	// };

	// const events = ['mousedown', 'mouseup', 'input', 'keydown'];
	// onMount(() => {
	// 	events.forEach((e) => _inputEl.addEventListener(e, getCursorPos));
	// 	return () => {
	// 		events.forEach((e) => _inputEl.removeEventListener(e, getCursorPos));
	// 	};
	// });
</script>

<div class="relative w-full">
	<div class="absolute inset-0 grid {gridCols[length - 2]} pointer-events-none p-1 gap-1">
		{#each _cells as c, idx (idx)}
			<div
				class={twMerge(
					'flex items-center justify-center rounded bg-black/10 font-mono',
					pinCellClass
				)}
			>
				{#if _chars[idx]}
					<span class="">{_chars[idx] || ''}</span>
				{:else if !_chars.length}
					<span class="opacity-25">{placeholder?.[idx] || ''}</span>
				{/if}
			</div>
		{/each}
	</div>
	<div class="aboslute inset-0" bind:clientWidth={w}>
		<input
			bind:value
			bind:this={_inputEl}
			{id}
			type="text"
			spellcheck="false"
			class={twMerge(
				'caret-black',
				inputClass,
				`font-mono text-transparent dark:text-transparent`
			)}
			class:cursor-not-allowed={disabled}
			style="
                padding-left: {100 / length / 2}%; 
                padding-right: {100 / length / 2}%; 
                letter-spacing: calc({w / length}px - 1ch);
            "
			{name}
			minlength={length}
			maxlength={length}
			{disabled}
			{readonly}
			{required}
			{autofocus}
			{tabindex}
			{pattern}
			use:trim
			use:validateAction={validate
				? { ...(validate === true ? {} : validate), setValidationResult }
				: undefined}
			on:blur
			on:change
			on:click
			on:focus
			on:input
			on:keydown
			on:keyup
			on:touchstart|passive
			on:touchend|passive
			on:touchmove|passive
			on:touchcancel
			on:mouseenter
			on:mouseleave
			{...$$restProps}
		/>
	</div>
</div>
{#if showX || masked}
	<div class="flex items-center justify-center mr-1">
		{#if showX}
			<button type="button" class="p-2" on:click={() => (value = '')}>
				{@html iconBsX()}
			</button>
		{/if}
		{#if masked}
			<button
				type="button"
				class="p-2 focus:outline-0"
				on:click={() => (_unmasked = !_unmasked)}
			>
				{#if _unmasked}
					{@html iconBsEye()}
				{:else}
					{@html iconBsEyeSlash()}
				{/if}
			</button>
		{/if}
	</div>
{/if}
