// Spaced Repetition – FSRS-inspired scheduling and Bayesian confidence updates
// Based on future-report §3.2

import type { ConceptKnowledge, StudentModel } from './student-model';
import { getOrCreateTodaySession, updateStreak } from './student-model';

// ── Scheduling ──

/** Check whether a concept is due for review */
export function isDue(concept: ConceptKnowledge): boolean {
	if (concept.lastSeen === 0) return false; // never seen → "new", not "due"
	const daysSince = (Date.now() - concept.lastSeen) / (1000 * 60 * 60 * 24);
	return daysSince >= concept.currentInterval;
}

/** Urgency score: higher = more urgent to review */
export function urgency(concept: ConceptKnowledge): number {
	if (concept.lastSeen === 0) return 0;
	const daysSince = (Date.now() - concept.lastSeen) / (1000 * 60 * 60 * 24);
	const overdue = Math.max(0, daysSince - concept.currentInterval);
	return overdue * (1 - concept.confidence);
}

// ── Update after attempt ──

export interface AttemptResult {
	conceptId: string;
	correct: boolean;
	hintUsed: boolean;
}

/**
 * Update a concept's knowledge state after an attempt.
 * Uses Bayesian confidence update and FSRS-inspired interval scheduling.
 */
export function updateAfterAttempt(
	model: StudentModel,
	result: AttemptResult
): void {
	const concept = model.concepts[result.conceptId];
	if (!concept) return;

	// ── 1. Bayesian confidence update ──
	const prior = concept.confidence;
	const likelihood = result.correct ? 0.85 : 0.15;
	const posterior = (prior * likelihood) /
		((prior * likelihood) + ((1 - prior) * (1 - likelihood)));
	concept.confidence = clamp(posterior, 0.01, 0.99);

	// ── 2. FSRS-inspired interval scheduling ──
	if (result.correct) {
		if (concept.currentInterval === 0) {
			concept.currentInterval = 1; // first review: 1 day
		} else {
			concept.currentInterval = Math.round(
				concept.currentInterval * concept.easeFactor
			);
		}
		// Easy bonus: if confidence is high, increase ease
		if (concept.confidence > 0.85) {
			concept.easeFactor = Math.min(concept.easeFactor + 0.05, 2.5);
		}
	} else {
		// Lapse: cut interval, reduce ease
		concept.currentInterval = Math.max(1, Math.round(concept.currentInterval * 0.5));
		concept.easeFactor = Math.max(concept.easeFactor - 0.15, 1.3);
	}

	// ── 3. Update counters ──
	concept.lastSeen = Date.now();
	if (result.correct) {
		concept.timesCorrect++;
		model.totalCorrect++;
	} else {
		concept.timesIncorrect++;
	}
	model.totalAttempts++;

	// ── 4. Hint usage (exponential moving average) ──
	if (result.hintUsed) {
		concept.hintsUsedFrequency = concept.hintsUsedFrequency * 0.8 + 0.2;
	} else {
		concept.hintsUsedFrequency *= 0.8;
	}

	// ── 5. Recalculate overall level ──
	model.overallLevel = recalculateOverallLevel(model);

	// ── 6. Record session history ──
	const session = getOrCreateTodaySession(model);
	if (result.correct) session.correct++;
	else session.incorrect++;
	if (result.hintUsed) session.hintsUsed++;
	if (!session.conceptsTouched.includes(result.conceptId)) {
		session.conceptsTouched.push(result.conceptId);
	}
	updateStreak(model);
}

/**
 * Compute overall student level (1.0–5.0) from concept confidences.
 * Weighted toward attempted concepts, clamped to range.
 */
function recalculateOverallLevel(model: StudentModel): number {
	const concepts = Object.values(model.concepts);
	const attempted = concepts.filter(c => c.lastSeen > 0);
	if (attempted.length === 0) return 1.0;

	const avgConfidence = attempted.reduce((sum, c) => sum + c.confidence, 0) / attempted.length;
	// Map 0–1 confidence to 1–5 level
	const level = 1 + avgConfidence * 4;
	return clamp(Math.round(level * 10) / 10, 1.0, 5.0); // round to 1 decimal
}

function clamp(v: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, v));
}
