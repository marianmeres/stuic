<script lang="ts">
	import { Button, Notifications, NotificationsStack } from "$lib/index.js";
	import { dummySentence } from "../../_utils/dummy-text.js";

	const fixed = "Short"; // dummySentence(1);
	const fixedLong = dummySentence(5);
	const notifications = new NotificationsStack([], {
		// defaultTtl: 10_000,
		disposeInterval: 1_000,
	});

	let posX = $state<"left" | "center" | "right">("right");
	let posY = $state<"top" | "center" | "bottom">("top");
</script>

<div>
	<div class="space-x-2">
		{#each ["left", "center", "right"] as v}
			<button onclick={() => (posX = v as any)}>{v}</button>
		{/each}
		|
		{#each ["top", "center", "bottom"] as v}
			<button onclick={() => (posY = v as any)}>{v}</button>
		{/each}
	</div>
	<hr class="my-2" />

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

	<Button
		onclick={() => {
			notifications.info(fixedLong, { ttl: 0 });
		}}>eternal long</Button
	>

	<Notifications {notifications} {posX} {posY} />
	<!-- noTheme --color-notif-bg="var(--color-amber-500)" -->

	<pre class="text-xs mt-4 opacity-75">{JSON.stringify(
			notifications.stack,
			null,
			2
		)}</pre>
</div>
