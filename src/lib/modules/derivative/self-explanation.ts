// Self-Explanation Prompts
// Based on future-report §6.3 and CLT research
// Randomized pool of localized multiple-choice questions shown at fading levels 2-3

import type { TopicId } from '$lib/modules/derivative/types';
import type { Lang } from '$lib/i18n';

export interface SelfExplanation {
	question: Record<Lang, string>;
	options: { text: Record<Lang, string>; correct: boolean }[];
}

const chainExplanations: SelfExplanation[] = [
	{
		question: {
			nn: 'Kvifor brukar vi kjerneregelen her?',
			en: 'Why do we use the chain rule here?',
			es: '¿Por qué usamos la regla de la cadena aquí?'
		},
		options: [
			{
				text: {
					nn: 'Fordi vi har ein funksjon inne i ein annan funksjon',
					en: 'Because there is a function inside another function',
					es: 'Porque hay una función dentro de otra función'
				},
				correct: true
			},
			{
				text: {
					nn: 'Fordi vi gangar to funksjonar saman',
					en: 'Because we are multiplying two functions',
					es: 'Porque estamos multiplicando dos funciones'
				},
				correct: false
			},
			{
				text: {
					nn: 'Fordi eksponenten er større enn 1',
					en: 'Because the exponent is greater than 1',
					es: 'Porque el exponente es mayor que 1'
				},
				correct: false
			}
		]
	},
	{
		question: {
			nn: 'Kva er den "indre funksjonen" i dette uttrykket?',
			en: 'What is the "inner function" in this expression?',
			es: '¿Cuál es la "función interior" en esta expresión?'
		},
		options: [
			{
				text: {
					nn: 'Det som står inni parentesen eller under rotteiknet',
					en: 'What is inside the parentheses or under the root sign',
					es: 'Lo que está dentro del paréntesis o bajo el signo de la raíz'
				},
				correct: true
			},
			{
				text: {
					nn: 'Den ytste operasjonen (potens, rot, ln)',
					en: 'The outermost operation (power, root, ln)',
					es: 'La operación más externa (potencia, raíz, ln)'
				},
				correct: false
			},
			{
				text: {
					nn: 'Koeffisienten framfor uttrykket',
					en: 'The coefficient in front of the expression',
					es: 'El coeficiente delante de la expresión'
				},
				correct: false
			}
		]
	},
	{
		question: {
			nn: 'Kunne vi løyst denne oppgåva utan kjerneregelen?',
			en: 'Could we solve this without the chain rule?',
			es: '¿Podríamos resolver esto sin la regla de la cadena?'
		},
		options: [
			{
				text: {
					nn: 'Berre viss vi utvida uttrykket først (om mogleg)',
					en: 'Only if we expanded the expression first (if possible)',
					es: 'Solo si expandiéramos la expresión primero (si es posible)'
				},
				correct: true
			},
			{
				text: {
					nn: 'Ja, vi kan alltid bruke produktregelen i staden',
					en: 'Yes, we can always use the product rule instead',
					es: 'Sí, siempre podemos usar la regla del producto'
				},
				correct: false
			},
			{
				text: {
					nn: 'Nei, det er umogleg å derivere utan kjerneregelen',
					en: 'No, it is impossible to derive without the chain rule',
					es: 'No, es imposible derivar sin la regla de la cadena'
				},
				correct: false
			}
		]
	}
];

