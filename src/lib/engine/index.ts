// Learning engine — barrel export.
export {
	type StudentModel,
	type ConceptKnowledge,
	type SessionEntry,
	type ReviewBuckets,
	createStudentModel,
	loadStudentModel,
	saveStudentModel,
	getRegisteredConceptIds,
	getSuccessRate,
	getConceptCount,
	getDueCount,
	getReviewBuckets,
	todayISO
} from './student-model';
export { isDue, urgency, updateAfterAttempt, type AttemptResult } from './spaced-repetition';
export { selectNextProblems, splitBudget } from './problem-selector';
export { selectFadingLevel, fadeSteps, type FadingLevel, type FadedSteps } from './guidance-fading';
export {
	buildSession,
	SESSION_LENGTH,
	MIN_PRACTICE_LEVEL,
	type Session,
	type SessionCard
} from './session';
