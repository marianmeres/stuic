<script lang="ts" context="module">
	import { onMount } from 'svelte';
	import {
		AlertConfirmPromptType,
		Button,
		FieldSelect,
		createAlertConfirmPromptStore,
		focusTrap,
		Field,
		Thc,
	} from '../../index.js';
	import { twMerge } from 'tailwind-merge';
	import { acpDefaultIcons } from './acp-icons.js';
	import { createClog } from '@marianmeres/clog';

	export class AlertConfirmPromptConfig {
		// sane defaults which perhaps should stay untouched
		static preset = {
			dialog: `
				relative
				w-full sm:max-w-xl 
				mx-auto 
				p-5 sm:p-6
				bg-white text-black 
				dark:bg-black dark:text-white 
				rounded-lg 
				transition-all
				shadow-xl
				focus-within:outline-0 focus-within:ring-0
			`.trim(),
			icon: `
				size-12 sm:size-10
				mt-1 mb-4 sm:my-0 sm:mr-5
				mx-auto 
				flex flex-shrink-0 items-center justify-center 
				rounded-full 
				bg-neutral-100 text-black/50
			`.trim(),
			contentBlock: `
				mt-3 sm:mt-0 sm:flex-1
			`.trim(),
			title: `
				text-center sm:text-left
				text-base font-semibold leading-6 text-black/90
			`.trim(),
			content: `
				mt-2 mx-3 sm:mx-0
				text-center sm:text-left
				text-sm text-black/75
			`.trim(),
			inputBox: `
				mt-3
			`.trim(),
			inputField: `
				m-0
			`.trim(),
			menu: `
				mt-6
				sm:flex sm:space-x-4 justify-end
				space-y-3 sm:space-y-0
			`.trim(),
			menuLi: `
				flex-1 sm:flex-none w-full sm:w-auto sm:inline-block
			`.trim(),
			button: `
				w-full min-w-24 text-center inline-block
			`.trim(),
			spinnerBox: `
				absolute inset-0 flex justify-center items-center
				rounded-lg
				bg-white/75
			`.trim(),
		};

		// main userland configuration
		static class = {
			dialog: '',
			icon: '',
			contentBlock: '',
			title: '',
			content: '',
			inputBox: '',
			inputField: '',
			menu: '',
			// menuLi: '',
			button: '',
			spinnerBox: '',
		};

		// 'info' | 'success' | 'warn' | 'error'
		// userlang variant fine tuning
		static variant = {
			info: {
				dialog: '',
				icon: '',
				contentBlock: '',
				title: '',
				content: '',
				inputBox: '',
				inputField: '',
				menu: '',
				// menuLi: '',
				button: '',
				spinnerBox: '',
			},
			success: {
				dialog: '',
				icon: '',
				contentBlock: '',
				title: '',
				content: '',
				inputBox: '',
				inputField: '',
				menu: '',
				// menuLi: '',
				button: '',
				spinnerBox: '',
			},
			warn: {
				dialog: '',
				icon: '',
				contentBlock: '',
				title: '',
				content: '',
				inputBox: '',
				inputField: '',
				menu: '',
				// menuLi: '',
				button: '',
				spinnerBox: '',
			},
			error: {
				dialog: '',
				icon: '',
				contentBlock: '',
				title: '',
				content: '',
				inputBox: '',
				inputField: '',
				menu: '',
				// menuLi: '',
				button: '',
				spinnerBox: '',
			},
		};

		static iconFn = {
			info: undefined,
			success: undefined,
			warn: undefined,
			error: undefined,
			spinner: undefined,
		};

		// conveniently hoisted THC option, since all content is rendered via THC
		static forceAsHtml: boolean | undefined = undefined;
	}

	const _isFn = (v: any) => typeof v === 'function';
</script>

