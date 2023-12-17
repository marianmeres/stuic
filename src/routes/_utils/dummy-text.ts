import { getRandomParagraph } from '@marianmeres/random-human-readable';

export const dummyText = (n = 10, pcls = 'mb-4 max-w-md') => {
	let out = [];
	while (n--) out.push(getRandomParagraph());
	return `<p class="${pcls}">` + out.join(`</p>\n<p class="${pcls}">`) + '</p>\n';
};
