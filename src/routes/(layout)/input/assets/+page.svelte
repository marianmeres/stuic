<script lang="ts">
	import FieldAssets from "$lib/components/Input/FieldAssets.svelte";
	import { Notifications, NotificationsStack } from "$lib/index.js";
	import { ItemCollection, type Item } from "@marianmeres/item-collection";

	const notifications = new NotificationsStack([], {
		// defaultTtl: 10_000,
		// disposeInterval: 1_000,
	});

	let values = $state({
		a: JSON.stringify([
			{ id: "0", url: "/assets/00.jpg", label: "00.jpg", type: "image/jpeg" },
			{ id: "1", url: "/assets/01.jpg", label: "01.jpg", type: "image/jpeg" },
			{ id: "2", url: "/assets/02.jpg", label: "02.jpg", type: "image/jpeg" },
			{ id: "99", url: "/assets/README.md", label: "README.md" },
			{ id: "3", url: "/assets/03.jpg", label: "03.jpg", type: "image/jpeg" },
			{ id: "4", url: "/assets/04.jpg", label: "04.jpg", type: "image/jpeg" },
			{ id: "5", url: "/assets/05.jpg", label: "05.jpg", type: "image/jpeg" },
		]),
	});
</script>

<Notifications {notifications} />

<FieldAssets
	bind:value={values.a}
	name="a"
	label="Assets"
	{notifications}
	processFiles={(files) => {
		console.log("processFiles", files);
		return Promise.resolve();
	}}
	labelLeftBreakpoint={0}
/>
