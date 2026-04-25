<script lang="ts">
	import { OtpInput } from "$lib/index.js";
	import Button from "$lib/components/Button/Button.svelte";
	import FieldSwitch from "$lib/components/Input/FieldSwitch.svelte";

	let value1 = $state("");
	let lastComplete1 = $state<string | null>(null);

	let value2 = $state("");
	let length2 = $state(4);

	let value3 = $state("");

	let value4 = $state("ABC123");

	let showError = $state(false);
	let showDisabled = $state(false);
	let showUnstyled = $state(false);
</script>

<h1 class="text-2xl font-bold mb-8">OtpInput</h1>

<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Default (numeric, length 6)</h2>
	<p class="text-sm opacity-60 mb-4">
		Type or paste a 6-digit code. Auto-advances on input, distributes pasted strings from
		slot 0, fires <code>onComplete</code> when full.
	</p>

	<div class="max-w-sm mb-4 space-y-2">
		<FieldSwitch
			bind:checked={showError}
			label="Error state"
			name="otp-error"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={showDisabled}
			label="Disabled"
			name="otp-disabled"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={showUnstyled}
			label="Unstyled (no built-in CSS)"
			name="otp-unstyled"
			renderSize="sm"
		/>
	</div>

	<div class="mb-4">
		<OtpInput
			bind:value={value1}
			error={showError}
			disabled={showDisabled}
			unstyled={showUnstyled}
			onComplete={(c) => (lastComplete1 = c)}
		/>
	</div>

	<div class="grid grid-cols-2 gap-3 mt-3">
		<div>
			<h3 class="text-sm font-semibold mb-1">Live value</h3>
			<pre class="text-xs bg-muted p-3 rounded-md">{JSON.stringify(value1)}</pre>
		</div>
		<div>
			<h3 class="text-sm font-semibold mb-1">Last onComplete</h3>
			<pre
				class="text-xs bg-muted p-3 rounded-md">{JSON.stringify(lastComplete1)}</pre>
		</div>
	</div>

	<div class="mt-3 flex gap-2">
		<Button size="sm" onclick={() => (value1 = "")}>Clear</Button>
		<Button size="sm" onclick={() => (value1 = "123456")}>Set "123456"</Button>
	</div>
</section>

<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Variable length</h2>
	<p class="text-sm opacity-60 mb-4">
		Slot count is configurable via <code>length</code>.
	</p>
	<div class="flex gap-3 items-center mb-4">
		<Button size="sm" onclick={() => (length2 = 4)}>length=4</Button>
		<Button size="sm" onclick={() => (length2 = 6)}>length=6</Button>
		<Button size="sm" onclick={() => (length2 = 8)}>length=8</Button>
	</div>
	<OtpInput bind:value={value2} length={length2} autoFocus={false} />
	<pre class="text-xs bg-muted p-3 rounded-md mt-3">{JSON.stringify({
			length: length2,
			value: value2,
		})}</pre>
</section>

<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Alphanumeric mode</h2>
	<p class="text-sm opacity-60 mb-4">
		<code>mode="alphanumeric"</code> allows letters as well as digits.
	</p>
	<OtpInput bind:value={value3} mode="alphanumeric" length={6} autoFocus={false} />
	<pre class="text-xs bg-muted p-3 rounded-md mt-3">{JSON.stringify(value3)}</pre>
</section>

<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Pre-filled value</h2>
	<p class="text-sm opacity-60 mb-4">
		Bindable <code>value</code> can be set externally to seed slots.
	</p>
	<OtpInput bind:value={value4} mode="alphanumeric" length={6} autoFocus={false} />
	<pre class="text-xs bg-muted p-3 rounded-md mt-3">{JSON.stringify(value4)}</pre>
</section>
