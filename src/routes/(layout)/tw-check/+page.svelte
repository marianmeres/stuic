<script lang="ts">
	import { TwCheck } from "$lib/index.js";
</script>

<h1 class="mb-4">Customization using different strategies</h1>

<!-- 1. default styles (uses theme tokens) -->
<TwCheck>default (theme primary)</TwCheck>

<!-- 2. manual tw class override -->
<TwCheck class="bg-green-600">green (defined as tailwind class)</TwCheck>

<!-- 3. manual css var prop -->
<TwCheck --stuic-twcheck-bg="var(--color-blue-600)" --stuic-twcheck-text="white">
	blue (css vars as )
</TwCheck>

<!-- 4. theme prop -->
<TwCheck theme="amber">amber (theme)</TwCheck>
<TwCheck theme="rose">rose (theme)</TwCheck>
