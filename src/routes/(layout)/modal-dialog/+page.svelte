<script lang="ts">
	import {
		Button,
		ModalDialog,
		Notifications,
		NotificationsStack,
		X,
	} from "$lib/index.js";
	import { dummySentence, dummyText } from "../../_utils/dummy-text.js";

	let modal1 = $state<ModalDialog>();
	let modal2 = $state<ModalDialog>();
	let modal3 = $state<ModalDialog>();
	let modal4 = $state<ModalDialog>();

	const notifications = new NotificationsStack([], {
		defaultTtl: 2_000,
		// disposeInterval: 1_000,
	});
</script>

<p class="mb-4">General modal dialog (internally with dialog element implementation)</p>

<div class="flex gap-4">
	<Button onclick={modal1?.open} size="sm" class="shadow-none">first</Button>
	<Button onclick={modal3?.open} size="sm" class="shadow-none">third</Button>
	<Button onclick={modal4?.open} size="sm" class="shadow-none">4</Button>
</div>

<ModalDialog bind:this={modal1} class="p-4">
	<!-- <div class="inset-0 absolute overflow-auto bg-orange-200 p-4 text-black"> -->
	<Button onclick={modal1?.close} size="sm" class="mb-4">close</Button>
	<Button onclick={modal2?.open}>second</Button>

	<Button onclick={() => notifications.info(dummySentence(1))}>notif info</Button>
	<div>
		<input type="text" />
		{@html dummyText(20)}
	</div>
	<!-- </div> -->
</ModalDialog>

<ModalDialog bind:this={modal2} noEscapeClose class="bg-red-400 size-[200px] p-4">
	second with <code>noEscapeClose</code>
	<hr />
	<Button onclick={modal2.close} class="sm">close</Button>
</ModalDialog>

<ModalDialog bind:this={modal3} class="max-w-xl max-h-[350px] border rounded-lg">
	<div class="content-box class-must-be-ignored">
		third
		<input type="text" />
	</div>
</ModalDialog>

<ModalDialog bind:this={modal4} class="">I am in modal 4</ModalDialog>

<Notifications {notifications} />
