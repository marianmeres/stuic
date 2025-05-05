<script lang="ts">
	import { createClog } from "@marianmeres/clog";
	import { Notifications, NotificationsStack } from "$lib/index.js";
	import TestForm from "./TestForm.svelte";
	const clog = createClog("input");

	const notifications = new NotificationsStack([], {
		// defaultTtl: 10_000,
		// disposeInterval: 1_000,
	});
	// $inspect(123, input);
</script>

<TestForm {notifications} />

<Notifications {notifications} />
