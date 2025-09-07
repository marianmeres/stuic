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
