<script lang="ts">
	import { InputHistory } from "$lib/index.js";

	// Example 1: Basic input with history
	const history1 = new InputHistory({
		keyParts: ["demo", "basic"],
		appId: "stuic-demo",
		featureName: "input-history",
	});
	let value1 = $state("");

	function handleKeydown1(e: KeyboardEvent) {
		if (e.key === "ArrowUp") {
			e.preventDefault();
			const entry = history1.navigateUp(value1);
			if (entry !== null) value1 = entry;
		} else if (e.key === "ArrowDown") {
			e.preventDefault();
			const entry = history1.navigateDown();
			if (entry !== null) value1 = entry;
		} else if (!["Shift", "Control", "Alt", "Meta"].includes(e.key)) {
			history1.reset();
		}
	}

	function handleSubmit1(e: Event) {
		e.preventDefault();
		if (value1.trim()) {
			history1.add(value1);
			value1 = "";
		}
	}

	// Example 2: Search filter simulation (like the real Filter component)
	const history2 = new InputHistory({
		keyParts: ["project-123", "cms", "posts", "article"],
		appId: "stuic-demo",
		featureName: "filter-history",
		maxEntries: 5, // shorter history for demo
	});
	let value2 = $state("");
	let searchResults = $state<string[]>([]);

	function handleKeydown2(e: KeyboardEvent) {
		if (e.key === "ArrowUp") {
			e.preventDefault();
			const entry = history2.navigateUp(value2);
			if (entry !== null) value2 = entry;
		} else if (e.key === "ArrowDown") {
			e.preventDefault();
			const entry = history2.navigateDown();
			if (entry !== null) value2 = entry;
		} else if (!["Shift", "Control", "Alt", "Meta"].includes(e.key)) {
			history2.reset();
		}
	}

	function handleSubmit2(e: Event) {
		e.preventDefault();
		if (value2.trim()) {
			history2.add(value2);
			searchResults = [`Searching for: "${value2}"`, ...searchResults].slice(0, 5);
			value2 = "";
		}
	}

	// Example 3: Different scopes demonstration
	const historyA = new InputHistory({
		keyParts: ["scope-a"],
		appId: "stuic-demo",
	});
	const historyB = new InputHistory({
		keyParts: ["scope-b"],
		appId: "stuic-demo",
	});
	let valueA = $state("");
	let valueB = $state("");

	function handleKeydownA(e: KeyboardEvent) {
		if (e.key === "ArrowUp") {
			e.preventDefault();
			const entry = historyA.navigateUp(valueA);
			if (entry !== null) valueA = entry;
		} else if (e.key === "ArrowDown") {
			e.preventDefault();
			const entry = historyA.navigateDown();
			if (entry !== null) valueA = entry;
		} else if (!["Shift", "Control", "Alt", "Meta"].includes(e.key)) {
			historyA.reset();
		}
	}

	function handleKeydownB(e: KeyboardEvent) {
		if (e.key === "ArrowUp") {
			e.preventDefault();
			const entry = historyB.navigateUp(valueB);
			if (entry !== null) valueB = entry;
		} else if (e.key === "ArrowDown") {
			e.preventDefault();
			const entry = historyB.navigateDown();
			if (entry !== null) valueB = entry;
		} else if (!["Shift", "Control", "Alt", "Meta"].includes(e.key)) {
			historyB.reset();
		}
	}

	function handleSubmitA(e: Event) {
		e.preventDefault();
		if (valueA.trim()) {
			historyA.add(valueA);
			valueA = "";
		}
	}

	function handleSubmitB(e: Event) {
		e.preventDefault();
		if (valueB.trim()) {
			historyB.add(valueB);
			valueB = "";
		}
	}
</script>

