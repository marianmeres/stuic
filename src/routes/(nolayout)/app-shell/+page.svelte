<script lang="ts">
	import AppShell, {
		appShellSetHtmlBodyHeight,
	} from "$lib/components/AppShell/AppShell.svelte";
	import { onMount } from "svelte";
	import { dummyText } from "../../_utils/dummy-text.js";
	import FlexSelect from "./_components/FlexSelect.svelte";
	import HeadButtonSwitcher from "./_components/HeadButtonSwitcher.svelte";
	import LeftSidebar from "./_components/LeftSidebar.svelte";

	// onMount(appShellSetHtmlBodyHeight);

	let pageFlexGrow: 0 | 1 | 2 | 3 | 4 | 5 = $state(0);

	let flag = $state({
		rail: false,
		sidebarLeft: true,
		pageHeader: false,
		pageMain: true,
		pageFooter: false,
		sidebarRight: false,
		footer: false,
	});

	const onoff = (f: any) => (f ? "block" : "hidden");
</script>

<AppShell
	class=""
	railClass="w-[60px] py-4 bg-gray-200 text-center {onoff(flag.rail)}"
	headerClass="p-4 max-h-40 overflow-auto"
	sidebarLeftClass="p-4 {onoff(flag.sidebarLeft)}"
	pageHeaderClass="p-4 {onoff(flag.pageHeader)}"
	pageMainClass="p-4 {onoff(flag.pageMain)}"
	pageFooterClass="p-4 {onoff(flag.pageFooter)}"
	sidebarRightClass="p-4 {onoff(flag.sidebarRight)}"
	footerClass="p-4 {onoff(flag.footer)}"
	{pageFlexGrow}
>
	{#snippet rail()}
		rail
	{/snippet}

	{#snippet header()}
		<a href="/">UI home</a>
		<div class="inline-block space-x-2 ml-2">
			<HeadButtonSwitcher bind:flag={flag.rail} label="rail" />
			<HeadButtonSwitcher bind:flag={flag.sidebarLeft} label="sidebarLeft" />
			<HeadButtonSwitcher bind:flag={flag.pageHeader} label="pageHeader" />
			<HeadButtonSwitcher bind:flag={flag.pageMain} label="pageMain" />
			<HeadButtonSwitcher bind:flag={flag.pageFooter} label="pageFooter" />
			<HeadButtonSwitcher bind:flag={flag.sidebarRight} label="sidebarRight" />
			<HeadButtonSwitcher bind:flag={flag.footer} label="footer" />
			<FlexSelect bind:value={pageFlexGrow} />
		</div>
	{/snippet}

	{#snippet sidebarLeft()}<LeftSidebar />{/snippet}
	{#snippet pageHeader()}pageHeader{/snippet}
	{@html dummyText(50)}
	{#snippet pageFooter()}pageFooter{/snippet}
	{#snippet sidebarRight()}{@html dummyText(50)}{/snippet}
	{#snippet footer()}footer{/snippet}
</AppShell>

<style>
	:global([data-shell]) {
		outline: 1px dashed orange;
		outline-offset: -1px;
	}
</style>
