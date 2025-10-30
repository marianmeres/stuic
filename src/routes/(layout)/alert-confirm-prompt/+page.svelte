<script lang="ts">
	import AlertConfirmPrompt from "$lib/components/AlertConfirmPrompt/AlertConfirmPrompt.svelte";
	import {
		AlertConfirmPromptStack,
		Button,
		createAlert,
		createConfirm,
		createPrompt,
		sleep,
		type FnOnCancel,
		type FnOnCustom,
		type FnOnEscape,
		type FnOnOK,
	} from "$lib/index.js";
	import { tick } from "svelte";
	import { dummySentence, dummyText } from "../../_utils/dummy-text.js";
	import FooButton from "./FooButton.svelte";

	const acp = new AlertConfirmPromptStack();
	const alert = createAlert(acp);
	const confirm = createConfirm(acp, { forceAsHtml: true });
	const prompt = createPrompt(acp);

	const onOk: FnOnOK = async (val: any) => {
		console.log("onOk", val);
		await sleep(1_000);
		acp.shift();
	};

	const onCancel: FnOnCancel = (val: any) => {
		console.log("onCancel", val);
		acp.shift();
	};

	const onEscape: FnOnEscape = (...args: any[]) => {
		console.log("onEscape", args);
		acp.shift();
	};

	const onCustom: FnOnCustom = (val: any) => {
		console.log("onCustom", val);
		acp.shift();
	};
</script>

<div class="h-[300px]">intentional white space to test scroll restore</div>

<div>
	<Button
		size="sm"
		onclick={() =>
			acp.confirm(onOk, {
				title: "Are you sure?",
				onCancel,
				onCustom,
				onEscape,
				// content: dummySentence(2),
				// example of custom button component
				CmpButtonOk: FooButton,
			})}
	>
		sure?
	</Button>

	<Button
		size="sm"
		onclick={() =>
			acp.alert({
				title: "kokosko",
				onOk,
				onCancel,
				onCustom,
				onEscape,
				content: dummySentence(30),
			})}
	>
		long alert
	</Button>

	<Button
		size="sm"
		onclick={() => {
			acp.confirm(onOk, {
				onCancel,
				onCustom,
				onEscape,
				content: dummySentence(4),
				variant: "warn",
			});
		}}
	>
		confirm
	</Button>

	<Button
		size="sm"
		onclick={() => {
			acp.prompt(
				async (val: any) => {
					console.log("OK", val);
					await tick(); // hm...
					acp.shift();
				},
				{
					onCancel,
					onCustom,
					onEscape,
					content: dummySentence(2),
					value: "",
					promptFieldProps: {
						description: "Field must contain number",
						validate: {
							customValidator(val: any, ctx: any, el) {
								if (!/\d+/.test(val)) return "Must include numbers";
							},
						},
					},
				}
			);
		}}
	>
		prompt
	</Button>

	<Button
		size="sm"
		onclick={() => {
			acp.confirm(
				async () => {
					await sleep(10_000);
					acp.shift();
				},
				{
					onCancel,
					onCustom,
					onEscape,
					content: dummySentence(2),
					variant: "warn",
				}
			);
		}}
	>
		confirm long sleep
	</Button>
</div>

<css-wrap style="display:contents;">
	<style>
		button.primary {
			--color-button-bg: var(--color-green-200);
			--color-button-text: var(--color-black);

			--color-button-bg-dark: var(--color-pink-500);
			--color-button-text-dark: var(--color-white);
		}
	</style>
	<AlertConfirmPrompt {acp} />
</css-wrap>

<div class="p-4">
	{@html dummyText(20)}
</div>
