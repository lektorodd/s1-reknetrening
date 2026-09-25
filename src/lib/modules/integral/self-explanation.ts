// Self-explanation prompts for the integration module.
//
// Every question asks *why* or *what does it mean*, never *how*. "How" tests
// the procedure, which the student has just demonstrated by working the problem;
// what separates a strong S2 student from a very strong one is being able to say
// why the method applies.
//
// The correct option is written first throughout. PracticeLadder shuffles them,
// seeded on the problem id, so the order holds still without being memorable.

import type { SelfExplanation } from '../types';

export const INTEGRAL_SELF_EXPLANATIONS: Record<string, SelfExplanation[]> = {
	substitution: [
		{
			question: 'Kvifor valde vi $u = x^2+1$ og ikkje $u = x$ her?',
			options: [
				'Fordi den deriverte av $x^2+1$ står som faktor, slik at $x$ forsvinn',
				'Fordi $x^2+1$ er den største delen av integranden',
				'Fordi vi alltid vel det som står inni ein parentes',
				'Fordi $u = x$ ikkje er lov'
			],
			correct: 0
		},
		{
			question: 'Kva betyr det at det står ein $x$ att etter innsetjinga?',
			options: [
				'At valet av $u$ ikkje fjerna alle $x$, så vi kan ikkje integrere med omsyn på $u$ endå',
				'At svaret skal innehalde både $x$ og $u$',
				'At vi kan flytte $x$ ut som ein konstant',
				'At integralet ikkje finst'
			],
			correct: 0
		},
		{
			question: 'Kvifor må grensene byttast i eit bestemt integral når vi byter variabel?',
			options: [
				'Fordi grensene er verdiar av integrasjonsvariabelen, og $u$ har andre verdiar enn $x$ i endepunkta',
				'Fordi integralet skal bli positivt',
				'Fordi det er ein regel',
				'Fordi konstanten $C$ må forsvinne'
			],
			correct: 0
		},
		{
			question: 'Kvifor kan vi skrive $\\ln(x^2+4)$ utan absoluttverdi?',
			options: [
				'Fordi $x^2+4$ alltid er positiv',
				'Fordi $x^2$ alltid er positiv, så absoluttverdien gjeld berre $x$',
				'Fordi vi har bytt variabel',
				'Fordi det er eit ubestemt integral'
			],
			correct: 0
		},
		{
			question: 'Kva er samanhengen mellom variabelskifte og kjerneregelen?',
			options: [
				'Variabelskifte er kjerneregelen lesen baklengs: integranden er den deriverte av ein samansett funksjon',
				'Dei har ingenting med kvarandre å gjere',
				'Variabelskifte er produktregelen baklengs',
				'Kjerneregelen er eit spesialtilfelle av variabelskifte'
			],
			correct: 0
		},
		{
			question: 'Kvifor blir $\\int e^{5x}\\,dx = \\frac{1}{5}e^{5x}+C$, og ikkje $5e^{5x}+C$?',
			options: [
				'Fordi derivasjon av $e^{5x}$ gir ein ekstra faktor 5, som vi må ta bort når vi går baklengs',
				'Fordi integrasjon alltid deler på eksponenten',
				'Fordi $e^x$ er sin eigen derivert',
				'Fordi 5 er ein konstant'
			],
			correct: 0
		}
	],

	parts: [
		{
			question: 'Kvifor lønner det seg å derivere $x$ og integrere $e^{2x}$ i $\\int xe^{2x}\\,dx$?',
			options: [
				'Fordi $x$ blir enklare når han blir derivert, mens $e^{2x}$ ikkje blir vanskelegare av å bli integrert',
				'Fordi $x$ står først',
				'Fordi $e^{2x}$ ikkje kan deriverast',
				'Fordi vi alltid integrerer eksponentialfunksjonen'
			],
			correct: 0
		},
		{
			question:
				'Kvifor skal $\\ln x$ deriverast i $\\int x^2\\ln x\\,dx$, sjølv om $x^2$ òg blir enklare av derivasjon?',
			options: [
				'Fordi vi ikkje kan integrere $\\ln x$ direkte, og $(\\ln x)\' = \\frac{1}{x}$ forkortar mot potensen',
				'Fordi $\\ln x$ er den vanskelegaste faktoren',
				'Fordi $x^2$ ikkje kan integrerast',
				'Fordi det er regelen'
			],
			correct: 0
		},
		{
			question: 'Kva betyr det om det nye integralet $\\int uv\'\\,dx$ er vanskelegare enn det vi starta med?',
			options: [
				'At rollene sannsynlegvis er valde feil, og vi bør prøve å byte dei om',
				'At integralet ikkje finst',
				'At vi må bruke formelen éin gong til',
				'At vi har rekna feil i $u$'
			],
			correct: 0
		},
		{
			question: 'Kvifor kan vi sjå på $\\int x^2e^x\\,dx$ at det trengst to rundar?',
			options: [
				'Fordi $x^2$ må deriverast to gonger før han blir ein konstant, og $e^x$ ikkje endrar seg',
				'Fordi eksponenten er 2',
				'Fordi det er to faktorar',
				'Fordi $e^x$ må integrerast to gonger'
			],
			correct: 0
		},
		{
			question: 'Kvar kjem formelen for delvis integrasjon frå?',
			options: [
				'Frå produktregelen for derivasjon, integrert på begge sider',
				'Frå kjerneregelen',
				'Frå fundamentalteoremet',
				'Han er ein definisjon'
			],
			correct: 0
		},
		{
			question: 'Kvifor treng vi ikkje ein $C$ når vi finn $u$ frå $u\'$ midt i utrekninga?',
			options: [
				'Vi kan velje kva antiderivert vi vil; ein konstant i $u$ ville falle bort i sluttsvaret',
				'Fordi $u$ ikkje er eit integral',
				'Fordi $C = 0$ alltid',
				'Fordi det er feil å ta han med'
			],
			correct: 0
		}
	],

	partial: [
		{
			question: 'Kvifor må teljaren ha lågare grad enn nemnaren før vi spaltar?',
			options: [
				'Fordi summen av delbrøkar med konstante teljarar alltid gir ein teljar av lågare grad enn nemnaren',
				'Fordi det elles blir for mange ukjende',
				'Fordi ein brøk med høg teljar ikkje kan integrerast',
				'Fordi det er ein definisjon'
			],
			correct: 0
		},
		{
			question: 'Kva betyr det at vi set koeffisientane for same potens lik kvarandre på begge sider?',
			options: [
				'At to polynom er like for alle $x$ berre viss dei har same koeffisientar',
				'At vi set inn $x = 1$',
				'At $x$ må vere 0',
				'At vi berre ser på ledda med $x$, fordi konstantane ikkje betyr noko'
			],
			correct: 0
		},
		{
			question: 'Kvifor kan vi setje inn $x = 3$ når brøken ikkje er definert for $x = 3$?',
			options: [
				'Fordi vi set inn i likninga etter at vi har gonga med nemnaren, og ho er ein polynomidentitet som gjeld for alle $x$',
				'Fordi $x = 3$ berre er eit hjelpetal',
				'Det er eigentleg ikkje lov, men det gir rett svar',
				'Fordi brøken er definert som ein grenseverdi der'
			],
			correct: 0
		},
		{
			question: 'Kvifor treng vi både $\\frac{A}{x-1}$ og $\\frac{B}{(x-1)^2}$ når nemnaren har $(x-1)^2$?',
			options: [
				'Fordi utan $(x-1)^2$ i ein nemnar kan summen aldri få $(x-1)^2$ i fellesnemnaren',
				'Fordi vi alltid skal ha to delbrøkar',
				'Fordi $(x-1)^2$ har to nullpunkt',
				'Fordi $A$ og $B$ skal vere ulike'
			],
			correct: 0
		},
		{
			// Only for distinct factors: with a repeated factor a constant can be 0
			// with nothing to cancel — 1/(x−1)² has A = 0.
			question: 'Nemnaren har to ulike faktorar, og ein av konstantane blir 0. Kva betyr det?',
			options: [
				'At teljar og nemnar har ein felles faktor som kunne vore forkorta bort før spaltinga',
				'At vi har rekna feil',
				'At integralet er 0',
				'At faktoren er ein dobbel faktor'
			],
			correct: 0
		},
		{
			question: 'Kvifor skriv vi $\\ln|x-3|$ med absoluttverdi?',
			options: [
				'Fordi $\\frac{1}{x-3}$ er definert òg for $x<3$, og $\\ln(x-3)$ ikkje er det der',
				'Fordi logaritmen alltid skal ha absoluttverdi',
				'Fordi svaret skal vere positivt',
				'Fordi $C$ kan vere negativ'
			],
			correct: 0
		}
	],

	mixed: [
		{
			question: 'Kvifor skal du sjekke om teljaren er den deriverte av nemnaren før du set opp delbrøkar?',
			options: [
				'Fordi det då er eit variabelskifte, som er mykje kortare enn å spalte',
				'Fordi delbrøk ikkje gir rett svar då',
				'Fordi nemnaren då ikkje kan faktoriserast',
				'Fordi teljaren då er null'
			],
			correct: 0
		},
		{
			question: 'Kvifor er $\\int xe^{x^2}dx$ og $\\int xe^{x}dx$ to heilt ulike oppgåver?',
			options: [
				'I den første er $x$ (nesten) den deriverte av kjernen $x^2$; i den andre er han berre ein faktor',
				'Fordi eksponenten er ulik',
				'Fordi den andre ikkje kan løysast',
				'Fordi berre den første har eit produkt'
			],
			correct: 0
		},
		{
			question: 'Kva betyr det at $\\int e^{x^2}dx$ ikkje kan løysast med S2-metodar?',
			options: [
				'At funksjonen ikkje har nokon antiderivert som kan skrivast med elementære funksjonar',
				'At integralet ikkje finst',
				'At vi må bruke delbrøk i staden',
				'At svaret blir uendeleg'
			],
			correct: 0
		},
		{
			question: 'Kvifor lønner det seg å prøve omskriving med grunnreglane før du vel ein metode?',
			options: [
				'Fordi mange integral som ser ut som dei krev ein metode, fell til ei deling av brøken eller ein potensregel',
				'Fordi metodane berre gjeld for polynom',
				'Fordi omskriving alltid gir eit enklare svar',
				'Fordi grunnreglane er dei einaste som er lov på Del 1'
			],
			correct: 0
		},
		{
			question:
				'To elevar løyser $\\int x(x+1)^5dx$ med kvar sin metode og får ulike svar. Kva er mest sannsynleg?',
			options: [
				'Begge kan ha rett — to antideriverte av same funksjon skil seg med ein konstant',
				'Éin av dei har rekna feil',
				'Integralet har to ulike verdiar',
				'Den eine metoden er ikkje lov her'
			],
			correct: 0
		},
		{
			question: 'Kvifor er det lurt å derivere svaret sitt til slutt?',
			options: [
				'Fordi integrasjon er derivasjon baklengs, så derivasjon av svaret må gi integranden tilbake',
				'Fordi det er krav i læreplanen',
				'Fordi $C$ då forsvinn',
				'Fordi det viser kva metode ein har brukt'
			],
			correct: 0
		}
	]
};
