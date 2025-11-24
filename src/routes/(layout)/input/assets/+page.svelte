<script lang="ts">
	import {
		FieldAssets,
		getId,
		Notifications,
		NotificationsStack,
		sleep,
		type AssetWithBlobUrl,
	} from "$lib/index.js";
	import { createTickerRAF } from "@marianmeres/ticker";
	// import { type AssetWithBlobUrl } from "../../../../lib/components/Input/FieldAssets.svelte";

	const notifications = new NotificationsStack([], {
		// defaultTtl: 10_000,
		// disposeInterval: 1_000,
	});

	let values = $state({
		a: JSON.stringify([
			{ id: "0", url: "/assets/00.jpg", name: "00.jpg", type: "image/jpeg" },
			{ id: "1", url: "/assets/01.jpg", name: "01.jpg", type: "image/jpeg" },
			{ id: "2", url: "/assets/02.jpg", name: "02.jpg", type: "image/jpeg" },
			{ id: "99", url: "/assets/README.md", name: "README.md" },
			{ id: "3", url: "/assets/03.jpg", name: "03.jpg", type: "image/jpeg" },
			{ id: "4", url: "/assets/04.jpg", name: "04.jpg", type: "image/jpeg" },
			{ id: "5", url: "/assets/05.jpg", name: "05.jpg", type: "image/jpeg" },
		]),
	});
</script>

<Notifications {notifications} />

<FieldAssets
	bind:value={values.a}
	name="a"
	label="Assets"
	{notifications}
	processAssets={async (assets, onProgress) => {
		console.log("simulate upload to server...", assets);

		let out: AssetWithBlobUrl[] = [];
		for (const ass of assets ?? []) {
			const blobUrl = ass.id;

			// if we were truly uploading (here we are not), this how we would create
			// the FormData suitable File object
			// const file = await fileFromBlobUrl(blobUrl, ass.name, ass.type);

			out.push({
				id: getId("uploaded-"),
				url: { thumb: blobUrl, full: blobUrl, original: blobUrl },
				type: ass.type,
				name: ass.name,
				blobUrl, // so we can pair it
			});
		}

		// simulate onProgress
		const duration = 5_000;
		let progress = 0;
		const ticker = createTickerRAF(duration / 10, true);
		const unsub = ticker.subscribe(() => {
			for (const ass of assets ?? []) {
				progress += 10;
				onProgress?.(ass.id, progress);
			}
		});

		await sleep(duration);
		unsub();

		return out;
	}}
	labelLeftBreakpoint={0}
	withOnProgress
/>
