<script lang="ts">
	import {
		// File Type Icons
		iconFile,
		iconFileBinary,
		iconFileCode,
		iconFileImage,
		iconFileMusic,
		iconFilePdf,
		iconFileRichtext,
		iconFileSlides,
		iconFileSpreadsheet,
		iconFileText,
		iconFileWord,
		iconFileZip,
		// Alert/Notification Icons
		iconAlertWarning,
		iconAlertSuccess,
		iconAlertInfo,
		iconAlertError,
		iconRefresh,
		// Action Icons
		iconArrowLeft,
		iconArrowRight,
		iconArrowDown,
		iconArrowUp,
		iconDownload,
		iconPlus,
		iconTrash,
		iconZoomIn,
		iconZoomOut,
		// UI Control Icons
		iconSearch,
		iconChevronDown,
		iconChevronUp,
		iconChevronLeft,
		iconChevronRight,
		iconCheck,
		iconCircle,
		iconSquare,
		iconMenu,
		iconMinus,
		iconEllipsisVertical,
	} from "$lib/icons/index.js";

	const fileIcons = [
		{ name: "iconFile", icon: iconFile },
		{ name: "iconFileBinary", icon: iconFileBinary },
		{ name: "iconFileCode", icon: iconFileCode },
		{ name: "iconFileImage", icon: iconFileImage },
		{ name: "iconFileMusic", icon: iconFileMusic },
		{ name: "iconFilePdf", icon: iconFilePdf },
		{ name: "iconFileRichtext", icon: iconFileRichtext },
		{ name: "iconFileSlides", icon: iconFileSlides },
		{ name: "iconFileSpreadsheet", icon: iconFileSpreadsheet },
		{ name: "iconFileText", icon: iconFileText },
		{ name: "iconFileWord", icon: iconFileWord },
		{ name: "iconFileZip", icon: iconFileZip },
	];

	const alertIcons = [
		{ name: "iconAlertWarning", icon: iconAlertWarning },
		{ name: "iconAlertSuccess", icon: iconAlertSuccess },
		{ name: "iconAlertInfo", icon: iconAlertInfo },
		{ name: "iconAlertError", icon: iconAlertError },
		{ name: "iconRefresh", icon: iconRefresh },
	];

	const actionIcons = [
		{ name: "iconArrowLeft", icon: iconArrowLeft },
		{ name: "iconArrowRight", icon: iconArrowRight },
		{ name: "iconArrowDown", icon: iconArrowDown },
		{ name: "iconArrowUp", icon: iconArrowUp },
		{ name: "iconDownload", icon: iconDownload },
		{ name: "iconPlus", icon: iconPlus },
		{ name: "iconMinus", icon: iconMinus },
		{ name: "iconTrash", icon: iconTrash },
		{ name: "iconZoomIn", icon: iconZoomIn },
		{ name: "iconZoomOut", icon: iconZoomOut },
	];

	const uiIcons = [
		{ name: "iconSearch", icon: iconSearch },
		{ name: "iconChevronDown", icon: iconChevronDown },
		{ name: "iconChevronUp", icon: iconChevronUp },
		{ name: "iconChevronRight", icon: iconChevronRight },
		{ name: "iconChevronLeft", icon: iconChevronLeft },
		{ name: "iconCheck", icon: iconCheck },
		{ name: "iconCircle", icon: iconCircle },
		{ name: "iconSquare", icon: iconSquare },
		{ name: "iconMenu", icon: iconMenu },
		{ name: "iconEllipsisVertical", icon: iconEllipsisVertical },
	];
</script>

<h1>Stuic Icons Reference</h1>

<p class="mb-8 opacity-75">
	All icons are centralized in <code>$lib/icons/index.js</code>. Change the underlying
	implementation there to swap icons across the entire library.
</p>

<h2>File Type Icons</h2>
<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
	{#each fileIcons as { name, icon }}
		<div
			class="flex flex-col items-center gap-2 p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800"
		>
			<span class="text-3xl">{@html icon({ size: 32 })}</span>
			<code class="text-xs text-center break-all">{name}</code>
		</div>
	{/each}
</div>

<h2>Alert/Notification Icons</h2>
<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-12">
	{#each alertIcons as { name, icon }}
		<div
			class="flex flex-col items-center gap-2 p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800"
		>
			<span class="text-3xl">{@html icon({ size: 32 })}</span>
			<code class="text-xs text-center break-all">{name}</code>
		</div>
	{/each}
</div>

<h2>Action Icons</h2>
<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-12">
	{#each actionIcons as { name, icon }}
		<div
			class="flex flex-col items-center gap-2 p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800"
		>
			<span class="text-3xl">{@html icon({ size: 32 })}</span>
			<code class="text-xs text-center break-all">{name}</code>
		</div>
	{/each}
</div>

<h2>UI Control Icons</h2>
<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
	{#each uiIcons as { name, icon }}
		<div
			class="flex flex-col items-center gap-2 p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800"
		>
			<span class="text-3xl">{@html icon({ size: 32 })}</span>
			<code class="text-xs text-center break-all">{name}</code>
		</div>
	{/each}
</div>
