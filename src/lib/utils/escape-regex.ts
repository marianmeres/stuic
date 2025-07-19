export const escapeRegex = (str: string): string =>
	`${str}`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
