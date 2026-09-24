// Student Model – tracks per-concept knowledge state
// Based on future-report §3.1 with FSRS-inspired parameters
// Session history added in Phase 5 (§6b)

import * as storage from '$lib/utils/storage';
import { getAllConceptIds } from '$lib/modules/registry';

// ── Types ──

export interface ConceptKnowledge {
	conceptId: string;           // e.g. "chain_poly", "product_exp"
	confidence: number;          // 0.0–1.0 (Bayesian estimate)
	lastSeen: number;            // timestamp (ms since epoch)
	timesCorrect: number;
	timesIncorrect: number;
	hintsUsedFrequency: number;  // 0.0–1.0 (exponential moving average)
	currentInterval: number;     // days until next review
	easeFactor: number;          // FSRS parameter (how "easy" this concept is)
	/**
	 * The difficulty (1-5) this student works at for this concept. The selector
	 * draws problems at this level, so each concept adapts on its own — and so a
	 * course never inherits a level earned in another.
	 */
	workLevel: number;
	/**
	 * Unaided correct answers in a row at or above the working level. Two of them
	 * step it up; a miss steps it down. That "two up, one down" staircase settles
	 * where the student gets about 70 % right. Stepping up after a single correct
	 * answer settled a weak student where they got 35 % right.
	 */
	climb: number;
}

export interface SessionEntry {
	date: string;              // ISO date YYYY-MM-DD
	correct: number;
	incorrect: number;
	hintsUsed: number;
	conceptsTouched: string[];
}

export interface StudentModel {
	concepts: Record<string, ConceptKnowledge>;
	overallLevel: number;        // 1.0–5.0 (continuous, derived from performance)
	totalAttempts: number;
	totalCorrect: number;
	sessionHistory: SessionEntry[];  // daily aggregated activity, capped at 90 days
	streakDays: number;              // consecutive active days
	lastActiveDate: string;          // ISO date of last session
}

// ── Concept ID helpers ──

/** All concept IDs across all registered modules (dynamic) */
export function getRegisteredConceptIds(): string[] {
	return getAllConceptIds();
}



// ── Factory ──

function createDefaultConcept(conceptId: string): ConceptKnowledge {
	return {
		conceptId,
		confidence: 0.5,       // uninformed prior
		lastSeen: 0,
		timesCorrect: 0,
		timesIncorrect: 0,
		hintsUsedFrequency: 0,
		currentInterval: 0,    // never scheduled yet
		easeFactor: 2.0,       // FSRS default
		workLevel: 1,
		climb: 0
	};
}

const finiteOr = (v: unknown, fallback: number, min = -Infinity, max = Infinity): number =>
	typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : fallback;

/**
 * A stored concept with every field present and in range.
 *
 * Models are written by older versions of the app, and by browsers that crashed
 * half-way through a write. A missing number read as `undefined` and turned
 * every average it touched into NaN, so each field is checked, not trusted.
 */
function repairConcept(id: string, saved: unknown): ConceptKnowledge {
	if (typeof saved !== 'object' || saved === null) return createDefaultConcept(id);
	const s = saved as Partial<Record<keyof ConceptKnowledge, unknown>>;
	const c: ConceptKnowledge = {
		conceptId: id,
		confidence: finiteOr(s.confidence, 0.5, 0, 1),
		lastSeen: finiteOr(s.lastSeen, 0, 0),
		timesCorrect: finiteOr(s.timesCorrect, 0, 0),
		timesIncorrect: finiteOr(s.timesIncorrect, 0, 0),
		hintsUsedFrequency: finiteOr(s.hintsUsedFrequency, 0, 0, 1),
		// Left as stored: effectiveInterval() already knows how to read a broken one.
		currentInterval: s.currentInterval as number,
		easeFactor: finiteOr(s.easeFactor, 2.0, 1.3, 2.5),
		workLevel: 0,
		climb: finiteOr(s.climb, 0, 0, 1)
	};
	c.workLevel = workingLevel({ ...c, workLevel: s.workLevel as number });
	return c;
}

export function createStudentModel(): StudentModel {
	const allIds = getRegisteredConceptIds();
	return {
		concepts: Object.fromEntries(
			allIds.map(id => [id, createDefaultConcept(id)])
		),
		overallLevel: 1.0,
		totalAttempts: 0,
		totalCorrect: 0,
		sessionHistory: [],
		streakDays: 0,
		lastActiveDate: ''
	};
}

// ── Persistence ──

const STORAGE_KEY = 'student_model';

export function loadStudentModel(): StudentModel {
	// Runs before the first read so pre-0.6 progress is already in place.
	storage.migrateLegacy();

	return repairModel(storage.load<unknown>(STORAGE_KEY, null));
}

/**
 * A stored model made whole: every registered concept present and repaired,
 * every top-level field in range. Anything that is not a model at all gives a
 * fresh one.
 */
