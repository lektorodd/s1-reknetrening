// Shared type family for all topic modules.
//
// Before v0.6 each module declared its own near-identical Problem / TheoryEntry /
// SelfExplanation types, which is why nothing in the engine or the UI could be
// written once and reused. These are the single definitions.

// Math convention across every module: LaTeX fields hold *bare* LaTeX and the
// view supplies the delimiters. Prose fields may carry inline $...$ of their own.
// Before v0.6 the two modules disagreed — derivative wrapped its answers in $$
// and its formulas in display math while logarithm stored neither, so whichever
// component rendered them had to guess.

/** One line of a worked solution. `label` is display-ready nynorsk. */
export interface StepEntry {
	label: string;
	latex: string;
}

/**
 * A generated practice problem.
 *
 * `id` is deterministic and stable: `<moduleId>:<topic>:<level>:<variant>`.
 * Rebuilding the bank always yields the same problem for the same id.
 */
export interface Problem {
	id: string;
	moduleId: string;
	topic: string;
	level: number;
	/** Module-specific variant tag, e.g. 'poly' | 'root' | 'exp' or 'lg' | 'ln'. */
	type: string;
	/** Question, bare LaTeX. */
	q: string;
	/** Answer, bare LaTeX — the final line of the worked solution. */
	a: string;
	structuredSteps: StepEntry[];
	hint: string;
}

/** One step of a curated, hand-written worked example. */
export interface WorkedStep {
	explanation: string;
	latex: string;
}

/** Curated instruction for one topic. Lives in the Lærebok, never drilled. */
export interface TheoryEntry {
	title: string;
	/** Prose; may contain inline $...$. */
	intro: string;
	/** Bare LaTeX. */
	formula: string;
	ruleText: string;
	example: string;
	patternRecognition: string;
	thinkAloud: string;
	workedSteps: WorkedStep[];
	mnemonic: string;
}

/** A multiple-choice "why did we do that?" prompt shown after a reveal. */
export interface SelfExplanation {
	question: string;
	options: string[];
	correct: number;
}

export interface TopicMeta {
	id: string;
	name: string;
}

/**
 * The contract every topic module implements.
 *
 * Adding a topic means adding a folder that exports one of these and listing it
 * in MODULE_REGISTRY — no new route, component or engine change.
 */
export interface TopicModule {
	id: string;
	/** URL segment used in the Lærebok, e.g. 'derivasjon'. */
	slug: string;
	icon: string;
	color: string;
	name: string;
	description: string;
	topics: TopicMeta[];
	generateBank(): Problem[];
	theory: Record<string, TheoryEntry>;
	selfExplanations: Record<string, SelfExplanation[]>;
	/** How this module maps a problem onto a trackable concept. */
	conceptIdOf(problem: Problem): string;
	/** Human-readable name for a concept id, for stats and the review list. */
	conceptName(conceptId: string): string;
}
