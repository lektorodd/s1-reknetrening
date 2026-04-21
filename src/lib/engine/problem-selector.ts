// Problem Selector – 60/30/10 split (review/challenge/new)
// Based on future-report §3.2

import type { Problem } from '$lib/modules/derivative/types';
import type { StudentModel, ConceptKnowledge } from './student-model';
import { conceptIdFromProblem } from './student-model';
import { isDue, urgency } from './spaced-repetition';

/**
 * Select problems using the adaptive 60/30/10 algorithm:
 * - 60% Review: concepts due for review, sorted by urgency
 * - 30% Challenge: weakest concepts, slightly above current level
 * - 10% New: unseen concepts at easy difficulty
 *
 * Falls back to weighted-random when insufficient data.
 */
export function selectNextProblems(
	model: StudentModel,
	bank: Problem[],
	count: number = 5
): Problem[] {
	const concepts = model.concepts;
	const attempted = Object.values(concepts).filter(c => c.lastSeen > 0);

	// If student has very little data, fall back to diverse sampling
	if (attempted.length < 3) {
		return fallbackSelection(model, bank, count);
	}

	const reviewCount = Math.ceil(count * 0.6);   // 3 of 5
	const challengeCount = Math.ceil(count * 0.3); // 2 of 5
	const newCount = count - reviewCount - challengeCount; // 0 of 5 (or 1 if count > 5)

	const selected: Problem[] = [];
	const usedIds = new Set<number>();

	// ── 1. REVIEW (60%) ──
	const dueConcepts = attempted
		.filter(c => isDue(c))
		.sort((a, b) => urgency(b) - urgency(a));

	// If not enough due concepts, pad with lowest-confidence attempted
	const reviewCandidates = dueConcepts.length >= reviewCount
		? dueConcepts
		: [
			...dueConcepts,
			...attempted
				.filter(c => !isDue(c))
				.sort((a, b) => a.confidence - b.confidence)
		];

	for (let i = 0; i < reviewCount && i < reviewCandidates.length; i++) {
		const concept = reviewCandidates[i];
		const problem = pickProblemForConcept(concept, bank, usedIds);
		if (problem) {
			selected.push(problem);
			usedIds.add(problem.id);
		}
	}

	// ── 2. CHALLENGE (30%) ──
	const weakConcepts = attempted
		.sort((a, b) => a.confidence - b.confidence)
		.slice(0, 5); // top 5 weakest

	for (let i = 0; i < challengeCount && i < weakConcepts.length; i++) {
		const concept = weakConcepts[i];
		const targetLevel = Math.min(5, Math.ceil(model.overallLevel) + 1);
		const problem = pickProblemForConcept(concept, bank, usedIds, targetLevel);
		if (problem) {
			selected.push(problem);
			usedIds.add(problem.id);
		}
	}

	// ── 3. NEW (10%) ──
	const unseenConcepts = Object.values(concepts).filter(c => c.lastSeen === 0);
	const newTarget = Math.max(newCount, unseenConcepts.length > 0 ? 1 : 0);
	for (let i = 0; i < newTarget && i < unseenConcepts.length && selected.length < count; i++) {
		const concept = unseenConcepts[i];
		const problem = pickProblemForConcept(concept, bank, usedIds, 1); // start easy
		if (problem) {
			selected.push(problem);
			usedIds.add(problem.id);
		}
	}

	// Fill remaining slots if needed
	while (selected.length < count) {
		const remaining = bank.filter(p => !usedIds.has(p.id));
		if (remaining.length === 0) break;
		const pick = remaining[Math.floor(Math.random() * remaining.length)];
		selected.push(pick);
		usedIds.add(pick.id);
	}

	// ── 4. INTERLEAVE ──
	shuffle(selected);

	return selected;
}

/**
 * Fallback for cold-start: weighted random favoring unseen, weak, and
 * easy-level problems, with diversity across topics.
 * New students should start with levels 1-2.
 */
function fallbackSelection(
	model: StudentModel,
	bank: Problem[],
	count: number
): Problem[] {
	// Group by topic and pick from each
	const topics = ['chain', 'product', 'quotient'] as const;
	const perTopic = Math.max(1, Math.floor(count / topics.length));
	const selected: Problem[] = [];
	const usedIds = new Set<number>();

	// Determine max level based on student's overall level
	const maxLevel = Math.max(2, Math.ceil(model.overallLevel));

	for (const topic of topics) {
		const topicProblems = bank.filter(p => p.topic === topic);
		const weighted = topicProblems.map(p => {
			const cId = conceptIdFromProblem(p.topic, p.type);
			const concept = model.concepts[cId];
			let weight = 1;
			if (!concept || concept.lastSeen === 0) weight = 5;       // prefer unseen
			else if (concept.confidence < 0.5) weight = 3;            // prefer weak
			else if (concept.confidence > 0.8) weight = 0.2;         // deprioritise strong

			// Strongly prefer easy levels for cold-start
			if (p.level <= maxLevel) {
				weight *= 10;  // 10× boost for appropriate-level problems
			} else {
				weight *= 0.05; // near-zero for level 4-5 at cold start
			}
			return { problem: p, weight };
		});

		// Weighted random sampling
		for (let i = 0; i < perTopic; i++) {
			const pick = weightedRandom(weighted.filter(w => !usedIds.has(w.problem.id)));
			if (pick) {
				selected.push(pick.problem);
				usedIds.add(pick.problem.id);
			}
		}
	}

	// Fill remaining — also prefer easy levels
	while (selected.length < count) {
		const remaining = bank.filter(p => !usedIds.has(p.id) && p.level <= maxLevel);
		if (remaining.length === 0) {
			// If truly exhausted, accept any level
			const any = bank.filter(p => !usedIds.has(p.id));
			if (any.length === 0) break;
			const pick = any[Math.floor(Math.random() * any.length)];
			selected.push(pick);
			usedIds.add(pick.id);
		} else {
			const pick = remaining[Math.floor(Math.random() * remaining.length)];
			selected.push(pick);
			usedIds.add(pick.id);
		}
	}

	shuffle(selected);
	return selected;
}

/**
 * Pick a problem from the bank matching a concept, optionally targeting a level.
 */
function pickProblemForConcept(
	concept: ConceptKnowledge,
	bank: Problem[],
	usedIds: Set<number>,
	targetLevel?: number
): Problem | null {
	const [topic, type] = concept.conceptId.split('_');

	let candidates = bank.filter(
		p => p.topic === topic && p.type === type && !usedIds.has(p.id)
	);

	if (candidates.length === 0) return null;

	if (targetLevel !== undefined) {
		// Prefer problems near the target level
		candidates.sort((a, b) =>
			Math.abs(a.level - targetLevel) - Math.abs(b.level - targetLevel)
		);
		// Take from the top third closest
		candidates = candidates.slice(0, Math.max(3, Math.ceil(candidates.length / 3)));
	}

	return candidates[Math.floor(Math.random() * candidates.length)];
}

function weightedRandom<T extends { weight: number }>(items: T[]): T | null {
	if (items.length === 0) return null;
	const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
	let random = Math.random() * totalWeight;
	for (const item of items) {
		random -= item.weight;
		if (random <= 0) return item;
	}
	return items[items.length - 1];
}

function shuffle<T>(arr: T[]): void {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
}
