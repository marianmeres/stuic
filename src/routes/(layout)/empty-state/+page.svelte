<script lang="ts">
	import EmptyState from "$lib/components/EmptyState/EmptyState.svelte";
	import Button from "$lib/components/Button/Button.svelte";
	import { iconSearch, iconFile, iconPlus, iconInbox } from "$lib/icons/index.js";
</script>

<h2 class="text-xl font-bold mb-4">EmptyState</h2>

<h3 class="font-semibold mb-2">Basic (icon + title + description + CTA)</h3>
<div class="mb-8">
	<EmptyState
		icon={{ html: iconInbox() }}
		title="No projects yet"
		description="Create your first project to get started. It only takes a minute."
	>
		{#snippet actions()}
			<Button intent="primary">{@html iconPlus({ size: 18 })} New project</Button>
			<Button variant="ghost">Learn more</Button>
		{/snippet}
	</EmptyState>
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Variants</h3>
<div class="space-y-4 mb-8">
	<div>
		<p class="text-sm text-neutral-500 mb-2">plain (default):</p>
		<EmptyState
			title="No results found"
			description="Try adjusting your search or filters."
		/>
	</div>
	<div>
		<p class="text-sm text-neutral-500 mb-2">outline:</p>
		<EmptyState
			variant="outline"
			title="No results found"
			description="Try adjusting your search or filters."
		/>
	</div>
	<div>
		<p class="text-sm text-neutral-500 mb-2">dashed:</p>
		<EmptyState
			variant="dashed"
			title="No results found"
			description="Try adjusting your search or filters."
		/>
	</div>
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Sizes</h3>
<div class="space-y-4 mb-8">
	<div>
		<p class="text-sm text-neutral-500 mb-2">sm:</p>
		<EmptyState
			size="sm"
			variant="outline"
			icon={{ html: iconSearch() }}
			title="No comments"
			description="Be the first to comment."
		/>
	</div>
	<div>
		<p class="text-sm text-neutral-500 mb-2">md (default):</p>
		<EmptyState
			size="md"
			variant="outline"
			icon={{ html: iconSearch() }}
			title="No comments"
			description="Be the first to comment."
		/>
	</div>
	<div>
		<p class="text-sm text-neutral-500 mb-2">lg:</p>
		<EmptyState
			size="lg"
			variant="outline"
			icon={{ html: iconSearch() }}
			title="No comments"
			description="Be the first to comment."
		/>
	</div>
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Search results (role="status")</h3>
<div class="mb-8">
	<EmptyState
		role="status"
		icon={{ html: iconSearch() }}
		title={`No results for "flux capacitor"`}
		description="Check the spelling or try a broader term."
	>
		{#snippet actions()}
			<Button variant="outline" size="sm">Clear search</Button>
		{/snippet}
	</EmptyState>
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Empty table placeholder (dashed)</h3>
<div class="mb-8">
	<EmptyState
		variant="dashed"
		icon={{ html: iconFile() }}
		title="No documents"
		description="Documents you upload will show up here."
	>
		{#snippet actions()}
			<Button intent="primary" size="sm">Upload</Button>
		{/snippet}
	</EmptyState>
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Token overrides</h3>
<div class="mb-8">
	<EmptyState
		variant="outline"
		icon={{ html: iconInbox() }}
		title="Bigger icon, tighter box"
		description="Via inline --stuic-empty-state-* token overrides."
		style="--stuic-empty-state-icon-size-md: 4rem; --stuic-empty-state-padding-md: 1.5rem; --stuic-empty-state-radius: 0;"
	/>
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Custom body (children override)</h3>
<div class="mb-8">
	<EmptyState variant="dashed">
		<div class="text-4xl">🤷</div>
		<p class="text-sm opacity-70">Absolutely nothing to see here.</p>
	</EmptyState>
</div>
