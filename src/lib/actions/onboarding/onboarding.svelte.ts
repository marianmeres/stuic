import type { Snippet } from "svelte";
import { spotlight } from "../spotlight/spotlight.svelte.js";
import type { SpotlightPosition } from "../spotlight/spotlight.svelte.js";
import type { THC } from "../../components/Thc/Thc.svelte";
import OnboardingShell, { type Props as ShellProps, type IconFn } from "./OnboardingShell.svelte";
import { StorageAbstraction } from "../../utils/storage-abstraction.js";

//

/**
 * Definition of a single step in an onboarding tour.
 */
export interface TourStepDef {
	/** Unique identifier — must match the `id` passed to `use:tourStep` */
	id: string;
	/** Short title shown in the default shell header */
	title?: string;
	/** Rich step description (any THC value: string, html, component, snippet) */
	content?: THC;
	/** Spotlight annotation position relative to the target element */
	position?: SpotlightPosition;
	/** Spotlight cutout padding in px */
	padding?: number;
	/** Spotlight cutout border radius in px */
	borderRadius?: number;
	/** Override "Next" button label for this step */
	nextLabel?: string;
	/** Override "Back" button label for this step */
	prevLabel?: string;
	/** Override "Skip" button label for this step */
	skipLabel?: string;
	/** Override "Finish" button label for the last step */
	finishLabel?: string;
	/** Called when tour enters this step */
	onEnter?: () => void;
	/** Called when tour leaves this step */
	onLeave?: () => void;
	/**
	 * CSS selector to find the target element in the DOM.
	 * If provided, the tour will use `document.querySelector(selector)`
	 * instead of waiting for a `use:tourStep` registration.
	 */
	selector?: string;
}

/**
 * Default label overrides for the navigation shell buttons.
 */
export interface TourLabels {
	next?: string;
	prev?: string;
	skip?: string;
	finish?: string;
}

/**
 * Context passed to a custom `shell` snippet.
 */
export interface TourShellContext {
	step: TourStepDef;
	/** 0-based index of the current step */
	index: number;
	total: number;
	isFirst: boolean;
	isLast: boolean;
	next: () => void;
	prev: () => void;
	skip: () => void | Promise<void>;
}

/**
 * Options for `createTour`.
 */
export interface TourOptions {
	steps: TourStepDef[];
	/** How long to wait (ms) for a step's element to appear before skipping it. Default: 500 */
	waitForElement?: number;
	/** Default button labels (per-step overrides take precedence) */
	labels?: TourLabels;
	/** Replace the entire default shell with a custom Svelte snippet */
	shell?: Snippet<[TourShellContext]>;
	/** Press Escape to skip the tour. Default: true */
	closeOnEscape?: boolean;
	/** Called when tour starts */
	onStart?: () => void;
	/** Called when tour reaches the end naturally (after last step) */
	onEnd?: () => void;
	/** Called when tour is skipped by the user */
	onSkip?: () => void;
	/**
	 * If provided, called before skipping. Return (or resolve) `false` to cancel the skip.
	 * Works for both the Skip button and Escape key.
	 * @example
	 * ```ts
	 * // with createConfirm helper
	 * confirmSkip: () => confirm("Are you sure you want to skip the tutorial?")
	 * ```
	 */
	confirmSkip?: () => boolean | Promise<boolean>;
	/** Called on every step change */
	onStepChange?: (step: TourStepDef, index: number) => void;
	/**
	 * If set, the tour result ('completed' or 'skipped') is persisted under this key.
	 * On subsequent `start()` calls, the tour will silently skip if the key exists.
	 * Use `tour.reset()` to clear the persisted state and allow the tour to run again.
	 */
	storageKey?: string;
	/** Storage backend for persistence. Default: 'local' */
	storage?: "local" | "session";
	/** Added to the current step index for display purposes. Default: 0 */
	indexOffset?: number;
	/** Overrides steps.length for display purposes (the `total` value passed to the shell) */
	totalSteps?: number;
	/** Whether to show the step counter (e.g. "1 / 3") in the default shell. Default: true */
	showSteps?: boolean;
	/** Override props (variant, intent, size, roundedFull) for the prev button */
	prevButtonProps?: ShellProps["prevButtonProps"];
	/** Override props (variant, intent, size, roundedFull) for the next/finish button */
	nextButtonProps?: ShellProps["nextButtonProps"];
	/** Custom icon for the prev button */
	iconPrev?: IconFn;
	/** Custom icon for the next button */
	iconNext?: IconFn;
	/** Custom icon for the finish (last step) button */
	iconFinish?: IconFn;
}

