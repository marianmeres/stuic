<script lang="ts">
	import { ItemCollection, type Item } from "@marianmeres/item-collection";
	import { Button } from "../../../lib/index.js";
	import CommandMenu from "../../../lib/components/CommandMenu/CommandMenu.svelte";

	const itemIdPropName = "model_id";
	const OPTIONS = [
		{ model_id: "aaa" },
		{ model_id: "initial" },
		{ model_id: "foo" },
		{ model_id: "bar" },
		{ model_id: "baz" },
		{ model_id: "bat" },
		{ model_id: "hey" },
		{ model_id: "ho" },
		{ model_id: "xxx" },
		{ model_id: "lets" },
		{ model_id: "GO" },
	];

	let command = $state<CommandMenu>()!;
	let value = $state();

	async function getOptions(s: string, current: Item[]) {
		const all = new ItemCollection([...OPTIONS], { idPropName: itemIdPropName });
		return Promise.resolve(all.items);
	}
</script>

<Button onclick={() => command.open()}>Click</Button>

<CommandMenu bind:value bind:this={command} {getOptions} />
