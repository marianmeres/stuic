<script lang="ts" module>
	export type KnownMeta = "cmd" | "opt" | "shift" | "ctrl" | "alt" | "win" | "meta";

	export interface Props {
		class?: string;
		metas?: KnownMeta[];
		keys: string;
		forcedOs?: "mac" | "win" | "linux";
	}

	// just the base ones...
	// Windows Ctrl         → macOS Command (⌘)
	// Windows Alt          → macOS Option (⌥)
	// Windows Shift        → macOS Shift (⇧)

	export const macToOther: Partial<Record<KnownMeta, KnownMeta>> = {
		cmd: "win",
	};

	export const otherToMac: Partial<Record<KnownMeta, KnownMeta>> = {
		win: "cmd",
	};

	export const macSymbol: Partial<Record<KnownMeta, string>> = {
		meta: "⌘",
		cmd: "⌘",
		shift: "⇧",
		ctrl: "⌃",
		alt: "⌥",
	};

	export const otherSymbol: Partial<Record<KnownMeta, string>> = {
		meta: "⊞",
		win: "⊞",
		shift: "⇧",
	};
</script>

<script lang="ts">
	import { isMac } from "../../utils/is-mac.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import { ucfirst } from "../../utils/ucfirst.js";

	let { class: classProp, metas, keys, forcedOs }: Props = $props();

	function wrap(s: string, mac: boolean) {
		const cls = ["pr-0.5 font-mono tracking-tight"];
		const sym = mac ? macSymbol[s as KnownMeta] : otherSymbol[s as KnownMeta];
		if (sym) {
			s = sym;
			cls.push("font-sans pr-0");
		}
		const _class = twMerge(...cls);
		return `<span class="${_class}">${ucfirst(s)}</span>`;
	}

	async function get_meta_key() {
		if (!metas?.length) return "";
		const mac = forcedOs ? forcedOs === "mac" : await isMac();
		const replace = mac ? otherToMac : macToOther;
		const kk = (metas || []).map((m) => wrap(replace[m] ?? m, mac));
		const _unique = uniq(kk);
		if (_unique.length !== kk.length) {
			console.warn(
				`Some meta keys (${metas.join(", ")}) were mapped as duplicates for this OS (${mac ? "MacOS" : "not MacOS"})`
			);
		}
		return _unique.join("");
	}

	function uniq(s: string[]) {
		return [...new Set(s)];
	}
</script>

<kbd
	class={twMerge(
		"text-xs leading-0 space-x-0.5 rounded px-1 py-0 outline outline-neutral-400",
		classProp
	)}
>
	{#await get_meta_key() then metaKey}
		<span class="font-sans">{@html metaKey}</span><span>{keys}</span>
	{/await}
</kbd>
