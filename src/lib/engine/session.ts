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
import {
	COURSES,
	conceptIdOf,
	getFullBank,
	getModule,
	getProblemById,
	modulesForCourse
} from '$lib/modules/registry';
import { localISO, type StudentModel } from './student-model';
import { load, save } from '$lib/utils/storage';
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

// ── What the Treningsrom keeps between page loads ──

/** The topic filter as the Treningsrom stores it. Null means "all". */
export interface TrenFilter {
	course: Course | null;
	moduleId: string | null;
	topic: string | null;
	level: number | null;
}

/**
 * S1 is the default course, which is what the app was before integration. An
 * S2 student picks S2 once and it stays picked.
 */
export const DEFAULT_FILTER: TrenFilter = { course: 'S1', moduleId: null, topic: null, level: null };

/**
 * A stored filter, checked field by field.
 *
 * Read straight from storage, a filter saved as `null` crashed the page, and one
 * naming a subject that has since been removed gave an empty choice. Anything
 * unrecognised falls back to its default.
 */
export function parseFilter(stored: unknown): TrenFilter {
	if (typeof stored !== 'object' || stored === null) return { ...DEFAULT_FILTER };
	const s = stored as Partial<Record<keyof TrenFilter, unknown>>;
	const course =
		s.course === null ? null : COURSES.includes(s.course as Course) ? (s.course as Course) : DEFAULT_FILTER.course;
	const mod = typeof s.moduleId === 'string' ? getModule(s.moduleId) : undefined;
	const moduleId = mod ? mod.id : null;
	const topic =
		mod && typeof s.topic === 'string' && mod.topics.some((t) => t.id === s.topic) ? s.topic : null;
	const level =
		typeof s.level === 'number' && Number.isInteger(s.level) && s.level >= 1 && s.level <= 5 ? s.level : null;
	return { course, moduleId, topic, level };
}

const FILTER_KEY = 'tren_filter';

/** The filter the student last chose — the course on the front page included. */
export function loadFilter(): TrenFilter {
	return parseFilter(load<unknown>(FILTER_KEY, DEFAULT_FILTER));
}

export function saveFilter(filter: TrenFilter): void {
	save<TrenFilter>(FILTER_KEY, filter);
}

/**
 * The filter for another course: subject, topic and level are cleared, since
 * they belong to the course being left.
 */
export function setCourse(filter: TrenFilter, course: Course | null): TrenFilter {
	if (filter.course === course) return filter;
	return { course, moduleId: null, topic: null, level: null };
}

/**
 * A filter asked for in the address, as links into practice carry it:
 * `/tren/?fag=integral&emne=parts`, optionally with `niva=3` or `kurs=S2`.
 *
 * The course follows from the subject when one is given, so a link from the S2
 * Lærebok never lands in an S1 session. Null when the address asks for nothing
 * the bank knows — the stored filter then stands.
 */
export function filterFromQuery(params: URLSearchParams): TrenFilter | null {
	const fag = params.get('fag');
	const kurs = params.get('kurs');
	if (fag === null && kurs === null) return null;

	const mod = fag !== null ? getModule(fag) : undefined;
	if (fag !== null && !mod) return null;
	const niva = params.get('niva');
	const parsed = parseFilter({
		course: mod ? mod.course : kurs,
		moduleId: mod?.id ?? null,
		topic: params.get('emne'),
		level: niva === null ? null : Number(niva)
	});
	// A course that was asked for but not recognised is not a request at all.
	if (!mod && parsed.course !== kurs) return null;
	return parsed;
}

/** Path into practice on one subject, and optionally one topic of it. */
export function practicePath(moduleId: string, topic?: string | null): string {
	const q = new URLSearchParams({ fag: moduleId });
	if (topic) q.set('emne', topic);
	return `/tren/?${q}`;
}

/** Path to the Lærebok page for one topic. */
export function theoryPath(moduleId: string, topic: string): string | null {
	const mod = getModule(moduleId);
	return mod ? `/laer/${mod.slug}/${topic}/` : null;
}

const sameFilter = (a: TrenFilter, b: TrenFilter) =>
	a.course === b.course && a.moduleId === b.moduleId && a.topic === b.topic && a.level === b.level;

/** A session in progress, as it is written to storage after every card. */
export interface StoredSession {
	filter: TrenFilter;
	cards: { id: string; isNew: boolean }[];
	startedAt: number;
	/** Cards answered so far. */
	position: number;
	/** Of those, how many the student got right. */
	correct: number;
	/** Concepts rated "Trong øving" so far, for the end-of-session pointers. */
	missed?: string[];
}

export function storeSession(
	session: Session,
	filter: TrenFilter,
	position: number,
	correct: number,
	missed: string[] = []
): StoredSession {
	return {
		filter,
		cards: session.cards.map((c) => ({ id: c.problem.id, isNew: c.isNewConcept })),
		startedAt: session.startedAt,
		position,
		correct,
		missed
	};
}

/**
 * Pick a stored session back up, if it can be.
 *
 * Reloading the page — or the phone dropping the tab — used to throw away the
 * session: "3 av 10" became "1 av 10" with different problems. It is resumed
 * when it is from today, for the same filter, not finished, and every card still
 * exists in the bank. Otherwise null, and the caller builds a fresh one.
 */
export function restoreSession(
	stored: unknown,
	filter: TrenFilter,
	now: number = Date.now()
): { session: Session; position: number; correct: number; missed: string[] } | null {
	if (typeof stored !== 'object' || stored === null) return null;
	const s = stored as Partial<StoredSession>;
	if (!Array.isArray(s.cards) || s.cards.length === 0) return null;
	if (typeof s.startedAt !== 'number' || typeof s.position !== 'number' || typeof s.correct !== 'number') {
		return null;
	}
	if (!sameFilter(parseFilter(s.filter), filter)) return null;
	if (localISO(new Date(s.startedAt)) !== localISO(new Date(now))) return null;
	if (!Number.isInteger(s.position) || s.position < 0 || s.position >= s.cards.length) return null;

	const cards: SessionCard[] = [];
	for (const c of s.cards) {
		const problem = typeof c?.id === 'string' ? getProblemById(c.id) : undefined;
		if (!problem) return null;
		cards.push({ problem, conceptId: conceptIdOf(problem), isNewConcept: c.isNew === true });
	}
	const correct = Math.max(0, Math.min(s.correct, s.position));
	// Sessions stored before this field existed simply have nothing missed yet.
	const missed = Array.isArray(s.missed) ? s.missed.filter((m): m is string => typeof m === 'string') : [];
	return { session: { cards, startedAt: s.startedAt }, position: s.position, correct, missed };
}
