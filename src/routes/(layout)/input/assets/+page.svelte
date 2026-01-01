<script lang="ts">
	import {
		Button,
		FieldAssets,
		getId,
		Notifications,
		NotificationsStack,
		onSubmitValidityCheck,
		sleep,
		type FieldAssetWithBlobUrl,
	} from "$lib/index.js";
	import { createClog } from "@marianmeres/clog";
	import { createTicker, createTickerRAF } from "@marianmeres/ticker";
	import { onMount, tick } from "svelte";
	// import { type AssetWithBlobUrl } from "../../../../lib/components/Input/FieldAssets.svelte";

	const clog = createClog("field assets page");

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
			// { id: "4", url: "/assets/04.jpg", name: "04.jpg", type: "image/jpeg" },
			// { id: "5", url: "/assets/05.jpg", name: "05.jpg", type: "image/jpeg" },
		]),
	});

	let f = $state<HTMLFormElement>()!;

	// isLoading demo
	let isLoadingDemo = $state(true);
	let loadedValues = $state("[]");

	onMount(async () => {
		await sleep(2000); // simulate API fetch
		loadedValues = JSON.stringify([
			{ id: "x1", url: "/assets/01.jpg", name: "01.jpg", type: "image/jpeg" },
			{ id: "x2", url: "/assets/02.jpg", name: "02.jpg", type: "image/jpeg" },
		]);
		isLoadingDemo = false;
	});
</script>

<Notifications {notifications} />

<form bind:this={f} use:onSubmitValidityCheck>
	<FieldAssets
		bind:value={values.a}
		name="a"
		label="Assets"
		{notifications}
		accept="*"
		required
		cardinality={6}
		processAssets={async (assets, onProgress) => {
			clog.debug("processAssets...", assets);

			let out: FieldAssetWithBlobUrl[] = [];
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
			const unsub = ticker.subscribe((v) => {
				progress += 10;
				for (const ass of assets ?? []) {
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

	<div class="my-6 flex justify-between items-end">
		<Button type="submit">Proceed</Button>
	</div>
</form>

<hr class="my-8" />

<h2 class="text-lg font-semibold mb-4">With isLoading (initial fetch simulation)</h2>
<FieldAssets
	bind:value={loadedValues}
	name="loaded"
	label="Assets (with initial loading)"
	isLoading={isLoadingDemo}
	{notifications}
	cardinality={6}
/>
