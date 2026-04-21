// Types for the derivative topic module

export type TopicId = 'chain' | 'product' | 'quotient';
export type ProblemType = 'poly' | 'root' | 'exp' | 'log';

export interface StepEntry {
	label: string;   // e.g. "Identify" or "Apply rule"
	latex: string;   // LaTeX content for this step
}

export interface Problem {
	id: number;
	topic: TopicId;
	level: number;
	type: ProblemType;
	q: string;      // LaTeX question
	a: string;      // LaTeX answer
	steps: string;   // LaTeX step-by-step (legacy, full string)
	structuredSteps: StepEntry[];  // Individual steps for fading
	hint: string;    // Text hint
}

export interface TheoryEntry {
	title: Record<string, string>;
	intro: Record<string, string>;
	formula: string;
	ruleText: Record<string, string>;
	example: Record<string, string>;
	patternRecognition: Record<string, string>;
	thinkAloud: Record<string, string>;
	workedSteps: { explanation: Record<string, string>; latex: string }[];
	mnemonic: Record<string, string>;
}