const productExplanations: SelfExplanation[] = [
	{
		question: {
			nn: 'Kvifor brukar vi produktregelen her?',
			en: 'Why do we use the product rule here?',
			es: '¿Por qué usamos la regla del producto aquí?'
		},
		options: [
			{
				text: {
					nn: 'Fordi vi gangar to separate funksjonar av x',
					en: 'Because we are multiplying two separate functions of x',
					es: 'Porque estamos multiplicando dos funciones separadas de x'
				},
				correct: true
			},
			{
				text: {
					nn: 'Fordi vi har ein funksjon inne i ein annan',
					en: 'Because we have a function inside another',
					es: 'Porque tenemos una función dentro de otra'
				},
				correct: false
			},
			{
				text: {
					nn: 'Fordi det er ein brøk',
					en: 'Because it is a fraction',
					es: 'Porque es una fracción'
				},
				correct: false
			}
		]
	},
	{
		question: {
			nn: 'Kva skjer om vi gløymer produktregelen og berre deriverer kvart ledd?',
			en: 'What happens if we forget the product rule and just derive each factor?',
			es: '¿Qué pasa si olvidamos la regla del producto y solo derivamos cada factor?'
		},
		options: [
			{
				text: {
					nn: 'Vi får feil svar — (uv)\' ≠ u\'v\'',
					en: 'We get a wrong answer — (uv)\' ≠ u\'v\'',
					es: 'Obtenemos una respuesta incorrecta — (uv)\' ≠ u\'v\''
				},
				correct: true
			},
			{
				text: {
					nn: 'Det fungerer heilt fint',
					en: 'It works just fine',
					es: 'Funciona bien'
				},
				correct: false
			},
			{
				text: {
					nn: 'Vi må bruke kjerneregelen i staden',
					en: 'We need to use the chain rule instead',
					es: 'Necesitamos usar la regla de la cadena'
				},
				correct: false
			}
		]
	},
	{
		question: {
			nn: 'Kva er u og v i produktregelen (uv)\' = u\'v + uv\'?',
			en: 'What are u and v in the product rule (uv)\' = u\'v + uv\'?',
			es: '¿Qué son u y v en la regla del producto (uv)\' = u\'v + uv\'?'
		},
		options: [
			{
				text: {
					nn: 'Dei to faktorane som blir ganga saman',
					en: 'The two factors being multiplied together',
					es: 'Los dos factores que se multiplican'
				},
				correct: true
			},
			{
				text: {
					nn: 'Teljar og nemnar i ein brøk',
					en: 'Numerator and denominator in a fraction',
					es: 'Numerador y denominador en una fracción'
				},
				correct: false
			},
			{
				text: {
					nn: 'Den indre og ytre funksjonen',
					en: 'The inner and outer function',
					es: 'La función interior y exterior'
				},
				correct: false
			}
		]
	}
];

const quotientExplanations: SelfExplanation[] = [
	{
		question: {
			nn: 'Kvifor brukar vi kvotientregelen her?',
			en: 'Why do we use the quotient rule here?',
			es: '¿Por qué usamos la regla del cociente aquí?'
		},
		options: [
			{
				text: {
					nn: 'Fordi vi deler éin funksjon på ein annan',
					en: 'Because we are dividing one function by another',
					es: 'Porque estamos dividiendo una función por otra'
				},
				correct: true
			},
			{
				text: {
					nn: 'Fordi vi gangar to funksjonar saman',
					en: 'Because we are multiplying two functions',
					es: 'Porque estamos multiplicando dos funciones'
				},
				correct: false
			},
			{
				text: {
					nn: 'Fordi det er ein samansett funksjon',
					en: 'Because it is a composite function',
					es: 'Porque es una función compuesta'
				},
				correct: false
			}
		]
	},
	{
		question: {
			nn: 'Kva skjer med nemnaren i svaret etter bruk av kvotientregelen?',
			en: 'What happens to the denominator after applying the quotient rule?',
			es: '¿Qué pasa con el denominador después de aplicar la regla del cociente?'
		},
		options: [
			{
				text: {
					nn: 'Han blir kvadrert (v²)',
					en: 'It gets squared (v²)',
					es: 'Se eleva al cuadrado (v²)'
				},
				correct: true
			},
			{
				text: {
					nn: 'Han forsvinn',
					en: 'It disappears',
					es: 'Desaparece'
				},
				correct: false
			},
			{
				text: {
					nn: 'Han blir derivert',
					en: 'It gets derived',
					es: 'Se deriva'
				},
				correct: false
			}
		]
	},
	{
		question: {
			nn: 'Kva er rekkefølgja i teljaren i kvotientregelen?',
			en: 'What is the order in the numerator of the quotient rule?',
			es: '¿Cuál es el orden en el numerador de la regla del cociente?'
		},
		options: [
			{
				text: {
					nn: 'u\'v − uv\' (derivert teljar · nemnar minus teljar · derivert nemnar)',
					en: 'u\'v − uv\' (derivative of top · bottom minus top · derivative of bottom)',
					es: 'u\'v − uv\' (derivada del numerador · denominador menos numerador · derivada del denominador)'
				},
				correct: true
			},
			{
				text: {
					nn: 'uv\' − u\'v (omvendt rekkefølgje)',
					en: 'uv\' − u\'v (reversed order)',
					es: 'uv\' − u\'v (orden invertido)'
				},
				correct: false
			},
			{
				text: {
					nn: 'u\'v\' (berre deriverer begge)',
					en: 'u\'v\' (just derive both)',
					es: 'u\'v\' (solo derivar ambos)'
				},
				correct: false
			}
		]
	}
];

const explanationsByTopic: Record<TopicId, SelfExplanation[]> = {
	chain: chainExplanations,
	product: productExplanations,
	quotient: quotientExplanations
};

/**
 * Get a random self-explanation prompt for a given topic.
 * Pool of 3 per topic ensures variety across fading paths.
 */
export function getSelfExplanation(topic: TopicId): SelfExplanation {
	const pool = explanationsByTopic[topic];
	return pool[Math.floor(Math.random() * pool.length)];
}
