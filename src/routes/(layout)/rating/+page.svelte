<script lang="ts">
	import {
		Rating,
		Button,
		createRatingT,
		RATING_MESSAGES_SK,
		iconStar,
		type ValidationResult,
	} from "$lib/index.js";
	import { iconBsHeartFill } from "@marianmeres/icons-fns/bootstrap/iconBsHeartFill.js";
	import { iconBsHeart } from "@marianmeres/icons-fns/bootstrap/iconBsHeart.js";

	let value = $state(3);
	let half = $state(3.5);
	let noClear = $state(2);
	let ten = $state(7);

	// form demo
	let formValue = $state(0);
	let formRating: Rating | undefined = $state();
	let validation: ValidationResult | undefined = $state();
	let submitted: string | null = $state(null);

	function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		const res = formRating?.validate();
		if (!res?.valid) {
			submitted = null;
			return;
		}
		const fd = new FormData(e.currentTarget as HTMLFormElement);
		submitted = JSON.stringify(Object.fromEntries(fd.entries()));
	}
</script>

<div class="space-y-16 py-8">
	<!-- Basic -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Basic (input)</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>bind:value</code>; hover previews, click selects, clicking the selected star
			again clears (<code>allowClear</code>, default). Keyboard: arrows, Home/End,
			Delete/Backspace.
		</p>
		<div class="flex items-center gap-4">
			<Rating bind:value />
			<span class="text-sm text-neutral-500 tabular-nums">value: {value}</span>
			<Button size="sm" variant="outline" onclick={() => (value = 0)}>Reset</Button>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Half -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Half Stars</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>allowHalf</code> — each star gets two hit zones (start / end half); arrows step
			by 0.5.
		</p>
		<div class="flex items-center gap-4">
			<Rating bind:value={half} allowHalf />
			<span class="text-sm text-neutral-500 tabular-nums">value: {half}</span>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Readonly -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Display (readonly)</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>readonly</code> renders any fraction (4.2 → a 20% fifth star), no interaction,
			no form participation; the root is <code>role="img"</code> with a "{"{value}"} of
			{"{max}"} stars" label.
		</p>
		<div class="space-y-3">
			<div class="flex items-center gap-2">
				<Rating value={4.2} readonly label="Average rating" />
				<span class="text-sm">4.2</span>
				<span class="text-sm text-neutral-500">(128 reviews)</span>
			</div>
			<div class="flex items-center gap-2">
				<Rating value={2.5} readonly size="sm" />
				<span class="text-sm text-neutral-500">2.5 — sm</span>
			</div>
			<div class="flex items-center gap-2">
				<Rating value={5} readonly size="lg" />
				<span class="text-sm text-neutral-500">5 — lg</span>
			</div>
			<div class="flex items-center gap-2">
				<Rating value={0} readonly />
				<span class="text-sm text-neutral-500">0 — no rating</span>
			</div>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Sizes -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Sizes</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>size="sm" | "md" | "lg"</code> presets; <code>--stuic-rating-size</code> overrides
			any preset (last row).
		</p>
		<div class="flex flex-wrap items-center gap-6">
			<Rating value={3} size="sm" />
			<Rating value={3} />
			<Rating value={3} size="lg" />
			<Rating value={3} style="--stuic-rating-size: 3rem; --stuic-rating-gap: 0.5rem;" />
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Intents -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Intents</h2>
		<p class="text-sm text-neutral-500 mb-4">
			The default filled color is a fixed "star amber" (theme-independent on purpose — on
			monochrome themes the warning intent is grey). <code>intent</code> colors by theme instead.
		</p>
		<div class="flex flex-wrap items-center gap-6">
			<Rating value={3} />
			<Rating value={3} intent="primary" />
			<Rating value={3} intent="accent" />
			<Rating value={3} intent="success" />
			<Rating value={3} intent="warning" />
			<Rating value={3} intent="destructive" />
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Custom icons -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Custom Icons</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>icon</code> / <code>iconEmpty</code> take raw svg strings (icons-fns results). The
			empty layer defaults to the same icon, muted — pass an outline for the classic outline-empty
			look, or swap the symbol entirely.
		</p>
		<div class="flex flex-wrap items-center gap-6">
			<Rating value={3.5} readonly iconEmpty={iconStar()} />
			<Rating
				value={4}
				icon={iconBsHeartFill()}
				iconEmpty={iconBsHeart()}
				intent="destructive"
			/>
			<Rating
				value={2}
				max={3}
				icon="<span style='font-size:1.25em;line-height:1'>🔥</span>"
				iconEmpty="<span style='font-size:1.25em;line-height:1;filter:grayscale(1);opacity:.4'>🔥</span>"
				t={createRatingT({ value_of_max: "{value} of {max} flames" })}
			/>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- max + clear -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Max + No Clear</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>max={10}</code>; and <code>allowClear={false}</code> — clicking the selected star
			keeps it (a rating can't be un-set once given).
		</p>
		<div class="space-y-3">
			<div class="flex items-center gap-4">
				<Rating bind:value={ten} max={10} size="sm" />
				<span class="text-sm text-neutral-500 tabular-nums">value: {ten}</span>
			</div>
			<div class="flex items-center gap-4">
				<Rating bind:value={noClear} allowClear={false} />
				<span class="text-sm text-neutral-500 tabular-nums">value: {noClear}</span>
			</div>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Form -->
	<section>
		<h2 class="text-xl font-semibold mb-2">In a Form (required + validate)</h2>
		<p class="text-sm text-neutral-500 mb-4">
			A hidden input carries <code>name</code>/value. <code>required</code> is enforced by
			the built-in validator (hidden inputs skip native constraint validation); the submit
			handler calls the imperative <code>validate()</code> so a never-touched field reports
			too.
		</p>
		<form {onsubmit} class="space-y-3">
			<div class="flex items-center gap-4">
				<Rating
					bind:this={formRating}
					bind:value={formValue}
					name="score"
					required
					label="Your score"
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
			Reduced opacity, no hover, no clicks; the hidden input is disabled (nothing
			submits).
		</p>
		<Rating value={3} disabled />
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- i18n -->
	<section>
		<h2 class="text-xl font-semibold mb-2">i18n (Slovak)</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Localizes the group label, the per-star radio labels and the required message
			(inspect the DOM — nothing visible changes).
		</p>
		<Rating value={4} t={createRatingT(RATING_MESSAGES_SK)} />
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Custom styling -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Custom Styling via CSS Variables</h2>
		<p class="text-sm text-neutral-500 mb-4">Customized using CSS custom properties.</p>
		<div
			style="
				--stuic-rating-icon-color: var(--stuic-color-primary);
				--stuic-rating-icon-color-empty: transparent;
				--stuic-rating-size: 2rem;
				--stuic-rating-gap: 0;
				--stuic-rating-icon-scale-hover: 1.3;
			"
		>
			<Rating value={3} iconEmpty={iconStar()} />
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Unstyled -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Unstyled</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Structure only (roles, labels and the per-item <code>--stuic-rating-fill</code> survive);
			classes are yours. Here: a plain number strip instead of icons.
		</p>
		<Rating
			unstyled
			value={3}
			readonly
			class="inline-flex gap-1"
			classItem="relative size-6 rounded bg-neutral-200 dark:bg-neutral-700 overflow-hidden before:absolute before:inset-y-0 before:left-0 before:w-(--stuic-rating-fill) before:bg-neutral-600 dark:before:bg-neutral-300"
			classIcon="hidden"
		/>
	</section>
</div>
