// Theory bank for the derivative module – rich cognitive modeling entries
// Based on CLT Principle 4 (Modellering + Tenke Høyt) from research PDF

import type { TheoryEntry, TopicId } from './types';

export const theoryBank: Record<TopicId, TheoryEntry> = {
	chain: {
		title: {
			nn: 'Kjerneregelen',
			en: 'Chain Rule',
			es: 'Regla de la Cadena'
		},
		intro: {
			nn: 'Derivasjon av samansette funksjonar — ein funksjon inne i ein annan. Generelt: $f(x) = g(u(x))$.\n\nDøme: $(2x+1)^3$, $\\sqrt{3x+2}$, $e^{x^2}$, $\\ln(5x-1)$',
			en: 'Differentiation of composite functions — a function inside another. General form: $f(x) = g(u(x))$.\n\nExamples: $(2x+1)^3$, $\\sqrt{3x+2}$, $e^{x^2}$, $\\ln(5x-1)$',
			es: 'Derivada de funciones compuestas — una función dentro de otra. Forma general: $f(x) = g(u(x))$.\n\nEjemplos: $(2x+1)^3$, $\\sqrt{3x+2}$, $e^{x^2}$, $\\ln(5x-1)$'
		},
		formula: "$$f'(x) = g'(u) \\cdot u'(x)$$",
		ruleText: {
			nn: "g'(u) · u'(x)",
			en: "g'(u) · u'(x)",
			es: "g'(u) · u'(x)"
		},
		example: {
			nn: "Eks: $(3x+1)^4 \\Rightarrow 12(3x+1)^3$",
			en: "Ex: $(3x+1)^4 \\Rightarrow 12(3x+1)^3$",
			es: "Ej: $(3x+1)^4 \\Rightarrow 12(3x+1)^3$"
		},
		patternRecognition: {
			nn: '🔍 Ser du ein funksjon inne i ein annan funksjon? Då treng du kjerneregelen!\n\nTypiske teikn:\n• Noko opphøgd i potens: $(\\ldots)^n$\n• Rot av noko: $\\sqrt{\\ldots}$\n• Logaritme av noko: $\\ln(\\ldots)$\n• $e$ opphøgd i noko: $e^{(\\ldots)}$\n\nSpør deg sjølv: «Kan eg peike på éin del som er den indre funksjonen?»',
			en: '🔍 Do you see a function inside another function? Then you need the chain rule!\n\nTypical signs:\n• Something raised to a power: $(\\ldots)^n$\n• Root of something: $\\sqrt{\\ldots}$\n• Logarithm of something: $\\ln(\\ldots)$\n• $e$ raised to something: $e^{(\\ldots)}$\n\nAsk yourself: "Can I point to one part that is the inner function?"',
			es: '🔍 ¿Ves una función dentro de otra función? ¡Entonces necesitas la regla de la cadena!\n\nSeñales típicas:\n• Algo elevado a una potencia: $(\\ldots)^n$\n• Raíz de algo: $\\sqrt{\\ldots}$\n• Logaritmo de algo: $\\ln(\\ldots)$\n• $e$ elevado a algo: $e^{(\\ldots)}$'
		},
		thinkAloud: {
			nn: '«Eg ser $(2x+1)^3$. OK — dette er noko opphøgd i tredje. Det ytre er $u^3$, det indre er $u = 2x+1$.\n\nFørst deriverer eg det ytre: $3u^2$.\nSå deriverer eg det indre: $(2x+1)\' = 2$.\nTil slutt gongar eg dei saman:\n$f\'(x) = 3(2x+1)^2 \\cdot 2 = 6(2x+1)^2$.\n\nHusk: ytre derivert × indre derivert.»',
			en: '"I see $(2x+1)^3$. OK — this is something raised to the third power. The outer is $u^3$, the inner is $u = 2x+1$.\n\nFirst I differentiate the outer: $3u^2$.\nThen I differentiate the inner: $(2x+1)\' = 2$.\nFinally I multiply them together:\n$f\'(x) = 3(2x+1)^2 \\cdot 2 = 6(2x+1)^2$.\n\nRemember: outer derivative × inner derivative."',
			es: '"Veo $(2x+1)^3$. OK — esto es algo elevado al cubo. Lo exterior es $u^3$, lo interior es $u = 2x+1$.\n\nPrimero derivo lo exterior: $3u^2$.\nLuego derivo lo interior: $(2x+1)\' = 2$.\nFinalmente multiplico:\n$f\'(x) = 3(2x+1)^2 \\cdot 2 = 6(2x+1)^2$."'
		},
		workedSteps: [
			{
				explanation: {
					nn: 'Vi har $f(x) = (2x+1)^3$. Fyrst identifiserer vi at dette er ein samansett funksjon.',
					en: 'We have $f(x) = (2x+1)^3$. First we identify that this is a composite function.',
					es: 'Tenemos $f(x) = (2x+1)^3$. Primero identificamos que es una función compuesta.'
				},
				latex: "f(x) = (2x+1)^3"
			},
			{
				explanation: {
					nn: 'Den ytre funksjonen er $g(u) = u^3$ og den indre er $u(x) = 2x+1$.',
					en: 'The outer function is $g(u) = u^3$ and the inner is $u(x) = 2x+1$.',
					es: 'La función exterior es $g(u) = u^3$ y la interior es $u(x) = 2x+1$.'
				},
				latex: "g(u) = u^3, \\quad u(x) = 2x+1"
			},
			{
				explanation: {
					nn: 'Deriverer den ytre: potensregelen gir $g\'(u) = 3u^2$.',
					en: 'Differentiate the outer: power rule gives $g\'(u) = 3u^2$.',
					es: 'Derivamos la exterior: la regla de la potencia da $g\'(u) = 3u^2$.'
				},
				latex: "g'(u) = 3u^2"
			},
			{
				explanation: {
					nn: 'Deriverer den indre: $u\'(x) = 2$.',
					en: 'Differentiate the inner: $u\'(x) = 2$.',
					es: 'Derivamos la interior: $u\'(x) = 2$.'
				},
				latex: "u'(x) = 2"
			},
			{
				explanation: {
					nn: 'No brukar vi kjerneregelen: $f\'(x) = g\'(u) \\cdot u\'(x)$. Set inn verdiane.',
					en: 'Now apply the chain rule: $f\'(x) = g\'(u) \\cdot u\'(x)$. Substitute the values.',
					es: 'Ahora aplicamos la regla: $f\'(x) = g\'(u) \\cdot u\'(x)$. Sustituimos.'
				},
				latex: "f'(x) = 3(2x+1)^2 \\cdot 2"
			},
			{
				explanation: {
					nn: 'Forenklar: $3 \\cdot 2 = 6$.',
					en: 'Simplify: $3 \\cdot 2 = 6$.',
					es: 'Simplificamos: $3 \\cdot 2 = 6$.'
				},
				latex: "f'(x) = 6(2x+1)^2"
			}
		],
		mnemonic: {
			nn: '«Derivér det ytre, behold det indre, gong med den deriverte av det indre.»',
			en: '"Differentiate the outer, keep the inner, multiply by the derivative of the inner."',
			es: '"Deriva lo exterior, mantén lo interior, multiplica por la derivada de lo interior."'
		}
	},
	product: {
		title: {
			nn: 'Produktregelen',
			en: 'Product Rule',
			es: 'Regla del Producto'
		},
		intro: {
			nn: 'Derivasjon av eit produkt av to funksjonar: $f(x) = u(x) \\cdot v(x)$.\n\nDøme: $x^2(3x+1)$, $x^3 \\cdot e^{2x}$, $x \\cdot \\ln(x)$',
			en: 'Differentiation of the product of two functions: $f(x) = u(x) \\cdot v(x)$.\n\nExamples: $x^2(3x+1)$, $x^3 \\cdot e^{2x}$, $x \\cdot \\ln(x)$',
			es: 'Derivada del producto de dos funciones: $f(x) = u(x) \\cdot v(x)$.\n\nEjemplos: $x^2(3x+1)$, $x^3 \\cdot e^{2x}$, $x \\cdot \\ln(x)$'
		},
		formula: "$$(u \\cdot v)' = u'v + uv'$$",
		ruleText: {
			nn: "u'v + uv'",
			en: "u'v + uv'",
			es: "u'v + uv'"
		},
		example: {
			nn: "Eks: $x^2 \\cdot e^x$",
			en: "Ex: $x^2 \\cdot e^x$",
			es: "Ej: $x^2 \\cdot e^x$"
		},
		patternRecognition: {
			nn: '🔍 Ser du to separate funksjonar av $x$ som er gonga saman? Då treng du produktregelen!\n\nTypiske teikn:\n• $x^n \\cdot \\sin(x)$ — potens gonger trig\n• $x^2 \\cdot e^x$ — polynom gonger eksponential\n• $(x+1) \\cdot \\ln(x)$ — to ulike typar\n\nSpør deg sjølv: «Kan eg peike på to delar som begge inneheld $x$?»',
			en: '🔍 Do you see two separate functions of $x$ multiplied together? Then you need the product rule!\n\nTypical signs:\n• $x^n \\cdot \\sin(x)$ — power times trig\n• $x^2 \\cdot e^x$ — polynomial times exponential\n• $(x+1) \\cdot \\ln(x)$ — two different types\n\nAsk yourself: "Can I point to two parts that both contain $x$?"',
			es: '🔍 ¿Ves dos funciones separadas de $x$ multiplicadas? ¡Entonces necesitas la regla del producto!\n\nSeñales típicas:\n• $x^n \\cdot \\sin(x)$ — potencia por trigonometría\n• $x^2 \\cdot e^x$ — polinomio por exponencial\n• $(x+1) \\cdot \\ln(x)$ — dos tipos diferentes'
		},
		thinkAloud: {
			nn: '«Eg ser $x^2 \\cdot (3x+1)$. To delar gonga saman, begge med $x$. Eg vel $u = x^2$ og $v = 3x+1$.\n\nDeriverer kvar for seg: $u\' = 2x$, $v\' = 3$.\nSo set eg inn i formelen: $f\'(x) = u\'v + uv\' = 2x(3x+1) + x^2 \\cdot 3$.\nForenklar: $6x^2 + 2x + 3x^2 = 9x^2 + 2x$.\n\nHusk: «Den eine derivert gonger den andre, pluss motsett.»»',
			en: '"I see $x^2 \\cdot (3x+1)$. Two parts multiplied, both with $x$. I choose $u = x^2$ and $v = 3x+1$.\n\nDifferentiate each: $u\' = 2x$, $v\' = 3$.\nThen I plug into the formula: $f\'(x) = u\'v + uv\' = 2x(3x+1) + x^2 \\cdot 3$.\nSimplify: $6x^2 + 2x + 3x^2 = 9x^2 + 2x$.\n\nRemember: \'first derivative times second, plus first times second derivative.\'"',
			es: '"Veo $x^2 \\cdot (3x+1)$. Dos partes multiplicadas, ambas con $x$. Elijo $u = x^2$ y $v = 3x+1$.\n\nDerivo cada una: $u\' = 2x$, $v\' = 3$.\nSustituyo: $f\'(x) = u\'v + uv\' = 2x(3x+1) + x^2 \\cdot 3$.\nSimplifico: $9x^2 + 2x$."'
		},
		workedSteps: [
			{
				explanation: {
					nn: 'Vi har $f(x) = x^2 \\cdot (3x+1)$. To funksjonar gonga saman.',
					en: 'We have $f(x) = x^2 \\cdot (3x+1)$. Two functions multiplied.',
					es: 'Tenemos $f(x) = x^2 \\cdot (3x+1)$. Dos funciones multiplicadas.'
				},
				latex: "f(x) = x^2 \\cdot (3x+1)"
			},
			{
				explanation: {
					nn: 'Vel $u = x^2$ og $v = 3x+1$.',
					en: 'Choose $u = x^2$ and $v = 3x+1$.',
					es: 'Elegimos $u = x^2$ y $v = 3x+1$.'
				},
				latex: "u = x^2, \\quad v = 3x+1"
			},
			{
				explanation: {
					nn: 'Deriverer begge: $u\' = 2x$ og $v\' = 3$.',
					en: 'Differentiate both: $u\' = 2x$ and $v\' = 3$.',
					es: 'Derivamos ambas: $u\' = 2x$ y $v\' = 3$.'
				},
				latex: "u' = 2x, \\quad v' = 3"
			},
			{
				explanation: {
					nn: 'Brukar produktregelen: $f\'(x) = u\'v + uv\'$.',
					en: 'Apply the product rule: $f\'(x) = u\'v + uv\'$.',
					es: 'Aplicamos la regla del producto: $f\'(x) = u\'v + uv\'$.'
				},
				latex: "f'(x) = u'v + uv'"
			},
			{
				explanation: {
					nn: 'Set inn verdiane.',
					en: 'Substitute the values.',
					es: 'Sustituimos los valores.'
				},
				latex: "f'(x) = 2x(3x+1) + x^2 \\cdot 3"
			},
			{
				explanation: {
					nn: 'Utvid og forenkle: $6x^2 + 2x + 3x^2 = 9x^2 + 2x$.',
					en: 'Expand and simplify: $6x^2 + 2x + 3x^2 = 9x^2 + 2x$.',
					es: 'Expandir y simplificar: $6x^2 + 2x + 3x^2 = 9x^2 + 2x$.'
				},
				latex: "f'(x) = 9x^2 + 2x"
			}
		],
		mnemonic: {
			nn: '«Den fyrste derivert gonger den andre, pluss den fyrste gonger den andre derivert.»',
			en: '"First derivative times second, plus first times second derivative."',
			es: '"Derivada del primero por el segundo, más el primero por la derivada del segundo."'
		}
	},
	quotient: {
		title: {
			nn: 'Brøkregelen',
			en: 'Quotient Rule',
			es: 'Regla del Cociente'
		},
		intro: {
			nn: 'Derivasjon av ein brøk der både teljar og nemnar inneheld $x$: $f(x) = \\frac{u(x)}{v(x)}$.\n\nDøme: $\\frac{x^2}{x+1}$, $\\frac{e^{2x}}{x}$, $\\frac{\\ln x}{x^2}$',
			en: 'Differentiation of a fraction where both parts contain $x$: $f(x) = \\frac{u(x)}{v(x)}$.\n\nExamples: $\\frac{x^2}{x+1}$, $\\frac{e^{2x}}{x}$, $\\frac{\\ln x}{x^2}$',
			es: 'Derivada de una fracción donde ambas partes contienen $x$: $f(x) = \\frac{u(x)}{v(x)}$.\n\nEjemplos: $\\frac{x^2}{x+1}$, $\\frac{e^{2x}}{x}$, $\\frac{\\ln x}{x^2}$'
		},
		formula: "$$\\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^2}$$",
		ruleText: {
			nn: "(u'v - uv') / v²",
			en: "(u'v - uv') / v²",
			es: "(u'v - uv') / v²"
		},
		example: {
			nn: "Eks: $x / (x+1)$",
			en: "Ex: $x / (x+1)$",
			es: "Ej: $x / (x+1)$"
		},
		patternRecognition: {
			nn: '🔍 Ser du ein brøk der både teljar og nemnar har $x$? Då treng du brøkregelen!\n\nTypiske teikn:\n• $\\frac{x^2}{x+1}$ — polynom over polynom\n• $\\frac{\\sin(x)}{x}$ — trig over polynom\n• $\\frac{e^x}{x^2+1}$ — eksponential over polynom\n\nSpør deg sjølv: «Er det ein brøkstrek, og har begge sider $x$?»',
			en: '🔍 Do you see a fraction where both top and bottom contain $x$? Then you need the quotient rule!\n\nTypical signs:\n• $\\frac{x^2}{x+1}$ — polynomial over polynomial\n• $\\frac{\\sin(x)}{x}$ — trig over polynomial\n• $\\frac{e^x}{x^2+1}$ — exponential over polynomial\n\nAsk yourself: "Is there a fraction bar, and do both sides have $x$?"',
			es: '🔍 ¿Ves una fracción donde tanto el numerador como el denominador tienen $x$? ¡Entonces necesitas la regla del cociente!\n\nSeñales típicas:\n• $\\frac{x^2}{x+1}$ — polinomio sobre polinomio\n• $\\frac{\\sin(x)}{x}$ — trigonometría sobre polinomio'
		},
		thinkAloud: {
			nn: '«Eg ser $\\frac{x}{x+1}$. Ein brøk der begge delar har $x$. Eg vel $u = x$ (teljar) og $v = x+1$ (nemnar).\n\nDeriverer: $u\' = 1$, $v\' = 1$.\nBrøkregelen: $\\frac{u\'v - uv\'}{v^2} = \\frac{1 \\cdot (x+1) - x \\cdot 1}{(x+1)^2}$.\nForenklar teljaren: $x+1-x = 1$.\nSvar: $\\frac{1}{(x+1)^2}$.\n\nPass på: rekkefølgja i teljaren er viktig! $u\'v$ fyrst, minus $uv\'$.»',
			en: '"I see $\\frac{x}{x+1}$. A fraction where both parts have $x$. I choose $u = x$ (top) and $v = x+1$ (bottom).\n\nDifferentiate: $u\' = 1$, $v\' = 1$.\nQuotient rule: $\\frac{u\'v - uv\'}{v^2} = \\frac{1 \\cdot (x+1) - x \\cdot 1}{(x+1)^2}$.\nSimplify the top: $x+1-x = 1$.\nAnswer: $\\frac{1}{(x+1)^2}$.\n\nBe careful: the order in the numerator matters! $u\'v$ first, minus $uv\'$."',
			es: '"Veo $\\frac{x}{x+1}$. Una fracción donde ambas partes tienen $x$. Elijo $u = x$ (arriba) y $v = x+1$ (abajo).\n\nDerivo: $u\' = 1$, $v\' = 1$.\nRegla del cociente: $\\frac{u\'v - uv\'}{v^2} = \\frac{1 \\cdot (x+1) - x \\cdot 1}{(x+1)^2}$.\nSimplifico: $\\frac{1}{(x+1)^2}$."'
		},
		workedSteps: [
			{
				explanation: {
					nn: 'Vi har $f(x) = \\frac{x}{x+1}$. Ein brøk der $x$ er i begge delar.',
					en: 'We have $f(x) = \\frac{x}{x+1}$. A fraction where $x$ is in both parts.',
					es: 'Tenemos $f(x) = \\frac{x}{x+1}$. Una fracción con $x$ en ambas partes.'
				},
				latex: "f(x) = \\frac{x}{x+1}"
			},
			{
				explanation: {
					nn: 'Vel $u = x$ (teljar) og $v = x+1$ (nemnar).',
					en: 'Choose $u = x$ (numerator) and $v = x+1$ (denominator).',
					es: 'Elegimos $u = x$ (numerador) y $v = x+1$ (denominador).'
				},
				latex: "u = x, \\quad v = x+1"
			},
			{
				explanation: {
					nn: 'Deriverer: $u\' = 1$ og $v\' = 1$.',
					en: 'Differentiate: $u\' = 1$ and $v\' = 1$.',
					es: 'Derivamos: $u\' = 1$ y $v\' = 1$.'
				},
				latex: "u' = 1, \\quad v' = 1"
			},
			{
				explanation: {
					nn: 'Brukar brøkregelen. NB: Rekkefølgja er viktig!',
					en: 'Apply the quotient rule. NB: The order matters!',
					es: 'Aplicamos la regla del cociente. ¡El orden importa!'
				},
				latex: "f'(x) = \\frac{u'v - uv'}{v^2}"
			},
			{
				explanation: {
					nn: 'Set inn verdiane i formelen.',
					en: 'Substitute the values into the formula.',
					es: 'Sustituimos los valores en la fórmula.'
				},
				latex: "f'(x) = \\frac{1 \\cdot (x+1) - x \\cdot 1}{(x+1)^2}"
			},
			{
				explanation: {
					nn: 'Forenklar teljaren: $x + 1 - x = 1$.',
					en: 'Simplify the numerator: $x + 1 - x = 1$.',
					es: 'Simplificamos el numerador: $x + 1 - x = 1$.'
				},
				latex: "f'(x) = \\frac{1}{(x+1)^2}"
			}
		],
		mnemonic: {
			nn: '«Teljar-derivert gonger nemnar, minus teljar gonger nemnar-derivert, alt over nemnar i andre.»',
			en: '"Top-derivative times bottom, minus top times bottom-derivative, all over bottom squared."',
			es: '"Derivada del numerador por el denominador, menos numerador por derivada del denominador, todo sobre denominador al cuadrado."'
		}
	}
};
