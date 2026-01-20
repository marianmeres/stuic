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
	import "./index.css";
	import { twMerge } from "../../utils/tw-merge.js";

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
		...rest
	}: Props = $props();

	let spacing = $derived(compact ? "gap-2 p-2" : "gap-4 p-4");
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
				<nav class="sidebar-nav">
					{#if showLabels}
						<span class="section-label">Navigation</span>
					{/if}
					<ul class="nav-list">
						<li class="nav-item active">Dashboard</li>
						<li class="nav-item">Settings</li>
						<li class="nav-item">Profile</li>
						<li class="nav-item muted">Archived</li>
					</ul>
				</nav>
				<div class="sidebar-footer">
					<span class="muted-text">v1.0.0</span>
				</div>
			{/if}
		</aside>

		<!-- MAIN CONTENT -->
		<main class="stuic-theme-preview-main">
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
									<button
										class="stuic-theme-preview-button"
										data-intent={intent}
										data-variant={variant}
									>
										{variant}
									</button>
								{/each}
							{:else}
								<button
									class="stuic-theme-preview-button"
									data-intent={intent}
									data-variant="solid"
								>
									{intent}
								</button>
							{/if}
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

					<div class="input-examples">
						<div class="input-wrapper">
							<input type="text" class="preview-input" placeholder="Text input..." />
						</div>
						<div class="input-wrapper">
							<input
								type="text"
								class="preview-input focus"
								value="Focused state"
								readonly
							/>
						</div>
					</div>
				</section>
			{/if}

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
