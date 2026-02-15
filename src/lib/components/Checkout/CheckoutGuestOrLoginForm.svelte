<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { TranslateFn } from "../../types.js";
	import type { Props as GuestFormProps } from "./CheckoutGuestForm.svelte";
	import type { Props as LoginFormProps } from "./CheckoutLoginForm.svelte";

	export type FormMode = "guest-only" | "login-only" | "tabbed" | "stacked";

	export interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		/** Guest form configuration. Required for "guest-only", "tabbed", "stacked" modes. */
		guestForm?: Omit<GuestFormProps, "t" | "unstyled" | "class" | "el">;

		/** Login form configuration. Required for "login-only", "tabbed", "stacked" modes. */
		loginForm?: Omit<LoginFormProps, "t" | "unstyled" | "class" | "el">;

		/**
		 * How to display the forms.
		 * - "guest-only": Only show guest form
		 * - "login-only": Only show login form
		 * - "tabbed": Show guest and login with pill-style tab switcher (default)
		 * - "stacked": Show both forms stacked vertically with a divider
		 */
		formMode?: FormMode;

		/** Tab label for the guest form tab. Default from i18n. */
		guestTabLabel?: string;

		/** Tab label for the login form tab. Default from i18n. */
		loginTabLabel?: string;

		/** Bindable active tab: "guest" or "login". Default: "guest" */
		activeTab?: "guest" | "login";

		/** Optional heading rendered above the switcher/forms */
		heading?: Snippet | string;

		t?: TranslateFn;
		unstyled?: boolean;
		class?: string;
		el?: HTMLDivElement;

		//
		hLevel?: HLevel;
		hRenderLevel?: HLevel;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import { t_default } from "./_internal/checkout-i18n-defaults.js";
	import CheckoutGuestForm from "./CheckoutGuestForm.svelte";
	import CheckoutLoginForm from "./CheckoutLoginForm.svelte";
	import TabbedMenu from "../TabbedMenu/TabbedMenu.svelte";
	import { H, type HLevel } from "../H/index.js";
	import CheckoutSectionHeader from "./CheckoutSectionHeader.svelte";

	let {
		guestForm,
		loginForm,
		formMode = "tabbed",
		guestTabLabel,
		loginTabLabel,
		activeTab = $bindable("guest"),
		heading,
		t: tProp,
		unstyled = false,
		class: classProp,
		el = $bindable(),
		hLevel = 3,
		hRenderLevel = 3,
		...rest
	}: Props = $props();

	let t = $derived(tProp ?? t_default);

	let tabItems = $derived([
		{ id: "guest", label: guestTabLabel ?? t("checkout.guest_or_login.guest_tab") },
		{ id: "login", label: loginTabLabel ?? t("checkout.guest_or_login.login_tab") },
	]);

	let _class = $derived(
		unstyled ? classProp : twMerge("stuic-checkout-guest-or-login-form", classProp)
	);
</script>

<div bind:this={el} class={_class} {...rest}>
	<!-- Optional heading -->
	{#if heading}
		<!-- <div class={unstyled ? undefined : "stuic-checkout-guest-or-login-heading"}> -->
		<CheckoutSectionHeader>
			{#if typeof heading === "string"}
				<H level={hLevel} renderLevel={hRenderLevel}>
					{heading}
				</H>
			{:else}
				{@render heading()}
			{/if}
		</CheckoutSectionHeader>
		<!-- </div> -->
	{/if}

	{#if formMode === "guest-only"}
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
			value={activeTab}
			onSelect={(item) => {
				activeTab = item.id as "guest" | "login";
			}}
			{unstyled}
			class={unstyled ? undefined : "stuic-checkout-guest-or-login-tabs"}
		/>
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
		<div class={unstyled ? undefined : "stuic-checkout-guest-or-login-divider"}>
			<span>{t("checkout.step.or_divider")}</span>
		</div>
		{#if guestForm}
			<CheckoutGuestForm {...guestForm} t={tProp} {unstyled} />
		{/if}
	{/if}
</div>
