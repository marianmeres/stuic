<script lang="ts">
	import { Progress } from "$lib/index.js";

	let progress = $state(38);
	let animatedProgress = $state(0);
	let isAnimating = $state(false);

	function startAnimation() {
		if (isAnimating) return;
		isAnimating = true;
		animatedProgress = 0;
		const interval = setInterval(() => {
			animatedProgress += 5;
			if (animatedProgress >= 100) {
				clearInterval(interval);
				isAnimating = false;
			}
		}, 100);
	}

	function resetAnimation() {
		animatedProgress = 0;
		isAnimating = false;
	}
</script>

<h2 class="text-xl font-semibold mb-4">Basic Bar</h2>

<div class="space-y-4 max-w-md">
	<Progress {progress} />
	<div class="flex items-center gap-4">
		<input type="range" bind:value={progress} min="0" max="100" class="flex-1" />
		<span class="text-sm text-neutral-500 w-12">{progress}%</span>
	</div>
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">Circle Progress</h2>

<div class="flex flex-wrap gap-8 items-center">
	<Progress type="circle" progress={25} />
	<Progress type="circle" progress={50} />
	<Progress type="circle" progress={75} />
	<Progress type="circle" progress={100} />
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">Custom Sizes</h2>

<div class="space-y-4 max-w-md">
	<p class="text-sm text-neutral-500 mb-2">Bar heights via --stuic-progress-height:</p>
	<Progress progress={60} style="--stuic-progress-height: calc(var(--spacing) * 1);" />
	<Progress progress={60} />
	<Progress progress={60} style="--stuic-progress-height: calc(var(--spacing) * 3);" />
	<Progress progress={60} style="--stuic-progress-height: calc(var(--spacing) * 4);" />
</div>

<div class="mt-6">
	<p class="text-sm text-neutral-500 mb-4">
		Circle sizes via --stuic-progress-circle-size:
	</p>
	<div class="flex flex-wrap gap-6 items-center">
		<Progress
			type="circle"
			progress={75}
			style="--stuic-progress-circle-size: calc(var(--spacing) * 10);"
		/>
		<Progress type="circle" progress={75} />
		<Progress
			type="circle"
			progress={75}
			style="--stuic-progress-circle-size: calc(var(--spacing) * 24);"
		/>
	</div>
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">Border Radius</h2>

<div class="space-y-4 max-w-md">
	<Progress progress={60} style="--stuic-progress-radius: 0;" />
	<Progress progress={60} />
	<Progress progress={60} style="--stuic-progress-radius: var(--radius-lg);" />
	<Progress progress={60} style="--stuic-progress-radius: var(--radius-full);" />
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">Custom Colors (State Indicators)</h2>

<div class="space-y-4 max-w-md">
	<div>
		<span class="text-sm text-neutral-500">Primary (default)</span>
		<Progress progress={60} />
	</div>
	<div>
		<span class="text-sm text-neutral-500">Success</span>
		<Progress
			progress={100}
			style="--stuic-progress-accent: var(--stuic-color-success);"
		/>
	</div>
	<div>
		<span class="text-sm text-neutral-500">Warning</span>
		<Progress
			progress={85}
			style="--stuic-progress-accent: var(--stuic-color-warning);"
		/>
	</div>
	<div>
		<span class="text-sm text-neutral-500">Destructive</span>
		<Progress
			progress={25}
			style="--stuic-progress-accent: var(--stuic-color-destructive);"
		/>
	</div>
	<div>
		<span class="text-sm text-neutral-500">Accent</span>
		<Progress progress={50} style="--stuic-progress-accent: var(--stuic-color-accent);" />
	</div>
	<div>
		<span class="text-sm text-neutral-500">Info</span>
		<Progress progress={70} style="--stuic-progress-accent: var(--stuic-color-info);" />
	</div>
</div>

<div class="mt-6">
	<p class="text-sm text-neutral-500 mb-4">Circle with custom colors:</p>
	<div class="flex flex-wrap gap-6 items-center">
		<Progress
			type="circle"
			progress={100}
			style="--stuic-progress-accent: var(--stuic-color-success);"
		/>
		<Progress
			type="circle"
			progress={85}
			style="--stuic-progress-accent: var(--stuic-color-warning);"
		/>
		<Progress
			type="circle"
			progress={25}
			style="--stuic-progress-accent: var(--stuic-color-destructive);"
		/>
	</div>
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">Animated Progress</h2>

<div class="space-y-4 max-w-md">
	<Progress progress={animatedProgress} />
	<Progress type="circle" progress={animatedProgress} />
	<div class="flex gap-4">
		<button
			onclick={startAnimation}
			disabled={isAnimating}
			class="px-4 py-2 bg-neutral-200 rounded disabled:opacity-50"
		>
			{isAnimating ? "Running..." : "Start"}
		</button>
		<button onclick={resetAnimation} class="px-4 py-2 bg-neutral-200 rounded">
			Reset
		</button>
		<span class="text-sm text-neutral-500 self-center">{animatedProgress}%</span>
	</div>
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">Tailwind Class Overrides</h2>

<div class="space-y-4 max-w-md">
	<p class="text-sm text-neutral-500 mb-2">Using classBar for fill color:</p>
	<Progress progress={60} classBar="bg-gradient-to-r! from-purple-500! to-pink-500!" />

	<p class="text-sm text-neutral-500 mb-2 mt-4">Using class for container styling:</p>
	<Progress progress={60} class="h-4! rounded-full! bg-red-300!" />
</div>

<hr class="my-8" />

<h2 class="text-xl font-semibold mb-4">Custom Track Background</h2>

<div class="space-y-4 max-w-md">
	<Progress progress={60} style="--stuic-progress-bg: var(--color-green-300);" />
	<Progress
		progress={60}
		style="--stuic-progress-bg: var(--color-blue-100); --stuic-progress-accent: var(--color-blue-600);"
	/>
</div>
