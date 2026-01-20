<script lang="ts">
	import {
		Button2,
		type IntentColorKey,
		type ButtonVariant,
		iconPlus,
		iconArrowRight,
		iconDownload,
		iconCheck,
		iconTrash,
		iconSettings,
	} from "$lib/index.js";

	let checked = $state(true);

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
				<Button2 {intent} {variant}>{variant}</Button2>
			{/each}
		</div>
	{/each}
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">Sizes</h2>

<div class="flex flex-wrap gap-4 items-end">
	{#each sizes as size}
		<Button2 intent="primary" {size}>{size}</Button2>
	{/each}
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">Muted</h2>

<div class="flex flex-wrap gap-4">
	<Button2 intent="primary">Normal</Button2>
	<Button2 intent="primary" muted>Muted</Button2>
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">Disabled</h2>

<div class="flex flex-wrap gap-4">
	<Button2 intent="primary" disabled>Disabled solid</Button2>
	<Button2 intent="primary" variant="outline" disabled>Disabled outline</Button2>
	<Button2 intent="destructive" variant="ghost" disabled>Disabled ghost</Button2>
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">Theming Examples</h2>

<div class="space-y-4">
	<div>
		<p class="text-sm text-neutral-500 mb-2">Local CSS var override (inline style):</p>
		<Button2
			intent="primary"
			style="--stuic-color-primary: hotpink; --stuic-color-primary-hover: deeppink; --stuic-color-primary-foreground: white;"
		>
			Custom Pink
		</Button2>
	</div>

	<div>
		<p class="text-sm text-neutral-500 mb-2">Component token override:</p>
		<Button2 intent="accent" style="--stuic-button2-radius: 9999px;">Pill Shape</Button2>
	</div>

	<div>
		<p class="text-sm text-neutral-500 mb-2">Class prop override (Tailwind):</p>
		<Button2 intent="success" class="shadow-lg hover:shadow-xl">With Shadow</Button2>
	</div>

	<div>
		<p class="text-sm text-neutral-500 mb-2">Unstyled (full custom):</p>
		<Button2
			unstyled
			class="bg-linear-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium"
		>
			Gradient Button
		</Button2>
	</div>
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">3D Push Effect (raised prop)</h2>

<div class="flex flex-wrap gap-4">
	<Button2 intent="primary" raised>Push Me</Button2>
	<Button2 intent="accent" raised>3D Button</Button2>
	<Button2 intent="destructive" raised>Delete</Button2>
	<Button2 variant="outline" raised>Outline 3D</Button2>
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">As Link</h2>

<div class="flex flex-wrap gap-4">
	<Button2 intent="primary" href="#link">Link (solid)</Button2>
	<Button2 intent="accent" variant="outline" href="#link">Link (outline)</Button2>
	<Button2 intent="info" variant="link" href="#link">Link (link variant)</Button2>
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">With Icons</h2>

<div class="space-y-4">
	<div>
		<p class="text-sm text-neutral-500 mb-2">Icon + Text:</p>
		<div class="flex flex-wrap gap-3">
			<Button2 intent="primary">{@html iconPlus()} Add Item</Button2>
			<Button2 intent="success">{@html iconCheck()} Save</Button2>
			<Button2 intent="destructive" variant="outline">{@html iconTrash()} Delete</Button2>
			<Button2 variant="ghost">{@html iconSettings()} Settings</Button2>
		</div>
	</div>

	<div>
		<p class="text-sm text-neutral-500 mb-2">Text + Icon:</p>
		<div class="flex flex-wrap gap-3">
			<Button2 intent="primary">Continue {@html iconArrowRight()}</Button2>
			<Button2 intent="accent" variant="outline">Download {@html iconDownload()}</Button2>
			<Button2 variant="link" intent="info">Learn more {@html iconArrowRight()}</Button2>
		</div>
	</div>

	<div>
		<p class="text-sm text-neutral-500 mb-2">Icon Only (square):</p>
		<div class="flex flex-wrap gap-3 items-end">
			<Button2 intent="primary" size="sm" class="aspect-square px-0!"
				>{@html iconPlus()}</Button2
			>
			<Button2 intent="primary" size="md" class="aspect-square px-0!"
				>{@html iconPlus()}</Button2
			>
			<Button2 intent="primary" size="lg" class="aspect-square px-0!"
				>{@html iconPlus()}</Button2
			>
			<Button2 variant="outline" class="aspect-square px-0!"
				>{@html iconSettings()}</Button2
			>
			<Button2 variant="ghost" class="aspect-square px-0!">{@html iconTrash()}</Button2>
			<Button2 intent="destructive" variant="soft" class="aspect-square px-0!"
				>{@html iconTrash()}</Button2
			>
		</div>
	</div>

	<div>
		<p class="text-sm text-neutral-500 mb-2">Icon Only (circular):</p>
		<div class="flex flex-wrap gap-3 items-end">
			<Button2 intent="primary" size="sm" class="aspect-square px-0! rounded-full!"
				>{@html iconPlus()}</Button2
			>
			<Button2 intent="accent" size="md" class="aspect-square px-0! rounded-full!"
				>{@html iconPlus()}</Button2
			>
			<Button2 intent="success" size="lg" class="aspect-square px-0! rounded-full!"
				>{@html iconCheck()}</Button2
			>
			<Button2 variant="outline" class="aspect-square px-0! rounded-full!"
				>{@html iconSettings()}</Button2
			>
			<Button2 variant="ghost" class="aspect-square px-0! rounded-full!"
				>{@html iconDownload()}</Button2
			>
		</div>
	</div>
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">Role Switch (Toggle)</h2>

<div class="space-y-4">
	<Button2 roleSwitch bind:checked>
		Switch: {checked ? "on" : "off"}
	</Button2>
	<div class="text-sm text-neutral-500">
		checked: {checked}
	</div>
</div>
