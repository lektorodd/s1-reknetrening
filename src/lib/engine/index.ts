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
export { fadeSteps, type FadingLevel, type FadedSteps } from './guidance-fading';
export {
	buildLadder,
	LADDER_RUNGS,
	LADDER_LEVEL,
	type LadderRung
} from './ladder';
export {
	buildSession,
	filterBank,
	SESSION_LENGTH,
	type BankFilter,
	type Session,
	type SessionCard
} from './session';
