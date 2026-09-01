<script lang="ts">
	import {
		ContextMenu,
		type ContextMenuItem,
	} from "$lib/components/ContextMenu/index.js";
	import { createContextMenuT, CONTEXT_MENU_MESSAGES_SK } from "$lib/index.js";
	import Button from "$lib/components/Button/Button.svelte";
	import { iconLucideCopy } from "@marianmeres/icons-fns/lucide/iconLucideCopy.js";
	import { iconLucidePencil } from "@marianmeres/icons-fns/lucide/iconLucidePencil.js";
	import { iconLucideTrash2 } from "@marianmeres/icons-fns/lucide/iconLucideTrash2.js";
	import { iconLucideDownload } from "@marianmeres/icons-fns/lucide/iconLucideDownload.js";
	import { iconLucideFile } from "@marianmeres/icons-fns/lucide/iconLucideFile.js";
	import { iconLucideLink } from "@marianmeres/icons-fns/lucide/iconLucideLink.js";

	let lastAction = $state<string | null>(null);
	const act = (label: string) => () => {
		lastAction = label;
	};

	const basicItems: ContextMenuItem[] = [
		{
			type: "action",
			id: "edit",
			label: "Edit",
			contentBefore: { html: iconLucidePencil({}) },
			onSelect: act("Edit"),
		},
		{
			type: "action",
			id: "copy",
			label: "Copy",
			contentAfter: "Cmd+C",
			contentBefore: { html: iconLucideCopy({}) },
			onSelect: act("Copy"),
		},
		{
			type: "action",
			id: "link",
			label: "Copy link",
			contentBefore: { html: iconLucideLink({}) },
			onSelect: act("Copy link"),
		},
		{ type: "divider" },
		{ type: "header", label: "Danger zone" },
		{
			type: "action",
			id: "delete",
			label: "Delete",
			contentBefore: { html: iconLucideTrash2({}) },
			class: "text-red-600 dark:text-red-400",
			onSelect: act("Delete"),
		},
		{ type: "action", id: "wipe", label: "Wipe (disabled)", disabled: true },
	];

	// per-row demo
	const files = ["report.pdf", "photo.jpg", "notes.md"];
	const itemsFor = (file: string): ContextMenuItem[] => [
		{
			type: "action",
			id: "open",
			label: `Open ${file}`,
			contentBefore: { html: iconLucideFile({}) },
			onSelect: act(`Open ${file}`),
		},
		{
			type: "action",
			id: "download",
			label: "Download",
			contentBefore: { html: iconLucideDownload({}) },
			onSelect: act(`Download ${file}`),
		},
		{ type: "divider" },
		{
			type: "action",
			id: "delete",
			label: "Delete",
			contentBefore: { html: iconLucideTrash2({}) },
			class: "text-red-600 dark:text-red-400",
			onSelect: act(`Delete ${file}`),
		},
	];

	const manyItems: ContextMenuItem[] = [
		"Alpha",
		"Bravo",
		"Charlie",
		"Delta",
		"Echo",
		"Foxtrot",
		"Golf",
		"Hotel",
		"India",
		"Juliett",
	].map((label) => ({
		type: "action",
		id: label.toLowerCase(),
		label,
		onSelect: act(label),
	}));

	let controlledOpen = $state(false);

	const tSk = createContextMenuT(CONTEXT_MENU_MESSAGES_SK);

	const areaClass =
		"grid place-items-center h-40 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-700 text-sm text-neutral-500 select-none";
</script>

<div class="space-y-16 py-8 max-w-2xl">
	{#if lastAction}
		<div
			class="fixed bottom-4 right-4 z-10 rounded bg-neutral-800 text-white text-sm px-3 py-2"
		>
			Selected: <b>{lastAction}</b>
		</div>
	{/if}

	<!-- Basic -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Basic</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Right-click (desktop), long-press (touch), or focus + <kbd>Shift+F10</kbd>. The menu
			is a full <code>DropdownMenu</code> — actions, icons, shortcut hints, headers, dividers,
			disabled items.
		</p>
		<ContextMenu items={basicItems}>
			<!-- deliberately focusable so Shift+F10 has somewhere to happen -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div
				class={areaClass}
				tabindex="0"
				role="group"
				aria-label="Context menu demo area"
			>
				Right-click / long-press here
			</div>
		</ContextMenu>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Per-row -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Per-Row Menus</h2>
		<p class="text-sm text-neutral-500 mb-4">
			One <code>ContextMenu</code> per row, items built from the row's data — the file manager
			idiom.
		</p>
		<ul
			class="rounded-lg border border-neutral-200 dark:border-neutral-700 divide-y divide-neutral-200 dark:divide-neutral-700"
		>
			{#each files as file (file)}
				<li>
					<ContextMenu items={itemsFor(file)}>
						<div
							class="px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-default"
						>
							{file}
						</div>
					</ContextMenu>
				</li>
			{/each}
		</ul>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Search -->
	<section>
		<h2 class="text-xl font-semibold mb-2">With Search</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>search</code> (bool or config) adds the DropdownMenu filter input — useful for long
			menus.
		</p>
		<ContextMenu items={manyItems} search>
			<div class={areaClass}>Right-click for a searchable menu</div>
		</ContextMenu>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Controlled -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Controlled (bind:isOpen)</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Programmatic open (no pointer interaction yet) anchors at the target area's
			bottom-left corner.
		</p>
		<ContextMenu items={basicItems} bind:isOpen={controlledOpen}>
			<div class={areaClass}>Target area ({controlledOpen ? "open" : "closed"})</div>
		</ContextMenu>
		<Button size="sm" class="mt-4" onclick={() => (controlledOpen = !controlledOpen)}>
			Toggle menu
		</Button>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Disabled -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Disabled</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>disabled</code> makes every trigger inert — the browser's native context menu works
			again.
		</p>
		<ContextMenu items={basicItems} disabled>
			<div class={areaClass}>Right-click gets the native menu</div>
		</ContextMenu>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Styling -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Custom Styling via CSS Variables</h2>
		<p class="text-sm text-neutral-500 mb-4">
			The menu panel is themed by the <code>--stuic-dropdown-menu-*</code> tokens; the
			target area highlights itself while open via <code>[data-open]</code>.
		</p>
		<div
			style="
				--stuic-dropdown-menu-radius: 0;
				--stuic-dropdown-menu-bg: var(--stuic-color-surface);
				--stuic-dropdown-menu-min-width: 16rem;
			"
		>
			<ContextMenu
				items={basicItems}
				class="data-open:border-solid data-open:border-(--stuic-color-primary)"
			>
				<div class={areaClass}>Square corners, wider, highlighted while open</div>
			</ContextMenu>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- i18n -->
	<section>
		<h2 class="text-xl font-semibold mb-2">i18n (Slovak)</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Localizes only the screen-reader-only menu label (inspect the DOM) — item labels are
			yours.
		</p>
		<ContextMenu
			items={[
				{
					type: "action",
					id: "kopirovat",
					label: "Kopírovať",
					onSelect: act("Kopírovať"),
				},
				{ type: "action", id: "zmazat", label: "Zmazať", onSelect: act("Zmazať") },
			]}
			t={tSk}
		>
			<div class={areaClass}>Klikni pravým tlačidlom</div>
		</ContextMenu>
	</section>
</div>
