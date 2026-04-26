<script lang="ts">
	import {
		Button,
		FieldInput,
		type IntentColorKey,
		type ButtonVariant,
		iconPlus,
		iconMinus,
		iconArrowRight,
		iconDownload,
		iconCheck,
		iconTrash,
		iconSettings,
		iconChevronUp,
		iconChevronDown,
		Spinner,
		SpinnerCircle,
		SpinnerUnicode,
	} from "$lib/index.js";

	let checked = $state(true);
	let isLoading = $state(false);

	function simulateLoading() {
		isLoading = true;
		setTimeout(() => (isLoading = false), 2000);
	}

	const intents: (IntentColorKey | undefined)[] = [
		undefined,
		"primary",
		"accent",
		"destructive",
		"warning",
		"success",
	];

	const variants: ButtonVariant[] = ["solid", "outline", "ghost", "soft", "link"];

	const sizes = ["sm", "md", "lg", "xl"];
</script>

<h2 class="text-xl font-semibold mb-4">Intent x Variant Matrix</h2>

<div class="space-y-4">
	{#each intents as intent}
		<div class="flex flex-wrap gap-4 items-center">
			<span class="w-24 text-sm text-neutral-500">{intent || "default"}</span>
			{#each variants as variant}
				<Button {intent} {variant}>{variant}</Button>
			{/each}
		</div>
	{/each}
</div>

<hr class="my-8" />

<div class="space-x-4 flex items-center">
	<Button x />

	<Button x roundedFull size="sm" />
	<Button x roundedFull variant="ghost" intent="primary" />
	<Button x variant="outline" intent="accent" size="sm" class="p-0! border-red-500!" />
	<Button x roundedFull size="lg" variant="ghost" />
	<Button roundedFull aspect1 size="sm">long content</Button>
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">Pure Rounded X (neutral overlay hover)</h2>
<p class="text-sm text-neutral-500 mb-4">
	The combination <code>x</code> + <code>variant="ghost"</code> + <code>roundedFull</code> auto-applies
	a neutral semi-transparent overlay on hover (instead of the intent-tinted ghost hover), so the
	dismiss-style X reads correctly on any background. Override globally via
	<code>--stuic-button-x-bg-hover</code> (light) and <code>:root.dark</code> (dark).
</p>

<div class="space-y-4">
	<div>
		<p class="text-sm text-neutral-500 mb-2">Different intents — all share the same neutral hover:</p>
		<div class="flex flex-wrap gap-3 items-center">
			<Button x variant="ghost" roundedFull />
			<Button x variant="ghost" roundedFull intent="primary" />
			<Button x variant="ghost" roundedFull intent="accent" />
			<Button x variant="ghost" roundedFull intent="destructive" />
			<Button x variant="ghost" roundedFull intent="success" />
		</div>
	</div>

	<div>
		<p class="text-sm text-neutral-500 mb-2">On colored surfaces (the motivating use case):</p>
		<div class="flex flex-wrap gap-3 items-center">
			<div
				class="flex items-center gap-3 px-4 py-3 rounded text-white"
				style="background: var(--stuic-color-primary);"
			>
				<span class="text-sm">Primary surface</span>
				<Button x variant="ghost" roundedFull size="sm" class="text-inherit" />
			</div>
			<div
				class="flex items-center gap-3 px-4 py-3 rounded text-white"
				style="background: var(--stuic-color-destructive);"
			>
				<span class="text-sm">Destructive surface</span>
				<Button x variant="ghost" roundedFull size="sm" class="text-inherit" />
			</div>
		</div>
	</div>

	<div>
		<p class="text-sm text-neutral-500 mb-2">
			Custom override via <code>--stuic-button-x-bg-hover</code>:
		</p>
		<div class="flex flex-wrap gap-3 items-center">
			<Button
				x
				variant="ghost"
				roundedFull
				style="--stuic-button-x-bg-hover: rgb(255 0 0 / 0.25);"
			/>
			<span class="text-sm text-neutral-500">red overlay on hover</span>
		</div>
	</div>
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">Sizes</h2>

<div class="flex flex-wrap gap-4 items-end">
	{#each sizes as size}
		<Button intent="primary" {size}>{size}</Button>
	{/each}
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">Muted</h2>

<div class="flex flex-wrap gap-4">
	<Button intent="primary">Normal</Button>
	<Button intent="primary" muted>Muted</Button>
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">Disabled</h2>

<div class="flex flex-wrap gap-4">
	<Button intent="primary" disabled>Disabled solid</Button>
	<Button intent="primary" variant="outline" disabled>Disabled outline</Button>
	<Button intent="destructive" variant="ghost" disabled>Disabled ghost</Button>
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">Theming Examples</h2>

<div class="space-y-4">
	<div>
		<p class="text-sm text-neutral-500 mb-2">Local CSS var override (inline style):</p>
		<Button
			intent="primary"
			style="--stuic-color-primary: hotpink; --stuic-color-primary-hover: deeppink; --stuic-color-primary-foreground: white;"
		>
			Custom Pink
		</Button>
	</div>

	<div>
		<p class="text-sm text-neutral-500 mb-2">Component token override:</p>
		<Button intent="accent" style="--stuic-button-radius: 9999px;">Pill Shape</Button>
	</div>

	<div>
		<p class="text-sm text-neutral-500 mb-2">Class prop override (Tailwind):</p>
		<Button intent="success" class="shadow-lg hover:shadow-xl">With Shadow</Button>
	</div>

	<div>
		<p class="text-sm text-neutral-500 mb-2">Unstyled (full custom):</p>
		<Button
			unstyled
			class="bg-linear-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium"
		>
			Gradient Button
		</Button>
	</div>
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">Button-Specific Structural Tokens</h2>
<p class="text-sm text-neutral-500 mb-4">
	Buttons have independent <code>--stuic-radius-button</code> and
	<code>--stuic-border-width-button</code> tokens, allowing them to differ from other elements.
</p>

<h3 class="text-lg font-medium mb-3">Radius</h3>
<div class="space-y-6">
	<div>
		<p class="text-sm text-neutral-500 mb-2">
			Default (both tokens use <code>--radius-md</code>):
		</p>
		<div class="flex flex-wrap gap-3 items-end">
			<Button intent="primary">Primary</Button>
			<Button variant="outline">Outline</Button>
			<Button intent="accent" variant="soft">Soft</Button>
			<FieldInput value="Input" class="w-40 mb-0" />
		</div>
	</div>

	<div style="--stuic-radius: 0; --stuic-radius-button: 0;">
		<p class="text-sm text-neutral-500 mb-2">
			Flat everything (<code>--stuic-radius: 0; --stuic-radius-button: 0</code>):
		</p>
		<div class="flex flex-wrap gap-3 items-end">
			<Button intent="primary">Primary</Button>
			<Button variant="outline">Outline</Button>
			<Button intent="accent" variant="soft">Soft</Button>
			<FieldInput value="Input" class="w-40 mb-0" />
		</div>
	</div>

	<div style="--stuic-radius: 0;">
		<p class="text-sm text-neutral-500 mb-2">
			Flat elements, rounded buttons (<code>--stuic-radius: 0</code>,
			<code>--stuic-radius-button</code> untouched):
		</p>
		<div class="flex flex-wrap gap-3 items-end">
			<Button intent="primary">Primary</Button>
			<Button variant="outline">Outline</Button>
			<Button intent="accent" variant="soft">Soft</Button>
			<FieldInput value="Input" class="w-40 mb-0" />
		</div>
	</div>

	<div style="--stuic-radius: 0; --stuic-radius-button: 9999px;">
		<p class="text-sm text-neutral-500 mb-2">
			Flat elements, pill buttons (<code
				>--stuic-radius: 0; --stuic-radius-button: 9999px</code
			>):
		</p>
		<div class="flex flex-wrap gap-3 items-end">
			<Button intent="primary">Primary</Button>
			<Button variant="outline">Outline</Button>
			<Button intent="accent" variant="soft">Soft</Button>
			<FieldInput value="Input" class="w-40 mb-0" />
		</div>
	</div>
</div>

<h3 class="text-lg font-medium mt-6 mb-3">Border Width</h3>
<div class="space-y-6">
	<div>
		<p class="text-sm text-neutral-500 mb-2">
			Default (<code>--stuic-border-width-button: 1px</code>):
		</p>
		<div class="flex flex-wrap gap-3 items-end">
			<Button intent="primary">Primary</Button>
			<Button variant="outline">Outline</Button>
			<Button intent="accent" variant="soft">Soft</Button>
			<FieldInput value="Input" class="w-40 mb-0" />
		</div>
	</div>

	<div style="--stuic-border-width-button: 0;">
		<p class="text-sm text-neutral-500 mb-2">
			Borderless buttons (<code>--stuic-border-width-button: 0</code>):
		</p>
		<div class="flex flex-wrap gap-3 items-end">
			<Button intent="primary">Primary</Button>
			<Button variant="outline">Outline</Button>
			<Button intent="accent" variant="soft">Soft</Button>
			<FieldInput value="Input" class="w-40 mb-0" />
		</div>
	</div>

	<div style="--stuic-border-width-button: 2px;">
		<p class="text-sm text-neutral-500 mb-2">
			Thick button borders (<code>--stuic-border-width-button: 2px</code>):
		</p>
		<div class="flex flex-wrap gap-3 items-end">
			<Button intent="primary">Primary</Button>
			<Button variant="outline">Outline</Button>
			<Button intent="accent" variant="soft">Soft</Button>
			<FieldInput value="Input" class="w-40 mb-0" />
		</div>
	</div>
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">3D Push Effect (raised prop)</h2>

<div class="flex flex-wrap gap-4">
	<Button intent="primary" raised>Push Me</Button>
	<Button intent="accent" raised>3D Button</Button>
	<Button intent="destructive" raised>Delete</Button>
	<Button variant="outline" raised>Outline 3D</Button>
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">As Link</h2>

<div class="flex flex-wrap gap-4">
	<Button intent="primary" href="#link">Link (solid)</Button>
	<Button intent="accent" variant="outline" href="#link">Link (outline)</Button>
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">With Icons</h2>

<div class="space-y-4">
	<div>
		<p class="text-sm text-neutral-500 mb-2">Icon + Text:</p>
		<div class="flex flex-wrap gap-3">
			<Button intent="primary">{@html iconPlus()} Add Item</Button>
			<Button intent="success">{@html iconCheck()} Save</Button>
			<Button intent="destructive" variant="outline">{@html iconTrash()} Delete</Button>
			<Button variant="ghost">{@html iconSettings()} Settings</Button>
		</div>
	</div>

	<div>
		<p class="text-sm text-neutral-500 mb-2">Text + Icon:</p>
		<div class="flex flex-wrap gap-3">
			<Button intent="primary">Continue {@html iconArrowRight()}</Button>
			<Button intent="accent" variant="outline">Download {@html iconDownload()}</Button>
		</div>
	</div>

	<div>
		<p class="text-sm text-neutral-500 mb-2">Icon Only (square):</p>
		<div class="flex flex-wrap gap-3 items-end">
			<Button intent="primary" size="sm" iconButton>{@html iconPlus()}</Button>
			<Button intent="primary" size="md" iconButton>{@html iconPlus()}</Button>
			<Button intent="primary" size="lg" iconButton>{@html iconPlus()}</Button>
			<Button variant="outline" iconButton>{@html iconSettings()}</Button>
			<Button variant="ghost" iconButton>{@html iconTrash()}</Button>
			<Button intent="destructive" variant="soft" iconButton>{@html iconTrash()}</Button>
		</div>
	</div>

	<div>
		<p class="text-sm text-neutral-500 mb-2">Icon Only (circular):</p>
		<div class="flex flex-wrap gap-3 items-end">
			<Button intent="primary" size="sm" iconButton roundedFull>{@html iconPlus()}</Button>
			<Button intent="accent" size="md" iconButton roundedFull>{@html iconPlus()}</Button>
			<Button intent="success" size="lg" iconButton roundedFull>{@html iconCheck()}</Button>
			<Button variant="outline" iconButton roundedFull>{@html iconSettings()}</Button>
			<Button variant="ghost" iconButton roundedFull>{@html iconDownload()}</Button>
		</div>
	</div>
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">Role Switch (Toggle)</h2>

<div class="space-y-4">
	<Button roleSwitch bind:checked>
		Switch: {checked ? "on" : "off"}
	</Button>
	<div class="text-sm text-neutral-500">
		checked: {checked}
	</div>
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">Icon Swap</h2>

<div class="flex flex-wrap gap-4 items-center">
	<Button
		iconSwap={[iconPlus(), iconMinus()]}
		roleSwitch
		bind:checked
		roundedFull
		variant="outline"
		intent="primary"
	/>
	<Button
		iconSwap={[iconChevronDown(), iconChevronUp()]}
		roleSwitch
		bind:checked
		iconButton
		variant="ghost"
	/>
	<span class="text-sm text-neutral-500">checked: {checked}</span>
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">Spinner</h2>

<div class="space-y-4">
	<div>
		<p class="text-sm text-neutral-500 mb-2">Default spinner (SpinnerCircle):</p>
		<div class="flex flex-wrap gap-3">
			<Button
				intent="primary"
				spinner={isLoading}
				onclick={simulateLoading}
				class="min-w-40"
			>
				{isLoading ? "Saving..." : "Save"}
			</Button>
			<Button
				intent="accent"
				variant="outline"
				spinner={isLoading}
				onclick={simulateLoading}
				spinnerOnly
			>
				{isLoading ? "Loading..." : "Load"}
			</Button>
		</div>
	</div>
</div>
