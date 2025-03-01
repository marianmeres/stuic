import { MediaQuery } from "svelte/reactivity";

export function prefersReducedMotion(): MediaQuery {
	return new MediaQuery("(prefers-reduced-motion: reduce)");
}
