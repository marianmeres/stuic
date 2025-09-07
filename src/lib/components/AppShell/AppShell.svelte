<script module lang="ts">
	export const MAIN_WIDTH = Symbol("MAIN_WIDTH");
	/**
	 * Helper utility function which sets document.body height to 100vh, and overflow: hidden.
	 * It also returns a function which unsets the full height. So we can write:
	 *
	 * ```js
	 * onMount(appShellSetHtmlBodyHeight)
	 * ```
	 *
	 * From: https://www.skeleton.dev/components/app-shell
	 *
	 * The App Shell will need to expand to fill all available space within your app's body tag.
	 * Open /src/app.html and add the following classes. This wrapping element is required
	 * and the style of display: contents should remain.
	 *
	 * <body>
	 *     <div style="display: contents" class="h-full overflow-hidden">%sveltekit.body%</div>
	 * </body>
	 *
	 * Then update your global stylesheet with the following. This will disable overflow for
	 * html and body tags to prevent duplicate scroll bars.
	 *
	 * html, body { @apply h-full overflow-hidden; }
	 */
	export function appShellSetHtmlBodyHeight(): () => any {
		const _set = (flag: boolean) => {
			document.body.style.height = flag ? "100vh" : "auto";
			document.body.style.overflow = flag ? "hidden" : "visible";
		};
		_set(true);
		return () => _set(false);
	}
</script>

<script lang="ts">
	import { setContext, type Snippet } from "svelte";
	import { twMerge } from "../../utils/tw-merge.js";

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

	interface Props {
		id?: string;
		class?: string;
		railClass?: string;
		headerClass?: string;
		contentClass?: string;
		sidebarLeftClass?: string;
		pageClass?: string;
		pageHeaderClass?: string;
		pageMainClass?: string;
		pageFooterClass?: string;
		sidebarRightClass?: string;
		footerClass?: string;
		scrollbarGutter?: "auto" | "stable" | "both-edges";
		pageFlexGrow?: 0 | 1 | 2 | 3 | 4 | 5;
		//
		rail?: Snippet;
		header?: Snippet;
		sidebarLeft?: Snippet;
		pageHeader?: Snippet;
		children?: Snippet;
		pageFooter?: Snippet;
		sidebarRight?: Snippet;
		footer?: Snippet;
		//
		elShell?: HTMLElement;
		elRail?: HTMLElement;
		elHeader?: HTMLElement;
		elSidebarLeft?: HTMLElement;
		elPage?: HTMLElement;
		elPageHeader?: HTMLElement;
		elPageMain?: HTMLElement;
		elPageFooter?: HTMLElement;
		elSidebarRight?: HTMLElement;
		elFooter?: HTMLElement;
	}

	let {
		id = "shell",
		class: classProp,
		railClass,
		headerClass,
		contentClass,
		sidebarLeftClass,
		pageClass,
		pageHeaderClass,
		pageMainClass,
		pageFooterClass,
		sidebarRightClass,
		footerClass,
		scrollbarGutter = "auto",
		pageFlexGrow = 3,
		//
		rail,
		header,
		sidebarLeft,
		pageHeader,
		children,
		pageFooter,
		sidebarRight,
		footer,
		//
		elShell = $bindable(),
		elRail = $bindable(),
		elHeader = $bindable(),
		elSidebarLeft = $bindable(),
		elPage = $bindable(),
		elPageHeader = $bindable(),
		elPageMain = $bindable(),
		elPageFooter = $bindable(),
		elSidebarRight = $bindable(),
		elFooter = $bindable(),
	}: Props = $props();

	let _sidebarFlexCls = $derived(pageFlexGrow ? "flex-1" : "flex-none");

	const flexMap = ["flex-1", "flex-1", "flex-[2]", "flex-[3]", "flex-[4]", "flex-[5]"];
	let _pageFlexCls = $derived(flexMap[pageFlexGrow] || "flex-1");

	// pragmatic use case...
	let mainWidth: number = $state(0);
	setContext(MAIN_WIDTH, {
		get current() {
			return mainWidth;
		},
	});
</script>

<div
	bind:this={elShell}
	{id}
	data-shell="shell"
	class={twMerge("w-full h-full flex overflow-hidden", classProp)}
>
	<!-- shell > rail -->
	{#if rail}
		<div
			bind:this={elRail}
			data-shell="rail"
			class={twMerge("flex-none overflow-x-hidden overflow-y-auto", railClass)}
		>
			{@render rail()}
		</div>
	{/if}

	<!-- shell > div-->
	<div class="h-full flex-1 flex flex-col overflow-hidden">
		<!-- shell > div > header -->
		{#if header}
			<header
				bind:this={elHeader}
				data-shell="header"
				class={twMerge("flex-none", headerClass)}
			>
				{@render header()}
			</header>
		{/if}

		<!-- shell > div > content -->
		<div
			data-shell="content"
			class={twMerge("flex-auto w-full h-full flex overflow-hidden", contentClass)}
		>
			<!-- shell > div > content > sidebar-left -->
			{#if sidebarLeft}
				<aside
					bind:this={elSidebarLeft}
					data-shell="sidebar-left"
					class={twMerge(
						_sidebarFlexCls,
						"overflow-x-hidden overflow-y-auto w-auto",
						sidebarLeftClass
					)}
				>
					{@render sidebarLeft()}
				</aside>
			{/if}

			<!-- shell > div > content > page -->
			<div
				bind:this={elPage}
				data-shell="page"
				class={twMerge(_pageFlexCls, "overflow-x-hidden flex flex-col", pageClass)}
				style:scrollbar-gutter={scrollbarGutter}
			>
				<!-- shell > div > content > page > page-header -->
				{#if pageHeader}
					<header
						bind:this={elPageHeader}
						data-shell="page-header"
						class={twMerge("flex-none", pageHeaderClass)}
					>
						{@render pageHeader()}
					</header>
				{/if}

				<!-- shell > div > content > page > page-main -->
				<main
					bind:this={elPageMain}
					data-shell="page-main"
					class={twMerge("flex-auto", pageMainClass)}
					bind:offsetWidth={mainWidth}
				>
					{@render children?.()}
				</main>

				<!-- shell > div > content > page > page-footer -->
				{#if pageFooter}
					<footer
						bind:this={elPageFooter}
						data-shell="page-footer"
						class={twMerge("flex-none", pageFooterClass)}
					>
						{@render pageFooter()}
					</footer>
				{/if}
			</div>

			<!-- shell > div > content > sidebar-right -->
			{#if sidebarRight}
				<aside
					bind:this={elSidebarRight}
					data-shell="sidebar-right"
					class={twMerge(
						_sidebarFlexCls,
						"overflow-x-hidden overflow-y-auto",
						sidebarRightClass
					)}
				>
					{@render sidebarRight()}
				</aside>
			{/if}
		</div>

		<!-- shell > div > footer -->
		{#if footer}
			<footer
				bind:this={elFooter}
				data-shell="footer"
				class={twMerge("flex-none", footerClass)}
			>
				{@render footer()}
			</footer>
		{/if}
	</div>
</div>
