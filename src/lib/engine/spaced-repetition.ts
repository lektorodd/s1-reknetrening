// Spaced Repetition – FSRS-inspired scheduling and Bayesian confidence updates
// Based on future-report §3.2

import type { ConceptKnowledge, StudentModel } from './student-model';
import {
	daysUntilDue,
	effectiveInterval,
	getOrCreateTodaySession,
	MAX_INTERVAL_DAYS,
	MAX_LEVEL,
	MIN_LEVEL,
	updateStreak,
	workingLevel
} from './student-model';

// ── Scheduling ──

/** Check whether a concept is due for review */
export function isDue(concept: ConceptKnowledge): boolean {
	if (concept.lastSeen === 0) return false; // never seen → "new", not "due"
	return daysUntilDue(concept) <= 0;
}

/**
 * Urgency score: higher = more urgent to review. Zero unless due.
 *
 * A concept due today scores by how shaky it is; each day overdue adds to that.
 */
export function urgency(concept: ConceptKnowledge): number {
	if (concept.lastSeen === 0) return 0;
	const left = daysUntilDue(concept);
	if (left > 0) return 0;
	return (1 - left) * (1 - concept.confidence);
}

// ── Update after attempt ──

export interface AttemptResult {
	conceptId: string;
	correct: boolean;
	hintUsed: boolean;
	/**
	 * Difficulty of the problem answered. Required: without it every rating
	 * would count as if at the working level, and the staircase could not tell a
	 * hard success from an easy one.
	 */
	level: number;
}

/**
 * How much one self-rating says, as the likelihood of that rating from a student
 * who has the concept.
 *
 * A correct answer used to count the same at every level, so one "Fekk det til"
 * on a level 1 problem took confidence from 0.5 to 0.85 and the concept read as
 * mastered. Now a harder problem is stronger evidence, and a correct answer
 * with the hint open is worth half as much.
 */
export function evidence(correct: boolean, level: number, hintUsed: boolean): number {
	if (!correct) return 0.25;
	const strength = 0.6 + 0.05 * Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, level)); // 0.65 … 0.85
	return hintUsed ? 0.5 + (strength - 0.5) / 2 : strength;
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

	// Read before lastSeen moves: was this a scheduled review, or the same concept
	// coming round again before it was due (later in the same session, say)?
	const firstTime = concept.lastSeen === 0;
	const wasDue = firstTime || isDue(concept);
	const work = workingLevel(concept);
	const level = result.level;

	// ── 1. Bayesian confidence update ──
	const prior = concept.confidence;
	const likelihood = evidence(result.correct, level, result.hintUsed);
	const posterior = (prior * likelihood) /
		((prior * likelihood) + ((1 - prior) * (1 - likelihood)));
	concept.confidence = clamp(posterior, 0.01, 0.99);

	// ── 1b. Working level ──
	// Two up, one down: a step up after the second unaided correct answer in a
	// row at or above it. After a miss, one step down — or to the level that was
	// missed, if that is lower still. A correct answer with the hint open, or on
	// an easier problem, leaves it where it is.
	concept.workLevel = work;
	if (result.correct) {
		if (!result.hintUsed && level >= work) {
			if (concept.climb >= 1) {
				concept.workLevel = Math.min(MAX_LEVEL, level + 1);
				concept.climb = 0;
			} else {
				concept.climb = 1;
			}
		}
	} else {
		concept.workLevel = Math.max(MIN_LEVEL, Math.min(work - 1, level));
		concept.climb = 0;
	}

	// ── 2. FSRS-inspired interval scheduling ──
	//
	// The interval only grows on a review that was actually due. It used to grow on
	// every correct rating, so a concept drawn three times in one session tripled
	// its schedule in five minutes, and a month of daily practice pushed intervals
	// past 10^18 days — the scheduler simply stopped scheduling. A correct answer
	// before the concept was due still raises confidence; it just doesn't move the
	// next review further away.
	const ease = Number.isFinite(concept.easeFactor) ? concept.easeFactor : 2.0;
	if (result.correct) {
		if (firstTime || concept.currentInterval === 0) {
			concept.currentInterval = 1; // first review: 1 day
		} else if (wasDue && !result.hintUsed) {
			// Only an unaided answer pushes the next review further out; with the
			// hint open the concept comes back on the same schedule.
			concept.currentInterval = Math.min(
				MAX_INTERVAL_DAYS,
				Math.max(1, Math.round(effectiveInterval(concept) * ease))
			);
			// Easy bonus, only on a real review for the same reason.
			if (concept.confidence > 0.85) {
				concept.easeFactor = Math.min(ease + 0.05, 2.5);
			}
		} else {
			// Early repeat or hinted: keep the schedule, but normalise a stored value
			// that is out of range (an old model with an exploded interval, say).
			concept.currentInterval = effectiveInterval(concept);
		}
	} else {
		// Lapse: the concept is back to being learnt, so it comes back tomorrow.
		// Halving used to leave a 1078-day interval at 539.
		concept.currentInterval = 1;
		concept.easeFactor = Math.max(ease - 0.15, 1.3);
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
