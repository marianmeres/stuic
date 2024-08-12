import { twMerge } from 'tailwind-merge';

export const clsClean = (s: string) => `${s || ''}`.replace(/\s+/gi, ' ').trim();

// twMerge does not seem to handle "\t" and/or "\n" within the input strings correctly,
// so we need to do the cleanup ourselves
export const twMerge2 = (...args: any[]) => twMerge(...args.map(clsClean));
