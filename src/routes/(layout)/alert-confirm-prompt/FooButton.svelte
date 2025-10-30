<script lang="ts">
	import Button from "../../../lib/components/Button/Button.svelte";
	let { children } = $props();
</script>

<Button>FOO: {@render children?.()}</Button>
