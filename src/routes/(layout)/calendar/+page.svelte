<script lang="ts">
	import {
		Calendar,
		createCalendarT,
		CALENDAR_MESSAGES_SK,
		addDaysIso,
		todayIso,
		formatIsoDate,
		type CalendarDayCell,
		type IsoDate,
		type YearMonth,
	} from "$lib/index.js";

	const today = todayIso();

	let single = $state<IsoDate | null>(today);
	let rangeStart = $state<IsoDate | null>(addDaysIso(today, 2));
	let rangeEnd = $state<IsoDate | null>(addDaysIso(today, 9));
	let twoStart = $state<IsoDate | null>(null);
	let twoEnd = $state<IsoDate | null>(null);
	let dob = $state<IsoDate | null>("1990-06-15");
	let bounded = $state<IsoDate | null>(null);
	let events = $state<IsoDate | null>(null);
	let view = $state<YearMonth>({ year: 2026, month: 1 });
	let sk = $state<IsoDate | null>(null);
	let de = $state<IsoDate | null>(null);
	let ja = $state<IsoDate | null>(null);
	let log = $state<string[]>([]);

	const tSk = createCalendarT(CALENDAR_MESSAGES_SK);

	// blackout: weekends
	const noWeekends = (_iso: IsoDate, cell: CalendarDayCell) => cell.isWeekend;

	// fake "events" for the custom day renderer
	const eventDays = new Set([
		addDaysIso(today, 1),
		addDaysIso(today, 3),
		addDaysIso(today, 8),
	]);

	function push(msg: string) {
		log = [msg, ...log].slice(0, 8);
	}
</script>