export function repairModel(stored: unknown): StudentModel {
	if (typeof stored !== 'object' || stored === null || Array.isArray(stored)) {
		return createStudentModel();
	}
	const saved = stored as Partial<StudentModel>;
	const savedConcepts: Record<string, unknown> =
		typeof saved.concepts === 'object' && saved.concepts !== null ? saved.concepts : {};
	const model = { ...saved, concepts: {} } as StudentModel;

	// Every concept a module claims, repaired or seeded. Concepts no module claims
	// any more are left behind: ids that were once declared but never generated
	// would otherwise linger forever and pollute every average.
	for (const id of getRegisteredConceptIds()) {
		model.concepts[id] = repairConcept(id, savedConcepts[id]);
	}

	// Repair fields added after this model was first written.
	// A day without a date string cannot be placed, so it goes; any other broken
	// field is filled in, rather than letting NaN reach the week chart.
	if (!Array.isArray(model.sessionHistory)) model.sessionHistory = [];
	model.sessionHistory = (model.sessionHistory as unknown[])
		.filter((e): e is Partial<SessionEntry> & { date: string } =>
			typeof e === 'object' && e !== null && typeof (e as SessionEntry).date === 'string')
		.map((e) => ({
			date: e.date,
			correct: finiteOr(e.correct, 0, 0),
			incorrect: finiteOr(e.incorrect, 0, 0),
			hintsUsed: finiteOr(e.hintsUsed, 0, 0),
			conceptsTouched: Array.isArray(e.conceptsTouched) ? e.conceptsTouched : []
		}));
	model.streakDays = finiteOr(model.streakDays, 0, 0);
	if (typeof model.lastActiveDate !== 'string') model.lastActiveDate = '';
	model.totalAttempts = finiteOr(model.totalAttempts, 0, 0);
	model.totalCorrect = finiteOr(model.totalCorrect, 0, 0, model.totalAttempts);
	model.overallLevel = finiteOr(model.overallLevel, 1.0, 1, 5);

	return model;
}

export function saveStudentModel(model: StudentModel): void {
	storage.save(STORAGE_KEY, model);
}

// ── Derived statistics ──

export function getSuccessRate(model: StudentModel): number {
	if (model.totalAttempts === 0) return 0;
	return Math.round((model.totalCorrect / model.totalAttempts) * 100);
}

export function getConceptCount(model: StudentModel, minConfidence: number): number {
	return Object.values(model.concepts)
		.filter(c => c.confidence >= minConfidence && c.timesCorrect > 0)
		.length;
}

// ── Scheduling helpers ──

/**
 * The longest a concept may wait between reviews.
 *
 * Without a ceiling the interval grew geometrically: ten correct ratings of one
 * concept in a single session took it from 1 day to 1078, and after a month of
 * daily practice nothing was ever due again. Sixty days is still long enough to
 * reward mastery while keeping every concept inside a school term.
 */
export const MAX_INTERVAL_DAYS = 60;

const DAY_MS = 1000 * 60 * 60 * 24;

/**
 * The interval the scheduler actually honours.
 *
 * Also repairs models saved before the ceiling existed: an interval that grew
 * past what a double can hold was stored as `Infinity`, which JSON writes as
 * `null`, and a missing field reads as `undefined`. All of those, and anything
 * past the ceiling, are brought back into range here rather than trusted.
 */
export function effectiveInterval(c: ConceptKnowledge): number {
	const i = c.currentInterval;
	if (typeof i !== 'number' || !Number.isFinite(i) || i < 0) return 1;
	return Math.min(i, MAX_INTERVAL_DAYS);
}

/**
 * Calendar days since the concept was last practised, in local time.
 *
 * Counted in days, not hours: an interval of one day means "tomorrow", whatever
 * the time. Counting hours made a concept practised at 20:00 not due until 20:00
 * the next day, so a student who trains after school saw nothing to review.
 * Rounded, because a day across a clock change is 23 or 25 hours long.
 */
export function daysSinceSeen(c: ConceptKnowledge, now: number = Date.now()): number {
	const midnight = (t: number) => new Date(t).setHours(0, 0, 0, 0);
	return Math.round((midnight(now) - midnight(c.lastSeen)) / DAY_MS);
}

/** Days left until the concept is due; zero or less means due now. */
export function daysUntilDue(c: ConceptKnowledge, now: number = Date.now()): number {
	return effectiveInterval(c) - daysSinceSeen(c, now);
}

/**
 * The concepts to count, optionally narrowed to a set of ids — one course's,
 * say, so an S1 student is not told about S2 concepts waiting for review.
 */
function conceptsIn(model: StudentModel, ids?: Iterable<string>): ConceptKnowledge[] {
	if (!ids) return Object.values(model.concepts);
	return [...ids].map((id) => model.concepts[id]).filter((c): c is ConceptKnowledge => !!c);
}

export function getDueCount(model: StudentModel, ids?: Iterable<string>): number {
	const now = Date.now();
	return conceptsIn(model, ids)
		.filter(c => c.lastSeen !== 0 && daysUntilDue(c, now) <= 0) // never seen = "new", not "due"
		.length;
}

