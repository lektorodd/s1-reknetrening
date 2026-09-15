// Session builder — turns the student model into one short run of cards.
//
// This is what "Dagens økt" produces. Problems come from every module at once,
// because interleaving across topics is the point.
//
// Every card in a session is work to do. Scaffolding varies — a barely-met
// concept shows all steps but the last, a familiar one shows none — but a
// session never serves a card that is only to be read. Fully worked examples
// are instruction and live in the Lærebok, so that opening the Treningsrom
// always means practice rather than a coin flip between reading and doing.

import type { Problem } from '$lib/modules/types';
import { conceptIdOf, getFullBank } from '$lib/modules/registry';
import type { StudentModel } from './student-model';
import { selectNextProblems } from './problem-selector';
import { selectFadingLevel, type FadingLevel } from './guidance-fading';

/** How many cards one session holds — short enough to finish in a sitting. */
export const SESSION_LENGTH = 10;

/**
 * Least scaffolding-removal a practice card may have.
 *
 * Level 0 is study-only, which belongs to the Lærebok. Level 1 is the gentlest
 * thing a student can be asked to *do*: every step shown but the last — a
 * completion problem, the standard bridge out of a worked example.
 */
export const MIN_PRACTICE_LEVEL: FadingLevel = 1;

export interface SessionCard {
	problem: Problem;
	conceptId: string;
	/** 1 = every step but the last is shown, 4 = no scaffolding. Never 0. */
	level: FadingLevel;
	/** True when the student has not attempted this concept before. */
	isNewConcept: boolean;
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

	const cards = problems.map((problem) => {
		const conceptId = conceptIdOf(problem);
		const concept = model.concepts[conceptId];
		const chosen = concept ? selectFadingLevel(concept) : 0;
		const level = Math.max(chosen, MIN_PRACTICE_LEVEL) as FadingLevel;
		const isNewConcept = !concept || concept.timesCorrect + concept.timesIncorrect === 0;

		return { problem, conceptId, level, isNewConcept };
	});

	return { cards, startedAt: Date.now() };
}
