<script lang="ts">
	import {
		ContactUsForm,
		createEmptyContactFormData,
		type ContactFormData,
		type ContactBotCheck,
		type ContactFieldConfig,
	} from "$lib/index.js";
	import FieldSwitch from "$lib/components/Input/FieldSwitch.svelte";
	import FieldCheckbox from "$lib/components/Input/FieldCheckbox.svelte";

	// --- Interactive demo state ---
	let formData = $state<ContactFormData>(createEmptyContactFormData());
	let isSubmitting = $state(false);
	let submitCount = $state(0);
	let lastSubmittedData = $state<ContactFormData | null>(null);
	let lastBotCheck = $state<ContactBotCheck | null>(null);

	function handleSubmit(data: ContactFormData, botCheck: ContactBotCheck) {
		submitCount++;
		lastSubmittedData = JSON.parse(JSON.stringify(data));
		lastBotCheck = botCheck;
		isSubmitting = true;
		setTimeout(() => {
			isSubmitting = false;
		}, 1200);
	}

	// --- Controls ---
	let showName = $state(true);
	let requireName = $state(true);
	let showPhone = $state(false);
	let showSubject = $state(true);
	let requireSubject = $state(false);
	let useSubjectDropdown = $state(false);
	let showCompany = $state(false);

	const sampleSubjects = ["General enquiry", "Sales", "Support", "Feedback"];
	let showExtraFields = $state(false);
	let showExtraSlot = $state(false);
	let useHoneypot = $state(true);
	let useTimeTrap = $state(true);
	let timeTrapMinMs = $state(2000);
	let showExternalErrors = $state(false);
	let showGeneralError = $state(false);

	const sampleExtraFields: ContactFieldConfig[] = [
		{
			name: "orderId",
			label: "Order number",
			autocomplete: "off",
			position: "top",
		},
		{
			name: "website",
			label: "Your website",
			type: "url",
			position: "bottom",
			validate: (v) => {
				const s = String(v ?? "").trim();
				if (!s) return;
				return /^https?:\/\//.test(s) ? undefined : "Must start with http(s)://";
			},
		},
	];

	let externalErrorsComputed = $derived(
		showExternalErrors
			? [{ field: "email", message: "We can't accept submissions from this address" }]
			: []
	);

	let generalError = $derived(
		showGeneralError ? "Something went wrong — please try again." : undefined
	);
</script>

<h1 class="text-2xl font-bold mb-2">ContactUsForm</h1>
<p class="text-sm opacity-60 mb-8 max-w-2xl">
	Drop-in contact form built from the <code>Field*</code> primitives. Renders only
	<strong>Email + Message</strong> by default; everything else is opt-in. Ships with two
	server-less anti-bot primitives (<code>Honeypot</code> + <code>TimeTrap</code>) that are
	<strong>report-only</strong> — the form never blocks, it hands you a
	<code>botCheck</code>
	as the second argument to <code>onSubmit</code> to enforce server-side.
</p>

