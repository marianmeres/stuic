import { CronParser } from "@marianmeres/cron";

/**
 * A reactive helper that parses a cron expression and computes the next run time,
 * updating automatically every minute.
 */
export class CronNextRun {
	#expression: string = $state("");
	#tick: number = $state(0);
	#interval: ReturnType<typeof setInterval> | undefined;

	constructor(expression: string = "* * * * *") {
		this.#expression = expression;
		this.#interval = setInterval(() => this.#tick++, 60_000);
	}

	get expression() {
		return this.#expression;
	}

	set expression(v: string) {
		this.#expression = v;
	}

	/** The next Date when the cron expression matches, or null if invalid. */
	get nextRun(): Date | null {
		// read tick to create reactive dependency
		void this.#tick;
		try {
			const parser = new CronParser(this.#expression);
			return parser.getNextRun();
		} catch {
			return null;
		}
	}

	/** Formatted next run string (YYYY-MM-DD HH:MM), or empty string if invalid. */
	get nextRunFormatted(): string {
		const next = this.nextRun;
		if (!next) return "";
		// the "sv-SE" is a trick/hack to get ISO 8601-ish local time (not UTC)
		return next.toLocaleString("sv-SE", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		});
	}

	/** Whether the current expression is valid. */
	get valid(): boolean {
		try {
			new CronParser(this.#expression);
			return true;
		} catch {
			return false;
		}
	}

	/** Stop the internal timer. Call when no longer needed. */
	destroy() {
		if (this.#interval) {
			clearInterval(this.#interval);
			this.#interval = undefined;
		}
	}
}
