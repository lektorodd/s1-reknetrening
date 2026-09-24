import type { Problem, TopicModule } from '../types';
import { generateLogProblemBank, MODULE_ID } from './generator';
import { LOG_THEORY } from './theory';
import { LOG_SELF_EXPLANATIONS } from './self-explanation';

const TOPIC_NAMES: Record<string, string> = {
	log_product: 'Produktsetninga',
	log_quotient: 'Kvotientsetninga',
	log_power: 'Potenssetninga',
	log_simplify: 'Forenkling',
	log_equation: 'Logaritmelikningar',
	exp_equation: 'Eksponentiallikningar'
};

/**
 * The usual task per topic. Problems that ask the other way round — combine
 * into one logarithm instead of expanding — carry their own instruction.
 */
const INSTRUCTIONS: Record<string, string> = {
	log_product: 'Skriv som ein sum av logaritmar.',
	log_quotient: 'Skriv ut logaritmen så langt det går.',
	log_power: 'Skriv ut logaritmen med potenssetninga.',
	log_simplify: 'Skriv ut logaritmen så langt det går.',
	log_equation: 'Løys likninga.',
	exp_equation: 'Løys likninga.'
};

export const logarithmModule: TopicModule = {
	id: MODULE_ID,
	slug: 'logaritmar',
	course: 'S1',
	icon: 'log',
	color: '#276749',
	name: 'Logaritmar',
	description: 'Reknereglane, forenkling og likningar',
	topics: Object.entries(TOPIC_NAMES).map(([id, name]) => ({ id, name, instruction: INSTRUCTIONS[id] })),
	generateBank: generateLogProblemBank,
	theory: LOG_THEORY,
	selfExplanations: LOG_SELF_EXPLANATIONS,
	// Base (lg vs ln) is notation, not a separate skill — the topic is the concept.
	conceptIdOf: (p: Problem) => p.topic,
	conceptName: (conceptId: string) => TOPIC_NAMES[conceptId] ?? conceptId
};