/**
 * Creates a multi-step onboarding tour on top of the spotlight primitive.
 *
 * Define all steps centrally here, then attach `use:tourStep={[tour, stepId]}`
 * to each target element in your markup.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createTour, tourStep } from '$lib';
 *
 *   const tour = createTour({
 *     steps: [
 *       { id: 'header', title: 'Welcome', content: 'This is the top of the page.' },
 *       { id: 'save-btn', title: 'Save your work', content: 'Click here to save.' },
 *     ],
 *     onEnd: () => console.log('Tour complete!'),
 *   });
 * </script>
 *
 * <header use:tourStep={[tour, 'header']}>...</header>
 * <button use:tourStep={[tour, 'save-btn']}>Save</button>
 * <button onclick={tour.start}>Start Tour</button>
 * ```
 */
export function createTour(options: TourOptions) {
	let currentIndex = $state(-1);
	const active = $derived(currentIndex >= 0);
	const currentStep = $derived(options.steps[currentIndex] ?? null);

	// Optional persistence store
	const store = options.storageKey
		? new StorageAbstraction(options.storage ?? "local")
		: null;

	// Element registry: stepId -> HTMLElement
	const registry = new Map<string, HTMLElement>();

	// Steps registered via use:tourStep action (to prevent double-spotlight with selector)
	const actionRegistered = new Set<string>();

	// Wait-for-element mechanism (one pending wait at a time)
	let pendingStepId: string | null = null;
	let pendingResolve: ((found: boolean) => void) | null = null;

	// Guard against concurrent navigation calls
	let advancing = false;

	const resolvedLabels: Required<TourLabels> = {
		next: "Next",
		prev: "Back",
		skip: "Skip",
		finish: "",
		...options.labels,
	};

	// Escape key listener — active only while tour is running
	$effect(() => {
		if (active && options.closeOnEscape !== false) {
			const handler = async (e: KeyboardEvent) => {
				if (e.key === "Escape") {
					e.preventDefault();
					e.stopPropagation();
					e.stopImmediatePropagation();
					await skip();
				}
			};
			document.addEventListener("keydown", handler);
			return () => document.removeEventListener("keydown", handler);
		}
	});

	// Spotlight for selector-based steps (no use:tourStep action to manage it)
	$effect(() => {
		const step = currentStep;
		if (!active || !step?.selector) return;
		// If this step was registered via use:tourStep, let the action handle spotlight
		if (actionRegistered.has(step.id)) return;

		const el = registry.get(step.id);
		if (!el) return;

		// spotlight() creates inner $effects; Svelte cleans them up
		// when this outer effect re-runs (step change) or is destroyed (tour end)
		spotlight(el, () => ({
			open: true,
			content: _getShellContent(step.id),
			position: step.position ?? "bottom",
			padding: step.padding,
			borderRadius: step.borderRadius,
			closeOnEscape: false,
			closeOnBackdropClick: false,
			scrollIntoView: true,
		}));
	});

	// -- Internal API (used by tourStep action) -----------------------------------------

	function _registerAction(id: string) {
		actionRegistered.add(id);
	}

	function _register(id: string, el: HTMLElement) {
		registry.set(id, el);
		// If we were waiting for this element, resolve immediately
		if (pendingStepId === id && pendingResolve) {
			pendingResolve(true);
			pendingStepId = null;
			pendingResolve = null;
		}
	}

	function _unregister(id: string) {
		registry.delete(id);
		// If the active step's element unmounts mid-tour, end gracefully
		if (active && currentStep?.id === id) {
			console.warn(`[createTour] Active step "${id}" element unmounted — ending tour`);
			_end();
		}
	}

	function _isCurrentStep(id: string): boolean {
		return active && currentStep?.id === id;
	}

	function _getShellContent(id: string): THC {
		const step = options.steps.find((s) => s.id === id)!;
		const index = options.steps.indexOf(step);
		const displayIndex = index + (options.indexOffset ?? 0);
		const displayTotal = options.totalSteps ?? options.steps.length;
		return {
			component: OnboardingShell,
			props: {
				step,
				index: displayIndex,
				total: displayTotal,
				isFirst: index === 0,
				isLast: displayIndex === displayTotal - 1,
				labels: resolvedLabels,
				shell: options.shell,
				showSteps: options.showSteps ?? true,
				prevButtonProps: options.prevButtonProps,
				nextButtonProps: options.nextButtonProps,
				iconPrev: options.iconPrev,
				iconNext: options.iconNext,
				iconFinish: options.iconFinish,
				next,
				prev,
				skip,
			},
		};
	}

	// -- Navigation ---------------------------------------------------------------------

	function waitForElement(id: string): Promise<boolean> {
		// Cancel any previous pending wait
		if (pendingResolve) {
			pendingResolve(false);
			pendingResolve = null;
			pendingStepId = null;
		}

		const step = options.steps.find((s) => s.id === id);
		const selector = step?.selector;

		return new Promise<boolean>((resolve) => {
			pendingStepId = id;
			pendingResolve = resolve;

			// For selector-based steps, poll the DOM periodically
			let pollInterval: ReturnType<typeof setInterval> | null = null;
			if (selector) {
				pollInterval = setInterval(() => {
					const el = document.querySelector<HTMLElement>(selector);
					if (el && pendingStepId === id) {
						_register(id, el);
						// _register() resolves the promise via pendingResolve
					}
				}, 50);
			}

			setTimeout(() => {
				if (pollInterval) clearInterval(pollInterval);
				if (pendingStepId === id) {
					console.warn(
						`[createTour] Step "${id}" element not found after ${options.waitForElement ?? 500}ms — skipping`
					);
					pendingStepId = null;
					pendingResolve = null;
					resolve(false);
				}
			}, options.waitForElement ?? 500);
		});
	}

	async function advanceTo(targetIndex: number) {
		if (advancing) return;
		advancing = true;

		try {
			// Call onLeave for the step we're leaving
			currentStep?.onLeave?.();

			const direction = targetIndex >= currentIndex ? 1 : -1;
			let index = targetIndex;

			// Find the nearest available step in the direction of travel
			while (index >= 0 && index < options.steps.length) {
				const step = options.steps[index];

				// For selector-based steps, try to find the element in the DOM
				if (step.selector && !registry.has(step.id)) {
					const el = document.querySelector<HTMLElement>(step.selector);
					if (el) {
						_register(step.id, el);
					}
				}

				if (!registry.has(step.id)) {
					const found = await waitForElement(step.id);
					if (!found) {
						index += direction;
						continue;
					}
				}

				// Step element is available — navigate here
				currentIndex = index;
				step.onEnter?.();
				options.onStepChange?.(step, index);
				return;
			}

			// Exhausted all steps in the direction of travel
			_end();
		} finally {
			advancing = false;
		}
	}

	function _end() {
		currentIndex = -1;
		store?.set(options.storageKey!, "completed");
		options.onEnd?.();
	}

	// -- Public API ---------------------------------------------------------------------

	function start() {
		if (active) return;
		if (store && store.has(options.storageKey!)) return;
		options.onStart?.();
		advanceTo(0);
	}

	function next() {
		advanceTo(currentIndex + 1);
	}

	function prev() {
		if (currentIndex > 0) advanceTo(currentIndex - 1);
	}

	async function skip() {
		if (options.confirmSkip && !(await options.confirmSkip())) return;
		currentIndex = -1;
		store?.set(options.storageKey!, "skipped");
		options.onSkip?.();
	}

	function reset() {
		store?.remove(options.storageKey!);
	}

	return {
		get active() {
			return active;
		},
		get currentStep() {
			return currentStep;
		},
		get currentIndex() {
			return currentIndex;
		},
		get seen() {
			return store ? store.has(options.storageKey!) : false;
		},
		start,
		next,
		prev,
		skip,
		reset,
		// Internal — used by tourStep action
		_register,
		_unregister,
		_registerAction,
		_isCurrentStep,
		_getShellContent,
	};
}

export type TourInstance = ReturnType<typeof createTour>;

/**
 * Svelte action that registers a DOM element as the target for a specific tour step.
 *
 * @param el - The target element
 * @param args - Tuple of `[TourInstance, stepId]`
 *
 * @example
 * ```svelte
 * <button use:tourStep={[tour, 'save-btn']}>Save</button>
 * ```
 */
export function tourStep(el: HTMLElement, args: [TourInstance | null | undefined, string]) {
	const [tour, id] = args;
	if (!tour) return;
	tour._registerAction(id);
	tour._register(id, el);

	spotlight(el, () => {
		const isActive = tour._isCurrentStep(id);
		if (!isActive) {
			return { open: false };
		}
		return {
			open: true,
			content: tour._getShellContent(id),
			position: tour.currentStep?.position ?? "bottom",
			padding: tour.currentStep?.padding,
			borderRadius: tour.currentStep?.borderRadius,
			closeOnEscape: false,
			closeOnBackdropClick: false,
			scrollIntoView: true,
		};
	});

	$effect(() => {
		return () => {
			tour._unregister(id);
		};
	});
}
