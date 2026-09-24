// Self-explanation prompts for the logarithm module.
// Shown after a reveal at fading levels 1-3: "why did we do it that way?"

import type { SelfExplanation } from '../types';

export const LOG_SELF_EXPLANATIONS: Record<string, SelfExplanation[]> = {
	"log_product": [
		{
			"question": "Kvifor kan vi skrive lg(ab) som lg a + lg b?",
			"options": [
				"Fordi logaritmen gjer multiplikasjon om til addisjon",
				"Fordi vi berre deler uttrykket i to delar",
				"Fordi lg alltid kan fordelast"
			],
			"correct": 0
		}
	],
	"log_quotient": [
		{
			"question": "Kva skjer med divisjon inne i ein logaritme?",
			"options": [
				"Den blir til subtraksjon",
				"Den blir til addisjon",
				"Den forsvinn"
			],
			"correct": 0
		}
	],
	"log_power": [
		{
			"question": "Korleis handterer vi ein eksponent inne i ein logaritme?",
			"options": [
				"Eksponenten kan flyttast ned som ein faktor framfor",
				"Vi tek kvadratrota av uttrykket",
				"Eksponenten endrar grunntalet til logaritmen"
			],
			"correct": 0
		}
	],
	"log_simplify": [
		{
			"question": "Kva gjer du når du skal forenkle eit samansett logaritmeuttrykk?",
			"options": [
				"Bruk setningane éi om gongen: produkt, kvotient, potens",
				"Rekn ut tala inni logaritmen først"
			],
			"correct": 0
		}
	],
	"log_equation": [
		{
			"question": "Korleis «fjernar» du ein logaritme i ei likning?",
			"options": [
				"Bruk definisjonen: lg x = y betyr x = 10^y",
				"Del begge sider på lg"
			],
			"correct": 0
		}
	],
	"exp_equation": [
		{
			"question": "Korleis får du ned ein ukjend eksponent?",
			"options": [
				"Ta logaritmen på begge sider og bruk potenssetninga",
				"Ta kvadratrota av begge sider",
				"Del begge sider på grunntalet"
			],
			"correct": 0
		}
	]
};
