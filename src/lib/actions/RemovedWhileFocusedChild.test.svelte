<script lang="ts">
	/**
	 * A field whose `customValidator` reads a `$derived` of the component being destroyed.
	 * Nothing else reads `rule`, so every read after an edit re-executes it: the read
	 * Svelte warns about (`derived_inert`) once the component is on its way out.
	 */
	import FieldInput from "../components/Input/FieldInput.svelte";

	let { onValidatorCall }: { onValidatorCall?: () => void } = $props();

	let value = $state("");
	const rule = $derived(value.length > 100 ? "too long" : "");
</script>

<FieldInput
	label="Field"
	bind:value
	useTrim={false}
	validate={{
		customValidator: () => {
			onValidatorCall?.();
			return rule;
		},
	}}
	data-testid="field"
/>
