// Curated instruction for the integration module.
// Hand-written, nynorsk, shown in the Lærebok — never generated, never drilled.
//
// Every method is introduced as a derivative rule the student already has from
// S1, read from right to left. That is not only a metaphor: integration by
// parts *is* the product rule integrated on both sides, and substitution *is*
// the chain rule integrated. It is also why the S1 modules still matter to an
// S2 student even though a session never mixes the two courses.
//
// LaTeX convention, as everywhere: `formula` and `workedSteps[].latex` hold bare
// LaTeX and the view adds the delimiters; prose may carry its own inline $...$.

import type { TheoryEntry } from '../types';

export const INTEGRAL_THEORY: Record<string, TheoryEntry> = {
	substitution: {
		title: 'Variabelskifte',
		intro:
			'Kjerneregelen lesen baklengs. Ser du ein kjerne, og står den deriverte av kjernen som faktor elles i integranden, kan du integrere med omsyn på kjernen.\n\nDøme: $\\int 6x(x^2+1)^4\\,dx$, $\\int \\frac{2x+1}{x^2+x+3}\\,dx$, $\\int \\frac{(\\ln x)^3}{x}\\,dx$',
		formula: '\\int g(u(x))\\cdot u\'(x)\\,dx = G(u(x)) + C, \\quad \\text{der } G\' = g',
		ruleText:
			'Set $u$ lik kjernen. Då er $\\frac{du}{dx} = u\'(x)$, altså $dx = \\frac{du}{u\'(x)}$. Når du set inn, skal alle $x$-ar forsvinne — det er heile testen på om valet av $u$ var godt.',
		example: 'Eks: $\\int e^{3x-2}\\,dx = \\frac{1}{3}e^{3x-2} + C$',
		patternRecognition:
			'🔍 Spør deg sjølv: «Kan eg peike på ein kjerne, og står den deriverte av kjernen som faktor?»\n\nTypiske teikn:\n• $(\\ldots)^n$ eller $\\sqrt{\\ldots}$ med ein faktor utanfor parentesen\n• $e^{(\\ldots)}$ med ein faktor ved sida av\n• ein brøk der teljaren liknar $(\\text{nemnar})\'$ — då blir svaret $\\ln|\\text{nemnar}|$\n• $\\ln x$ saman med $\\frac{1}{x}$\n\nTo snarvegar som følgjer av metoden:\n• Lineær kjerne: $\\int f(ax+b)\\,dx = \\frac{1}{a}F(ax+b) + C$\n• Logaritmisk derivert: $\\int \\frac{u\'(x)}{u(x)}\\,dx = \\ln|u(x)| + C$',
		thinkAloud:
			'«Eg ser $\\int 6x(x^2+1)^4\\,dx$. Det er noko opphøgd i fjerde, så $x^2+1$ er ein kandidat til kjerne.\n\nDen deriverte av $x^2+1$ er $2x$. Står $2x$ i integranden? Det står $6x$, som er $3\\cdot 2x$. Bra — då kjem $x$ til å forsvinne.\n\nEg set $u = x^2+1$, så $dx = \\frac{du}{2x}$. Då blir integranden $6x\\cdot u^4\\cdot\\frac{1}{2x} = 3u^4$. Ingen $x$ att.\n\n$\\int 3u^4\\,du = \\frac{3}{5}u^5$, og tilbake til $x$: $\\frac{3}{5}(x^2+1)^5 + C$.\n\nKontroll: deriverer eg, får eg $\\frac{3}{5}\\cdot 5(x^2+1)^4\\cdot 2x = 6x(x^2+1)^4$. Stemmer.»',
		workedSteps: [
			{
				explanation:
					'Vi har $\\int 6x(x^2+1)^4\\,dx$. Noko er opphøgd i fjerde, så innhaldet i parentesen er kandidaten til kjerne.',
				latex: 'u = x^2+1'
			},
			{
				explanation: 'Deriver kjernen og løys for $dx$.',
				latex: '\\frac{du}{dx} = 2x \\Rightarrow dx = \\frac{du}{2x}'
			},
			{
				explanation:
					'Set inn og forkort. $6x$ mot $2x$ gir 3, og alle $x$-ar forsvinn — det er testen på at valet var rett.',
				latex: '\\int 6x\\cdot u^4\\cdot\\frac{du}{2x} = \\int 3u^4\\,du'
			},
			{
				explanation: 'No er det eit heilt vanleg potensintegral, berre i $u$.',
				latex: '\\frac{3}{5}u^5 + C'
			},
			{
				explanation: 'Set tilbake. Oppgåva var i $x$, så svaret må vere det òg.',
				latex: '\\frac{3}{5}(x^2+1)^5 + C'
			}
		],
		mnemonic: '«Finn kjernen, og sjå etter den deriverte av han.»'
	},

	parts: {
		title: 'Delvis integrasjon',
		intro:
			'Produktregelen lesen baklengs. Du byter eit vanskeleg integral mot eit lettare, ved å derivere den eine faktoren og integrere den andre.\n\nDøme: $\\int xe^{2x}\\,dx$, $\\int x^3\\ln x\\,dx$, $\\int \\ln x\\,dx$',
		formula: "\\int u'\\,v\\,dx = u\\,v - \\int u\\,v'\\,dx",
		ruleText:
			'Her er $u\'$ faktoren du integrerer og $v$ faktoren du deriverer. Andre kjelder byter om på bokstavane, så hald konvensjonen fast gjennom heile utrekninga. Byttet lønner seg berre når det nye integralet er lettare enn det gamle.',
		example: 'Eks: $\\int (3x-1)e^x\\,dx = e^x(3x-4) + C$',
		patternRecognition:
			'🔍 Delvis integrasjon er aktuell når integranden er eit produkt av to ulike funksjonstypar, og variabelskifte ikkje fungerer.\n\n• polynom $\\cdot\\ e^{kx}$ → deriver polynomet, integrer $e^{kx}$\n• polynom $\\cdot \\ln x$ → deriver $\\ln x$, integrer polynomet\n• $\\ln x$ åleine → gong med 1, deriver $\\ln x$\n\nTommelfingerregel: $\\ln$ skal nesten alltid deriverast. Polynom skal deriverast, med mindre partnaren er $\\ln$.\n\nTalet på rundar ser du på førehand: $x^n e^{kx}$ krev $n$ rundar, fordi $x^n$ må deriverast $n$ gonger før han blir ein konstant.',
		thinkAloud:
			'«$\\int x\\,e^{2x}\\,dx$. Eit produkt av eit polynom og ein eksponentialfunksjon.\n\nFørst: er $x$ den deriverte av ein kjerne her? $(2x)\' = 2$, ikkje $x$. Så variabelskifte fungerer ikkje.\n\nDelvis integrasjon då — kva skal deriverast? Deriverer eg $x$, blir det 1. Det er bra. Då skal $e^{2x}$ integrerast, og det blir $\\frac{1}{2}e^{2x}$, som ikkje er verre.\n\nSå $v = x$, $v\' = 1$, $u\' = e^{2x}$, $u = \\frac{1}{2}e^{2x}$.\n\n$uv - \\int uv\' = \\frac{1}{2}xe^{2x} - \\int\\frac{1}{2}e^{2x}\\,dx = \\frac{1}{2}xe^{2x} - \\frac{1}{4}e^{2x} + C$.\n\nDet nye integralet var lettare. Hadde eg valt motsett, hadde eg fått $\\int\\frac{x^2}{2}\\cdot 2e^{2x}\\,dx$, som er verre.»',
		workedSteps: [
			{
				explanation:
					'Vi har $\\int x\\,e^{2x}\\,dx$. Vel roller: deriver polynomet, som blir enklare, og integrer eksponentialfunksjonen, som ikkje blir verre.',
				latex: "v = x,\\ v' = 1, \\quad u' = e^{2x},\\ u = \\tfrac{1}{2}e^{2x}"
			},
			{
				explanation: 'Set inn i formelen $uv - \\int uv\'\\,dx$.',
				latex: '\\tfrac{1}{2}x e^{2x} - \\int \\tfrac{1}{2}e^{2x}\\,dx'
			},
			{
				explanation:
					'Det nye integralet er ein grunnregel. Legg merke til at det er enklare enn det vi starta med — det er der gevinsten ligg.',
				latex: '\\tfrac{1}{2}x e^{2x} - \\tfrac{1}{4}e^{2x} + C'
			},
			{
				explanation: 'Faktoriser om du vil. Det er same funksjon, berre ryddigare skriven.',
				latex: '\\tfrac{1}{4}e^{2x}(2x-1) + C'
			}
		],
		mnemonic: '«Deriver det som blir enklare, integrer det som ikkje blir verre.»'
	},

	partial: {
		title: 'Delbrøkoppspalting',
		intro:
			'Vi kan integrere $\\frac{A}{x-a}$ og $\\frac{B}{(x-a)^2}$. Delbrøkoppspalting er å skrive ein rasjonal funksjon som ein sum av slike ledd — altså det motsette av å setje brøkar på felles brøkstrek.\n\nDøme: $\\int \\frac{x+7}{x^2-x-6}\\,dx$, $\\int \\frac{x^2+1}{x^2-1}\\,dx$',
		formula: '\\frac{P(x)}{(x-a)(x-b)} = \\frac{A}{x-a} + \\frac{B}{x-b}',
		ruleText:
			'To føresetnader må vere på plass: teljaren må ha lågare grad enn nemnaren (elles polynomdivisjon først), og nemnaren må kunne faktoriserast i førstegradsfaktorar. Ved ein dobbel faktor $(x-a)^2$ treng du både $\\frac{A}{x-a}$ og $\\frac{B}{(x-a)^2}$.',
		example:
			'Eks: $\\int \\frac{5}{(x-1)(x+4)}\\,dx = \\ln|x-1| - \\ln|x+4| + C$',
		patternRecognition:
			'🔍 Integranden er ein brøk av to polynom. Men gå gjennom desse før du spaltar:\n\n1. Er teljaren (eit multiplum av) den deriverte av nemnaren? Då er det eit variabelskifte, og mykje raskare. Dette er det viktigaste skiljet i heile emnet.\n2. Har teljar og nemnar ein felles faktor som kan forkortast?\n3. Har teljaren same eller høgare grad? Då polynomdivisjon først.\n4. Har nemnaren reelle nullpunkt? Hvis ikkje, ligg oppgåva utanfor S2 — med mindre variabelskifte fungerer.\n\nKonstantane kan du finne med koeffisientsamanlikning, eller raskare med dekkjemetoden: dekk til éin faktor og set inn nullpunktet hans.',
		thinkAloud:
			'«$\\int \\frac{x+7}{x^2-x-6}\\,dx$. Ein brøk av polynom.\n\nFørst: er teljaren den deriverte av nemnaren? $(x^2-x-6)\' = 2x-1$. Nei, $x+7$ er ikkje eit multiplum av $2x-1$. Så variabelskifte fungerer ikkje direkte.\n\nGrad: teljar 1, nemnar 2. Bra — ingen divisjon.\n\nFaktoriser nemnaren: produkt $-6$, sum $-1$, altså $(x-3)(x+2)$. To ulike faktorar, så $\\frac{A}{x-3} + \\frac{B}{x+2}$.\n\nDekk til og set inn: $A = \\frac{3+7}{3+2} = 2$, og $B = \\frac{-2+7}{-2-3} = -1$.\n\nKontroll på felles brøkstrek: $\\frac{2(x+2)-(x-3)}{(x-3)(x+2)} = \\frac{x+7}{\\ldots}$. Stemmer.\n\nSvar: $2\\ln|x-3| - \\ln|x+2| + C$.»',
		workedSteps: [
			{
				explanation:
					'Vi har $\\int \\frac{x+7}{x^2-x-6}\\,dx$. Sjekk først at teljaren ikkje er den deriverte av nemnaren, og at graden er lågare.',
				latex: "(x^2-x-6)' = 2x-1"
			},
			{
				explanation: 'Faktoriser nemnaren. To tal med produkt $-6$ og sum $-1$ er $-3$ og $2$.',
				latex: 'x^2-x-6 = (x-3)(x+2)'
			},
			{
				explanation:
					'To ulike førstegradsfaktorar gir to delbrøkar, kvar med ein konstant teljar.',
				latex: '\\frac{x+7}{(x-3)(x+2)} = \\frac{A}{x-3} + \\frac{B}{x+2}'
			},
			{
				explanation:
					'Gong med fellesnemnaren. Likninga som står att, er ein polynomidentitet: ho gjeld for alle $x$, òg dei som ikkje var lov i den opphavlege brøken.',
				latex: 'x+7 = A(x+2) + B(x-3)'
			},
			{
				explanation: 'Set inn nullpunkta. Kvart innsett tal slår ut alle ledd utanom eitt.',
				latex: '10 = 5A \\Rightarrow A = 2, \\qquad 5 = -5B \\Rightarrow B = -1'
			},
			{
				explanation:
					'Integrer kvar delbrøk. Absoluttverdien er ikkje pynt: $\\frac{1}{x-3}$ er definert for $x<3$ òg, og $\\ln(x-3)$ er ikkje det.',
				latex: '2\\ln|x-3| - \\ln|x+2| + C'
			}
		],
		mnemonic: '«Grad, faktoriser, spalt, integrer.»'
	},

	mixed: {
		title: 'Blanda metodar',
		intro:
			'Når oppgåva ikkje seier kva metode du skal bruke, er metodevalet sjølve ferdigheita. Det er òg det som skil ein sterk S2-elev frå ein svært sterk.\n\nDet finst ingen produktregel og ingen brøkregel for integral. Metodane finst nettopp fordi integralet av eit produkt ikkje er produktet av integrala.',
		formula: "\\int g(u)u'\\,dx = G(u) + C \\qquad \\int u'v\\,dx = uv - \\int uv'\\,dx",
		ruleText:
			'Gå gjennom spørsmåla i denne rekkjefølgja. Ho er ikkje tilfeldig: variabelskifte er det billegaste å sjekke, og det som oftast blir oversett når integranden er ein brøk.',
		example: 'Eks: $\\int \\frac{2x^2-3}{x}\\,dx = x^2 - 3\\ln|x| + C$ — ingen metode trongst.',
		patternRecognition:
			'🔍 Avgjerdsrekkjefølgja:\n\n1. Kan eg skrive om til grunnreglane? Del opp ein brøk med eitt ledd i nemnaren, skriv rot som potens, gong ut ein kort parentes.\n2. Står den deriverte av ein kjerne som faktor? → Variabelskifte. Gjeld òg brøkar der teljaren er $(\\text{nemnar})\'$.\n3. Er det ein brøk av polynom? → Forkort felles faktor → divider om graden krev det → faktoriser → delbrøk.\n4. Er det eit produkt av ulike funksjonstypar? → Delvis integrasjon.\n5. Passar ingenting direkte? → Kombiner: variabelskifte først, og sjå kva som står att.\n6. Kan integralet løysast med S2-metodar i det heile? $e^{x^2}$ og $\\frac{1}{x^2+1}$: nei.\n\nSignal-tabellen:\n• $(\\text{kjerne})^n$, $e^{\\text{kjerne}}$ med $(\\text{kjerne})\'$ som faktor → variabelskifte\n• $\\frac{f\'(x)}{f(x)}$ → variabelskifte, svar $\\ln|f|$\n• brøk av polynom, teljar $\\neq (\\text{nemnar})\'$ → delbrøk\n• polynom $\\cdot e^{kx}$ eller polynom $\\cdot\\ln x$ → delvis\n• brøk i $e^x$ → sett $u = e^x$, så divisjon eller delbrøk',
		thinkAloud:
			'«$\\int \\frac{x+1}{x^2+2x-8}\\,dx$. Ein brøk av polynom — det ser ut som delbrøk.\n\nMen eg sjekkar punkt 2 først, som eg alltid skal: $(x^2+2x-8)\' = 2x+2$. Og $x+1$ er nøyaktig halvparten av det.\n\nSå dette er eit variabelskifte, ikkje ein delbrøk: $u = x^2+2x-8$ gir $\\frac{1}{2}\\int\\frac{1}{u}\\,du = \\frac{1}{2}\\ln|x^2+2x-8| + C$.\n\nDelbrøk hadde gitt rett svar òg — faktoriser $(x+4)(x-2)$, finn to konstantar, integrer. Men det er fire steg der eg klarte meg med eitt. Det er difor rekkjefølgja er som ho er.»',
		workedSteps: [
			{
				explanation:
					'$\\int \\frac{(x+1)^2}{\\sqrt{x}}\\,dx$. Punkt 1: kan dette skrivast om? Gong ut teljaren.',
				latex: '\\frac{x^2+2x+1}{x^{1/2}}'
			},
			{
				explanation: 'Del opp brøken og skriv kvart ledd som ein potens av $x$.',
				latex: 'x^{3/2} + 2x^{1/2} + x^{-1/2}'
			},
			{
				explanation:
					'No er alle tre ledda grunnreglar. Ingen metode trongst — og det er nettopp poenget med punkt 1.',
				latex: '\\frac{2}{5}x^{5/2} + \\frac{4}{3}x^{3/2} + 2\\sqrt{x} + C'
			},
			{
				explanation:
					'Til slutt: deriver svaret. Integrasjon er derivasjon baklengs, så kontrollen er alltid tilgjengeleg.',
				latex: "\\left(\\tfrac{2}{5}x^{5/2}\\right)' = x^{3/2} \\quad\\checkmark"
			}
		],
		mnemonic: '«Skriv om, sjå etter kjernen, så brøk, så produkt.»'
	}
};
