<script lang="ts">
	import Button from "../../../lib/components/Button/Button.svelte";
	import ButtonGroupRadio from "../../../lib/components/ButtonGroupRadio/ButtonGroupRadio.svelte";
	import { Notifications, NotificationsStack } from "../../../lib/index.js";

	const notifications = new NotificationsStack([], {
		defaultTtl: 2_000,
		// disposeInterval: 1_000,
	});

	let value = $state<any>(null);
	let activeIndex = $state<number | undefined>(1);
</script>

<div class="space-x-4">
	<Button>before</Button>

	<ButtonGroupRadio
		bind:value
		options={[
			{ label: "Option A", value: "a" },
			{ label: "Option B", value: "b" },
			{ label: "Option C", value: "c" },
			{ label: "Option D", value: "d" },
			{ label: "Option E", value: "e" },
			{ label: "Option F", value: "f" },
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
		buttonProps={(i) => {
			if (i === 5) return { disabled: true };
		}}
	/>
	<!-- classButtonActive="bg-red-500 text-white hover:bg-red-600 hover:text-white shadow-none" -->

	<Button>after</Button>
</div>

<div class="mt-8">
	<hr />
	{JSON.stringify(value)}
	({activeIndex})
</div>

<Notifications {notifications} />
