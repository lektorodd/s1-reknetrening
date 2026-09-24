// Whole-engine simulations: simulated students practising day after day.
//
// Unit tests check one rule at a time; these check what a student actually
// meets. Each finding from the audit that was only visible over many sessions
// — a veteran thrown level 5 integrals, one concept drawn ten times as often as
// another, a weak student stuck at levels they cannot do — is pinned here, so it
// cannot come back unnoticed.
//
// Everything random is seeded and the clock is simulated, so a run is repeatable.

import { afterEach, describe, expect, it } from 'vitest';
import { createStudentModel, type StudentModel } from '$lib/engine/student-model';
import { updateAfterAttempt } from '$lib/engine/spaced-repetition';
import { buildSession, filterBank, SESSION_LENGTH } from '$lib/engine/session';
import { conceptIdOf, conceptIdsForCourse, getFullBank } from '$lib/modules/registry';
import type { Problem } from '$lib/modules/types';

const DAY = 24 * 60 * 60 * 1000;
const realRandom = Math.random;
const realNow = Date.now;

afterEach(() => {
	Math.random = realRandom;
	Date.now = realNow;
});

/** mulberry32 — small, fast, good enough to stand in for Math.random. */
function seeded(seed: number): () => number {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** A simulated student: how likely they are to get a problem right, by level. */
type Ability = (level: number) => number;
const STRONG: Ability = () => 0.95;
const WEAK: Ability = (l) => [0.85, 0.65, 0.35, 0.2, 0.1][l - 1];

interface Card {
	day: number;
	problem: Problem;
	conceptId: string;
	isNew: boolean;
	correct: boolean;
}

/** Start a simulated world at a fixed date, with a seeded random source. */
function world(seed: number) {
	Math.random = seeded(seed);
	let now = new Date(2026, 8, 1, 16, 0).getTime();
	Date.now = () => now;
	return {
		/** One session a day for `days` days, 16:00 each afternoon. */
		practise(model: StudentModel, bank: Problem[], ability: Ability, days: number): Card[] {
			const log: Card[] = [];
			const rng = seeded(seed * 7919 + days);
			for (let day = 0; day < days; day++) {
				const session = buildSession(model, SESSION_LENGTH, bank);
				for (const card of session.cards) {
					const correct = rng() < ability(card.problem.level);
					updateAfterAttempt(model, {
						conceptId: card.conceptId,
						correct,
						hintUsed: false,
						level: card.problem.level
					});
					log.push({ day, problem: card.problem, conceptId: card.conceptId, isNew: card.isNewConcept, correct });
					now += 60 * 1000;
				}
				now = new Date(now + DAY).setHours(16, 0, 0, 0);
			}
			return log;
		}
	};
}

const S1 = () => filterBank(getFullBank(), { course: 'S1' });
const S2 = () => filterBank(getFullBank(), { course: 'S2' });
const share = (cards: Card[], pred: (c: Card) => boolean) =>
	cards.filter(pred).length / Math.max(1, cards.length);

describe('Simulated students', () => {
	it('gives an S1 veteran easy problems in their first S2 session', () => {
		// The audit: three level 5 integrals in the first S2 session, because the
		// cold start capped levels by a single overall level earned in S1.
		const w = world(1);
		const model = createStudentModel();
		w.practise(model, S1(), STRONG, 20);
		const first = w.practise(model, S2(), STRONG, 1);
		expect(first.map((c) => c.problem.level).every((l) => l <= 2), first.map((c) => c.problem.level).join(',')).toBe(true);
	});

	it('spreads practice over every concept in the course', () => {
		// The audit: 800 draws of one concept against 77 of another, because a
		// stable sort broke confidence ties the same way every time.
		const w = world(2);
		const model = createStudentModel();
		const log = w.practise(model, S1(), STRONG, 30);
		const draws = new Map<string, number>();
		for (const c of log) draws.set(c.conceptId, (draws.get(c.conceptId) ?? 0) + 1);
		const counts = [...draws.values()];
		const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
		expect(draws.size).toBe(conceptIdsForCourse('S1').length);
		expect(Math.min(...counts), JSON.stringify(Object.fromEntries(draws))).toBeGreaterThanOrEqual(0.4 * mean);
	});

	it('keeps a weak student mostly at levels they can manage', () => {
		// The audit: 35 % of a weak student's cards at level 4-5, 21 % success.
		const w = world(3);
		const model = createStudentModel();
		const log = w.practise(model, S1(), WEAK, 30);
		const hard = share(log, (c) => c.problem.level >= 4);
		const success = share(log, (c) => c.correct);
		expect(hard, `nivå 4-5: ${(hard * 100).toFixed(0)} %`).toBeLessThan(0.15);
		expect(success, `treff: ${(success * 100).toFixed(0)} %`).toBeGreaterThan(0.55);
	});

	it('lets a strong student climb to the hard levels', () => {
		// The other half of adapting: easing off for the weak student must not
		// hold a strong one back.
		const w = world(4);
		const model = createStudentModel();
		const log = w.practise(model, S1(), STRONG, 20);
		const late = log.filter((c) => c.day >= 15);
		const hard = share(late, (c) => c.problem.level >= 4);
		expect(hard, `nivå 4-5 dei siste dagane: ${(hard * 100).toFixed(0)} %`).toBeGreaterThan(0.4);
	});

	it('adapts to a student who drills a single topic', () => {
		// A topic with one concept never had three concepts attempted, so the
		// session stayed on the cold-start path forever and never adapted.
		const w = world(5);
		const model = createStudentModel();
		const bank = filterBank(getFullBank(), { course: 'S1', moduleId: 'logarithm', topic: 'log_power' });
		const log = w.practise(model, bank, STRONG, 10);
		const last = log.filter((c) => c.day === 9);
		const avg = last.reduce((s, c) => s + c.problem.level, 0) / last.length;
		expect(avg, `snittnivå siste dag: ${avg.toFixed(1)}`).toBeGreaterThanOrEqual(3.5);
	});

	it('introduces unseen S2 concepts at their easiest', () => {
		// New concepts came in registry order, so a level 5 integral could be the
		// first thing a student met of a whole method.
		const w = world(6);
		const model = createStudentModel();
		const bank = S2();
		// The first session is the cold start, capped at level 2 — tested above.
		w.practise(model, bank, STRONG, 1);
		for (let day = 1; day < 6; day++) {
			// The easiest level any concept still unseen starts at.
			const lowest = new Map<string, number>();
			for (const p of bank) {
				const id = conceptIdOf(p);
				if (model.concepts[id].lastSeen === 0) lowest.set(id, Math.min(lowest.get(id) ?? 9, p.level));
			}
			const easiest = Math.min(...lowest.values());
			const fresh = w.practise(model, bank, STRONG, 1).filter((c) => c.isNew);
			for (const c of fresh) {
				expect(c.problem.level, `dag ${day}: ${c.conceptId}@${c.problem.level}, lettaste att: ${easiest}`).toBe(easiest);
			}
		}
	});
});
