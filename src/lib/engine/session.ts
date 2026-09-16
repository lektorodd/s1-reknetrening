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

import type { Course, Problem } from '$lib/modules/types';
import { conceptIdOf, getFullBank, modulesForCourse } from '$lib/modules/registry';
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
	course?: Course | null;
	moduleId?: string | null;
	topic?: string | null;
	level?: number | null;
}

/**
 * Narrow the bank to a course, a subject within it, a topic, and/or a difficulty.
 *
 * A filter that matches nothing widens one step at a time — drop the level,
 * then the topic, then the subject — rather than jumping straight to the whole
 * bank. An empty session is a dead end the student cannot diagnose, but so is
 * one that silently crosses into another course: asking for S2 and being handed
 * logarithm problems is exactly the noise the course axis exists to remove.
 * Only a course with no problems at all falls back past the course itself.
 */
export function filterBank(bank: Problem[], filter: BankFilter = {}): Problem[] {
	const { course = null, moduleId = null, topic = null, level = null } = filter;
	if (course === null && moduleId === null && topic === null && level === null) return bank;

	const courseModules = course === null ? null : new Set(modulesForCourse(course).map((m) => m.id));

	const match = (p: Problem, m: string | null, t: string | null, l: number | null) =>
		(courseModules === null || courseModules.has(p.moduleId)) &&
		(m === null || p.moduleId === m) &&
		(t === null || p.topic === t) &&
		(l === null || p.level === l);

	// Widest-to-narrowest, so the first non-empty result is the closest the bank
	// can come to what was asked for.
	const attempts: [string | null, string | null, number | null][] = [
		[moduleId, topic, level],
		[moduleId, topic, null],
		[moduleId, null, null],
		[null, null, null]
	];

	for (const [m, t, l] of attempts) {
		const subset = bank.filter((p) => match(p, m, t, l));
		if (subset.length > 0) return subset;
	}

	return bank;
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
