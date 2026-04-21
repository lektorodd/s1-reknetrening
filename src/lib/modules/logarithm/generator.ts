// Problem generator for logarithm rules
// 6 topics: product, quotient, power, simplify, log equations, exp equations
// Uses lg (log₁₀) and ln (logₑ) matching Norwegian S1 curriculum
// Each problem has 3-5 structured steps for meaningful backward fading

import type { LogProblem, LogTopicId, StepEntry } from './types';

// ── Helpers ──

function rand(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

/** Pick lg or ln */
function pickBase(): 'lg' | 'ln' {
	return pick(['lg', 'ln']);
}

/** LaTeX command for log base */
function logCmd(base: 'lg' | 'ln'): string {
	return base === 'ln' ? '\\ln' : '\\lg';
}

// ── Product Rule: lg(a·b) = lg a + lg b ──

function generateLogProductProblem(lvl: number): Omit<LogProblem, 'id'> {
	const base = pickBase();
	const log = logCmd(base);
	let q = '', structuredSteps: StepEntry[] = [];

	if (lvl === 1) {
		const a = rand(2, 5);
		const b = rand(2, 9);
		q = `${log}(${a} \\cdot ${b})`;
		structuredSteps = [
			{ label: 'Identifiser produkt', latex: `${log}(${a} \\cdot ${b})` },
			{ label: 'Produktsetningen', latex: `${log}\\,${a} + ${log}\\,${b}` },
			{ label: 'Kontroller', latex: `${log}\\,${a * b} = ${log}\\,${a} + ${log}\\,${b}` }
		];
	} else if (lvl === 2) {
		const a = rand(2, 6);
		q = `${log}(${a}x)`;
		structuredSteps = [
			{ label: 'Identifiser produkt', latex: `${log}(${a} \\cdot x)` },
			{ label: 'Produktsetningen', latex: `${log}\\,${a} + ${log}\\,x` },
			{ label: 'Svar', latex: `${log}\\,${a} + ${log}\\,x` }
		];
	} else if (lvl === 3) {
		const a = rand(2, 5);
		q = `${log}(${a}xy)`;
		structuredSteps = [
			{ label: 'Identifiser faktorar', latex: `${log}(${a} \\cdot x \\cdot y)` },
			{ label: 'Produktsetningen (1)', latex: `${log}\\,${a} + ${log}(x \\cdot y)` },
			{ label: 'Produktsetningen (2)', latex: `${log}\\,${a} + ${log}\\,x + ${log}\\,y` }
		];
	} else if (lvl === 4) {
		const a = rand(2, 4);
		const b = rand(2, 5);
		const product = a * b;
		q = `\\text{Skriv } ${log}\\,${product} \\text{ som ein sum av logaritmar}`;
		structuredSteps = [
			{ label: 'Faktoriser', latex: `${product} = ${a} \\cdot ${b}` },
			{ label: 'Sett inn', latex: `${log}(${a} \\cdot ${b})` },
			{ label: 'Produktsetningen', latex: `${log}\\,${a} + ${log}\\,${b}` }
		];
	} else {
		const a = rand(2, 4);
		const b = rand(2, 5);
		q = `${log}(${a}x \\cdot ${b}y)`;
		structuredSteps = [
			{ label: 'Identifiser faktorar', latex: `${log}(${a} \\cdot x \\cdot ${b} \\cdot y)` },
			{ label: 'Forenkle konstantar', latex: `${log}(${a * b} \\cdot x \\cdot y)` },
			{ label: 'Produktsetningen', latex: `${log}\\,${a * b} + ${log}(x \\cdot y)` },
			{ label: 'Produktsetningen att', latex: `${log}\\,${a * b} + ${log}\\,x + ${log}\\,y` }
		];
	}

	const lastStep = structuredSteps[structuredSteps.length - 1];
	return {
		topic: 'log_product',
		level: lvl,
		type: base,
		q,
		a: `$$ ${lastStep.latex} $$`,
		steps: structuredSteps.map(s => `$$${s.latex}$$`).join('\n'),
		structuredSteps,
		hint: 'Produktsetningen: log(a·b) = log a + log b'
	};
}

// ── Quotient Rule: lg(a/b) = lg a − lg b ──

function generateLogQuotientProblem(lvl: number): Omit<LogProblem, 'id'> {
	const base = pickBase();
	const log = logCmd(base);
	let q = '', structuredSteps: StepEntry[] = [];

	if (lvl === 1) {
		const a = rand(4, 20);
		const b = rand(2, 5);
		q = `${log}\\left(\\frac{${a}}{${b}}\\right)`;
		structuredSteps = [
			{ label: 'Identifiser brøk', latex: `${log}\\left(\\frac{${a}}{${b}}\\right)` },
			{ label: 'Kvotientsetningen', latex: `${log}\\,${a} - ${log}\\,${b}` },
			{ label: 'Kontroller', latex: `${log}\\,${a} - ${log}\\,${b}` }
		];
	} else if (lvl === 2) {
		const b = rand(2, 6);
		q = `${log}\\left(\\frac{x}{${b}}\\right)`;
		structuredSteps = [
			{ label: 'Identifiser brøk', latex: `${log}\\left(\\frac{x}{${b}}\\right)` },
			{ label: 'Kvotientsetningen', latex: `${log}\\,x - ${log}\\,${b}` },
			{ label: 'Svar', latex: `${log}\\,x - ${log}\\,${b}` }
		];
	} else if (lvl === 3) {
		const n = rand(2, 3);
		q = `${log}\\left(\\frac{x^{${n}}}{y}\\right)`;
		structuredSteps = [
			{ label: 'Identifiser brøk', latex: `${log}\\left(\\frac{x^{${n}}}{y}\\right)` },
			{ label: 'Kvotientsetningen', latex: `${log}\\,x^{${n}} - ${log}\\,y` },
			{ label: 'Potenssetningen', latex: `${n}${log}\\,x - ${log}\\,y` }
		];
	} else if (lvl === 4) {
		const a = rand(2, 8);
		const b = rand(2, 5);
		q = `\\text{Skriv som éin logaritme: } ${log}\\,${a} - ${log}\\,${b}`;
		structuredSteps = [
			{ label: 'Gjenkjenn differanse', latex: `${log}\\,${a} - ${log}\\,${b}` },
			{ label: 'Kvotientsetningen baklengs', latex: `${log}\\left(\\frac{${a}}{${b}}\\right)` },
			{ label: 'Kontroller', latex: `${log}\\left(\\frac{${a}}{${b}}\\right) = ${log}\\,${a} - ${log}\\,${b}` }
		];
	} else {
		q = `${log}\\left(\\frac{xy}{z}\\right)`;
		structuredSteps = [
			{ label: 'Identifiser brøk', latex: `${log}\\left(\\frac{xy}{z}\\right)` },
			{ label: 'Kvotientsetningen', latex: `${log}(xy) - ${log}\\,z` },
			{ label: 'Produktsetningen', latex: `${log}\\,x + ${log}\\,y - ${log}\\,z` }
		];
	}

	const lastStep = structuredSteps[structuredSteps.length - 1];
	return {
		topic: 'log_quotient',
		level: lvl,
		type: base,
		q,
		a: `$$ ${lastStep.latex} $$`,
		steps: structuredSteps.map(s => `$$${s.latex}$$`).join('\n'),
		structuredSteps,
		hint: 'Kvotientsetningen: log(a/b) = log a − log b'
	};
}

// ── Power Rule: lg(aⁿ) = n·lg a ──

function generateLogPowerProblem(lvl: number): Omit<LogProblem, 'id'> {
	const base = pickBase();
	const log = logCmd(base);
	let q = '', structuredSteps: StepEntry[] = [];

	if (lvl === 1) {
		const a = rand(2, 5);
		const n = rand(2, 4);
		q = `${log}(${a}^{${n}})`;
		structuredSteps = [
			{ label: 'Identifiser potens', latex: `${log}(${a}^{${n}})` },
			{ label: 'Potenssetningen', latex: `${n} \\cdot ${log}\\,${a}` },
			{ label: 'Svar', latex: `${n} \\cdot ${log}\\,${a}` }
		];
	} else if (lvl === 2) {
		const n = rand(2, 5);
		q = `${log}(x^{${n}})`;
		structuredSteps = [
			{ label: 'Identifiser potens', latex: `${log}(x^{${n}})` },
			{ label: 'Potenssetningen', latex: `${n} \\cdot ${log}\\,x` },
			{ label: 'Svar', latex: `${n} \\cdot ${log}\\,x` }
		];
	} else if (lvl === 3) {
		q = `${log}(\\sqrt{x})`;
		structuredSteps = [
			{ label: 'Identifiser rotuttrykk', latex: `${log}(\\sqrt{x})` },
			{ label: 'Omskriv rot til potens', latex: `${log}(x^{1/2})` },
			{ label: 'Potenssetningen', latex: `\\frac{1}{2} \\cdot ${log}\\,x` }
		];
	} else if (lvl === 4) {
		if (base === 'ln') {
			q = `\\ln(\\sqrt[3]{e^2})`;
			structuredSteps = [
				{ label: 'Omskriv rot', latex: `\\ln(e^{2/3})` },
				{ label: 'Potenssetningen', latex: `\\frac{2}{3} \\cdot \\ln\\,e` },
				{ label: 'ln e = 1', latex: `\\frac{2}{3}` }
			];
		} else {
			q = `\\lg(\\sqrt[3]{100})`;
			structuredSteps = [
				{ label: 'Omskriv rot', latex: `\\lg(100^{1/3})` },
				{ label: 'Potenssetningen', latex: `\\frac{1}{3} \\cdot \\lg\\,100` },
				{ label: 'lg 100 = 2', latex: `\\frac{2}{3}` }
			];
		}
	} else {
		const n = rand(2, 4);
		q = `${log}(x^{-${n}})`;
		structuredSteps = [
			{ label: 'Identifiser negativ eksponent', latex: `${log}(x^{-${n}})` },
			{ label: 'Potenssetningen', latex: `-${n} \\cdot ${log}\\,x` },
			{ label: 'Svar', latex: `-${n} \\cdot ${log}\\,x` }
		];
	}

	const lastStep = structuredSteps[structuredSteps.length - 1];
	return {
		topic: 'log_power',
		level: lvl,
		type: base,
		q,
		a: `$$ ${lastStep.latex} $$`,
		steps: structuredSteps.map(s => `$$${s.latex}$$`).join('\n'),
		structuredSteps,
		hint: 'Potenssetningen: log(aⁿ) = n·log a'
	};
}

// ── Simplify: combine multiple rules ──

function generateLogSimplifyProblem(lvl: number): Omit<LogProblem, 'id'> {
	const base = pickBase();
	const log = logCmd(base);
	let q = '', structuredSteps: StepEntry[] = [];

	if (lvl === 1) {
		const a = rand(2, 6);
		const n = rand(2, 3);
		q = `${log}(${a}x^{${n}})`;
		structuredSteps = [
			{ label: 'Identifiser produkt', latex: `${log}(${a} \\cdot x^{${n}})` },
			{ label: 'Produktsetningen', latex: `${log}\\,${a} + ${log}(x^{${n}})` },
			{ label: 'Potenssetningen på siste ledd', latex: `${log}\\,${a} + ${n} \\cdot ${log}\\,x` },
			{ label: 'Svar', latex: `${log}\\,${a} + ${n}${log}\\,x` }
		];
	} else if (lvl === 2) {
		const a = rand(2, 5);
		const n = rand(2, 3);
		q = `${log}\\left(\\frac{${a}x^{${n}}}{y}\\right)`;
		structuredSteps = [
			{ label: 'Identifiser brøk', latex: `${log}\\left(\\frac{${a}x^{${n}}}{y}\\right)` },
			{ label: 'Kvotientsetningen', latex: `${log}(${a}x^{${n}}) - ${log}\\,y` },
			{ label: 'Produktsetningen', latex: `${log}\\,${a} + ${log}(x^{${n}}) - ${log}\\,y` },
			{ label: 'Potenssetningen', latex: `${log}\\,${a} + ${n}${log}\\,x - ${log}\\,y` }
		];
	} else if (lvl === 3) {
		const a = rand(2, 5);
		const n = rand(2, 3);
		q = `\\text{Skriv som éin logaritme: } ${n} \\cdot ${log}\\,x + ${log}\\,${a} - ${log}\\,y`;
		structuredSteps = [
			{ label: 'Potenssetningen baklengs', latex: `${log}(x^{${n}}) + ${log}\\,${a} - ${log}\\,y` },
			{ label: 'Produktsetningen baklengs', latex: `${log}(${a}x^{${n}}) - ${log}\\,y` },
			{ label: 'Kvotientsetningen baklengs', latex: `${log}\\left(\\frac{${a}x^{${n}}}{y}\\right)` }
		];
	} else if (lvl === 4) {
		const n = rand(2, 4);
		q = `${log}(x^{${n}} \\sqrt{y})`;
		structuredSteps = [
			{ label: 'Identifiser produkt', latex: `${log}(x^{${n}} \\cdot y^{1/2})` },
			{ label: 'Produktsetningen', latex: `${log}(x^{${n}}) + ${log}(y^{1/2})` },
			{ label: 'Potenssetningen (x)', latex: `${n} \\cdot ${log}\\,x + ${log}(y^{1/2})` },
			{ label: 'Potenssetningen (y)', latex: `${n} \\cdot ${log}\\,x + \\frac{1}{2} \\cdot ${log}\\,y` }
		];
	} else {
		q = `\\text{Skriv som éin logaritme: } 2 \\cdot ${log}(x+1) - \\frac{1}{2} \\cdot ${log}(x^2+1)`;
		structuredSteps = [
			{ label: 'Potenssetningen (1)', latex: `${log}((x+1)^2) - \\frac{1}{2} \\cdot ${log}(x^2+1)` },
			{ label: 'Potenssetningen (2)', latex: `${log}((x+1)^2) - ${log}((x^2+1)^{1/2})` },
			{ label: 'Omskriv rot', latex: `${log}((x+1)^2) - ${log}(\\sqrt{x^2+1})` },
			{ label: 'Kvotientsetningen baklengs', latex: `${log}\\left(\\frac{(x+1)^2}{\\sqrt{x^2+1}}\\right)` }
		];
	}

	const lastStep = structuredSteps[structuredSteps.length - 1];
	return {
		topic: 'log_simplify',
		level: lvl,
		type: base,
		q,
		a: `$$ ${lastStep.latex} $$`,
		steps: structuredSteps.map(s => `$$${s.latex}$$`).join('\n'),
		structuredSteps,
		hint: 'Bruk fleire setningar saman: produkt, kvotient, potens.'
	};
}

// ── Log Equations (enhanced: use log laws before definition) ──

function generateLogEquationProblem(lvl: number): Omit<LogProblem, 'id'> {
	const base = pickBase();
	const log = logCmd(base);
	let q = '', structuredSteps: StepEntry[] = [];

	if (lvl === 1) {
		// 2·lg(x+3) = 2  →  divide by 2, then definition  →  4 steps
		const b = rand(1, 5);
		const coeff = rand(2, 3);
		const rhs = coeff;
		q = `${coeff} \\cdot ${log}(x + ${b}) = ${rhs}`;
		if (base === 'lg') {
			const answer = 10 - b;
			structuredSteps = [
				{ label: 'Del begge sider med ' + coeff, latex: `${log}(x + ${b}) = \\frac{${rhs}}{${coeff}} = 1` },
				{ label: 'Definisjon av logaritme', latex: `x + ${b} = 10^1` },
				{ label: 'Rekn ut høgresida', latex: `x + ${b} = 10` },
				{ label: 'Løys for x', latex: `x = 10 - ${b} = ${answer}` }
			];
		} else {
			structuredSteps = [
				{ label: 'Del begge sider med ' + coeff, latex: `${log}(x + ${b}) = \\frac{${rhs}}{${coeff}} = 1` },
				{ label: 'Definisjon av logaritme', latex: `x + ${b} = e^1` },
				{ label: 'Forenkle', latex: `x + ${b} = e` },
				{ label: 'Løys for x', latex: `x = e - ${b}` }
			];
		}
	} else if (lvl === 2) {
		// lg(x²) + lg(3) = 2  →  power + product + definition  →  5 steps
		const a = rand(2, 5);
		const n = 2;
		q = `${log}(x^{${n}}) + ${log}\\,${a} = 2`;
		if (base === 'lg') {
			const rhs = 100;
			structuredSteps = [
				{ label: 'Potenssetningen', latex: `${n}${log}\\,x + ${log}\\,${a} = 2` },
				{ label: 'Alt. bruk produktsetningen', latex: `${log}(${a}x^{${n}}) = 2` },
				{ label: 'Definisjon', latex: `${a}x^{${n}} = 10^2 = ${rhs}` },
				{ label: 'Isoler x²', latex: `x^{${n}} = \\frac{${rhs}}{${a}}` },
				{ label: 'Løys for x', latex: `x = \\sqrt{\\frac{${rhs}}{${a}}}` }
			];
		} else {
			structuredSteps = [
				{ label: 'Potenssetningen', latex: `${n}${log}\\,x + ${log}\\,${a} = 2` },
				{ label: 'Alt. bruk produktsetningen', latex: `${log}(${a}x^{${n}}) = 2` },
				{ label: 'Definisjon', latex: `${a}x^{${n}} = e^2` },
				{ label: 'Isoler x²', latex: `x^{${n}} = \\frac{e^2}{${a}}` },
				{ label: 'Løys for x', latex: `x = \\sqrt{\\frac{e^2}{${a}}}` }
			];
		}
	} else if (lvl === 3) {
		// 2·lg x - lg y + lg 5 = 1  →  power + quotient + product  →  5 steps
		const a = rand(2, 6);
		const n = 2;
		q = `${n} \\cdot ${log}\\,x - ${log}\\,${a} = 1`;
		if (base === 'lg') {
			const answer = 10 * a;
			structuredSteps = [
				{ label: 'Potenssetningen', latex: `${log}(x^{${n}}) - ${log}\\,${a} = 1` },
				{ label: 'Kvotientsetningen', latex: `${log}\\left(\\frac{x^{${n}}}{${a}}\\right) = 1` },
				{ label: 'Definisjon', latex: `\\frac{x^{${n}}}{${a}} = 10` },
				{ label: `Gong med ${a}`, latex: `x^{${n}} = ${10 * a}` },
				{ label: 'Løys for x', latex: `x = \\sqrt{${10 * a}}` }
			];
		} else {
			structuredSteps = [
				{ label: 'Potenssetningen', latex: `${log}(x^{${n}}) - ${log}\\,${a} = 1` },
				{ label: 'Kvotientsetningen', latex: `${log}\\left(\\frac{x^{${n}}}{${a}}\\right) = 1` },
				{ label: 'Definisjon', latex: `\\frac{x^{${n}}}{${a}} = e` },
				{ label: `Gong med ${a}`, latex: `x^{${n}} = ${a}e` },
				{ label: 'Løys for x', latex: `x = \\sqrt{${a}e}` }
			];
		}
	} else if (lvl === 4) {
		// lg(x) + lg(x−b) = 1  →  product rule + quadratic → 6 steps
		const b = rand(2, 5);
		q = `${log}\\,x + ${log}(x - ${b}) = 1`;
		if (base === 'lg') {
			const D = b * b + 40;
			const sqrtD = Math.sqrt(D);
			const x1 = (b + sqrtD) / 2;
			structuredSteps = [
				{ label: 'Produktsetningen', latex: `${log}(x(x - ${b})) = 1` },
				{ label: 'Definisjon', latex: `x(x - ${b}) = 10` },
				{ label: 'Utvid', latex: `x^2 - ${b}x = 10` },
				{ label: 'Omform', latex: `x^2 - ${b}x - 10 = 0` },
				{ label: 'abc-formelen', latex: `x = \\frac{${b} \\pm \\sqrt{${b}^2 + 40}}{2} = \\frac{${b} \\pm \\sqrt{${D}}}{2}` },
				{ label: `Domene: x > ${b}`, latex: Number.isInteger(x1)
					? `x = \\frac{${b} + \\sqrt{${D}}}{2} = ${x1}`
					: `x = \\frac{${b} + \\sqrt{${D}}}{2} \\approx ${x1.toFixed(2)}`
				}
			];
		} else {
			structuredSteps = [
				{ label: 'Produktsetningen', latex: `${log}(x(x - ${b})) = 1` },
				{ label: 'Definisjon', latex: `x(x - ${b}) = e` },
				{ label: 'Utvid', latex: `x^2 - ${b}x = e` },
				{ label: 'Omform', latex: `x^2 - ${b}x - e = 0` },
				{ label: 'abc-formelen', latex: `x = \\frac{${b} \\pm \\sqrt{${b}^2 + 4e}}{2}` },
				{ label: `Domene: x > ${b}`, latex: `x = \\frac{${b} + \\sqrt{${b}^2 + 4e}}{2}` }
			];
		}
	} else {
		// 2·lg x − lg(x+b) = 0  →  power + quotient + definition → 7 steps
		const b = rand(2, 8);
		const D5 = 1 + 4 * b;
		const sqrtD5 = Math.sqrt(D5);
		const x1_5 = (1 + sqrtD5) / 2;
		q = `2 \\cdot ${log}\\,x - ${log}(x + ${b}) = 0`;
		structuredSteps = [
			{ label: 'Potenssetningen', latex: `${log}(x^2) - ${log}(x + ${b}) = 0` },
			{ label: 'Kvotientsetningen', latex: `${log}\\left(\\frac{x^2}{x + ${b}}\\right) = 0` },
			{ label: 'Definisjon (log = 0 → argument = 1)', latex: `\\frac{x^2}{x + ${b}} = 1` },
			{ label: `Gong med (x + ${b})`, latex: `x^2 = x + ${b}` },
			{ label: 'Omform', latex: `x^2 - x - ${b} = 0` },
			{ label: 'abc-formelen', latex: `x = \\frac{1 \\pm \\sqrt{1 + ${4 * b}}}{2} = \\frac{1 \\pm \\sqrt{${D5}}}{2}` },
			{ label: 'Domene: x > 0', latex: Number.isInteger(x1_5)
				? `x = \\frac{1 + \\sqrt{${D5}}}{2} = ${x1_5}`
				: `x = \\frac{1 + \\sqrt{${D5}}}{2} \\approx ${x1_5.toFixed(2)}`
			}
		];
	}

	const lastStep = structuredSteps[structuredSteps.length - 1];
	return {
		topic: 'log_equation',
		level: lvl,
		type: base,
		q,
		a: `$$ ${lastStep.latex} $$`,
		steps: structuredSteps.map(s => `$$${s.latex}$$`).join('\n'),
		structuredSteps,
		hint: 'Bruk logaritmesetningane først, så definisjonen: log_b(x) = y ⟺ x = b^y'
	};
}

// ── Exponential Equations ──

function generateExpEquationProblem(lvl: number): Omit<LogProblem, 'id'> {
	const base = pickBase();
	const log = logCmd(base);
	let q = '', structuredSteps: StepEntry[] = [];

	if (lvl === 1) {
		const b = pick([2, 3, 5]);
		const n = rand(2, 4);
		const result = Math.pow(b, n);
		q = `${b}^x = ${result}`;
		structuredSteps = [
			{ label: 'Gjenkjenn potens', latex: `${b}^x = ${result}` },
			{ label: 'Skriv høgresida som potens', latex: `${b}^x = ${b}^{${n}}` },
			{ label: 'Samanlikn eksponentar', latex: `x = ${n}` }
		];
	} else if (lvl === 2) {
		const b = pick([2, 3, 4, 5]);
		const n = rand(2, 5);
		const result = Math.pow(b, n);
		q = `${b}^x = ${result}`;
		structuredSteps = [
			{ label: 'Gjenkjenn potens', latex: `${b}^x = ${result}` },
			{ label: 'Skriv høgresida som potens', latex: `${b}^x = ${b}^{${n}}` },
			{ label: 'Samanlikn eksponentar', latex: `x = ${n}` }
		];
	} else if (lvl === 3) {
		const b = rand(2, 7);
		const c = rand(8, 50);
		q = `${b}^x = ${c}`;
		structuredSteps = [
			{ label: 'Ta logaritmen på begge sider', latex: `${log}(${b}^x) = ${log}\\,${c}` },
			{ label: 'Potenssetningen', latex: `x \\cdot ${log}\\,${b} = ${log}\\,${c}` },
			{ label: 'Isoler x', latex: `x = \\frac{${log}\\,${c}}{${log}\\,${b}}` }
		];
	} else if (lvl === 4) {
		const a = rand(2, 4);
		const c = rand(3, 10);
		q = `e^{${a}x} = ${c}`;
		structuredSteps = [
			{ label: 'Ta ln på begge sider', latex: `\\ln(e^{${a}x}) = \\ln\\,${c}` },
			{ label: 'Potenssetningen + ln e = 1', latex: `${a}x \\cdot \\ln\\,e = \\ln\\,${c}` },
			{ label: 'Forenkle (ln e = 1)', latex: `${a}x = \\ln\\,${c}` },
			{ label: 'Løys for x', latex: `x = \\frac{\\ln\\,${c}}{${a}}` }
		];
	} else {
		const coeff = rand(2, 4);
		const b = rand(2, 5);
		const k = rand(1, 2);
		const result = coeff * Math.pow(b, k + 1);
		q = `${coeff} \\cdot ${b}^{x+${k}} = ${result}`;
		const divided = result / coeff;
		structuredSteps = [
			{ label: 'Isoler potensen', latex: `${b}^{x+${k}} = \\frac{${result}}{${coeff}} = ${divided}` },
			{ label: 'Ta logaritmen', latex: `${log}(${b}^{x+${k}}) = ${log}\\,${divided}` },
			{ label: 'Potenssetningen', latex: `(x+${k}) \\cdot ${log}\\,${b} = ${log}\\,${divided}` },
			{ label: `Isoler (x+${k})`, latex: `x + ${k} = \\frac{${log}\\,${divided}}{${log}\\,${b}}` },
			{ label: 'Løys for x', latex: `x = \\frac{${log}\\,${divided}}{${log}\\,${b}} - ${k}` }
		];
	}

	const lastStep = structuredSteps[structuredSteps.length - 1];
	return {
		topic: 'exp_equation',
		level: lvl,
		type: base,
		q,
		a: `$$ ${lastStep.latex} $$`,
		steps: structuredSteps.map(s => `$$${s.latex}$$`).join('\n'),
		structuredSteps,
		hint: 'Ta logaritmen på begge sider for å få ned eksponenten.'
	};
}

// ── Public API ──

export function generateSingleLogProblem(
	topic: LogTopicId,
	lvl: number
): Omit<LogProblem, 'id'> | null {
	switch (topic) {
		case 'log_product':
			return generateLogProductProblem(lvl);
		case 'log_quotient':
			return generateLogQuotientProblem(lvl);
		case 'log_power':
			return generateLogPowerProblem(lvl);
		case 'log_simplify':
			return generateLogSimplifyProblem(lvl);
		case 'log_equation':
			return generateLogEquationProblem(lvl);
		case 'exp_equation':
			return generateExpEquationProblem(lvl);
	}
}

export function generateLogProblemBank(): LogProblem[] {
	let id = 5000; // Offset from derivative IDs (1000–2000 range)
	const topics: LogTopicId[] = [
		'log_product', 'log_quotient', 'log_power',
		'log_simplify', 'log_equation', 'exp_equation'
	];
	const levels = [1, 2, 3, 4, 5];
	const bank: LogProblem[] = [];

	for (const topic of topics) {
		for (const lvl of levels) {
			// 8 problems per (topic × level) — same density as derivative module
			for (let i = 0; i < 8; i++) {
				const prob = generateSingleLogProblem(topic, lvl);
				if (prob) {
					bank.push({ ...prob, id: id++ });
				}
			}
		}
	}

	return bank;
}

// Re-export types
export type { LogProblem, LogTopicId } from './types';
