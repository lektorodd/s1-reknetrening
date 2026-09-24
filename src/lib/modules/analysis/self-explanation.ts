// Self-explanation prompts for «Drøfting».
// Shown on the Lærebok ladder after a reveal: "why did we do it that way?"

import type { SelfExplanation } from '../types';

export const ANALYSIS_SELF_EXPLANATIONS: Record<string, SelfExplanation[]> = {
	tangent: [
		{
			question: 'Kvifor er stigingstalet til tangenten lik $f\'(a)$?',
			options: [
				'Fordi den deriverte i eit punkt er stiginga til grafen der, og tangenten har same stiging',
				'Fordi tangenten alltid har stigingstal 1',
				'Fordi $f\'(a)$ er $y$-verdien i punktet'
			],
			correct: 0
		},
		{
			question: 'Kvifor set vi $a$ inn i $f$, og ikkje i $f\'$, for å finne punktet?',
			options: [
				'Fordi punktet ligg på grafen til $f$; $f\'$ gir berre stiginga',
				'Fordi $f\'(a)$ alltid er 0',
				'Det spelar inga rolle kva vi set inn i'
			],
			correct: 0
		}
	],
	extrema: [
		{
			question: 'Kvifor faktoriserer vi $f\'(x)$ før vi teiknar forteiknslinja?',
			options: [
				'Fordi forteiknet til eit produkt følgjer av forteikna til faktorane',
				'Fordi ein ikkje kan derivere eit uttrykk som ikkje er faktorisert',
				'Fordi faktoriseringa gir $y$-verdiane'
			],
			correct: 0
		},
		{
			question: 'Kvifor er ikkje kvart punkt med $f\'(x) = 0$ eit topp- eller botnpunkt?',
			options: [
				'Fordi $f\'$ kan ha same forteikn på begge sider, slik at grafen held fram i same retning (terrassepunkt)',
				'Fordi $f\'(x) = 0$ berre skjer i toppunkt',
				'Fordi forteiknslinja alltid har to nullpunkt'
			],
			correct: 0
		},
		{
			question: 'Kvifor set vi $x$-verdiane inn i $f$ og ikkje i $f\'$ til slutt?',
			options: [
				'Fordi punktet ligg på grafen til $f$; i $f\'$ ville vi berre fått 0',
				'Fordi $f\'$ ikkje er definert der',
				'Det er det same om vi bruker $f$ eller $f\'$'
			],
			correct: 0
		}
	],
	optimisation: [
		{
			question: 'Kvifor må vi rekne ut $f$ i endepunkta av intervallet?',
			options: [
				'Fordi den største eller minste verdien kan liggje i eit endepunkt, der $f\'$ ikkje treng vere 0',
				'Fordi endepunkta alltid gir den største verdien',
				'Fordi $f\'(x) = 0$ i endepunkta'
			],
			correct: 0
		},
		{
			question: 'Kvifor skriv vi arealet som ein funksjon av berre $x$?',
			options: [
				'Fordi vi berre kan derivere og finne toppunkt for ein funksjon av éin variabel',
				'Fordi $y$ alltid er lik $x$',
				'Fordi arealet ikkje avheng av $y$'
			],
			correct: 0
		}
	]
};
