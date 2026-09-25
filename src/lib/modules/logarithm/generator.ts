// Problem generator for logarithm rules
// 6 topics: product, quotient, power, simplify, log equations, exp equations
// Uses lg (log₁₀) and ln (logₑ) matching Norwegian S1 curriculum
// Each problem has 3-5 structured steps for meaningful backward fading

import type { Problem, StepEntry } from '../types';
import { rngFor } from '../rng';

export type LogTopicId =
	| 'log_definition' | 'log_product' | 'log_quotient' | 'log_power'
	| 'log_simplify' | 'log_equation' | 'exp_equation';

/** Draft problem — id and moduleId are attached by generateBank(). */
type Draft = Omit<Problem, 'id' | 'moduleId'>;

/**
 * Active random source. generateBank() swaps in a seeded generator so that a
 * given problem id always yields the same coefficients.
 */
let rng: () => number = Math.random;

// ── Helpers ──

function rand(min: number, max: number): number {
	return Math.floor(rng() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
	return arr[Math.floor(rng() * arr.length)];
}

/** Pick lg or ln */
function pickBase(): 'lg' | 'ln' {
	return pick(['lg', 'ln']);
}

/** LaTeX command for log base */
function logCmd(base: 'lg' | 'ln'): string {
	return base === 'ln' ? '\\ln' : '\\lg';
}

function gcd(a: number, b: number): number {
	a = Math.abs(a);
	b = Math.abs(b);
	while (b) [a, b] = [b, a % b];
	return a || 1;
}

/** Split n into k²·m with m square-free: 200 → [10, 2]. */
function splitSquare(n: number): [number, number] {
	let k = 1;
	let m = n;
	for (let f = 2; f * f <= m; f++) {
		while (m % (f * f) === 0) {
			m /= f * f;
			k *= f;
		}
	}
	return [k, m];
}

/**
 * √(num/den) in simplest exact form, denominator rationalised:
 * √(100/2) → 5\sqrt{2}, √(100/3) → \frac{10\sqrt{3}}{3}, √(100/4) → 5.
 *
 * `prefix` goes in front of the root, for √(e²/a) = e·√(1/a).
 */
function sqrtFraction(num: number, den: number, prefix = ''): string {
	// √(num/den) = √(num·den) / den = k√m / den
	const [k, m] = splitSquare(num * den);
	const g = gcd(k, den);
	const top = k / g;
	const bottom = den / g;
	const root = m === 1 ? '' : `\\sqrt{${m}}`;
	const coef = top === 1 && (root || prefix) ? '' : `${top}`;
	const numerator = `${coef}${prefix}${root}` || '1';
	return bottom === 1 ? numerator : `\\frac{${numerator}}{${bottom}}`;
}

/**
 * (p + √D)/2 in simplest form, with a decimal when it is not whole:
 * (2 + √44)/2 → 1 + √11 ≈ 4{,}32, (1 + √9)/2 → 2.
 */
function halfRoot(p: number, D: number): string {
	const [k, m] = splitSquare(D);
	if (m === 1) return `${(p + k) / 2}`;
	const approx = `\\approx ${dec((p + Math.sqrt(D)) / 2)}`;
	const root = `${k === 1 ? '' : k}\\sqrt{${m}}`;
	if (p % 2 === 0 && k % 2 === 0) {
		const half = `${k / 2 === 1 ? '' : k / 2}\\sqrt{${m}}`;
		return `${p / 2} + ${half} ${approx}`;
	}
	return `\\frac{${p} + ${root}}{2} ${approx}`;
}

/** A decimal in Norwegian notation, for LaTeX: 2.81 → 2{,}81. */
function dec(x: number, digits = 2): string {
	return x.toFixed(digits).replace('.', '{,}');
}

// Every generator below takes the variant number as well as the level. The
// parameter a student would notice first follows the variant, so the eight
// problems at one level are eight different problems: drawn at random they
// often repeated, and three levels had no parameter at all — two problems,
// lg and ln, eight times over.
//
// No step restates the one before. A closing «Svar» that repeated the last
// line made «Siste steg» on the ladder give the whole answer away.

/** lg for the first half of the variants, ln for the second: both, always. */
function baseFor(variant: number): 'lg' | 'ln' {
	return variant < 4 ? 'lg' : 'ln';
}

/** A number and its log, as LaTeX: \lg\,5 */
const lgOf = (log: string, arg: string | number) => `${log}\\,${arg}`;

// ── Definition: lg x = y ⟺ 10^y = x ──
// What a logarithm *is*, before any rule for combining them.
// Lvl 1: a power of the base           lg 1000, ln e³
// Lvl 2: a negative exponent           lg 0,01, ln(1/e²)
// Lvl 3: the base to the log           10^{lg 7}, e^{2 ln 3}
// Lvl 4: an equation by definition     lg x = 3, ln x = 2
// Lvl 5: an estimate                   2 < lg 350 < 3

/** e to a power: e, e^{3}, e^{-2}. */
const ePow = (k: number) => (k === 1 ? 'e' : `e^{${k}}`);

/** 10^k written out: 1000, 0{,}01. */
function powerOfTen(k: number): string {
	if (k >= 0) return `${10 ** k}`;
	return `0{,}${'0'.repeat(-k - 1)}1`;
}

function generateLogDefinitionProblem(lvl: number, variant: number): Draft {
	const base = baseFor(variant);
	const log = logCmd(base);
	const n = 1 + (variant % 4);
	let q = '', structuredSteps: StepEntry[] = [];
	let instruction: string | undefined;

	if (lvl === 1) {
		if (base === 'lg') {
			q = lgOf(log, powerOfTen(n));
			structuredSteps = [
				{ label: 'Skriv som potens av 10', latex: `${log}(10^{${n}})` },
				{ label: 'Definisjonen', latex: `${n}` }
			];
		} else {
			q = `${log}(e^{${n + 1}})`;
			structuredSteps = [
				{ label: 'Definisjonen', latex: `${n + 1}` }
			];
		}
	} else if (lvl === 2) {
		if (base === 'lg') {
			q = lgOf(log, powerOfTen(-n));
			structuredSteps = [
				{ label: 'Skriv som potens av 10', latex: `${log}(10^{-${n}})` },
				{ label: 'Definisjonen', latex: `-${n}` }
			];
		} else {
			q = `${log}\\left(\\frac{1}{${ePow(n)}}\\right)`;
			structuredSteps = [
				{ label: 'Skriv som potens av e', latex: `${log}(e^{-${n}})` },
				{ label: 'Definisjonen', latex: `-${n}` }
			];
		}
	} else if (lvl === 3) {
		const a = 2 + variant;
		const b = base === 'lg' ? '10' : 'e';
		if (variant % 2 === 0) {
			q = `${b}^{${lgOf(log, a)}}`;
			structuredSteps = [
				{ label: 'Definisjonen', latex: `${a}` }
			];
		} else {
			q = `${b}^{2${lgOf(log, a)}}`;
			structuredSteps = [
				{ label: 'Potenssetninga', latex: `${b}^{${log}(${a}^{2})}` },
				{ label: 'Definisjonen', latex: `${a * a}` }
			];
		}
	} else if (lvl === 4) {
		instruction = 'Løys likninga.';
		const k = variant % 2 === 0 ? n : -n;
		if (base === 'lg') {
			q = `${log}\\,x = ${k}`;
			structuredSteps = [
				{ label: 'Definisjonen', latex: `x = 10^{${k}}` },
				{ label: 'Rekn ut', latex: `x = ${powerOfTen(k)}` }
			];
		} else {
			q = `${log}\\,x = ${k}`;
			structuredSteps = [
				{ label: 'Definisjonen', latex: `x = ${ePow(k)}` }
			];
		}
	} else {
		instruction = 'Finn dei to heile tala som logaritmen ligg mellom.';
		const values = [35, 350, 4800, 7, 620, 91, 12000, 2500];
		const N = values[variant];
		const k = Math.floor(Math.log10(N));
		q = `\\lg\\,${N}`;
		structuredSteps = [
			{ label: 'Nærmaste potensar av 10', latex: `10^{${k}} < ${N} < 10^{${k + 1}}` },
			{ label: 'lg veks med talet', latex: `${k} < \\lg\\,${N} < ${k + 1}` }
		];
		return finish('log_definition', lvl, 'lg', q, structuredSteps, 'Definisjonen: $\\lg x = y$ betyr at $10^y = x$.', instruction);
	}

	return finish('log_definition', lvl, base, q, structuredSteps, 'Definisjonen: $\\lg x = y$ betyr at $10^y = x$, og $\\ln x = y$ at $e^y = x$.', instruction);
}

// ── Product Rule: lg(a·b) = lg a + lg b ──
// Lvl 1: two numbers           lg(3·4)
// Lvl 2: a number and x        lg(5x)
// Lvl 3: three factors         lg(3xy)
// Lvl 4: factorise first       lg 12
// Lvl 5: constants to gather   lg(2x · 3y)

function generateLogProductProblem(lvl: number, variant: number): Draft {
	const base = lvl === 1 || lvl === 4 ? pickBase() : baseFor(variant);
	const log = logCmd(base);
	const k = 2 + (variant % 4); // 2..5, a different one per variant within a base
	let q = '', structuredSteps: StepEntry[] = [];

	if (lvl === 1) {
		const pairs = [[2, 3], [2, 5], [3, 4], [2, 7], [3, 5], [4, 5], [3, 7], [5, 6]];
		const [a, b] = pairs[variant];
		q = `${log}(${a} \\cdot ${b})`;
		structuredSteps = [
			{ label: 'Produktsetninga', latex: `${lgOf(log, a)} + ${lgOf(log, b)}` }
		];
	} else if (lvl === 2) {
		q = `${log}(${k}x)`;
		structuredSteps = [
			{ label: 'Kjenn att produktet', latex: `${log}(${k} \\cdot x)` },
			{ label: 'Produktsetninga', latex: `${lgOf(log, k)} + ${lgOf(log, 'x')}` }
		];
	} else if (lvl === 3) {
		q = `${log}(${k}xy)`;
		structuredSteps = [
			{ label: 'Produktsetninga', latex: `${lgOf(log, k)} + ${log}(xy)` },
			{ label: 'Produktsetninga att', latex: `${lgOf(log, k)} + ${lgOf(log, 'x')} + ${lgOf(log, 'y')}` }
		];
	} else if (lvl === 4) {
		const pairs = [[2, 3], [2, 5], [2, 7], [3, 5], [3, 7], [2, 11], [5, 7], [3, 11]];
		const [a, b] = pairs[variant];
		q = lgOf(log, a * b);
		structuredSteps = [
			{ label: 'Faktoriser', latex: `${a * b} = ${a} \\cdot ${b}` },
			{ label: 'Produktsetninga', latex: `${lgOf(log, a)} + ${lgOf(log, b)}` }
		];
	} else {
		const b = rand(2, 4);
		q = `${log}(${k}x \\cdot ${b}y)`;
		structuredSteps = [
			{ label: 'Samle konstantane', latex: `${log}(${k * b}xy)` },
			{ label: 'Produktsetninga', latex: `${lgOf(log, k * b)} + ${log}(xy)` },
			{ label: 'Produktsetninga att', latex: `${lgOf(log, k * b)} + ${lgOf(log, 'x')} + ${lgOf(log, 'y')}` }
		];
	}

	return finish('log_product', lvl, base, q, structuredSteps, 'Produktsetninga: $\\lg(a \\cdot b) = \\lg a + \\lg b$.');
}

// ── Quotient Rule: lg(a/b) = lg a − lg b ──
// Lvl 1: two numbers           lg(7/3)
// Lvl 2: x over a number       lg(x/5)
// Lvl 3: a power over y        lg(x³/y)
// Lvl 4: the other way round   lg 12 − lg 5  →  one logarithm
// Lvl 5: all three rules       lg(3xy / z²)

function generateLogQuotientProblem(lvl: number, variant: number): Draft {
	const base = lvl === 1 || lvl === 4 ? pickBase() : baseFor(variant);
	const log = logCmd(base);
	const k = 2 + (variant % 4);
	let q = '', structuredSteps: StepEntry[] = [];
	let instruction: string | undefined;

	if (lvl === 1) {
		// Coprime, so the fraction is not one a student would first cancel.
		const pairs = [[5, 2], [7, 3], [3, 4], [9, 2], [5, 3], [7, 4], [11, 5], [8, 3]];
		const [a, b] = pairs[variant];
		q = `${log}\\left(\\frac{${a}}{${b}}\\right)`;
		structuredSteps = [
			{ label: 'Kvotientsetninga', latex: `${lgOf(log, a)} - ${lgOf(log, b)}` }
		];
	} else if (lvl === 2) {
		const b = k + 1;
		q = `${log}\\left(\\frac{x}{${b}}\\right)`;
		structuredSteps = [
			{ label: 'Kvotientsetninga', latex: `${lgOf(log, 'x')} - ${lgOf(log, b)}` }
		];
	} else if (lvl === 3) {
		const n = k;
		q = `${log}\\left(\\frac{x^{${n}}}{y}\\right)`;
		structuredSteps = [
			{ label: 'Kvotientsetninga', latex: `${log}(x^{${n}}) - ${lgOf(log, 'y')}` },
			{ label: 'Potenssetninga', latex: `${n}${lgOf(log, 'x')} - ${lgOf(log, 'y')}` }
		];
	} else if (lvl === 4) {
		// Some pairs divide evenly and some do not, so the answer is sometimes a
		// fraction and sometimes a whole number to spot.
		const pairs = [[12, 3], [15, 4], [20, 5], [14, 3], [18, 6], [21, 4], [24, 8], [10, 7]];
		const [a, b] = pairs[variant];
		const g = gcd(a, b);
		const reduced = b / g === 1 ? `${a / g}` : `\\frac{${a / g}}{${b / g}}`;
		q = `${lgOf(log, a)} - ${lgOf(log, b)}`;
		instruction = 'Skriv som éin logaritme.';
		structuredSteps = [
			{ label: 'Kvotientsetninga baklengs', latex: `${log}\\left(\\frac{${a}}{${b}}\\right)` },
			...(g > 1 ? [{ label: 'Forkort brøken', latex: b / g === 1 ? lgOf(log, reduced) : `${log}\\left(${reduced}\\right)` }] : [])
		];
	} else {
		const n = rand(2, 3);
		q = `${log}\\left(\\frac{${k}xy}{z^{${n}}}\\right)`;
		structuredSteps = [
			{ label: 'Kvotientsetninga', latex: `${log}(${k}xy) - ${log}(z^{${n}})` },
			{ label: 'Produktsetninga', latex: `${lgOf(log, k)} + ${lgOf(log, 'x')} + ${lgOf(log, 'y')} - ${log}(z^{${n}})` },
			{ label: 'Potenssetninga', latex: `${lgOf(log, k)} + ${lgOf(log, 'x')} + ${lgOf(log, 'y')} - ${n}${lgOf(log, 'z')}` }
		];
	}

	return finish('log_quotient', lvl, base, q, structuredSteps, 'Kvotientsetninga: $\\lg\\frac{a}{b} = \\lg a - \\lg b$.', instruction);
}

// ── Power Rule: lg(aⁿ) = n·lg a ──
// Lvl 1: a number to a power      lg(3⁴)
// Lvl 2: x to a power             lg(x⁵)
// Lvl 3: a power in the denominator  lg(1/x³)
// Lvl 4: a root                   lg ∛(x²)
// Lvl 5: an exact value           lg ∛100 = 2/3

/** Reduced fraction m/k as LaTeX: 4/2 → 2, 2/3 → \frac{2}{3}. */
function fracLatex(m: number, k: number): string {
	const g = gcd(m, k);
	return k / g === 1 ? `${m / g}` : `\\frac{${m / g}}{${k / g}}`;
}

function generateLogPowerProblem(lvl: number, variant: number): Draft {
	const base = lvl === 1 ? pickBase() : baseFor(variant);
	const log = logCmd(base);
	const n = 2 + (variant % 4);
	let q = '', structuredSteps: StepEntry[] = [];
	let instruction: string | undefined;

	if (lvl === 1) {
		const a = rand(2, 7);
		q = `${log}(${a}^{${n}})`;
		structuredSteps = [
			{ label: 'Potenssetninga', latex: `${n}${lgOf(log, a)}` }
		];
	} else if (lvl === 2) {
		q = `${log}(x^{${n}})`;
		structuredSteps = [
			{ label: 'Potenssetninga', latex: `${n}${lgOf(log, 'x')}` }
		];
	} else if (lvl === 3) {
		q = `${log}\\left(\\frac{1}{x^{${n}}}\\right)`;
		structuredSteps = [
			{ label: 'Skriv som potens', latex: `${log}(x^{-${n}})` },
			{ label: 'Potenssetninga', latex: `-${n}${lgOf(log, 'x')}` }
		];
	} else if (lvl === 4) {
		const roots = [[2, 1], [3, 1], [3, 2], [2, 3], [4, 1], [4, 3], [3, 4], [5, 2]];
		const [k, m] = roots[variant];
		const radicand = m === 1 ? 'x' : `x^{${m}}`;
		const rootTex = k === 2 ? `\\sqrt{${radicand}}` : `\\sqrt[${k}]{${radicand}}`;
		q = `${log}${rootTex}`;
		structuredSteps = [
			{ label: 'Skriv rota som potens', latex: `${log}(x^{${m}/${k}})` },
			{ label: 'Potenssetninga', latex: `${fracLatex(m, k)}${lgOf(log, 'x')}` }
		];
	} else {
		const roots = [[3, 2], [2, 3], [4, 3], [3, 1], [5, 2], [2, 1], [4, 1], [3, 4]];
		const [k, m] = roots[variant];
		const baseNum = base === 'lg' ? '10' : 'e';
		const radicand = base === 'lg' ? `${10 ** m}` : m === 1 ? 'e' : `e^{${m}}`;
		const rootTex = k === 2 ? `\\sqrt{${radicand}}` : `\\sqrt[${k}]{${radicand}}`;
		q = `${log}${rootTex}`;
		instruction = 'Rekn ut den eksakte verdien.';
		structuredSteps = [
			{ label: 'Skriv som potens', latex: `${log}(${baseNum}^{${m}/${k}})` },
			{ label: 'Potenssetninga', latex: `${fracLatex(m, k)} \\cdot ${lgOf(log, baseNum)}` },
			{ label: base === 'lg' ? 'lg 10 = 1' : 'ln e = 1', latex: fracLatex(m, k) }
		];
	}

	return finish('log_power', lvl, base, q, structuredSteps, 'Potenssetninga: $\\lg a^n = n \\cdot \\lg a$. Ei rot er ein potens med brøk som eksponent.', instruction);
}

// ── Simplify: combine multiple rules ──
// Lvl 1: product and power         lg(3x²)
// Lvl 2: all three                  lg(3x²/y)
// Lvl 3: the other way round        2 lg x + lg 3 − lg y  →  one logarithm
// Lvl 4: a root inside              lg(x³√y)
// Lvl 5: the other way round, with brackets  2 lg(x+1) − ½ lg(x²+1)

function generateLogSimplifyProblem(lvl: number, variant: number): Draft {
	const base = baseFor(variant);
	const log = logCmd(base);
	const a = 2 + (variant % 4) + (lvl === 3 ? 1 : 0);
	let q = '', structuredSteps: StepEntry[] = [];
	let instruction: string | undefined;

	if (lvl === 1) {
		const n = rand(2, 4);
		q = `${log}(${a}x^{${n}})`;
		structuredSteps = [
			{ label: 'Produktsetninga', latex: `${lgOf(log, a)} + ${log}(x^{${n}})` },
			{ label: 'Potenssetninga', latex: `${lgOf(log, a)} + ${n}${lgOf(log, 'x')}` }
		];
	} else if (lvl === 2) {
		const n = rand(2, 3);
		q = `${log}\\left(\\frac{${a}x^{${n}}}{y}\\right)`;
		structuredSteps = [
			{ label: 'Kvotientsetninga', latex: `${log}(${a}x^{${n}}) - ${lgOf(log, 'y')}` },
			{ label: 'Produktsetninga', latex: `${lgOf(log, a)} + ${log}(x^{${n}}) - ${lgOf(log, 'y')}` },
			{ label: 'Potenssetninga', latex: `${lgOf(log, a)} + ${n}${lgOf(log, 'x')} - ${lgOf(log, 'y')}` }
		];
	} else if (lvl === 3) {
		const n = rand(2, 3);
		q = `${n}${lgOf(log, 'x')} + ${lgOf(log, a)} - ${lgOf(log, 'y')}`;
		instruction = 'Skriv som éin logaritme.';
		structuredSteps = [
			{ label: 'Potenssetninga baklengs', latex: `${log}(x^{${n}}) + ${lgOf(log, a)} - ${lgOf(log, 'y')}` },
			{ label: 'Produktsetninga baklengs', latex: `${log}(${a}x^{${n}}) - ${lgOf(log, 'y')}` },
			{ label: 'Kvotientsetninga baklengs', latex: `${log}\\left(\\frac{${a}x^{${n}}}{y}\\right)` }
		];
	} else if (lvl === 4) {
		const n = 2 + (variant % 4);
		q = `${log}(x^{${n}}\\sqrt{y})`;
		structuredSteps = [
			{ label: 'Skriv rota som potens', latex: `${log}(x^{${n}} \\cdot y^{1/2})` },
			{ label: 'Produktsetninga', latex: `${log}(x^{${n}}) + ${log}(y^{1/2})` },
			{ label: 'Potenssetninga', latex: `${n}${lgOf(log, 'x')} + \\frac{1}{2}${lgOf(log, 'y')}` }
		];
	} else {
		const p = 2 + (variant % 2);
		const k = 2 + (Math.floor(variant / 2) % 2);
		const c = 1 + Math.floor(variant / 4) + rand(0, 2);
		const root = k === 2 ? `\\sqrt{x^{2}+${c}}` : `\\sqrt[${k}]{x^{2}+${c}}`;
		q = `${p}${log}(x+1) - \\frac{1}{${k}}${log}(x^{2}+${c})`;
		instruction = 'Skriv som éin logaritme.';
		structuredSteps = [
			{ label: 'Potenssetninga baklengs', latex: `${log}((x+1)^{${p}}) - ${log}((x^{2}+${c})^{1/${k}})` },
			{ label: 'Skriv potensen som rot', latex: `${log}((x+1)^{${p}}) - ${log}${root}` },
			{ label: 'Kvotientsetninga baklengs', latex: `${log}\\left(\\frac{(x+1)^{${p}}}{${root}}\\right)` }
		];
	}

	return finish('log_simplify', lvl, base, q, structuredSteps, 'Bruk setningane éin om gongen: produkt, kvotient, potens.', instruction);
}

/** Assemble a draft; the answer is the last step. */
function finish(
	topic: LogTopicId,
	level: number,
	base: 'lg' | 'ln',
	q: string,
	structuredSteps: StepEntry[],
	hint: string,
	instruction?: string
): Draft {
	return {
		topic,
		level,
		type: base,
		q,
		a: structuredSteps[structuredSteps.length - 1].latex,
		structuredSteps,
		hint,
		...(instruction ? { instruction } : {})
	};
}

// ── Log Equations (enhanced: use log laws before definition) ──

function generateLogEquationProblem(lvl: number, variant: number): Draft {
	const base = lvl >= 3 ? baseFor(variant) : pickBase();
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
				{ label: 'Definisjonen', latex: `x + ${b} = 10^1` },
				{ label: 'Rekn ut høgresida', latex: `x + ${b} = 10` },
				{ label: 'Løys for x', latex: `x = 10 - ${b} = ${answer}` }
			];
		} else {
			structuredSteps = [
				{ label: 'Del begge sider med ' + coeff, latex: `${log}(x + ${b}) = \\frac{${rhs}}{${coeff}} = 1` },
				{ label: 'Definisjonen', latex: `x + ${b} = e^1` },
				{ label: 'Forenkle', latex: `x + ${b} = e` },
				{ label: 'Løys for x', latex: `x = e - ${b}` }
			];
		}
	} else if (lvl === 2) {
		// lg(x²) + lg a = 2  →  product rule + definition  →  two solutions
		//
		// Not via the power rule. Writing lg(x²) as 2·lg x silently assumes x > 0,
		// but lg(x²) is defined for every x ≠ 0 — so that step threw away the
		// negative root, and the answer showed only x = √(100/a). It is precisely
		// the domain slip this topic exists to teach students to avoid.
		const a = rand(2, 5);
		q = `${log}(x^{2}) + ${log}\\,${a} = 2`;
		if (base === 'lg') {
			const rhs = 100;
			const g = gcd(rhs, a);
			const x2 = a / g === 1 ? `${rhs / g}` : `\\frac{${rhs / g}}{${a / g}}`;
			structuredSteps = [
				{ label: 'Produktsetninga', latex: `${log}(${a}x^{2}) = 2` },
				{ label: 'Definisjonen', latex: `${a}x^{2} = 10^{2} = ${rhs}` },
				{ label: 'Isoler x²', latex: `x^{2} = ${x2}` },
				{ label: 'Begge forteikn gir same x²', latex: `x = \\pm\\sqrt{${x2}}` },
				{ label: 'Forenkle', latex: `x = \\pm ${sqrtFraction(rhs, a)}` }
			];
		} else {
			structuredSteps = [
				{ label: 'Produktsetninga', latex: `${log}(${a}x^{2}) = 2` },
				{ label: 'Definisjonen', latex: `${a}x^{2} = e^{2}` },
				{ label: 'Isoler x²', latex: `x^{2} = \\frac{e^{2}}{${a}}` },
				{ label: 'Begge forteikn gir same x²', latex: `x = \\pm\\sqrt{\\frac{e^{2}}{${a}}}` },
				{ label: 'Forenkle', latex: `x = \\pm ${sqrtFraction(1, a, 'e')}` }
			];
		}
	} else if (lvl === 3) {
		// 2·lg x − lg a = 1. Only the positive root: lg x itself needs x > 0,
		// which is the contrast with level 2, where lg(x²) allows both signs.
		const a = 2 + variant;
		const n = 2;
		q = `${n} \\cdot ${log}\\,x - ${log}\\,${a} = 1`;
		if (base === 'lg') {
			structuredSteps = [
				{ label: 'Potenssetninga', latex: `${log}(x^{${n}}) - ${log}\\,${a} = 1` },
				{ label: 'Kvotientsetninga', latex: `${log}\\left(\\frac{x^{${n}}}{${a}}\\right) = 1` },
				{ label: 'Definisjonen', latex: `\\frac{x^{${n}}}{${a}} = 10` },
				{ label: `Gong med ${a}`, latex: `x^{${n}} = ${10 * a}` },
				{ label: 'Berre x > 0 gjeld', latex: `x = ${sqrtFraction(10 * a, 1)}` }
			];
		} else {
			structuredSteps = [
				{ label: 'Potenssetninga', latex: `${log}(x^{${n}}) - ${log}\\,${a} = 1` },
				{ label: 'Kvotientsetninga', latex: `${log}\\left(\\frac{x^{${n}}}{${a}}\\right) = 1` },
				{ label: 'Definisjonen', latex: `\\frac{x^{${n}}}{${a}} = e` },
				{ label: `Gong med ${a}`, latex: `x^{${n}} = ${a}e` },
				{ label: 'Berre x > 0 gjeld', latex: `x = \\sqrt{${a}e}` }
			];
		}
	} else if (lvl === 4) {
		// lg(x) + lg(x−b) = 1  →  product rule + quadratic → 6 steps
		const b = 2 + (variant % 4);
		q = `${log}\\,x + ${log}(x - ${b}) = 1`;
		if (base === 'lg') {
			const D = b * b + 40;
			structuredSteps = [
				{ label: 'Produktsetninga', latex: `${log}(x(x - ${b})) = 1` },
				{ label: 'Definisjonen', latex: `x(x - ${b}) = 10` },
				{ label: 'Gong ut', latex: `x^{2} - ${b}x = 10` },
				{ label: 'Samle på éi side', latex: `x^{2} - ${b}x - 10 = 0` },
				{ label: 'abc-formelen', latex: `x = \\frac{${b} \\pm \\sqrt{${D}}}{2}` },
				{ label: `Berre x > ${b} gjeld`, latex: `x = ${halfRoot(b, D)}` }
			];
		} else {
			structuredSteps = [
				{ label: 'Produktsetninga', latex: `${log}(x(x - ${b})) = 1` },
				{ label: 'Definisjonen', latex: `x(x - ${b}) = e` },
				{ label: 'Gong ut', latex: `x^{2} - ${b}x = e` },
				{ label: 'Samle på éi side', latex: `x^{2} - ${b}x - e = 0` },
				{ label: 'abc-formelen', latex: `x = \\frac{${b} \\pm \\sqrt{${b * b} + 4e}}{2}` },
				{ label: `Berre x > ${b} gjeld`, latex: `x = \\frac{${b} + \\sqrt{${b * b} + 4e}}{2} \\approx ${dec((b + Math.sqrt(b * b + 4 * Math.E)) / 2)}` }
			];
		}
	} else {
		// 2·lg x − lg(x+b) = 0  →  power + quotient + definition → 7 steps
		const b = 2 + variant;
		const D5 = 1 + 4 * b;
		q = `2 \\cdot ${log}\\,x - ${log}(x + ${b}) = 0`;
		structuredSteps = [
			{ label: 'Potenssetninga', latex: `${log}(x^2) - ${log}(x + ${b}) = 0` },
			{ label: 'Kvotientsetninga', latex: `${log}\\left(\\frac{x^2}{x + ${b}}\\right) = 0` },
			{ label: 'log = 0 gir argument = 1', latex: `\\frac{x^2}{x + ${b}} = 1` },
			{ label: `Gong med (x + ${b})`, latex: `x^2 = x + ${b}` },
			{ label: 'Samle på éi side', latex: `x^{2} - x - ${b} = 0` },
			{ label: 'abc-formelen', latex: `x = \\frac{1 \\pm \\sqrt{1 + ${4 * b}}}{2}` },
			{ label: 'Berre x > 0 gjeld', latex: `x = ${halfRoot(1, D5)}` }
		];
	}

	const lastStep = structuredSteps[structuredSteps.length - 1];
	return {
		topic: 'log_equation',
		level: lvl,
		type: base,
		q,
		a: lastStep.latex,
		structuredSteps,
		hint: 'Bruk logaritmesetningane først, så definisjonen: $\\lg x = y \\iff x = 10^y$. Hugs at argumentet må vera positivt.'
	};
}

