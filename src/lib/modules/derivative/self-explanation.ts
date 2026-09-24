// Self-explanation prompts for the derivative module.
// Shown after a reveal at fading levels 1-3: "why did we do it that way?"

import type { SelfExplanation } from '../types';

export const SELF_EXPLANATIONS: Record<string, SelfExplanation[]> = {
	"chain": [
		{
			"question": "Kvifor brukar vi kjerneregelen her?",
			"options": [
				"Fordi vi har ein funksjon inne i ein annan funksjon",
				"Fordi vi gongar to funksjonar saman",
				"Fordi eksponenten er større enn 1"
			],
			"correct": 0
		},
		{
			"question": "Kva er den \"indre funksjonen\" i dette uttrykket?",
			"options": [
				"Det den ytre funksjonen verkar på — i parentesen, under rotteiknet eller i eksponenten",
				"Den ytste operasjonen (potens, rot, ln)",
				"Koeffisienten framfor uttrykket"
			],
			"correct": 0
		},
		{
			"question": "Kunne vi løyst denne oppgåva utan kjerneregelen?",
			"options": [
				"Berre viss vi utvida uttrykket først (om mogleg)",
				"Ja, vi kan alltid bruke produktregelen i staden",
				"Nei, det er umogleg å derivere utan kjerneregelen"
			],
			"correct": 0
		}
	],
	"product": [
		{
			"question": "Kva er u og v i produktregelen (uv)' = u'v + uv'?",
			"options": [
				"Dei to faktorane som blir gonga saman",
				"Teljar og nemnar i ein brøk",
				"Den indre og ytre funksjonen"
			],
			"correct": 0
		},
		{
			"question": "Kva skjer om vi gløymer produktregelen og berre deriverer kvart ledd?",
			"options": [
				"Vi får feil svar — (uv)' ≠ u'v'",
				"Det fungerer heilt fint",
				"Vi må bruke kjerneregelen i staden"
			],
			"correct": 0
		},
		{
			"question": "Kvifor brukar vi produktregelen her?",
			"options": [
				"Fordi vi gongar to separate funksjonar av x",
				"Fordi vi har ein funksjon inne i ein annan",
				"Fordi det er ein brøk"
			],
			"correct": 0
		}
	],
	"quotient": [
		{
			"question": "Kvifor brukar vi brøkregelen her?",
			"options": [
				"Fordi vi deler éin funksjon på ein annan",
				"Fordi vi gongar to funksjonar saman",
				"Fordi det er ein samansett funksjon"
			],
			"correct": 0
		},
		{
			"question": "Kva står i nemnaren når du set inn i brøkregelen?",
			"options": [
				"Den opphavlege nemnaren i andre potens, $v^2$ — sjølv om noko kan forkortast etterpå",
				"Den deriverte av nemnaren, $v'$",
				"Ingenting — nemnaren forsvinn"
			],
			"correct": 0
		},
		{
			"question": "Kva er rekkjefølgja i teljaren i brøkregelen?",
			"options": [
				"u'v − uv' (derivert teljar · nemnar minus teljar · derivert nemnar)",
				"uv' − u'v (omvendt rekkefølgje)",
				"u'v' (berre deriverer begge)"
			],
			"correct": 0
		}
	]
};
