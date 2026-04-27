<script lang="ts">
	import { LoginForm, createEmptyLoginFormData } from "$lib/index.js";
	import type { LoginFormData } from "$lib/components/LoginForm/_internal/login-form-types.js";

	type Props = {
		onLog: (msg: string, data?: unknown) => void;
	};
	let { onLog }: Props = $props();

	// IMPORTANT: this state lives in THIS wrapping component. When it changes,
	// `<LoginForm>` is re-rendered with new props (without `bind:el`). That is
	// the exact condition that used to silently detach the `submit_valid`
	// listener inside LoginForm because `el = $bindable()` reverted to undefined.
	let formData = $state<LoginFormData>({
		...createEmptyLoginFormData(),
		email: "user@example.com",
		password: "wrong-password",
	});
	let isSubmitting = $state(false);
	let error = $state<string | undefined>(undefined);
	let count = $state(0);

	async function handleLogin(data: LoginFormData) {
		count++;
		onLog(`[wrapper] onLogin #${count}`, { email: data.email });
		isSubmitting = true;
		error = undefined;
		try {
			// fake server: 200ms latency, always rejects
			await new Promise((r) => setTimeout(r, 200));
			throw new Error("Invalid email and/or password (fake)");
		} catch (e) {
			error = (e as Error).message;
			onLog(`[wrapper] caught — error set`);
		} finally {
			// `isSubmitting = false` and `error = "..."` both flip parent state in
			// `finally`. THIS is the parent re-render that used to break the
			// listener inside LoginForm prior to the formEl-mirror fix.
			isSubmitting = false;
			onLog(`[wrapper] finally — isSubmitting=false`);
		}
	}
</script>

<div class="text-sm space-y-1 mb-2">
	<div><strong>wrapped onLogin count:</strong> <code>{count}</code></div>
	<div><strong>isSubmitting:</strong> <code>{isSubmitting}</code></div>
	<div><strong>error:</strong> <code>{error ?? "(none)"}</code></div>
</div>

<LoginForm
	bind:formData
	onSubmit={handleLogin}
	{isSubmitting}
	{error}
	showRememberMe={false}
/>
