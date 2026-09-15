<script lang="ts">
	import {
		Avatar,
		Button,
		FieldSingleAsset,
		FieldSwitch,
		getId,
		Notifications,
		NotificationsStack,
		onSubmitValidityCheck,
		sleep,
		type FieldAsset,
	} from "$lib/index.js";
	import { createClog } from "@marianmeres/clog";
	import { onMount } from "svelte";

	const clog = createClog("field single asset page");
	const notifications = new NotificationsStack([]);

	// Fake upload: resolves with an asset whose urls reuse the optimistic blob url
	// (a real one would POST `ctx.file` and resolve with the server's asset).
	function fakeUpload(
		opts: { durationMs?: number; fail?: () => boolean; error?: () => Error } = {}
	) {
		return async (
			asset: FieldAsset,
			ctx: { file: File; onProgress: (p: number) => void }
		): Promise<FieldAsset> => {
			clog.debug("processAsset", asset, ctx.file);
			const duration = opts.durationMs ?? 2500;
			const steps = 10;
			for (let i = 1; i <= steps; i++) {
				await sleep(duration / steps);
				ctx.onProgress((i / steps) * 100);
			}
			if (opts.fail?.()) {
				throw opts.error?.() ?? new Error("Simulated server error (503)");
			}
			const blobUrl = asset.id;
			return {
				id: getId("uploaded-"),
				url: { thumb: blobUrl, full: blobUrl, original: blobUrl },
				name: asset.name,
				type: asset.type,
				meta: { size: ctx.file.size },
			};
		};
	}

	// Client-side downscale: the seam a cropper would plug into as well.
	async function downscale(file: File, max = 512): Promise<File> {
		if (!file.type.startsWith("image/") || file.type === "image/svg+xml") return file;
		const bmp = await createImageBitmap(file);
		const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
		if (scale === 1) return file;
		const canvas = document.createElement("canvas");
		canvas.width = Math.round(bmp.width * scale);
		canvas.height = Math.round(bmp.height * scale);
		canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
		const blob = await new Promise<Blob | null>((r) =>
			canvas.toBlob(r, "image/jpeg", 0.85)
		);
		if (!blob) return file;
		return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", {
			type: "image/jpeg",
		});
	}

	let values = $state({
		avatar: "",
		logo: JSON.stringify({
			id: "logo-1",
			url: "/assets/02.jpg",
			name: "02.jpg",
			type: "image/jpeg",
		}),
		cover: JSON.stringify({
			id: "cover-1",
			url: "/assets/01.jpg",
			name: "01.jpg",
			type: "image/jpeg",
		}),
		doc: JSON.stringify({
			id: "doc-1",
			url: "/assets/README.md",
			name: "README.md",
			type: "text/markdown",
			meta: { size: 1834 },
		}),
		failing: "",
		gated: "",
		serverOwned: JSON.stringify({
			id: "so-1",
			url: "/assets/04.jpg",
			name: "04.jpg",
			type: "image/jpeg",
		}),
		readonly: JSON.stringify({
			id: "ro-1",
			url: "/assets/03.jpg",
			name: "03.jpg",
			type: "image/jpeg",
		}),
		hashed: JSON.stringify({
			id: "hashed-1",
			url: "/assets/02.jpg",
			name: "2a36cdac1484a2d4f9b3482f5a1a8d24b11fcf30faeb8cd70fc31837a1f0c9e2.jpg",
			type: "image/jpeg",
			meta: { size: 184320 },
		}),
	});

	let f = $state<HTMLFormElement>()!;
	let failNext = $state(true);
	let disabledDemo = $state(false);

	// onUploadError demo: a 402 is a product state the page renders itself
	let gateNext = $state(true);
	let gated = $state<string | null>(null);

	// async onBeforeRemove demo: the hook IS the server-side delete
	let deleteFails = $state(false);

	// isLoading demo
	let isLoadingDemo = $state(true);
	let loadedValue = $state("");
	onMount(async () => {
		await sleep(2000);
		loadedValue = JSON.stringify({
			id: "x1",
			url: "/assets/00.jpg",
			name: "00.jpg",
			type: "image/jpeg",
		});
		isLoadingDemo = false;
	});
