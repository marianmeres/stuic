<script lang="ts">
	import { createClog } from "@marianmeres/clog";
	import FieldInput from "$lib/components/Input/FieldInput.svelte";
	import Button from "$lib/components/Button/Button.svelte";
	import FieldTextarea from "$lib/components/Input/FieldTextarea.svelte";
	import Fieldset from "$lib/components/Input/Fieldset.svelte";
	import FieldCheckbox from "$lib/components/Input/FieldCheckbox.svelte";
	import FieldSelect from "$lib/components/Input/FieldSelect.svelte";
	import FieldRadios from "$lib/components/Input/FieldRadios.svelte";

	const clog = createClog("TestForm");

	let input = $state<HTMLInputElement>();
	let values = $state({
		input1: "",
		input2: "",
		check: true,
		range: 33,
		select: "",
		radio: "",
	});

	let labelLeft = $state(false);
</script>

<Button size="sm" class="border px-2" onclick={() => (labelLeft = !labelLeft)}
	>left/full</Button
>

<form
	onsubmit={(e) => {
		e.preventDefault();
		clog($state.snapshot(values));
	}}
	class="max-w-3xl my-4"
>
	<div class="space-y-6">
		<FieldInput
			bind:value={values.input1}
			bind:input
			label="Label as prop"
			required
			{labelLeft}
			placeholder="This is some placeholder"
			--color-input-accent="var(--color-violet-800)"
			labelLeftWidth="wide"
			labelLeftBreakpoint={480}
			validate={{
				customValidator(val, ctx, el) {
					if (val && !/\d+/.test(val)) return "Numbers only";
				},
			}}
		>
			{#snippet labelAfter({ id })}
				la
			{/snippet}
			{#snippet inputBefore({ id })}
				<span class="flex flex-col justify-center">input-before</span>
			{/snippet}
			{#snippet inputAfter({ id })}
				input-after
			{/snippet}
			{#snippet description({ id })}
				some description for {id}
			{/snippet}
			{#snippet below({ id })}
				below for {id}
			{/snippet}
		</FieldInput>

		<FieldTextarea
			bind:value={values.input2}
			label="Big text"
			required
			validate
			description="inline description"
			{labelLeft}
		/>

		<Fieldset
			legend="Hey ho"
			class="bg-green-200 border-black dark:bg-transparent"
			classLegend="bg-white dark:bg-transparent border rounded text-sm"
		>
			<FieldCheckbox
				bind:checked={values.check}
				label="Some super label"
				description="Some longer description"
				required
				validate
				renderSize="sm"
			/>

			<FieldInput
				type="range"
				label="Hey ranger!"
				class="mb-0"
				min="0"
				max="100"
				bind:value={values.range}
				--color-input-accent="var(--color-violet-600)"
				validate={{
					customValidator(val, ctx, el) {
						const n = parseInt(val);
						if (n < 75) return "Gimme some more!";
					},
				}}
			>
				{#snippet inputAfter({ id })}
					<span class="flex flex-col justify-center items-center w-10 -ml-2">
						{values.range}
					</span>
				{/snippet}
			</FieldInput>
		</Fieldset>

		<FieldRadios
			class="sm:grid-cols-2"
			bind:value={values.radio}
			options={[
				{
					value: "first",
					label: "Radio buttons are similar to checkboxes",
					description:
						"Where multiple same-named controls exist, radio buttons allow one...",
				},
				"ho",
				{ label: "Let's", description: "Some desc" },
				"go",
			]}
			required
			validate
			renderSize="md"
		/>

		<FieldSelect
			options={[
				{ label: "Hey", optgroup: "first optgroup" },
				"ho",
				{ label: "Let's" },
				{ label: "go", optgroup: "second optgroup" },
				"A long or short placeholder will change the intrinsic size of inputs...",
			]}
			bind:value={values.select}
			label="Selector"
			required
			validate={{
				customValidator(val, ctx, el) {
					if (val && !/ho/i.test(val)) return "Ho ho ho!";
				},
			}}
			{labelLeft}
			description="Some boring description"
		/>

		<FieldSelect
			options={[
				"foo",
				"bar",
				"A long or short placeholder will change the intrinsic size of inputs...",
			]}
			class="inline-block"
			classInput="field-sizing-content"
			renderSize="sm"
		/>
	</div>

	<div class="my-6 flex justify-between items-end">
		<Button type="submit">Proceed</Button>
	</div>
</form>

<hr />
<pre class="text-xs">{JSON.stringify(values, null, 2)}</pre>
