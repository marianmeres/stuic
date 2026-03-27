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

<div class="space-x-4 space-y-4">
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
		class="max-w-2xl"
	/>
	<!-- classButtonActive="bg-red-500 text-white hover:bg-red-600 hover:text-white shadow-none" -->

	<Button>after</Button>

	<h3 class="mt-8 font-semibold">Pricing toggle style</h3>
	<ButtonGroupRadio
		options={["Monthly", "Annual"]}
		class="max-w-xs"
		style="
			--stuic-button-group-radius: 9999px;
			--stuic-button-group-padding: 0.25rem;
			--stuic-button-group-bg: var(--stuic-color-muted);
			--stuic-button-group-border-width: 0;
			--stuic-button-group-button-bg-active: var(--stuic-color-background);
			--stuic-button-group-button-text-active: var(--stuic-color-foreground);
			--stuic-button-group-button-bg-active-hover: var(--stuic-color-background);
			--stuic-button-group-button-text-active-hover: var(--stuic-color-foreground);
		"
		classButtonActive="shadow"
	/>
</div>

<div class="mt-8">
	<hr />
	{JSON.stringify(value)}
	({activeIndex})
</div>

<Notifications {notifications} />
