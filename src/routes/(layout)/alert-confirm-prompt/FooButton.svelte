<script lang="ts">
	import type { Snippet } from "svelte";
	import Button from "../../../lib/components/Button/Button.svelte";
	let { children }: { children?: Snippet } = $props();
</script>

<Button>FOO: {@render children?.()}</Button>
