<script lang="ts">
	import { createClog } from '@marianmeres/clog';
	import {
		iconBs1CircleFill,
		iconBs2CircleFill,
		iconBsArrowLeftRight,
	} from '@marianmeres/icons-fns';
	import {
		AlertConfirmPrompt,
		createAlert,
		createAlertConfirmPromptStore,
		createConfirm,
		createPrompt,
	} from '../../lib';
	import { AlertConfirmPromptConfig } from '../../lib/components/AlertConfirmPrompt/AlertConfirmPrompt.svelte';
	import Layout from '../_components/Layout.svelte';
	import { dummySentence } from '../_utils/dummy-text';
	import FooContent from './FooContent.svelte';
	import { sleep } from './sleep';

	const clog = createClog('alert-confirm-prompt page');
	const acp = createAlertConfirmPromptStore();

	AlertConfirmPromptConfig.variant.error.icon += `
		bg-red-100 text-red-500
	`.trim();

	AlertConfirmPromptConfig.classButton = 'border-0';

	const alert = createAlert(acp);
	const confirm = createConfirm(acp, { forceAsHtml: true });
	const prompt = createPrompt(acp);
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
						props: { context },
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
</Layout>

<AlertConfirmPrompt {acp} />
