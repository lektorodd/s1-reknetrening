import type { Problem, TopicModule } from '../types';
import { generateProblemBank, MODULE_ID } from './generator';
import { INTEGRAL_THEORY } from './theory';
import { INTEGRAL_SELF_EXPLANATIONS } from './self-explanation';

const TOPIC_NAMES: Record<string, string> = {
	substitution: 'Variabelskifte',
	parts: 'Delvis integrasjon',
	partial: 'Delbrøkoppspalting',
	mixed: 'Blanda metodar'
};

/**
 * What makes a problem the level it is — which, for integration, is the skill.
 * For derivatives the function family (polynomial, root, exponential) is the
 * variation that matters; here it is how far the method is from the surface.
 */
const TYPE_NAMES: Record<string, string> = {
	linear: 'lineær kjerne',
	exact: 'kjernen sin derivert står der',
	scaled: 'konstant må justerast',
	definite: 'bestemt integral',
	rewrite: 'omskriving',
	exp: 'eksponential',
	log: 'logaritme',
	frac: 'brøk og rot',
	twice: 'to rundar',
	combined: 'kombinasjon',
	distinct: 'ulike faktorar',
	factor: 'faktorisering',
	division: 'divisjon',
	triple: 'tre faktorar',
	repeated: 'dobbel faktor',
	recognise: 'kjenne att metoden',
	combine: 'kombinere metodar',
	context: 'samansette oppgåver'
};

export const integralModule: TopicModule = {
	id: MODULE_ID,
	slug: 'integrasjon',
	course: 'S2',
	icon: '∫',
	// Violet already means "worked example" everywhere in the app — the ladder's
	// edge, the step labels, the rule box — so a violet module would read as that
	// rather than as a subject. Rust is clear of both the blue and the green.
	color: '#9C4221',
	name: 'Integrasjon',
	description: 'Variabelskifte, delvis integrasjon, delbrøk og blanda metodar',
	topics: Object.entries(TOPIC_NAMES).map(([id, name]) => ({ id, name })),
	generateBank: generateProblemBank,
	theory: INTEGRAL_THEORY,
	selfExplanations: INTEGRAL_SELF_EXPLANATIONS,
	conceptIdOf: (p: Problem) => `${p.topic}_${p.type}`,
	conceptName: (conceptId: string) => {
		const [topic, type] = conceptId.split('_');
		const t = TOPIC_NAMES[topic];
		if (!t) return conceptId;
		return type && TYPE_NAMES[type] ? `${t} · ${TYPE_NAMES[type]}` : t;
	}
};
