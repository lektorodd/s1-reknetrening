// Curated instruction for the derivative module.
// Hand-written, nynorsk, shown in the Lærebok — never generated, never drilled.

import type { TheoryEntry } from '../types';

export const theoryBank: Record<string, TheoryEntry> = {
	"power": {
		"title": "Potensregelen",
		"intro": "Grunnregelen alle dei andre byggjer på. Ein potens av $x$ blir derivert ved at eksponenten kjem ned som faktor, og eksponenten minkar med 1.\n\nDøme: $x^3$, $5x^2$, $\\frac{1}{x^2}$, $\\sqrt{x}$",
		"formula": "(x^n)' = n \\cdot x^{n-1}",
		"ruleText": "Ein konstant framfor blir ståande, og eit polynom deriverer du ledd for ledd. Konstantleddet har derivert 0. Regelen gjeld for alle eksponentar — òg negative og brøkar.",
		"example": "Eks: $4x^3 - 2x + 7 \\Rightarrow 12x^2 - 2$",
		"patternRecognition": "🔍 Er funksjonen berre ein sum av potensar av $x$? Då held potensregelen.\n\nSkriv om før du deriverer:\n• $\\frac{1}{x^n} = x^{-n}$\n• $\\sqrt{x} = x^{1/2}$\n• Parentesar: gong ut først, til dømes $(x+1)(x-2) = x^2 - x - 2$",
		"thinkAloud": "«Eg ser $f(x) = \\frac{3}{x^2}$. Det er ein brøk, men eigentleg berre ein potens: $3x^{-2}$.\n\nEksponenten $-2$ kjem ned: $3 \\cdot (-2) = -6$.\nEksponenten minkar med 1: $-2 - 1 = -3$.\nAltså $f'(x) = -6x^{-3} = -\\frac{6}{x^3}$.\n\nHugs: skriv om til potens først, så er det same regel som for $x^3$.»",
		"workedSteps": [
			{
				"explanation": "Vi skal derivere eit polynom, ledd for ledd.",
				"latex": "f(x) = 2x^3 - 5x^2 + 4x - 7"
			},
			{
				"explanation": "Bruk potensregelen på kvart ledd. Konstanten $-7$ har derivert 0.",
				"latex": "f'(x) = 2 \\cdot 3x^2 - 5 \\cdot 2x + 4"
			},
			{
				"explanation": "Rekn ut koeffisientane.",
				"latex": "f'(x) = 6x^2 - 10x + 4"
			}
		],
		"mnemonic": "«Eksponenten ned, eksponenten éin mindre.»"
	},
	"chain": {
		"title": "Kjerneregelen",
		"intro": "Derivasjon av samansette funksjonar — ein funksjon inne i ein annan. Generelt: $f(x) = g(u(x))$.\n\nDøme: $(2x+1)^3$, $\\sqrt{3x+2}$, $e^{x^2}$, $\\ln(5x-1)$",
		"formula": "f'(x) = g'(u) \\cdot u'(x)",
		"ruleText": "Deriver den ytre funksjonen, la den indre stå som ho er, og gong med den deriverte av den indre.",
		"example": "Eks: $(3x+1)^4 \\Rightarrow 12(3x+1)^3$",
		"patternRecognition": "🔍 Ser du ein funksjon inne i ein annan funksjon? Då treng du kjerneregelen!\n\nTypiske teikn:\n• Noko opphøgd i potens: $(\\ldots)^n$\n• Rot av noko: $\\sqrt{\\ldots}$\n• Logaritme av noko: $\\ln(\\ldots)$\n• $e$ opphøgd i noko: $e^{(\\ldots)}$\n\nSpør deg sjølv: «Kan eg peike på éin del som er den indre funksjonen?»",
		"thinkAloud": "«Eg ser $\\sqrt{3x+2}$. Det er ei rot av noko — altså noko inni noko, så kjerneregelen gjeld.\n\nDet ytre er $g(u) = \\sqrt{u}$, det indre er $u = 3x+2$.\nFørst deriverer eg det ytre: $g'(u) = \\frac{1}{2\\sqrt{u}}$.\nSå deriverer eg det indre: $(3x+2)' = 3$.\nTil slutt gongar eg dei saman:\n$f'(x) = \\frac{1}{2\\sqrt{3x+2}} \\cdot 3 = \\frac{3}{2\\sqrt{3x+2}}$.\n\nHugs: ytre derivert × indre derivert. Det indre får stå urørt inne i rota.»",
		"workedSteps": [
			{
				"explanation": "Vi har $f(x) = (2x+1)^3$. Fyrst identifiserer vi at dette er ein samansett funksjon.",
				"latex": "f(x) = (2x+1)^3"
			},
			{
				"explanation": "Den ytre funksjonen er $g(u) = u^3$ og den indre er $u(x) = 2x+1$.",
				"latex": "g(u) = u^3, \\quad u(x) = 2x+1"
			},
			{
				"explanation": "Deriverer den ytre: potensregelen gir $g'(u) = 3u^2$.",
				"latex": "g'(u) = 3u^2"
			},
			{
				"explanation": "Deriverer den indre: $u'(x) = 2$.",
				"latex": "u'(x) = 2"
			},
			{
				"explanation": "No brukar vi kjerneregelen: $f'(x) = g'(u) \\cdot u'(x)$. Set inn verdiane.",
				"latex": "f'(x) = 3(2x+1)^2 \\cdot 2"
			},
			{
				"explanation": "Forenklar: $3 \\cdot 2 = 6$.",
				"latex": "f'(x) = 6(2x+1)^2"
			}
		],
		"mnemonic": "«Deriver det ytre, behald det indre, gong med den deriverte av det indre.»"
	},
	"product": {
		"title": "Produktregelen",
		"intro": "Derivasjon av eit produkt av to funksjonar: $f(x) = u(x) \\cdot v(x)$.\n\nDøme: $x^2(3x+1)$, $x^3 \\cdot e^{2x}$, $x \\cdot \\ln(x)$",
		"formula": "(u \\cdot v)' = u'v + uv'",
		"ruleText": "Deriver den eine faktoren og la den andre stå — så byter du om, og legg dei to saman.",
		"example": "Eks: $x^2 \\cdot e^x \\Rightarrow 2xe^x + x^2e^x$",
		"patternRecognition": "🔍 Ser du to separate funksjonar av $x$ som er gonga saman? Då treng du produktregelen!\n\nTypiske teikn:\n• $x^3 \\cdot \\sqrt{x+1}$ — potens gonger rot\n• $x^2 \\cdot e^x$ — polynom gonger eksponential\n• $(x+1) \\cdot \\ln(x)$ — to ulike typar\n\nSpør deg sjølv: «Kan eg peike på to delar som begge inneheld $x$?»",
		"thinkAloud": "«Eg ser $x \\cdot \\ln x$. To faktorar gonga saman, og begge inneheld $x$ — då er det produktregelen.\n\nEg vel $u = x$ og $v = \\ln x$.\nDeriverer kvar for seg: $u' = 1$, $v' = \\frac{1}{x}$.\nSet inn: $f'(x) = u'v + uv' = 1 \\cdot \\ln x + x \\cdot \\frac{1}{x}$.\nForenklar: $x \\cdot \\frac{1}{x} = 1$, så $f'(x) = \\ln x + 1$.\n\nHugs: «Den eine derivert gonger den andre, pluss motsett.»»",
		"workedSteps": [
			{
				"explanation": "Vi har $f(x) = x^2 \\cdot (3x+1)$. To funksjonar gonga saman.",
				"latex": "f(x) = x^2 \\cdot (3x+1)"
			},
			{
				"explanation": "Vel $u = x^2$ og $v = 3x+1$.",
				"latex": "u = x^2, \\quad v = 3x+1"
			},
			{
				"explanation": "Deriverer begge: $u' = 2x$ og $v' = 3$.",
				"latex": "u' = 2x, \\quad v' = 3"
			},
			{
				"explanation": "Brukar produktregelen: $f'(x) = u'v + uv'$.",
				"latex": "f'(x) = u'v + uv'"
			},
			{
				"explanation": "Set inn verdiane.",
				"latex": "f'(x) = 2x(3x+1) + x^2 \\cdot 3"
			},
			{
				"explanation": "Utvid og forenkle: $6x^2 + 2x + 3x^2 = 9x^2 + 2x$.",
				"latex": "f'(x) = 9x^2 + 2x"
			}
		],
		"mnemonic": "«Den fyrste derivert gonger den andre, pluss den fyrste gonger den andre derivert.»"
	},
	"quotient": {
		"title": "Brøkregelen",
		"intro": "Derivasjon av ein brøk der både teljar og nemnar inneheld $x$: $f(x) = \\frac{u(x)}{v(x)}$.\n\nDøme: $\\frac{x^2}{x+1}$, $\\frac{e^{2x}}{x}$, $\\frac{\\ln x}{x^2}$",
		"formula": "\\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^2}",
		"ruleText": "Teljaren derivert gonger nemnaren, minus teljaren gonger nemnaren derivert, delt på nemnaren i andre.",
		"example": "Eks: $\\frac{e^x}{x} \\Rightarrow \\frac{e^x(x-1)}{x^2}$",
		"patternRecognition": "🔍 Ser du ein brøk der både teljar og nemnar har $x$? Då treng du brøkregelen!\n\nTypiske teikn:\n• $\\frac{x^2}{x+1}$ — polynom over polynom\n• $\\frac{\\ln x}{x}$ — logaritme over polynom\n• $\\frac{e^x}{x^2+1}$ — eksponential over polynom\n\nSpør deg sjølv: «Er det ein brøkstrek, og har begge sider $x$?»",
		"thinkAloud": "«Eg ser $\\frac{x^2}{x+2}$. Ein brøk der $x$ står både oppe og nede — då må eg bruke brøkregelen.\n\nEg vel $u = x^2$ (teljar) og $v = x+2$ (nemnar).\nDeriverer: $u' = 2x$, $v' = 1$.\nBrøkregelen: $\\frac{u'v - uv'}{v^2} = \\frac{2x(x+2) - x^2 \\cdot 1}{(x+2)^2}$.\nForenklar teljaren: $2x^2 + 4x - x^2 = x^2 + 4x$.\nSvar: $\\frac{x^2+4x}{(x+2)^2} = \\frac{x(x+4)}{(x+2)^2}$.\n\nPass på: rekkefølgja i teljaren er viktig! $u'v$ fyrst, minus $uv'$.»",
		"workedSteps": [
			{
				"explanation": "Vi har $f(x) = \\frac{x}{x+1}$. Ein brøk der $x$ er i begge delar.",
				"latex": "f(x) = \\frac{x}{x+1}"
			},
			{
				"explanation": "Vel $u = x$ (teljar) og $v = x+1$ (nemnar).",
				"latex": "u = x, \\quad v = x+1"
			},
			{
				"explanation": "Deriverer: $u' = 1$ og $v' = 1$.",
				"latex": "u' = 1, \\quad v' = 1"
			},
			{
				"explanation": "Brukar brøkregelen. NB: Rekkefølgja er viktig!",
				"latex": "f'(x) = \\frac{u'v - uv'}{v^2}"
			},
			{
				"explanation": "Set inn verdiane i formelen.",
				"latex": "f'(x) = \\frac{1 \\cdot (x+1) - x \\cdot 1}{(x+1)^2}"
			},
			{
				"explanation": "Forenklar teljaren: $x + 1 - x = 1$.",
				"latex": "f'(x) = \\frac{1}{(x+1)^2}"
			}
		],
		"mnemonic": "«Teljar-derivert gonger nemnar, minus teljar gonger nemnar-derivert, alt over nemnar i andre.»"
	}
};
