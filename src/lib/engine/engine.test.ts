// Unit tests for the Learning Engine
//
// Tests: student-model, spaced-repetition, problem-selector, guidance-fading
// Run with: npm test

import { describe, it, expect, beforeEach } from 'vitest';
import {
	createStudentModel,
	getSuccessRate,
	getConceptCount,
	getDueCount,
	getOrCreateTodaySession,
	updateStreak,
	todayISO,
	getReviewBuckets,
	getRegisteredConceptIds,
	localISO,
	MAX_INTERVAL_DAYS,
	type StudentModel
} from '$lib/engine/student-model';
import {
	isDue,
	urgency,
	updateAfterAttempt
} from '$lib/engine/spaced-repetition';
import { selectNextProblems, splitBudget } from '$lib/engine/problem-selector';
import { fadeSteps } from '$lib/engine/guidance-fading';
import { buildSession, filterBank, SESSION_LENGTH } from '$lib/engine/session';
import { buildLadder, LADDER_LEVEL, LADDER_RUNGS, rungsFor } from '$lib/engine/ladder';
import {
	COURSES,
	MODULE_REGISTRY,
	conceptIdOf,
	getAllConceptIds,
	getFullBank,
	getModuleBySlug,
	modulesForCourse
} from '$lib/modules/registry';
import type { Problem, StepEntry } from '$lib/modules/types';

// ── Helpers ──

const DAY = 24 * 60 * 60 * 1000;

function makeProblem(overrides: Partial<Problem> & { id: string }): Problem {
	return {
		moduleId: 'derivative',
		topic: 'chain',
		level: 1,
		type: 'poly',
		q: 'f(x) = x^2',
		a: "f'(x) = 2x",
		structuredSteps: [
			{ label: 'Identifiser', latex: 'g(u) = u^2' },
			{ label: 'Deriver g', latex: "g'(u) = 2u" },
			{ label: 'Deriver u', latex: "u'(x) = 1" },
			{ label: 'Bruk kjerneregelen', latex: "f'(x) = g'(u) * u'(x)" },
			{ label: 'Sett inn', latex: "f'(x) = 2x * 1" },
			{ label: 'Forenkle', latex: "f'(x) = 2x" }
		],
		hint: 'Bruk potensregelen',
		...overrides
	};
}

/**
 * The real bank, not a synthetic one.
 *
 * The previous suite built a 3x4x5 fixture covering combinations the generator
 * cannot actually produce, which is exactly why it never noticed that 7 of the
 * 12 declared concepts had no problems behind them.
 */
