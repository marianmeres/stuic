<script lang="ts">
	import { Breakpoint } from "./breakpoint.svelte.js";

	// The shared singleton, read the way stuic's own components (DataTable, Cart,
	// FieldDateRange) read it: during component initialisation.
	const bp = Breakpoint.instance;
</script>

<span data-testid="md">{bp.md ? "md" : "below-md"}</span>
<span data-testid="current">{bp.current ?? "none"}</span>
