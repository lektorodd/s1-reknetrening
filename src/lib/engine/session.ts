// Session builder — turns the student model into one short run of problems.
//
// This is what "Dagens økt" produces: ordinary problems from the bank, drawn
// across every module because interleaving across topics is the point.
//
// A session never varies how much of the solution is shown. Working through
// progressively less-solved problems is instruction, and lives as a ladder in
// the Lærebok where the student walks it deliberately. What varies here is
// difficulty — the bank's five levels per topic — which is what the original
// skills practice varied too.

import type { Problem } from '$lib/modules/types';
import { conceptIdOf, getFullBank } from '$lib/modules/registry';
import type { StudentModel } from './student-model';
import { selectNextProblems } from './problem-selector';

/** How many problems one session holds — short enough to finish in a sitting. */
export const SESSION_LENGTH = 10;

export interface SessionCard {
	problem: Problem;
	conceptId: string;
	/** True when the student has not attempted this concept before. */
	isNewConcept: boolean;
}

export interface Session {
	cards: SessionCard[];
	startedAt: number;
}

/** What the student has narrowed the bank to. Any field null means "all". */
export interface BankFilter {
	moduleId?: string | null;
	topic?: string | null;
	level?: number | null;
}

/**
 * Narrow the bank to a subject, a topic within it, and/or a difficulty.
 *
 * A filter that matches nothing falls back to the whole bank: an empty session
 * is a dead end, and the student would have no way to tell why.
 */
export function filterBank(bank: Problem[], filter: BankFilter = {}): Problem[] {
	const { moduleId = null, topic = null, level = null } = filter;
	if (moduleId === null && topic === null && level === null) return bank;

	const subset = bank.filter(
		(p) =>
			(moduleId === null || p.moduleId === moduleId) &&
			(topic === null || p.topic === topic) &&
			(level === null || p.level === level)
	);

	return subset.length > 0 ? subset : bank;
}

/**
 * Build a session.
 *
 * `bank` is injectable so tests and the topic filter can narrow it; by default
 * it is every module's problems.
 */
export function buildSession(
	model: StudentModel,
	count: number = SESSION_LENGTH,
	bank: Problem[] = getFullBank()
): Session {
	const cards = selectNextProblems(model, bank, count).map((problem) => {
		const conceptId = conceptIdOf(problem);
		const concept = model.concepts[conceptId];
		const isNewConcept = !concept || concept.timesCorrect + concept.timesIncorrect === 0;
		return { problem, conceptId, isNewConcept };
	});

	return { cards, startedAt: Date.now() };
}
