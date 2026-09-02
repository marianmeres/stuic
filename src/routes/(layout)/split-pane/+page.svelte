<script lang="ts">
	import {
		SplitPane,
		Button,
		createSplitPaneT,
		SPLIT_PANE_MESSAGES_SK,
		type ResizableInfo,
	} from "$lib/index.js";

	let size = $state(40);
	let basic: SplitPane | undefined = $state();

	let vSize = $state(120);
	let last: ResizableInfo | undefined = $state();

	let disabled = $state(false);

	const tSk = createSplitPaneT(SPLIT_PANE_MESSAGES_SK);
</script>

{#snippet box(label: string)}
	<div class="h-full p-4 text-sm text-neutral-500">
		{label}
	</div>
{/snippet}

<div class="space-y-16 py-8">
	<!-- Basic -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Basic (horizontal, %)</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>bind:size</code> in percent of the container (the default). Drag the
			separator, or focus it and use the arrow keys (Shift for bigger steps), Home / End
			for the bounds, Enter (or double-click) to reset. Writing <code>size</code> resizes too.
		</p>
		<div class="border rounded h-40">
			<SplitPane bind:this={basic} bind:size min={10} max={90}>
				{#snippet start()}{@render box("start pane")}{/snippet}
				{#snippet end()}{@render box("end pane")}{/snippet}
			</SplitPane>
		</div>
		<div class="flex items-center gap-4 mt-3">
			<span class="text-sm text-neutral-500 tabular-nums">size: {Math.round(size)}%</span>
			<Button size="sm" variant="outline" onclick={() => (size = 25)}>size = 25</Button>
			<Button size="sm" variant="outline" onclick={() => basic?.reset()}>reset()</Button>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Vertical -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Vertical (px, min / max)</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>orientation="vertical"</code> stacks the panes and resizes the primary pane's
			height — the container needs a definite height. <code>units="px"</code>,
			<code>min={80}</code>, <code>max={240}</code>, <code>step={20}</code>.
		</p>
		<div class="border rounded h-80">
			<SplitPane
				orientation="vertical"
				units="px"
				bind:size={vSize}
				min={80}
				max={240}
				step={20}
				onResize={(info) => (last = info)}
			>
				{#snippet start()}{@render box("top pane")}{/snippet}
				{#snippet end()}{@render box("bottom pane")}{/snippet}
			</SplitPane>
		</div>
		<p class="text-sm text-neutral-500 tabular-nums mt-3">
			size: {vSize}px
			{#if last}
				· last onResize: {JSON.stringify(last)}
			{/if}
		</p>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Primary end + persisted -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Primary end, persisted</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>primary="end"</code> sizes the second pane (the separator sits on its start
			edge), <code>key="demo-inspector"</code> + <code>storage="local"</code> remembers
			the size across reloads (a stored size wins over <code>size</code> on mount).
		</p>
		<div class="border rounded h-40">
			<SplitPane
				primary="end"
				size={30}
				min={15}
				max={60}
				key="demo-inspector"
				storage="local"
			>
				{#snippet start()}{@render box("main")}{/snippet}
				{#snippet end()}{@render box("inspector (primary)")}{/snippet}
			</SplitPane>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Nested -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Nested</h2>
		<p class="text-sm text-neutral-500 mb-4">
			A vertical split inside the end pane of a horizontal one — the classic editor
			layout. Panes are <code>overflow: auto</code>, so long content scrolls inside them.
		</p>
		<div class="border rounded h-96">
			<SplitPane size={25} min={10}>
				{#snippet start()}
					<div class="p-4 text-sm text-neutral-500 space-y-2">
						<p class="font-medium">sidebar</p>
						{#each { length: 30 } as _, i (i)}
							<p>item {i + 1}</p>
						{/each}
					</div>
				{/snippet}
				{#snippet end()}
					<SplitPane orientation="vertical" size={65} min={20} max={90}>
						{#snippet start()}{@render box("editor")}{/snippet}
						{#snippet end()}{@render box("terminal")}{/snippet}
					</SplitPane>
				{/snippet}
			</SplitPane>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Disabled -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Disabled</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>disabled</code> keeps the layout and renders the separator as a plain divider: no
			drag, no keyboard, not focusable. Re-enabling picks the current size up.
		</p>
		<div class="border rounded h-40">
			<SplitPane {disabled} size={50}>
				{#snippet start()}{@render box("start")}{/snippet}
				{#snippet end()}{@render box("end")}{/snippet}
			</SplitPane>
		</div>
		<div class="mt-3">
			<Button size="sm" variant="outline" onclick={() => (disabled = !disabled)}>
				{disabled ? "enable" : "disable"}
			</Button>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Styling + i18n -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Styling, i18n</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Tokens: <code>--stuic-split-pane-separator-thickness</code>,
			<code>--stuic-split-pane-separator-color</code>, <code>…-color-hover</code>,
			<code>--stuic-split-pane-grip-*</code>. Class slots: <code>startClass</code>,
			<code>endClass</code>, <code>separatorClass</code>. The separator's accessible name
			comes from <code>label</code> or <code>t("resize")</code> — Slovak bundled.
		</p>
		<div class="border rounded h-40">
			<SplitPane
				size={50}
				t={tSk}
				startClass="bg-neutral-50 dark:bg-neutral-900"
				style="--stuic-split-pane-separator-thickness: 6px; --stuic-split-pane-separator-color: var(--stuic-color-muted); --stuic-split-pane-separator-color-hover: var(--stuic-color-accent); --stuic-split-pane-grip-color: var(--stuic-color-foreground);"
			>
				{#snippet start()}{@render box("štart")}{/snippet}
				{#snippet end()}{@render box("koniec")}{/snippet}
			</SplitPane>
		</div>
	</section>
</div>
