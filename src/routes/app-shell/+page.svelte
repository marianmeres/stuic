<script lang="ts">
	import AppShell from '../../lib/components/AppShell/AppShell.svelte';
	import { getRandomParagraph } from '@marianmeres/random-human-readable';
	import LeftSidebar from './_components/LeftSidebar.svelte';
	import { dummyText } from '../_utils/dummy-text.js';
	import HeadButtonSwitcher from './_components/HeadButtonSwitcher.svelte';
	import { parseBoolean } from '@marianmeres/parse-boolean';
	import FlexSelect from './_components/FlexSelect.svelte';

	let pageFlexGrow: any = 0;

	//
	let rail: any;
	let sidebarLeft = true;
	let pageHeader: any;
	let pageMain = true;
	let pageFooter: any;
	let sidebarRight: any;
	let footer: any;

	const onoff = (f: any) => (f ? 'block' : 'hidden');
</script>

<AppShell
	class="bg-gray-100"
	railClass="p-4 w-[60px] text-center {onoff(rail)}"
	headerClass="p-4 max-h-40 overflow-auto"
	sidebarLeftClass="p-4 {onoff(sidebarLeft)}"
	pageHeaderClass="p-4 {onoff(pageHeader)}"
	pageMainClass="bg-white p-4 {onoff(pageMain)}"
	pageFooterClass="p-4 {onoff(pageFooter)}"
	sidebarRightClass="p-4 {onoff(sidebarRight)}"
	footerClass="p-4 {onoff(footer)}"
	{pageFlexGrow}
	on:scroll={(e) => {
		// console.log(e?.target?.scrollTop);
	}}
>
	<svelte:fragment slot="rail">rail</svelte:fragment>
	<svelte:fragment slot="header">
		<a href="/">UI home</a>
		<div class="inline-block space-x-2 ml-2">
			<HeadButtonSwitcher bind:flag={rail} label="rail" />
			<HeadButtonSwitcher bind:flag={sidebarLeft} label="sidebarLeft" />
			<HeadButtonSwitcher bind:flag={pageHeader} label="pageHeader" />
			<HeadButtonSwitcher bind:flag={pageMain} label="pageMain" />
			<HeadButtonSwitcher bind:flag={pageFooter} label="pageFooter" />
			<HeadButtonSwitcher bind:flag={sidebarRight} label="sidebarRight" />
			<HeadButtonSwitcher bind:flag={footer} label="footer" />
			<FlexSelect bind:value={pageFlexGrow} />
		</div>
	</svelte:fragment>
	<svelte:fragment slot="sidebarLeft"><LeftSidebar /></svelte:fragment>
	<svelte:fragment slot="pageHeader">pageHeader</svelte:fragment>
	{@html dummyText(50)}
	<svelte:fragment slot="pageFooter">pageFooter</svelte:fragment>
	<svelte:fragment slot="sidebarRight">{@html dummyText(50)}</svelte:fragment>
	<svelte:fragment slot="footer">footer</svelte:fragment>
</AppShell>

<style lang="scss">
	:global([data-shell]) {
		outline: 1px dashed orange;
		outline-offset: -1px;
	}
</style>
