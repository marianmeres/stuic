<script lang="ts">
	import { LoginForm, createEmptyLoginFormData } from "$lib/index.js";
	import type { LoginFormData } from "$lib/components/LoginForm/_internal/login-form-types.js";
	import WrappingParent from "./WrappingParent.svelte";

	// Real HTTP target. example.com doesn't have a login endpoint, so this will
	// 404 (or be blocked by CORS — the response status / network error is enough
	// to drive the parent into the "set error" branch).
	const FETCH_URL = "https://example.com/api/login";

	let formData = $state<LoginFormData>({
		...createEmptyLoginFormData(),
		email: "user@example.com",
		password: "wrong-password",
	});

	let isSubmitting = $state(false);
	let error = $state<string | undefined>(undefined);
	let submitCount = $state(0);

	type LogEntry = { t: number; msg: string; data?: unknown };
	let log = $state<LogEntry[]>([]);
	let t0 = performance.now();

	function append(msg: string, data?: unknown) {
		const entry = { t: Math.round(performance.now() - t0), msg, data };
		log = [...log, entry].slice(-100);
		// eslint-disable-next-line no-console
		console.warn(`[page +${entry.t}ms]`, msg, data ?? "");
	}

	async function handleSubmit(data: LoginFormData) {
		submitCount++;
		append(`onSubmit #${submitCount}`, { email: data.email, pw: data.password });
		isSubmitting = true;
		error = undefined;
		try {
			append("→ fetch begin");
			const res = await fetch(FETCH_URL, {
				method: "POST",
				body: JSON.stringify(data),
				headers: { "Content-Type": "application/json" },
			});
			append(`→ fetch returned status=${res.status}`);
			error = `HTTP ${res.status} — Invalid email and/or password (simulated)`;
		} catch (e) {
			append(`→ fetch threw: ${(e as Error).message}`);
			error = `Network: ${(e as Error).message} (treating as 401)`;
		} finally {
			isSubmitting = false;
			append(`→ done. error="${error ?? ""}", isSubmitting=${isSubmitting}`);
		}
	}

	function clearLog() {
		log = [];
		t0 = performance.now();
		submitCount = 0;
	}

	// Watch the form element after mount so we can prove which submit_valid /
	// submit_invalid event the form is dispatching on each click — without
	// touching stuic source.
	let formEl = $state<HTMLElement | null>(null);

	$effect(() => {
		// Find the form once it's mounted. LoginForm renders a `.stuic-login-form`.
		const node = document.querySelector(".stuic-login-form") as HTMLFormElement | null;
		formEl = node;
		if (!node) return;

		const onSubmit = (e: Event) =>
			append(`<form>: native 'submit' (capture)`, {
				defaultPrevented: e.defaultPrevented,
			});
		const onValid = (e: Event) =>
			append(`<form>: 'submit_valid' fired`, (e as CustomEvent).detail);
		const onInvalid = (e: Event) => {
			const detail = (e as CustomEvent).detail as {
				invalid: HTMLInputElement[];
			};
			append(
				`<form>: 'submit_invalid' fired — first invalid: ${detail.invalid[0]?.name ?? "?"}`,
				detail.invalid.map((el) => ({
					name: el.name,
					type: el.type,
					value: el.value,
					valid: el.validity.valid,
					customError: el.validity.customError,
					valueMissing: el.validity.valueMissing,
					typeMismatch: el.validity.typeMismatch,
					patternMismatch: el.validity.patternMismatch,
					validationMessage: el.validationMessage,
				}))
			);
		};

		node.addEventListener("submit", onSubmit, true);
		node.addEventListener("submit_valid", onValid);
		node.addEventListener("submit_invalid", onInvalid);

		// Snapshot inputs whenever they receive input/change so we can correlate
		// the timeline with the dispatched events from onSubmitValidityCheck.
		const inputs = node.querySelectorAll("input");
		const inputListeners: Array<() => void> = [];
		inputs.forEach((el) => {
			(["input", "change"] as const).forEach((evt) => {
				const handler = () => {
					append(`<input ${el.name}>: ${evt}`, {
						value: el.value,
						valid: el.validity.valid,
						customError: el.validity.customError,
						valueMissing: el.validity.valueMissing,
						validationMessage: el.validationMessage,
					});
				};
				el.addEventListener(evt, handler);
				inputListeners.push(() => el.removeEventListener(evt, handler));
			});
		});

		return () => {
			node.removeEventListener("submit", onSubmit, true);
			node.removeEventListener("submit_valid", onValid);
			node.removeEventListener("submit_invalid", onInvalid);
			inputListeners.forEach((fn) => fn());
		};
	});