<script lang="ts">
	const { ALERT, CONFIRM, PROMPT } = AlertConfirmPromptType;
	const clog = createClog('AlertConfirmPrompt');

	// instance created by createAlertConfirmPromptStore()
	export let acp: ReturnType<typeof createAlertConfirmPromptStore>;

	//
	$: dialog = $acp[0];
	// $: clog(dialog);

	let forceAsHtml: boolean | undefined = undefined;
	$: if (dialog) {
		forceAsHtml = dialog.forceAsHtml ?? AlertConfirmPromptConfig.forceAsHtml;
	} else {
		forceAsHtml = undefined;
	}

	//
	let _dialogEl: HTMLDialogElement;
	let _formEl: HTMLFormElement;

	//
	let value: any = null;
	let isPending = false;

	//
	$: if (dialog?.type === PROMPT) {
		// https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/returnValue
		if (value === null) value = dialog.value;
	} else {
		value = null;
	}

	// point here is, that we're manipulating the store stack only, not the dom el directly...
	// in other words the open/close works just by watching the stack
	$: if (dialog && _dialogEl) !_dialogEl.hasAttribute('open') && _dialogEl.showModal();
	$: if (!dialog && _dialogEl) _dialogEl.close('cleanup');

	const onKeyDown = (e: KeyboardEvent) => {
		if (!dialog) return;

		if (e.key === 'Escape') {
			// clog.debug('onEscape');
			e.stopPropagation();
			if (!isPending) return acp.escape();
		}
	};

	onMount(() => {
		_dialogEl.addEventListener('close', async (e: Event) => {
			// clog.debug('close');
			// not needed
			// if (_dialogEl.returnValue === '') acp.escape();
		});

		// prevent built in escape
		_dialogEl.addEventListener('cancel', (e: Event) => {
			// clog.debug('cancel');
			e.preventDefault();
		});

		//
		document.addEventListener('keydown', onKeyDown, true);
		return () => document.removeEventListener('keydown', onKeyDown, true);
	});

	$: _dialogClass = twMerge(`
        ${AlertConfirmPromptConfig.preset.dialog}
        ${AlertConfirmPromptConfig.class.dialog}
        ${dialog?.class?.dialog || ''}
        ${AlertConfirmPromptConfig.variant?.[dialog?.variant]?.dialog || ''}
    `);

	$: _iconClass = twMerge(`
		${AlertConfirmPromptConfig.preset.icon}
		${AlertConfirmPromptConfig.class.icon}
		${dialog?.class?.icon || ''}
		${AlertConfirmPromptConfig.variant?.[dialog?.variant]?.icon || ''}
	`);

	$: _contentBlockClass = twMerge(`
		${AlertConfirmPromptConfig.preset.contentBlock}
		${AlertConfirmPromptConfig.class.contentBlock}
		${dialog?.class?.contentBlock || ''}
		${AlertConfirmPromptConfig.variant?.[dialog?.variant]?.contentBlock || ''}
	`);

	$: _titleClass = twMerge(`
		${AlertConfirmPromptConfig.preset.title}
		${AlertConfirmPromptConfig.class.title}
		${dialog?.class?.title || ''}
		${AlertConfirmPromptConfig.variant?.[dialog?.variant]?.title || ''}
	`);

	$: _contentClass = twMerge(`
		${AlertConfirmPromptConfig.preset.content}
		${AlertConfirmPromptConfig.class.content}
		${dialog?.class?.content || ''}
		${AlertConfirmPromptConfig.variant?.[dialog?.variant]?.content || ''}
	`);

	$: _inputBoxClass = twMerge(`
		${AlertConfirmPromptConfig.preset.inputBox}
		${AlertConfirmPromptConfig.class.inputBox}
		${dialog?.class?.inputBox || ''}
		${AlertConfirmPromptConfig.variant?.[dialog?.variant]?.inputBox || ''}
	`);

	$: _inputFieldClass = twMerge(`
		${AlertConfirmPromptConfig.preset.inputField}
		${AlertConfirmPromptConfig.class.inputField}
		${dialog?.class?.inputField || ''}
		${AlertConfirmPromptConfig.variant?.[dialog?.variant]?.inputField || ''}
	`);

	$: _menuClass = twMerge(`
		${AlertConfirmPromptConfig.preset.menu}
		${AlertConfirmPromptConfig.class.menu}
		${dialog?.class?.menu || ''}
		${AlertConfirmPromptConfig.variant?.[dialog?.variant]?.menu || ''}
	`);

	$: _menuLiClass = twMerge(`
		${AlertConfirmPromptConfig.preset.menuLi}
	`);
	// ${AlertConfirmPromptConfig.classMenuLi}
	// ${dialog?.class?.menuLi || ''}
	// ${AlertConfirmPromptConfig.variant?.[dialog?.variant]?.menuLi || ''}

	$: _buttonClass = twMerge(`
		${AlertConfirmPromptConfig.preset.button}
		${AlertConfirmPromptConfig.class.button}
		${dialog?.class?.button || ''}
		${AlertConfirmPromptConfig.variant?.[dialog?.variant]?.button || ''}
	`);

	$: _spinnerBoxClass = twMerge(`
		${AlertConfirmPromptConfig.preset.spinnerBox}
		${AlertConfirmPromptConfig.class.spinnerBox}
		${dialog?.class?.spinnerBox || ''}
		${AlertConfirmPromptConfig.variant?.[dialog?.variant]?.spinnerBox || ''}
	`);

	//
	let iconFn: (() => string) | false = false;
	$: if (dialog?.iconFn === true) {
		// explicit "true" means default, that is:
		iconFn =
			// either runtime config
			AlertConfirmPromptConfig.iconFn[dialog?.variant] ||
			// or fixed default
			acpDefaultIcons[dialog?.variant];
	} else if (dialog?.iconFn) {
		// custom instance
		iconFn = dialog.iconFn;
	} else {
		iconFn = false;
	}
</script>

<dialog
	bind:this={_dialogEl}
	data-acp-type={dialog?.type}
	data-acp-variant={dialog?.variant}
	data-acp-is-pending={isPending}
	class="bg-transparent w-full focus-within:outline-0 focus-within:ring-0"
	tabindex="-1"
