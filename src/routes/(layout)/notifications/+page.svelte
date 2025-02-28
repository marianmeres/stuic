<script lang="ts">
	import { Button, Notifications, NotificationsStack } from "$lib/index.js";
	import { dummySentence } from "../../_utils/dummy-text.js";

	const fixed = dummySentence(1);
	const notifications = new NotificationsStack([], {
		// defaultTtl: 10_000,
		disposeInterval: 1_000,
	});
</script>

<Button
	onclick={() => {
		notifications.info(dummySentence(1));
	}}>info</Button
>

<Button
	onclick={() => {
		notifications.warn(dummySentence(1));
	}}>warn</Button
>

<Button
	onclick={() => {
		notifications.error(dummySentence(1));
	}}>error</Button
>

<Button
	onclick={() => {
		notifications.success(dummySentence(1));
	}}>success</Button
>

<Button
	onclick={() => {
		notifications.info(fixed, { ttl: 0 });
	}}>eternal</Button
>

<Notifications {notifications} class="" />

<pre class="text-xs mt-4 opacity-75">{JSON.stringify(notifications.stack, null, 2)}</pre>
