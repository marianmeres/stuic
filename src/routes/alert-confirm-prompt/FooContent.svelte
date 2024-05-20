<script lang="ts">
	import type { createNotificationsStore } from '../../lib/components/Notifications/notifications.js';
	import Switch from '../../lib/components/Switch/Switch.svelte';

	export let context: any = {};
	export let notifications: ReturnType<typeof createNotificationsStore>;
</script>

This content is rendered from and external component.
<Switch
	size="xs"
	on:change={({ detail }) => {
		context.result = detail ? 123 : '';
	}}
/>
{context?.result}
<hr />
<button
	type="button"
	class="pt-2"
	on:click={() => {
		notifications.info('knock knock...');
	}}
>
	nofif test
</button>
