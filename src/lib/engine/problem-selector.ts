// Problem selector — 60/30/10 split (review / challenge / new).
// Based on future-report §3.2, but module-neutral: it knows nothing about
// derivatives, logarithms or any future topic. Concepts are opaque string ids
// and problems are grouped by whatever the owning module says trains them.

import type { Problem } from '$lib/modules/types';
import { conceptIdOf } from '$lib/modules/registry';
import type { StudentModel, ConceptKnowledge } from './student-model';
import { isDue, urgency } from './spaced-repetition';

/** Split a session budget into review / challenge / new without losing a slot. */
export function splitBudget(count: number): { review: number; challenge: number; fresh: number } {
	const review = Math.round(count * 0.6);
	// floor() on the challenge slice, not round(), so the remainder left for new
	// material never rounds away. The old ceil()-based split produced 3 + 2 + 0
	// at count = 5, which is why students stopped meeting unseen concepts.
	const challenge = Math.floor(count * 0.3);
	const fresh = Math.max(0, count - review - challenge);
	return { review, challenge, fresh };
}

/** Index the bank by concept once, so picking is O(1) per concept. */
function byConcept(bank: Problem[]): Map<string, Problem[]> {
	const map = new Map<string, Problem[]>();
	for (const p of bank) {
		const id = conceptIdOf(p);
		const list = map.get(id);
		if (list) list.push(p);
		else map.set(id, [p]);
	}
	return map;
}

export function selectNextProblems(
	model: StudentModel,
	bank: Problem[],
	count: number = 10
): Problem[] {
	const index = byConcept(bank);
	const concepts = Object.values(model.concepts).filter((c) => index.has(c.conceptId));
	const attempted = concepts.filter((c) => c.lastSeen > 0);

	if (attempted.length < 3) return fallbackSelection(model, bank, count);

	const { review, challenge, fresh } = splitBudget(count);
	const selected: Problem[] = [];
	const used = new Set<string>();

	const take = (concept: ConceptKnowledge | undefined, level?: number) => {
		if (!concept) return;
		const problem = pickForConcept(concept, index, used, level);
		if (problem) {
			selected.push(problem);
			used.add(problem.id);
		}
	};

	// ── 1. Review — due concepts, most overdue first ──
	const due = attempted.filter(isDue).sort((a, b) => urgency(b) - urgency(a));
	const reviewPool =
		due.length >= review
			? due
			: [...due, ...attempted.filter((c) => !isDue(c)).sort((a, b) => a.confidence - b.confidence)];
	for (let i = 0; i < review && i < reviewPool.length; i++) take(reviewPool[i]);

	// ── 2. Challenge — weakest concepts, one level above current ──
	const weak = [...attempted].sort((a, b) => a.confidence - b.confidence).slice(0, 5);
	const targetLevel = Math.min(5, Math.ceil(model.overallLevel) + 1);
	for (let i = 0; i < challenge && i < weak.length; i++) take(weak[i], targetLevel);

	// ── 3. New — unseen concepts, starting easy ──
	const unseen = concepts.filter((c) => c.lastSeen === 0);
	for (let i = 0; i < fresh && i < unseen.length; i++) take(unseen[i], 1);

	// ── 4. Fill any slots the above could not satisfy ──
	while (selected.length < count) {
		const remaining = bank.filter((p) => !used.has(p.id));
		if (remaining.length === 0) break;
		const pick = remaining[Math.floor(Math.random() * remaining.length)];
		selected.push(pick);
		used.add(pick.id);
	}

	// ── 5. Interleave — never serve a run of one concept ──
	shuffle(selected);
	return selected;
}

/**
 * Cold start: weighted random favouring unseen and weak concepts at easy
 * levels, spread across every module so the first session already shows the
 * student that topics mix.
 */
function fallbackSelection(model: StudentModel, bank: Problem[], count: number): Problem[] {
	const index = byConcept(bank);
	const conceptIds = [...index.keys()];
	const maxLevel = Math.max(2, Math.ceil(model.overallLevel));
	const selected: Problem[] = [];
	const used = new Set<string>();

	// Round-robin across concepts, so a module with more concepts does not
	// crowd out a smaller one.
	const order = shuffled(conceptIds);
	let guard = 0;
	while (selected.length < count && guard++ < count * conceptIds.length) {
		for (const conceptId of order) {
			if (selected.length >= count) break;
			const concept = model.concepts[conceptId];
			const weight = !concept || concept.lastSeen === 0 ? 5 : concept.confidence < 0.5 ? 3 : 0.2;
			if (Math.random() > weight / 5) continue;

			const candidates = (index.get(conceptId) ?? []).filter(
				(p) => !used.has(p.id) && p.level <= maxLevel
			);
			if (candidates.length === 0) continue;
			const pick = candidates[Math.floor(Math.random() * candidates.length)];
			selected.push(pick);
			used.add(pick.id);
		}
	}

	// Top up if the weighting was unlucky.
	const easy = bank.filter((p) => !used.has(p.id) && p.level <= maxLevel);
	shuffle(easy);
	while (selected.length < count && easy.length > 0) {
		const pick = easy.pop()!;
		selected.push(pick);
		used.add(pick.id);
	}

	shuffle(selected);
	return selected;
}

function pickForConcept(
	concept: ConceptKnowledge,
	index: Map<string, Problem[]>,
	used: Set<string>,
	targetLevel?: number
): Problem | null {
	let candidates = (index.get(concept.conceptId) ?? []).filter((p) => !used.has(p.id));
	if (candidates.length === 0) return null;

	if (targetLevel !== undefined) {
		candidates = [...candidates].sort(
			(a, b) => Math.abs(a.level - targetLevel) - Math.abs(b.level - targetLevel)
		);
		candidates = candidates.slice(0, Math.max(3, Math.ceil(candidates.length / 3)));
	}

	return candidates[Math.floor(Math.random() * candidates.length)];
}

function shuffle<T>(arr: T[]): void {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
}

function shuffled<T>(arr: T[]): T[] {
	const copy = [...arr];
	shuffle(copy);
	return copy;
}
