<script lang="ts">
	import {
		ColorPicker,
		Button,
		COLOR_PICKER_PALETTE_THEME,
		createColorPickerT,
		COLOR_PICKER_MESSAGES_SK,
		type ValidationResult,
	} from "$lib/index.js";

	let basic = $state("#3b82f6");
	let grid = $state("#ef4444");
	let theme = $state("var(--stuic-color-primary)");
	let paletteOnly = $state("#22c55e");
	let textOnly = $state("rebeccapurple");

	// form demo
	let formValue = $state("");
	let formPicker: ColorPicker | undefined = $state();
	let validation: ValidationResult | undefined = $state();
	let submitted: string | null = $state(null);

	function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		const res = formPicker?.validate();
		if (!res?.valid) {
			submitted = null;
			return;
		}
		const fd = new FormData(e.currentTarget as HTMLFormElement);
		submitted = JSON.stringify(Object.fromEntries(fd.entries()));
	}
</script>

{#snippet preview(color: string)}
	<div class="flex items-center gap-3">
		<div
			class="size-10 rounded border border-neutral-300 dark:border-neutral-600"
			style="background: {color};"
		></div>
		<code class="text-sm text-neutral-500">{color || '""'}</code>
	</div>
{/snippet}

<div class="space-y-16 py-8">
	<!-- Basic -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Basic</h2>
		<p class="text-sm text-neutral-500 mb-4">
			The bundled default palette, the native picker and the hex field. Keyboard: arrows
			(wrapping), Home/End, Delete/Backspace to clear. Try dragging inside the OS picker —
			the preview follows live, but <code>onchange</code> only fires on commit.
		</p>
		<div class="flex flex-wrap items-start gap-8">
			<ColorPicker bind:value={basic} />
			{@render preview(basic)}
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Grid -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Capped rows, no clear</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>{"columns={5}"}</code> caps the row at 5 swatches — narrow the window and it
			wraps to fewer rather than overflowing. ArrowUp / ArrowDown step by whatever row is
			actually rendered. <code>{"allowClear={false}"}</code> drops the crossed-out swatch (and
			makes Delete a no-op).
		</p>
		<div class="flex flex-wrap items-start gap-8">
			<ColorPicker bind:value={grid} columns={5} allowClear={false} />
			{@render preview(grid)}
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Theme tokens -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Theme-token palette</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>COLOR_PICKER_PALETTE_THEME</code> — the stored value is the
			<code>var(--stuic-color-*)</code> reference itself, so the picked color keeps following
			the theme. Switch themes and watch both the swatches and the preview move. (The native
			picker cannot show a token, so it sits at black.)
		</p>
		<div class="flex flex-wrap items-start gap-8">
			<ColorPicker bind:value={theme} palette={COLOR_PICKER_PALETTE_THEME} />
			{@render preview(theme)}
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- custom variants -->
	<section>
		<h2 class="text-xl font-semibold mb-2">The <code>custom</code> row</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>"both"</code> (default), <code>"native"</code>, <code>"text"</code> or
			<code>false</code>.
		</p>
		<div class="space-y-6">
			<div class="flex flex-wrap items-start gap-8">
				<ColorPicker
					bind:value={paletteOnly}
					custom={false}
					palette={["#ef4444", "#f97316", "#22c55e", "#3b82f6", "#a855f7"]}
				/>
				<span class="text-sm text-neutral-500"
					><code>{"custom={false}"}</code> — palette only</span
				>
			</div>
			<div class="flex flex-wrap items-start gap-8">
				<ColorPicker bind:value={textOnly} custom="text" palette={[]} />
				<span class="text-sm text-neutral-500">
					<code>custom="text"</code> with <code>palette={"{[]}"}</code> — a bare hex field.
					It takes any CSS color the browser understands, not just hex.
				</span>
			</div>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- named swatches -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Named swatches</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>{"{ value, label }"}</code> entries — the label becomes the swatch's
			accessible name and its <code>title</code> (hover one). Any CSS color works as a
			value, including <code>transparent</code> and gradients-by-token.
		</p>
		<ColorPicker
			value="#0ea5e9"
			palette={[
				{ value: "#0ea5e9", label: "Brand sky" },
				{ value: "#0f172a", label: "Brand ink" },
				{ value: "oklch(62.8% 0.258 29.2)", label: "Alert" },
				{ value: "transparent", label: "See-through" },
			]}
			custom={false}
		/>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Form -->
	<section>
		<h2 class="text-xl font-semibold mb-2">In a form (required + validate)</h2>
		<p class="text-sm text-neutral-500 mb-4">
			A hidden input carries <code>name</code>/value; <code>required</code> is enforced by the
			built-in validator (hidden inputs skip native constraint validation). Submit with nothing
			picked to see it.
		</p>
		<form {onsubmit} class="space-y-4">
			<div class="space-y-2">
				<ColorPicker
					bind:this={formPicker}
					bind:value={formValue}
					name="brand_color"
					required
					label="Brand color"
					setValidationResult={(r) => (validation = r)}
				/>
				{#if validation && !validation.valid}
					<span class="text-sm text-red-600">{validation.message}</span>
				{/if}
			</div>
			<div class="flex items-center gap-3">
				<Button size="sm" type="submit">Submit</Button>
				{#if submitted}
					<code class="text-sm">{submitted}</code>
				{/if}
			</div>
		</form>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Disabled -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Disabled</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Reduced opacity, no clicks, no keyboard; the hidden input is disabled (nothing
			submits).
		</p>
		<ColorPicker value="#f59e0b" disabled columns={8} />
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- i18n -->
	<section>
		<h2 class="text-xl font-semibold mb-2">i18n (Slovak)</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Localizes the group label, the swatch names, "no color", the custom-color labels and
			the required message. Hover a swatch — the <code>title</code> is the translated name.
		</p>
		<ColorPicker value="#ef4444" t={createColorPickerT(COLOR_PICKER_MESSAGES_SK)} />
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- CSS vars -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Custom Styling via CSS Variables</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Bigger circular swatches, a primary-colored selection ring, a wider hex field.
		</p>
		<div
			style="
				--stuic-color-picker-swatch-size: 2.25rem;
				--stuic-color-picker-swatch-radius: 9999px;
				--stuic-color-picker-swatch-ring-color: var(--stuic-color-primary);
				--stuic-color-picker-swatch-ring-width: 3px;
				--stuic-color-picker-gap: 0.5rem;
				--stuic-color-picker-text-width: 14ch;
			"
		>
			<ColorPicker value="#8b5cf6" />
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Unstyled -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Unstyled</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Structure only — roles, labels, <code>data-index</code> and the per-swatch
			<code>--stuic-color-picker-swatch-color</code> survive; the styling hooks (<code
				>data-selected</code
			>, <code>data-clear</code>) do not, so select with
			<code>aria-checked:</code>. Classes are yours.
		</p>
		<ColorPicker
			unstyled
			value="#22c55e"
			custom={false}
			class="block"
			classSwatch="size-8 rounded-full bg-(--stuic-color-picker-swatch-color) ring-offset-2 ring-neutral-900 dark:ring-neutral-100 aria-checked:ring-2 mr-2"
		/>
	</section>
</div>
