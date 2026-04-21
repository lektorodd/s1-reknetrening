// Types for the logarithm topic module

export type LogTopicId = 'log_product' | 'log_quotient' | 'log_power' | 'log_simplify' | 'log_equation' | 'exp_equation';

export interface StepEntry {
	label: string;   // e.g. "Identify" or "Apply rule"
	latex: string;   // LaTeX content for this step
}

export interface LogProblem {
	id: number;
	topic: LogTopicId;
	level: number;
	type: 'lg' | 'ln';   // which base: log₁₀ or logₑ
	q: string;            // LaTeX question
	a: string;            // LaTeX answer
	steps: string;        // LaTeX step-by-step (legacy, full string)
	structuredSteps: StepEntry[];  // Individual steps for fading
	hint: string;         // Text hint
}

export interface LogTheoryEntry {
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
