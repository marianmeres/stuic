<script lang="ts">
	import {
		SplitButton,
		Switch,
		iconEllipsisVertical,
		iconSettings,
		type DropdownMenuItem,
		type SplitButtonPlacement,
	} from "$lib/index.js";
	import { iconLucideMic } from "@marianmeres/icons-fns/lucide/iconLucideMic.js";
	import { iconLucideMicOff } from "@marianmeres/icons-fns/lucide/iconLucideMicOff.js";
	import { iconLucideVideo } from "@marianmeres/icons-fns/lucide/iconLucideVideo.js";
	import { iconLucideVideoOff } from "@marianmeres/icons-fns/lucide/iconLucideVideoOff.js";

	let micMuted = $state(false);
	let camOff = $state(false);
	let lastAction = $state("");

	const micItems: DropdownMenuItem[] = [
		{ type: "header", id: "h", label: "Microphone" },
		{
			type: "action",
			id: "default",
			label: "Default - MacBook Microphone",
			onSelect: () => void (lastAction = "mic: default"),
		},
		{
			type: "action",
			id: "headset",
			label: "Headset Microphone",
			onSelect: () => void (lastAction = "mic: headset"),
		},
		{ type: "divider", id: "d" },
		{
			type: "action",
			id: "settings",
			label: "Audio settings",
			contentBefore: { html: iconSettings({ size: 16 }) },
			onSelect: () => void (lastAction = "mic: settings"),
		},
	];

	const camItems: DropdownMenuItem[] = [
		{ type: "header", id: "h", label: "Camera" },
		{
			type: "action",
			id: "facetime",
			label: "FaceTime HD Camera",
			onSelect: () => void (lastAction = "cam: facetime"),
		},
		{
			type: "action",
			id: "iphone",
			label: "iPhone Camera",
			onSelect: () => void (lastAction = "cam: iphone"),
		},
	];

	const saveItems: DropdownMenuItem[] = [
		{
			type: "action",
			id: "save-as",
			label: "Save as…",
			onSelect: () => void (lastAction = "save as"),
		},
		{
			type: "action",
			id: "save-copy",
			label: "Save a copy",
			onSelect: () => void (lastAction = "save a copy"),
		},
		{ type: "divider", id: "d" },
		{
			type: "action",
			id: "export",
			label: "Export…",
			onSelect: () => void (lastAction = "export"),
		},
	];

	const placements: SplitButtonPlacement[] = ["start", "end"];
	const sizes = ["sm", "md", "lg", "xl"];

	let menuOpen = $state(false);
</script>

<h2 class="text-xl font-semibold mb-4">
	Meeting toolbar (raised pills, iconSwap, menu on top)
</h2>

<div class="flex items-center gap-4 rounded-2xl bg-neutral-900 p-6 w-fit">
	<SplitButton
		bind:checked={micMuted}
		roleSwitch
		iconSwap={[iconLucideMic({ size: 22 }), iconLucideMicOff({ size: 22 })]}
		intent={micMuted ? "destructive" : undefined}
		tooltip={micMuted ? "Turn on microphone" : "Turn off microphone"}
		secondaryIcon={iconEllipsisVertical({ size: 18 })}
		secondaryLabel="Audio options"
		secondaryTooltip="Audio options"
		position="top-span-right"
		items={micItems}
		primaryProps={{ "aria-label": "Toggle microphone" }}
		aria-label="Microphone"
	/>
	<SplitButton
		bind:checked={camOff}
		roleSwitch
		iconSwap={[iconLucideVideo({ size: 22 }), iconLucideVideoOff({ size: 22 })]}
		intent={camOff ? "destructive" : undefined}
		tooltip={camOff ? "Turn on camera" : "Turn off camera"}
		secondaryLabel="Video options"
		secondaryTooltip="Video options"
		position="top-span-right"
		items={camItems}
		primaryProps={{ "aria-label": "Toggle camera" }}
		aria-label="Camera"
	/>
</div>

<h2 class="text-xl font-semibold mt-10 mb-4">Classic split button (divided, label)</h2>

<div class="flex flex-wrap items-center gap-4">
	<SplitButton
		divided
		placement="end"
		intent="primary"
		items={saveItems}
		onclick={() => (lastAction = "save")}
		tooltip="Save"
		secondaryTooltip="More save options"
	>
		Save
	</SplitButton>

	<SplitButton
		divided
		placement="end"
		intent="primary"
		roundedFull={false}
		items={saveItems}
		onclick={() => (lastAction = "save (square)")}
	>
		Save
	</SplitButton>

	<SplitButton
		divided
		placement="end"
		variant="outline"
		roundedFull={false}
		items={saveItems}
		onclick={() => (lastAction = "save (outline)")}
	>
		Save
	</SplitButton>
</div>

<h2 class="text-xl font-semibold mt-10 mb-4">Callback instead of dropdown</h2>

<div class="flex items-center gap-4">
	<SplitButton
		icon={iconSettings({ size: 20 })}
		primaryProps={{ "aria-label": "Settings" }}
		tooltip="Settings"
		onclick={() => (lastAction = "settings primary")}
		onSecondaryClick={() => (lastAction = "settings secondary (custom callback)")}
		secondaryTooltip="Custom callback"
	/>
</div>

<h2 class="text-xl font-semibold mt-10 mb-4">Placement × sizes</h2>

<div class="space-y-3">
	{#each placements as placement}
		<div class="flex flex-wrap items-center gap-3">
			<span class="w-16 text-sm text-neutral-500">{placement}</span>
			{#each sizes as size}
				<SplitButton
					{placement}
					{size}
					items={saveItems}
					onclick={() => (lastAction = `${placement}/${size}`)}
				>
					{size}
				</SplitButton>
			{/each}
		</div>
	{/each}
</div>

<h2 class="text-xl font-semibold mt-10 mb-4">Bindable menuOpen</h2>

<div class="flex items-center gap-4">
	<SplitButton bind:menuOpen items={saveItems} onclick={() => (lastAction = "primary")}>
		Menu
	</SplitButton>
	<Switch bind:checked={menuOpen} label="Toggle menuOpen" />
	<span class="text-sm text-neutral-500">bind:menuOpen</span>
</div>

<p class="mt-10 text-sm text-neutral-500">
	Last action: <code>{lastAction || "-"}</code>
</p>
