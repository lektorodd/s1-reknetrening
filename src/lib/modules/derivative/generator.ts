// Problem generator for derivative rules — v2
// Conceptual difficulty progression (not arithmetic)
// S1 curriculum: no trigonometric functions
// Coefficients capped at 6 — difficulty is structural

import type { Problem, StepEntry } from '../types';
import { rngFor } from '../rng';

export type TopicId = 'chain' | 'product' | 'quotient';
export type ProblemType = 'poly' | 'root' | 'exp' | 'log';

/** Draft problem — id and moduleId are attached by generateBank(). */
type Draft = Omit<Problem, 'id' | 'moduleId'>;

/**
 * Active random source. generateBank() swaps in a seeded generator so that a
 * given problem id always yields the same coefficients.
 */
let rng: () => number = Math.random;

// ── Formatting Helpers ──

function fmt(coeff: number, varName: string, isFirst = true): string {
	if (coeff === 0) return '';
	let str = '';
	if (!isFirst && coeff > 0) str += '+';
	if (coeff === 1) str += varName;
	else if (coeff === -1) str += '-' + varName;
	else str += coeff + varName;
	return str;
}

function fmtNum(num: number, isFirst = false): string {
	if (num === 0) return '';
	if (num > 0 && !isFirst) return '+' + num;
	return '' + num;
}

function fmtPow(n: number): string {
	return n === 1 ? '' : `^{${n}}`;
}

function par(val: number): string {
	return val < 0 ? `(${val})` : `${val}`;
}

/** Format a fraction p/2 as a LaTeX exponent: simplify when divisible, skip when 1. */
function fmtFracHalf(p: number): string {
	if (p === 0) return '^{0}';
	if (p % 2 === 0) {
		const simplified = p / 2;
		return simplified === 1 ? '' : `^{${simplified}}`;
	}
	return `^{${p}/2}`;
}

/** Format kx for use in e^{kx}: e^x when k=1, e^{-x} when k=-1, e^{kx} otherwise. */
function fmtExp(k: number): string {
	if (k === 1) return 'x';
	if (k === -1) return '-x';
	return `${k}x`;
}

