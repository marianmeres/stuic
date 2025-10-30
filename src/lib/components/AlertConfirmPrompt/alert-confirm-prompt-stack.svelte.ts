import { createClog } from "@marianmeres/clog";
import type { THC } from "../Thc/Thc.svelte";

const clog = createClog("alert-confirm-prompt-stack").debug;

export enum AlertConfirmPromptType {
	ALERT = "alert",
	CONFIRM = "confirm",
	PROMPT = "prompt",
}

// basically a label for color scheme and icon
export type AlertConfirmPromptVariant = "info" | "success" | "warn" | "error";

export type FnOnOK = (value: any) => any;
export type FnOnCancel = (value: false) => any;
export type FnOnEscape = () => void;
export type FnOnCustom = (value: any) => any;

export interface AlertConfirmPromptObj extends Record<string, any> {
	//keyof AlertConfirmPromptType;
	type:
		| AlertConfirmPromptType.ALERT
		| AlertConfirmPromptType.CONFIRM
		| AlertConfirmPromptType.PROMPT;
	//
	title: THC;
	content: THC;
	//
	value: any;
	//
	labelOk: THC;
	onOk: FnOnOK;
	//
	labelCancel: THC;
	onCancel: FnOnCancel;
	// so we can distinguish the escape key hit (native browser sometimes does)
	onEscape: FnOnEscape;
	// optional custom 3rd button label + handler
	labelCustom?: THC;
	onCustom?: FnOnCustom;
	//
	promptFieldProps?: any;
	// visuals
	variant: AlertConfirmPromptVariant;
	iconFn: (() => string) | boolean; // true means default

	// class?: Partial<AlertConfirmPromptKnownClasses>;
	forceAsHtml?: boolean;

	//
	CmpButtonOk?: any;
	CmpButtonCancel?: any;
	CmpButtonCustom?: any;
}

const isFn = (v: any) => typeof v === "function";
const ucf = (s: string) => `${s}`[0].toUpperCase() + `${s}`.slice(1);

export class AlertConfirmPromptStack {
	// fifo
	#stack = $state<AlertConfirmPromptObj[]>([]);

	constructor(public defaults: Partial<AlertConfirmPromptObj> = {}) {
		this.defaults ??= {};
		this.defaults.labelOk ||= "OK";
		this.defaults.labelCancel ||= "Cancel";
		this.defaults.iconFn ??= true;
	}

	get length() {
		return this.#stack.length;
	}

	get current() {
		return this.#stack[0];
	}

	#push = (o: Partial<AlertConfirmPromptObj>) => {
		if (!isFn(o.onOk)) o.onOk = this.shift;
		if (!isFn(o.onCancel)) o.onCancel = this.shift;
		if (!isFn(o.onEscape)) o.onEscape = this.shift;
		if (!isFn(o.onCustom)) o.onCustom = () => undefined;

		o.type ??= AlertConfirmPromptType.ALERT;
		o.labelOk ??= this.defaults.labelOk;
		o.labelCancel ??= this.defaults.labelCancel;
		o.iconFn ??= this.defaults.iconFn;
		o.title ??= ucf(`${o.type || ""}`);

		// variant defaults to info
		if (!["info", "success", "warn", "error"].includes(o?.variant as string)) {
			o.variant = "info";
		}

		o._id = Math.random().toString(36).slice(2);

		this.#stack.push(o as AlertConfirmPromptObj);
	};

	shift = () => this.#stack.shift();

	reset = () => {
		this.#stack = [];
	};

	escape = () => {
		this.#stack?.[0]?.onEscape?.();
		this.shift();
	};

	dump = () => {
		return [...this.#stack];
	};

	/**
	 * Main api.
	 */
	alert = (o?: Partial<AlertConfirmPromptObj> | string) => {
		if (typeof o === "string") o = { title: o };
		this.#push({ ...(o || {}), type: AlertConfirmPromptType.ALERT });
	};

	/**
	 * Main api.
	 */
	confirm = (onOk: FnOnOK, o?: Partial<AlertConfirmPromptObj>) => {
		this.#push({ onOk, value: false, ...o, type: AlertConfirmPromptType.CONFIRM });
	};

	/**
	 * Main api.
	 */
	prompt = (onOk: FnOnOK, o?: Partial<AlertConfirmPromptObj>) => {
		this.#push({ onOk, value: "", ...o, type: AlertConfirmPromptType.PROMPT });
	};
}

/**
 * Sugar helper to monkey patch the native window.alert
 */
export function createAlert(
	acp: AlertConfirmPromptStack,
	defaults?: Partial<AlertConfirmPromptObj>
) {
	// allowing to add the custom param outside of the native signature
	return (message: string, o?: Partial<AlertConfirmPromptObj>) =>
		new Promise<undefined>((resolve) =>
			acp.alert({
				...(defaults || {}),
				onOk: () => {
					acp.shift();
					resolve(undefined);
				},
				content: message,
				onEscape: () => {
					acp.shift();
					resolve(undefined);
				},
				...(o || {}),
			})
		);
}

/**
 * Sugar helper to monkey patch the native window.confirm
 */
export function createConfirm(
	acp: AlertConfirmPromptStack,
	defaults?: Partial<AlertConfirmPromptObj>
) {
	// allowing to add the custom param outside of the native signature
	return (message: string, o?: Partial<AlertConfirmPromptObj>) =>
		new Promise<boolean>((resolve) =>
			acp.confirm(
				() => {
					acp.shift();
					resolve(true);
				},
				{
					...(defaults || {}),
					content: message,
					onCancel: () => {
						acp.shift();
						resolve(false);
					},
					onEscape: () => {
						acp.shift();
						resolve(false);
					},
					...(o || {}),
				}
			)
		);
}

/**
 * Sugar helper to monkey patch the native window.prompt
 */
export function createPrompt(
	acp: AlertConfirmPromptStack,
	defaults?: Partial<AlertConfirmPromptObj>
) {
	// allowing to add the custom param outside of the native signature
	return (
		message: string,
		defaultValue: string = "",
		o?: Partial<AlertConfirmPromptObj>
	) =>
		new Promise<string | null>((resolve) =>
			acp.prompt(
				(value: string) => {
					acp.shift();
					resolve(value);
				},
				{
					...(defaults || {}),
					content: message,
					value: defaultValue,
					onCancel: () => {
						acp.shift();
						resolve(null);
					},
					onEscape: () => {
						acp.shift();
						resolve(null);
					},
					...(o || {}),
				}
			)
		);
}
