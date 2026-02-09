<script lang="ts">
	import {
		CheckoutProgress,
		type CheckoutStep,
	} from "$lib/index.js";
	import Button from "$lib/components/Button/Button.svelte";

	// --- Basic demo ---
	const defaultStepIds = ["review", "shipping", "confirm", "complete"];
	let currentStep = $state("review");

	// --- Navigation demo ---
	let navStep = $state("confirm");
	let lastNavigated = $state("");

	// --- Custom steps demo ---
	const customSteps: CheckoutStep[] = [
		{ id: "cart", label: "Cart" },
		{ id: "payment", label: "Payment" },
		{ id: "done", label: "Done" },
	];
	let customCurrent = $state("payment");

	// --- Non-navigable demo ---
	const stepsWithNonNavigable: CheckoutStep[] = [
		{ id: "review", label: "Review" },
		{ id: "shipping", label: "Shipping", navigable: false },
		{ id: "confirm", label: "Confirm" },
		{ id: "complete", label: "Complete" },
	];
	let nonNavStep = $state("complete");
</script>

<h1 class="text-2xl font-bold mb-8">CheckoutProgress</h1>

<!-- ============== BASIC USAGE ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Basic (default steps)</h2>
	<p class="text-sm opacity-60 mb-4">
		Default 4-step checkout flow. Use the buttons to cycle through steps.
	</p>

	<CheckoutProgress {currentStep} />

	<div class="flex gap-2 mt-4">
		{#each defaultStepIds as id}
			<Button
				size="sm"
				class="border px-2"
				variant={currentStep === id ? "solid" : "outline"}
				onclick={() => (currentStep = id)}
			>
				{id}
			</Button>
		{/each}
	</div>
</section>

<!-- ============== WITH NAVIGATION ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">With onNavigate</h2>
	<p class="text-sm opacity-60 mb-4">
		Past steps are rendered as clickable buttons. Click a past step to navigate to it.
	</p>

	<CheckoutProgress
		currentStep={navStep}
		onNavigate={(step) => {
			lastNavigated = step.id;
			navStep = step.id;
		}}
	/>

	<div class="flex gap-2 mt-4">
		{#each defaultStepIds as id}
			<Button
				size="sm"
				class="border px-2"
				variant={navStep === id ? "solid" : "outline"}
				onclick={() => (navStep = id)}
			>
				{id}
			</Button>
		{/each}
	</div>
	{#if lastNavigated}
		<p class="text-sm mt-2">
			Last navigated: <code class="font-mono">{lastNavigated}</code>
		</p>
	{/if}
</section>

<!-- ============== NON-NAVIGABLE STEP ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Non-navigable past step</h2>
	<p class="text-sm opacity-60 mb-4">
		"Shipping" has <code>navigable: false</code> — even with <code>onNavigate</code>,
		it renders as plain text.
	</p>

	<CheckoutProgress
		steps={stepsWithNonNavigable}
		currentStep={nonNavStep}
		onNavigate={(step) => (nonNavStep = step.id)}
	/>

	<div class="flex gap-2 mt-4">
		{#each stepsWithNonNavigable as { id }}
			<Button
				size="sm"
				class="border px-2"
				variant={nonNavStep === id ? "solid" : "outline"}
				onclick={() => (nonNavStep = id)}
			>
				{id}
			</Button>
		{/each}
	</div>
</section>

<!-- ============== CUSTOM STEPS ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Custom steps</h2>
	<p class="text-sm opacity-60 mb-4">
		A 3-step custom flow: Cart, Payment, Done.
	</p>

	<CheckoutProgress
		steps={customSteps}
		currentStep={customCurrent}
		onNavigate={(step) => (customCurrent = step.id)}
	/>

	<div class="flex gap-2 mt-4">
		{#each customSteps as { id }}
			<Button
				size="sm"
				class="border px-2"
				variant={customCurrent === id ? "solid" : "outline"}
				onclick={() => (customCurrent = id)}
			>
				{id}
			</Button>
		{/each}
	</div>
</section>

<!-- ============== CUSTOM SEPARATOR (string) ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Custom separator (string)</h2>
	<p class="text-sm opacity-60 mb-4">
		Using a pipe <code>|</code> as separator via string prop.
	</p>

	<CheckoutProgress currentStep="shipping" separator=" | " />
</section>

<!-- ============== CUSTOM SEPARATOR (snippet) ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Custom separator (snippet)</h2>
	<p class="text-sm opacity-60 mb-4">
		Using a snippet for full control over the separator.
	</p>

	<CheckoutProgress currentStep="confirm">
		{#snippet separator()}
			<span class="mx-1 text-xs opacity-40">/</span>
		{/snippet}
	</CheckoutProgress>
</section>

<!-- ============== CUSTOM STEP LABEL ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Custom stepLabel snippet</h2>
	<p class="text-sm opacity-60 mb-4">
		Rendering step numbers as badges with custom styling.
	</p>

	<CheckoutProgress currentStep="shipping">
		{#snippet stepLabel({ step, index, isCurrent, isPast, isFuture })}
			<span
				class="inline-flex items-center gap-1 text-sm"
				class:font-bold={isCurrent}
				class:opacity-40={isFuture}
				class:opacity-70={isPast}
			>
				<span
					class="inline-flex items-center justify-center size-5 rounded-full text-xs"
					class:bg-foreground={isCurrent}
					class:text-background={isCurrent}
					class:bg-muted={!isCurrent}
				>
					{index + 1}
				</span>
				{step.label}
			</span>
		{/snippet}
	</CheckoutProgress>
</section>

<!-- ============== UNSTYLED ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Unstyled</h2>
	<p class="text-sm opacity-60 mb-4">
		With <code>unstyled</code> prop — no default classes applied.
	</p>

	<CheckoutProgress currentStep="confirm" unstyled class="flex gap-4 text-sm" />
</section>

<!-- ============== EDGE CASE: INVALID STEP ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Edge case: invalid currentStep</h2>
	<p class="text-sm opacity-60 mb-4">
		When <code>currentStep</code> doesn't match any step ID, all steps render as "future".
	</p>

	<CheckoutProgress currentStep="nonexistent" />
</section>
