<script lang="ts" module>
	import type { THC } from "../../components/Thc/Thc.svelte";

	export interface Props {
		thc: THC;
	}
</script>

<script lang="ts">
	import Thc from "../../components/Thc/Thc.svelte";

	let { thc }: Props = $props();
</script>

<Thc {thc} />
