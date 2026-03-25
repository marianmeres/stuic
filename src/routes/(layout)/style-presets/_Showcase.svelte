<script lang="ts">
	import {
		Card,
		Button,
		DismissibleMessage,
		Notifications,
		NotificationsStack,
		AlertConfirmPrompt,
		AlertConfirmPromptStack,
		DropdownMenu,
		type DropdownMenuItem,
		TabbedMenu,
		Accordion,
		AccordionItem,
		ModalDialog,
		FieldInput,
		FieldCheckbox,
	} from "$lib/index.js";

	let { raised = false }: { raised?: boolean } = $props();

	let name = $state("");
	let email = $state("");
	let agreed = $state(false);

	const notifications = new NotificationsStack();
	const acp = new AlertConfirmPromptStack();
	let dialog: ModalDialog;
	let activeTab = $state("tab1");

	const dropdownItems: DropdownMenuItem[] = [
		{ type: "action", id: "edit", label: "Edit" },
		{ type: "action", id: "duplicate", label: "Duplicate" },
		{ type: "divider" },
		{ type: "action", id: "archive", label: "Archive" },
		{ type: "action", id: "delete", label: "Delete" },
	];

	const tabs = [
		{ id: "tab1", label: "Overview" },
		{ id: "tab2", label: "Features" },
		{ id: "tab3", label: "Pricing" },
		{ id: "tab4", label: "FAQ" },
	];
</script>

<Notifications {notifications} />
<AlertConfirmPrompt {acp} />

