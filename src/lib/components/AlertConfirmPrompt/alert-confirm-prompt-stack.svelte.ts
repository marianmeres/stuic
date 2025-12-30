import type { Component } from "svelte";
import type { THC } from "../Thc/Thc.svelte";

// const clog = createClog("alert-confirm-prompt-stack").debug;

/**
 * Types of alert/confirm/prompt dialogs.
 */
export enum AlertConfirmPromptType {
	ALERT = "alert",
	CONFIRM = "confirm",
	PROMPT = "prompt",
}

/**
 * Visual variant for the dialog - affects color scheme and icon.
 */
export type AlertConfirmPromptVariant = "info" | "success" | "warn" | "error";

/** Callback type for OK button click. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FnOnOK = (value: any) => void;
/** Callback type for Cancel button click. */
export type FnOnCancel = (value: false) => void;
/** Callback type for Escape key press. */
export type FnOnEscape = () => void;
/** Callback type for custom button click. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FnOnCustom = (value: any) => void;

/**
 * Configuration object for an alert/confirm/prompt dialog.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	promptFieldProps?: any;
	// visuals
	variant: AlertConfirmPromptVariant;
	iconFn: (() => string) | boolean; // true means default

	// class?: Partial<AlertConfirmPromptKnownClasses>;
	forceAsHtml?: boolean;

	//
	CmpButtonOk?: Component;
	CmpButtonCancel?: Component;
	CmpButtonCustom?: Component;
}

const isFn = (v: unknown) => typeof v === "function";
const ucf = (s: string) => `${s}`[0].toUpperCase() + `${s}`.slice(1);

/**
 * A reactive stack manager for alert, confirm, and prompt dialogs.
 *
 * Manages a FIFO queue of dialogs, allowing one dialog to be displayed at a time.
 * Provides a modern, customizable replacement for native browser dialogs.
 *
 * @example
 * ```ts
 * const acp = new AlertConfirmPromptStack({
 *   labelOk: 'Confirm',
 *   labelCancel: 'Dismiss'
 * });
 *
 * // Simple alert
 * acp.alert({ title: 'Notice', content: 'Operation complete' });
 *
 * // Confirm with callback
 * acp.confirm(
 *   () => console.log('Confirmed!'),
 *   { title: 'Delete?', content: 'This cannot be undone', variant: 'warn' }
 * );
 *
 * // Prompt for input
 * acp.prompt(
 *   (value) => console.log('User entered:', value),
 *   { title: 'Name', content: 'Enter your name', value: 'Default' }
 * );
 * ```
 */
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
		o.CmpButtonOk ??= this.defaults.CmpButtonOk;
		o.CmpButtonCancel ??= this.defaults.CmpButtonCancel;
		o.CmpButtonCustom ??= this.defaults.CmpButtonCustom;

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
 * Creates a Promise-based alert function compatible with `window.alert`.
 *
 * Returns a function that shows an alert dialog and resolves when dismissed.
 *
 * @param acp - The AlertConfirmPromptStack instance
 * @param defaults - Default options for all alerts
 * @returns A Promise-based alert function
 *
 * @example
 * ```ts
 * const alert = createAlert(acpStack);
 * await alert('Hello World!');
 * console.log('Alert dismissed');
 * ```
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
 * Creates a Promise-based confirm function compatible with `window.confirm`.
 *
 * Returns a function that shows a confirm dialog and resolves with `true` (OK) or `false` (Cancel/Escape).
 *
 * @param acp - The AlertConfirmPromptStack instance
 * @param defaults - Default options for all confirms
 * @returns A Promise-based confirm function
 *
 * @example
 * ```ts
 * const confirm = createConfirm(acpStack);
 * if (await confirm('Delete this item?')) {
 *   deleteItem();
 * }
 * ```
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
 * Creates a Promise-based prompt function compatible with `window.prompt`.
 *
 * Returns a function that shows a prompt dialog and resolves with the entered value or `null` (Cancel/Escape).
 *
 * @param acp - The AlertConfirmPromptStack instance
 * @param defaults - Default options for all prompts
 * @returns A Promise-based prompt function
 *
 * @example
 * ```ts
 * const prompt = createPrompt(acpStack);
 * const name = await prompt('What is your name?', 'Anonymous');
 * if (name !== null) {
 *   console.log('Hello,', name);
 * }
 * ```
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
