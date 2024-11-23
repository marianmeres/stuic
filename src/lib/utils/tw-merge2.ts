import { twMerge } from 'tailwind-merge';
import { type ClassNameValue } from 'tailwind-merge';

export const clsClean = (s: ClassNameValue) => {
	if (Array.isArray(s)) s = s.join(' ');
	return `${s || ''}`.replace(/\s+/g, ' ').trim();
};

// twMerge does not seem to handle "\r", "\n" and/or "\t" within the input strings correctly,
// so we need to do the cleanup ourselves
export const twMerge2 = (...args: ClassNameValue[]) => twMerge(...args.map(clsClean));
