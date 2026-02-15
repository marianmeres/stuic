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
	import type { NotificationsStack } from "../Notifications/notifications-stack.svelte.js";

	export interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		/** Cart items to display in the cart review */
		items: CartComponentItem[];

		/** Whether the step is in loading state (shows skeletons) */
		isLoading?: boolean;

		/** Error message to display */
		error?: string | null;

		// -- Progress --

		/** Hide the built-in progress indicator (e.g. when rendered externally) */
		hideProgress?: boolean;

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
			socialLogins?: Snippet;
			socialDividerLabel?: string | false;
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

		/** Optional notifications instance — errors will be sent via notifications.error() */
		notifications?: NotificationsStack;

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
	import CheckoutGuestOrLoginForm from "./CheckoutGuestOrLoginForm.svelte";
	import DismissibleMessage from "../DismissibleMessage/DismissibleMessage.svelte";
	import Skeleton from "../Skeleton/Skeleton.svelte";

	let {
		items,
		isLoading = false,
		error,
		notifications,
		hideProgress = false,
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

	$effect(() => {
		if (error && notifications) notifications.error(error);
	});

	let _class = $derived(
		unstyled ? classProp : twMerge("stuic-checkout-review-step", classProp)
	);
</script>

<div bind:this={el} class={_class} {...rest}>
	<!-- Progress -->
	{#if !hideProgress}
		<CheckoutProgress
			{steps}
			{currentStep}
			onNavigate={onStepNavigate}
			t={tProp}
			{unstyled}
		/>
	{/if}

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
					<CheckoutGuestOrLoginForm
						{guestForm}
						{loginForm}
						{formMode}
						{guestTabLabel}
						{loginTabLabel}
						heading={t("checkout.step.contact_title")}
						{notifications}
						t={tProp}
						{unstyled}
					/>
				{/if}
			</div>
		</div>
	{/if}
</div>
