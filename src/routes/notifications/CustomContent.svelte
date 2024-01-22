<script lang="ts">
	import { createClog } from '@marianmeres/clog';
	import Switch from '../../lib/components/Switch/Switch.svelte';
	import { tooltip, type createNotificationsStore, type Notification } from '../../lib';
	const clog = createClog('CustomContent');

	export let notification: Notification;
	export let notifications: ReturnType<typeof createNotificationsStore>;
</script>

<div>
	This is
	<span aria-label="Foo" use:tooltip>
		<Switch
			size="xs"
			class="data-[checked=true]:bg-red-500"
			on:change={({ detail }) => clog(detail)}
		/>
	</span>
	external.

	<button
		class="underline"
		on:click={() => {
			notifications.remove(notification.id);
		}}
		aria-label="Hey ho let's go"
		use:tooltip
	>
		Close here.
	</button>
</div>
