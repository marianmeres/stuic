<script lang="ts">
	import { TwCheck } from "$lib/index.js";

	const cssVarViolet = "var(--color-violet-600)";
</script>

<h1 class="mb-4">Customization using different strategies</h1>

<!-- 1. default styles -->
<TwCheck>red</TwCheck>

<!-- 2. manual tw class: !important is needed... not nice, but acceptable -->
<TwCheck class="bg-green-600">green</TwCheck>

<!-- 3. manual css var prop -->
<TwCheck --stuic-twcheck-bg="var(--color-blue-600)">blue</TwCheck>
<TwCheck --stuic-twcheck-bg={cssVarViolet}>violet</TwCheck>

<!-- 4. theme -->
<TwCheck theme="amber">amber</TwCheck>
