// Theory entries for the logarithm module
// Covers: Product rule, Quotient rule, Power rule, Simplification, Log equations, Exp equations

import type { LogTheoryEntry } from './types';

export const LOG_THEORY: Record<string, LogTheoryEntry> = {
	log_product: {
		title: {
			nn: 'Produktsetningen',
			en: 'Product Rule',
			es: 'Regla del Producto'
		},
		intro: {
			nn: 'Logaritmen av eit produkt er lik summen av logaritmane.',
			en: 'The logarithm of a product equals the sum of the logarithms.',
			es: 'El logaritmo de un producto es igual a la suma de los logaritmos.'
		},
		formula: '\\log_b(a \\cdot c) = \\log_b\\,a + \\log_b\\,c',
		ruleText: {
			nn: 'Når du ser ein logaritme av eit produkt, kan du dele det opp i ein sum.',
			en: 'When you see a logarithm of a product, you can split it into a sum.',
			es: 'Cuando veas un logaritmo de un producto, puedes dividirlo en una suma.'
		},
		example: {
			nn: '\\lg(3 \\cdot 5) = \\lg\\,3 + \\lg\\,5',
			en: '\\lg(3 \\cdot 5) = \\lg\\,3 + \\lg\\,5',
			es: '\\lg(3 \\cdot 5) = \\lg\\,3 + \\lg\\,5'
		},
		patternRecognition: {
			nn: 'Sjå etter multiplikasjon inne i logaritmen, eller koeffisientar framfor variablar.',
			en: 'Look for multiplication inside the log, or coefficients before variables.',
			es: 'Busca multiplicación dentro del logaritmo o coeficientes delante de variables.'
		},
		thinkAloud: {
			nn: '«Eg ser eit produkt inni lg(...). Då kan eg dele opp i ein sum av to lg-uttrykk.»',
			en: '"I see a product inside lg(...). I can split it into a sum of two lg expressions."',
			es: '"Veo un producto dentro de lg(...). Puedo dividirlo en una suma de dos expresiones lg."'
		},
		workedSteps: [
			{
				explanation: {
					nn: 'Start med uttrykket',
					en: 'Start with the expression',
					es: 'Empieza con la expresión'
				},
				latex: '\\lg(6x)'
			},
			{
				explanation: {
					nn: 'Sjå det som eit produkt: 6 · x',
					en: 'See it as a product: 6 · x',
					es: 'Míralo como un producto: 6 · x'
				},
				latex: '\\lg(6 \\cdot x)'
			},
			{
				explanation: {
					nn: 'Bruk produktsetningen',
					en: 'Apply the product rule',
					es: 'Aplica la regla del producto'
				},
				latex: '\\lg\\,6 + \\lg\\,x'
			}
		],
		mnemonic: {
			nn: '«Gonging inne → pluss ute»',
			en: '"Times inside → plus outside"',
			es: '"Multiplicación adentro → suma afuera"'
		}
	},

	log_quotient: {
		title: {
			nn: 'Kvotientsetningen',
			en: 'Quotient Rule',
			es: 'Regla del Cociente'
		},
		intro: {
			nn: 'Logaritmen av ein brøk er lik skilnaden mellom logaritmane.',
			en: 'The logarithm of a quotient equals the difference of the logarithms.',
			es: 'El logaritmo de un cociente es igual a la diferencia de los logaritmos.'
		},
		formula: '\\log_b\\left(\\frac{a}{c}\\right) = \\log_b\\,a - \\log_b\\,c',
		ruleText: {
			nn: 'Divisjon inne i logaritmen blir til subtraksjon utanfor.',
			en: 'Division inside the log becomes subtraction outside.',
			es: 'La división dentro del logaritmo se convierte en resta afuera.'
		},
		example: {
			nn: '\\lg\\left(\\frac{8}{2}\\right) = \\lg\\,8 - \\lg\\,2',
			en: '\\lg\\left(\\frac{8}{2}\\right) = \\lg\\,8 - \\lg\\,2',
			es: '\\lg\\left(\\frac{8}{2}\\right) = \\lg\\,8 - \\lg\\,2'
		},
		patternRecognition: {
			nn: 'Sjå etter brøk inne i logaritmen.',
			en: 'Look for a fraction inside the logarithm.',
			es: 'Busca una fracción dentro del logaritmo.'
		},
		thinkAloud: {
			nn: '«Eg ser ein brøk inni lg(...). Då kan eg dele opp i ein differanse.»',
			en: '"I see a fraction inside lg(...). I can split it into a difference."',
			es: '"Veo una fracción dentro de lg(...). Puedo dividirlo en una diferencia."'
		},
		workedSteps: [
			{
				explanation: { nn: 'Start med uttrykket', en: 'Start with the expression', es: 'Empieza con la expresión' },
				latex: '\\lg\\left(\\frac{x}{3}\\right)'
			},
			{
				explanation: { nn: 'Bruk kvotientsetningen', en: 'Apply the quotient rule', es: 'Aplica la regla del cociente' },
				latex: '\\lg\\,x - \\lg\\,3'
			}
		],
		mnemonic: {
			nn: '«Deling inne → minus ute»',
			en: '"Division inside → minus outside"',
			es: '"División adentro → resta afuera"'
		}
	},

	log_power: {
		title: {
			nn: 'Potenssetningen',
			en: 'Power Rule',
			es: 'Regla de la Potencia'
		},
		intro: {
			nn: 'Eksponenten kan flyttast framfor logaritmen som ein koeffisient.',
			en: 'The exponent can be moved in front of the logarithm as a coefficient.',
			es: 'El exponente se puede mover delante del logaritmo como coeficiente.'
		},
		formula: '\\log_b(a^n) = n \\cdot \\log_b\\,a',
		ruleText: {
			nn: 'Ein eksponent inni logaritmen kan «drattast ut» som ein faktor.',
			en: 'An exponent inside the logarithm can be "pulled out" as a factor.',
			es: 'Un exponente dentro del logaritmo se puede "sacar" como factor.'
		},
		example: {
			nn: '\\lg(x^3) = 3 \\cdot \\lg\\,x',
			en: '\\lg(x^3) = 3 \\cdot \\lg\\,x',
			es: '\\lg(x^3) = 3 \\cdot \\lg\\,x'
		},
		patternRecognition: {
			nn: 'Sjå etter potens inne i logaritmen, inkludert røter (som er brøkpotens).',
			en: 'Look for powers inside the logarithm, including roots (which are fractional powers).',
			es: 'Busca potencias dentro del logaritmo, incluyendo raíces (que son potencias fraccionarias).'
		},
		thinkAloud: {
			nn: '«Eg ser ein eksponent inni lg(...). Eg kan flytte han framfor som ein faktor.»',
			en: '"I see an exponent inside lg(...). I can move it to the front as a factor."',
			es: '"Veo un exponente dentro de lg(...). Puedo moverlo al frente como factor."'
		},
		workedSteps: [
			{
				explanation: { nn: 'Start med uttrykket', en: 'Start with the expression', es: 'Empieza con la expresión' },
				latex: '\\lg(\\sqrt{x})'
			},
			{
				explanation: { nn: 'Skriv om rota som potens', en: 'Rewrite the root as a power', es: 'Reescribe la raíz como potencia' },
				latex: '\\lg(x^{1/2})'
			},
			{
				explanation: { nn: 'Bruk potenssetningen', en: 'Apply the power rule', es: 'Aplica la regla de la potencia' },
				latex: '\\frac{1}{2} \\cdot \\lg\\,x'
			}
		],
		mnemonic: {
			nn: '«Eksponenten hoppar ned og blir ein faktor»',
			en: '"The exponent jumps down and becomes a factor"',
			es: '"El exponente baja y se convierte en factor"'
		}
	},

	log_simplify: {
		title: {
			nn: 'Forenkle logaritmeuttrykk',
			en: 'Simplify Logarithmic Expressions',
			es: 'Simplificar Expresiones Logarítmicas'
		},
		intro: {
			nn: 'Kombiner dei tre setningane for å skrive om samansette uttrykk.',
			en: 'Combine the three laws to rewrite complex expressions.',
			es: 'Combina las tres leyes para reescribir expresiones complejas.'
		},
		formula: '\\text{Bruk produkt-, kvotient- og potenssetningen saman}',
		ruleText: {
			nn: 'Start frå innsida og arbeid utover, eller frå utsida og arbeid innover — avhengig av oppgåva.',
			en: 'Start from the inside and work outward, or from the outside and work inward — depending on the problem.',
			es: 'Comienza desde adentro y trabaja hacia afuera, o desde afuera hacia adentro — dependiendo del problema.'
		},
		example: {
			nn: '\\lg(4x^2) = \\lg\\,4 + 2 \\cdot \\lg\\,x',
			en: '\\lg(4x^2) = \\lg\\,4 + 2 \\cdot \\lg\\,x',
			es: '\\lg(4x^2) = \\lg\\,4 + 2 \\cdot \\lg\\,x'
		},
		patternRecognition: {
			nn: 'Sjå etter uttrykk der fleire setningar kan brukast i rekkefølgje.',
			en: 'Look for expressions where multiple laws can be applied in sequence.',
			es: 'Busca expresiones donde se puedan aplicar varias leyes en secuencia.'
		},
		thinkAloud: {
			nn: '«Eg ser både eit produkt og ein eksponent. Eg tek produktsetningen først, så potenssetningen.»',
			en: '"I see both a product and an exponent. I\'ll use the product rule first, then the power rule."',
			es: '"Veo tanto un producto como un exponente. Usaré la regla del producto primero, luego la de la potencia."'
		},
		workedSteps: [
			{
				explanation: { nn: 'Start med uttrykket', en: 'Start with the expression', es: 'Empieza con la expresión' },
				latex: '\\lg\\left(\\frac{x^3}{y}\\right)'
			},
			{
				explanation: { nn: 'Kvotientsetningen', en: 'Quotient rule', es: 'Regla del cociente' },
				latex: '\\lg(x^3) - \\lg\\,y'
			},
			{
				explanation: { nn: 'Potenssetningen', en: 'Power rule', es: 'Regla de la potencia' },
				latex: '3 \\cdot \\lg\\,x - \\lg\\,y'
			}
		],
		mnemonic: {
			nn: '«Bruk setningane som verktøy — éin om gongen»',
			en: '"Use the laws as tools — one at a time"',
			es: '"Usa las leyes como herramientas — una a la vez"'
		}
	},

	log_equation: {
		title: {
			nn: 'Logaritmiske likningar',
			en: 'Logarithmic Equations',
			es: 'Ecuaciones Logarítmicas'
		},
		intro: {
			nn: 'Likningar der den ukjende står inne i ein logaritme.',
			en: 'Equations where the unknown is inside a logarithm.',
			es: 'Ecuaciones donde la incógnita está dentro de un logaritmo.'
		},
		formula: '\\log_b\\,x = y \\iff x = b^y',
		ruleText: {
			nn: 'Bruk definisjonen av logaritme for å «ta bort» logaritmen og få ei vanleg likning.',
			en: 'Use the definition of logarithm to "remove" the log and get a regular equation.',
			es: 'Usa la definición de logaritmo para "eliminar" el log y obtener una ecuación normal.'
		},
		example: {
			nn: '\\lg\\,x = 3 \\implies x = 10^3 = 1000',
			en: '\\lg\\,x = 3 \\implies x = 10^3 = 1000',
			es: '\\lg\\,x = 3 \\implies x = 10^3 = 1000'
		},
		patternRecognition: {
			nn: 'Sjå etter lg(...) = tal. Bruk evt. setningane først for å samle alt i éin logaritme.',
			en: 'Look for lg(...) = number. If needed, use the laws first to combine into a single log.',
			es: 'Busca lg(...) = número. Si es necesario, usa las leyes primero para combinar en un solo log.'
		},
		thinkAloud: {
			nn: '«Eg vil ha éin logaritme åleine på eine sida. Så brukar eg definisjonen baklengs.»',
			en: '"I want a single log alone on one side. Then I\'ll use the definition in reverse."',
			es: '"Quiero un solo logaritmo solo en un lado. Luego usaré la definición al revés."'
		},
		workedSteps: [
			{
				explanation: { nn: 'Start med likninga', en: 'Start with the equation', es: 'Empieza con la ecuación' },
				latex: '\\lg(x + 3) = 2'
			},
			{
				explanation: { nn: 'Bruk definisjonen', en: 'Use the definition', es: 'Usa la definición' },
				latex: 'x + 3 = 10^2 = 100'
			},
			{
				explanation: { nn: 'Løys for x', en: 'Solve for x', es: 'Resuelve para x' },
				latex: 'x = 97'
			}
		],
		mnemonic: {
			nn: '«Log bort → eksponent opp»',
			en: '"Log away → exponent up"',
			es: '"Log fuera → exponente arriba"'
		}
	},

	exp_equation: {
		title: {
			nn: 'Eksponentiallikningar',
			en: 'Exponential Equations',
			es: 'Ecuaciones Exponenciales'
		},
		intro: {
			nn: 'Likningar der den ukjende står i eksponenten.',
			en: 'Equations where the unknown is in the exponent.',
			es: 'Ecuaciones donde la incógnita está en el exponente.'
		},
		formula: 'b^x = c \\iff x = \\frac{\\log\\,c}{\\log\\,b}',
		ruleText: {
			nn: 'Ta logaritmen på begge sider for å «ta ned» den ukjende frå eksponenten.',
			en: 'Take the logarithm of both sides to "bring down" the unknown from the exponent.',
			es: 'Toma el logaritmo de ambos lados para "bajar" la incógnita del exponente.'
		},
		example: {
			nn: '5^x = 20 \\implies x \\cdot \\lg\\,5 = \\lg\\,20 \\implies x = \\frac{\\lg\\,20}{\\lg\\,5}',
			en: '5^x = 20 \\implies x \\cdot \\lg\\,5 = \\lg\\,20 \\implies x = \\frac{\\lg\\,20}{\\lg\\,5}',
			es: '5^x = 20 \\implies x \\cdot \\lg\\,5 = \\lg\\,20 \\implies x = \\frac{\\lg\\,20}{\\lg\\,5}'
		},
		patternRecognition: {
			nn: 'Sjå etter den ukjende oppe i ein eksponent. Prøv først om svaret er «eksakt» (t.d. 2³ = 8).',
			en: 'Look for the unknown up in an exponent. First check if the answer is "exact" (e.g. 2³ = 8).',
			es: 'Busca la incógnita en un exponente. Primero verifica si la respuesta es "exacta" (ej. 2³ = 8).'
		},
		thinkAloud: {
			nn: '«x sit i eksponenten. Eg tek lg (eller ln) på begge sider, så kan eg bruke potenssetningen til å flytte x ned.»',
			en: '"x is in the exponent. I\'ll take lg (or ln) of both sides, then use the power rule to bring x down."',
			es: '"x está en el exponente. Tomaré lg (o ln) de ambos lados, luego usaré la regla de la potencia para bajar x."'
		},
		workedSteps: [
			{
				explanation: { nn: 'Start med likninga', en: 'Start with the equation', es: 'Empieza con la ecuación' },
				latex: '3^x = 15'
			},
			{
				explanation: { nn: 'Ta lg på begge sider', en: 'Take lg of both sides', es: 'Toma lg de ambos lados' },
				latex: '\\lg(3^x) = \\lg\\,15'
			},
			{
				explanation: { nn: 'Potenssetningen', en: 'Power rule', es: 'Regla de la potencia' },
				latex: 'x \\cdot \\lg\\,3 = \\lg\\,15'
			},
			{
				explanation: { nn: 'Løys for x', en: 'Solve for x', es: 'Resuelve para x' },
				latex: 'x = \\frac{\\lg\\,15}{\\lg\\,3}'
			}
		],
		mnemonic: {
			nn: '«Log på begge sider — eksponenten hoppar ned»',
			en: '"Log both sides — exponent hops down"',
			es: '"Log ambos lados — el exponente baja"'
		}
	}
};
