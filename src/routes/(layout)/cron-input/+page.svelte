<script lang="ts">
	import CronInput from "../../../lib/components/CronInput/CronInput.svelte";
	import { CronNextRun } from "../../../lib/components/CronInput/index.js";

	let value1 = $state("* * * * *");
	let value2 = $state("0 9 * * 1-5");
	let value3 = $state("*/15 * * * *");
	let value4 = $state("0 * * * *");

	// Standalone reactive helper — updates every minute
	const nextRun1 = new CronNextRun();
	$effect(() => {
		nextRun1.expression = value1;
	});
</script>

<div class="space-y-12 max-w-2xl">
	<h1 class="text-2xl font-bold">CronInput</h1>

	<div class="space-y-8">
		<div>
			<h2 class="text-lg font-semibold mb-4">Default (all features)</h2>
			<CronInput bind:value={value1} label="Schedule" />
			<div class="mt-2 text-sm opacity-60">
				Bound value: <code>{value1}</code>
			</div>
		</div>

		<div>
			<h2 class="text-lg font-semibold mb-4">With description</h2>
			<CronInput
				bind:value={value2}
				label="Cron expression"
				description="Standard 5-field cron notation: minute hour day-of-month month day-of-week"
			/>
			<div class="mt-2 text-sm opacity-60">
				Bound value: <code>{value2}</code>
			</div>
		</div>

		<div>
			<h2 class="text-lg font-semibold mb-4">Without presets, without raw input</h2>
			<CronInput
				bind:value={value3}
				label="Interval"
				mode={undefined}
				showPresets={false}
				showRawInput={false}
			/>
			<div class="mt-2 text-sm opacity-60">
				Bound value: <code>{value3}</code>
			</div>
		</div>

		<div>
			<h2 class="text-lg font-semibold mb-4">Presets only</h2>
			<CronInput
				bind:value={value4}
				label="Quick schedule"
				mode={undefined}
				showFields={false}
				showRawInput={false}
				showDescription={false}
				showNextRun={false}
			/>
			<div class="mt-2 text-sm opacity-60">
				Bound value: <code>{value4}</code>
			</div>
		</div>

		<div>
			<h2 class="text-lg font-semibold mb-4">Disabled</h2>
			<CronInput value="0 0 1 * *" label="Frozen schedule" disabled />
		</div>

		<div>
			<h2 class="text-lg font-semibold mb-4">Small size</h2>
			<CronInput bind:value={value1} label="Small" renderSize="sm" />
		</div>

		<div>
			<h2 class="text-lg font-semibold mb-4">Large size</h2>
			<CronInput bind:value={value1} label="Large" renderSize="lg" />
		</div>

		<div>
			<h2 class="text-lg font-semibold mb-4">Label left</h2>
			<CronInput bind:value={value1} label="Schedule" labelLeft />
		</div>

		<div>
			<h2 class="text-lg font-semibold mb-4">Standalone CronNextRun helper</h2>
			<CronInput
				bind:value={value1}
				label="Edit schedule"
				mode={undefined}
				showDescription={false}
				showNextRun={false}
			/>
			<div class="mt-2 text-sm opacity-60">
				Next run (updates every minute): <code>{nextRun1.nextRunFormatted || "invalid"}</code>
			</div>
		</div>
	</div>
</div>