</script>

<Notifications {notifications} />

<form bind:this={f} use:onSubmitValidityCheck>
	<FieldSingleAsset
		bind:value={values.avatar}
		name="avatar"
		label="Profile picture"
		description="Circle, image/* only, max 2 MB, pasteable, downscaled to 512px on the client before upload. Required."
		{notifications}
		shape="circle"
		accept="image/*"
		capture="user"
		maxSize={2 * 1024 * 1024}
		transformFile={(file) => downscale(file, 512)}
		processAsset={fakeUpload()}
		withOnProgress
		pasteable
		required
		labelLeftBreakpoint={0}
	>
		{#snippet placeholder()}
			<Avatar initials="John Doe" size="2xl" autoColor hashSource="john@example.com" />
		{/snippet}
	</FieldSingleAsset>

	<FieldSingleAsset
		bind:value={values.logo}
		name="logo"
		label="Logo"
		description="Wide tile, fit=contain (a logo must never be cropped), size=sm."
		{notifications}
		shape="wide"
		fit="contain"
		size="sm"
		accept="image/*,.svg"
		processAsset={fakeUpload({ durationMs: 1200 })}
		withOnProgress
		labelLeftBreakpoint={0}
	/>

	<FieldSingleAsset
		bind:value={values.cover}
		name="cover"
		label="Cover image"
		description="Wide, size=lg, cover fit. onBeforeReplace asks first."
		{notifications}
		shape="wide"
		size="lg"
		accept="image/*"
		processAsset={fakeUpload()}
		withOnProgress
		onBeforeReplace={(current, file) =>
			confirm(`Replace ${current.name} with ${file.name}?`)}
		labelLeftBreakpoint={0}
	/>

	<FieldSingleAsset
		bind:value={values.doc}
		name="doc"
		label="Contract (single document)"
		description="Non-image asset: type icon, extension + size in the meta line. accept=.pdf,.md,.txt with maxSize 5 MB. Custom validateFile rejects names containing 'draft'."
		{notifications}
		accept=".pdf,.md,.txt"
		maxSize={5 * 1024 * 1024}
		validateFile={(file) =>
			/draft/i.test(file.name) ? "Drafts cannot be uploaded here." : undefined}
		processAsset={fakeUpload({ durationMs: 1500 })}
		labelLeftBreakpoint={0}
	/>

	<div class="my-6 flex justify-between items-end">
		<Button type="submit">Proceed</Button>
	</div>
</form>

<hr class="my-8" />

<h2 class="text-lg font-semibold mb-4">Failed upload (rollback + retry)</h2>
<div class="mb-4">
	<FieldSwitch label="Next upload fails" bind:checked={failNext} name="fail-next" />
</div>
<FieldSingleAsset
	bind:value={values.failing}
	name="failing"
	label="Flaky server"
	description="The upload rejects while the switch is on. The tile shows the error with Retry / Discard; the value is never touched by a failed upload."
	{notifications}
	accept="image/*"
	processAsset={fakeUpload({ durationMs: 1000, fail: () => failNext })}
	withOnProgress
	labelLeftBreakpoint={0}
/>

<hr class="my-8" />

<h2 class="text-lg font-semibold mb-4">Handled failure (onUploadError)</h2>
<div class="mb-4">
	<FieldSwitch
		label="Next upload hits the plan limit (402)"
		bind:checked={gateNext}
		name="gate-next"
	/>
</div>
{#if gated}
	<div
		class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-(--stuic-color-border) bg-(--stuic-color-muted) p-3 text-sm"
		role="status"
	>
		<span>{gated}</span>
		<Button
			size="sm"
			onclick={() => {
				gated = null;
				gateNext = false;
			}}
		>
			Upgrade plan
		</Button>
	</div>
{/if}
<FieldSingleAsset
	bind:value={values.gated}
	name="gated"
	label="Gated upload"
	description="The upload rejects with a 402-shaped error while the switch is on. onUploadError renders the panel above and returns false, so the field skips its toast; the tile keeps Retry / Discard (Retry after 'Upgrade plan' succeeds)."
	{notifications}
	accept="image/*"
	processAsset={fakeUpload({
		durationMs: 800,
		fail: () => gateNext,
		error: () =>
			Object.assign(new Error("Your plan's photo storage is full (50 MB)."), {
				status: 402,
			}),
	})}
	onUploadError={(e) => {
		if ((e as { status?: number })?.status === 402) {
			gated = (e as Error).message;
			return false;
		}
	}}
	labelLeftBreakpoint={0}
/>

<hr class="my-8" />

<h2 class="text-lg font-semibold mb-4">Async onBeforeRemove (the hook is the delete)</h2>
<div class="mb-4">
	<FieldSwitch
		label="Server delete fails"
		bind:checked={deleteFails}
		name="delete-fails"
	/>
</div>
<FieldSingleAsset
	bind:value={values.serverOwned}
	name="server-owned"
	label="Server-owned logo"
	description="onBeforeRemove awaits a 1.5 s DELETE and resolves with its outcome: the Remove control spins, the tile is inert and a second click is ignored meanwhile; the value clears only on success. undoTtl=0 — restoring the value would lie about a file that is already gone."
	{notifications}
	shape="wide"
	fit="contain"
	size="sm"
	accept="image/*"
	processAsset={fakeUpload({ durationMs: 1200 })}
	undoTtl={0}
	onBeforeRemove={async (asset) => {
		await sleep(1500);
		if (deleteFails) {
			notifications.error(`DELETE ${asset.name} failed (simulated)`);
			return false;
		}
		return true;
	}}
	labelLeftBreakpoint={0}
/>

<hr class="my-8" />

<h2 class="text-lg font-semibold mb-4">noFilename (content-hash names)</h2>
<FieldSingleAsset
	value={values.hashed}
	name="hashed-with-name"
	label="Default"
	description="A store that renames uploads to their content hash: the name is noise."
	{notifications}
	processAsset={fakeUpload()}
	labelLeftBreakpoint={0}
/>
<FieldSingleAsset
	bind:value={values.hashed}
	name="hashed"
	label="noFilename"
	description="The same asset with noFilename: only the type / size line is left, and every announcement, toast and lightbox caption drops the name too."
	noFilename
	{notifications}
	processAsset={fakeUpload()}
	labelLeftBreakpoint={0}
/>

<hr class="my-8" />

<h2 class="text-lg font-semibold mb-4">Disabled / display-only</h2>
<div class="mb-4">
	<FieldSwitch label="Disabled" bind:checked={disabledDemo} name="disabled-demo" />
</div>
<FieldSingleAsset
	bind:value={values.readonly}
	name="readonly"
	label="Existing asset"
	description="Toggle disabled: the tile, drop, paste and remove all stop; preview stays available."
	{notifications}
	disabled={disabledDemo}
	processAsset={fakeUpload()}
	labelLeftBreakpoint={0}
/>
<FieldSingleAsset
	value={values.readonly}
	name="no-uploader"
	label="Without processAsset"
	description="No uploader at all: shows the asset, allows preview and remove, but no picker / drop / paste."
	{notifications}
	labelLeftBreakpoint={0}
/>

<hr class="my-8" />

<h2 class="text-lg font-semibold mb-4">With isLoading (initial fetch simulation)</h2>
<FieldSingleAsset
	bind:value={loadedValue}
	name="loaded"
	label="Loaded asset"
	isLoading={isLoadingDemo}
	{notifications}
	processAsset={fakeUpload()}
	labelLeftBreakpoint={0}
/>

<hr class="my-8" />

<h2 class="text-lg font-semibold mb-4">Values</h2>
<pre class="text-xs whitespace-pre-wrap break-all opacity-70">{JSON.stringify(
		{ ...values, loaded: loadedValue },
		null,
		2
	)}</pre>
