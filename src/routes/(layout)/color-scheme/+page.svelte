<script>
	import { ColorScheme } from "$lib/index.js";
</script>

<div
	class="
        p-4
        border
        bg-neutral-50 text-neutral-950 border-neutral-950/10
        dark:bg-neutral-900 dark:text-neutral-50 dark:border-neutral-50/20
    "
>
	Check header above. You can also
	<button class="underline" on:click={ColorScheme.reset}>reset</button>.
</div>