<!-- ============== INTERACTIVE DEMO ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Interactive</h2>
	<p class="text-sm opacity-60 mb-4">
		Toggle fields and bot protection, then submit. Submit quickly (under
		<code>{timeTrapMinMs}ms</code>) to see <code>isTooFast</code> trip.
	</p>

	<div class="max-w-sm mb-4 space-y-2">
		<FieldSwitch
			bind:checked={showName}
			label="Show name"
			name="show-name"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={requireName}
			label="Require name"
			name="require-name"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={showPhone}
			label="Show phone"
			name="show-phone"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={showSubject}
			label="Show subject"
			name="show-subject"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={requireSubject}
			label="Require subject"
			name="require-subject"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={useSubjectDropdown}
			label="Subject as dropdown (subjectValues)"
			name="use-subject-dropdown"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={showCompany}
			label="Show company"
			name="show-company"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={showExtraFields}
			label="Show extraFields (orderId / website)"
			name="show-extra-fields"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={showExtraSlot}
			label="Show extraFieldsSlot (consent checkbox)"
			name="show-extra-slot"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={useHoneypot}
			label="Use honeypot"
			name="use-honeypot"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={useTimeTrap}
			label="Use time-trap"
			name="use-time-trap"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={showExternalErrors}
			label="Inject field error (email)"
			name="show-external-errors"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={showGeneralError}
			label="Show general error"
			name="show-general-error"
			renderSize="sm"
		/>
	</div>

	{#if submitCount > 0}
		<p class="text-sm mb-4">
			Submitted <strong>{submitCount}</strong> time{submitCount === 1 ? "" : "s"}
		</p>
	{/if}

	<div class="max-w-lg">
		<ContactUsForm
			bind:formData
			onSubmit={handleSubmit}
			{isSubmitting}
			{showName}
			{requireName}
			{showPhone}
			{showSubject}
			{requireSubject}
			subjectValues={useSubjectDropdown ? sampleSubjects : undefined}
			{showCompany}
			{useHoneypot}
			{useTimeTrap}
			{timeTrapMinMs}
			errors={externalErrorsComputed}
			error={generalError}
			extraFields={showExtraFields ? sampleExtraFields : undefined}
			extraFieldsSlot={showExtraSlot ? consentSlot : undefined}
		>
			{#snippet footer()}
				<div class="text-center text-sm opacity-60 pt-2">
					Prefer email? <a class="underline" href="mailto:hello@example.com"
						>hello@example.com</a
					>
				</div>
			{/snippet}
		</ContactUsForm>
	</div>

	{#if lastBotCheck}
		<div class="mt-4">
			<h3 class="text-sm font-semibold mb-1">
				Last <code>botCheck</code> (you'd enforce this server-side):
			</h3>
			<pre
				class={[
					"text-xs p-3 rounded-md overflow-x-auto",
					lastBotCheck.isLikelyBot ? "bg-destructive/10 text-destructive" : "bg-muted",
				]}>{JSON.stringify(lastBotCheck, null, 2)}</pre>
		</div>
	{/if}

	{#if lastSubmittedData}
		<div class="mt-4">
			<h3 class="text-sm font-semibold mb-1">Last submitted data:</h3>
			<pre class="text-xs bg-muted p-3 rounded-md overflow-x-auto">{JSON.stringify(
					lastSubmittedData,
					null,
					2
				)}</pre>
		</div>
	{/if}

	<div class="mt-4">
		<h3 class="text-sm font-semibold mb-1">Live formData:</h3>
		<pre class="text-xs bg-muted p-3 rounded-md overflow-x-auto">{JSON.stringify(
				formData,
				null,
				2
			)}</pre>
	</div>
</section>

<!-- ============== BASIC (MINIMAL PROPS) ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Basic (minimal props)</h2>
	<p class="text-sm opacity-60 mb-4">
		Only <code>onSubmit</code> provided — renders Email + Message, honeypot and time-trap on
		by default.
	</p>

	<div class="max-w-lg">
		<ContactUsForm
			onSubmit={(data, botCheck) =>
				alert("Submitted: " + data.email + "\nisLikelyBot: " + botCheck.isLikelyBot)}
		/>
	</div>
</section>

<!-- ============== STANDARD LAYOUT (+ email fallback in footer) ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Standard layout</h2>
	<p class="text-sm opacity-60 mb-4">
		Name + Subject added via toggles — the most common contact-form shape. The
		<code>footer</code> snippet exposes a fallback <code>mailto:</code> for people who'd rather
		use their own email client.
	</p>

	<div class="max-w-lg">
		<ContactUsForm
			onSubmit={(data) => alert("Submitted: " + data.email)}
			showName
			showSubject
			requireSubject
		>
			{#snippet footer()}
				<p class="text-center text-sm opacity-60 pt-2">
					Prefer email? <a class="underline" href="mailto:hello@example.com"
						>hello@example.com</a
					>
				</p>
			{/snippet}
		</ContactUsForm>
	</div>
</section>

<!-- ============== SUBJECT DROPDOWN ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Subject as a dropdown</h2>
	<p class="text-sm opacity-60 mb-4">
		Passing <code>subjectValues</code> renders the Subject as a
		<code>&lt;select&gt;</code> (auto-shown, with a prepended "Select…" prompt). The bound
		value is still the chosen string in <code>formData.subject</code>.
	</p>

	<div class="max-w-lg">
		<ContactUsForm
			onSubmit={(data) => alert("Subject: " + data.subject + "\nEmail: " + data.email)}
			requireSubject
			subjectValues={sampleSubjects}
		/>
	</div>
</section>

<!-- ============== UNSTYLED ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Unstyled</h2>
	<p class="text-sm opacity-60 mb-4">
		With <code>unstyled</code> — no contact-form-specific CSS classes applied.
	</p>

	<div class="max-w-lg">
		<ContactUsForm
			unstyled
			class="space-y-4"
			onSubmit={(data) => alert("Submitted: " + data.email)}
		/>
	</div>
</section>

{#snippet consentSlot({
	formData,
	fieldError,
}: {
	formData: ContactFormData;
	fieldError: (name: string) => string | undefined;
})}
	<div class="mt-2">
		<FieldCheckbox
			checked={formData.extra?.consent === true}
			onchange={(e) => {
				if (!formData.extra) formData.extra = {};
				formData.extra.consent = (e.currentTarget as HTMLInputElement).checked;
			}}
			label="I agree to be contacted about my enquiry"
			name="contact-consent"
		/>
		{#if fieldError("consent")}
			<div class="text-xs text-destructive mt-1">{fieldError("consent")}</div>
		{/if}
	</div>
{/snippet}
