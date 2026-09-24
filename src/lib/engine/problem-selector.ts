// Problem selector — 60/30/10 split (review / focus / new).
// Module-neutral: it knows nothing about derivatives, logarithms or any future
// topic. Concepts are opaque string ids and problems are grouped by whatever
// the owning module says trains them.
//
// Difficulty is decided per concept, from that concept's working level. There
// is deliberately no global level: one earned in S1 used to cap an S2 student's
// very first session at level 5, and one average across every concept handed a
// weak student level 4-5 problems a third of the time.

import type { Problem } from '$lib/modules/types';
import { conceptIdOf } from '$lib/modules/registry';
import {
	daysUntilDue,
	MIN_LEVEL,
	workingLevel,
	type ConceptKnowledge,
	type StudentModel
} from './student-model';
import { isDue, urgency } from './spaced-repetition';

/** Split a session budget into review / focus / new without losing a slot. */
export function splitBudget(count: number): { review: number; challenge: number; fresh: number } {
	const review = Math.round(count * 0.6);
	// floor() on the focus slice, not round(), so the remainder left for new
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

/** Highest level a student new to a bank starts at. */
const COLD_START_LEVEL = 2;

/**
 * Sort, breaking ties at random.
 *
 * A stable sort breaks ties the same way every time, and in a fresh model every
 * confidence is tied — so the concept listed first was drawn ten times as often
 * as the one listed last. Shuffling first makes every tie a coin toss.
 */
function sortShuffled<T>(arr: T[], key: (x: T) => number): T[] {
	return shuffled(arr).sort((a, b) => key(a) - key(b));
}

export function selectNextProblems(
	model: StudentModel,
	bank: Problem[],
	count: number = 10
): Problem[] {
	const index = byConcept(bank);
	const concepts = Object.values(model.concepts).filter((c) => index.has(c.conceptId));
	const attempted = concepts.filter((c) => c.lastSeen > 0);

	// Cold start until the student has met a few of *this bank's* concepts. The
	// bar is lower when the bank has fewer concepts than that — a topic filter
	// on a single-concept topic used to stay in cold start forever.
	if (attempted.length < Math.min(3, index.size)) return fallbackSelection(model, index, count);

	const { review, challenge, fresh } = splitBudget(count);
	const selected: Problem[] = [];
	const used = new Set<string>();
	const lowest = (id: string) => Math.min(...(index.get(id) ?? []).map((p) => p.level));
	/** The level a concept should be practised at next. */
	const target = (c: ConceptKnowledge) => (c.lastSeen === 0 ? lowest(c.conceptId) : workingLevel(c));

	const take = (concept: ConceptKnowledge | undefined, level: number) => {
		if (!concept) return;
		const problem = pickNearest(index.get(concept.conceptId) ?? [], used, level);
		if (problem) {
			selected.push(problem);
			used.add(problem.id);
		}
	};

	// ── 1. Review — due concepts, most urgent first; topped up with whatever
	//    comes due soonest, so the review slots rehearse the schedule ahead ──
	const due = sortShuffled(attempted.filter(isDue), (c) => -urgency(c));
	const soon = sortShuffled(attempted.filter((c) => !isDue(c)), (c) => daysUntilDue(c));
	const reviewPool = [...due, ...soon];
	for (let i = 0; i < review && i < reviewPool.length; i++) take(reviewPool[i], target(reviewPool[i]));

	// ── 2. Focus — the weakest concepts within reach, at their own working level.
	//    "Within reach" matters because some concepts only exist at high levels
	//    (the chain rule on e^x is level 4-5 only). A student who keeps missing
	//    one used to get it in the focus slots as well as in review, every day —
	//    a third of a weak student's cards went to two concepts they could not
	//    yet do. Out of reach, it still comes back when due, just not twice. ──
	const inReach = (c: ConceptKnowledge) => lowest(c.conceptId) <= workingLevel(c) + 1;
	const weak = sortShuffled(attempted.filter(inReach), (c) => c.confidence).slice(0, 5);
	for (let i = 0; i < challenge && i < weak.length; i++) take(weak[i], target(weak[i]));

	// ── 3. New — unseen concepts, easiest first ──
	const unseen = sortShuffled(
		concepts.filter((c) => c.lastSeen === 0),
		(c) => lowest(c.conceptId)
	);
	for (let i = 0; i < fresh && i < unseen.length; i++) take(unseen[i], target(unseen[i]));

	// ── 4. Fill any slots the above could not satisfy, nearest to each
	//    concept's own level. An unseen concept is measured from level 1, not
	//    from its own lowest level, or a method that starts at level 3 would
	//    count as "just right" for a student who has never met it. ──
	if (selected.length < count) {
		const distance = (p: Problem) => {
			const c = model.concepts[conceptIdOf(p)];
			return Math.abs(p.level - (c && c.lastSeen > 0 ? workingLevel(c) : MIN_LEVEL));
		};
		const remaining = sortShuffled(bank.filter((p) => !used.has(p.id)), distance);
		for (const p of remaining) {
			if (selected.length >= count) break;
			selected.push(p);
			used.add(p.id);
		}
	}

	// ── 5. Interleave — never serve a run of one concept ──
	shuffle(selected);
	return selected;
}

/**
 * Cold start: weighted random favouring unseen and weak concepts at easy
 * levels, spread across every concept in the bank so the first session already
 * shows the student that topics mix.
 *
 * "Easy" is decided per concept: up to level 2, or the concept's own working
 * level if the student has already climbed past that.
 */
function fallbackSelection(
	model: StudentModel,
	index: Map<string, Problem[]>,
	count: number
): Problem[] {
	const conceptIds = [...index.keys()];
	const all = [...index.values()].flat();
	const selected: Problem[] = [];
	const used = new Set<string>();
	const capFor = (id: string) => {
		const c = model.concepts[id];
		return c && c.lastSeen > 0 ? Math.max(COLD_START_LEVEL, workingLevel(c)) : COLD_START_LEVEL;
	};

	// Whether the cap means anything for this bank at all. If the caller narrowed
	// it — the topic filter picking level 5, say — nothing is within the cap, and
	// insisting would return an empty session rather than the thing asked for.
	// But when the bank *does* hold easy problems, the cap has to bite per
	// concept: integration's concepts each live at a single level, so a concept
	// with nothing easy is not a reason to hand a brand-new student a level 5
	// integral — it is a reason to pick a different concept.
	const bankHasEasy = all.some((p) => p.level <= COLD_START_LEVEL);

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

			const free = (index.get(conceptId) ?? []).filter((p) => !used.has(p.id));
			const withinLevel = free.filter((p) => p.level <= capFor(conceptId));
			const candidates = bankHasEasy ? withinLevel : free;
			if (candidates.length === 0) continue;
			const pick = candidates[Math.floor(Math.random() * candidates.length)];
			selected.push(pick);
			used.add(pick.id);
		}
	}

	// Top up if the weighting was unlucky, again preferring easy but not
	// insisting on it.
	const remaining = all.filter((p) => !used.has(p.id));
	const easy = remaining.filter((p) => p.level <= capFor(conceptIdOf(p)));
	const topUp = easy.length > 0 ? easy : remaining;
	shuffle(topUp);
	while (selected.length < count && topUp.length > 0) {
		const pick = topUp.pop()!;
		selected.push(pick);
		used.add(pick.id);
	}

	shuffle(selected);
	return selected;
}

/** An unused problem at the level closest to `level`, at random among equals. */
function pickNearest(problems: Problem[], used: Set<string>, level: number): Problem | null {
	const free = problems.filter((p) => !used.has(p.id));
	if (free.length === 0) return null;
	const best = Math.min(...free.map((p) => Math.abs(p.level - level)));
	const nearest = free.filter((p) => Math.abs(p.level - level) === best);
	return nearest[Math.floor(Math.random() * nearest.length)];
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
