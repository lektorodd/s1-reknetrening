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
		easeFactor: 2.0        // FSRS default
	};
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

	const saved = storage.load<StudentModel | null>(STORAGE_KEY, null);
	if (!saved) return createStudentModel();

	const model = { ...saved, concepts: { ...saved.concepts } };
	const allIds = getRegisteredConceptIds();

	// Seed concepts introduced by a new module.
	for (const id of allIds) {
		if (!model.concepts[id]) model.concepts[id] = createDefaultConcept(id);
	}

	// Drop concepts no module claims any more. Without this, ids that were once
	// declared but never generated linger forever and pollute every average.
	const live = new Set(allIds);
	for (const id of Object.keys(model.concepts)) {
		if (!live.has(id)) delete model.concepts[id];
	}

	// Repair fields added after this model was first written.
	if (!Array.isArray(model.sessionHistory)) model.sessionHistory = [];
	if (typeof model.streakDays !== 'number') model.streakDays = 0;
	if (typeof model.lastActiveDate !== 'string') model.lastActiveDate = '';
	if (typeof model.totalAttempts !== 'number') model.totalAttempts = 0;
	if (typeof model.totalCorrect !== 'number') model.totalCorrect = 0;
	if (typeof model.overallLevel !== 'number') model.overallLevel = 1.0;

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

export function getDueCount(model: StudentModel): number {
	const now = Date.now();
	return Object.values(model.concepts)
		.filter(c => {
			if (c.lastSeen === 0) return false; // never seen = not "due", it's "new"
			const daysSince = (now - c.lastSeen) / (1000 * 60 * 60 * 24);
			return daysSince >= c.currentInterval;
		})
		.length;
}

// ── Session history helpers ──

/** ISO date string for today (local time) */
export function todayISO(): string {
	return new Date().toISOString().slice(0, 10);
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
	const yesterdayISO = yesterday.toISOString().slice(0, 10);

	if (model.lastActiveDate === yesterdayISO) {
		model.streakDays++;
	} else if (model.lastActiveDate !== today) {
		model.streakDays = 1; // reset: gap of >1 day
	}
	model.lastActiveDate = today;
}

/** Get review schedule buckets */
export interface ReviewBuckets {
	dueNow: ConceptKnowledge[];
	dueTomorrow: ConceptKnowledge[];
	dueWeek: ConceptKnowledge[];
}

export function getReviewBuckets(model: StudentModel): ReviewBuckets {
	const now = Date.now();
	const DAY = 1000 * 60 * 60 * 24;
	const dueNow: ConceptKnowledge[] = [];
	const dueTomorrow: ConceptKnowledge[] = [];
	const dueWeek: ConceptKnowledge[] = [];

	for (const c of Object.values(model.concepts)) {
		if (c.lastSeen === 0) continue; // never seen
		const daysSince = (now - c.lastSeen) / DAY;
		const daysUntilDue = c.currentInterval - daysSince;

		if (daysUntilDue <= 0) {
			dueNow.push(c);
		} else if (daysUntilDue <= 1) {
			dueTomorrow.push(c);
		} else if (daysUntilDue <= 7) {
			dueWeek.push(c);
		}
	}

	return { dueNow, dueTomorrow, dueWeek };
}
