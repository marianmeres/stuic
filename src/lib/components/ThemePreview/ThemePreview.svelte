<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	export interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		/** Show section labels */
		showLabels?: boolean;
		/** Compact layout (reduced spacing) */
		compact?: boolean;
		/** Show all button variants or just solid */
		showAllVariants?: boolean;
		/** Show input examples */
		showInputs?: boolean;
		/** Additional CSS classes */
		class?: string;
		/** Bindable element reference */
		el?: HTMLDivElement;
		/** Optional header snippet */
		header?: Snippet;
		/** Optional sidebar snippet */
		sidebar?: Snippet;
		/** Optional footer snippet */
		footer?: Snippet;
		/** Optional AlertConfirmPromptStack*/
		acp?: AlertConfirmPromptStack;
		/** Optional NotificationsStack*/
		notifications?: NotificationsStack;
	}

	/** Intent colors to demonstrate */
	export const INTENT_COLORS = [
		"primary",
		"accent",
		"destructive",
		"warning",
		"success",
		"info",
	] as const;

	/** Button variants to demonstrate */
	export const BUTTON_VARIANTS = ["solid", "outline", "ghost", "soft", "link"] as const;
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import Button from "../Button/Button.svelte";
	import Switch from "../Switch/Switch.svelte";
	import { AlertConfirmPromptStack } from "../AlertConfirmPrompt/index.js";
	import {
		type DismissibleMessageIntent,
		DismissibleMessage,
	} from "../DismissibleMessage/index.js";
	import { createClog } from "@marianmeres/clog";
	import Nav, { type NavGroup } from "../Nav/Nav.svelte";
	import type { NotificationsStack } from "../Notifications/notifications-stack.svelte.js";
	import FieldInput from "../Input/FieldInput.svelte";
	import FieldCheckbox from "../Input/FieldCheckbox.svelte";

	const clog = createClog("ThemePreview", { color: "auto" });

	let {
		showLabels = true,
		compact = false,
		showAllVariants = true,
		showInputs = true,
		class: classProp,
		el = $bindable(),
		header,
		sidebar,
		footer,
		acp,
		notifications,
		...rest
	}: Props = $props();

	let spacing = $derived(compact ? "gap-2 p-2" : "gap-4 p-4");

	const alert = (intent?: string) => {
		acp?.alert(intent);
		notif(intent);
	};

	const notif = (intent?: string) => {
		if (intent && notifications) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(notifications as any)[intent]?.(intent);
		}
	};

	// Navigation groups for sidebar
	let activeNavId = $state("dashboard");
	const navGroups: NavGroup[] = [
		{
			title: "Navigation",
			id: "navigation",
			items: [
				{ id: "dashboard", label: "Dashboard" },
				{ id: "settings", label: "Settings" },
				{ id: "profile", label: "Profile" },
				{ id: "archived", label: "Archived", disabled: true },
			],
		},
	];

	//
	let dismissibleMessage = $state<string | null>();
	let dismissibleIntent = $state<DismissibleMessageIntent | undefined>();
</script>

