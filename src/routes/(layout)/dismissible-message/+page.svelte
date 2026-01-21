<script lang="ts">
	import { Button, DismissibleMessage, FieldSelect } from "$lib/index.js";
	import type { TW_COLORS } from "$lib/types.js";
	import { dummySentence } from "../../_utils/dummy-text.js";

	let message = $state("");
	let theme = $state<TW_COLORS>();
</script>

<div>
	<DismissibleMessage {message} {theme} />
	<!-- --color-dismiss-bg="var(--color-red-500)" -->

	<FieldSelect
		bind:value={theme}
		class="inline-block"
		renderSize="sm"
		options={[
			"",
			"amber",
			"blue",
			"cyan",
			"emerald",
			"fuchsia",
			"gray",
			"green",
			"indigo",
			"lime",
			"neutral",
			"orange",
			"pink",
			"purple",
			"red",
			"rose",
			"sky",
			"slate",
			"stone",
			"teal",
			"violet",
			"yellow",
			"zinc",
		]}
	/>

	<Button onclick={() => (message = dummySentence(5))}>create</Button>
</div>
