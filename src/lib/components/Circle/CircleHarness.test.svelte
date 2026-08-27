<!--
	TEST-ONLY harness (not a real component, not exported, excluded from the
	published package via the `*.test.*` rule in package.json `files`). It exists
	because `rerender` re-seeds the whole props object, which invalidates every prop
	read and therefore rebuilds Circle's svg even for a value that should travel
	through the helper's setters. Driving the props from local `$state` instead
	invalidates only the one that changed - which is the only way to observe the
	"update in place vs rebuild" split this component is built around.
-->
<script lang="ts">
	import Circle from "./Circle.svelte";

	let completeness = $state(0.25);
	let rotate = $state(-90);
	let strokeWidth = $state(10);
	let bgStrokeColor = $state("");
</script>

<Circle {completeness} {rotate} {strokeWidth} {bgStrokeColor} />

<!-- setter path: must NOT rebuild the svg -->
<button type="button" data-testid="set-completeness" onclick={() => (completeness = 0.75)}
	>completeness</button
>
<button type="button" data-testid="set-rotate" onclick={() => (rotate = 45)}
	>rotate</button
>

<!-- structural path: rebuilds the svg -->
<button type="button" data-testid="set-stroke-width" onclick={() => (strokeWidth = 24)}
	>strokeWidth</button
>
<button type="button" data-testid="set-track" onclick={() => (bgStrokeColor = "red")}
	>track</button
>
