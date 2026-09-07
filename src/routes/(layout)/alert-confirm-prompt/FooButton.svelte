<script lang="ts">
	import Button, {
		type Props as ButtonProps,
	} from "../../../lib/components/Button/Button.svelte";

	// A custom `CmpButtonOk`/`CmpButtonCancel`/`CmpButtonCustom` must FORWARD what the
	// dialog passes it onto the real button: `onclick` (without it the button cannot
	// answer the dialog at all), `disabled` (the pending state while an async `onOk` is
	// in flight), the merged `class`/`intent`, and `el` (the prompt's Enter key focuses
	// and clicks it). Wrapping only `children` renders a button that looks right and
	// does nothing.
	let { children, el = $bindable(), ...rest }: ButtonProps = $props();
</script>

<Button bind:el {...rest}>FOO: {@render children?.({})}</Button>
