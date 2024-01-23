<script lang="ts">
	import { writable } from 'svelte/store';
	import DismissibleMessage from '../../lib/components/DismissibleMessage/DismissibleMessage.svelte';
	import Layout from '../_components/Layout.svelte';
	import { dummySentence } from '../_utils/dummy-text';

	const themes = [
		'primary',
		'secondary',
		//
		'slate',
		'gray',
		'zinc',
		'neutral',
		'stone',
		'red',
		'orange',
		'amber',
		'yellow',
		'lime',
		'green',
		'emerald',
		'teal',
		'cyan',
		'sky',
		'blue',
		'indigo',
		'violet',
		'purple',
		'fuchsia',
		'pink',
		'rose',
	];

	const signal = writable(0);

	let message = '';
</script>

<Layout>
	{#if $signal}
		{#each themes as theme}
			<DismissibleMessage message={`[${theme}] ` + dummySentence(4)} {theme} />
		{/each}
	{/if}

	<button on:click={() => ($signal = Date.now())}>create all</button>

	<hr class="my-8" />
	<div class="max-w-lg">
		<DismissibleMessage {message} />
	</div>
	<button on:click={() => (message = dummySentence(5))}>create one</button>
</Layout>