function rand(min: number, max: number): number {
	return Math.floor(rng() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
	return arr[Math.floor(rng() * arr.length)];
}

// ── Chain Rule Generator ──
//
// A chain-rule concept is the *outer* function — a power, a root, e^u or ln u —
// because that is what the student has to recognise and differentiate. The
// level is how complicated the inside is. Every family therefore starts at an
// easy level: before, the type followed the level, so √(4x+1) was filed as
// "polynomial" and e^u did not exist below level 4, which left a weak student
// no way into it at all.
//
// Lvl 1: linear inside, power or e^u          (3x+1)^4, e^{2x+1}
// Lvl 2: linear inside, root or ln, or a power of (b − ax)
// Lvl 3: quadratic inside, power or root       (2x²+3)^3, √(x²+4)
// Lvl 4: quadratic inside, e^u or ln, or a power of a two-term inside
// Lvl 5: a chain inside a chain                √(e^{2x}+3), ln√(3x+1), e^{√(x+2)}, (√x+2)^3

type ChainFamily = 'poly' | 'root' | 'exp' | 'log';

/** Which families each level draws, in turn by variant so every one is present. */
const CHAIN_FAMILIES: Record<number, ChainFamily[]> = {
	1: ['poly', 'exp'],
	2: ['root', 'log', 'poly'],
	3: ['poly', 'root'],
	4: ['exp', 'log', 'poly'],
	5: ['root', 'log', 'exp', 'poly']
};

function gcd(a: number, b: number): number {
	a = Math.abs(a);
	b = Math.abs(b);
	while (b) [a, b] = [b, a % b];
	return a;
}

/** A coefficient in front of a term: 1 and −1 are not written. */
function coef(c: number, term: string): string {
	if (c === 1) return term;
	if (c === -1) return `-${term}`;
	return `${c}${term}`;
}

/** The six-step pattern every single chain rule follows. */
function chainSteps(
	gOfU: string,
	inner: string,
	gPrime: string,
	innerPrime: string,
	inserted: string,
	result: string
): StepEntry[] {
	return [
		{ label: 'Identifiser', latex: `g(u) = ${gOfU}, \\quad u(x) = ${inner}` },
		{ label: 'Deriver g', latex: `g'(u) = ${gPrime}` },
		{ label: 'Deriver u', latex: `u'(x) = ${innerPrime}` },
		{ label: 'Bruk kjerneregelen', latex: `f'(x) = g'(u) \\cdot u'(x)` },
		{ label: 'Set inn', latex: `f'(x) = ${inserted}` },
		{ label: 'Forenkle', latex: `f'(x) = ${result}` }
	];
}

/** k / (px + q), reduced by any factor all three share. */
function overLinear(k: number, p: number, q: number, tail = ''): string {
	const g = gcd(gcd(k, p), q);
	const [K, P, Q] = [k / g, p / g, q / g];
	return `\\frac{${K}${tail}}{${fmt(P, 'x')}${fmtNum(Q)}}`;
}

function generateChainProblem(lvl: number, variant: number): Draft {
	const families = CHAIN_FAMILIES[lvl];
	const family = families[variant % families.length];
	// The inner coefficient steps with the variant, so no two problems of one
	// family at one level come out the same (a random draw repeated itself).
	const a = 2 + (Math.floor(variant / families.length) % 4);
	const b = rand(1, 6);
	const n = pick(lvl <= 2 ? [2, 3, 4] : [2, 3, 4, 5]);
	const linear = `${fmt(a, 'x')}${fmtNum(b)}`;

	let q = '';
	let structuredSteps: StepEntry[] = [];
	let hint = 'Finn den ytre og den indre funksjonen.';

	if (lvl === 1 && family === 'poly') {
		q = `f(x) = (${linear})^{${n}}`;
		structuredSteps = chainSteps(
			`u^{${n}}`, linear, `${n}u${fmtPow(n - 1)}`, `${a}`,
			`${n}(${linear})${fmtPow(n - 1)} \\cdot ${a}`,
			`${n * a}(${linear})${fmtPow(n - 1)}`
		);
	} else if (lvl === 1) {
		// e^{ax+b}
		q = `f(x) = e^{${linear}}`;
		structuredSteps = chainSteps(
			'e^{u}', linear, 'e^{u}', `${a}`,
			`e^{${linear}} \\cdot ${a}`,
			`${a}e^{${linear}}`
		);
	} else if (lvl === 2 && family === 'root') {
		q = `f(x) = \\sqrt{${linear}}`;
		structuredSteps = chainSteps(
			'\\sqrt{u}', linear, '\\frac{1}{2\\sqrt{u}}', `${a}`,
			`\\frac{1}{2\\sqrt{${linear}}} \\cdot ${a}`,
			a % 2 === 0 ? `\\frac{${a / 2}}{\\sqrt{${linear}}}` : `\\frac{${a}}{2\\sqrt{${linear}}}`
		);
	} else if (lvl === 2 && family === 'log') {
		q = `f(x) = \\ln(${linear})`;
		structuredSteps = chainSteps(
			'\\ln u', linear, '\\frac{1}{u}', `${a}`,
			`\\frac{1}{${linear}} \\cdot ${a}`,
			overLinear(a, a, b)
		);
	} else if (lvl === 2) {
		// A power of (b − ax): the inner derivative is negative.
		const inner = `${b}-${fmt(a, 'x')}`;
		q = `f(x) = (${inner})^{${n}}`;
		structuredSteps = chainSteps(
			`u^{${n}}`, inner, `${n}u${fmtPow(n - 1)}`, `-${a}`,
			`${n}(${inner})${fmtPow(n - 1)} \\cdot (-${a})`,
			`-${n * a}(${inner})${fmtPow(n - 1)}`
		);
		hint = 'Den indre funksjonen har negativ derivert.';
	} else if (lvl === 3) {
		const c = rand(1, 3);
		const inner = `${fmt(c, 'x^{2}')}${fmtNum(b)}`;
		const innerPrime = coef(2 * c, 'x');
		if (family === 'poly') {
			q = `f(x) = (${inner})^{${n}}`;
			structuredSteps = chainSteps(
				`u^{${n}}`, inner, `${n}u${fmtPow(n - 1)}`, innerPrime,
				`${n}(${inner})${fmtPow(n - 1)} \\cdot ${innerPrime}`,
				`${coef(2 * c * n, 'x')}(${inner})${fmtPow(n - 1)}`
			);
		} else {
			q = `f(x) = \\sqrt{${inner}}`;
			structuredSteps = chainSteps(
				'\\sqrt{u}', inner, '\\frac{1}{2\\sqrt{u}}', innerPrime,
				`\\frac{1}{2\\sqrt{${inner}}} \\cdot ${innerPrime}`,
				`\\frac{${coef(c, 'x')}}{\\sqrt{${inner}}}`
			);
		}
		hint = 'Den indre funksjonen er eit andregradsuttrykk. Deriver han for seg.';
	} else if (lvl === 4 && family !== 'poly') {
		const c = rand(1, 3);
		const inner = `${fmt(c, 'x^{2}')}${fmtNum(b)}`;
		const innerPrime = coef(2 * c, 'x');
		if (family === 'exp') {
			q = `f(x) = e^{${inner}}`;
			structuredSteps = chainSteps(
				'e^{u}', inner, 'e^{u}', innerPrime,
				`e^{${inner}} \\cdot ${innerPrime}`,
				`${innerPrime}e^{${inner}}`
			);
		} else {
			// 2cx / (cx² + b), reduced by what all three share.
			const g = gcd(gcd(2 * c, c), b);
			q = `f(x) = \\ln(${inner})`;
			structuredSteps = chainSteps(
				'\\ln u', inner, '\\frac{1}{u}', innerPrime,
				`\\frac{1}{${inner}} \\cdot ${innerPrime}`,
				`\\frac{${coef((2 * c) / g, 'x')}}{${fmt(c / g, 'x^{2}')}${fmtNum(b / g)}}`
			);
		}
		hint = 'Hugs å derivere den indre funksjonen.';
	} else if (lvl === 4) {
		// A power of a two-term inside: (x² + bx)^n.
		const inner = `x^{2}${fmt(b, 'x', false)}`;
		const innerPrime = `2x${fmtNum(b)}`;
		q = `f(x) = (${inner})^{${n}}`;
		// With b even, 2x + b = 2(x + b/2): the 2 joins the coefficient in front.
		const result = b % 2 === 0
			? `${2 * n}(x${fmtNum(b / 2)})(${inner})${fmtPow(n - 1)}`
			: `${n}(${innerPrime})(${inner})${fmtPow(n - 1)}`;
		structuredSteps = chainSteps(
			`u^{${n}}`, inner, `${n}u${fmtPow(n - 1)}`, innerPrime,
			`${n}(${inner})${fmtPow(n - 1)} \\cdot (${innerPrime})`,
			result
		);
		hint = 'Den indre funksjonen har to ledd. Deriver begge.';
	} else if (family === 'root') {
		// √(e^{ax} + b): the inside needs a chain rule of its own.
		const e = `e^{${fmtExp(a)}}`;
		const inner = `${e}${fmtNum(b)}`;
		q = `f(x) = \\sqrt{${inner}}`;
		structuredSteps = [
			{ label: 'Identifiser', latex: `g(u) = \\sqrt{u}, \\quad u(x) = ${inner}` },
			{ label: 'Deriver g', latex: `g'(u) = \\frac{1}{2\\sqrt{u}}` },
			{ label: 'Deriver u (kjerneregel)', latex: `u'(x) = ${a}${e}` },
			{ label: 'Set inn', latex: `f'(x) = \\frac{1}{2\\sqrt{${inner}}} \\cdot ${a}${e}` },
			{
				label: 'Forenkle',
				latex: a % 2 === 0
					? `f'(x) = \\frac{${coef(a / 2, e)}}{\\sqrt{${inner}}}`
					: `f'(x) = \\frac{${a}${e}}{2\\sqrt{${inner}}}`
			}
		];
		hint = 'Kjerneregelen to gonger: den indre funksjonen er sjølv samansett.';
	} else if (family === 'log') {
		// ln √(ax+b): ln of a root of a linear expression.
		q = `f(x) = \\ln\\sqrt{${linear}}`;
		structuredSteps = [
			{ label: 'Identifiser', latex: `g(u) = \\ln u, \\quad u(x) = \\sqrt{${linear}}` },
			{ label: 'Deriver g', latex: `g'(u) = \\frac{1}{u}` },
			{ label: 'Deriver u (kjerneregel)', latex: `u'(x) = \\frac{${a}}{2\\sqrt{${linear}}}` },
			{ label: 'Set inn', latex: `f'(x) = \\frac{1}{\\sqrt{${linear}}} \\cdot \\frac{${a}}{2\\sqrt{${linear}}}` },
			{ label: 'Forenkle', latex: `f'(x) = ${overLinear(a, 2 * a, 2 * b)}` }
		];
		hint = 'Kjerneregelen to gonger — eller skriv om med potenssetninga først.';
	} else if (family === 'exp') {
		// e^{√(x+b)}
		const inner = `x${fmtNum(b)}`;
		q = `f(x) = e^{\\sqrt{${inner}}}`;
		structuredSteps = [
			{ label: 'Identifiser', latex: `g(u) = e^{u}, \\quad u(x) = \\sqrt{${inner}}` },
			{ label: 'Deriver g', latex: `g'(u) = e^{u}` },
			{ label: 'Deriver u (kjerneregel)', latex: `u'(x) = \\frac{1}{2\\sqrt{${inner}}}` },
			{ label: 'Set inn', latex: `f'(x) = e^{\\sqrt{${inner}}} \\cdot \\frac{1}{2\\sqrt{${inner}}}` },
			{ label: 'Forenkle', latex: `f'(x) = \\frac{e^{\\sqrt{${inner}}}}{2\\sqrt{${inner}}}` }
		];
		hint = 'Kjerneregelen to gonger: den indre funksjonen er sjølv samansett.';
	} else {
		// (√x + b)^n
		const inner = `\\sqrt{x}${fmtNum(b)}`;
		q = `f(x) = (${inner})^{${n}}`;
		structuredSteps = [
			{ label: 'Identifiser', latex: `g(u) = u^{${n}}, \\quad u(x) = ${inner}` },
			{ label: 'Deriver g', latex: `g'(u) = ${n}u${fmtPow(n - 1)}` },
			{ label: 'Deriver u', latex: `u'(x) = \\frac{1}{2\\sqrt{x}}` },
			{ label: 'Set inn', latex: `f'(x) = ${n}(${inner})${fmtPow(n - 1)} \\cdot \\frac{1}{2\\sqrt{x}}` },
			{
				label: 'Forenkle',
				latex: n % 2 === 0
					? `f'(x) = \\frac{${coef(n / 2, `(${inner})${fmtPow(n - 1)}`)}}{\\sqrt{x}}`
					: `f'(x) = \\frac{${n}(${inner})${fmtPow(n - 1)}}{2\\sqrt{x}}`
			}
		];
		hint = 'Den indre funksjonen inneheld ei rot. Deriver ho for seg.';
	}

	const lastStep = structuredSteps[structuredSteps.length - 1];
	return {
		topic: 'chain',
		level: lvl,
		type: family,
		q,
		a: lastStep.latex,
		structuredSteps,
		hint
	};
}

// ── Product Rule Generator ──
// Lvl 1: x^n · (ax+b) — basic
// Lvl 2: x^n · e^(ax) or x^n · ln(x) — non-polynomial v'
// Lvl 3: x · √(x+b) — root requires algebra
// Lvl 4: x^n · (ax+b)^m — product + chain rule
// Lvl 5: (ax+b)^n · e^(cx) — both need chain rule

function generateProductProblem(lvl: number, variant: number): Draft {
	const a = rand(2, Math.min(lvl + 2, 5));
	const b = rand(1, 4);
	const n = pick(lvl <= 2 ? [2, 3] : [2, 3]);
	const m = pick([2, 3]);

	let q = '', structuredSteps: StepEntry[] = [];

	if (lvl === 1) {
		// x^n · (ax+b)
		const linear = `${fmt(a, 'x')}${fmtNum(b)}`;
		q = `f(x) = x^{${n}}(${linear})`;
		const expand_coeff1 = n * a;
		const expand_coeff2 = n * b + a;
		structuredSteps = [
			{ label: 'Identifiser u', latex: `u = x^{${n}}` },
			{ label: 'Identifiser v', latex: `v = ${linear}` },
			{ label: 'Deriver', latex: `u' = ${n}x${fmtPow(n - 1)}, \\quad v' = ${a}` },
			{ label: 'Bruk produktregelen', latex: `f'(x) = u'v + uv'` },
			{ label: 'Set inn', latex: `f'(x) = ${n}x${fmtPow(n - 1)}(${linear}) + x^{${n}} \\cdot ${a}` },
			{ label: 'Utvid', latex: `f'(x) = ${expand_coeff1}x^{${n}}${fmtNum(n * b)}x${fmtPow(n - 1)} + ${a}x^{${n}}` },
			{ label: 'Forenkle', latex: `f'(x) = ${a * (n + 1)}x^{${n}}${fmtNum(n * b)}x${fmtPow(n - 1)}` }
		];
	} else if (lvl === 2) {
		// Alternate e^{ax} and ln x; the parameter that varies steps with the
		// variant, so the eight problems are eight different ones.
		const step = Math.floor(variant / 2);
		if (variant % 2 === 0) {
			const a = 2 + step;
			q = `f(x) = x^{${n}} \\cdot e^{${a}x}`;
			structuredSteps = [
				{ label: 'Identifiser u', latex: `u = x^{${n}}` },
				{ label: 'Identifiser v', latex: `v = e^{${a}x}` },
				{ label: 'Deriver', latex: `u' = ${n}x${fmtPow(n - 1)}, \\quad v' = ${a}e^{${a}x}` },
				{ label: 'Bruk produktregelen', latex: `f'(x) = u'v + uv'` },
				{ label: 'Set inn', latex: `f'(x) = ${n}x${fmtPow(n - 1)} \\cdot e^{${a}x} + x^{${n}} \\cdot ${a}e^{${a}x}` },
				{ label: 'Faktoriser ut', latex: `f'(x) = x${fmtPow(n - 1)}e^{${a}x}(${n} + ${a}x)` }
			];
		} else {
			const n = 2 + step;
			q = `f(x) = x^{${n}} \\cdot \\ln(x)`;
			structuredSteps = [
				{ label: 'Identifiser u', latex: `u = x^{${n}}` },
				{ label: 'Identifiser v', latex: `v = \\ln(x)` },
				{ label: 'Deriver', latex: `u' = ${n}x${fmtPow(n - 1)}, \\quad v' = \\frac{1}{x}` },
				{ label: 'Bruk produktregelen', latex: `f'(x) = u'v + uv'` },
				{ label: 'Set inn', latex: `f'(x) = ${n}x${fmtPow(n - 1)} \\ln(x) + x^{${n}} \\cdot \\frac{1}{x}` },
				{ label: 'Forenkle', latex: `f'(x) = ${n}x${fmtPow(n - 1)} \\ln(x) + x${fmtPow(n - 1)}` },
				{ label: 'Faktoriser ut', latex: `f'(x) = x${fmtPow(n - 1)}(${n}\\ln x + 1)` }
			];
		}
	} else if (lvl === 3) {
		// x · √(x+b), a different b for every variant
		const b = 1 + variant;
		q = `f(x) = x \\sqrt{x${fmtNum(b)}}`;
		structuredSteps = [
			{ label: 'Identifiser u', latex: `u = x` },
			{ label: 'Identifiser v', latex: `v = \\sqrt{x${fmtNum(b)}}` },
			{ label: 'Deriver', latex: `u' = 1, \\quad v' = \\frac{1}{2\\sqrt{x${fmtNum(b)}}}` },
			{ label: 'Bruk produktregelen', latex: `f'(x) = u'v + uv'` },
			{ label: 'Set inn', latex: `f'(x) = 1 \\cdot \\sqrt{x${fmtNum(b)}} + x \\cdot \\frac{1}{2\\sqrt{x${fmtNum(b)}}}` },
			{ label: 'Felles nemnar', latex: `f'(x) = \\frac{2(x${fmtNum(b)}) + x}{2\\sqrt{x${fmtNum(b)}}}` },
			{ label: 'Forenkle', latex: `f'(x) = \\frac{3x${fmtNum(2 * b)}}{2\\sqrt{x${fmtNum(b)}}}` }
		];
	} else if (lvl === 4) {
		// x^n · (ax+b)^m — product + chain rule
		const linear = `${fmt(a, 'x')}${fmtNum(b)}`;
		q = `f(x) = x^{${n}}(${linear})^{${m}}`;
		structuredSteps = [
			{ label: 'Identifiser u', latex: `u = x^{${n}}` },
			{ label: 'Identifiser v', latex: `v = (${linear})^{${m}}` },
			{ label: 'Deriver u', latex: `u' = ${n}x${fmtPow(n - 1)}` },
			{ label: 'Deriver v (kjerneregelen)', latex: `v' = ${m}(${linear})${fmtPow(m - 1)} \\cdot ${a} = ${m * a}(${linear})${fmtPow(m - 1)}` },
			{ label: 'Bruk produktregelen', latex: `f'(x) = u'v + uv'` },
			{ label: 'Set inn', latex: `f'(x) = ${n}x${fmtPow(n - 1)}(${linear})^{${m}} + x^{${n}} \\cdot ${m * a}(${linear})${fmtPow(m - 1)}` },
			{ label: 'Faktoriser ut', latex: `f'(x) = x${fmtPow(n - 1)}(${linear})${fmtPow(m - 1)}[${n}(${linear}) + ${m * a}x]` },
			{ label: 'Forenkle', latex: `f'(x) = x${fmtPow(n - 1)}(${linear})${fmtPow(m - 1)}(${n * a + m * a}x${fmtNum(n * b)})` }
		];
	} else {
		// lvl 5: (ax+b)^n · e^(cx) — both factors need chain rule
		const c = rand(1, 3);
		const linear = `${fmt(a, 'x')}${fmtNum(b)}`;
		const ce = fmtExp(c);
		q = `f(x) = (${linear})^{${n}} \\cdot e^{${ce}}`;
		structuredSteps = [
			{ label: 'Identifiser u', latex: `u = (${linear})^{${n}}` },
			{ label: 'Identifiser v', latex: `v = e^{${ce}}` },
			{ label: 'Deriver u (kjerneregelen)', latex: `u' = ${n}(${linear})${fmtPow(n - 1)} \\cdot ${a} = ${n * a}(${linear})${fmtPow(n - 1)}` },
			{ label: 'Deriver v (kjerneregelen)', latex: `v' = ${c}e^{${ce}}` },
			{ label: 'Bruk produktregelen', latex: `f'(x) = u'v + uv'` },
			{ label: 'Set inn', latex: `f'(x) = ${n * a}(${linear})${fmtPow(n - 1)} \\cdot e^{${ce}} + (${linear})^{${n}} \\cdot ${c}e^{${ce}}` },
			{ label: 'Faktoriser ut', latex: `f'(x) = (${linear})${fmtPow(n - 1)} \\cdot e^{${ce}}[${n * a} + ${c}(${linear})]` },
			{ label: 'Forenkle', latex: `f'(x) = (${linear})${fmtPow(n - 1)} e^{${ce}}(${c * a}x${fmtNum(n * a + c * b)})` }
		];
	}

	const lastStep = structuredSteps[structuredSteps.length - 1];
	return {
		topic: 'product',
		level: lvl,
		type: 'poly',
		q,
		a: lastStep.latex,
		structuredSteps,
		hint: lvl <= 3 ? "Bruk produktregelen: u'v + uv'." : "Produktregel + kjerneregel på éin eller begge faktorane."
	};
}

// ── Quotient Rule Generator ──
// Lvl 1: constant / linear — u'=0 simplifies
// Lvl 2: x^n / linear — both non-zero
// Lvl 3: e^(ax) / x or ln(x) / x^n — special functions
// Lvl 4: polynomial / (ax+b)^n — quotient + chain rule
// Lvl 5: √x / (x+a) — root + quotient algebra

function generateQuotientProblem(lvl: number, variant: number): Draft {
	const a = rand(2, Math.min(lvl + 2, 5));
	const b = rand(1, 4);
	const n = pick(lvl <= 2 ? [2, 3] : [2, 3]);

	let q = '', structuredSteps: StepEntry[] = [];

	if (lvl === 1) {
		// constant / (bx+c)
		const c = rand(1, 4);
		const denom = `${fmt(b, 'x')}${fmtNum(c)}`;
		q = `f(x) = \\frac{${a}}{${denom}}`;
		structuredSteps = [
			{ label: 'Identifiser u og v', latex: `u = ${a}, \\quad v = ${denom}` },
			{ label: 'Deriver', latex: `u' = 0, \\quad v' = ${b}` },
			{ label: 'Bruk brøkregelen', latex: `f'(x) = \\frac{u'v - uv'}{v^2}` },
			{ label: 'Set inn', latex: `f'(x) = \\frac{0 \\cdot (${denom}) - ${a} \\cdot ${b}}{(${denom})^2}` },
			{ label: 'Forenkle', latex: `f'(x) = \\frac{${-a * b}}{(${denom})^2}` }
		];
	} else if (lvl === 2) {
		// x^n / (x+b), a different b for every variant
		const b = 1 + variant;
		const denom = `x${fmtNum(b)}`;
		q = `f(x) = \\frac{x^{${n}}}{${denom}}`;
		structuredSteps = [
			{ label: 'Identifiser u og v', latex: `u = x^{${n}}, \\quad v = ${denom}` },
			{ label: 'Deriver', latex: `u' = ${n}x${fmtPow(n - 1)}, \\quad v' = 1` },
			{ label: 'Bruk brøkregelen', latex: `f'(x) = \\frac{u'v - uv'}{v^2}` },
			{ label: 'Set inn', latex: `f'(x) = \\frac{${n}x${fmtPow(n - 1)}(${denom}) - x^{${n}} \\cdot 1}{(${denom})^2}` },
			{ label: 'Utvid teljaren', latex: `f'(x) = \\frac{${n}x^{${n}}${fmtNum(n * b)}x${fmtPow(n - 1)} - x^{${n}}}{(${denom})^2}` },
			{ label: 'Forenkle', latex: `f'(x) = \\frac{${fmt(n - 1, `x^{${n}}`)}${fmtNum(n * b)}x${fmtPow(n - 1)}}{(${denom})^2}` }
		];
	} else if (lvl === 3) {
		// e^(ax) / x or ln(x) / x^n, alternating; the parameter steps with the variant.
		const step = Math.floor(variant / 2);
		if (variant % 2 === 0) {
			const a = 2 + step;
			q = `f(x) = \\frac{e^{${a}x}}{x}`;
			structuredSteps = [
				{ label: 'Identifiser u og v', latex: `u = e^{${a}x}, \\quad v = x` },
				{ label: 'Deriver', latex: `u' = ${a}e^{${a}x}, \\quad v' = 1` },
				{ label: 'Bruk brøkregelen', latex: `f'(x) = \\frac{u'v - uv'}{v^2}` },
				{ label: 'Set inn', latex: `f'(x) = \\frac{${a}e^{${a}x} \\cdot x - e^{${a}x} \\cdot 1}{x^2}` },
				{ label: 'Faktoriser ut', latex: `f'(x) = \\frac{e^{${a}x}(${a}x - 1)}{x^2}` }
			];
		} else {
			const n = 2 + step;
			q = `f(x) = \\frac{\\ln x}{x^{${n}}}`;
			structuredSteps = [
				{ label: 'Identifiser u og v', latex: `u = \\ln x, \\quad v = x^{${n}}` },
				{ label: 'Deriver', latex: `u' = \\frac{1}{x}, \\quad v' = ${n}x${fmtPow(n - 1)}` },
				{ label: 'Bruk brøkregelen', latex: `f'(x) = \\frac{u'v - uv'}{v^2}` },
				{ label: 'Set inn', latex: `f'(x) = \\frac{\\frac{1}{x} \\cdot x^{${n}} - \\ln x \\cdot ${n}x${fmtPow(n - 1)}}{(x^{${n}})^2}` },
				{ label: 'Forenkle teljaren', latex: `f'(x) = \\frac{x${fmtPow(n - 1)} - ${n}x${fmtPow(n - 1)}\\ln x}{x^{${2 * n}}}` },
				{ label: 'Faktoriser ut', latex: `f'(x) = \\frac{x${fmtPow(n - 1)}(1 - ${n}\\ln x)}{x^{${2 * n}}}` },
				{ label: 'Forenkle', latex: `f'(x) = \\frac{1 - ${n}\\ln x}{x^{${n + 1}}}` }
			];
		}
	} else if (lvl === 4) {
		// x / (ax+b)^n — quotient + chain rule
		const linear = `${fmt(a, 'x')}${fmtNum(b)}`;
		q = `f(x) = \\frac{x}{(${linear})^{${n}}}`;
		structuredSteps = [
			{ label: 'Identifiser u og v', latex: `u = x, \\quad v = (${linear})^{${n}}` },
			{ label: 'Deriver u', latex: `u' = 1` },
			{ label: 'Deriver v (kjerneregelen)', latex: `v' = ${n}(${linear})${fmtPow(n - 1)} \\cdot ${a} = ${n * a}(${linear})${fmtPow(n - 1)}` },
			{ label: 'Bruk brøkregelen', latex: `f'(x) = \\frac{u'v - uv'}{v^2}` },
			{ label: 'Set inn', latex: `f'(x) = \\frac{1 \\cdot (${linear})^{${n}} - x \\cdot ${n * a}(${linear})${fmtPow(n - 1)}}{((${linear})^{${n}})^2}` },
			{ label: 'Faktoriser ut', latex: `f'(x) = \\frac{(${linear})${fmtPow(n - 1)}[(${linear}) - ${n * a}x]}{(${linear})^{${2 * n}}}` },
			{ label: 'Forenkle', latex: `f'(x) = \\frac{${a - n * a}x${fmtNum(b)}}{(${linear})^{${n + 1}}}` }
		];
	} else {
		// lvl 5: √x / (x+a), a different a for every variant
		const a = 1 + variant;
		const denom = `x${fmtNum(a)}`;
		q = `f(x) = \\frac{\\sqrt{x}}{${denom}}`;
		structuredSteps = [
			{ label: 'Identifiser u og v', latex: `u = \\sqrt{x}, \\quad v = ${denom}` },
			{ label: 'Deriver', latex: `u' = \\frac{1}{2\\sqrt{x}}, \\quad v' = 1` },
			{ label: 'Bruk brøkregelen', latex: `f'(x) = \\frac{u'v - uv'}{v^2}` },
			{ label: 'Set inn', latex: `f'(x) = \\frac{\\frac{1}{2\\sqrt{x}}(${denom}) - \\sqrt{x} \\cdot 1}{(${denom})^2}` },
			{ label: 'Utvid teljaren', latex: `f'(x) = \\frac{\\frac{${denom}}{2\\sqrt{x}} - \\sqrt{x}}{(${denom})^2}` },
			{ label: 'Felles nemnar', latex: `f'(x) = \\frac{${denom} - 2x}{2\\sqrt{x}(${denom})^2}` },
			{ label: 'Forenkle', latex: `f'(x) = \\frac{${a}-x}{2\\sqrt{x}(${denom})^2}` }
		];
	}

	const lastStep = structuredSteps[structuredSteps.length - 1];
	return {
		topic: 'quotient',
		level: lvl,
		type: 'poly',
		q,
		a: lastStep.latex,
		structuredSteps,
		hint: lvl <= 3 ? "Brøkregel: (u'v - uv') / v²." : "Brøkregel + kjerneregel på nemnaren."
	};
}

// ── Public API ──

export function generateSingleProblem(rule: TopicId, lvl: number, variant = 0): Draft | null {
	switch (rule) {
		case 'chain':
			return generateChainProblem(lvl, variant);
		case 'product':
			return generateProductProblem(lvl, variant);
		case 'quotient':
			return generateQuotientProblem(lvl, variant);
	}
}

export const MODULE_ID = 'derivative';

/** Variants generated per (rule x level). */
const VARIANTS = 8;

export function generateProblemBank(): Problem[] {
	const rules: TopicId[] = ['chain', 'product', 'quotient'];
	const levels = [1, 2, 3, 4, 5];
	const bank: Problem[] = [];

	for (const rule of rules) {
		for (const lvl of levels) {
			for (let variant = 0; variant < VARIANTS; variant++) {
				const id = `${MODULE_ID}:${rule}:${lvl}:${variant}`;
				// Seed before generating so this id always yields this problem.
				rng = rngFor(id);
				const prob = generateSingleProblem(rule, lvl, variant);
				if (prob) bank.push({ ...prob, id, moduleId: MODULE_ID });
			}
		}
	}

	rng = Math.random;
	return bank;
}
