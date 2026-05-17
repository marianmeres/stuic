<script lang="ts">
	import { ColorScheme } from "$lib/index.js";

	let customKey = $state("demo:cs");
</script>

<div
	class={[
		"p-4 space-y-4",
		"border",
		"bg-neutral-50 text-neutral-950 border-neutral-950/10",
		"dark:bg-neutral-900 dark:text-neutral-50 dark:border-neutral-50/20",
	]}
>
	<div>
		Check header above. You can also
		<button class="underline" onclick={ColorScheme.reset}>reset</button>.
	</div>

	<dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
		<dt class="opacity-60">ColorScheme.current</dt>
		<dd><code>{ColorScheme.current}</code></dd>
		<dt class="opacity-60">ColorScheme.KEY</dt>
		<dd><code>{ColorScheme.KEY}</code></dd>
	</dl>

	<div class="space-y-2">
		<label class="block text-sm">
			Custom localStorage key
			<input
				bind:value={customKey}
				class={[
					"block mt-1 px-2 py-1 border rounded",
					"bg-white text-neutral-950 border-neutral-950/20",
					"dark:bg-neutral-800 dark:text-neutral-50 dark:border-neutral-50/20",
				]}
			/>
		</label>
		<button
			class="px-2 py-1 border rounded underline"
			onclick={() => ColorScheme.configure({ key: customKey })}
		>
			Apply key
		</button>
		<p class="text-xs opacity-60">
			After applying, toggle from the header. The new key should appear in
			localStorage; the default <code>stuic-color-scheme</code> stays untouched.
			Open a second tab on <code>/</code> (default key) — its toggles won't
			affect this tab.
		</p>
	</div>

	<p class="text-xs opacity-60">
		Cross-tab sync: open <code>/</code> in two tabs and toggle in one. Page
		colors in the other should follow within a frame.
	</p>
</div>
