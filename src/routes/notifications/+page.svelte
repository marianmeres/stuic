<script lang="ts">
	import { createNotificationsStore } from '../../lib';
	import Notifications from '../../lib/components/Notifications/Notifications.svelte';
	import Layout from '../_components/Layout.svelte';
	import CustomContent from './CustomContent.svelte';
	import { dummySentence } from '../_utils/dummy-text';
	import {
		iconBs0CircleFill,
		iconBsApple,
		iconBsAsterisk,
		iconHeroMicroAcademicCap,
	} from '@marianmeres/icons-fns';

	const notifications = createNotificationsStore([], {
		defaultTtl: 120,
		class: {
			box: 'border border-4 border-black',
		},
		classByType: {
			error: {
				box: 'border-orange-500',
			},
		},
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
			notifications.success(
				{ component: CustomContent },
				{
					class: { button: 'hidden' },
					iconFn: () => iconBsAsterisk({ size: 40, class: 'text-red-400' }),
				}
			)}
	>
		custom
	</button>
	<button on:click={() => notifications.success(foo)}>repeat</button>
</Layout>

<Notifications {notifications} />