// ── Exponential Equations ──

function generateExpEquationProblem(lvl: number, variant: number): Draft {
	const base = pickBase();
	const log = logCmd(base);
	let q = '', structuredSteps: StepEntry[] = [];

	if (lvl === 1) {
		// Both sides the same base: compare exponents.
		const pairs = [[2, 3], [3, 2], [2, 5], [5, 2], [3, 4], [2, 4], [5, 3], [4, 3]];
		const [b, n] = pairs[variant];
		q = `${b}^{x} = ${b ** n}`;
		structuredSteps = [
			{ label: 'Skriv høgresida som potens', latex: `${b}^{x} = ${b}^{${n}}` },
			{ label: 'Samanlikn eksponentane', latex: `x = ${n}` }
		];
	} else if (lvl === 2) {
		// The same, with something to do after comparing: x + k or 2x.
		const b = pick([2, 3, 5]);
		const n = rand(2, 4);
		if (variant % 2 === 0) {
			const k = 1 + Math.floor(variant / 2);
			q = `${b}^{x+${k}} = ${b ** n}`;
			structuredSteps = [
				{ label: 'Skriv høgresida som potens', latex: `${b}^{x+${k}} = ${b}^{${n}}` },
				{ label: 'Samanlikn eksponentane', latex: `x + ${k} = ${n}` },
				{ label: 'Løys for x', latex: `x = ${n - k}` }
			];
		} else {
			const m = 2 + Math.floor(variant / 2);
			q = `${b}^{${m}x} = ${b ** n}`;
			structuredSteps = [
				{ label: 'Skriv høgresida som potens', latex: `${b}^{${m}x} = ${b}^{${n}}` },
				{ label: 'Samanlikn eksponentane', latex: `${m}x = ${n}` },
				{ label: 'Løys for x', latex: `x = ${fracLatex(n, m)}` }
			];
		}
	} else if (lvl === 3) {
		// The right-hand side is not a power of b: logarithms are the only way.
		const b = 2 + (variant % 4);
		let c = rand(5, 40);
		while (Math.abs(Math.log(c) / Math.log(b) - Math.round(Math.log(c) / Math.log(b))) < 1e-9) c++;
		const x = Math.log(c) / Math.log(b);
		q = `${b}^{x} = ${c}`;
		structuredSteps = [
			{ label: 'Ta logaritmen på begge sider', latex: `${log}(${b}^{x}) = ${log}\\,${c}` },
			{ label: 'Potenssetninga', latex: `x \\cdot ${log}\\,${b} = ${log}\\,${c}` },
			{ label: 'Løys for x', latex: `x = \\frac{${log}\\,${c}}{${log}\\,${b}} \\approx ${dec(x)}` }
		];
	} else if (lvl === 4) {
		const a = 2 + (variant % 3);
		const c = 2 + variant + rand(0, 1) * 8;
		const x = Math.log(c) / a;
		q = `e^{${a}x} = ${c}`;
		structuredSteps = [
			{ label: 'Ta ln på begge sider', latex: `\\ln(e^{${a}x}) = \\ln\\,${c}` },
			{ label: 'ln e = 1', latex: `${a}x = \\ln\\,${c}` },
			{ label: 'Løys for x', latex: `x = \\frac{\\ln\\,${c}}{${a}} \\approx ${dec(x)}` }
		];
	} else {
		// c · b^(x+k) = R, where R/c is NOT a power of b.
		//
		// It used to be R = c·b^(k+1), so x was 1 in every problem and the answer
		// was shown as lg 64 / lg 4 − 2: a student who spotted 4^(x+2) = 4³ got
		// "x = 1" and a key that looked different. A right-hand side that is not a
		// power of b makes logarithms the only way through, which is the point of
		// this level.
		const coeff = rand(2, 4);
		const b = rand(2, 5);
		const k = rand(1, 2);
		let divided = rand(5, 60);
		const isPowerOfB = (n: number) => {
			const e = Math.log(n) / Math.log(b);
			return Math.abs(e - Math.round(e)) < 1e-9;
		};
		while (isPowerOfB(divided)) divided++;
		const result = coeff * divided;
		const x = Math.log(divided) / Math.log(b) - k;
		q = `${coeff} \\cdot ${b}^{x+${k}} = ${result}`;
		structuredSteps = [
			{ label: 'Isoler potensen', latex: `${b}^{x+${k}} = \\frac{${result}}{${coeff}} = ${divided}` },
			{ label: 'Ta logaritmen', latex: `${log}(${b}^{x+${k}}) = ${log}\\,${divided}` },
			{ label: 'Potenssetninga', latex: `(x+${k}) \\cdot ${log}\\,${b} = ${log}\\,${divided}` },
			{ label: `Isoler (x+${k})`, latex: `x + ${k} = \\frac{${log}\\,${divided}}{${log}\\,${b}}` },
			{ label: 'Løys for x', latex: `x = \\frac{${log}\\,${divided}}{${log}\\,${b}} - ${k} \\approx ${dec(x)}` }
		];
	}

	const lastStep = structuredSteps[structuredSteps.length - 1];
	return {
		topic: 'exp_equation',
		level: lvl,
		type: base,
		q,
		a: lastStep.latex,
		structuredSteps,
		hint: 'Ta logaritmen på begge sider for å få ned eksponenten.'
	};
}

