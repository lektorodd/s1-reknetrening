import type { Problem, TopicModule } from '../types';
import { generateProblemBank, MODULE_ID } from './generator';
import { theoryBank } from './theory';
import { SELF_EXPLANATIONS } from './self-explanation';

const TOPIC_NAMES: Record<string, string> = {
	power: 'Potensregelen',
	chain: 'Kjerneregelen',
	product: 'Produktregelen',
	quotient: 'Brøkregelen'
};

const TYPE_NAMES: Record<string, string> = {
	poly: 'polynom',
	root: 'rot',
	exp: 'eksponential',
	log: 'logaritme'
};

export const derivativeModule: TopicModule = {
	id: MODULE_ID,
	slug: 'derivasjon',
	course: 'S1',
	icon: '∂',
	color: '#2B6CB0',
	name: 'Derivasjon',
	description: 'Potensregelen, kjerneregelen, produktregelen og brøkregelen',
	topics: Object.entries(TOPIC_NAMES).map(([id, name]) => ({
		id,
		name,
		instruction: 'Deriver funksjonen.'
	})),
	generateBank: generateProblemBank,
	theory: theoryBank,
	selfExplanations: SELF_EXPLANATIONS,
	// A derivative concept is a rule applied to a function family: the chain rule
	// on a root is a different skill from the chain rule on a polynomial.
	conceptIdOf: (p: Problem) => `${p.topic}_${p.type}`,
	conceptName: (conceptId: string) => {
		const [topic, type] = conceptId.split('_');
		const t = TOPIC_NAMES[topic];
		if (!t) return conceptId;
		return type && TYPE_NAMES[type] ? `${t} · ${TYPE_NAMES[type]}` : t;
	}
};