function realBank(): Problem[] {
	return getFullBank();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STUDENT MODEL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('StudentModel', () => {
	it('creates model with all registered concepts', () => {
		const model = createStudentModel();
		const allIds = getAllConceptIds();
		expect(Object.keys(model.concepts)).toHaveLength(allIds.length);
		for (const id of allIds) {
			expect(model.concepts[id]).toBeDefined();
			expect(model.concepts[id].confidence).toBe(0.5);
			expect(model.concepts[id].lastSeen).toBe(0);
		}
	});

	it('includes both derivative and logarithm concepts', () => {
		const model = createStudentModel();
		expect(model.concepts['chain_poly']).toBeDefined();
		expect(model.concepts['quotient_poly']).toBeDefined();
		expect(model.concepts['log_product']).toBeDefined();
		expect(model.concepts['exp_equation']).toBeDefined();
	});

	it('starts at overall level 1.0', () => {
		const model = createStudentModel();
		expect(model.overallLevel).toBe(1.0);
	});

	it('conceptIdOf routes a problem through its owning module', () => {
		const derivative = makeProblem({ id: 'x', moduleId: 'derivative', topic: 'chain', type: 'root' });
		expect(conceptIdOf(derivative)).toBe('chain_root');

		// The logarithm module treats the topic itself as the concept.
		const logarithm = makeProblem({ id: 'y', moduleId: 'logarithm', topic: 'log_power', type: 'lg' });
		expect(conceptIdOf(logarithm)).toBe('log_power');
	});

	it('getSuccessRate returns 0 with no attempts', () => {
		const model = createStudentModel();
		expect(getSuccessRate(model)).toBe(0);
	});

	it('getSuccessRate computes correctly', () => {
		const model = createStudentModel();
		model.totalAttempts = 10;
		model.totalCorrect = 7;
		expect(getSuccessRate(model)).toBe(70);
	});

	it('getDueCount returns 0 for fresh model', () => {
		const model = createStudentModel();
		expect(getDueCount(model)).toBe(0);
	});
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SPACED REPETITION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('Spaced Repetition', () => {
	let model: StudentModel;

	beforeEach(() => {
		model = createStudentModel();
	});

	it('isDue returns false for never-seen concept', () => {
		expect(isDue(model.concepts['chain_poly'])).toBe(false);
	});

	it('isDue returns true when overdue', () => {
		const concept = model.concepts['chain_poly'];
		concept.lastSeen = Date.now() - 3 * 24 * 60 * 60 * 1000;
		concept.currentInterval = 2;
		expect(isDue(concept)).toBe(true);
	});

	it('isDue returns false when not yet due', () => {
		const concept = model.concepts['chain_poly'];
		concept.lastSeen = Date.now() - 1 * 60 * 60 * 1000;
		concept.currentInterval = 1;
		expect(isDue(concept)).toBe(false);
	});

	it('urgency is 0 for unseen concepts', () => {
		expect(urgency(model.concepts['chain_poly'])).toBe(0);
	});

	it('urgency is higher for more overdue concepts', () => {
		const a = model.concepts['chain_poly'];
		const b = model.concepts['chain_root'];
		a.lastSeen = Date.now() - 5 * 24 * 60 * 60 * 1000;
		a.currentInterval = 1;
		a.confidence = 0.3;
		b.lastSeen = Date.now() - 2 * 24 * 60 * 60 * 1000;
		b.currentInterval = 1;
		b.confidence = 0.3;
		expect(urgency(a)).toBeGreaterThan(urgency(b));
	});

	it('correct answer increases confidence', () => {
		const before = model.concepts['chain_poly'].confidence;
		updateAfterAttempt(model, { conceptId: 'chain_poly', correct: true, hintUsed: false });
		expect(model.concepts['chain_poly'].confidence).toBeGreaterThan(before);
	});

	it('incorrect answer decreases confidence', () => {
		const before = model.concepts['chain_poly'].confidence;
		updateAfterAttempt(model, { conceptId: 'chain_poly', correct: false, hintUsed: false });
		expect(model.concepts['chain_poly'].confidence).toBeLessThan(before);
	});

	it('correct answer sets interval to 1 on first attempt', () => {
		updateAfterAttempt(model, { conceptId: 'chain_poly', correct: true, hintUsed: false });
		expect(model.concepts['chain_poly'].currentInterval).toBe(1);
	});

	it('a correct answer on a due review grows the interval by the ease factor', () => {
		const concept = model.concepts['chain_poly'];
		updateAfterAttempt(model, { conceptId: 'chain_poly', correct: true, hintUsed: false });
		// Come back once it is due.
		concept.lastSeen = Date.now() - 2 * DAY;
		updateAfterAttempt(model, { conceptId: 'chain_poly', correct: true, hintUsed: false });
		expect(concept.currentInterval).toBeGreaterThan(1);
	});

	it('does not grow the interval when the same concept comes round again early', () => {
		// The concept drawn three times in one session used to triple its
		// schedule in five minutes: ten correct ratings took it to 1078 days.
		const concept = model.concepts['chain_poly'];
		for (let i = 0; i < 10; i++) {
			updateAfterAttempt(model, { conceptId: 'chain_poly', correct: true, hintUsed: false });
		}
		expect(concept.currentInterval).toBe(1);
	});

	it('never schedules a concept further away than the ceiling', () => {
		const concept = model.concepts['chain_poly'];
		updateAfterAttempt(model, { conceptId: 'chain_poly', correct: true, hintUsed: false });
		// A year of perfect, on-time reviews.
		for (let i = 0; i < 40; i++) {
			concept.lastSeen = Date.now() - (concept.currentInterval + 1) * DAY;
			updateAfterAttempt(model, { conceptId: 'chain_poly', correct: true, hintUsed: false });
		}
		expect(concept.currentInterval).toBe(MAX_INTERVAL_DAYS);
		expect(Number.isFinite(concept.currentInterval)).toBe(true);
	});

	it('a lapse brings the concept back tomorrow', () => {
		const concept = model.concepts['chain_poly'];
		concept.currentInterval = 40;
		concept.lastSeen = Date.now() - 41 * DAY;
		updateAfterAttempt(model, { conceptId: 'chain_poly', correct: false, hintUsed: false });
		// Halving used to leave a 1078-day interval at 539.
		expect(concept.currentInterval).toBe(1);
	});

	it('repairs a model saved before the ceiling existed', () => {
		// An interval that overflowed became Infinity, which JSON stores as null.
		// Both it and a merely huge value must come back into range, so the
		// concept can be due again instead of being lost for good.
		const huge = model.concepts['chain_poly'];
		huge.currentInterval = 1078;
		huge.lastSeen = Date.now() - (MAX_INTERVAL_DAYS + 1) * DAY;
		expect(isDue(huge)).toBe(true);

		const overflowed = model.concepts['chain_root'];
		(overflowed as { currentInterval: unknown }).currentInterval = null;
		overflowed.lastSeen = Date.now() - 2 * DAY;
		expect(isDue(overflowed)).toBe(true);
		updateAfterAttempt(model, { conceptId: 'chain_root', correct: true, hintUsed: false });
		expect(Number.isFinite(overflowed.currentInterval)).toBe(true);
		expect(overflowed.currentInterval).toBeLessThanOrEqual(MAX_INTERVAL_DAYS);
	});

	it('keeps a daily student with something to review after a month', () => {
		// The audit's simulation: a strong student answering everything right
		// every day had nothing due from day 5 onwards.
		const ids = ['chain_poly', 'chain_root', 'product_poly', 'quotient_poly', 'log_product'];
		let now = Date.now();
		const realNow = Date.now;
		try {
			let dueOnSomeLaterDay = false;
			for (let day = 0; day < 30; day++) {
				Date.now = () => now;
				const due = ids.filter((id) => isDue(model.concepts[id]));
				if (day >= 10 && due.length > 0) dueOnSomeLaterDay = true;
				// Practise what is due, plus anything new; three times each, as a
				// session that draws a concept repeatedly would.
				for (const id of ids) {
					const c = model.concepts[id];
					if (c.lastSeen === 0 || isDue(c)) {
						for (let k = 0; k < 3; k++) {
							updateAfterAttempt(model, { conceptId: id, correct: true, hintUsed: false });
						}
					}
				}
				now += DAY;
			}
			expect(dueOnSomeLaterDay).toBe(true);
			for (const id of ids) {
				expect(model.concepts[id].currentInterval).toBeLessThanOrEqual(MAX_INTERVAL_DAYS);
			}
		} finally {
			Date.now = realNow;
		}
	});

	it('incorrect answer reduces ease factor', () => {
		const before = model.concepts['chain_poly'].easeFactor;
		updateAfterAttempt(model, { conceptId: 'chain_poly', correct: false, hintUsed: false });
		expect(model.concepts['chain_poly'].easeFactor).toBeLessThan(before);
	});

	it('ease factor never drops below 1.3', () => {
		for (let i = 0; i < 20; i++) {
			updateAfterAttempt(model, { conceptId: 'chain_poly', correct: false, hintUsed: false });
		}
		expect(model.concepts['chain_poly'].easeFactor).toBeGreaterThanOrEqual(1.3);
	});

	it('updates total attempt counters', () => {
		updateAfterAttempt(model, { conceptId: 'chain_poly', correct: true, hintUsed: false });
		updateAfterAttempt(model, { conceptId: 'chain_poly', correct: false, hintUsed: false });
		expect(model.totalAttempts).toBe(2);
		expect(model.totalCorrect).toBe(1);
	});

	it('hint usage increases hintsUsedFrequency', () => {
		updateAfterAttempt(model, { conceptId: 'chain_poly', correct: true, hintUsed: true });
		expect(model.concepts['chain_poly'].hintsUsedFrequency).toBeGreaterThan(0);
	});

	it('overall level increases after many correct answers', () => {
		const concepts = ['chain_poly', 'chain_root', 'product_poly', 'product_root'];
		for (const cId of concepts) {
			for (let i = 0; i < 5; i++) {
				updateAfterAttempt(model, { conceptId: cId, correct: true, hintUsed: false });
			}
		}
		expect(model.overallLevel).toBeGreaterThan(1.0);
	});
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROBLEM SELECTOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('Problem Selector', () => {
	let model: StudentModel;
	let bank: Problem[];

	beforeEach(() => {
		model = createStudentModel();
		bank = realBank();
	});

	it('returns requested number of problems', () => {
		const selected = selectNextProblems(model, bank, 5);
		expect(selected).toHaveLength(5);
	});

	it('returns no duplicates', () => {
		const selected = selectNextProblems(model, bank, 5);
		const ids = selected.map(p => p.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('cold-start prefers easy levels (1-2)', () => {
		let totalLevel = 0;
		let count = 0;
		for (let i = 0; i < 20; i++) {
			const selected = selectNextProblems(model, bank, 5);
			for (const p of selected) {
				totalLevel += p.level;
				count++;
			}
		}
		const avgLevel = totalLevel / count;
		expect(avgLevel).toBeLessThan(2.5);
	});

	it('cold-start includes problems from multiple topics', () => {
		const selected = selectNextProblems(model, bank, 5);
		const topics = new Set(selected.map(p => p.topic));
		expect(topics.size).toBeGreaterThanOrEqual(2);
	});

	it('after rating concepts, still fills the whole request', () => {
		const concepts = ['chain_poly', 'chain_root', 'product_poly', 'log_power'];
		for (const cId of concepts) {
			updateAfterAttempt(model, { conceptId: cId, correct: true, hintUsed: false });
		}
		const selected = selectNextProblems(model, bank, 5);
		expect(selected).toHaveLength(5);
		const ids = selected.map(p => p.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('handles small bank gracefully', () => {
		const smallBank = bank.slice(0, 3);
		const selected = selectNextProblems(model, smallBank, 5);
		expect(selected.length).toBeLessThanOrEqual(5);
		expect(selected.length).toBeGreaterThan(0);
	});

	it('preferentially returns weak concepts after mixed rating', () => {
		for (let i = 0; i < 5; i++) {
			updateAfterAttempt(model, { conceptId: 'chain_poly', correct: true, hintUsed: false });
			updateAfterAttempt(model, { conceptId: 'chain_root', correct: false, hintUsed: false });
			updateAfterAttempt(model, { conceptId: 'product_poly', correct: true, hintUsed: false });
			updateAfterAttempt(model, { conceptId: 'log_power', correct: false, hintUsed: false });
		}

		let weakCount = 0;
		let strongCount = 0;
		for (let i = 0; i < 50; i++) {
			const selected = selectNextProblems(model, bank, 5);
			for (const p of selected) {
				const cId = conceptIdOf(p);
				if (cId === 'chain_root' || cId === 'log_power') weakCount++;
				if (cId === 'chain_poly' || cId === 'product_poly') strongCount++;
			}
		}
		expect(weakCount).toBeGreaterThan(strongCount);
	});

	it('mixes modules once more than one has been started', () => {
		updateAfterAttempt(model, { conceptId: 'chain_poly', correct: true, hintUsed: false });
		updateAfterAttempt(model, { conceptId: 'log_product', correct: false, hintUsed: false });
		updateAfterAttempt(model, { conceptId: 'quotient_poly', correct: true, hintUsed: false });

		const modules = new Set<string>();
		for (let i = 0; i < 10; i++) {
			for (const p of selectNextProblems(model, bank, SESSION_LENGTH)) modules.add(p.moduleId);
		}
		expect(modules.size).toBeGreaterThanOrEqual(2);
	});

	it('splitBudget keeps a slot for new material', () => {
		// The old ceil()-based split produced 3 + 2 + 0 here.
		const five = splitBudget(5);
		expect(five.review + five.challenge + five.fresh).toBe(5);
		expect(five.fresh).toBeGreaterThan(0);

		const ten = splitBudget(10);
		expect(ten.review + ten.challenge + ten.fresh).toBe(10);
		expect(ten.review).toBe(6);
		expect(ten.challenge).toBe(3);
		expect(ten.fresh).toBe(1);
	});
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GUIDANCE FADING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('Guidance Fading', () => {
	let model: StudentModel;

	const sampleSteps: StepEntry[] = [
		{ label: 'Identify', latex: 'g(u) = u^2, u(x) = 3x+1' },
		{ label: 'Differentiate g', latex: "g'(u) = 2u" },
		{ label: 'Differentiate u', latex: "u'(x) = 3" },
		{ label: 'Apply', latex: "f'(x) = g'(u) * u'(x)" },
		{ label: 'Substitute', latex: "f'(x) = 2(3x+1) * 3" },
		{ label: 'Simplify', latex: "f'(x) = 6(3x+1)" }
	];

	beforeEach(() => {
		model = createStudentModel();
	});

	it('fadeSteps level 0 shows all steps', () => {
		const result = fadeSteps(sampleSteps, 0);
		expect(result.shown).toHaveLength(6);
		expect(result.hidden).toHaveLength(0);
		expect(result.prompt).toBe('fading_study');
	});

	it('fadeSteps level 4 hides all steps', () => {
		const result = fadeSteps(sampleSteps, 4);
		expect(result.shown).toHaveLength(0);
		expect(result.hidden).toHaveLength(6);
		expect(result.prompt).toBe('fading_independent');
	});

	it('fadeSteps level 1 shows all but last', () => {
		const result = fadeSteps(sampleSteps, 1);
		expect(result.shown).toHaveLength(5);
		expect(result.hidden).toHaveLength(1);
		expect(result.hidden[0].label).toBe('Simplify');
	});

	it('fadeSteps level 2 shows all but last two', () => {
		const result = fadeSteps(sampleSteps, 2);
		expect(result.shown).toHaveLength(4);
		expect(result.hidden).toHaveLength(2);
	});

	it('fadeSteps level 3 shows ~40% of steps', () => {
		const result = fadeSteps(sampleSteps, 3);
		expect(result.shown).toHaveLength(3);
		expect(result.hidden).toHaveLength(3);
	});
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SESSION HISTORY & STREAK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('Session History', () => {
	let model: StudentModel;

	beforeEach(() => {
		model = createStudentModel();
	});

	it('new model has empty session history', () => {
		expect(model.sessionHistory).toEqual([]);
		expect(model.streakDays).toBe(0);
		expect(model.lastActiveDate).toBe('');
	});

	it('updateAfterAttempt creates today session entry', () => {
		updateAfterAttempt(model, { conceptId: 'chain_poly', correct: true, hintUsed: false });
		expect(model.sessionHistory).toHaveLength(1);
		expect(model.sessionHistory[0].date).toBe(todayISO());
		expect(model.sessionHistory[0].correct).toBe(1);
		expect(model.sessionHistory[0].incorrect).toBe(0);
	});

	it('updateAfterAttempt increments counters on same day', () => {
		updateAfterAttempt(model, { conceptId: 'chain_poly', correct: true, hintUsed: false });
		updateAfterAttempt(model, { conceptId: 'chain_poly', correct: false, hintUsed: true });
		updateAfterAttempt(model, { conceptId: 'chain_root', correct: true, hintUsed: false });
		expect(model.sessionHistory).toHaveLength(1);
		expect(model.sessionHistory[0].correct).toBe(2);
		expect(model.sessionHistory[0].incorrect).toBe(1);
		expect(model.sessionHistory[0].hintsUsed).toBe(1);
		expect(model.sessionHistory[0].conceptsTouched).toContain('chain_poly');
		expect(model.sessionHistory[0].conceptsTouched).toContain('chain_root');
	});

	it('getOrCreateTodaySession caps at 90 entries', () => {
		// Fill with 95 fake entries
		for (let i = 0; i < 95; i++) {
			const d = new Date();
			d.setDate(d.getDate() - (95 - i));
			model.sessionHistory.push({
				date: d.toISOString().slice(0, 10),
				correct: 1, incorrect: 0, hintsUsed: 0, conceptsTouched: []
			});
		}
		expect(model.sessionHistory.length).toBe(95);
		getOrCreateTodaySession(model); // adds today, triggers cap
		expect(model.sessionHistory.length).toBeLessThanOrEqual(90);
	});

	it('streak starts at 1 on first use', () => {
		updateStreak(model);
		expect(model.streakDays).toBe(1);
		expect(model.lastActiveDate).toBe(todayISO());
	});

	it('streak increments for consecutive days', () => {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		model.lastActiveDate = yesterday.toISOString().slice(0, 10);
		model.streakDays = 3;
		updateStreak(model);
		expect(model.streakDays).toBe(4);
	});

	it('streak resets after gap', () => {
		const twoDaysAgo = new Date();
		twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
		model.lastActiveDate = twoDaysAgo.toISOString().slice(0, 10);
		model.streakDays = 5;
		updateStreak(model);
		expect(model.streakDays).toBe(1);
	});
});

describe('Review Buckets', () => {
	it('returns empty buckets for fresh model', () => {
		const model = createStudentModel();
		const buckets = getReviewBuckets(model);
		expect(buckets.dueNow).toHaveLength(0);
		expect(buckets.dueTomorrow).toHaveLength(0);
		expect(buckets.dueWeek).toHaveLength(0);
	});

	it('marks overdue concepts as dueNow', () => {
		const model = createStudentModel();
		const concept = model.concepts['chain_poly'];
		concept.lastSeen = Date.now() - 3 * 24 * 60 * 60 * 1000; // 3 days ago
		concept.currentInterval = 2; // due every 2 days
		const buckets = getReviewBuckets(model);
		expect(buckets.dueNow).toContain(concept);
	});
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODULES & BANK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('Module registry and problem bank', () => {
	it('every declared concept is actually produced by a generator', () => {
		// The bug this locks down: the pre-0.6 registry declared 12 derivative
		// concepts while the generator could only produce 5.
		const produced = new Set(getFullBank().map(conceptIdOf));
		for (const id of getAllConceptIds()) {
			expect(produced.has(id), `no problem generates concept "${id}"`).toBe(true);
		}
	});

	it('problem ids are unique across every module', () => {
		const ids = getFullBank().map((p) => p.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('the same id always yields the same problem', () => {
		const first = MODULE_REGISTRY.flatMap((m) => m.generateBank());
		const second = MODULE_REGISTRY.flatMap((m) => m.generateBank());
		expect(JSON.stringify(second)).toBe(JSON.stringify(first));
	});

	it('ids encode module, topic, level and variant', () => {
		for (const p of getFullBank()) {
			expect(p.id).toBe(`${p.moduleId}:${p.topic}:${p.level}:${p.id.split(':')[3]}`);
		}
	});

	it('every problem has steps, a question and an answer', () => {
		for (const p of getFullBank()) {
			expect(p.structuredSteps.length, p.id).toBeGreaterThan(0);
			expect(p.q.length, p.id).toBeGreaterThan(0);
			expect(p.a.length, p.id).toBeGreaterThan(0);
			for (const step of p.structuredSteps) {
				expect(step.label.length, p.id).toBeGreaterThan(0);
			}
		}
	});

	it('every module has theory for each of its topics', () => {
		for (const mod of MODULE_REGISTRY) {
			for (const topic of mod.topics) {
				const entry = mod.theory[topic.id];
				expect(entry, `${mod.id}/${topic.id}`).toBeDefined();
				expect(entry.workedSteps.length).toBeGreaterThan(0);
			}
		}
	});

	it('self-explanation prompts point at a real option', () => {
		for (const mod of MODULE_REGISTRY) {
			for (const [topic, pool] of Object.entries(mod.selfExplanations)) {
				for (const prompt of pool) {
					expect(prompt.options.length, `${mod.id}/${topic}`).toBeGreaterThan(1);
					expect(prompt.correct).toBeGreaterThanOrEqual(0);
					expect(prompt.correct).toBeLessThan(prompt.options.length);
				}
			}
		}
	});

	it('stores bare LaTeX, leaving delimiters to the view', () => {
		// Pre-0.6 the derivative module wrapped answers in $$ and the logarithm
		// module did not, so a shared card component could not render both.
		for (const p of getFullBank()) {
			expect(p.q, p.id).not.toMatch(/\$/);
			expect(p.a, p.id).not.toMatch(/\$/);
			for (const step of p.structuredSteps) {
				expect(step.latex, p.id).not.toMatch(/\$/);
			}
		}

		for (const mod of MODULE_REGISTRY) {
			for (const [topic, entry] of Object.entries(mod.theory)) {
				expect(entry.formula, `${mod.id}/${topic}`).not.toMatch(/\$/);
				for (const step of entry.workedSteps) {
					expect(step.latex, `${mod.id}/${topic}`).not.toMatch(/\$/);
				}
			}
		}
	});

	it('exposes modules by slug for the Lærebok routes', () => {
		expect(getModuleBySlug('derivasjon')?.id).toBe('derivative');
		expect(getModuleBySlug('logaritmar')?.id).toBe('logarithm');
		expect(getModuleBySlug('finst-ikkje')).toBeUndefined();
	});
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SESSION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('Session builder', () => {
	it('builds a full session for a brand-new student', () => {
		const session = buildSession(createStudentModel());
		expect(session.cards).toHaveLength(SESSION_LENGTH);
	});

	it('carries no scaffolding level — a session is the plain problem bank', () => {
		// How much of a solution is shown is instruction, and belongs to the
		// Lærebok ladder where the student steps through it deliberately.
		// Drawing faded and unfaded problems side by side made it pot luck which
		// kind of task the next card would be.
		const session = buildSession(createStudentModel());
		for (const card of session.cards) {
			expect(card).not.toHaveProperty('level');
		}
	});

	it('varies difficulty, which is the axis a session does vary', () => {
		const model = createStudentModel();
		const levels = new Set<number>();
		for (let i = 0; i < 20; i++) {
			for (const c of buildSession(model).cards) levels.add(c.problem.level);
		}
		expect(levels.size).toBeGreaterThan(1);
	});

	it('flags concepts the student has not met', () => {
		const session = buildSession(createStudentModel());
		expect(session.cards.every((c) => c.isNewConcept)).toBe(true);
	});

	it('honours a narrowed bank, as the topic filter supplies', () => {
		const bank = getFullBank().filter((p) => p.topic === 'chain' && p.level === 3);
		const session = buildSession(createStudentModel(), 5, bank);
		expect(session.cards.length).toBeGreaterThan(0);
		for (const card of session.cards) {
			expect(card.problem.topic).toBe('chain');
			expect(card.problem.level).toBe(3);
		}
	});

	it('attaches the owning module concept to every card', () => {
		const session = buildSession(createStudentModel());
		for (const card of session.cards) {
			expect(card.conceptId).toBe(conceptIdOf(card.problem));
		}
	});
});

describe('Bank filter', () => {
	it('leaves the bank untouched when nothing is chosen', () => {
		const bank = getFullBank();
		expect(filterBank(bank)).toBe(bank);
		expect(filterBank(bank, {})).toBe(bank);
	});

	it('narrows to a subject, keeping every topic within it', () => {
		const subset = filterBank(getFullBank(), { moduleId: 'derivative' });
		expect(subset.length).toBeGreaterThan(0);
		expect(subset.every((p) => p.moduleId === 'derivative')).toBe(true);
		// "Whole subject" is the step between all subjects and one topic, so it
		// has to span more than one topic to mean anything.
		expect(new Set(subset.map((p) => p.topic)).size).toBeGreaterThan(1);
	});

	it('narrows to one topic within a subject', () => {
		const subset = filterBank(getFullBank(), { moduleId: 'derivative', topic: 'chain' });
		expect(subset.length).toBeGreaterThan(0);
		expect(subset.every((p) => p.moduleId === 'derivative' && p.topic === 'chain')).toBe(true);
	});

	it('takes the intersection when a level is combined with a subject', () => {
		const subset = filterBank(getFullBank(), { moduleId: 'logarithm', level: 4 });
		expect(subset.length).toBeGreaterThan(0);
		expect(subset.every((p) => p.moduleId === 'logarithm' && p.level === 4)).toBe(true);
	});

	it('widens one step at a time instead of jumping to the whole bank', () => {
		// A topic from one subject asked for under another matches nothing, so the
		// topic is dropped — but the subject the student chose is kept.
		const subset = filterBank(getFullBank(), { moduleId: 'logarithm', topic: 'chain' });
		expect(subset.length).toBeGreaterThan(0);
		expect(subset.every((p) => p.moduleId === 'logarithm')).toBe(true);
	});

	it('drops the level before the topic', () => {
		const subset = filterBank(getFullBank(), { moduleId: 'derivative', topic: 'chain', level: 99 });
		expect(subset.length).toBeGreaterThan(0);
		expect(subset.every((p) => p.topic === 'chain')).toBe(true);
	});
});

describe('Course filter', () => {
	it('narrows to one course', () => {
		const s2 = filterBank(getFullBank(), { course: 'S2' });
		expect(s2.length).toBeGreaterThan(0);
		const s2Modules = new Set(modulesForCourse('S2').map((m) => m.id));
		expect(s2.every((p) => s2Modules.has(p.moduleId))).toBe(true);
	});

	it('never crosses into another course when widening', () => {
		// This is the whole point of the axis: asking for S2 and being handed a
		// logarithm problem is the noise the course split exists to remove.
		const subset = filterBank(getFullBank(), { course: 'S2', topic: 'finst-ikkje', level: 99 });
		expect(subset.length).toBeGreaterThan(0);
		const s2Modules = new Set(modulesForCourse('S2').map((m) => m.id));
		expect(subset.every((p) => s2Modules.has(p.moduleId))).toBe(true);
	});

	it('every module declares a course the registry knows', () => {
		for (const mod of MODULE_REGISTRY) {
			expect(COURSES).toContain(mod.course);
		}
	});

	it('assigns every module to exactly one course, covering the registry', () => {
		const grouped = COURSES.flatMap((c) => modulesForCourse(c));
		expect(grouped).toHaveLength(MODULE_REGISTRY.length);
	});
});

describe('Step labels', () => {
	const labels = MODULE_REGISTRY.flatMap((mod) =>
		mod.generateBank().flatMap((p) => p.structuredSteps.map((s) => ({ id: p.id, label: s.label })))
	);

	it('never carries LaTeX', () => {
		// `.step-label` is a tag: small, bold, uppercase. Maths inside it renders as
		// maths and ignores the uppercasing, so "$\\ln x$ skal deriverast" came out
		// as an italic "ln x" glued to "SKAL DERIVERAST". Prose belongs in the hint,
		// and the reasoning belongs in the Lærebok.
		const offenders = labels.filter((l) => /\$|\\[a-zA-Z]/.test(l.label));
		expect(offenders.map((l) => `${l.id}: ${l.label}`)).toEqual([]);
	});

	it('stays short enough to read as a tag', () => {
		const tooLong = labels.filter((l) => l.label.length > 40);
		expect(tooLong.map((l) => `${l.id}: ${l.label}`)).toEqual([]);
	});
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LADDER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('Practice ladder', () => {
	it('never shows the same question on two rungs, at any difficulty', () => {
		// Distinct ids are not enough: several variants generate the same question,
		// and the worked example used to come back as the unaided problem.
		for (const mod of MODULE_REGISTRY) {
			for (const topic of mod.topics) {
				for (const level of [1, 2, 3, 4, 5]) {
					const qs = buildLadder(mod.id, topic.id, getFullBank(), level).map((r) => r.problem.q);
					expect(new Set(qs).size, `${mod.id}/${topic.id} nivå ${level}`).toBe(qs.length);
				}
			}
		}
	});

	it('holds difficulty fixed and varies only support', () => {
		const ladder = buildLadder('derivative', 'chain', getFullBank());
		expect(ladder).toHaveLength(LADDER_RUNGS.length);
		expect(ladder.map((r) => r.rung)).toEqual(LADDER_RUNGS);
		for (const r of ladder) {
			expect(r.problem.level).toBe(LADDER_LEVEL);
			expect(r.problem.topic).toBe('chain');
		}
	});

	it('starts fully worked and ends unaided', () => {
		const ladder = buildLadder('logarithm', 'log_power', getFullBank());
		const first = ladder[0];
		const last = ladder[ladder.length - 1];
		expect(fadeSteps(first.problem.structuredSteps, first.rung).hidden).toHaveLength(0);
		expect(fadeSteps(last.problem.structuredSteps, last.rung).shown).toHaveLength(0);
	});

	it('shortens rather than repeating a problem when a topic is thin', () => {
		const thin = getFullBank()
			.filter((p) => p.moduleId === 'derivative' && p.topic === 'chain' && p.level === LADDER_LEVEL)
			.slice(0, 2);
		const ladder = buildLadder('derivative', 'chain', thin);
		expect(ladder).toHaveLength(2);
		expect(new Set(ladder.map((r) => r.problem.id)).size).toBe(2);
		// The two ends survive: a worked example, then the same pattern unaided.
		expect(ladder.map((r) => r.rung)).toEqual([0, 4]);
	});

	it('counts a repeated question once when shortening', () => {
		const one = getFullBank().find(
			(p) => p.moduleId === 'derivative' && p.topic === 'chain' && p.level === LADDER_LEVEL
		)!;
		const twins = [one, { ...one, id: `${one.id}-kopi` }];
		expect(buildLadder('derivative', 'chain', twins)).toHaveLength(1);
	});

	it('spreads a short ladder evenly between the two ends', () => {
		expect(rungsFor(0)).toEqual([]);
		expect(rungsFor(1)).toEqual([0]);
		expect(rungsFor(2)).toEqual([0, 4]);
		expect(rungsFor(3)).toEqual([0, 2, 4]);
		expect(rungsFor(4)).toEqual([0, 1, 3, 4]);
		expect(rungsFor(8)).toEqual(LADDER_RUNGS);
	});

	it('returns nothing for a topic that does not exist', () => {
		expect(buildLadder('derivative', 'finst-ikkje', getFullBank())).toEqual([]);
	});

	it('goes from worked to unaided at every difficulty the topic has', () => {
		// The Lærebok lets the student pick difficulty as well as support, so
		// every level must carry a ladder with both ends — not just the default
		// one. A level with fewer distinct problems has fewer rungs in between.
		for (const mod of MODULE_REGISTRY) {
			for (const topic of mod.topics) {
				for (const level of [1, 2, 3, 4, 5]) {
					const ladder = buildLadder(mod.id, topic.id, getFullBank(), level);
					const where = `${mod.id}/${topic.id} nivå ${level}`;
					expect(ladder.length, where).toBeGreaterThanOrEqual(2);
					expect(ladder[0].rung, where).toBe(0);
					expect(ladder[ladder.length - 1].rung, where).toBe(4);
					expect(ladder.every((r) => r.problem.level === level)).toBe(true);
				}
			}
		}
	});
});
