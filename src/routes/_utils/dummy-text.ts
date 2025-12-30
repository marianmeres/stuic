import {
	getRandomParagraph,
	getRandomSentence,
} from "@marianmeres/random-human-readable";

export const dummyText = (n = 10, pcls: string = "mb-4 max-w-md") => {
	const out = [];
	while (n--) out.push(getRandomParagraph());
	return `<p class="${pcls}">` + out.join(`</p>\n<p class="${pcls}">`) + "</p>\n";
};

export const dummySentence = (n = 10) => {
	const out = [];
	while (n--) out.push(getRandomSentence());
	return out.join(" ");
};
