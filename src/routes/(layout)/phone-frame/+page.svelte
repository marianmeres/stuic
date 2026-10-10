<script lang="ts">
	import { PhoneFrame, Button, H, Pill } from "$lib/index.js";

	// A 390×844 CSS px screenshot taken on a 2× display (780×1688 px file).
	const shot = {
		src: "/assets/phone-frame-demo.jpg",
		alt: "The Card demo page on a phone",
		width: 780,
		height: 1688,
	};
</script>

<div class="space-y-16 py-8">
	<section>
		<h2 class="text-xl font-semibold mb-2">Basic</h2>
		<p class="text-sm text-neutral-500 mb-4">
			A screenshot in a phone bezel. The frame is block-level and sized with <code
				>class</code
			>; the screen keeps a 390/844 ratio, so the phone scales with its column.
		</p>
		<div class="flex flex-wrap items-start gap-8">
			<PhoneFrame class="w-40" {...shot} />
			<PhoneFrame class="w-56" {...shot} />
			<PhoneFrame class="w-72" {...shot} />
		</div>
	</section>

	<hr />

	<section>
		<h2 class="text-xl font-semibold mb-2">Linked to the live page</h2>
		<p class="text-sm text-neutral-500 mb-4">
			With <code>href</code> the whole frame is an <code>&lt;a&gt;</code>.
			<code>target="_blank"</code>
			gets <code>rel="noopener"</code> by default. Tab to it to see the focus ring.
		</p>
		<PhoneFrame
			class="w-56"
			src={shot.src}
			alt="Open the Card demo page"
			width={shot.width}
			height={shot.height}
			href="/card"
			target="_blank"
		/>
	</section>

	<hr />

	<section>
		<h2 class="text-xl font-semibold mb-2">Camera cutout</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>notch="none"</code> (default), <code>"island"</code>, <code>"notch"</code>.
			Painted in the bezel color over the top of the screen content.
		</p>
		<div class="flex flex-wrap items-start gap-8">
			<div class="space-y-2">
				<PhoneFrame class="w-48" {...shot} />
				<p class="text-sm text-neutral-500 text-center">none</p>
			</div>
			<div class="space-y-2">
				<PhoneFrame class="w-48" {...shot} notch="island" />
				<p class="text-sm text-neutral-500 text-center">island</p>
			</div>
			<div class="space-y-2">
				<PhoneFrame class="w-48" {...shot} notch="notch" />
				<p class="text-sm text-neutral-500 text-center">notch</p>
			</div>
		</div>
	</section>

	<hr />

	<section>
		<h2 class="text-xl font-semibold mb-2">Clipped window (the first screen only)</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>screenHeight</code> turns the screen into a fixed-height window showing the top
			of the content; the aspect ratio no longer applies and the width still fills the bezel.
		</p>
		<div class="flex flex-wrap items-start gap-8">
			<div class="space-y-2">
				<PhoneFrame class="w-56" {...shot} screenHeight="12rem" />
				<p class="text-sm text-neutral-500 text-center">screenHeight="12rem"</p>
			</div>
			<div class="space-y-2">
				<PhoneFrame class="w-56" {...shot} screenHeight="20rem" notch="island" />
				<p class="text-sm text-neutral-500 text-center">screenHeight="20rem" + island</p>
			</div>
		</div>

		<h3 class="font-semibold mt-8 mb-2">
			Responsive: clipped below <code>lg</code>, whole phone from <code>lg</code> up
		</h3>
		<p class="text-sm text-neutral-500 mb-4">
			The <code>--stuic-phone-frame-screen-height</code> token set through
			<code>class</code> is inherited by the screen. Resize the window to see it switch.
		</p>
		<PhoneFrame
			class="w-full max-w-sm lg:w-72 [--stuic-phone-frame-screen-height:16rem] lg:[--stuic-phone-frame-screen-height:auto]"
			{...shot}
		/>

		<h3 class="font-semibold mt-8 mb-2">Phone cut off by the section edge</h3>
		<p class="text-sm text-neutral-500 mb-4">
			No component support needed: clip the whole frame with your own wrapper.
		</p>
		<div
			class="max-h-72 overflow-hidden rounded-xl bg-neutral-100 px-8 pt-8 dark:bg-neutral-800"
		>
			<PhoneFrame class="w-64 mx-auto" {...shot} notch="island" />
		</div>
	</section>

	<hr />

	<section>
		<h2 class="text-xl font-semibold mb-2">Your own screen content</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>children</code> instead of <code>src</code>: a live component tree, an iframe,
			a video. The screen clips and has a definite height, so <code>h-full</code> works.
		</p>
		<div class="flex flex-wrap items-start gap-8">
			<PhoneFrame class="w-64" notch="island">
				<div class="flex h-full w-full flex-col bg-white text-neutral-900">
					<div class="flex items-center justify-between px-5 pt-12 pb-3">
						<H level={3} class="font-semibold">Inbox</H>
						<Pill intent="primary" size="sm">3 new</Pill>
					</div>
					<div class="flex-1 space-y-3 overflow-y-auto px-5">
						{#each ["Alice", "Bob", "Carol", "Dan", "Eve", "Frank"] as name}
							<div class="rounded-xl border border-neutral-200 p-3">
								<div class="font-medium">{name}</div>
								<div class="text-sm text-neutral-500">Tap to open the conversation</div>
							</div>
						{/each}
					</div>
					<div class="p-4">
						<Button class="w-full">Compose</Button>
					</div>
				</div>
			</PhoneFrame>
			<PhoneFrame class="w-64">
				<iframe src="/card" title="The Card demo, live" class="h-full w-full border-0"
				></iframe>
			</PhoneFrame>
		</div>
	</section>

	<hr />

	<section>
		<h2 class="text-xl font-semibold mb-2">Tokens</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Bezel color, thickness and radius; the screen radius stays concentric. Any
			<code>aspect-ratio</code> value for another device.
		</p>
		<div class="flex flex-wrap items-start gap-8">
			<div class="space-y-2">
				<PhoneFrame
					class="w-48"
					{...shot}
					style="--stuic-phone-frame-bg: #e5e5e5; --stuic-phone-frame-border-color: rgb(0 0 0 / 0.15);"
				/>
				<p class="text-sm text-neutral-500 text-center">silver</p>
			</div>
			<div class="space-y-2">
				<PhoneFrame
					class="w-48"
					{...shot}
					style="--stuic-phone-frame-padding: 0.875rem; --stuic-phone-frame-radius: 2.5rem;"
				/>
				<p class="text-sm text-neutral-500 text-center">thick bezel</p>
			</div>
			<div class="space-y-2">
				<PhoneFrame
					class="w-48"
					{...shot}
					style="--stuic-phone-frame-shadow: none; --stuic-phone-frame-radius: 0.5rem;"
				/>
				<p class="text-sm text-neutral-500 text-center">flat</p>
			</div>
			<div class="space-y-2">
				<PhoneFrame
					class="w-64"
					{...shot}
					aspectRatio="3 / 4"
					style="--stuic-phone-frame-radius: 1.25rem; --stuic-phone-frame-padding: 0.75rem;"
				/>
				<p class="text-sm text-neutral-500 text-center">aspectRatio="3 / 4" (tablet)</p>
			</div>
		</div>
	</section>

	<hr />

	<section>
		<h2 class="text-xl font-semibold mb-2">Unstyled</h2>
		<p class="text-sm text-neutral-500 mb-4">
			No <code>stuic-phone-frame*</code> classes, no cutout; the three class props are the only
			styling.
		</p>
		<PhoneFrame
			unstyled
			class="w-56 rounded-3xl bg-zinc-800 p-3"
			classScreen="aspect-[9/19.5] overflow-hidden rounded-2xl"
			classImage="h-full w-full object-cover"
			{...shot}
		/>
	</section>
</div>
