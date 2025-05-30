<script lang="ts">
	import Button from "$lib/components/Button/Button.svelte";
	import FieldCheckbox from "$lib/components/Input/FieldCheckbox.svelte";
	import FieldFile from "$lib/components/Input/FieldFile.svelte";
	import FieldInput from "$lib/components/Input/FieldInput.svelte";
	import FieldLikeButton from "$lib/components/Input/FieldLikeButton.svelte";
	import FieldOptions from "$lib/components/Input/FieldOptions.svelte";
	import FieldRadios from "$lib/components/Input/FieldRadios.svelte";
	import FieldSelect from "$lib/components/Input/FieldSelect.svelte";
	import FieldSwitch from "$lib/components/Input/FieldSwitch.svelte";
	import FieldTextarea from "$lib/components/Input/FieldTextarea.svelte";
	import Fieldset from "$lib/components/Input/Fieldset.svelte";
	import { NotificationsStack, onSubmitValidityCheck, sleep } from "$lib/index.js";
	import { createClog } from "@marianmeres/clog";
	import { type Item } from "@marianmeres/item-collection";
	import { onMount } from "svelte";

	const clog = createClog("TestForm");

	let {
		notifications,
	}: {
		notifications: NotificationsStack;
	} = $props();

	let input = $state<HTMLInputElement>();
	let values = $state({
		input1: "",
		input2: "",
		check: true,
		range: 33,
		select: "",
		radio: "",
		field_like_hidden: "[1,2,3]",
		options: '[{"id":"initial"},{"id":"not listed"}]',
		switch: false,
	});
	$inspect("field_like_hidden", values.field_like_hidden);

	let labelLeft = $state(false);

	let f = $state<HTMLFormElement>()!;

	onMount(() => {
		function on_submit_valid(e: any) {
			clog.color("green")(
				"submit_valid handler",
				[...e.detail.formData.entries()],
				$state.snapshot(values)
			);
		}

		function on_submit_invalid(e: any) {
			clog.error("SUBMIT_INVALID handler", e.detail, $state.snapshot(values));
		}

		f.addEventListener("submit_valid", on_submit_valid);
		f.addEventListener("submit_invalid", on_submit_invalid);

		return () => {
			f.removeEventListener("submit_valid", on_submit_valid);
			f.removeEventListener("submit_invalid", on_submit_invalid);
		};
	});

	let files: FileList | undefined = $state();
	// $inspect("files", files);
</script>

<Button size="sm" class="border px-2" onclick={() => (labelLeft = !labelLeft)}
	>left/full</Button
>

<!--  -->
<!--  -->
<form
	bind:this={f}
	onsubmit={(e) => {
		clog("this will not be logged, because we have use:onSubmitValidityCheck");
	}}
	class="max-w-3xl"
	use:onSubmitValidityCheck
>
	<div class="space-y-6">
		<FieldInput
			bind:value={values.input1}
			bind:input
			label="Label as prop"
			name="input1"
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

		<FieldLikeButton
			bind:value={values.field_like_hidden}
			label="Field like button"
			required
			onclick={() => {
				values.field_like_hidden = prompt("Value? Valid JSON array required.") || "";
			}}
			{labelLeft}
			validate
			description="Any valid JSON should validate"
		/>

		<FieldOptions
			bind:value={values.options}
			label="Options selector"
			name="options"
			getOptions={async (s: string) => {
				s = s.trim();
				await sleep(500);
				if (!s) {
					return [
						{ id: "initial" },
						{ id: "foo" },
						{ id: "bar" },
						{ id: "baz" },
						{ id: "bat" },
						{ id: "hey" },
						{ id: "ho" },
						{ id: "lets" },
						{ id: "go" },
					];
				}
				let out: any[] = [s];
				out = s
					.trim()
					.split(" ")
					.map((v) => v.trim())
					.filter(Boolean)
					.map((v) => `x${v}`);
				// just to test error handling...
				if (out.includes("xxx")) {
					throw new Error("Boom");
				}
				return out.map((id) => ({ id })) as Item[];
			}}
			required
			{notifications}
			cardinality={5}
			validate={{
				customValidator(val, ctx, el) {
					// we know val is valid JSON ARRAY string here (no need to check)
					// also we know it satisfies the cardinality constraints
					const selected = JSON.parse(val);
					// custom validation: must not include "foo"
					return selected.includes("foo") ? "invalid" : "";
				},
			}}
			renderOptionLabel={(item) => `${item.id}`}
		/>

		<FieldSwitch
			bind:checked={values.switch}
			label="Do you agree?"
			name="swich"
			required
			description="some description"
			{labelLeft}
			validate={{
				customValidator(val, ctx, el) {
					// if (val && !/\d+/.test(val)) return "Numbers only";
					if (!(el as any).checked) return "You must agree before continue";
				},
			}}
		/>

		<FieldTextarea
			bind:value={values.input2}
			label="Big text"
			name="input2"
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
				name="check"
				required
				validate
				renderSize="sm"
			/>

			<FieldInput
				type="range"
				label="Hey ranger!"
				class="!mb-0"
				name="range"
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
				"go",
				"ho",
				{ label: "Let's", description: "Some desc" },
			]}
			required
			validate
			renderSize="md"
			name="radios"
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
			name="selector"
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
			name="select2"
			classInput="field-sizing-content"
			renderSize="sm"
		/>

		<FieldFile
			name="files"
			bind:files
			description="Hohoho"
			label="Click or drop"
			multiple
			validate={{
				customValidator(val, ctx, el) {
					// @ts-ignore
					if (el.files?.length > 2) return "Too many files. Max 2 allowed";
				},
			}}
			{labelLeft}
		/>
	</div>

	<div class="my-6 flex justify-between items-end">
		<Button type="submit">Proceed</Button>
	</div>
</form>

<hr />
<pre class="text-xs">{JSON.stringify(values, null, 2)}</pre>
<pre class="text-xs">{JSON.stringify(files, null, 2)}</pre>
