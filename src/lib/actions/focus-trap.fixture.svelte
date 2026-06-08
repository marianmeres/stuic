<script lang="ts">
	import { focusTrap } from "./focus-trap.js";

	let {
		enabled = true,
		autoFocusFirst = true,
	}: { enabled?: boolean; autoFocusFirst?: boolean } = $props();
</script>

<!-- A minimal focusable set to exercise the trap's auto-focus + Tab wrap-around. -->
<div use:focusTrap={{ enabled, autoFocusFirst }} data-testid="trap">
	<button data-testid="first">First</button>
	<input data-testid="middle" type="text" />
	<button data-testid="last">Last</button>
</div>
<button data-testid="outside">Outside</button>
