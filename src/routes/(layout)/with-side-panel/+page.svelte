<script lang="ts">
	import { WithSidePanel } from "../../../lib/index.js";

	// demo 1: basic left
	let panel1: WithSidePanel;

	// demo 2: right position
	let panel2: WithSidePanel;

	// demo 3: resizable left
	let panel3: WithSidePanel;

	// demo 4: resizable right
	let panel4: WithSidePanel;

	// demo 5: narrow container (threshold demo)
	let panel5: WithSidePanel;

	// reactive state via bind:current
	let current1 = $state({ open: true, small: false });
	let current5 = $state({ open: true, small: false });

	// generate scrollable content
	const loremItems = Array.from(
		{ length: 30 },
		(_, i) => `Item ${i + 1} — Lorem ipsum dolor sit amet`
	);
</script>

<div class="space-y-8 pb-8">
	<!-- Demo 1: Basic left position -->
	<section>
		<h2 class="text-lg font-semibold mb-2">1. Basic (left, 250px)</h2>
		<div class="flex gap-2 mb-2">
			<button class="border px-3 py-1 rounded text-sm" onclick={() => panel1.show()}>
				show
			</button>
			<button class="border px-3 py-1 rounded text-sm" onclick={() => panel1.hide()}>
				hide
			</button>
			<button class="border px-3 py-1 rounded text-sm" onclick={() => panel1.toggle()}>
				toggle
			</button>
			<button
				class="border px-3 py-1 rounded text-sm"
				onclick={() => panel1.setWidth("200px")}
			>
				setWidth(200px)
			</button>
			{#if current1}<code class="text-sm self-center">{JSON.stringify(current1)}</code
				>{/if}
		</div>
		<div class="border h-[300px]">
			<WithSidePanel bind:this={panel1} bind:current={current1} width="250px">
				{#snippet side()}
					<div class="p-3">
						<h3 class="font-semibold mb-2">Side Panel</h3>
						{#each loremItems as item}
							<div class="py-1 text-sm border-b border-gray-100 dark:border-gray-800">
								{item}
							</div>
						{/each}
					</div>
				{/snippet}
				<div class="p-3">
					<h3 class="font-semibold mb-2">Main Content</h3>
					{#each loremItems as item}
						<div class="py-1 text-sm">{item}</div>
					{/each}
				</div>
			</WithSidePanel>
		</div>
	</section>

	<!-- Demo 2: Right position -->
	<section>
		<h2 class="text-lg font-semibold mb-2">2. Right position (300px)</h2>
		<div class="flex gap-2 mb-2">
			<button class="border px-3 py-1 rounded text-sm" onclick={() => panel2.toggle()}>
				toggle
			</button>
		</div>
		<div class="border h-[300px]">
			<WithSidePanel bind:this={panel2} position="right" width="300px">
				{#snippet side()}
					<div class="p-3">
						<h3 class="font-semibold mb-2">Right Side</h3>
						{#each loremItems.slice(0, 15) as item}
							<div class="py-1 text-sm border-b border-gray-100 dark:border-gray-800">
								{item}
							</div>
						{/each}
					</div>
				{/snippet}
				<div class="p-3">
					<h3 class="font-semibold mb-2">Main Content</h3>
					<p class="text-sm">The side panel is on the right.</p>
				</div>
			</WithSidePanel>
		</div>
	</section>

	<!-- Demo 3: Resizable left -->
	<section>
		<h2 class="text-lg font-semibold mb-2">
			3. Resizable (left, 300px, min:150, max:500)
		</h2>
		<div class="flex gap-2 mb-2">
			<button class="border px-3 py-1 rounded text-sm" onclick={() => panel3.toggle()}>
				toggle
			</button>
		</div>
		<div class="border h-[300px]">
			<WithSidePanel
				bind:this={panel3}
				width="300px"
				resizable={{ min: 150, max: 500, key: "demo-left" }}
			>
				{#snippet side()}
					<div class="p-3">
						<h3 class="font-semibold mb-2">Resizable Side</h3>
						<p class="text-sm">Drag the right edge to resize. Double-click to reset.</p>
						{#each loremItems.slice(0, 10) as item}
							<div class="py-1 text-sm">{item}</div>
						{/each}
					</div>
				{/snippet}
				<div class="p-3">
					<h3 class="font-semibold mb-2">Main Content</h3>
					<p class="text-sm">The side panel is resizable.</p>
				</div>
			</WithSidePanel>
		</div>
	</section>

	<!-- Demo 4: Resizable right -->
	<section>
		<h2 class="text-lg font-semibold mb-2">
			4. Resizable (right, 250px, min:150, max:400)
		</h2>
		<div class="flex gap-2 mb-2">
			<button class="border px-3 py-1 rounded text-sm" onclick={() => panel4.toggle()}>
				toggle
			</button>
		</div>
		<div class="border h-[300px]">
			<WithSidePanel
				bind:this={panel4}
				position="right"
				width="250px"
				resizable={{ min: 150, max: 400, key: "demo-right" }}
			>
				{#snippet side()}
					<div class="p-3">
						<h3 class="font-semibold mb-2">Resizable Right</h3>
						<p class="text-sm">Drag the left edge to resize.</p>
					</div>
				{/snippet}
				<div class="p-3">
					<h3 class="font-semibold mb-2">Main Content</h3>
					<p class="text-sm">Right-positioned resizable side panel.</p>
				</div>
			</WithSidePanel>
		</div>
	</section>

	<!-- Demo 5: Threshold / responsive -->
	<section>
		<h2 class="text-lg font-semibold mb-2">
			5. Threshold demo (threshold=500px, container resizable)
		</h2>
		<div class="flex gap-2 mb-2">
			<button class="border px-3 py-1 rounded text-sm" onclick={() => panel5.toggle()}>
				toggle
			</button>
			{#if current5}<code class="text-sm self-center">{JSON.stringify(current5)}</code
				>{/if}
		</div>
		<p class="text-sm text-gray-500 mb-2">
			Resize the container below (drag its right edge) to see threshold behavior. Below
			500px the side auto-hides. Toggle opens it full-width.
		</p>
		<div
			class="border h-[300px] max-w-[800px]"
			style="resize: horizontal; overflow: hidden;"
		>
			<WithSidePanel
				bind:this={panel5}
				bind:current={current5}
				threshold={500}
				width="200px"
			>
				{#snippet side()}
					<div class="p-3">
						<h3 class="font-semibold mb-2">Side</h3>
						<p class="text-sm">I hide below 500px container width.</p>
					</div>
				{/snippet}
				<div class="p-3">
					<h3 class="font-semibold mb-2">Main Content</h3>
					<p class="text-sm">Resize this container to see the threshold behavior.</p>
				</div>
			</WithSidePanel>
		</div>
	</section>

	<!-- Demo 6: No transition -->
	<section>
		<h2 class="text-lg font-semibold mb-2">6. No transition</h2>
		<div class="border h-[200px]">
			<WithSidePanel transition={false} width="200px">
				{#snippet side()}
					<div class="p-3">
						<h3 class="font-semibold mb-2">Side</h3>
						<p class="text-sm">No transition animation.</p>
					</div>
				{/snippet}
				<div class="p-3">
					<h3 class="font-semibold mb-2">Main Content</h3>
					<p class="text-sm">Instant show/hide.</p>
				</div>
			</WithSidePanel>
		</div>
	</section>

	<!-- Demo 7: Custom classes, no border -->
	<section>
		<h2 class="text-lg font-semibold mb-2">7. Custom classes</h2>
		<div class="border h-[200px]">
			<WithSidePanel
				width="220px"
				classSide="bg-gray-100 dark:bg-gray-900"
				classMain="bg-white dark:bg-gray-950"
				class="[--stuic-with-side-panel-border-width:0px]"
			>
				{#snippet side()}
					<div class="p-3">
						<h3 class="font-semibold mb-2">Custom bg, no border</h3>
					</div>
				{/snippet}
				<div class="p-3">
					<h3 class="font-semibold mb-2">Main Content</h3>
				</div>
			</WithSidePanel>
		</div>
	</section>
</div>
