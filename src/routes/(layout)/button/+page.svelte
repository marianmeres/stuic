<script lang="ts">
	import {
		Button,
		type IntentColorKey,
		type ButtonVariant,
		iconPlus,
		iconArrowRight,
		iconDownload,
		iconCheck,
		iconTrash,
		iconSettings,
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
		"info",
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
	<Button intent="info" variant="link" href="#link">Link (link variant)</Button>
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
			<Button variant="link" intent="info">Learn more {@html iconArrowRight()}</Button>
		</div>
	</div>

	<div>
		<p class="text-sm text-neutral-500 mb-2">Icon Only (square):</p>
		<div class="flex flex-wrap gap-3 items-end">
			<Button intent="primary" size="sm" class="aspect-square px-0!"
				>{@html iconPlus()}</Button
			>
			<Button intent="primary" size="md" class="aspect-square px-0!"
				>{@html iconPlus()}</Button
			>
			<Button intent="primary" size="lg" class="aspect-square px-0!"
				>{@html iconPlus()}</Button
			>
			<Button variant="outline" class="aspect-square px-0!">{@html iconSettings()}</Button
			>
			<Button variant="ghost" class="aspect-square px-0!">{@html iconTrash()}</Button>
			<Button intent="destructive" variant="soft" class="aspect-square px-0!"
				>{@html iconTrash()}</Button
			>
		</div>
	</div>

	<div>
		<p class="text-sm text-neutral-500 mb-2">Icon Only (circular):</p>
		<div class="flex flex-wrap gap-3 items-end">
			<Button intent="primary" size="sm" class="aspect-square px-0! rounded-full!"
				>{@html iconPlus()}</Button
			>
			<Button intent="accent" size="md" class="aspect-square px-0! rounded-full!"
				>{@html iconPlus()}</Button
			>
			<Button intent="success" size="lg" class="aspect-square px-0! rounded-full!"
				>{@html iconCheck()}</Button
			>
			<Button variant="outline" class="aspect-square px-0! rounded-full!"
				>{@html iconSettings()}</Button
			>
			<Button variant="ghost" class="aspect-square px-0! rounded-full!"
				>{@html iconDownload()}</Button
			>
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
