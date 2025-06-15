<script lang="ts">
	import ButtonGroupRadio from "../../../lib/components/ButtonGroupRadio/ButtonGroupRadio.svelte";
	import { Notifications, NotificationsStack } from "../../../lib/index.js";

	const notifications = new NotificationsStack([], {
		defaultTtl: 2_000,
		// disposeInterval: 1_000,
	});

	let value = $state<any>(null);
	let activeIndex = $state<number | undefined>(1);
</script>

<ButtonGroupRadio
	bind:value
	options={[
		{ label: "Option A" },
		{ label: "Option B" },
		{ label: "Option C" },
		{ label: "Option D" },
		{ label: "Option E" },
		{ label: "Option F" },
	]}
	onButtonClick={(i, coll) => {
		if (i === 3) {
			notifications.warn("index 3 is warned");
		}
		if (i === 4) {
			notifications.error("index 4 is not allowed");
			return false;
		}
	}}
	bind:activeIndex
	classButtonActive="bg-red-500 text-white shadow-none"
	buttonProps={(i) => {
		if (i === 5) return { disabled: true };
	}}
/>
<!-- -->

<div class="mt-8">
	<hr />
	{JSON.stringify(value)}
	({activeIndex})
</div>

<Notifications {notifications} />
