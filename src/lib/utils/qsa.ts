export function qsa(selector: string, context?: HTMLElement | Document) {
	return Array.from((context ?? document)?.querySelectorAll(selector) || []);
}
