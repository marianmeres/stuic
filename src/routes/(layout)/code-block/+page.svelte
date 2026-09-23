<script lang="ts">
	import {
		CodeBlock,
		Notifications,
		NotificationsStack,
		createCodeBlockT,
		CODE_BLOCK_MESSAGES_SK,
		highlightCode,
		type CodeBlockHighlighter,
		type CodeBlockSample,
		type CodeBlockToken,
	} from "$lib/index.js";

	const notifications = new NotificationsStack([], { disposeInterval: 1_000 });
	const tSk = createCodeBlockT(CODE_BLOCK_MESSAGES_SK);

	const curl = `curl -H "Authorization: Bearer $API_TOKEN" \\
  "https://api.example.com/v1/projects/my-wines/items?limit=10"`;

	const json = `{
  "items": [
    { "code": "a1b2c3", "name": { "en": "Riesling 2024", "sk": "Rizling 2024" }, "abv": 12.5, "public": true }
  ],
  "next_cursor": "eyJpZCI6MTIzNH0",
  "total": null
}`;

	const http = `HTTP/1.1 429 Too Many Requests
Content-Type: application/problem+json
Retry-After: 12

{
  "type": "https://example.com/errors/#rate_limited",
  "status": 429
}`;

	const denoJson = `{
  "tasks": { "dev": "deno run -A --watch main.ts" },
  "imports": { "@std/assert": "jsr:@std/assert@^1" }
}`;

	const prose = `This line is prose, not code: it keeps going well past the width of the box, which is exactly when soft wrapping reads better than a horizontal scrollbar.`;

	const shell = `$ npm i @marianmeres/stuic   # the library
$ export API_TOKEN=secret
$ npm run dev && open "http://localhost:8886/?token=$API_TOKEN"`;

	const script = `#!/usr/bin/env bash
set -euo pipefail

BASE=https://api.example.com/v1/projects/my-wines/items
for code in $(cat codes.txt); do
  curl -s -X PATCH "$BASE/$code" \\
    -H "Authorization: Bearer \${API_TOKEN}" \\
    --data '{"price": 12.9}' > /dev/null
done
echo "done: $?"`;

	const long = Array.from(
		{ length: 40 },
		(_, i) => `${String(i + 1).padStart(2, "0")}  log line`
	).join("\n");

	// the same request in three languages
	const create: CodeBlockSample[] = [
		{
			label: "curl",
			lang: "bash",
			code: `curl -X POST "https://api.example.com/v1/projects/my-wines/items" \\
  -H "Authorization: Bearer $API_TOKEN" \\
  -H "Content-Type: application/json" \\
  --data '{"code": "a1b2c3", "name": "Riesling 2024"}'`,
		},
		{
			label: "JavaScript",
			lang: "js",
			code: `const res = await fetch("https://api.example.com/v1/projects/my-wines/items", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${API_TOKEN}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ code: "a1b2c3", name: "Riesling 2024" }),
});`,
			highlightLines: "2-6",
		},
		{
			label: "Python",
			lang: "python",
			code: `import requests

res = requests.post(
    "https://api.example.com/v1/projects/my-wines/items",
    headers={"Authorization": f"Bearer {API_TOKEN}"},
    json={"code": "a1b2c3", "name": "Riesling 2024"},
)`,
		},
	];
	const read: CodeBlockSample[] = [
		{
			label: "curl",
			lang: "bash",
			code: `curl "https://api.example.com/v1/projects/my-wines/items/a1b2c3" \\
  -H "Authorization: Bearer $API_TOKEN"`,
		},
		{
			label: "JavaScript",
			lang: "js",
			code: `const res = await fetch("https://api.example.com/v1/projects/my-wines/items/a1b2c3", {
  headers: { Authorization: \`Bearer \${API_TOKEN}\` },
});`,
		},
		{
			label: "HTTPie",
			lang: "bash",
			code: `http GET https://api.example.com/v1/projects/my-wines/items/a1b2c3 \\
  "Authorization: Bearer $API_TOKEN"`,
		},
	];
	let language = $state<string>();

	// A custom highlighter: a toy JS/TS tokenizer composed with the built-in one
	const JS_TOKENS =
		/(\/\/[^\n]*)|(`(?:\\.|[^`])*`|"(?:\\.|[^"\n])*"|'(?:\\.|[^'\n])*')|\b(const|let|await|async|function|return|import|from|new)\b|\b(\d+(?:\.\d+)?)\b|\b(true|false|null|undefined)\b/g;
	const toyJs = (code: string): CodeBlockToken[] =>
		[...code.matchAll(JS_TOKENS)].map((m) => {
			const type = m[1]
				? "comment"
				: m[2]
					? "string"
					: m[3]
						? "keyword"
						: m[4]
							? "number"
							: "literal";
			return [m.index!, m.index! + m[0].length, type];
		});
	const highlight: CodeBlockHighlighter = (code, lang) =>
		lang === "js" || lang === "ts" ? toyJs(code) : highlightCode(code, lang);

	let width = $state(320);
</script>

<Notifications {notifications} />

<div class="space-y-16 py-8">
	<section>
		<h2 class="mb-2 text-xl font-semibold">Basic</h2>
		<p class="mb-4 text-sm text-neutral-500">
			JSON, HTTP and shell are highlighted out of the box — painted with the CSS Custom
			Highlight API, so the code stays plain text (select it, copy it). Other languages
			stay plain. The copy button copies exactly what is shown.
		</p>
		<div class="max-w-2xl space-y-6">
			<CodeBlock lang="bash" code={curl} />
			<CodeBlock lang="json" code={json} />
			<CodeBlock lang="http" code={http} />
			<CodeBlock lang="bash" title="bulk-update.sh" code={script} />
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<section>
		<h2 class="mb-2 text-xl font-semibold">Samples in several languages</h2>
		<p class="mb-4 text-sm text-neutral-500">
			<code>samples</code> puts the same thing in several languages behind tabs (arrow
			keys, Home, End). Both blocks share one <code>bind:active</code>, so picking a
			language in one switches the other. A block without the picked language ("HTTPie",
			"Python") stays on the one it showed. Selected: <code>{language ?? "(none)"}</code>.
			The JavaScript tab uses a custom highlighter (below) and marks lines 2–6.
		</p>
		<div class="max-w-2xl space-y-6">
			<CodeBlock
				title="Create an item"
				samples={create}
				bind:active={language}
				{highlight}
			/>
			<CodeBlock title="Read it back" samples={read} bind:active={language} {highlight} />
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<section>
		<h2 class="mb-2 text-xl font-semibold">Line numbers, highlighted lines</h2>
		<p class="mb-4 text-sm text-neutral-500">
			<code>lineNumbers</code> (never selected or copied), <code>lineNumbersStart</code>,
			and
			<code>highlightLines</code> as positions in the sample (<code>"5-8"</code>),
			whatever the numbering. A highlighted line keeps its band while scrolled sideways.
		</p>
		<div class="max-w-2xl space-y-6">
			<CodeBlock
				lang="bash"
				title="bulk-update.sh"
				code={script}
				lineNumbers
				highlightLines="5-8"
			/>
			<CodeBlock lang="json" code={json} lineNumbers lineNumbersStart={120} />
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<section>
		<h2 class="mb-2 text-xl font-semibold">Collapse long samples</h2>
		<p class="mb-4 text-sm text-neutral-500">
			<code>collapsedLines=&#123;8&#125;</code> shows eight lines and a toggle. Collapsing back
			scrolls the block into view if you had read past it.
		</p>
		<div class="max-w-2xl">
			<CodeBlock
				lang="log"
				title="server.log"
				code={long}
				collapsedLines={8}
				lineNumbers
			/>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<section>
		<h2 class="mb-2 text-xl font-semibold">Title instead of the language</h2>
		<p class="mb-4 text-sm text-neutral-500">
			<code>title</code> (a <code>THC</code>) replaces the label — typically a file name.
			<code>title=""</code> hides it; the copy button stays at the end.
		</p>
		<div class="max-w-2xl space-y-6">
			<CodeBlock lang="json" title="deno.json" code={denoJson} />
			<CodeBlock lang="json" title="" code={denoJson} />
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<section>
		<h2 class="mb-2 text-xl font-semibold">Scroll or wrap</h2>
		<p class="mb-4 text-sm text-neutral-500">
			Long lines scroll by default. An overflowing <code>&lt;pre&gt;</code> becomes a tab
			stop (so its overflow is reachable by keyboard) — measured, so a block that fits
			costs no tab stop. Tab through, then drag the width. <code>wrap</code> soft-wraps instead;
			with line numbers, a wrapped line stays in the code column.
		</p>
		<label class="mb-4 flex items-center gap-3 text-sm">
			Width
			<input type="range" min="200" max="900" bind:value={width} />
			<span class="tabular-nums">{width}px</span>
		</label>
		<div class="space-y-6" style="width: {width}px; max-width: 100%;">
			<CodeBlock lang="bash" code={curl} />
			<CodeBlock lang="text" code={prose} wrap lineNumbers />
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<section>
		<h2 class="mb-2 text-xl font-semibold">Max height</h2>
		<p class="mb-4 text-sm text-neutral-500">
			<code>--stuic-code-block-max-height</code> caps the box; the rest scrolls.
		</p>
		<div class="max-w-2xl">
			<CodeBlock
				lang="log"
				title="server.log"
				code={long}
				style="--stuic-code-block-max-height: 14rem;"
			/>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<section>
		<h2 class="mb-2 text-xl font-semibold">Written inline, rendered flush left</h2>
		<p class="mb-4 text-sm text-neutral-500">
			The blank lines at both ends and the indentation every line shares are dropped (from
			the copy too), so a sample can sit indented in the template. <code>verbatim</code> keeps
			it exactly as given.
		</p>
		<div class="max-w-2xl space-y-6">
			<CodeBlock
				lang="ts"
				{highlight}
				code={`
					import { CodeBlock } from "@marianmeres/stuic";

					const sample = "indented in the template";
				`}
			/>
			<CodeBlock
				lang="ts"
				title="verbatim"
				verbatim
				{highlight}
				code={`
					import { CodeBlock } from "@marianmeres/stuic";
				`}
			/>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<section>
		<h2 class="mb-2 text-xl font-semibold">The copy button</h2>
		<p class="mb-4 text-sm text-neutral-500">
			<code>copyButtonProps</code> reach the underlying <code>CopyButton</code>. Its
			<code>text</code> overrides what gets copied — here the shell prompts are shown but
			not copied. <code>t</code> localizes the whole block;
			<code>copy=&#123;false&#125;</code> drops the button (and the header, when there is no
			label either).
		</p>
		<div class="max-w-2xl space-y-6">
			<CodeBlock
				lang="shell"
				code={shell}
				copyButtonProps={{
					text: shell.replace(/^\$ /gm, ""),
					onCopied: (t) => notifications.success(`Copied without prompts:\n${t}`),
				}}
			/>
			<CodeBlock lang="bash" code={long} collapsedLines={3} t={tSk} />
			<CodeBlock lang="bash" code="echo 'no copy button'" copy={false} />
			<CodeBlock code="no label, no copy button — no header" copy={false} />
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<section>
		<h2 class="mb-2 text-xl font-semibold">Theming</h2>
		<p class="mb-4 text-sm text-neutral-500">
			A few tokens, scoped with <code>style</code>. The dark one also sets the syntax
			colors and rescopes the theme's <code>--stuic-color-*</code> so the copy button follows.
		</p>
		<div class="max-w-2xl space-y-6">
			<CodeBlock
				lang="json"
				code={json}
				style="--stuic-code-block-bg: var(--stuic-color-muted);
					--stuic-code-block-header-bg: transparent;
					--stuic-code-block-rule-width: 0px;"
			/>
			<CodeBlock
				lang="bash"
				code={curl}
				style="--stuic-code-block-bg: #1c1917;
					--stuic-code-block-text: #e7e5e4;
					--stuic-code-block-header-bg: #292524;
					--stuic-code-block-title-text: #d6d3d1;
					--stuic-code-block-border-color: #292524;
					--stuic-code-block-rule-color: #44403c;
					--stuic-code-block-token-string-text: #a5d6ff;
					--stuic-code-block-token-variable-text: #ffa657;
					--stuic-code-block-token-parameter-text: #79c0ff;
					--stuic-code-block-token-function-text: #d2a8ff;
					--stuic-color-foreground: #d6d3d1;
					--stuic-color-foreground-hover: #fafaf9;
					--stuic-color-muted-hover: #44403c;
					--stuic-color-muted-active: #57534e;"
			/>
		</div>
	</section>
</div>
