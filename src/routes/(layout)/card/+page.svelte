<script lang="ts">
	import { Card, Button } from "$lib/index.js";
</script>

<div class="space-y-16 py-8">
	<!-- Basic Card -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Basic Card</h2>
		<p class="text-sm text-neutral-500 mb-4">Image, title, and description.</p>
		<div class="max-w-sm">
			<Card
				image="https://picsum.photos/seed/card1/600/400"
				title="Mountain Retreat"
				description="A peaceful getaway nestled in the heart of the mountains."
			/>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Card with Eyebrow and Footer Actions -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Card with Eyebrow & Actions</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Eyebrow label, title, description, and action buttons in the footer.
		</p>
		<div class="max-w-sm">
			<Card
				image="https://picsum.photos/seed/card2/600/400"
				eyebrow="Travel"
				title="Explore the Coast"
				description="Discover hidden beaches and coastal trails along the Pacific."
			>
				{#snippet renderFooter()}
					<div class="flex justify-end gap-2">
						<Button variant="ghost" size="sm">Save</Button>
						<Button intent="primary" size="sm">Book Now</Button>
					</div>
				{/snippet}
			</Card>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Clickable Card (link) -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Clickable Card (link)</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Entire card is an anchor tag. Hover to see the interactive styling.
		</p>
		<div class="max-w-sm">
			<Card
				href="#clicked"
				image="https://picsum.photos/seed/card3/600/400"
				eyebrow="Technology"
				title="The Future of AI"
				description="How artificial intelligence is reshaping industries worldwide."
			/>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Clickable Card (onclick) -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Clickable Card (onclick)</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Card renders as a button element. Click to trigger an action.
		</p>
		<div class="max-w-sm">
			<Card
				onclick={() => alert("Card clicked!")}
				image="https://picsum.photos/seed/card4/600/400"
				title="Click Me"
				description="This card is a button. Click it to see an alert."
			/>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Horizontal Variant -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Horizontal Variant</h2>
		<p class="text-sm text-neutral-500 mb-4">Image on the side, content flows horizontally.</p>
		<div class="max-w-2xl">
			<Card
				variant="horizontal"
				image="https://picsum.photos/seed/card5/400/400"
				eyebrow="Recipe"
				title="Mediterranean Salad"
				description="A fresh and healthy salad with olives, feta cheese, and sun-dried tomatoes. Perfect for a light lunch."
			>
				{#snippet renderFooter()}
					<div class="flex justify-end gap-2">
						<Button variant="ghost" size="sm">Share</Button>
						<Button intent="primary" size="sm">View Recipe</Button>
					</div>
				{/snippet}
			</Card>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Responsive Horizontal (auto-switch) -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Responsive Horizontal</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Horizontal card auto-switches to vertical when its width drops below the threshold
			(default 480px). Resize the browser to see it in action.
		</p>
		<div class="max-w-2xl">
			<Card
				variant="horizontal"
				image="https://picsum.photos/seed/card5r/400/400"
				eyebrow="Responsive"
				title="Auto-switching Layout"
				description="This card is horizontal when wide enough, but collapses to vertical on narrow containers."
			>
				{#snippet renderFooter()}
					<div class="flex justify-end gap-2">
						<Button variant="ghost" size="sm">Cancel</Button>
						<Button intent="primary" size="sm">Action</Button>
					</div>
				{/snippet}
			</Card>
		</div>
		<p class="text-sm text-neutral-500 mt-4">
			Same card with auto-switch disabled (<code>horizontalThreshold=&#123;0&#125;</code>):
		</p>
		<div class="max-w-xs mt-2">
			<Card
				variant="horizontal"
				horizontalThreshold={0}
				image="https://picsum.photos/seed/card5r/400/400"
				eyebrow="Forced"
				title="Always Horizontal"
				description="This stays horizontal even when narrow."
			/>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Card with Badge -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Card with Badge</h2>
		<p class="text-sm text-neutral-500 mb-4">Badge overlay positioned on the image.</p>
		<div class="max-w-sm">
			<Card
				image="https://picsum.photos/seed/card6/600/400"
				title="Limited Edition"
				description="Only a few pieces remaining. Get yours before they're gone."
			>
				{#snippet renderBadge()}
					<span
						class="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded"
					>
						SALE
					</span>
				{/snippet}
				{#snippet renderFooter()}
					<div class="flex items-center justify-between">
						<span class="text-lg font-bold">$49.99</span>
						<Button intent="primary" size="sm">Add to Cart</Button>
					</div>
				{/snippet}
			</Card>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Card Grid -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Card Grid</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Cards fill their parent container. Use CSS grid to control layout.
		</p>
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each [
				{ seed: "grid1", title: "Design", desc: "Create beautiful interfaces" },
				{ seed: "grid2", title: "Develop", desc: "Build robust applications" },
				{ seed: "grid3", title: "Deploy", desc: "Ship with confidence" },
			] as item}
				<Card
					image="https://picsum.photos/seed/{item.seed}/600/400"
					title={item.title}
					description={item.desc}
				>
					{#snippet renderFooter()}
						<div class="flex justify-end">
							<Button variant="ghost" size="sm">Learn More</Button>
						</div>
					{/snippet}
				</Card>
			{/each}
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- No Image -->
	<section>
		<h2 class="text-xl font-semibold mb-2">No Image</h2>
		<p class="text-sm text-neutral-500 mb-4">Card with only text content.</p>
		<div class="max-w-sm">
			<Card
				eyebrow="Announcement"
				title="System Maintenance"
				description="Scheduled maintenance window on Saturday from 2:00 AM to 6:00 AM UTC. Some services may be temporarily unavailable."
			>
				{#snippet renderFooter()}
					<div class="flex justify-end">
						<Button variant="link" size="sm">Dismiss</Button>
					</div>
				{/snippet}
			</Card>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Custom Render Snippets -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Custom Render Snippets</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Override content area with renderContent snippet.
		</p>
		<div class="max-w-sm">
			<Card image="https://picsum.photos/seed/card7/600/400">
				{#snippet renderContent({ title })}
					<div class="flex items-center gap-3">
						<div
							class="size-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold"
						>
							JD
						</div>
						<div>
							<div class="font-semibold">Jane Doe</div>
							<div class="text-sm text-neutral-500">Posted 2 hours ago</div>
						</div>
					</div>
					<p>This is a fully custom content area using the renderContent snippet.</p>
				{/snippet}
			</Card>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Full Override with children -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Full Override (children)</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Using children snippet to completely replace card internals.
		</p>
		<div class="max-w-sm">
			<Card>
				<div class="p-6 text-center">
					<div class="text-4xl mb-4">🎉</div>
					<h3 class="text-xl font-bold mb-2">Completely Custom</h3>
					<p class="text-neutral-500 mb-4">
						This card uses the children snippet for full control.
					</p>
					<Button intent="primary">Get Started</Button>
				</div>
			</Card>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Custom Styling via CSS Variables -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Custom Styling via CSS Variables</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Customized using CSS custom properties.
		</p>
		<div
			class="max-w-sm"
			style="
				--stuic-card-radius: 1.5rem;
				--stuic-card-shadow: none;
				--stuic-card-border-width: 2px;
				--stuic-card-image-aspect-ratio: 1;
			"
		>
			<Card
				image="https://picsum.photos/seed/card8/600/600"
				title="Square Image"
				description="Custom radius, no shadow, thicker border, and 1:1 aspect ratio."
			/>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Disabled -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Disabled Card</h2>
		<p class="text-sm text-neutral-500 mb-4">Reduced opacity and no interaction.</p>
		<div class="max-w-sm">
			<Card
				disabled
				onclick={() => alert("Should not fire")}
				image="https://picsum.photos/seed/card9/600/400"
				title="Unavailable"
				description="This card is disabled and cannot be interacted with."
			/>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Unstyled -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Unstyled</h2>
		<p class="text-sm text-neutral-500 mb-4">Using unstyled mode with custom Tailwind classes.</p>
		<div class="max-w-sm">
			<Card
				unstyled
				class="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl overflow-hidden"
				image="https://picsum.photos/seed/card10/600/400"
				title="Gradient Card"
				description="Fully custom styling with unstyled mode."
			/>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Brutalist / Minimalist -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Brutalist / Minimalist</h2>
		<p class="text-sm text-neutral-500 mb-4">
			No border radius, no shadow, flat high-contrast surfaces, monochrome palette.
		</p>
		<div
			class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0"
			style="
				--stuic-card-radius: 0;
				--stuic-card-shadow: none;
				--stuic-card-shadow-hover: none;
				--stuic-card-border-width: 0;
				--stuic-card-bg: black;
				--stuic-card-bg-hover: #111;
				--stuic-card-padding: 1.25rem;
				--stuic-card-content-gap: 0.75rem;
				--stuic-card-image-aspect-ratio: 4 / 3;
				--stuic-card-eyebrow-text: #888;
				--stuic-card-eyebrow-font-size: 0.65rem;
				--stuic-card-title-text: white;
				--stuic-card-title-font-size: 1.125rem;
				--stuic-card-title-font-weight: 900;
				--stuic-card-description-text: #aaa;
				--stuic-card-description-font-size: 0.8rem;
			"
		>
			<Card
				href="#brutalist-1"
				image="https://picsum.photos/seed/brutal1/600/450?grayscale"
				eyebrow="VOL. 01"
				title="RAW CONCRETE"
				description="Stripped to essentials. No decoration. Pure structure."
			/>
			<Card
				href="#brutalist-2"
				image="https://picsum.photos/seed/brutal2/600/450?grayscale"
				eyebrow="VOL. 02"
				title="GRID SYSTEMS"
				description="Order from chaos. Systematic repetition as form."
			/>
			<Card
				href="#brutalist-3"
				image="https://picsum.photos/seed/brutal3/600/450?grayscale"
				eyebrow="VOL. 03"
				title="NEGATIVE SPACE"
				description="What you leave out matters more than what you put in."
			/>
		</div>

		<div
			class="mt-8 max-w-xl"
			style="
				--stuic-card-radius: 0;
				--stuic-card-shadow: none;
				--stuic-card-shadow-hover: none;
				--stuic-card-border-width: 0;
				--stuic-card-bg: white;
				--stuic-card-bg-hover: #f5f5f5;
				--stuic-card-padding: 1.5rem;
				--stuic-card-content-gap: 0.5rem;
				--stuic-card-image-object-fit: cover;
				--stuic-card-image-width-horizontal: 35%;
				--stuic-card-eyebrow-text: black;
				--stuic-card-eyebrow-font-size: 0.6rem;
				--stuic-card-title-text: black;
				--stuic-card-title-font-size: 1rem;
				--stuic-card-title-font-weight: 900;
				--stuic-card-description-text: #555;
				--stuic-card-description-font-size: 0.8rem;
			"
		>
			<Card
				variant="horizontal"
				href="#brutalist-h"
				image="https://picsum.photos/seed/brutal4/400/400?grayscale"
				eyebrow="ESSAY  /  12 MIN READ"
				title="THE ORNAMENT IS THE CRIME"
				description="Adolf Loos was right. Every surface that doesn't serve function is noise. Strip it. What remains is honest."
			>
				{#snippet renderFooter()}
					<div
						class="flex justify-end text-[0.65rem] font-mono tracking-widest uppercase"
						style="color: #999;"
					>
						2026.03.25
					</div>
				{/snippet}
			</Card>
		</div>
	</section>
</div>
