<script context="module" lang="ts">
	export const appShellSetHtmlBodyHeight = (): (() => any) => {
		const _set = (flag: boolean) => {
			document.body.style.height = flag ? '100vh' : 'auto';
			document.body.style.overflow = flag ? 'hidden' : 'visible';
		};
		_set(true);
		// returns reset, so we can write: onMount(appShellSetHtmlBodyHeight)
		return () => _set(false);
	};
</script>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { twMerge } from 'tailwind-merge';

	// idea copied from https://www.skeleton.dev/components/app-shell
	// adjusted and tweaked to personal opinion and taste...

	/*  Layout:
        <shell>
			<rail />
			<div>
				<header />
				<content>
					<sidebar-left />
					<page>
						<page-header />
						<page-main />
						<page-footer />
					<page/>
					<sidebar-right />
				</content>
				<footer />
			</div>
        </shell>
    */

	const dispatch = createEventDispatcher();

	let _class = '';
	export { _class as class };
	export let railClass: string = '';
	export let headerClass: string = '';
	export let contentClass: string = '';
	export let sidebarLeftClass: string = '';
	export let pageClass: string = '';
	export let pageHeaderClass: string = '';
	export let pageMainClass: string = '';
	export let pageFooterClass: string = '';
	export let sidebarRightClass: string = '';
	export let footerClass: string = '';

	export let scrollbarGutter = 'auto';

	export let id = 'shell';

	// bigger number means bigger page block relative to sidebars
	// 0 means flex-none for sidebars
	export let pageFlexGrow: 0 | 1 | 2 | 3 | 4 | 5 = 3;
	$: _sidebarFlexCls = pageFlexGrow ? 'flex-1' : 'flex-none';

	// prettier-ignore
	const flexMap = ['flex-1', 'flex-1', 'flex-[2]', 'flex-[3]', 'flex-[4]', 'flex-[5]'];
	$: _pageFlexCls = flexMap[pageFlexGrow] || 'flex-1';

	//
	let shell: HTMLElement;
	let rail: HTMLElement;
	let header: HTMLElement;
	let sidebarLeft: HTMLElement;
	let page: HTMLElement;
	let pageHeader: HTMLElement;
	let pageMain: HTMLElement;
	let pageFooter: HTMLElement;
	let sidebarRight: HTMLElement;
	let footer: HTMLElement;

	//
	$: if (shell) dispatch('element', { shell });
	$: if (rail) dispatch('element', { rail });
	$: if (header) dispatch('element', { header });
	$: if (sidebarLeft) dispatch('element', { sidebarLeft });
	$: if (page) dispatch('element', { page });
	$: if (pageHeader) dispatch('element', { pageHeader });
	$: if (pageMain) dispatch('element', { pageMain });
	$: if (pageFooter) dispatch('element', { pageFooter });
	$: if (sidebarRight) dispatch('element', { sidebarRight });
	$: if (footer) dispatch('element', { footer });
</script>

<!-- shell -->
<div
	bind:this={shell}
	{id}
	data-shell="shell"
	class={twMerge(`w-full h-full flex overflow-hidden ${_class}`)}
>
	<!-- shell > rail -->
	{#if $$slots.rail}
		<div
			bind:this={rail}
			data-shell="rail"
			class={twMerge(`flex-none overflow-x-hidden overflow-y-auto ${railClass}`)}
		>
			<slot name="rail" />
		</div>
	{/if}

	<!-- shell > div-->
	<div class="h-full flex-1 flex flex-col overflow-hidden">
		<!-- shell > div > header -->
		{#if $$slots.header}
			<header
				bind:this={header}
				data-shell="header"
				class={twMerge(`flex-none z-10 ${headerClass}`)}
			>
				<slot name="header" />
			</header>
		{/if}

		<!-- shell > div > content -->
		<div
			data-shell="content"
			class={twMerge(`flex-auto w-full h-full flex overflow-hidden ${contentClass}`)}
		>
			<!-- shell > div > content > sidebar-left -->
			{#if $$slots.sidebarLeft}
				<aside
					bind:this={sidebarLeft}
					data-shell="sidebar-left"
					class={twMerge(
						`${_sidebarFlexCls} overflow-x-hidden overflow-y-auto w-auto ${sidebarLeftClass}`
					)}
				>
					<slot name="sidebarLeft" />
				</aside>
			{/if}

			<!-- shell > div > content > page -->
			<div
				bind:this={page}
				data-shell="page"
				class={twMerge(`${_pageFlexCls} overflow-x-hidden flex flex-col ${pageClass}`)}
				style:scrollbar-gutter={scrollbarGutter}
				on:scroll
			>
				<!-- shell > div > content > page > page-header -->
				{#if $$slots.pageHeader}
					<header
						bind:this={pageHeader}
						data-shell="page-header"
						class={twMerge(`flex-none ${pageHeaderClass}`)}
					>
						<slot name="pageHeader" />
					</header>
				{/if}

				<!-- shell > div > content > page > page-main -->
				<main
					bind:this={pageMain}
					data-shell="page-main"
					class={twMerge(`flex-auto ${pageMainClass}`)}
				>
					<slot />
				</main>

				<!-- shell > div > content > page > page-footer -->
				{#if $$slots.pageFooter}
					<footer
						bind:this={pageFooter}
						data-shell="page-footer"
						class={twMerge(`flex-none ${pageFooterClass}`)}
					>
						<slot name="pageFooter" />
					</footer>
				{/if}
			</div>

			<!-- shell > div > content > sidebar-right -->
			{#if $$slots.sidebarRight}
				<aside
					bind:this={sidebarRight}
					data-shell="sidebar-right"
					class={twMerge(
						`${_sidebarFlexCls} overflow-x-hidden overflow-y-auto ${sidebarRightClass}`
					)}
				>
					<slot name="sidebarRight" />
				</aside>
			{/if}
		</div>

		<!-- shell > div > footer -->
		{#if $$slots.footer}
			<footer
				bind:this={footer}
				data-shell="footer"
				class={twMerge(`flex-none ${footerClass}`)}
			>
				<slot name="footer" />
			</footer>
		{/if}
	</div>
</div>

<style lang="scss">
	/* from: https://www.skeleton.dev/components/app-shell

	The App Shell will need to expand to fill all available space within your app's body tag. 
	Open /src/app.html and add the following classes. This wrapping element is required 
	and the style of display: contents should remain.

	<body>
		<div style="display: contents" class="h-full overflow-hidden">%sveltekit.body%</div>
	</body>

	Then update your global stylesheet with the following. This will disable overflow for 
	html and body tags to prevent duplicate scroll bars.

	html, body { @apply h-full overflow-hidden; }
	*/
</style>
