// Unit tests for the Learning Engine
//
// Tests: student-model, spaced-repetition, problem-selector, guidance-fading
// Run with: npm test

import { describe, it, expect, beforeEach } from 'vitest';
import {
	createStudentModel,
	conceptIdFromProblem,
	getSuccessRate,
	getConceptCount,
	getDueCount,
	getOrCreateTodaySession,
	updateStreak,
	todayISO,
	getReviewBuckets,
	getRegisteredConceptIds,
	ALL_CONCEPT_IDS,
	type StudentModel
} from '$lib/engine/student-model';
import {
	isDue,
	urgency,
	updateAfterAttempt
} from '$lib/engine/spaced-repetition';
import { selectNextProblems } from '$lib/engine/problem-selector';
import { selectFadingLevel, fadeSteps } from '$lib/engine/guidance-fading';
import { getAllConceptIds } from '$lib/modules/registry';
import type { Problem, StepEntry } from '$lib/modules/derivative/types';

// ── Helpers ──

function makeProblem(overrides: Partial<Problem> & { id: number }): Problem {
	return {
		topic: 'chain',
		level: 1,
		type: 'poly',
		q: 'f(x) = x^2',
		a: "f'(x) = 2x",
		steps: 'potensregelen',
		structuredSteps: [
			{ label: 'Identify', latex: 'g(u) = u^2' },
			{ label: 'Differentiate g', latex: "g'(u) = 2u" },
			{ label: 'Differentiate u', latex: "u'(x) = 1" },
			{ label: 'Apply', latex: "f'(x) = g'(u) * u'(x)" },
			{ label: 'Substitute', latex: "f'(x) = 2x * 1" },
			{ label: 'Simplify', latex: "f'(x) = 2x" }
		],
		hint: 'Bruk potensregelen',
		...overrides
	};
}

/** Generate a small problem bank with known structure */
function makeBank(): Problem[] {
	const bank: Problem[] = [];
	let id = 0;
	const topics = ['chain', 'product', 'quotient'] as const;
	const types = ['poly', 'root', 'exp', 'log'] as const;

	for (const topic of topics) {
		for (const type of types) {
			for (let level = 1; level <= 5; level++) {
				bank.push(makeProblem({ id: id++, topic, type, level }));
			}
		}
	}
	return bank; // 60 problems: 3 topics × 4 types × 5 levels
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
		// Derivative concepts still present
		for (const id of ALL_CONCEPT_IDS) {
			expect(model.concepts[id]).toBeDefined();
		}
		// Logarithm concepts present
		expect(model.concepts['log_product']).toBeDefined();
		expect(model.concepts['exp_equation']).toBeDefined();
	});

	it('starts at overall level 1.0', () => {
		const model = createStudentModel();
		expect(model.overallLevel).toBe(1.0);
	});

	it('conceptIdFromProblem derives correct ID', () => {
		expect(conceptIdFromProblem('chain', 'poly')).toBe('chain_poly');
		expect(conceptIdFromProblem('quotient', 'log')).toBe('quotient_log');
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

	it('second correct answer increases interval by ease factor', () => {
		updateAfterAttempt(model, { conceptId: 'chain_poly', correct: true, hintUsed: false });
		updateAfterAttempt(model, { conceptId: 'chain_poly', correct: true, hintUsed: false });
		expect(model.concepts['chain_poly'].currentInterval).toBeGreaterThan(1);
	});

	it('incorrect answer halves interval', () => {
		const concept = model.concepts['chain_poly'];
		concept.currentInterval = 8;
		concept.lastSeen = Date.now();
		updateAfterAttempt(model, { conceptId: 'chain_poly', correct: false, hintUsed: false });
		expect(concept.currentInterval).toBe(4);
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
		bank = makeBank();
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

	it('after rating concepts, uses 60/30/10 split', () => {
		const concepts = ['chain_poly', 'chain_root', 'product_poly', 'quotient_exp'];
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
			updateAfterAttempt(model, { conceptId: 'product_root', correct: false, hintUsed: false });
		}

		let weakCount = 0;
		let strongCount = 0;
		for (let i = 0; i < 50; i++) {
			const selected = selectNextProblems(model, bank, 5);
			for (const p of selected) {
				const cId = conceptIdFromProblem(p.topic, p.type);
				if (cId === 'chain_root' || cId === 'product_root') weakCount++;
				if (cId === 'chain_poly' || cId === 'product_poly') strongCount++;
			}
		}
		expect(weakCount).toBeGreaterThan(strongCount);
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

	it('new concept gets fading level 0 (full example)', () => {
		const concept = model.concepts['chain_poly'];
		expect(selectFadingLevel(concept)).toBe(0);
	});

	it('after few weak attempts gets level 1', () => {
		const concept = model.concepts['chain_poly'];
		concept.timesCorrect = 2;
		concept.timesIncorrect = 2;
		concept.confidence = 0.35;
		expect(selectFadingLevel(concept)).toBe(1);
	});

	it('confident student gets level 4 (independent)', () => {
		const concept = model.concepts['chain_poly'];
		concept.timesCorrect = 10;
		concept.timesIncorrect = 1;
		concept.confidence = 0.9;
		expect(selectFadingLevel(concept)).toBe(4);
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