</script>

<h1 class="text-2xl font-bold mb-2">LoginForm — Bug A repro (real HTTP)</h1>
<p class="text-sm opacity-70 mb-6">
	Submits to <code>{FETCH_URL}</code>
	on every click. The endpoint will 404 / fail; the parent treats that as a 401-equivalent and
	sets <code>error</code>. Reproducing Issue A: after the first failed submit, the second
	click should also call <code>onSubmit</code>
	(and bump <code>submitCount</code>). If it doesn't, the bug is back.
</p>

<div class="grid md:grid-cols-2 gap-6">
	<div>
		<div class="mb-3 text-sm space-y-1">
			<div><strong>onSubmit count:</strong> <code>{submitCount}</code></div>
			<div><strong>isSubmitting:</strong> <code>{isSubmitting}</code></div>
			<div>
				<strong>parent error:</strong>
				<code class="break-all">{error ?? "(none)"}</code>
			</div>
			<div><strong>form element bound:</strong> <code>{!!formEl}</code></div>
		</div>

		<div class="border rounded-md p-4">
			<LoginForm
				bind:formData
				onSubmit={handleSubmit}
				{isSubmitting}
				{error}
				showRememberMe={false}
			/>
		</div>

		<button class="mt-3 text-xs underline opacity-60" type="button" onclick={clearLog}>
			clear log
		</button>
	</div>

	<div>
		<h2 class="text-sm font-bold mb-2">Event log (last 100)</h2>
		<pre
			class="text-xs bg-muted p-3 rounded-md overflow-auto max-h-[80vh] whitespace-pre-wrap">{log
				.map(
					(e) =>
						`+${String(e.t).padStart(5)}ms  ${e.msg}` +
						(e.data !== undefined ? `\n            ${JSON.stringify(e.data)}` : "")
				)
				.join("\n")}</pre>
	</div>
</div>

<hr class="my-8 opacity-30" />

<h2 class="text-xl font-bold mb-2">Wrapped repro (Issue A — bind:this gotcha)</h2>
<p class="text-sm opacity-70 mb-4">
	Same form, but mounted inside a <code>WrappingParent</code> sub-component that flips
	<code>isSubmitting</code> in <code>finally</code> after a fake (Promise-only) failure. This is
	the configuration that historically reproduced the silent-retry bug because the parent
	re-render reset <code>el = $bindable()</code> to <code>undefined</code> and detached the
	<code>submit_valid</code> listener. With the <code>formEl</code> local-state mirror in place,
	the second click must increment the wrapper's count.
</p>

<div class="border rounded-md p-4 max-w-md">
	<WrappingParent onLog={append} />
</div>

<div class="mt-6 text-xs opacity-60 space-y-1">
	<p><strong>Repro steps:</strong></p>
	<ol class="list-decimal pl-5 space-y-1">
		<li>
			Page loads with credentials pre-filled (<code>user@example.com</code> /
			<code>wrong-password</code>).
		</li>
		<li>
			Click "Log in". Watch <code>onSubmit count</code> go to <strong>1</strong>, then the
			error appears.
		</li>
		<li>Edit the password (or don't — same bug either way per the report).</li>
		<li>
			Click "Log in" again. Count should go to <strong>2</strong>. If it stays at 1, Issue
			A reproduced.
		</li>
		<li>
			The event log on the right will tell us whether <code>submit_invalid</code> fires (and
			which validity flag is set) or whether the click never reaches the form.
		</li>
		<li>
			<strong>Wrapped section:</strong> repeat the same flow there. The wrapped count must
			also reach 2 — that's the regression test for the <code>bind:this</code> +
			<code>$bindable</code> gotcha.
		</li>
	</ol>
</div>
