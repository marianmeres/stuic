<script lang="ts">
	/**
	 * One field inside an `{#if}`, taken away by something that is not a click, so the
	 * caret is still in it. `variant` picks the field:
	 *
	 * - `default`   `FieldInput` as shipped (`useTrim` and `validate` both default on)
	 * - `trim`      `validate={false}`  → only the `trim` action writes on `change`
	 * - `validate`  `useTrim={false}`   → only the `validate` action writes on `change`
	 * - `textarea`  `FieldTextarea` as shipped (the same two actions)
	 * - `child`     in a child component whose `customValidator` reads the child's `$derived`
	 * - `required`  `required`, for a synthetic `change` read back at once
	 * - `email`     `type="email"`, for a real edit committed by Tab
	 * - `rerun`     `validate` options that depend on the field's own value, so the
	 *               trim's write at commit re-runs the `validate` action
	 * - `typeahead` `useTypeahead` with an `onSubmit` that writes state, alone
	 */
	import FieldInput from "../components/Input/FieldInput.svelte";
	import FieldTextarea from "../components/Input/FieldTextarea.svelte";
	import Child from "./RemovedWhileFocusedChild.test.svelte";

	let {
		variant,
		onValidatorCall,
		onSubmitCall,
	}: {
		variant: string;
		onValidatorCall?: () => void;
		onSubmitCall?: (value: string) => void;
	} = $props();

	let show = $state(true);
	let value = $state("");
	let submitted = $state("");

	// A route change, a timer, a socket message: nothing here moves focus first.
	$effect(() => {
		const take = () => (show = false);
		window.addEventListener("take-away", take);
		return () => window.removeEventListener("take-away", take);
	});
</script>

{#if show}
	{#if variant === "trim"}
		<FieldInput label="Field" bind:value validate={false} data-testid="field" />
	{:else if variant === "validate"}
		<FieldInput label="Field" bind:value useTrim={false} data-testid="field" />
	{:else if variant === "textarea"}
		<FieldTextarea label="Field" bind:value data-testid="field" />
	{:else if variant === "child"}
		<Child {onValidatorCall} />
	{:else if variant === "required"}
		<FieldInput label="Field" bind:value required data-testid="field" />
	{:else if variant === "email"}
		<FieldInput label="Field" bind:value type="email" data-testid="field" />
	{:else if variant === "rerun"}
		<FieldInput
			label="Field"
			bind:value
			validate={{
				context: { value },
				customValidator: (v) => (v === "abc" ? "Taken" : ""),
			}}
			data-testid="field"
		/>
	{:else if variant === "typeahead"}
		<FieldInput
			label="Field"
			bind:value
			useTrim={false}
			validate={false}
			useTypeahead={{
				getOptions: async () => [],
				onSubmit: (v: string) => {
					onSubmitCall?.(v);
					submitted = v;
				},
			}}
			data-testid="field"
		/>
	{:else}
		<FieldInput label="Field" bind:value data-testid="field" />
	{/if}
{/if}
<p data-testid="value">{value}</p>
<p data-testid="submitted">{submitted}</p>
