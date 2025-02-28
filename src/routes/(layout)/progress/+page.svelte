<script lang="ts">
	import { Progress } from "$lib/index.js";
</script>

<Progress progress={38} class="mb-4" />

<Progress
	progress={62}
	class="justify-end rounded-xl h-3"
	classBar="rounded-xl"
	--color-progress-accent="var(--color-amber-600)"
/>