<div class="space-y-12">
	<!-- Example 1: Basic -->
	<section>
		<h2 class="text-lg font-semibold mb-2">Basic Input History</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Type something and press Enter. Use Up/Down arrows to navigate history.
		</p>

		<form onsubmit={handleSubmit1} class="flex gap-2">
			<input
				type="text"
				bind:value={value1}
				onkeydown={handleKeydown1}
				placeholder="Type and press Enter..."
				class="flex-1 rounded border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
			/>
			<button
				type="submit"
				class="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
			>
				Add
			</button>
		</form>

		<div class="mt-4 text-sm">
			<div class="flex items-center gap-4">
				<span class="text-neutral-500">History ({history1.entries.length}):</span>
				{#if history1.isNavigating}
					<span class="rounded bg-amber-100 px-2 py-0.5 text-amber-700">
						Navigating: {history1.navigationIndex + 1} of {history1.entries.length}
					</span>
				{/if}
			</div>
			{#if history1.entries.length}
				<ul class="mt-2 space-y-1">
					{#each history1.entries as entry, i}
						<li
							class="rounded px-2 py-1 {history1.isNavigating &&
							history1.navigationIndex === i
								? 'bg-blue-100 text-blue-800'
								: 'bg-neutral-100'}"
						>
							{entry}
						</li>
					{/each}
				</ul>
			{:else}
				<p class="mt-2 text-neutral-400 italic">No history yet</p>
			{/if}
		</div>
	</section>

	<hr />

	<!-- Example 2: Search filter -->
	<section>
		<h2 class="text-lg font-semibold mb-2">Search Filter Simulation</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Simulates filter history like in a CMS. Max 5 entries. Storage key:
			<code class="rounded bg-neutral-100 px-1">stuic-demo:filter-history:project-123:cms:posts:article</code>
		</p>

		<form onsubmit={handleSubmit2} class="flex gap-2">
			<input
				type="text"
				bind:value={value2}
				onkeydown={handleKeydown2}
				placeholder="status:published author:john..."
				class="flex-1 rounded border border-neutral-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
			/>
			<button
				type="submit"
				class="rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
			>
				Search
			</button>
		</form>

		<div class="mt-4 grid grid-cols-2 gap-4 text-sm">
			<div>
				<span class="text-neutral-500">History:</span>
				{#if history2.entries.length}
					<ul class="mt-2 space-y-1 font-mono text-xs">
						{#each history2.entries as entry, i}
							<li
								class="rounded px-2 py-1 {history2.isNavigating &&
								history2.navigationIndex === i
									? 'bg-green-100 text-green-800'
									: 'bg-neutral-100'}"
							>
								{entry}
							</li>
						{/each}
					</ul>
				{:else}
					<p class="mt-2 text-neutral-400 italic">No history yet</p>
				{/if}
			</div>
			<div>
				<span class="text-neutral-500">Search log:</span>
				{#if searchResults.length}
					<ul class="mt-2 space-y-1 text-xs">
						{#each searchResults as result}
							<li class="rounded bg-neutral-50 px-2 py-1">{result}</li>
						{/each}
					</ul>
				{:else}
					<p class="mt-2 text-neutral-400 italic">No searches yet</p>
				{/if}
			</div>
		</div>
	</section>

	<hr />

	<!-- Example 3: Different scopes -->
	<section>
		<h2 class="text-lg font-semibold mb-2">Scoped Histories</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Two inputs with separate histories. Each has its own storage key.
		</p>

		<div class="grid grid-cols-2 gap-6">
			<div>
				<h3 class="text-sm font-medium mb-2 text-purple-700">Scope A</h3>
				<form onsubmit={handleSubmitA} class="flex gap-2">
					<input
						type="text"
						bind:value={valueA}
						onkeydown={handleKeydownA}
						placeholder="Scope A input..."
						class="flex-1 rounded border border-purple-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
					/>
					<button
						type="submit"
						class="rounded bg-purple-600 px-3 py-2 text-sm text-white hover:bg-purple-700"
					>
						Add
					</button>
				</form>
				<ul class="mt-2 space-y-1 text-xs">
					{#each historyA.entries as entry, i}
						<li
							class="rounded px-2 py-1 {historyA.isNavigating &&
							historyA.navigationIndex === i
								? 'bg-purple-100'
								: 'bg-neutral-100'}"
						>
							{entry}
						</li>
					{/each}
				</ul>
			</div>

			<div>
				<h3 class="text-sm font-medium mb-2 text-orange-700">Scope B</h3>
				<form onsubmit={handleSubmitB} class="flex gap-2">
					<input
						type="text"
						bind:value={valueB}
						onkeydown={handleKeydownB}
						placeholder="Scope B input..."
						class="flex-1 rounded border border-orange-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
					/>
					<button
						type="submit"
						class="rounded bg-orange-600 px-3 py-2 text-sm text-white hover:bg-orange-700"
					>
						Add
					</button>
				</form>
				<ul class="mt-2 space-y-1 text-xs">
					{#each historyB.entries as entry, i}
						<li
							class="rounded px-2 py-1 {historyB.isNavigating &&
							historyB.navigationIndex === i
								? 'bg-orange-100'
								: 'bg-neutral-100'}"
						>
							{entry}
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</section>

	<hr />

	<!-- Cleanup demo -->
	<section>
		<h2 class="text-lg font-semibold mb-2">Cleanup</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Clear histories matching a pattern (used on logout).
		</p>

		<div class="flex gap-2">
			<button
				onclick={() => {
					InputHistory.clearAllMatching("stuic-demo:");
					// Force reactivity update
					value1 = "";
					value2 = "";
					valueA = "";
					valueB = "";
				}}
				class="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
			>
				Clear All Demo Histories
			</button>

			<button
				onclick={() => {
					console.log("Registered keys:", InputHistory.getRegisteredKeys());
					alert("Check console for registered keys");
				}}
				class="rounded border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
			>
				Log Registered Keys
			</button>
		</div>
	</section>
</div>