<div class="space-y-16 py-8 max-w-4xl">
	<section>
		<h2 class="text-xl font-semibold mb-2">Single date</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Click a day, or Tab into the grid and use the arrow keys (Home/End = week ends,
			PageUp/PageDown = month, Shift+PageUp/PageDown = year, Enter/Space = select). The
			footer buttons are opt-in.
		</p>
		<div class="flex flex-wrap gap-8 items-start">
			<Calendar
				bind:value={single}
				showToday
				showClear
				onSelect={(v) => push(`onSelect: ${v}`)}
			/>
			<div class="text-sm font-mono p-3 rounded bg-black/5 min-w-56">
				<div>value: <strong>{single ?? "null"}</strong></div>
				<div>formatted: {single ? formatIsoDate(single) : "—"}</div>
			</div>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<section>
		<h2 class="text-xl font-semibold mb-2">Range</h2>
		<p class="text-sm text-neutral-500 mb-4">
			First pick anchors, second completes (either order), a third pick starts over. Hover
			(or arrow around with the keyboard) after the first pick to preview the range.
		</p>
		<div class="flex flex-wrap gap-8 items-start">
			<Calendar
				mode="range"
				bind:start={rangeStart}
				bind:end={rangeEnd}
				showClear
				onRangeChange={(r) =>
					push(
						`onRangeChange: ${r.start} → ${r.end} (${r.complete ? "complete" : "partial"})`
					)}
			/>
			<div class="text-sm font-mono p-3 rounded bg-black/5 min-w-56">
				<div>start: <strong>{rangeStart ?? "null"}</strong></div>
				<div>end: <strong>{rangeEnd ?? "null"}</strong></div>
			</div>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<section>
		<h2 class="text-xl font-semibold mb-2">Two months, fixed weeks, week numbers</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>months=2</code> renders consecutive months (they wrap on narrow screens);
			<code>fixedWeeks</code> keeps the height stable; <code>showWeekNumbers</code> adds
			the ISO week column (always Monday-based, regardless of <code>weekStartsOn</code>).
		</p>
		<Calendar
			mode="range"
			bind:start={twoStart}
			bind:end={twoEnd}
			months={2}
			fixedWeeks
			showWeekNumbers
			showToday
			showClear
		/>
		<div class="text-sm font-mono p-3 rounded bg-black/5 mt-4">
			{twoStart ?? "null"} → {twoEnd ?? "null"}
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<section>
		<h2 class="text-xl font-semibold mb-2">Dropdown caption (date of birth)</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>captionLayout="dropdown"</code> swaps the caption for native month/year
			selects — the fastest way to reach a far-away year, and the mobile-native picker UI
			for free.
			<code>yearRange</code> bounds the year list; <code>max</code> disables the future.
		</p>
		<Calendar
			bind:value={dob}
			captionLayout="dropdown"
			yearRange={[1920, new Date().getFullYear()]}
			max={today}
			weekStartsOn={7}
		/>
		<div class="text-sm font-mono p-3 rounded bg-black/5 mt-4">
			value: {dob ?? "null"}
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<section>
		<h2 class="text-xl font-semibold mb-2">Bounds and blackout dates</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>min</code> / <code>max</code> disable days outside the window (and the
			navigation beyond it); <code>isDateDisabled</code> disables individual days — here the
			weekends. Disabled days stay reachable by keyboard (so the grid is navigable) but cannot
			be picked.
		</p>
		<Calendar
			bind:value={bounded}
			min={today}
			max={addDaysIso(today, 45)}
			isDateDisabled={noWeekends}
		/>
		<div class="text-sm font-mono p-3 rounded bg-black/5 mt-4">
			value: {bounded ?? "null"}
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<section>
		<h2 class="text-xl font-semibold mb-2">
			Custom day content (<code>renderDay</code>)
		</h2>
		<p class="text-sm text-neutral-500 mb-4">
			The snippet receives the full day state (iso, selected, today, outside, …). Here a
			dot marks days with "events".
		</p>
		<Calendar bind:value={events}>
			{#snippet renderDay(s)}
				<span class="relative inline-flex flex-col items-center leading-none">
					{s.day}
					{#if eventDays.has(s.iso)}
						<span
							class={[
								"absolute -bottom-2 size-1 rounded-full",
								s.selected ? "bg-current" : "bg-(--stuic-color-primary)",
							]}
						></span>
					{/if}
				</span>
			{/snippet}
		</Calendar>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<section>
		<h2 class="text-xl font-semibold mb-2">Controlled view</h2>
		<p class="text-sm text-neutral-500 mb-4">
			<code>bind:view</code> exposes the first displayed month; the imperative
			<code>goToMonth()</code> / <code>goToToday()</code> / <code>nextMonth()</code> do the
			same.
		</p>
		<div class="flex flex-wrap gap-2 mb-4">
			<button
				type="button"
				class="px-3 py-2 border rounded hover:bg-black/5"
				onclick={() => (view = { year: 2026, month: 1 })}>Jan 2026</button
			>
			<button
				type="button"
				class="px-3 py-2 border rounded hover:bg-black/5"
				onclick={() => (view = { year: 2026, month: 12 })}>Dec 2026</button
			>
			<span class="self-center text-sm font-mono">view: {view.year}-{view.month}</span>
		</div>
		<Calendar
			bind:view
			onViewChange={(v) => push(`onViewChange: ${v.year}-${v.month}`)}
		/>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<section>
		<h2 class="text-xl font-semibold mb-2">Locales and i18n</h2>
		<p class="text-sm text-neutral-500 mb-4">
			Day/month names come from <code>Intl</code> via <code>locale</code>; the UI texts
			(nav labels, Today, Clear, announcements) go through <code>t</code> — Slovak ships
			bundled (<code>CALENDAR_MESSAGES_SK</code>), anything else via
			<code>createCalendarT(yourCatalog)</code>.
		</p>
		<div class="flex flex-wrap gap-8 items-start">
			<div>
				<div class="text-sm mb-2 opacity-60">sk + Slovak texts</div>
				<Calendar bind:value={sk} locale="sk" t={tSk} showToday showClear />
			</div>
			<div>
				<div class="text-sm mb-2 opacity-60">de-DE</div>
				<Calendar bind:value={de} locale="de-DE" />
			</div>
			<div>
				<div class="text-sm mb-2 opacity-60">ja-JP, Sunday first</div>
				<Calendar bind:value={ja} locale="ja-JP" weekStartsOn={7} />
			</div>
		</div>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<section>
		<h2 class="text-xl font-semibold mb-2">Disabled</h2>
		<Calendar value={today} disabled showToday showClear />
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<section>
		<h2 class="text-xl font-semibold mb-2">Event log</h2>
		<pre class="text-xs p-3 rounded bg-black/5 min-h-24">{log.join("\n") ||
				"(interact above)"}</pre>
	</section>
</div>
