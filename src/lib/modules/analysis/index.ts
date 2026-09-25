import type { Problem, TopicModule } from '../types';
import { generateAnalysisBank, MODULE_ID } from './generator';
import { ANALYSIS_THEORY } from './theory';
import { ANALYSIS_SELF_EXPLANATIONS } from './self-explanation';

const TOPIC_NAMES: Record<string, string> = {
	tangent: 'Tangenten',
	extrema: 'Topp- og botnpunkt',
	optimisation: 'Optimering'
};

/** Most problems carry their own instruction — the point or the interval is part of it. */
const INSTRUCTIONS: Record<string, string> = {
	tangent: 'Finn likninga for tangenten.',
	extrema: 'Finn toppunkta og botnpunkta til grafen.',
	optimisation: 'Finn den største og den minste verdien.'
};

/**
 * What the derivative is for in S1: the tangent at a point, top and bottom
 * points from a sign chart, and optimisation. The rules themselves live in
 * Derivasjon; this module is about using them.
 */
export const analysisModule: TopicModule = {
	id: MODULE_ID,
	slug: 'drofting',
	course: 'S1',
	icon: 'f′',
	// Teal: clear of the blue and green of the other S1 modules, of the rust of
	// S2, and of the colours that carry a meaning (violet, amber, mint).
	color: '#2C7A7B',
	name: 'Drøfting',
	description: 'Tangentar, topp- og botnpunkt med forteiknslinje, og optimering',
	topics: Object.entries(TOPIC_NAMES).map(([id, name]) => ({ id, name, instruction: INSTRUCTIONS[id] })),
	generateBank: generateAnalysisBank,
	theory: ANALYSIS_THEORY,
	selfExplanations: ANALYSIS_SELF_EXPLANATIONS,
	conceptIdOf: (p: Problem) => p.topic,
	conceptName: (conceptId: string) => TOPIC_NAMES[conceptId] ?? conceptId
};
