<script lang="ts">
	import {
		Stepper,
		Button,
		createStepperT,
		STEPPER_MESSAGES_SK,
		iconUser,
		type StepperStep,
	} from "$lib/index.js";

	const STEPS = ["Account", "Payment", "Confirm", "Done"];

	// interactive flow demo — current may reach STEPS.length ("all done")
	let current = $state(1);

	let clickableCurrent = $state(2);
	let clickableAllCurrent = $state(1);

	const RICH_STEPS: StepperStep[] = [
		{ label: "Account", description: "Your credentials" },
		{ label: "Payment", description: "Card details" },
		{ label: "Confirm", description: "Review the order" },
	];
</script>

<div class="space-y-16 py-8">
	<!-- Basic flow -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Basic Flow</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>current</code> is a zero-based index (the <code>@marianmeres/wizard</code>
			<code>step.index</code>); passing <code>steps.length</code> marks everything completed.
		</p>
		<Stepper steps={STEPS} {current} />
		<div class="flex gap-2 mt-6">
			<Button
				size="sm"
				variant="outline"
				disabled={current <= 0}
				onclick={() => current--}
			>
				&lsaquo; Back
			</Button>
			<Button size="sm" disabled={current >= STEPS.length} onclick={() => current++}>
				{current === STEPS.length - 1 ? "Finish" : "Next"} &rsaquo;
			</Button>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Clickable -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Clickable</h2>
		<p class="text-sm text-neutral-500 mb-4">
			With <code>onSelect</code>, steps render as buttons. Default policy
			<code>clickable="completed"</code>: only completed steps (go back and revisit).
		</p>
		<Stepper
			steps={STEPS}
			current={clickableCurrent}
			onSelect={(i) => (clickableCurrent = i)}
		/>
		<p class="text-sm text-neutral-500 my-4">
			<code>clickable="all"</code>: any non-disabled step (here "Confirm" is
			<code>disabled</code>).
		</p>
		<Stepper
			steps={["Account", "Payment", { label: "Confirm", disabled: true }, "Done"]}
			current={clickableAllCurrent}
			clickable="all"
			onSelect={(i) => (clickableAllCurrent = i)}
		/>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Descriptions -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Descriptions</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Each step accepts an optional <code>description</code> line (both are
			<code>THC</code> — text, html, or component).
		</p>
		<Stepper steps={RICH_STEPS} current={1} />
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Error -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Error State</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>error: true</code> marks a step failed — destructive coloring + "×", winning over
			the completed check.
		</p>
		<Stepper
			current={2}
			steps={[
				{ label: "Account", description: "Your credentials" },
				{ label: "Payment", description: "Card declined", error: true },
				{ label: "Confirm", description: "Review the order" },
			]}
		/>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Labels below -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Labels Below (Checkout Header)</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>labelPosition="below"</code> centers the labels under the indicators.
		</p>
		<Stepper steps={STEPS} current={2} labelPosition="below" />
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Vertical -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Vertical</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>orientation="vertical"</code> — the connector runs down the indicator rail.
		</p>
		<Stepper steps={RICH_STEPS} current={1} orientation="vertical" />
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Custom icons -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Custom Icons + Indicator Override</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Per-step <code>icon</code> (raw svg string, e.g. an icons-fns result) replaces the
			number — completed/error markers still win; the <code>renderIndicator</code> snippet overrides
			the bubble content entirely (second example).
		</p>
		<Stepper
			class="mb-8"
			steps={["Account", { label: "Profile", icon: iconUser() }, "Done"]}
			current={1}
		/>
		<Stepper steps={STEPS} current={2}>
			{#snippet renderIndicator({ index, state })}
				{state === "completed" ? "★" : index + 1}
			{/snippet}
		</Stepper>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- i18n -->
	<section>
		<h2 class="text-xl font-semibold mb-2">i18n (Slovak)</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Localizes the <code>nav</code> landmark label and the screen-reader-only step announcements
			(inspect the DOM — visible labels are yours).
		</p>
		<Stepper
			steps={["Účet", "Platba", "Potvrdenie"]}
			current={1}
			t={createStepperT(STEPPER_MESSAGES_SK)}
		/>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Custom styling -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Custom Styling via CSS Variables</h2>
		<p class="text-sm text-neutral-500 mb-4">Customized using CSS custom properties.</p>
		<div
			style="
				--stuic-stepper-indicator-size: 2.75rem;
				--stuic-stepper-indicator-radius: var(--radius-md);
				--stuic-stepper-indicator-border-width: 1px;
				--stuic-stepper-connector-thickness: 4px;
				--stuic-stepper-connector-bg-completed: var(--stuic-color-success);
				--stuic-stepper-indicator-bg-completed: var(--stuic-color-success);
				--stuic-stepper-indicator-border-completed: var(--stuic-color-success);
			"
		>
			<Stepper steps={STEPS} current={2} />
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Disabled -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Disabled</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Whole-component <code>disabled</code> — reduced opacity, no interaction.
		</p>
		<Stepper steps={STEPS} current={2} disabled onSelect={() => alert("nope")} />
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Unstyled -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Unstyled</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Using unstyled mode with custom Tailwind classes.
		</p>
		<Stepper
			unstyled
			classStep="inline-flex items-center not-last:after:content-['→'] not-last:after:mx-3 not-last:after:text-neutral-400"
			classIndicator="hidden"
			classLabel="text-sm font-mono uppercase tracking-widest"
			steps={STEPS}
			current={2}
		/>
	</section>
</div>