<div bind:this={el} class={twMerge("stuic-theme-preview", spacing, classProp)} {...rest}>
	<!-- HEADER -->
	<header class="stuic-theme-preview-header">
		{#if header}
			{@render header()}
		{:else}
			<div class="header-content">
				<h1 class="header-title">Theme Preview</h1>
				<p class="header-subtitle">Design tokens in action</p>
			</div>
		{/if}
	</header>

	<!-- BODY: Sidebar + Main -->
	<div class="stuic-theme-preview-body">
		<!-- SIDEBAR -->
		<aside class="stuic-theme-preview-sidebar">
			{#if sidebar}
				{@render sidebar()}
			{:else}
				<Nav
					groups={navGroups}
					activeId={activeNavId}
					onSelect={(item) => (activeNavId = item.id)}
				/>
				<div class="sidebar-footer">
					<span class="muted-text">v1.0.0</span>
				</div>
			{/if}
		</aside>

		<!-- MAIN CONTENT -->
		<main class="stuic-theme-preview-main">
			<DismissibleMessage
				message={dismissibleMessage}
				intent={dismissibleIntent}
				onDismiss={() => {
					dismissibleIntent = undefined;
					dismissibleMessage = null;
				}}
			/>
			<!-- INTENT BUTTONS -->
			<section class="preview-section">
				{#if showLabels}
					<h2 class="section-label">Intent Colors (Buttons)</h2>
				{/if}

				<div class="button-grid">
					{#each INTENT_COLORS as intent}
						<div class="button-column">
							{#if showLabels}
								<span class="intent-label">{intent}</span>
							{/if}

							{#if showAllVariants}
								{#each BUTTON_VARIANTS as variant}
									<Button
										{intent}
										{variant}
										onclick={() => {
											if (!["primary", "accent"].includes(intent)) {
												dismissibleIntent = intent as DismissibleMessageIntent;
												dismissibleMessage = intent;
												notif(intent);
											} else {
												alert(intent);
											}
										}}
									>
										{variant}
									</Button>
								{/each}
							{:else}
								<Button {intent} onclick={() => alert(intent)}>
									{intent}
								</Button>
							{/if}
						</div>
					{/each}
				</div>
			</section>

			<section class="preview-section">
				{#if showLabels}
					<h2 class="section-label">Default Button (no explicit intent)</h2>
				{/if}
				<div class="flex gap-6 flex-wrap">
					{#each BUTTON_VARIANTS as variant}
						<div class="flex gap-2">
							<Button {variant}>{variant}</Button>
							<Button x {variant} roundedFull />
						</div>
					{/each}
				</div>
			</section>

			<!-- ROLE COLORS -->
			<section class="preview-section">
				{#if showLabels}
					<h2 class="section-label">Role Colors</h2>
				{/if}

				<div class="role-colors-grid">
					<div class="color-swatch background">
						<span class="swatch-label">background</span>
						<span class="foreground-text">foreground text</span>
					</div>

					<div class="color-swatch surface">
						<span class="swatch-label">surface</span>
						<span class="surface-foreground-text">surface-foreground</span>
					</div>

					<div class="color-swatch surface-1">
						<span class="swatch-label">surface-1</span>
						<span class="surface-1-foreground-text">surface-1-foreground</span>
					</div>

					<div class="color-swatch surface-2">
						<span class="swatch-label">surface-2</span>
						<span class="surface-2-foreground-text">surface-2-foreground</span>
					</div>

					<div class="color-swatch muted-bg">
						<span class="swatch-label">muted</span>
						<span class="muted-foreground-text">muted-foreground</span>
					</div>
				</div>
			</section>

			<!-- BORDERS -->
			<section class="preview-section">
				{#if showLabels}
					<h2 class="section-label">Borders</h2>
				{/if}

				<div class="border-examples">
					<div class="border-box default">Default border</div>
					<div class="border-box hover">Hover state (hover me)</div>
					<div class="border-box active">Active state</div>
				</div>
			</section>

			<!-- INPUTS -->
			{#if showInputs}
				<section class="preview-section">
					{#if showLabels}
						<h2 class="section-label">Inputs</h2>
					{/if}

					<div class="input-examples flex items-center">
						<!-- <div class="input-wrapper"> -->
						<!-- <input type="text" class="preview-input" placeholder="Text input..." /> -->
						<FieldInput class="m-0" />
						<!-- </div> -->
						<!-- <div class="input-wrapper"> -->
						<FieldCheckbox label="Hey ho" class="m-0" />
						<!-- <input
								type="text"
								class="preview-input focus"
								value="Focused state"
								readonly
							/> -->
						<!-- </div> -->
					</div>
				</section>
			{/if}

			<!-- SWITCHES -->
			<section class="preview-section">
				{#if showLabels}
					<h2 class="section-label">Switches</h2>
				{/if}

				<div class="flex flex-wrap items-center gap-4">
					<Switch checked />
					{#each INTENT_COLORS as intent}
						<Switch {intent} checked />
					{/each}
				</div>
			</section>

			<!-- HIGHLIGHT BOXES -->
			<section class="preview-section">
				{#if showLabels}
					<h2 class="section-label">Highlighted Content</h2>
				{/if}

				<div class="highlight-box primary">
					<strong>Primary Highlight</strong>
					<p>This box uses primary intent colors for important content.</p>
				</div>

				<div class="highlight-box accent">
					<strong>Accent Highlight</strong>
					<p>This box uses accent colors to draw attention.</p>
				</div>
			</section>

			<!-- TYPOGRAPHY -->
			<section class="preview-section">
				{#if showLabels}
					<h2 class="section-label">Typography</h2>
				{/if}

				<div class="typography-demo">
					<p class="text-foreground">
						This is <strong>foreground</strong> text - the primary text color.
					</p>
					<p class="text-muted">
						This is <strong>muted</strong> text - used for secondary information.
					</p>
					<p class="text-surface-foreground">
						This is <strong>surface-foreground</strong> text - used on surface backgrounds.
					</p>
				</div>
			</section>

			<!-- TAILWIND UTILITY CLASSES -->
			<section class="preview-section">
				{#if showLabels}
					<h2 class="section-label">Tailwind Utility Classes</h2>
				{/if}

				<div class="flex flex-col gap-3">
					<!-- Intent color boxes using inline styles with CSS variables -->
					<div class="flex flex-wrap gap-2">
						{#each INTENT_COLORS as intent}
							<div
								class="px-3 py-2 rounded text-sm"
								style="background: var(--stuic-color-{intent}); color: var(--stuic-color-{intent}-foreground);"
							>
								{intent}
							</div>
						{/each}
					</div>

					<!-- Role color examples using Tailwind arbitrary value syntax -->
					<div class="flex flex-wrap gap-2">
						<div
							class="px-3 py-2 rounded border border-(--stuic-color-border) bg-(--stuic-color-surface) text-(--stuic-color-surface-foreground)"
						>
							surface + border
						</div>
						<div
							class="px-3 py-2 rounded bg-(--stuic-color-muted) text-(--stuic-color-muted-foreground)"
						>
							muted
						</div>
						<div
							class="px-3 py-2 rounded bg-(--stuic-color-primary) text-(--stuic-color-primary-foreground)"
						>
							primary
						</div>
						<div
							class="px-3 py-2 rounded bg-(--stuic-color-accent) text-(--stuic-color-accent-foreground)"
						>
							accent
						</div>
					</div>

					<!-- Code hint -->
					<p class="text-xs text-(--stuic-color-muted-foreground)">
						Using: <code class="bg-(--stuic-color-muted) px-1 rounded"
							>bg-(--stuic-color-primary)</code
						> syntax
					</p>
				</div>
			</section>
		</main>
	</div>

	<!-- FOOTER -->
	<footer class="stuic-theme-preview-footer">
		{#if footer}
			{@render footer()}
		{:else}
			<div class="footer-content">
				<span class="muted-text">Theme tokens demonstration</span>
				<span class="footer-divider">|</span>
				<span class="foreground-text">stuic</span>
			</div>
		{/if}
	</footer>
</div>
