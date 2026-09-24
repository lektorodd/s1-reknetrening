// Date handling, run in the students' own time zone.
//
// The app used `toISOString()` for "today", which is the UTC date. In Norway
// that is still yesterday until 01:00 (02:00 in summer), so the streak and
// «Du har trena i dag» changed day in the middle of the night, and on the night
// the clocks go forward two days mapped to the same date — which made the
// progress page's keyed week chart throw.
//
// TZ must be set before anything reads the clock, so this lives in its own file.
// (Declared here because the project does not pull in the Node type definitions.)
declare const process: { env: Record<string, string | undefined> };
process.env.TZ = 'Europe/Oslo';

import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	createStudentModel,
	currentStreak,
	getDueCount,
	localISO,
	todayISO,
	updateStreak
} from '$lib/engine/student-model';
import { isDue, updateAfterAttempt } from '$lib/engine/spaced-repetition';

afterEach(() => {
	vi.useRealTimers();
});

/** The seven dates the week chart shows, oldest first — as framgang builds them. */
function weekDates(): string[] {
	const out: string[] = [];
	for (let i = 6; i >= 0; i--) {
		const d = new Date();
		d.setDate(d.getDate() - i);
		out.push(localISO(d));
	}
	return out;
}

describe('Local dates', () => {
	it('runs in Norwegian time', () => {
		// Guard: if TZ did not take, every test below proves nothing.
		expect(new Date('2026-09-22T22:30:00Z').getHours()).toBe(0);
	});

	it('counts a session at half past midnight as today, not yesterday', () => {
		vi.useFakeTimers();
		// 00:30 on Wednesday 23 September in Oslo is 22:30 UTC on the 22nd.
		vi.setSystemTime(new Date('2026-09-22T22:30:00Z'));
		expect(todayISO()).toBe('2026-09-23');
	});

	it('keeps a streak across the night instead of breaking it at 02:00', () => {
		vi.useFakeTimers();
		const model = createStudentModel();

		// Monday evening.
		vi.setSystemTime(new Date('2026-09-21T18:00:00Z'));
		updateStreak(model);
		expect(model.streakDays).toBe(1);

		// Tuesday, 00:30 local — a new day in Norway, still Monday in UTC.
		vi.setSystemTime(new Date('2026-09-21T22:30:00Z'));
		updateStreak(model);
		expect(model.lastActiveDate).toBe('2026-09-22');
		expect(model.streakDays).toBe(2);
	});

	it('gives the week chart seven distinct days across the spring clock change', () => {
		vi.useFakeTimers();
		// 01:30 local on Monday 30 March 2026, the night after the clocks went
		// forward. With UTC dates, two of the seven days came out identical.
		vi.setSystemTime(new Date(2026, 2, 30, 1, 30));
		const days = weekDates();
		expect(new Set(days).size).toBe(7);
		expect(days[6]).toBe('2026-03-30');
	});

	it('gives seven distinct days at every quarter hour of a whole year', () => {
		// The audit found the crash in 24 quarter-hour slots a year; sweep them all.
		vi.useFakeTimers();
		const start = new Date(2026, 0, 1, 0, 0).getTime();
		const QUARTER = 15 * 60 * 1000;
		let bad = 0;
		for (let t = start; t < start + 366 * 24 * 60 * 60 * 1000; t += QUARTER) {
			vi.setSystemTime(t);
			if (new Set(weekDates()).size !== 7) bad++;
		}
		expect(bad).toBe(0);
	});
});

describe('Due by calendar day', () => {
	it('makes a concept practised in the evening due the next afternoon', () => {
		// Counted in hours, 20:00 plus one day was 20:00 the next day, and a
		// student who trains after school found nothing to review.
		vi.useFakeTimers();
		const model = createStudentModel();
		vi.setSystemTime(new Date(2026, 8, 21, 20, 0));
		updateAfterAttempt(model, { conceptId: 'log_power', correct: true, hintUsed: false, level: 1 });
		expect(model.concepts['log_power'].currentInterval).toBe(1);

		vi.setSystemTime(new Date(2026, 8, 21, 23, 59));
		expect(isDue(model.concepts['log_power'])).toBe(false);
		vi.setSystemTime(new Date(2026, 8, 22, 15, 0));
		expect(isDue(model.concepts['log_power'])).toBe(true);
		expect(getDueCount(model)).toBe(1);
	});

	it('counts the day across the autumn clock change as one day', () => {
		vi.useFakeTimers();
		const model = createStudentModel();
		// Saturday 24 October 2026, 23:30; the clocks go back that night.
		vi.setSystemTime(new Date(2026, 9, 24, 23, 30));
		updateAfterAttempt(model, { conceptId: 'log_power', correct: true, hintUsed: false, level: 1 });
		// Sunday 00:30 — a 25-hour day has started, and it is still just one day.
		vi.setSystemTime(new Date(2026, 9, 25, 0, 30));
		expect(isDue(model.concepts['log_power'])).toBe(true);
	});
});

describe('The streak shown', () => {
	it('is the stored streak while it is still alive', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2026, 8, 21, 18, 0));
		const model = createStudentModel();
		model.streakDays = 6;
		model.lastActiveDate = '2026-09-20';
		expect(currentStreak(model)).toBe(6);
		model.lastActiveDate = '2026-09-21';
		expect(currentStreak(model)).toBe(6);
	});

	it('is zero once a whole day has been missed', () => {
		// The home page used to show last month's streak to a returning student.
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2026, 8, 21, 18, 0));
		const model = createStudentModel();
		model.streakDays = 6;
		model.lastActiveDate = '2026-09-19';
		expect(currentStreak(model)).toBe(0);
	});
});
