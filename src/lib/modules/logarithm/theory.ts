// Curated instruction for the logarithm module.
// Hand-written, nynorsk, shown in the Lærebok — never generated, never drilled.

import type { TheoryEntry } from '../types';

export const LOG_THEORY: Record<string, TheoryEntry> = {
	"log_product": {
		"title": "Produktsetningen",
		"intro": "Logaritmen av eit produkt er lik summen av logaritmane.",
		"formula": "\\log_b(a \\cdot c) = \\log_b\\,a + \\log_b\\,c",
		"ruleText": "Når du ser ein logaritme av eit produkt, kan du dele det opp i ein sum.",
		"example": "$\\lg(3 \\cdot 5) = \\lg\\,3 + \\lg\\,5$",
		"patternRecognition": "Sjå etter multiplikasjon inne i logaritmen, eller koeffisientar framfor variablar.",
		"thinkAloud": "«Eg ser eit produkt inni lg(...). Då kan eg dele opp i ein sum av to lg-uttrykk.»",
		"workedSteps": [
			{
				"explanation": "Start med uttrykket",
				"latex": "\\lg(6x)"
			},
			{
				"explanation": "Sjå det som eit produkt: 6 · x",
				"latex": "\\lg(6 \\cdot x)"
			},
			{
				"explanation": "Bruk produktsetningen",
				"latex": "\\lg\\,6 + \\lg\\,x"
			}
		],
		"mnemonic": "«Gonging inne → pluss ute»"
	},
	"log_quotient": {
		"title": "Kvotientsetningen",
		"intro": "Logaritmen av ein brøk er lik skilnaden mellom logaritmane.",
		"formula": "\\log_b\\left(\\frac{a}{c}\\right) = \\log_b\\,a - \\log_b\\,c",
		"ruleText": "Divisjon inne i logaritmen blir til subtraksjon utanfor.",
		"example": "$\\lg\\left(\\frac{8}{2}\\right) = \\lg\\,8 - \\lg\\,2$",
		"patternRecognition": "Sjå etter brøk inne i logaritmen.",
		"thinkAloud": "«Eg ser ein brøk inni lg(...). Då kan eg dele opp i ein differanse.»",
		"workedSteps": [
			{
				"explanation": "Start med uttrykket",
				"latex": "\\lg\\left(\\frac{x}{3}\\right)"
			},
			{
				"explanation": "Bruk kvotientsetningen",
				"latex": "\\lg\\,x - \\lg\\,3"
			}
		],
		"mnemonic": "«Deling inne → minus ute»"
	},
	"log_power": {
		"title": "Potenssetningen",
		"intro": "Eksponenten kan flyttast framfor logaritmen som ein koeffisient.",
		"formula": "\\log_b(a^n) = n \\cdot \\log_b\\,a",
		"ruleText": "Ein eksponent inni logaritmen kan «drattast ut» som ein faktor.",
		"example": "$\\lg(x^3) = 3 \\cdot \\lg\\,x$",
		"patternRecognition": "Sjå etter potens inne i logaritmen, inkludert røter (som er brøkpotens).",
		"thinkAloud": "«Eg ser ein eksponent inni lg(...). Eg kan flytte han framfor som ein faktor.»",
		"workedSteps": [
			{
				"explanation": "Start med uttrykket",
				"latex": "\\lg(\\sqrt{x})"
			},
			{
				"explanation": "Skriv om rota som potens",
				"latex": "\\lg(x^{1/2})"
			},
			{
				"explanation": "Bruk potenssetningen",
				"latex": "\\frac{1}{2} \\cdot \\lg\\,x"
			}
		],
		"mnemonic": "«Eksponenten hoppar ned og blir ein faktor»"
	},
	"log_simplify": {
		"title": "Forenkle logaritmeuttrykk",
		"intro": "Kombiner dei tre setningane for å skrive om samansette uttrykk.",
		"formula": "\\text{Bruk produkt-, kvotient- og potenssetningen saman}",
		"ruleText": "Start frå innsida og arbeid utover, eller frå utsida og arbeid innover — avhengig av oppgåva.",
		"example": "$\\lg(4x^2) = \\lg\\,4 + 2 \\cdot \\lg\\,x$",
		"patternRecognition": "Sjå etter uttrykk der fleire setningar kan brukast i rekkefølgje.",
		"thinkAloud": "«Eg ser både eit produkt og ein eksponent. Eg tek produktsetningen først, så potenssetningen.»",
		"workedSteps": [
			{
				"explanation": "Start med uttrykket",
				"latex": "\\lg\\left(\\frac{x^3}{y}\\right)"
			},
			{
				"explanation": "Kvotientsetningen",
				"latex": "\\lg(x^3) - \\lg\\,y"
			},
			{
				"explanation": "Potenssetningen",
				"latex": "3 \\cdot \\lg\\,x - \\lg\\,y"
			}
		],
		"mnemonic": "«Bruk setningane som verktøy — éin om gongen»"
	},
	"log_equation": {
		"title": "Logaritmiske likningar",
		"intro": "Likningar der den ukjende står inne i ein logaritme.",
		"formula": "\\log_b\\,x = y \\iff x = b^y",
		"ruleText": "Bruk definisjonen av logaritme for å «ta bort» logaritmen og få ei vanleg likning.",
		"example": "$\\lg\\,x = 3 \\implies x = 10^3 = 1000$",
		"patternRecognition": "Sjå etter lg(...) = tal. Bruk evt. setningane først for å samle alt i éin logaritme.",
		"thinkAloud": "«Eg vil ha éin logaritme åleine på eine sida. Så brukar eg definisjonen baklengs.»",
		"workedSteps": [
			{
				"explanation": "Start med likninga",
				"latex": "\\lg(x + 3) = 2"
			},
			{
				"explanation": "Bruk definisjonen",
				"latex": "x + 3 = 10^2 = 100"
			},
			{
				"explanation": "Løys for x",
				"latex": "x = 97"
			}
		],
		"mnemonic": "«Log bort → eksponent opp»"
	},
	"exp_equation": {
		"title": "Eksponentiallikningar",
		"intro": "Likningar der den ukjende står i eksponenten.",
		"formula": "b^x = c \\iff x = \\frac{\\log\\,c}{\\log\\,b}",
		"ruleText": "Ta logaritmen på begge sider for å «ta ned» den ukjende frå eksponenten.",
		"example": "$5^x = 20 \\implies x \\cdot \\lg\\,5 = \\lg\\,20 \\implies x = \\frac{\\lg\\,20}{\\lg\\,5}$",
		"patternRecognition": "Sjå etter den ukjende oppe i ein eksponent. Prøv først om svaret er «eksakt» (t.d. 2³ = 8).",
		"thinkAloud": "«x sit i eksponenten. Eg tek lg (eller ln) på begge sider, så kan eg bruke potenssetningen til å flytte x ned.»",
		"workedSteps": [
			{
				"explanation": "Start med likninga",
				"latex": "3^x = 15"
			},
			{
				"explanation": "Ta lg på begge sider",
				"latex": "\\lg(3^x) = \\lg\\,15"
			},
			{
				"explanation": "Potenssetningen",
				"latex": "x \\cdot \\lg\\,3 = \\lg\\,15"
			},
			{
				"explanation": "Løys for x",
				"latex": "x = \\frac{\\lg\\,15}{\\lg\\,3}"
			}
		],
		"mnemonic": "«Log på begge sider — eksponenten hoppar ned»"
	}
};
