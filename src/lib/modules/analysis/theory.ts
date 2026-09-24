// Curated instruction for «Drøfting». Hand-written, nynorsk, shown in the
// Lærebok — never generated, never drilled.

import type { TheoryEntry } from '../types';

export const ANALYSIS_THEORY: Record<string, TheoryEntry> = {
	tangent: {
		title: 'Tangenten',
		intro:
			'Tangenten i eit punkt er den rette linja som berre så vidt rører grafen der, og som har same stiging som grafen i punktet. Stigingstalet er difor den deriverte: $f\'(a)$.',
		formula: "y - f(a) = f'(a)(x - a)",
		ruleText:
			'Du treng to ting: punktet $(a, f(a))$ og stigingstalet $f\'(a)$. Set dei inn i eittpunktsformelen $y - y_1 = a(x - x_1)$ og løys for $y$.',
		example: 'Eks: $f(x) = x^2$ i $x = 3$: punktet $(3, 9)$, stigingstal $6$, tangent $y = 6x - 9$.',
		patternRecognition:
			'🔍 «Finn likninga for tangenten i $x = a$»: rekn ut $f(a)$ og $f\'(a)$.\n\n«Finn tangenten med stigingstal $m$»: då kjenner du stigingstalet, men ikkje punktet. Løys $f\'(x) = m$ først.',
		thinkAloud:
			'«Eg skal finne tangenten til $f(x) = x^2 - 3x$ i $x = 1$.\n\nPunktet: $f(1) = 1 - 3 = -2$, altså $(1, -2)$.\nStigingstalet: $f\'(x) = 2x - 3$, så $f\'(1) = -1$.\nEittpunktsformelen: $y + 2 = -1(x - 1)$.\nLøyst for $y$: $y = -x - 1$.\n\nKontroll: i $x = 1$ gir linja $-2$, same som grafen. Det stemmer.»',
		workedSteps: [
			{ explanation: 'Rekn ut funksjonsverdien i punktet.', latex: 'f(1) = 1^2 - 3 \\cdot 1 = -2' },
			{ explanation: 'Deriver og finn stigingstalet i punktet.', latex: "f'(x) = 2x - 3, \\quad f'(1) = -1" },
			{ explanation: 'Set inn i eittpunktsformelen.', latex: 'y - (-2) = -1(x - 1)' },
			{ explanation: 'Løys for $y$.', latex: 'y = -x - 1' }
		],
		mnemonic: '«Punktet frå $f$, stiginga frå $f\'$.»'
	},
	extrema: {
		title: 'Topp- og botnpunkt',
		intro:
			'Der grafen snur, er tangenten vassrett, så $f\'(x) = 0$. Men ikkje alle slike punkt er topp- eller botnpunkt. Forteiknslinja for $f\'$ avgjer det.',
		formula: "f'(x) = 0",
		ruleText:
			'Faktoriser $f\'(x)$ og teikn ei forteiknslinje for kvar faktor. Heiltrekt linje er positiv, stipla er negativ, og 0 markerer nullpunktet. Der $f\'$ skiftar frå $+$ til $-$, er det eit toppunkt. Frå $-$ til $+$ er det eit botnpunkt. Utan forteiknsskifte er det eit terrassepunkt.',
		example: 'Eks: $f(x) = x^3 - 3x$ har $f\'(x) = 3(x+1)(x-1)$, toppunkt $(-1, 2)$ og botnpunkt $(1, -2)$.',
		patternRecognition:
			'🔍 Spør du etter topp- og botnpunkt, er arbeidet alltid det same:\n\n1. Deriver.\n2. Faktoriser $f\'(x)$.\n3. Teikn forteiknslinja.\n4. Les av kvar $f\'$ skiftar forteikn.\n5. Rekn ut $y$-verdiane i den opphavlege $f$.',
		thinkAloud:
			'«Eg har $f(x) = x^3 - 3x$. $f\'(x) = 3x^2 - 3 = 3(x+1)(x-1)$.\n\nNullpunkt i $x = -1$ og $x = 1$.\nFør $-1$ er begge faktorane negative, så produktet er positivt.\nMellom $-1$ og $1$ er berre $x - 1$ negativ, så produktet er negativt.\nEtter $1$ er begge positive.\n\n$+$ til $-$ i $x = -1$: toppunkt. $-$ til $+$ i $x = 1$: botnpunkt.\nSå set eg inn i $f$, ikkje i $f\'$: $f(-1) = 2$ og $f(1) = -2$.»',
		workedSteps: [
			{ explanation: 'Deriver.', latex: "f'(x) = 3x^2 - 3" },
			{ explanation: 'Faktoriser, så forteikna kan lesast av kvar faktor.', latex: "f'(x) = 3(x + 1)(x - 1)" },
			{ explanation: 'Forteiknslinja gir $+$, $-$, $+$ for $f\'$.', latex: "f'(x) = 0 \\iff x = -1 \\lor x = 1" },
			{ explanation: 'Set $x$-verdiane inn i $f$ for å finne $y$.', latex: 'f(-1) = 2, \\quad f(1) = -2' },
			{ explanation: 'Les av forteiknsskifta.', latex: '\\text{Toppunkt: } (-1, 2), \\quad \\text{botnpunkt: } (1, -2)' }
		],
		mnemonic: '«Pluss til minus: toppen. Minus til pluss: botnen.»'
	},
	optimisation: {
		title: 'Optimering',
		intro:
			'Å optimere er å finne den største eller den minste verdien ein storleik kan få: størst areal, minst materiale, størst overskot. Den deriverte finn toppunkta, men på eit avgrensa område må du òg sjekke endepunkta.',
		formula: "f'(x) = 0 \\text{ eller endepunkt}",
		ruleText:
			'Kandidatane er punkta der $f\'(x) = 0$ inne i intervallet, og endepunkta. Rekn ut $f$ i alle, og samanlikn. I tekstoppgåver set du først opp ein funksjon av éin variabel.',
		example: 'Eks: $f(x) = x^2 - 4x$ på $[0, 5]$: kandidatar $f(0) = 0$, $f(2) = -4$, $f(5) = 5$. Størst 5, minst $-4$.',
		patternRecognition:
			'🔍 Står det «størst», «minst», «mest» eller «billigast»? Då er det optimering.\n\n• Er intervallet gitt, må endepunkta med.\n• I tekstoppgåver: kva skal vere størst? Skriv det som ein funksjon, og bruk opplysninga i oppgåva til å bli kvitt den eine variabelen.',
		thinkAloud:
			'«40 m gjerde langs ein vegg, tre sider. Breidda er $x$, og lengda langs veggen er $y$.\n\nGjerdet gir $2x + y = 40$, så $y = 40 - 2x$.\nArealet: $A(x) = x(40 - 2x) = 40x - 2x^2$.\n$A\'(x) = 40 - 4x = 0$ gir $x = 10$.\n$A\'$ er positiv før og negativ etter, så det er eit toppunkt.\n$A(10) = 10 \\cdot 20 = 200$ m².»',
		workedSteps: [
			{ explanation: 'Uttrykk den eine variabelen ved den andre.', latex: 'y = 40 - 2x' },
			{ explanation: 'Set opp funksjonen som skal vere størst.', latex: 'A(x) = x(40 - 2x) = 40x - 2x^2' },
			{ explanation: 'Deriver og finn nullpunktet.', latex: "A'(x) = 40 - 4x = 0 \\iff x = 10" },
			{ explanation: 'Rekn ut det største arealet.', latex: 'A(10) = 200' }
		],
		mnemonic: '«Set opp, deriver, sjekk endane.»'
	}
};
