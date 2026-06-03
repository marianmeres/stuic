<script lang="ts">
	import {
		MarkdownEditor,
		type ToolbarItem,
	} from "$lib/components/MarkdownEditor/index.js";
	import {
		AlertConfirmPrompt,
		AlertConfirmPromptStack,
		createPrompt,
		type ValidationResult,
	} from "$lib/index.js";

	// STUIC ACP prompt opt-in (replaces the native window.prompt for link/image)
	const acp = new AlertConfirmPromptStack();
	const acpPrompt = createPrompt(acp);
	let acpValue = $state("Click the **link** or image button — uses STUIC's ACP dialog.");

	let custom = $state("Pick your own buttons via the `toolbar` prop.");
	const customToolbar: ToolbarItem[] = [
		"bold",
		"italic",
		"|",
		"blockquote",
		"codeBlock",
		"|",
		"undo",
		"redo",
	];

	let value = $state(
		`# Hello world\n\nThis is a **quasi-WYSIWYG** markdown editor.\n\n- switchable to raw source\n- powered by Milkdown + CodeMirror\n\n> Try the toolbar and the mode toggle.`
	);
	let mode = $state<"wysiwyg" | "source">("wysiwyg");

	// Imperative / validation demo
	let required = $state("");
	let field = $state<MarkdownEditor>();
	let lastResult = $state<ValidationResult | undefined>();

	function forceValidate() {
		lastResult = field?.validate();
	}

	function externalSet() {
		// Programmatic mutation — must update the editor once, no echo loop.
		value = `## Set from outside\n\nReplaced at random: ${Math.round(performance.now())}`;
	}
</script>

<div class="w-full max-w-2xl mx-auto py-8 space-y-12">
	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Basic (bind value + mode)</h2>
		<MarkdownEditor bind:value bind:mode label="Article body" />
		<div class="flex gap-2 text-sm">
			<button
				class="underline"
				onclick={() => (mode = mode === "wysiwyg" ? "source" : "wysiwyg")}
			>
				toggle mode (currently: {mode})
			</button>
			<button class="underline" onclick={externalSet}>set value externally</button>
		</div>
		<details>
			<summary class="text-sm opacity-60">raw markdown value</summary>
			<pre class="text-xs whitespace-pre-wrap bg-black/5 p-3 rounded">{value}</pre>
		</details>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Required + imperative validation</h2>
		<MarkdownEditor
			bind:this={field}
			bind:value={required}
			label="Required field"
			required
			renderSize="sm"
		/>
		<div class="flex gap-2 text-sm">
			<button class="underline" onclick={forceValidate}>validate()</button>
			<button class="underline" onclick={() => field?.clearValidation()}>clear</button>
		</div>
		{#if lastResult}
			<p class="text-sm">valid: {String(lastResult.valid)} — {lastResult.message}</p>
		{/if}
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Custom toolbar (configurable via prop)</h2>
		<MarkdownEditor bind:value={custom} toolbar={customToolbar} label="Custom buttons" />
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">ACP prompt (link/image dialog opt-in)</h2>
		<MarkdownEditor bind:value={acpValue} prompt={acpPrompt} label="With ACP dialog" />
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Disabled / no toolbar</h2>
		<MarkdownEditor
			value={"Read only **content**."}
			disabled
			toolbar={false}
			showModeToggle={false}
			label="Disabled"
		/>
	</section>
</div>

<!-- ACP provider — mounted once for the demo above -->
<AlertConfirmPrompt {acp} />
