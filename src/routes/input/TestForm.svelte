<script lang="ts">
	import { writable } from 'svelte/store';
	import { createClog } from '@marianmeres/clog';
	import {
		Button,
		Field,
		FieldCheckbox,
		FieldRadios,
		FieldSelect,
		Fieldset,
	} from '../../lib/index.js';

	const clog = createClog('TestForm');

	const formData = writable({
		large: '',
		normal: '',
		small: '',
		textarea: '',
		checkbox: false,
		radio: 'Hey',
		select: '',
	});

	$: clog($formData);
</script>

<form
	on:submit|preventDefault={() => {
		clog(123);
	}}
	class="max-w-2xl"
>
	<div class="space-y-6">
		<Field
			type="text"
			bind:value={$formData.large}
			label="Large input"
			placeholder="Hey"
			required
			validate
			size="lg"
		/>
		<Field
			type="text"
			bind:value={$formData.normal}
			label="Normal input"
			placeholder="Ho"
			description="Let's go"
		/>
		<Field
			size="sm"
			type="text"
			bind:value={$formData.small}
			label="Smaller input"
			placeholder="example.com"
			required
			validate
		>
			<svelte:fragment slot="input_before">
				<span class="opacity-50 ml-2 -mr-2 pointer-events-none text-xs tracking-tight">
					https://
				</span>
			</svelte:fragment>
		</Field>

		<Fieldset legend="Hey ho">
			<FieldCheckbox
				label="I agree with all of it"
				bind:checked={$formData.checkbox}
				validate
				description="And even more"
			/>

			<Field
				type="textarea"
				class="mb-0"
				bind:value={$formData.textarea}
				label="Foo"
				required
				validate={{
					customValidator: (v, ctx) => {
						if (!/bar/.test(v)) return 'Must include "bar"!';
					},
				}}
			>
				<svelte:fragment slot="input_before">
					<span class="opacity-25 ml-2">BFR</span>
				</svelte:fragment>
				<!-- <svelte:fragment slot="input_below">
					<span class="opacity-25 p-2">kokos</span>
				</svelte:fragment> -->
			</Field>
		</Fieldset>

		<Fieldset legend="Hey ho">
			<FieldRadios
				class="grid grid-cols-2 sm:grid-cols-4"
				bind:value={$formData.radio}
				options={['Hey', 'ho', "Let's", 'go']}
			/>
		</Fieldset>

		<FieldSelect
			label="Select"
			bind:value={$formData.select}
			options={['Hey', 'ho', "Let's", 'go']}
			required
			validate={{
				customValidator: (v, ctx) => (/ho/.test(v) ? '' : 'Wrong answer!'),
			}}
		>
			<svelte:fragment slot="input_before">
				<span class="opacity-25 ml-2">BFR</span>
			</svelte:fragment>
			<svelte:fragment slot="input_after">
				<span class="opacity-25 mr-2">AFT</span>
			</svelte:fragment>
		</FieldSelect>
	</div>

	<div class="mt-12 flex justify-between items-end">
		<Button variant="primary" type="submit">Proceed</Button>
	</div>
</form>
