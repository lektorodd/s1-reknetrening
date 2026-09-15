// Curated instruction for the derivative module.
// Hand-written, nynorsk, shown in the Lærebok — never generated, never drilled.

import type { TheoryEntry } from '../types';

export const theoryBank: Record<string, TheoryEntry> = {
	"chain": {
		"title": "Kjerneregelen",
		"intro": "Derivasjon av samansette funksjonar — ein funksjon inne i ein annan. Generelt: $f(x) = g(u(x))$.\n\nDøme: $(2x+1)^3$, $\\sqrt{3x+2}$, $e^{x^2}$, $\\ln(5x-1)$",
		"formula": "f'(x) = g'(u) \\cdot u'(x)",
		"ruleText": "g'(u) · u'(x)",
		"example": "Eks: $(3x+1)^4 \\Rightarrow 12(3x+1)^3$",
		"patternRecognition": "🔍 Ser du ein funksjon inne i ein annan funksjon? Då treng du kjerneregelen!\n\nTypiske teikn:\n• Noko opphøgd i potens: $(\\ldots)^n$\n• Rot av noko: $\\sqrt{\\ldots}$\n• Logaritme av noko: $\\ln(\\ldots)$\n• $e$ opphøgd i noko: $e^{(\\ldots)}$\n\nSpør deg sjølv: «Kan eg peike på éin del som er den indre funksjonen?»",
		"thinkAloud": "«Eg ser $(2x+1)^3$. OK — dette er noko opphøgd i tredje. Det ytre er $u^3$, det indre er $u = 2x+1$.\n\nFørst deriverer eg det ytre: $3u^2$.\nSå deriverer eg det indre: $(2x+1)' = 2$.\nTil slutt gongar eg dei saman:\n$f'(x) = 3(2x+1)^2 \\cdot 2 = 6(2x+1)^2$.\n\nHusk: ytre derivert × indre derivert.»",
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
		"mnemonic": "«Derivér det ytre, behold det indre, gong med den deriverte av det indre.»"
	},
	"product": {
		"title": "Produktregelen",
		"intro": "Derivasjon av eit produkt av to funksjonar: $f(x) = u(x) \\cdot v(x)$.\n\nDøme: $x^2(3x+1)$, $x^3 \\cdot e^{2x}$, $x \\cdot \\ln(x)$",
		"formula": "(u \\cdot v)' = u'v + uv'",
		"ruleText": "u'v + uv'",
		"example": "Eks: $x^2 \\cdot e^x$",
		"patternRecognition": "🔍 Ser du to separate funksjonar av $x$ som er gonga saman? Då treng du produktregelen!\n\nTypiske teikn:\n• $x^n \\cdot \\sin(x)$ — potens gonger trig\n• $x^2 \\cdot e^x$ — polynom gonger eksponential\n• $(x+1) \\cdot \\ln(x)$ — to ulike typar\n\nSpør deg sjølv: «Kan eg peike på to delar som begge inneheld $x$?»",
		"thinkAloud": "«Eg ser $x^2 \\cdot (3x+1)$. To delar gonga saman, begge med $x$. Eg vel $u = x^2$ og $v = 3x+1$.\n\nDeriverer kvar for seg: $u' = 2x$, $v' = 3$.\nSo set eg inn i formelen: $f'(x) = u'v + uv' = 2x(3x+1) + x^2 \\cdot 3$.\nForenklar: $6x^2 + 2x + 3x^2 = 9x^2 + 2x$.\n\nHusk: «Den eine derivert gonger den andre, pluss motsett.»»",
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
		"ruleText": "(u'v - uv') / v²",
		"example": "Eks: $x / (x+1)$",
		"patternRecognition": "🔍 Ser du ein brøk der både teljar og nemnar har $x$? Då treng du brøkregelen!\n\nTypiske teikn:\n• $\\frac{x^2}{x+1}$ — polynom over polynom\n• $\\frac{\\sin(x)}{x}$ — trig over polynom\n• $\\frac{e^x}{x^2+1}$ — eksponential over polynom\n\nSpør deg sjølv: «Er det ein brøkstrek, og har begge sider $x$?»",
		"thinkAloud": "«Eg ser $\\frac{x}{x+1}$. Ein brøk der begge delar har $x$. Eg vel $u = x$ (teljar) og $v = x+1$ (nemnar).\n\nDeriverer: $u' = 1$, $v' = 1$.\nBrøkregelen: $\\frac{u'v - uv'}{v^2} = \\frac{1 \\cdot (x+1) - x \\cdot 1}{(x+1)^2}$.\nForenklar teljaren: $x+1-x = 1$.\nSvar: $\\frac{1}{(x+1)^2}$.\n\nPass på: rekkefølgja i teljaren er viktig! $u'v$ fyrst, minus $uv'$.»",
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