<div class="space-y-10">
	<!-- Cards -->
	<section>
		<h3 class="text-lg font-semibold mb-4">Cards</h3>
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			<Card
				image="https://picsum.photos/seed/preset1/600/400"
				eyebrow="Design"
				title="Component Library"
				description="Build consistent UIs with reusable components and shared tokens."
			>
				{#snippet renderFooter()}
					<div class="flex justify-end gap-2">
						<Button variant="ghost" size="sm" {raised}>Details</Button>
						<Button intent="primary" size="sm" {raised}>Get Started</Button>
					</div>
				{/snippet}
			</Card>
			<Card
				href="#link-card"
				image="https://picsum.photos/seed/preset2/600/400"
				eyebrow="Tutorial"
				title="Theming Guide"
				description="Learn how to customize every aspect of the design system."
			/>
			<Card
				title="No Image Card"
				description="Cards work perfectly fine without an image. The content adapts to fill the available space."
			>
				{#snippet renderFooter()}
					<div class="flex justify-end">
						<Button variant="link" size="sm" intent="primary" {raised}>Read More</Button>
					</div>
				{/snippet}
			</Card>
		</div>
	</section>

	<!-- Buttons -->
	<section>
		<h3 class="text-lg font-semibold mb-4">Buttons</h3>
		<div class="flex flex-wrap gap-3">
			<Button intent="primary" {raised}>Primary</Button>
			<Button intent="accent" {raised}>Accent</Button>
			<Button intent="destructive" {raised}>Destructive</Button>
			<Button {raised}>Default</Button>
		</div>
		<div class="flex flex-wrap gap-3 mt-3">
			<Button intent="primary" variant="outline" {raised}>Outline</Button>
			<Button intent="accent" variant="outline" {raised}>Outline</Button>
			<Button intent="destructive" variant="outline" {raised}>Outline</Button>
			<Button variant="outline" {raised}>Outline</Button>
		</div>
		<div class="flex flex-wrap gap-3 mt-3">
			<Button intent="primary" variant="ghost" {raised}>Ghost</Button>
			<Button intent="accent" variant="ghost" {raised}>Ghost</Button>
			<Button intent="destructive" variant="ghost" {raised}>Ghost</Button>
			<Button variant="ghost" {raised}>Ghost</Button>
		</div>
	</section>

	<!-- Messages -->
	<section>
		<h3 class="text-lg font-semibold mb-4">Dismissible Messages</h3>
		<div class="space-y-3 max-w-xl">
			<DismissibleMessage
				message="This is an informational message."
				intent="info"
				onDismiss={false}
			/>
			<DismissibleMessage
				message="Warning: please review your settings before proceeding."
				intent="warning"
				onDismiss={false}
			/>
			<DismissibleMessage
				message="Operation completed successfully!"
				intent="success"
				onDismiss={false}
			/>
		</div>
	</section>

	<!-- Notifications + AlertConfirmPrompt triggers -->
	<section>
		<h3 class="text-lg font-semibold mb-4">Notifications & Dialogs</h3>
		<div class="flex flex-wrap gap-3">
			<Button
				size="sm"
				{raised}
				onclick={() => notifications.success("Item saved successfully!")}
			>
				Success Toast
			</Button>
			<Button
				size="sm"
				{raised}
				onclick={() => notifications.error("Something went wrong.", { ttl: 0 })}
			>
				Error Toast (sticky)
			</Button>
			<Button
				size="sm"
				{raised}
				onclick={() =>
					acp.alert({
						title: "Heads Up",
						content: "This is an alert dialog triggered by the AlertConfirmPrompt stack.",
					})}
			>
				Alert Dialog
			</Button>
			<Button
				size="sm"
				{raised}
				onclick={() =>
					acp.confirm(
						() => {
							notifications.info("Confirmed!");
							acp.shift();
						},
						{
							title: "Are you sure?",
							content: "This action cannot be undone.",
						},
					)}
			>
				Confirm Dialog
			</Button>
		</div>
	</section>

	<!-- DropdownMenu -->
	<section>
		<h3 class="text-lg font-semibold mb-4">Dropdown Menu</h3>
		<DropdownMenu
			items={dropdownItems}
			onSelect={(item) => { notifications.info(`Selected: ${item.id}`); }}
		>
			Actions
		</DropdownMenu>
	</section>

	<!-- TabbedMenu -->
	<section>
		<h3 class="text-lg font-semibold mb-4">Tabbed Menu</h3>
		<TabbedMenu items={tabs} bind:value={activeTab} />
		<div class="mt-4 p-4 border border-neutral-200 dark:border-neutral-700 rounded">
			Active tab: <strong>{activeTab}</strong>
		</div>
	</section>

	<!-- Input fields -->
	<section>
		<h3 class="text-lg font-semibold mb-4">Inputs</h3>
		<div class="max-w-sm space-y-4">
			<FieldInput label="Name" placeholder="Enter your name" bind:value={name} />
			<FieldInput label="Email" type="email" placeholder="you@example.com" bind:value={email} />
			<FieldCheckbox label="I agree to the terms" bind:checked={agreed} />
		</div>
	</section>

	<!-- Accordion -->
	<section>
		<h3 class="text-lg font-semibold mb-4">Accordion</h3>
		<div class="max-w-xl">
			<Accordion exclusive>
				<AccordionItem>
					{#snippet trigger()}What are structural tokens?{/snippet}
					<p class="text-sm">
						Structural tokens are shared CSS custom properties that control cross-component
						visual properties like border-radius, shadows, border-width, and transitions.
					</p>
				</AccordionItem>
				<AccordionItem>
					{#snippet trigger()}How do I customize them?{/snippet}
					<p class="text-sm">
						Override the tokens in your app's CSS: <code>:root {'{'} --stuic-radius: 0; {'}'}</code>.
						All components that reference these tokens will update automatically.
					</p>
				</AccordionItem>
				<AccordionItem>
					{#snippet trigger()}Can I still override per component?{/snippet}
					<p class="text-sm">
						Yes. Per-component tokens like <code>--stuic-button-radius</code> take precedence
						over the shared <code>--stuic-radius</code>. The shared tokens are defaults,
						not constraints.
					</p>
				</AccordionItem>
			</Accordion>
		</div>
	</section>

	<!-- ModalDialog -->
	<section>
		<h3 class="text-lg font-semibold mb-4">Modal Dialog</h3>
		<Button size="sm" {raised} onclick={(e) => dialog.open(e)}>Open Modal</Button>
		<ModalDialog bind:this={dialog} class="p-6 max-w-md">
			<h2 class="text-xl font-bold mb-2">Modal Dialog</h2>
			<p class="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
				This modal inherits the structural tokens from the preset. Notice the
				border-radius, shadow, and transition applied to this dialog.
			</p>
			<div class="flex justify-end gap-2">
				<Button variant="ghost" {raised} onclick={() => dialog.close()}>Cancel</Button>
				<Button intent="primary" {raised} onclick={() => dialog.close()}>Confirm</Button>
			</div>
		</ModalDialog>
	</section>
</div>