>
	{#if dialog}
		<!-- svelte-ignore a11y-autofocus -->
		<form
			method="dialog"
			use:focusTrap={{ autoFocusFirst: false }}
			tabindex="-1"
			autofocus={dialog.type !== PROMPT}
			data-acp-type={dialog?.type}
			data-acp-variant={dialog?.variant}
			data-acp-is-pending={isPending}
			class={_dialogClass}
			bind:this={_formEl}
			on:submit|preventDefault={async () => {
				// clog('on:submit', value);
				isPending = true;
				await Promise.resolve(dialog.onOk(dialog.type === PROMPT ? value : true));
				isPending = false;
				value = null;
			}}
			on:reset|preventDefault={async () => {
				// clog('on:reset', value);
				isPending = true;
				await Promise.resolve(dialog.onCancel(false));
				isPending = false;
				value = null;
			}}
		>
			<!-- this sm:flex is not configurable -->
			<div class="sm:flex sm:items-start">
				{#if _isFn(iconFn)}
					<div
						class={_iconClass}
						data-acp-type={dialog?.type}
						data-acp-variant={dialog?.variant}
						data-acp-is-pending={isPending}
					>
						{@html iconFn()}
					</div>
				{/if}
				<div class={_contentBlockClass}>
					<h1
						class={_titleClass}
						data-acp-type={dialog?.type}
						data-acp-variant={dialog?.variant}
						data-acp-is-pending={isPending}
					>
						<Thc thc={dialog.title} {forceAsHtml} />
					</h1>
					{#if dialog.content}
						<div
							class={_contentClass}
							data-acp-type={dialog?.type}
							data-acp-variant={dialog?.variant}
							data-acp-is-pending={isPending}
						>
							<Thc thc={dialog.content} {forceAsHtml} />
						</div>
					{/if}
					{#if dialog.type === PROMPT}
						<div
							class={_inputBoxClass}
							data-acp-type={dialog?.type}
							data-acp-variant={dialog?.variant}
							data-acp-is-pending={isPending}
						>
							{#if dialog?.promptFieldProps?.options?.length}
								<FieldSelect
									class={_inputFieldClass}
									bind:value
									data-acp-type={dialog?.type}
									data-acp-variant={dialog?.variant}
									data-acp-is-pending={isPending}
									autofocus
									size="sm"
									validate
									{...dialog.promptFieldProps}
								/>
							{:else}
								<Field
									class={_inputFieldClass}
									bind:value
									data-acp-type={dialog?.type}
									data-acp-variant={dialog?.variant}
									data-acp-is-pending={isPending}
									autofocus
									size="sm"
									validate
									{...dialog?.promptFieldProps || {}}
								/>
							{/if}
						</div>
					{/if}
				</div>
			</div>
			<menu
				class={_menuClass}
				data-acp-type={dialog?.type}
				data-acp-variant={dialog?.variant}
				data-acp-is-pending={isPending}
			>
				{#if dialog.type !== ALERT}
					<li
						class={_menuLiClass}
						data-acp-dialog-type={dialog?.type}
						data-acp-variant={dialog?.variant}
						data-acp-is-pending={isPending}
					>
						<Button
							class={_buttonClass}
							type="reset"
							data-acp-button-type="cancel"
							data-acp-dialog-type={dialog?.type}
							data-acp-variant={dialog?.variant}
							data-acp-is-pending={isPending}
							disabled={isPending}
						>
							<Thc thc={dialog.labelCancel} {forceAsHtml} />
						</Button>
					</li>
				{/if}
				{#if dialog.labelCustom && _isFn(dialog.onCustom)}
					<li
						class={_menuLiClass}
						data-acp-dialog-type={dialog?.type}
						data-acp-variant={dialog?.variant}
						data-acp-is-pending={isPending}
					>
						<Button
							class={_buttonClass}
							on:click={async (e) => {
								e.preventDefault();
								isPending = true;
								await Promise.resolve(dialog.onCustom(value));
								isPending = false;
								value = null;
							}}
							type="button"
							data-acp-button-type="custom"
							data-acp-dialog-type={dialog?.type}
							data-acp-variant={dialog?.variant}
							data-acp-is-pending={isPending}
							disabled={isPending}
						>
							<Thc thc={dialog.labelCustom} {forceAsHtml} />
						</Button>
					</li>
				{/if}
				<li
					class={_menuLiClass}
					data-acp-type={dialog?.type}
					data-acp-variant={dialog?.variant}
					data-acp-is-pending={isPending}
				>
					<Button
						class={_buttonClass}
						type="submit"
						value="OK"
						data-acp-button-type="ok"
						data-acp-dialog-type={dialog?.type}
						data-acp-variant={dialog?.variant}
						data-acp-is-pending={isPending}
						disabled={isPending}
						variant="primary"
					>
						<Thc thc={dialog.labelOk} {forceAsHtml} />
					</Button>
				</li>
			</menu>
			{#if isPending}
				<div
					class={_spinnerBoxClass}
					data-acp-type={dialog?.type}
					data-acp-variant={dialog?.variant}
				>
					<div class="rotating-cw">
						{@html acpDefaultIcons.spinner()}
					</div>
				</div>
			{/if}
		</form>
	{/if}
</dialog>

<style lang="scss">
	// prettier-ignore
	@keyframes -global-rotating-cw { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
	.rotating-cw {
		animation: rotating-cw 0.6s linear infinite;
	}
</style>
