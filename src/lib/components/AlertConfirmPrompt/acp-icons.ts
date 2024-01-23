// taken from @marianmeres/icons-fns

import type { AlertConfirmPromptIcons } from './AlertConfirmPrompt.svelte';

export function iconFeatherAlertTriangle(props) {
	// Backward compatible signature support: fn(cls, size, style)
	if (props === null || props === undefined) props = {};
	if (typeof props !== 'object') props = { class: props || '' };
	if (arguments.length > 1) props.size ??= arguments[1];
	if (arguments.length > 2) props.style ??= arguments[2];
	//
	const { size, class: cls, style, strokeWidth } = props;
	let attrs = Object.entries(props)
		.filter(([k, v]) => !/^class|size|style|strokeWidth$/.test(k))
		.reduce((m, [k, v]) => [...m, `${k}="${v}"`], [])
		.join(' ');
	return `<svg ${style ? `style="${style}" ` : ''}${cls ? `class="${cls}" ` : ''}width="${size || 24}" height="${size || 24}" stroke-width="${strokeWidth ?? 2}" ${attrs ? `${attrs} ` : ''}viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
}

function iconFeatherAlertCircle(props) {
	// Backward compatible signature support: fn(cls, size, style)
	if (props === null || props === undefined) props = {};
	if (typeof props !== 'object') props = { class: props || '' };
	if (arguments.length > 1) props.size ??= arguments[1];
	if (arguments.length > 2) props.style ??= arguments[2];
	//
	const { size, class: cls, style, strokeWidth } = props;
	let attrs = Object.entries(props)
		.filter(([k, v]) => !/^class|size|style|strokeWidth$/.test(k))
		.reduce((m, [k, v]) => [...m, `${k}="${v}"`], [])
		.join(' ');
	return `<svg ${style ? `style="${style}" ` : ''}${cls ? `class="${cls}" ` : ''}width="${size || 24}" height="${size || 24}" stroke-width="${strokeWidth ?? 2}" ${attrs ? `${attrs} ` : ''}viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
}

function iconFeatherCheckCircle(props) {
	// Backward compatible signature support: fn(cls, size, style)
	if (props === null || props === undefined) props = {};
	if (typeof props !== 'object') props = { class: props || '' };
	if (arguments.length > 1) props.size ??= arguments[1];
	if (arguments.length > 2) props.style ??= arguments[2];
	//
	const { size, class: cls, style, strokeWidth } = props;
	let attrs = Object.entries(props)
		.filter(([k, v]) => !/^class|size|style|strokeWidth$/.test(k))
		.reduce((m, [k, v]) => [...m, `${k}="${v}"`], [])
		.join(' ');
	return `<svg ${style ? `style="${style}" ` : ''}${cls ? `class="${cls}" ` : ''}width="${size || 24}" height="${size || 24}" stroke-width="${strokeWidth ?? 2}" ${attrs ? `${attrs} ` : ''}viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
}

function iconFeatherXOctagon(props) {
	// Backward compatible signature support: fn(cls, size, style)
	if (props === null || props === undefined) props = {};
	if (typeof props !== 'object') props = { class: props || '' };
	if (arguments.length > 1) props.size ??= arguments[1];
	if (arguments.length > 2) props.style ??= arguments[2];
	//
	const { size, class: cls, style, strokeWidth } = props;
	let attrs = Object.entries(props)
		.filter(([k, v]) => !/^class|size|style|strokeWidth$/.test(k))
		.reduce((m, [k, v]) => [...m, `${k}="${v}"`], [])
		.join(' ');
	return `<svg ${style ? `style="${style}" ` : ''}${cls ? `class="${cls}" ` : ''}width="${size || 24}" height="${size || 24}" stroke-width="${strokeWidth ?? 2}" ${attrs ? `${attrs} ` : ''}viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
}

function iconFeatherInfo(props) {
	// Backward compatible signature support: fn(cls, size, style)
	if (props === null || props === undefined) props = {};
	if (typeof props !== 'object') props = { class: props || '' };
	if (arguments.length > 1) props.size ??= arguments[1];
	if (arguments.length > 2) props.style ??= arguments[2];
	//
	const { size, class: cls, style, strokeWidth } = props;
	let attrs = Object.entries(props)
		.filter(([k, v]) => !/^class|size|style|strokeWidth$/.test(k))
		.reduce((m, [k, v]) => [...m, `${k}="${v}"`], [])
		.join(' ');
	return `<svg ${style ? `style="${style}" ` : ''}${cls ? `class="${cls}" ` : ''}width="${size || 24}" height="${size || 24}" stroke-width="${strokeWidth ?? 2}" ${attrs ? `${attrs} ` : ''}viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
}

function iconFeatherRotateCw(props) {
	// Backward compatible signature support: fn(cls, size, style)
	if (props === null || props === undefined) props = {};
	if (typeof props !== 'object') props = { class: props || '' };
	if (arguments.length > 1) props.size ??= arguments[1];
	if (arguments.length > 2) props.style ??= arguments[2];
	//
	const { size, class: cls, style, strokeWidth } = props;
	let attrs = Object.entries(props)
		.filter(([k, v]) => !/^class|size|style|strokeWidth$/.test(k))
		.reduce((m, [k, v]) => [...m, `${k}="${v}"`], [])
		.join(' ');
	return `<svg ${style ? `style="${style}" ` : ''}${cls ? `class="${cls}" ` : ''}width="${size || 24}" height="${size || 24}" stroke-width="${strokeWidth ?? 2}" ${attrs ? `${attrs} ` : ''}viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>`;
}

export const acpDefaultIcons: AlertConfirmPromptIcons = {
	info: () => iconFeatherInfo({}),
	success: () => iconFeatherCheckCircle({}),
	warn: () => iconFeatherAlertTriangle({ class: '-mt-[3px]' }), // move up a little because it looks better with the triangle
	error: () => iconFeatherXOctagon({}),
	spinner: () => iconFeatherRotateCw({ size: 32, class: 'opacity-50' }),
};
