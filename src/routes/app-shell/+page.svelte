<script lang="ts">
	import AppShell from '../../lib/components/AppShell/AppShell.svelte';
	import { getRandomParagraph } from '@marianmeres/random-human-readable';
	import LeftSidebar from './_components/LeftSidebar.svelte';

	const dummy = (n = 10) => {
		let out = [];
		const c = 'mb-4 max-w-md';
		while (n--) out.push(getRandomParagraph());
		return `<p class="${c}">` + out.join(`</p>\n<p class="${c}">`) + '</p>\n';
	};

	let n = 50;

	let sidebarLeft: HTMLElement;
	let counter = 1;
	$: if (sidebarLeft) {
		console.log(1111, sidebarLeft);
		// sidebarLeft.addEventListener('click', (e) => {
		// 	const width = `${(counter++ * 10 + 400)}px`;
		// 	console.log(width)
		// 	sidebarLeft.style.width = width;
		// });
	}
</script>

<AppShell
	class="bg-gray-100"
	railClass="p-4 w-[70px] hidden md:block text-center"
	headerClass="p-4 max-h-40 overflow-auto"
	sidebarLeftClass="p-4 hidden md:block "
	pageHeaderClass="p-4"
	pageMainClass="bg-white p-4"
	pageFooterClass="p-4"
	sidebarRightClass="p-4 hidden lg:block"
	footerClass="p-4"
	pageFlexGrow={3}
	on:scroll={(e) => {
		// console.log(e?.target?.scrollTop);
	}}
	on:element={({ detail }) => {
		// console.log('element', detail)
		if (detail.sidebarLeft) sidebarLeft = detail.sidebarLeft;
	}}
>
	<!-- <svelte:fragment slot="rail">rail</svelte:fragment> -->
	<svelte:fragment slot="header">
		<a href="/">UI home</a>
	</svelte:fragment>
	<svelte:fragment slot="sidebarLeft"><LeftSidebar /></svelte:fragment>
	<svelte:fragment slot="pageHeader">pageHeader</svelte:fragment>

	{@html dummy(n)}

	<svelte:fragment slot="pageFooter">pageFooter</svelte:fragment>
	<!-- <svelte:fragment slot="sidebarRight">{@html dummy(50)}</svelte:fragment> -->
	<svelte:fragment slot="footer">footer</svelte:fragment>
</AppShell>

<style lang="scss">
	:global([data-shell]) {
		outline: 1px dashed orange;
		outline-offset: -1px;
	}
</style>
