<script lang="ts">
	import { ColorScheme, ColorSchemeSwitcher } from "#lib/index.js";

	let customKey = $state("demo:cs");
</script>

<div class="space-y-8">
	<section class="space-y-4">
		<h2 class="text-lg font-semibold">ColorSchemeSwitcher</h2>
		<p class="text-sm opacity-70">
			A <code>ButtonGroupRadio</code> wired to the runtime. The header above is one too, and
			all of these share one state: click any, the others follow (another tab follows as well).
		</p>

		<div class="flex flex-wrap items-center gap-6">
			<ColorSchemeSwitcher />
			<ColorSchemeSwitcher showLabels />
			<ColorSchemeSwitcher options={["light", "dark"]} />
			<ColorSchemeSwitcher size="sm" />
			<ColorSchemeSwitcher size="lg" />
		</div>

		<h3 class="font-semibold">Compact rounded-square toolbar look (group tokens only)</h3>
		<ColorSchemeSwitcher
			size="sm"
			style="
				--stuic-button-group-radius: 0.5rem;
				--stuic-button-group-button-min-height: 1.75rem;
				--stuic-button-group-button-padding-x: 0.5rem;
				--stuic-button-group-button-padding-y: 0.25rem;
			"
		/>

		<h3 class="font-semibold">Translated, with labels</h3>
		<ColorSchemeSwitcher
			showLabels
			labels={{ group: "Vzhľad", system: "Systém", light: "Svetlý", dark: "Tmavý" }}
		/>

		<dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
			<dt class="opacity-60">ColorScheme.preference</dt>
			<dd><code>{ColorScheme.preference}</code></dd>
			<dt class="opacity-60">ColorScheme.current</dt>
			<dd><code>{ColorScheme.current}</code></dd>
			<dt class="opacity-60">ColorScheme.KEY</dt>
			<dd><code>{ColorScheme.KEY}</code></dd>
		</dl>
	</section>

	<section
		class={[
			"p-4 space-y-4",
			"border",
			"bg-neutral-50 text-neutral-950 border-neutral-950/10",
			"dark:bg-neutral-900 dark:text-neutral-50 dark:border-neutral-50/20",
		]}
	>
		<h2 class="text-lg font-semibold">Runtime</h2>
		<div>
			Switch from the header or above. You can also
			<button class="underline" onclick={ColorScheme.reset}>reset</button>
			the stored preference.
		</div>

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
			<p class="text-sm opacity-60">
				After applying, switch from the header. The new key should appear in localStorage;
				the default <code>stuic-color-scheme</code> stays untouched. Open a second tab on
				<code>/</code>
				(default key) — its switches won't affect this tab. Note: the inline bootstrap script
				in
				<code>&lt;ColorSchemeSystemAware /&gt;</code> always reads the default key, so a
				hard refresh on this page will paint based on
				<code>stuic-color-scheme</code> until <code>configure</code> runs again. Apps that
				need FOUC-free custom-key hydration should ship their own bootstrap in
				<code>app.html</code>.
			</p>
		</div>

		<p class="text-sm opacity-60">
			Cross-tab sync: open <code>/</code> in two tabs and switch in one. Page colors and the
			active segment in the other should follow within a frame.
		</p>
	</section>
</div>