// ── Public API ──

export function generateSingleLogProblem(
	topic: LogTopicId,
	lvl: number,
	variant = 0
): Draft | null {
	switch (topic) {
		case 'log_definition':
			return generateLogDefinitionProblem(lvl, variant);
		case 'log_product':
			return generateLogProductProblem(lvl, variant);
		case 'log_quotient':
			return generateLogQuotientProblem(lvl, variant);
		case 'log_power':
			return generateLogPowerProblem(lvl, variant);
		case 'log_simplify':
			return generateLogSimplifyProblem(lvl, variant);
		case 'log_equation':
			return generateLogEquationProblem(lvl, variant);
		case 'exp_equation':
			return generateExpEquationProblem(lvl, variant);
	}
}

export const MODULE_ID = 'logarithm';

/** Variants generated per (topic x level). */
const VARIANTS = 8;

export function generateLogProblemBank(): Problem[] {
	const topics: LogTopicId[] = [
		'log_definition', 'log_product', 'log_quotient', 'log_power',
		'log_simplify', 'log_equation', 'exp_equation'
	];
	const levels = [1, 2, 3, 4, 5];
	const bank: Problem[] = [];

	for (const topic of topics) {
		for (const lvl of levels) {
			for (let variant = 0; variant < VARIANTS; variant++) {
				const id = `${MODULE_ID}:${topic}:${lvl}:${variant}`;
				// Seed before generating so this id always yields this problem.
				rng = rngFor(id);
				const prob = generateSingleLogProblem(topic, lvl, variant);
				if (prob) bank.push({ ...prob, id, moduleId: MODULE_ID });
			}
		}
	}

	rng = Math.random;
	return bank;
}
