<script lang="ts" context="module">
	import { createClog } from '@marianmeres/clog';
	import { onMount } from 'svelte';
	import { twMerge } from 'tailwind-merge';
	import {
		AlertConfirmPromptType,
		Button,
		Field,
		FieldSelect,
		Notifications,
		Thc,
		createAlertConfirmPromptStore,
		createNotificationsStore,
		focusTrap,
		type NOTIFICATIONS_POSX,
		type NOTIFICATIONS_POSY,
	} from '../../index.js';
	import { acpDefaultIcons } from './acp-icons.js';
	import type {
		AlertConfirmPromptKnownClasses,
		AlertConfirmPromptOptions,
		AlertConfirmPromptVariant,
	} from './alert-confirm-prompt.js';

	export interface AlertConfirmPromptIcons
		extends Record<AlertConfirmPromptVariant, () => string> {
		spinner: () => string;
	}

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
			`,
			icon: `
				size-12 sm:size-10
				mt-1 mb-4 sm:my-0 sm:mr-5
				mx-auto 
				flex flex-shrink-0 items-center justify-center 
				rounded-full 
				bg-neutral-100 text-black/50
			`,
			contentBlock: `mt-3 sm:mt-0 sm:flex-1`,
			title: `
				text-center sm:text-left
				text-base font-semibold leading-6 text-black/90
			`,
			content: `
				mt-2 mx-3 sm:mx-0
				text-center sm:text-left
				text-sm text-black/75
			`,
			inputBox: `mt-3`,
			inputField: `m-0`,
			menu: `
				mt-6
				sm:flex sm:space-x-4 justify-end
				space-y-3 sm:space-y-0
			`,
			menuLi: `flex-1 sm:flex-none w-full sm:w-auto sm:inline-block`,
			button: `w-full min-w-24 text-center inline-block`,
			spinnerBox: `
				absolute inset-0 flex justify-center items-center
				rounded-lg
				bg-white/75
			`,
		};

		// prettier-ignore
		static presetByVariant = {
			info:    { dialog: '', icon: '', contentBlock: '', title: '', content: '', inputBox: '', inputField: '', menu: '', button: '', spinnerBox: '' },
			success: { dialog: '', icon: '', contentBlock: '', title: '', content: '', inputBox: '', inputField: '', menu: '', button: '', spinnerBox: '' },
			warn:    { dialog: '', icon: '', contentBlock: '', title: '', content: '', inputBox: '', inputField: '', menu: '', button: '', spinnerBox: '' },
			error:   { dialog: '', icon: '', contentBlock: '', title: '', content: '', inputBox: '', inputField: '', menu: '', button: '', spinnerBox: '' },
		};
	}

	const _isFn = (v: any) => typeof v === 'function';
</script>

<script lang="ts">
	const { ALERT, CONFIRM, PROMPT } = AlertConfirmPromptType;
	const clog = createClog('AlertConfirmPrompt');

	// ADVANCED OPTIONAL FEATURE: allow notifs on top layer as well if needed...
	export let notifications: ReturnType<typeof createNotificationsStore> | undefined =
		undefined;
	export let notificationsPositionConfig: Partial<{
		posX: NOTIFICATIONS_POSX;
		posXMobile: NOTIFICATIONS_POSX;
		posY: NOTIFICATIONS_POSY;
		posYMobile: NOTIFICATIONS_POSY;
	}> = {};

	// instance created by createAlertConfirmPromptStore()
	export let acp: ReturnType<typeof createAlertConfirmPromptStore>;

	export let forceAsHtml: boolean | undefined = undefined;
	export let defaultIcons: Partial<AlertConfirmPromptIcons> = acpDefaultIcons;

	export let classes: Partial<AlertConfirmPromptKnownClasses> = {};
	export let classesByVariant: Partial<
		Record<AlertConfirmPromptVariant, Partial<AlertConfirmPromptKnownClasses>>
	> = {};
	// $: clog(classesByVariant);

	//
	$: dialog = $acp[0];
	// $: clog(1111111, dialog);

	//
	let _dialogEl: HTMLDialogElement;

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
			e.stopImmediatePropagation();
			if (!isPending) return acp.escape();
		}
	};

	onMount(() => {
		// _dialogEl.addEventListener('close', async (e: Event) => {
		// if (_dialogEl.returnValue === '') acp.escape(); // not needed
		// });

		// prevent built in escape
		_dialogEl.addEventListener('cancel', (e: Event) => {
			// clog.debug('cancel');
			e.preventDefault();
		});

		//
		document.addEventListener('keydown', onKeyDown, true);
		return () => document.removeEventListener('keydown', onKeyDown, true);
	});

	const _collectClasses = (
		o: AlertConfirmPromptOptions,
		k: keyof AlertConfirmPromptKnownClasses
	) => [
		AlertConfirmPromptConfig?.preset?.[k] || '',
		classes?.[k] || '',
		AlertConfirmPromptConfig.presetByVariant?.[o?.variant]?.[k] || '',
		classesByVariant?.[o?.variant]?.[k] || '',
		o?.class?.[k] || '',
	];

	$: _dialogClass = twMerge(..._collectClasses(dialog, 'dialog'));
	$: _iconClass = twMerge(..._collectClasses(dialog, 'icon'));
	$: _contentBlockClass = twMerge(..._collectClasses(dialog, 'contentBlock'));
	$: _titleClass = twMerge(..._collectClasses(dialog, 'title'));
	$: _contentClass = twMerge(..._collectClasses(dialog, 'content'));
	$: _inputBoxClass = twMerge(..._collectClasses(dialog, 'inputBox'));
	$: _inputFieldClass = twMerge(..._collectClasses(dialog, 'inputField'));
	$: _menuClass = twMerge(..._collectClasses(dialog, 'menu'));
	$: _menuLiClass = twMerge(AlertConfirmPromptConfig.preset.menuLi);
	$: _buttonClass = twMerge(..._collectClasses(dialog, 'button'));
	$: _spinnerBoxClass = twMerge(..._collectClasses(dialog, 'spinnerBox'));

	//
	$: iconFn = dialog?.iconFn ?? defaultIcons?.[dialog?.variant];
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
		{#key dialog.id}
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
		{/key}
	{/if}

	{#if notifications}
		<Notifications {notifications} {...notificationsPositionConfig || {}} />
	{/if}
</dialog>

<style lang="scss">
	// prettier-ignore
	@keyframes -global-rotating-cw { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
	.rotating-cw {
		animation: rotating-cw 0.6s linear infinite;
	}
</style>
