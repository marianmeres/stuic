<script lang="ts">
	// Harness for what `rerender()` can't drive: `rerender()` re-signals every prop (so it
	// would re-run the measuring and painting effects on its own and hide a missing
	// dependency on the code), and it can't observe a written `$bindable`.
	import CodeBlock, { type CodeBlockSample } from "./CodeBlock.svelte";

	let {
		mode = "swap",
		initial = "",
		next = "",
		lang,
	}: {
		mode?: "swap" | "sync" | "expanded";
		initial?: string;
		next?: string;
		lang?: string;
	} = $props();

	// swap: `code` alone changes, from inside
	// svelte-ignore state_referenced_locally
	let code = $state(initial);
	let lineNumbers = $state(false);

	// sync: two tabbed blocks share one bound `active`
	let active = $state<string | undefined>();
	const first: CodeBlockSample[] = [
		{ label: "curl", lang: "bash", code: "curl https://x.test" },
		{ label: "Python", lang: "python", code: "requests.get('https://x.test')" },
	];
	const second: CodeBlockSample[] = [
		{ label: "curl", lang: "bash", code: "curl -X POST https://x.test" },
		{ label: "fetch", lang: "js", code: "await fetch('https://x.test')" },
	];

	// expanded: a written bindable, mirrored out
	let expanded = $state(false);
</script>

{#if mode === "swap"}
	<button type="button" onclick={() => (code = code === initial ? next : initial)}
		>swap</button
	>
	<button type="button" onclick={() => (lineNumbers = !lineNumbers)}>numbers</button>
	<CodeBlock {code} {lang} {lineNumbers} copy={false} style="width: 240px" />
{:else if mode === "sync"}
	<output data-testid="active">{active ?? ""}</output>
	<CodeBlock samples={first} bind:active copy={false} data-testid="first" />
	<CodeBlock samples={second} bind:active copy={false} data-testid="second" />
{:else}
	<output data-testid="expanded">{expanded}</output>
	<CodeBlock
		code={Array.from({ length: 12 }, (_, i) => `line ${i + 1}`).join("\n")}
		collapsedLines={4}
		bind:expanded
		copy={false}
	/>
{/if}
