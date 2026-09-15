// Session builder — turns the student model into one short run of cards.
//
// This is what "Dagens økt" produces. Problems come from every module at once
// (interleaving across topics is the point), and each card's scaffolding is
// chosen per concept rather than per mode: a concept the student has barely met
// arrives as a worked example, a familiar one as bare practice.

import type { Problem } from '$lib/modules/types';
import { conceptIdOf, getFullBank } from '$lib/modules/registry';
import type { StudentModel } from './student-model';
import { selectNextProblems } from './problem-selector';
import { selectFadingLevel, type FadingLevel } from './guidance-fading';

/** How many cards one session holds — short enough to finish in a sitting. */
export const SESSION_LENGTH = 10;

/**
 * Most worked examples one session may contain.
 *
 * Without a cap a brand-new student gets a session of nothing but study cards,
 * because every concept starts below the level-0 threshold. Beyond the cap the
 * remaining new concepts drop to level 1, which still shows every step but the
 * last — an example-problem pair rather than a lecture.
 */
export const MAX_WORKED_EXAMPLES = 3;

export interface SessionCard {
	problem: Problem;
	conceptId: string;
	/** 0 = full worked example (study only), 4 = no scaffolding. */
	level: FadingLevel;
}

export interface Session {
	cards: SessionCard[];
	startedAt: number;
}

/**
 * Build a session.
 *
 * `bank` is injectable so tests can pass a fixture; in the app it defaults to
 * every module's problems.
 */
export function buildSession(
	model: StudentModel,
	count: number = SESSION_LENGTH,
	bank: Problem[] = getFullBank()
): Session {
	const problems = selectNextProblems(model, bank, count);

	let workedExamples = 0;
	const cards = problems.map((problem) => {
		const conceptId = conceptIdOf(problem);
		const concept = model.concepts[conceptId];
		// An unknown concept has never been attempted, so it starts at level 0.
		let level: FadingLevel = concept ? selectFadingLevel(concept) : 0;

		if (level === 0) {
			if (workedExamples >= MAX_WORKED_EXAMPLES) level = 1;
			else workedExamples++;
		}

		return { problem, conceptId, level };
	});

	return { cards, startedAt: Date.now() };
}

/** True when this card is instruction to study rather than work to do. */
export function isWorkedExample(card: SessionCard): boolean {
	return card.level === 0;
}
