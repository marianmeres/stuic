<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { TranslateFn } from "../../types.js";
	import type { CartComponentItem } from "../Cart/Cart.svelte";
	import type {
		CheckoutCustomerFormData,
		CheckoutLoginFormData,
		CheckoutStep,
		CheckoutValidationError,
	} from "./_internal/checkout-types.js";

	export interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		/** Cart items to display in the cart review */
		items: CartComponentItem[];

		/** Whether the step is in loading state (shows skeletons) */
		isLoading?: boolean;

		/** Error message to display */
		error?: string | null;

		// -- Progress --

		/** Current step ID for the progress indicator. Default: "review" */
		currentStep?: string;

		/** Step definitions for progress. Default: standard 4-step flow */
		steps?: CheckoutStep[];

		/** Called when a past progress step is clicked */
		onStepNavigate?: (step: CheckoutStep) => void;

		// -- Guest Form --

		/** Guest form configuration. If provided, the guest form is shown. */
		guestForm?: {
			formData?: CheckoutCustomerFormData;
			onSubmit: (data: CheckoutCustomerFormData) => void;
			isSubmitting?: boolean;
			errors?: CheckoutValidationError[];
			submitLabel?: string;
			submittingLabel?: string;
		};

		// -- Login Form --

		/** Login form configuration. If provided, the login form is available. */
		loginForm?: {
			formData?: CheckoutLoginFormData;
			onSubmit: (data: CheckoutLoginFormData) => void;
			isSubmitting?: boolean;
			errors?: CheckoutValidationError[];
			error?: string;
			onForgotPassword?: () => void;
			submitLabel?: string;
			submittingLabel?: string;
		};

		/**
		 * How to display the forms.
		 * - "guest-only": Only show guest form (default)
		 * - "login-only": Only show login form
		 * - "tabbed": Show guest and login in switchable tabs
		 * - "stacked": Show both forms stacked vertically with a divider
		 */
		formMode?: "guest-only" | "login-only" | "tabbed" | "stacked";

		/** Tab labels for "tabbed" mode */
		guestTabLabel?: string;
		loginTabLabel?: string;

		// -- Cart Review --

		/** Format price passed to CartReview */
		formatPrice?: (v: number) => string;

		/** Called when "Edit Cart" is clicked in CartReview */
		onEditCart?: () => void;

		/** Thumbnail snippet passed through to CartReview */
		cartThumbnail?: Snippet<[{ item: CartComponentItem }]>;

		// -- Overrides --

		/** Override the left column entirely */
		leftColumn?: Snippet;

		/** Override the right column entirely */
		rightColumn?: Snippet;

		t?: TranslateFn;
		unstyled?: boolean;
		class?: string;
		el?: HTMLDivElement;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import { t_default } from "./_internal/checkout-i18n-defaults.js";
	import CheckoutProgress from "./CheckoutProgress.svelte";
	import CheckoutCartReview from "./CheckoutCartReview.svelte";
	import CheckoutGuestForm from "./CheckoutGuestForm.svelte";
	import CheckoutLoginForm from "./CheckoutLoginForm.svelte";
	import DismissibleMessage from "../DismissibleMessage/DismissibleMessage.svelte";
	import Skeleton from "../Skeleton/Skeleton.svelte";
	import TabbedMenu from "../TabbedMenu/TabbedMenu.svelte";
	import { H } from "../H/index.js";

	let {
		items,
		isLoading = false,
		error,
		currentStep = "review",
		steps,
		onStepNavigate,
		guestForm,
		loginForm,
		formMode,
		guestTabLabel,
		loginTabLabel,
		formatPrice,
		onEditCart,
		cartThumbnail,
		leftColumn,
		rightColumn,
		t: tProp,
		unstyled = false,
		class: classProp,
		el = $bindable(),
		...rest
	}: Props = $props();

	let t = $derived(tProp ?? t_default);

	// Tab state for "tabbed" mode
	let activeTab = $state<string | number>("guest");

	let tabItems = $derived([
		{ id: "guest", label: guestTabLabel ?? t("checkout.step.guest_tab") },
		{ id: "login", label: loginTabLabel ?? t("checkout.step.login_tab") },
	]);

	let _class = $derived(
		unstyled ? classProp : twMerge("stuic-checkout-review-step", classProp)
	);
</script>

<div bind:this={el} class={_class} {...rest}>
	<!-- Progress -->
	<CheckoutProgress
		{steps}
		{currentStep}
		onNavigate={onStepNavigate}
		t={tProp}
		{unstyled}
	/>

	{#if isLoading}
		<!-- Skeleton grid -->
		<div class={unstyled ? undefined : "stuic-checkout-review-step-grid"}>
			<div class={unstyled ? undefined : "stuic-checkout-review-step-left"}>
				{#each [1, 2, 3] as _, i (i)}
					<Skeleton variant="rectangle" height="5rem" />
				{/each}
			</div>
			<div class={unstyled ? undefined : "stuic-checkout-review-step-right"}>
				<Skeleton height="2.5rem" />
				<Skeleton height="2.5rem" />
				<Skeleton height="2.5rem" />
			</div>
		</div>
	{:else if error && items.length === 0}
		<DismissibleMessage message={error} intent="destructive" onDismiss={false} />
	{:else}
		<DismissibleMessage message={error} intent="destructive" onDismiss={false} />

		<div class={unstyled ? undefined : "stuic-checkout-review-step-grid"}>
			<!-- Left: Cart Review -->
			<div class={unstyled ? undefined : "stuic-checkout-review-step-left"}>
				{#if leftColumn}
					{@render leftColumn()}
				{:else}
					<CheckoutCartReview
						{items}
						{formatPrice}
						{onEditCart}
						thumbnail={cartThumbnail}
						t={tProp}
						{unstyled}
					/>
				{/if}
			</div>

			<!-- Right: Contact Forms -->
			<div class={unstyled ? undefined : "stuic-checkout-review-step-right"}>
				{#if rightColumn}
					{@render rightColumn()}
				{:else}
					<H
						level={3}
						class={unstyled ? undefined : "stuic-checkout-review-step-heading"}
					>
						{t("checkout.step.contact_title")}
					</H>

					{#if formMode === "guest-only" || formMode === undefined}
						{#if guestForm}
							<CheckoutGuestForm {...guestForm} t={tProp} {unstyled} />
						{/if}
					{:else if formMode === "login-only"}
						{#if loginForm}
							<CheckoutLoginForm {...loginForm} t={tProp} {unstyled} />
						{/if}
					{:else if formMode === "tabbed"}
						<TabbedMenu
							items={tabItems}
							bind:value={activeTab}
							{unstyled}
							class={unstyled ? undefined : "stuic-checkout-review-step-tabs"}
						/>
						<!-- Tab panels -->
						{#if activeTab === "guest" && guestForm}
							<div role="tabpanel">
								<CheckoutGuestForm {...guestForm} t={tProp} {unstyled} />
							</div>
						{:else if activeTab === "login" && loginForm}
							<div role="tabpanel">
								<CheckoutLoginForm {...loginForm} t={tProp} {unstyled} />
							</div>
						{/if}
					{:else if formMode === "stacked"}
						{#if loginForm}
							<CheckoutLoginForm {...loginForm} t={tProp} {unstyled} />
						{/if}
						<div class={unstyled ? undefined : "stuic-checkout-review-step-divider"}>
							<span>{t("checkout.step.or_divider")}</span>
						</div>
						{#if guestForm}
							<CheckoutGuestForm {...guestForm} t={tProp} {unstyled} />
						{/if}
					{/if}
				{/if}
			</div>
		</div>
	{/if}
</div>
