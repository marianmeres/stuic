<script lang="ts">
	import { iconBsAsterisk } from '@marianmeres/icons-fns/bootstrap/iconBsAsterisk.js';
	import { createNotificationsStore } from '../../lib';
	import Notifications from '../../lib/components/Notifications/Notifications.svelte';
	import Layout from '../_components/Layout.svelte';
	import { dummySentence } from '../_utils/dummy-text';
	import CustomContent from './CustomContent.svelte';

	const notifications = createNotificationsStore([], {
		defaultTtl: 120,
	});

	const foo = dummySentence(1);
	const bar = dummySentence(2);
</script>

<Layout>
	<button on:click={() => notifications.info(bar, { count: 13 })}> info </button>
	<button on:click={() => notifications.warn(dummySentence(2))}>warn</button>
	<button on:click={() => notifications.error(dummySentence(2))}>error</button>
	<button on:click={() => notifications.success(dummySentence(4))}>success</button>
	<button
		on:click={() =>
			notifications.info(
				{ component: CustomContent },
				{
					class: { button: 'hidden' },
					iconFn: () => iconBsAsterisk({ size: 40, class: 'text-red-400' }),
				}
			)}
	>
		custom
	</button>
	<button on:click={() => notifications.info(foo)}>repeat</button>
</Layout>

<Notifications
	{notifications}
	classes={{
		box: 'border border-4 border-neutral-950',
	}}
	classesByType={{
		error: {
			box: 'border-orange-500',
		},
		warn: {
			box: 'border-orange-500',
		},
		success: {
			box: 'border-lime-500',
		},
	}}
/>
