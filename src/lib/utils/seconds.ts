/**
 * Converts a total number of seconds into days, hours, minutes, and seconds.
 *
 * @param totalSeconds - The total number of seconds (must be non-negative)
 * @returns An object with `days`, `hours`, `minutes`, and `seconds` properties
 * @throws Error if totalSeconds is negative
 *
 * @example
 * ```ts
 * convertSeconds(90061);  // { days: 1, hours: 1, minutes: 1, seconds: 1 }
 * convertSeconds(3661);   // { days: 0, hours: 1, minutes: 1, seconds: 1 }
 * convertSeconds(61);     // { days: 0, hours: 0, minutes: 1, seconds: 1 }
 * ```
 */
export function convertSeconds(totalSeconds: number) {
	if (totalSeconds < 0) {
		throw new Error("Seconds cannot be negative");
	}

	if (!Number.isInteger(totalSeconds)) {
		totalSeconds = Math.floor(totalSeconds);
	}

	const days = Math.floor(totalSeconds / 86400);
	const hours = Math.floor((totalSeconds % 86400) / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	return {
		days,
		hours,
		minutes,
		seconds,
	};
}

/**
 * Formats a duration in seconds as a human-readable string.
 *
 * @param totalSeconds - The total number of seconds
 * @returns A formatted string like "1 day, 2 hours, 3 minutes, 4 seconds"
 *
 * @example
 * ```ts
 * formatDuration(90061);  // "1 day, 1 hour, 1 minute, 1 second"
 * formatDuration(3661);   // "1 hour, 1 minute, 1 second"
 * formatDuration(0);      // "0 seconds"
 * ```
 */
export function formatDuration(totalSeconds: number) {
	const time = convertSeconds(totalSeconds);
	const parts = [];

	if (time.days > 0) {
		parts.push(`${time.days} day${time.days !== 1 ? "s" : ""}`);
	}
	if (time.hours > 0) {
		parts.push(`${time.hours} hour${time.hours !== 1 ? "s" : ""}`);
	}
	if (time.minutes > 0) {
		parts.push(`${time.minutes} minute${time.minutes !== 1 ? "s" : ""}`);
	}
	if (time.seconds > 0) {
		parts.push(`${time.seconds} second${time.seconds !== 1 ? "s" : ""}`);
	}

	return parts.length > 0 ? parts.join(", ") : "0 seconds";
}
