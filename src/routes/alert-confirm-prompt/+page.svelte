<script lang="ts">
	import { createClog } from '@marianmeres/clog';
	import { iconBs1CircleFill } from '@marianmeres/icons-fns/bootstrap/iconBs1CircleFill.js';
	import { iconBs2CircleFill } from '@marianmeres/icons-fns/bootstrap/iconBs2CircleFill.js';
	import {
		AlertConfirmPrompt,
		Notifications,
		createAlert,
		createAlertConfirmPromptStore,
		createConfirm,
		createNotificationsStore,
		createPrompt,
	} from '../../lib';
	import Layout from '../_components/Layout.svelte';
	import { dummySentence } from '../_utils/dummy-text';
	import FooContent from './FooContent.svelte';
	import { sleep } from './sleep';

	const clog = createClog('alert-confirm-prompt page');
	const acp = createAlertConfirmPromptStore();

	const alert = createAlert(acp);
	const confirm = createConfirm(acp, { forceAsHtml: true });
	const prompt = createPrompt(acp);

	const notifications = createNotificationsStore([], {
		defaultTtl: 120,
	});

	// pro
	$: clog($acp);
</script>

<Layout>
	<div class="space-x-4">
		<button
			class="border px-2 m-2"
			on:click={async () => clog(await alert(dummySentence(5)))}
		>
			alert
		</button>

		<button
			class="border px-2 m-2"
			on:click={async () =>
				clog(
					await alert(dummySentence(5), {
						labelOk: 'Some long OK button custom label',
					})
				)}
		>
			alert (custom button label)
		</button>

		<hr class="my-4" />

		<button
			class="border px-2 m-2"
			on:click={async () =>
				clog(
					await confirm(dummySentence(3), {
						variant: 'success',
						title: 'Are you sure?',
					})
				)}
		>
			confirm (success)
		</button>

		<button
			class="border px-2 m-2"
			on:click={async () => clog(await confirm(dummySentence(3), { variant: 'warn' }))}
		>
			confirm (warn)
		</button>

		<button
			class="border px-2 m-2"
			on:click={async () => clog(await confirm(dummySentence(3), { variant: 'error' }))}
		>
			confirm (error)
		</button>

		<button
			class="border px-2 m-2"
			on:click={async () =>
				clog(
					await createConfirm(acp, {
						// this will be overwritten
						iconFn: () => iconBs1CircleFill({ size: 24 }),
					})(dummySentence(3), {
						iconFn: () => iconBs2CircleFill({ size: 24 }),
					})
				)}
		>
			confirm (custom icon)
		</button>

		<button
			class="border px-2 m-2"
			on:click={async () => clog(await confirm(dummySentence(3)))}
		>
			confirm
		</button>

		<button
			class="border px-2 m-2"
			on:click={async () => {
				clog(await createConfirm(acp, { iconFn: false })(dummySentence(3)));
			}}
		>
			confirm (no icon)
		</button>

		<button
			class="border px-2 m-2"
			on:click={async () => {
				let context = { result: '' };
				const r = await confirm(dummySentence(5), {
					content: {
						component: FooContent,
						props: { context, notifications },
					},
				});
				r && clog(context?.result);
			}}
		>
			confirm (custom content component)
		</button>

		<button
			class="border px-2 m-2"
			on:click={async () => {
				clog(
					await confirm(dummySentence(3), {
						labelCustom: '<i>Custom</i>',
						onCustom: async () => {
							await sleep(3_000);
							acp.close();
						},
					})
				);
			}}
		>
			confirm with custom
		</button>

		<hr class="my-4" />

		<button
			class="border px-2 m-2"
			on:click={async () =>
				clog(
					await prompt(dummySentence(2), '', {
						promptFieldProps: { required: true },
					})
				)}
		>
			prompt
		</button>

		<button
			class="border px-2 m-2"
			on:click={async () =>
				clog(
					await prompt(dummySentence(2), '', {
						promptFieldProps: { type: 'textarea' },
						iconFn: false,
					})
				)}
		>
			prompt textarea no icon
		</button>

		<button
			class="border px-2 m-2"
			on:click={async () =>
				clog(
					await prompt(dummySentence(2), '', {
						value: 'Ho',
						promptFieldProps: {
							options: ['Hey', 'Ho', "Let's", 'Go'],
						},
					})
				)}
		>
			prompt select
		</button>

		<button
			class="border px-2 m-2"
			on:click={async () => {
				await prompt(
					'<a href="https://www.youtube.com/watch?v=krokQtkvd9M" target="_blank">Hint...</a>',
					"let's ...?",
					{
						onOk: (value) => {
							if (/let'?s go/i.test(value)) {
								acp.close();
								notifications?.success('Correct!');
							} else {
								// this is important to reset the dialog's value after submit
								acp.setHeadValue(value);
								notifications?.error('Wrong answer.');
							}
						},
						promptFieldProps: { type: 'textarea' },
						iconFn: false,
						title: 'Hey ho... ?',
					}
				);
			}}
		>
			prompt validate
		</button>

		<hr class="my-4" />

		<button
			class="border px-2 m-2"
			on:click={async () => {
				if (await confirm('Continue?')) {
					alert('Hello "' + (await prompt("What's your name?", 'Foo Bar')) + '"');
				}
			}}
		>
			multiple
		</button>

		<button
			class="border px-2 m-2"
			on:click={async () => {
				await alert('One');
				await alert('Two');
				await alert('Three');
			}}
		>
			triple
		</button>
	</div>
	<hr />
	<button class="p-2 m-4 border" on:click={() => notifications.info('Foo')}>
		trigger test notification
	</button>
</Layout>

<AlertConfirmPrompt
	{acp}
	forceAsHtml
	classes={{
		button: 'border-0',
	}}
	classesByVariant={{
		error: {
			icon: 'bg-red-100 text-red-500',
		},
		success: {
			icon: 'bg-green-100 text-green-500',
		},
		warn: {
			icon: 'bg-orange-100 text-orange-600',
		},
	}}
	{notifications}
/>

<Notifications {notifications} />
