// Self-explanation prompts for the logarithm module
// After solving, students get a reflection question to deepen understanding

export interface SelfExplanation {
	question: Record<string, string>;
	options: { text: Record<string, string>; correct: boolean }[];
}

export const LOG_SELF_EXPLANATIONS: Record<string, SelfExplanation[]> = {
	log_product: [
		{
			question: {
				nn: 'Kvifor kan vi skrive lg(ab) som lg a + lg b?',
				en: 'Why can we write lg(ab) as lg a + lg b?',
				es: '¿Por qué podemos escribir lg(ab) como lg a + lg b?'
			},
			options: [
				{
					text: {
						nn: 'Fordi logaritmen gjer multiplikasjon om til addisjon',
						en: 'Because logarithms turn multiplication into addition',
						es: 'Porque los logaritmos convierten la multiplicación en suma'
					},
					correct: true
				},
				{
					text: {
						nn: 'Fordi vi berre deler uttrykket i to delar',
						en: 'Because we just split the expression in two',
						es: 'Porque simplemente dividimos la expresión en dos'
					},
					correct: false
				},
				{
					text: {
						nn: 'Fordi lg alltid kan fordelast',
						en: 'Because lg can always be distributed',
						es: 'Porque lg siempre se puede distribuir'
					},
					correct: false
				}
			]
		}
	],
	log_quotient: [
		{
			question: {
				nn: 'Kva skjer med divisjon inne i ein logaritme?',
				en: 'What happens to division inside a logarithm?',
				es: '¿Qué pasa con la división dentro de un logaritmo?'
			},
			options: [
				{
					text: {
						nn: 'Den blir til subtraksjon',
						en: 'It becomes subtraction',
						es: 'Se convierte en resta'
					},
					correct: true
				},
				{
					text: {
						nn: 'Den blir til addisjon',
						en: 'It becomes addition',
						es: 'Se convierte en suma'
					},
					correct: false
				},
				{
					text: {
						nn: 'Den forsvinn',
						en: 'It disappears',
						es: 'Desaparece'
					},
					correct: false
				}
			]
		}
	],
	log_power: [
		{
			question: {
				nn: 'Korleis handterer vi ein eksponent inne i ein logaritme?',
				en: 'How do we handle an exponent inside a logarithm?',
				es: '¿Cómo manejamos un exponente dentro de un logaritmo?'
			},
			options: [
				{
					text: {
						nn: 'Eksponenten kan flyttast ned som ein faktor framfor',
						en: 'The exponent can be moved down as a factor in front',
						es: 'El exponente se puede mover abajo como factor al frente'
					},
					correct: true
				},
				{
					text: {
						nn: 'Vi tek kvadratrota av uttrykket',
						en: 'We take the square root of the expression',
						es: 'Tomamos la raíz cuadrada de la expresión'
					},
					correct: false
				},
				{
					text: {
						nn: 'Eksponenten endrar grunntalet til logaritmen',
						en: 'The exponent changes the base of the logarithm',
						es: 'El exponente cambia la base del logaritmo'
					},
					correct: false
				}
			]
		}
	],
	log_simplify: [
		{
			question: {
				nn: 'Kva gjer du når du skal forenkle eit samansett logaritmeuttrykk?',
				en: 'What do you do when simplifying a complex logarithmic expression?',
				es: '¿Qué haces cuando simplificas una expresión logarítmica compleja?'
			},
			options: [
				{
					text: {
						nn: 'Bruk setningane éi om gongen: produkt, kvotient, potens',
						en: 'Apply the laws one at a time: product, quotient, power',
						es: 'Aplica las leyes una a la vez: producto, cociente, potencia'
					},
					correct: true
				},
				{
					text: {
						nn: 'Rekn ut tala inni logaritmen først',
						en: 'Calculate the numbers inside the logarithm first',
						es: 'Calcula los números dentro del logaritmo primero'
					},
					correct: false
				}
			]
		}
	],
	log_equation: [
		{
			question: {
				nn: 'Korleis «fjernar» du ein logaritme i ei likning?',
				en: 'How do you "remove" a logarithm in an equation?',
				es: '¿Cómo "eliminas" un logaritmo en una ecuación?'
			},
			options: [
				{
					text: {
						nn: 'Bruk definisjonen: lg x = y betyr x = 10^y',
						en: 'Use the definition: lg x = y means x = 10^y',
						es: 'Usa la definición: lg x = y significa x = 10^y'
					},
					correct: true
				},
				{
					text: {
						nn: 'Del begge sider på lg',
						en: 'Divide both sides by lg',
						es: 'Divide ambos lados entre lg'
					},
					correct: false
				}
			]
		}
	],
	exp_equation: [
		{
			question: {
				nn: 'Korleis får du ned ein ukjend eksponent?',
				en: 'How do you bring down an unknown exponent?',
				es: '¿Cómo bajas un exponente desconocido?'
			},
			options: [
				{
					text: {
						nn: 'Ta logaritmen på begge sider og bruk potenssetningen',
						en: 'Take the logarithm of both sides and use the power rule',
						es: 'Toma el logaritmo de ambos lados y usa la regla de la potencia'
					},
					correct: true
				},
				{
					text: {
						nn: 'Ta kvadratrota av begge sider',
						en: 'Take the square root of both sides',
						es: 'Toma la raíz cuadrada de ambos lados'
					},
					correct: false
				},
				{
					text: {
						nn: 'Del begge sider på grunntalet',
						en: 'Divide both sides by the base',
						es: 'Divide ambos lados entre la base'
					},
					correct: false
				}
			]
		}
	]
};
