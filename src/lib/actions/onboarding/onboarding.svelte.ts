import type { Snippet } from "svelte";
import { spotlight } from "../spotlight/spotlight.svelte.js";
import type { SpotlightPosition } from "../spotlight/spotlight.svelte.js";
import type { THC } from "../../components/Thc/Thc.svelte";
import OnboardingShell from "./OnboardingShell.svelte";
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
	skip: () => void;
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

	// Wait-for-element mechanism (one pending wait at a time)
	let pendingStepId: string | null = null;
	let pendingResolve: ((found: boolean) => void) | null = null;

	// Guard against concurrent navigation calls
	let advancing = false;

	const resolvedLabels: Required<TourLabels> = {
		next: "Next",
		prev: "Back",
		skip: "Skip",
		finish: "Finish",
		...options.labels,
	};

	// Escape key listener — active only while tour is running
	$effect(() => {
		if (active && options.closeOnEscape !== false) {
			const handler = (e: KeyboardEvent) => {
				if (e.key === "Escape") {
					e.preventDefault();
					e.stopPropagation();
					e.stopImmediatePropagation();
					skip();
				}
			};
			document.addEventListener("keydown", handler);
			return () => document.removeEventListener("keydown", handler);
		}
	});

	// -- Internal API (used by tourStep action) -----------------------------------------

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
		const total = options.steps.length;
		return {
			component: OnboardingShell,
			props: {
				step,
				index,
				total,
				isFirst: index === 0,
				isLast: index === total - 1,
				labels: resolvedLabels,
				shell: options.shell,
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
		return new Promise<boolean>((resolve) => {
			pendingStepId = id;
			pendingResolve = resolve;
			setTimeout(() => {
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

	function skip() {
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
export function tourStep(el: HTMLElement, args: [TourInstance, string]) {
	const [tour, id] = args;
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
