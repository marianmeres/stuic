<script lang="ts">
	import { Button, ModalDialog } from "$lib/index.js";
	import { dummyText } from "../../_utils/dummy-text.js";

	let visible = $state(false);
	const close = () => (visible = false);

	let visible2 = $state(false);
	// $inspect("page visible", visible);
</script>

<Button onclick={() => (visible = true)} size="sm" class="shadow-none">open</Button>
(current: {visible})

<ModalDialog bind:visible class="">
	<div class="absolute inset-4 overflow-hidden rounded-md">
		<div class="bg-orange-200 p-4 overflow-auto inset-0 absolute">
			<Button onclick={close} size="sm" class="mb-4">close</Button>
			<Button onclick={() => (visible2 = true)}>second</Button>
			{@html dummyText(10)}
		</div>
	</div>
</ModalDialog>

<ModalDialog bind:visible={visible2} noEscapeClose class="border w-[100px] bg-red-400/20">
	second
</ModalDialog>