/** The lowest and highest difficulty the bank has. */
export const MIN_LEVEL = 1;
export const MAX_LEVEL = 5;

/**
 * The difficulty this student works at for a concept.
 *
 * Models saved before working levels existed have none; for those it is read
 * off the confidence, so a student who already knows a concept is not sent
 * back to level 1.
 */
export function workingLevel(c: ConceptKnowledge): number {
	const w = c.workLevel;
	if (typeof w === 'number' && Number.isInteger(w) && w >= MIN_LEVEL && w <= MAX_LEVEL) return w;
	if (c.lastSeen === 0) return MIN_LEVEL;
	if (c.confidence < 0.5) return 1;
	if (c.confidence < 0.7) return 2;
	if (c.confidence < 0.85) return 3;
	return 4;
}

// ── Session history helpers ──

/**
 * A date as YYYY-MM-DD in the student's own time zone.
 *
 * `toISOString()` gives the UTC date, which in Norway is still yesterday until
 * 01:00 (02:00 in summer). That made the streak, «Du har trena i dag» and the
 * week chart change day in the middle of the night — and on the night the
 * clocks go forward, two days mapped to the same date and the progress page's
 * keyed list threw.
 */
export function localISO(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

/** ISO date string for today, in local time. */
export function todayISO(): string {
	return localISO(new Date());
}

/** Get or create today's session entry in the model */
export function getOrCreateTodaySession(model: StudentModel): SessionEntry {
	const today = todayISO();
	let entry = model.sessionHistory.find(e => e.date === today);
	if (!entry) {
		entry = { date: today, correct: 0, incorrect: 0, hintsUsed: 0, conceptsTouched: [] };
		model.sessionHistory.push(entry);
		// Cap at 90 days
		if (model.sessionHistory.length > 90) {
			model.sessionHistory = model.sessionHistory.slice(-90);
		}
	}
	return entry;
}

/** Update streak based on lastActiveDate */
export function updateStreak(model: StudentModel): void {
	const today = todayISO();
	if (model.lastActiveDate === today) return; // already counted today

	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	const yesterdayISO = localISO(yesterday);

	if (model.lastActiveDate === yesterdayISO) {
		model.streakDays++;
	} else if (model.lastActiveDate !== today) {
		model.streakDays = 1; // reset: gap of >1 day
	}
	model.lastActiveDate = today;
}

export type Mastery = 'Ikkje prøvd' | 'Treng øving' | 'Usikker' | 'På veg' | 'Sit';

/** Correct answers a concept needs before it can count as mastered. */
export const MASTERY_MIN_CORRECT = 3;

/**
 * How well a concept sits, in words for the progress page.
 *
 * "Sit" used to follow from confidence alone, and one correct answer on a
 * level 1 problem was enough. Now it also takes several correct answers and a
 * working level that has climbed to level 3 — or to the top of what the
 * concept offers, for a concept that stops below that.
 *
 * @param topLevel the highest level the bank has for this concept
 */
export function mastery(c: ConceptKnowledge, topLevel: number = MAX_LEVEL): Mastery {
	if (c.lastSeen === 0) return 'Ikkje prøvd';
	const levelReached = workingLevel(c) >= Math.min(3, topLevel);
	if (c.confidence >= 0.8 && c.timesCorrect >= MASTERY_MIN_CORRECT && levelReached) return 'Sit';
	if (c.confidence >= 0.6) return 'På veg';
	if (c.confidence >= 0.4) return 'Usikker';
	return 'Treng øving';
}

/**
 * The streak as it stands today.
 *
 * `streakDays` is only updated when the student practises, so on its own it
 * still showed last month's streak to a student coming back after a break.
 * A streak survives until the end of the day after the last session.
 */
export function currentStreak(model: StudentModel): number {
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	const alive = model.lastActiveDate === todayISO() || model.lastActiveDate === localISO(yesterday);
	return alive ? model.streakDays : 0;
}

/** Get review schedule buckets */
export interface ReviewBuckets {
	dueNow: ConceptKnowledge[];
	dueTomorrow: ConceptKnowledge[];
	dueWeek: ConceptKnowledge[];
}

export function getReviewBuckets(model: StudentModel, ids?: Iterable<string>): ReviewBuckets {
	const now = Date.now();
	const dueNow: ConceptKnowledge[] = [];
	const dueTomorrow: ConceptKnowledge[] = [];
	const dueWeek: ConceptKnowledge[] = [];

	for (const c of conceptsIn(model, ids)) {
		if (c.lastSeen === 0) continue; // never seen
		const left = daysUntilDue(c, now);

		if (left <= 0) {
			dueNow.push(c);
		} else if (left <= 1) {
			dueTomorrow.push(c);
		} else if (left <= 7) {
			dueWeek.push(c);
		}
	}

	return { dueNow, dueTomorrow, dueWeek };
}
