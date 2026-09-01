<script lang="ts">
	import {
		CopyButton,
		Button,
		Notifications,
		NotificationsStack,
		copyToClipboard,
		createCopyButtonT,
		COPY_BUTTON_MESSAGES_SK,
		iconLink,
		sleep,
	} from "$lib/index.js";

	const notifications = new NotificationsStack([], { disposeInterval: 1_000 });

	const apiKey = "sk-live-4f2a9c1e7b3d8e5a6c0f1b2d3e4f5a6b";
	const shareUrl = "https://example.com/share/abc123";

	let log = $state<string[]>([]);
	const push = (s: string) => (log = [`${new Date().toLocaleTimeString()} ${s}`, ...log]);

	let programmaticState = $state<"idle" | "ok" | "fail">("idle");
	async function copyProgrammatically() {
		try {
			await copyToClipboard(shareUrl);
			programmaticState = "ok";
			notifications.success("Copied programmatically");
		} catch (e) {
			programmaticState = "fail";
			notifications.error(`Copy failed: ${e}`);
		}
	}

	const tSk = createCopyButtonT(COPY_BUTTON_MESSAGES_SK);
</script>

<div class="space-y-16 py-8">
	<!-- Basic -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Icon-only (default)</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Ghost, small, square. The accessible name follows the state (Copy → Copied). Click
			and paste somewhere.
		</p>
		<div
			class="inline-flex items-center gap-1 rounded-md border border-neutral-300 dark:border-neutral-700 pl-3 pr-1 py-1 font-mono text-sm"
		>
			<span>{apiKey}</span>
			<CopyButton text={apiKey} onCopied={() => push("copied api key")} />
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Tooltip -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Tooltip</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Icon-only buttons get a state-aware tooltip out of the box ("Copy" → "Copied",
			updated live while showing). Hover, then click. A <code>label</code> turns it off
			unless
			<code>tooltip</code> is set.
		</p>
		<div class="flex flex-wrap items-center gap-3">
			<CopyButton text={apiKey} variant="outline" />
			<CopyButton text={apiKey} variant="outline" tooltip="Copy API key" />
			<CopyButton
				text={apiKey}
				variant="outline"
				tooltip={() => ({ position: "bottom", class: "font-mono" })}
			/>
			<CopyButton text={shareUrl} label="Copy link" variant="outline" tooltip />
			<CopyButton text={apiKey} variant="outline" tooltip={false} />
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Notify -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Notify when copied</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>onCopied</code> / <code>onError</code> wired into a
			<code>NotificationsStack</code>. (The button also announces the outcome to screen
			readers on its own.)
		</p>
		<div class="flex flex-wrap items-center gap-3">
			<CopyButton
				text={shareUrl}
				label="Copy link"
				variant="outline"
				size="md"
				onCopied={(t) => notifications.success(`Copied: ${t}`)}
				onError={(e) => notifications.error(`Copy failed: ${e}`)}
			/>
			<CopyButton
				text={shareUrl}
				label
				intent="primary"
				variant="solid"
				size="md"
				onCopied={() => notifications.success("Link copied to clipboard")}
			/>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Labels + variants -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Labels, variants, sizes</h2>
		<p class="text-sm text-neutral-500 mb-4">
			It IS a <code>Button</code> — every intent/variant/size applies. Labels default to "Copy"
			→ "Copied" and can be overridden.
		</p>
		<div class="flex flex-wrap items-center gap-3">
			<CopyButton text={shareUrl} label />
			<CopyButton
				text={shareUrl}
				label="Copy link"
				labelCopied="Link copied!"
				variant="soft"
			/>
			<CopyButton text={shareUrl} label="Copy" variant="outline" intent="primary" />
			<CopyButton text={shareUrl} label="Copy" variant="solid" size="md" />
			<CopyButton text={shareUrl} label="Copy" variant="link" />
			<CopyButton text={shareUrl} label="Copy" icon={false} variant="outline" />
			<CopyButton text={shareUrl} size="md" intent="accent" variant="soft" />
			<CopyButton text={shareUrl} size="lg" variant="outline" />
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Feedback tuning -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Feedback tuning</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>intentCopied={"{false}"}</code> keeps the base intent;
			<code>feedbackDuration={"{0}"}</code> stays "copied" until the next click; custom icon.
		</p>
		<div class="flex flex-wrap items-center gap-3">
			<CopyButton
				text={shareUrl}
				label="Keeps primary"
				intent="primary"
				variant="solid"
				intentCopied={false}
			/>
			<CopyButton text={shareUrl} label="Sticky" variant="outline" feedbackDuration={0} />
			<CopyButton
				text={shareUrl}
				label="Quick"
				variant="outline"
				feedbackDuration={500}
			/>
			<CopyButton
				text={shareUrl}
				label="Copy link"
				labelCopied="Copied!"
				icon={iconLink({ size: 18 })}
				variant="outline"
			/>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Async getter -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Lazy / async text</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>text</code> as a getter — resolved on click. The second one simulates a 600ms fetch.
		</p>
		<div class="flex flex-wrap items-center gap-3">
			<CopyButton
				text={() => JSON.stringify({ apiKey, shareUrl, at: Date.now() }, null, 2)}
				label="Copy JSON"
				variant="outline"
				onCopied={(t) => push(`copied ${t.length} chars of JSON`)}
			/>
			<CopyButton
				text={async () => {
					await sleep(600);
					return `${shareUrl}?token=${Math.random().toString(36).slice(2)}`;
				}}
				label="Copy fresh share link"
				variant="outline"
				onCopied={(t) => push(`copied ${t}`)}
			/>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Error -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Error feedback</h2>
		<p class="text-sm text-neutral-500 mb-4">
			A getter that throws (or a denied clipboard) puts the button into the error state:
			destructive intent, × icon, "Copy failed", and <code>onError</code>.
		</p>
		<div class="flex flex-wrap items-center gap-3">
			<CopyButton
				text={() => {
					throw new Error("Nothing to copy");
				}}
				label="Copy (will fail)"
				variant="outline"
				onError={(e) => notifications.error(`${e}`)}
			/>
			<CopyButton
				text={() => {
					throw new Error("Nothing to copy");
				}}
				onError={(e) => push(`error: ${e}`)}
			/>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Custom content -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Custom content (children)</h2>
		<p class="text-sm text-neutral-500 mb-4">
			The <code>children</code> snippet replaces icon + label and receives the state.
		</p>
		<CopyButton text={shareUrl} variant="soft" size="md">
			{#snippet children({ state, copied })}
				{#if copied}
					🎉 Got it
				{:else if state === "error"}
					😬 Nope
				{:else}
					Grab the link
				{/if}
			{/snippet}
		</CopyButton>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Programmatic -->
	<section>
		<h2 class="text-xl font-semibold mb-2">
			Programmatic: <code>copyToClipboard()</code>
		</h2>
		<p class="text-sm text-neutral-500 mb-4">
			The same write the button does, from any handler. Async Clipboard API with an
			<code>execCommand("copy")</code> fallback; rejects only when both fail.
		</p>
		<div class="flex flex-wrap items-center gap-3">
			<Button onclick={copyProgrammatically}>Copy share url via copyToClipboard()</Button>
			<span class="text-sm text-neutral-500">
				{#if programmaticState === "ok"}✓ copied{:else if programmaticState === "fail"}✗
					failed{/if}
			</span>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- i18n -->
	<section>
		<h2 class="text-xl font-semibold mb-2">i18n (bundled SK)</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>t</code> from <code>createCopyButtonT(COPY_BUTTON_MESSAGES_SK)</code>.
		</p>
		<div class="flex flex-wrap items-center gap-3">
			<CopyButton text={shareUrl} t={tSk} />
			<CopyButton text={shareUrl} label t={tSk} variant="outline" />
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Log -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Callback log</h2>
		{#if log.length}
			<ul class="text-xs font-mono space-y-1">
				{#each log as line}
					<li>{line}</li>
				{/each}
			</ul>
		{:else}
			<p class="text-sm text-neutral-500">Nothing yet.</p>
		{/if}
	</section>
</div>

<Notifications {notifications} />
