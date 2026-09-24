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
	localISO,
	todayISO,
	updateStreak
} from '$lib/engine/student-model';

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
