<script lang="ts">
	import { onMount } from 'svelte';
	import {
		AlertConfirmPrompt,
		createAlertConfirmPromptStore,
		createAlert,
		createConfirm,
		createPrompt,
	} from '../../lib';
	import Layout from '../_components/Layout.svelte';
	import { dummySentence } from '../_utils/dummy-text';
	import { createClog } from '@marianmeres/clog';
	import { sleep } from './sleep';
	import { AlertConfirmPromptConfig } from '../../lib/components/AlertConfirmPrompt/AlertConfirmPrompt.svelte';
	import { iconBs0Circle, iconBs1CircleFill } from '@marianmeres/icons-fns';

	const clog = createClog('alert-confirm-prompt page');
	const acp = createAlertConfirmPromptStore();

	AlertConfirmPromptConfig.variant.error.icon += `
		bg-red-100 text-red-500
	`.trim();

	AlertConfirmPromptConfig.classButton = 'border-0';
</script>

<Layout>
	<div class="space-x-4">
		<button
			class="border px-2 m-2"
			on:click={async () => await createAlert(acp)(dummySentence(5))}
		>
			alert
		</button>

		<button
			class="border px-2 m-2"
			on:click={async () =>
				await createConfirm(acp)(dummySentence(3), {
					variant: 'success',
					title: 'Are you sure?',
				})}
		>
			confirm (success)
		</button>

		<button
			class="border px-2 m-2"
			on:click={async () =>
				await createConfirm(acp)(dummySentence(3), { variant: 'warn' })}
		>
			confirm (warn)
		</button>

		<button
			class="border px-2 m-2"
			on:click={async () =>
				await createConfirm(acp)(dummySentence(3), { variant: 'error' })}
		>
			confirm (error)
		</button>

		<button
			class="border px-2 m-2"
			on:click={async () =>
				await createConfirm(acp)(dummySentence(3), {
					iconFn: () => iconBs1CircleFill({ size: 24 }),
				})}
		>
			confirm (custom icon)
		</button>

		<button
			class="border px-2 m-2"
			on:click={async () => clog(await createConfirm(acp)(dummySentence(3)))}
		>
			confirm
		</button>

		<button
			class="border px-2 m-2"
			on:click={async () =>
				clog(await createConfirm(acp)(dummySentence(3), { iconFn: false }))}
		>
			confirm (no icon)
		</button>

		<button
			class="border px-2 m-2"
			on:click={async () => clog(await createPrompt(acp)(dummySentence(2)))}
		>
			prompt
		</button>

		<button
			class="border px-2 m-2"
			on:click={async () => {
				clog(
					await createConfirm(acp)(dummySentence(3), {
						labelCustom: 'Custom',
						onCustom: async () => {
							await sleep(10_000);
							acp.close();
						},
					})
				);
			}}
		>
			confirm with custom
		</button>
	</div>
</Layout>

<AlertConfirmPrompt {acp} />
