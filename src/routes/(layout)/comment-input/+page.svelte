<script lang="ts">
	import { CommentInput, type ValidationResult } from "$lib/index.js";

	// Basic, with an async submit handler.
	let value = $state("Type some **markdown**, then hit _Preview_.");
	let posted = $state<string[]>([]);
	async function post(text: string) {
		// Simulate a network round-trip so the submit spinner is visible.
		await new Promise((r) => setTimeout(r, 600));
		posted = [text, ...posted];
	}

	// With avatar + cancel.
	let reply = $state("");

	// Required + imperative validation.
	let required = $state("");
	let field = $state<CommentInput>();
	let lastResult = $state<ValidationResult | undefined>();

	// Custom renderer (no markdown lib needed) — naive, just to show the hook.
	let custom = $state("This preview is rendered by a **custom** renderMarkdown.");
	const upper = (md: string) =>
		`<p style="letter-spacing:.03em">${md.replace(/</g, "&lt;").toUpperCase()}</p>`;

	// Plain markdown textarea (no tabs), externally controlled busy.
	let plain = $state("");
	let busy = $state(false);
</script>

<div class="w-full max-w-2xl mx-auto py-8 space-y-12">
	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Basic (bind value + async submit)</h2>
		<CommentInput
			bind:value
			label="Add a comment"
			placeholder="Leave a comment…"
			onSubmit={post}
		/>
		<p class="text-sm opacity-60">⌘/Ctrl + Enter submits. Clears on success.</p>
		{#if posted.length}
			<ul class="space-y-2">
				{#each posted as p}
					<li class="text-sm bg-black/5 dark:bg-white/5 rounded p-3 whitespace-pre-wrap">
						{p}
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Avatar gutter + Cancel</h2>
		<CommentInput
			bind:value={reply}
			placeholder="Reply…"
			onSubmit={post}
			onCancel={() => (reply = "")}
			submitLabel="Reply"
		>
			{#snippet avatar()}
				<span
					class="grid place-items-center size-9 rounded-full bg-indigo-500 text-white text-sm font-semibold"
				>
					MM
				</span>
			{/snippet}
		</CommentInput>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Required + imperative validation</h2>
		<CommentInput
			bind:this={field}
			bind:value={required}
			label="Required comment"
			required
			renderSize="sm"
			onSubmit={post}
		/>
		<div class="flex gap-2 text-sm">
			<button class="underline" onclick={() => (lastResult = field?.validate())}>
				validate()
			</button>
			<button class="underline" onclick={() => field?.clearValidation()}>clear</button>
		</div>
		{#if lastResult}
			<p class="text-sm">valid: {String(lastResult.valid)} — {lastResult.message}</p>
		{/if}
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Custom renderMarkdown (no markdown lib)</h2>
		<CommentInput bind:value={custom} label="Custom preview" renderMarkdown={upper} />
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">
			Plain markdown textarea (no tabs) + external busy
		</h2>
		<CommentInput
			bind:value={plain}
			showTabs={false}
			showMarkdownHint={false}
			label="Note"
			placeholder="Just a markdown textarea with a submit button…"
			{busy}
			onSubmit={post}
		/>
		<label class="text-sm flex items-center gap-2">
			<input type="checkbox" bind:checked={busy} /> toggle external busy
		</label>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Disabled</h2>
		<CommentInput
			value="Read-only **content**."
			disabled
			label="Disabled"
			onSubmit={post}
		/>
	</section>
</div>
