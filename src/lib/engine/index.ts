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
	isWorkedExample,
	SESSION_LENGTH,
	MAX_WORKED_EXAMPLES,
	type Session,
	type SessionCard
} from './session';
