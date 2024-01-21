<script lang="ts">
	import Switch from '../../lib/components/Switch/Switch.svelte';

	export let context: any = {};
</script>

This content is rendered from and external component.
<Switch
	size="xs"
	on:change={({ detail }) => {
		context.result = detail ? 123 : '';
	}}
/>
{context?.result}
