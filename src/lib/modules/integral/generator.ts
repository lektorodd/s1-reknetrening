// Problem generator for integration methods — S2.
//
// Everything here is generated *backwards*: the antiderivative is chosen first
// and the integrand follows from it. The generator therefore never integrates,
// and question and answer cannot drift apart — which matters far more here than
// for derivatives, where the forward direction is mechanical.
//
// Limits the S2 syllabus imposes, kept as properties of the templates rather
// than as a filter afterwards:
//   · no trigonometry
//   · no irreducible quadratic in a denominator, unless the numerator is a
//     multiple of its derivative (which makes it a substitution)
//   · no integrand without an elementary antiderivative — x·e^(x²) is fine,
//     e^(x²) alone is not
//   · no improper integrals, and no definite integral spanning a pole
//
// Every formula below was checked numerically (central difference on F against
// f) before it was written, the same way the knowledge base checked it with
// sympy. The check lives on in engine.test.ts.

import type { Problem, StepEntry } from '../types';
import { rngFor } from '../rng';

export type TopicId = 'substitution' | 'parts' | 'partial' | 'mixed';

/** Draft problem — id and moduleId are attached by generateBank(). */
type Draft = Omit<Problem, 'id' | 'moduleId'>;

let rng: () => number = Math.random;

// ── Number and LaTeX helpers ──

function rand(min: number, max: number): number {
	return Math.floor(rng() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
	return arr[Math.floor(rng() * arr.length)];
}

function gcd(a: number, b: number): number {
	a = Math.abs(a);
	b = Math.abs(b);
	while (b) [a, b] = [b, a % b];
	return a || 1;
}

/** A reduced fraction as LaTeX: 6/3 -> "2", 3/5 -> "\frac{3}{5}", -1/2 -> "-\frac{1}{2}". */
function frac(p: number, q: number): string {
	if (q < 0) [p, q] = [-p, -q];
	const g = gcd(p, q);
	p /= g;
	q /= g;
	if (q === 1) return `${p}`;
	return p < 0 ? `-\\frac{${-p}}{${q}}` : `\\frac{${p}}{${q}}`;
}

/** p/q as a coefficient in front of an expression, dropping a bare 1. */
function coef(p: number, q: number, expr: string): string {
	if (q < 0) [p, q] = [-p, -q];
	const g = gcd(p, q);
	p /= g;
	q /= g;
	if (q === 1) {
		if (p === 1) return expr;
		if (p === -1) return `-${expr}`;
		return `${p}${expr}`;
	}
	return p < 0 ? `-\\frac{${-p}}{${q}}${expr}` : `\\frac{${p}}{${q}}${expr}`;
}

/** An expression over an integer denominator: "\frac{expr}{n}", or expr when n = 1. */
function over(expr: string, den: number): string {
	if (den === 1) return expr;
	if (den === -1) return `-${expr}`;
	return den < 0 ? `-\\frac{${expr}}{${-den}}` : `\\frac{${expr}}{${den}}`;
}

/**
 * The same, for an expression that is a *sum*. Negating one needs a bracket:
 * without it, -(2x-3) comes out as "-2x-3", which is a different polynomial.
 */
function overSum(expr: string, den: number): string {
	if (den === 1) return expr;
	if (den === -1) return `-\\left(${expr}\\right)`;
	return den < 0 ? `-\\frac{${expr}}{${-den}}` : `\\frac{${expr}}{${den}}`;
}

/** An integer coefficient in front of a variable: 1x -> "x", -1x -> "-x". */
function times(k: number, expr: string): string {
	if (k === 1) return expr;
	if (k === -1) return `-${expr}`;
	return `${k}${expr}`;
}

/** A signed term to append: 3 -> "+3", -3 -> "-3", 0 -> "". */
function plus(n: number): string {
	if (n === 0) return '';
	return n > 0 ? `+${n}` : `${n}`;
}

/** A signed term with a variable: 1 -> "+x", -1 -> "-x", 3 -> "+3x", 0 -> "". */
function plusTimes(k: number, expr: string): string {
	if (k === 0) return '';
	if (k === 1) return `+${expr}`;
	if (k === -1) return `-${expr}`;
	return `${k > 0 ? '+' : ''}${k}${expr}`;
}

/**
 * A signed fractional term to append, so a negative value never reads "+ -6x".
 * The sign of the whole fraction decides, not the sign of the numerator.
 */
function plusFrac(p: number, q: number, expr: string): string {
	if (p === 0) return '';
	if (q < 0) [p, q] = [-p, -q];
	const mag = Math.abs(p);
	// An empty expression means the term *is* the number, so the 1 that coef()
	// drops as a multiplier has to be written out.
	const body = expr === '' ? frac(mag, q) : coef(mag, q, expr);
	return p > 0 ? `+ ${body}` : `- ${body}`;
}

/** base^n, with the exponent dropped when it is 1. */
function powOf(base: string, n: number): string {
	return n === 1 ? base : `${base}^{${n}}`;
}

/** x^n, with the exponent dropped when it is 1. */
function powX(n: number): string {
	return powOf('x', n);
}

/** u^n, likewise — the substitution steps print plenty of these. */
function powU(n: number): string {
	return powOf('u', n);
}

/** (ln x)^n, written plainly when n is 1. */
function lnPow(n: number): string {
	return n === 1 ? '\\ln x' : `(\\ln x)^{${n}}`;
}

/** A fraction whose numerator may be negative: -12/(…) reads "-\frac{12}{…}". */
function signedOver(num: number, den: string): string {
	return num < 0 ? `-\\frac{${-num}}{${den}}` : `\\frac{${num}}{${den}}`;
}

/** ax+b, tidied: "3x+2", "x-1", "-2x". */
function lin(a: number, b: number): string {
	return `${times(a, 'x')}${plus(b)}`;
}

/** An exponent, dropped when it is 1. */
function sup(n: number): string {
	return n === 1 ? '' : `^{${n}}`;
}

/** x - r as a factor, so r = -2 reads "(x+2)" and r = 0 reads "x". */
function factor(r: number): string {
	if (r === 0) return 'x';
	return `(x${plus(-r)})`;
}

/** Expand (x-r1)(x-r2) into x^2+px+q form. */
function expandQuadratic(r1: number, r2: number): string {
	return `x^{2}${plusTimes(-(r1 + r2), 'x')}${plus(r1 * r2)}`;
}

const INTEGRAL = (body: string) => `\\int ${body}\\,dx`;
const DEFINITE = (lo: string, hi: string, body: string) =>
	`\\int_{${lo}}^{${hi}} ${body}\\,dx`;

/** Close a draft: the answer is always the last line of the worked solution. */
function draft(
	topic: TopicId,
	level: number,
	type: string,
	q: string,
	structuredSteps: StepEntry[],
	hint: string
): Draft {
	return {
		topic,
		level,
		type,
		q,
		a: structuredSteps[structuredSteps.length - 1].latex,
		structuredSteps,
		hint
	};
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VARIABELSKIFTE — the chain rule read backwards
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Level 1: linear kernel. ∫f(ax+b)dx = (1/a)F(ax+b). */
function subLinear(): Draft {
	const a = rand(2, 5);
	const b = pick([-5, -3, -2, -1, 1, 2, 3, 4, 5]);
	const u = lin(a, b);
	const kind = pick(['pow', 'exp', 'log', 'root']);

	let q: string, steps: StepEntry[];

	if (kind === 'pow') {
		const n = rand(2, 6);
		q = INTEGRAL(`(${u})^{${n}}`);
		steps = [
			{ label: 'Vel kjernen', latex: `u = ${u}` },
			{ label: 'Deriver og løys for dx', latex: `\\frac{du}{dx} = ${a} \\Rightarrow dx = \\frac{du}{${a}}` },
			{ label: 'Set inn og forkort', latex: `\\int ${powU(n)}\\,\\frac{du}{${a}} = ${coef(1, a, '')}\\int ${powU(n)}\\,du` },
			{ label: 'Integrer med omsyn på u', latex: over(`${powU(n + 1)}`, a * (n + 1)) },
			{ label: 'Set tilbake', latex: `${over(`(${u})^{${n + 1}}`, a * (n + 1))} + C` }
		];
	} else if (kind === 'exp') {
		q = INTEGRAL(`e^{${u}}`);
		steps = [
			{ label: 'Vel kjernen', latex: `u = ${u}` },
			{ label: 'Deriver og løys for dx', latex: `dx = \\frac{du}{${a}}` },
			{ label: 'Set inn og forkort', latex: `${coef(1, a, '')}\\int e^{u}\\,du` },
			{ label: 'Integrer med omsyn på u', latex: coef(1, a, 'e^{u}') },
			{ label: 'Set tilbake', latex: `${coef(1, a, `e^{${u}}`)} + C` }
		];
	} else if (kind === 'log') {
		// k a multiple of a keeps the answer's coefficient a whole number.
		const k = a * rand(1, 3) * pick([1, -1]);
		q = INTEGRAL(signedOver(k, u));
		steps = [
			{ label: 'Vel kjernen', latex: `u = ${u}` },
			{ label: 'Deriver og løys for dx', latex: `dx = \\frac{du}{${a}}` },
			{ label: 'Set inn og forkort', latex: `${coef(k, a, '')}\\int \\frac{1}{u}\\,du` },
			{ label: 'Integrer med omsyn på u', latex: coef(k, a, '\\ln|u|') },
			{ label: 'Set tilbake', latex: `${coef(k, a, `\\ln|${u}|`)} + C` }
		];
	} else {
		q = INTEGRAL(`\\sqrt{${u}}`);
		steps = [
			{ label: 'Vel kjernen', latex: `u = ${u}` },
			{ label: 'Deriver og løys for dx', latex: `dx = \\frac{du}{${a}}` },
			{ label: 'Set inn og forkort', latex: `${coef(1, a, '')}\\int u^{1/2}\\,du` },
			{ label: 'Integrer med omsyn på u', latex: coef(2, 3 * a, 'u^{3/2}') },
			{ label: 'Set tilbake', latex: `${coef(2, 3 * a, `(${u})^{3/2}`)} + C` }
		];
	}

	return draft('substitution', 1, 'linear', q, steps, 'Kjernen er lineær. Kva blir $dx$ uttrykt med $du$?');
}

/** Level 2: u' stands in the integrand exactly, no constant to fix. */
function subExact(): Draft {
	const kind = pick(['pow', 'logderiv', 'lnpow', 'expfrac']);

	if (kind === 'pow') {
		const c = rand(1, 6);
		const n = rand(2, 4);
		const u = `x^{2}+${c}`;
		return draft('substitution', 2, 'exact',
			INTEGRAL(`2x(${u})^{${n}}`),
			[
				{ label: 'Vel kjernen', latex: `u = ${u}` },
				{ label: 'Deriver og løys for dx', latex: `\\frac{du}{dx} = 2x \\Rightarrow dx = \\frac{du}{2x}` },
				{ label: 'Set inn og forkort', latex: `\\int 2x\\,${powU(n)}\\,\\frac{du}{2x} = \\int ${powU(n)}\\,du` },
				{ label: 'Integrer med omsyn på u', latex: over(`${powU(n + 1)}`, n + 1) },
				{ label: 'Set tilbake', latex: `${over(`(${u})^{${n + 1}}`, n + 1)} + C` }
			],
			'Står den deriverte av kjernen allereie som faktor?');
	}

	if (kind === 'logderiv') {
		// p² - 4q < 0, so the quadratic is always positive and the absolute value
		// can be dropped — which is itself worth saying in the last step.
		const p = pick([1, 2, -1, -2]);
		const q = rand(Math.floor((p * p) / 4) + 2, 6);
		const u = `x^{2}${plus(p)}x${plus(q)}`;
		return draft('substitution', 2, 'exact',
			INTEGRAL(`\\frac{2x${plus(p)}}{${u}}`),
			[
				{ label: 'Teljaren er den deriverte av nemnaren', latex: `u = ${u}, \\quad u' = 2x${plus(p)}` },
				{ label: 'Deriver og løys for dx', latex: `dx = \\frac{du}{2x${plus(p)}}` },
				{ label: 'Set inn og forkort', latex: `\\int \\frac{2x${plus(p)}}{u}\\cdot\\frac{du}{2x${plus(p)}} = \\int \\frac{1}{u}\\,du` },
				{ label: 'Integrer med omsyn på u', latex: `\\ln|u|` },
				{ label: 'Set tilbake. Nemnaren har ingen reelle nullpunkt, så han er alltid positiv', latex: `\\ln(${u}) + C` }
			],
			'Sjekk om teljaren er den deriverte av nemnaren. Då er dette ikkje delbrøk.');
	}

	if (kind === 'lnpow') {
		const n = rand(1, 4);
		return draft('substitution', 2, 'exact',
			INTEGRAL(`\\frac{${lnPow(n)}}{x}`),
			[
				{ label: 'Vel kjernen', latex: `u = \\ln x` },
				{ label: 'Deriver og løys for dx', latex: `\\frac{du}{dx} = \\frac{1}{x} \\Rightarrow dx = x\\,du` },
				{ label: 'Set inn og forkort', latex: `\\int \\frac{${powU(n)}}{x}\\cdot x\\,du = \\int ${powU(n)}\\,du` },
				{ label: 'Integrer med omsyn på u', latex: over(`${powU(n + 1)}`, n + 1) },
				{ label: 'Set tilbake', latex: `${over(lnPow(n + 1), n + 1)} + C` }
			],
			'$\\ln x$ og $\\frac{1}{x}$ i same integrand — den eine er den deriverte av den andre.');
	}

	const c = rand(1, 5);
	return draft('substitution', 2, 'exact',
		INTEGRAL(`\\frac{e^{x}}{e^{x}+${c}}`),
		[
			{ label: 'Vel kjernen', latex: `u = e^{x}+${c}` },
			{ label: 'Deriver og løys for dx', latex: `\\frac{du}{dx} = e^{x} \\Rightarrow dx = \\frac{du}{e^{x}}` },
			{ label: 'Set inn og forkort', latex: `\\int \\frac{e^{x}}{u}\\cdot\\frac{du}{e^{x}} = \\int \\frac{1}{u}\\,du` },
			{ label: 'Integrer med omsyn på u', latex: `\\ln|u|` },
			{ label: `Set tilbake. $e^{x}+${c}$ er alltid positiv`, latex: `\\ln(e^{x}+${c}) + C` }
		],
		'Nemnaren er kjernen, og den deriverte står i teljaren.');
}

/** Level 3: u' is there, but with the wrong constant in front. */
function subScaled(): Draft {
	const kind = pick(['pow', 'exppow', 'logfrac', 'root']);

	if (kind === 'pow') {
		const c = rand(1, 6);
		const n = rand(2, 4);
		const u = `x^{2}+${c}`;
		return draft('substitution', 3, 'scaled',
			INTEGRAL(`x(${u})^{${n}}`),
			[
				{ label: 'Vel kjernen', latex: `u = ${u}` },
				{ label: 'Deriver og løys for dx', latex: `\\frac{du}{dx} = 2x \\Rightarrow dx = \\frac{du}{2x}` },
				{ label: 'Set inn og forkort. Det står $x$, ikkje $2x$, så det blir ein halv att', latex: `\\int x\\,${powU(n)}\\,\\frac{du}{2x} = \\frac{1}{2}\\int ${powU(n)}\\,du` },
				{ label: 'Integrer med omsyn på u', latex: over(`${powU(n + 1)}`, 2 * (n + 1)) },
				{ label: 'Set tilbake', latex: `${over(`(${u})^{${n + 1}}`, 2 * (n + 1))} + C` }
			],
			'Den deriverte av kjernen er $2x$, men det står berre $x$. Kva må du justere med?');
	}

	if (kind === 'exppow') {
		const m = rand(2, 3);
		const k = pick([1, 2, 3]);
		const u = m === 2 ? `x^{2}` : `x^{${m}}`;
		const inner = k === 1 ? u : `${k}${u}`;
		return draft('substitution', 3, 'scaled',
			INTEGRAL(`${powX(m - 1)}e^{${inner}}`),
			[
				{ label: 'Vel kjernen', latex: `u = ${inner}` },
				{ label: 'Deriver og løys for dx', latex: `\\frac{du}{dx} = ${times(k * m, powX(m - 1))} \\Rightarrow dx = \\frac{du}{${times(k * m, powX(m - 1))}}` },
				{ label: 'Set inn og forkort', latex: `${coef(1, k * m, '')}\\int e^{u}\\,du` },
				{ label: 'Integrer med omsyn på u', latex: coef(1, k * m, 'e^{u}') },
				{ label: 'Set tilbake', latex: `${coef(1, k * m, `e^{${inner}}`)} + C` }
			],
			`Kjernen er $${inner}$. Står heile den deriverte som faktor, eller berre ein del av han?`);
	}

	if (kind === 'logfrac') {
		const c = rand(1, 9);
		const u = `x^{2}+${c}`;
		return draft('substitution', 3, 'scaled',
			INTEGRAL(`\\frac{x}{${u}}`),
			[
				{ label: 'Teljaren liknar den deriverte av nemnaren', latex: `u = ${u}, \\quad u' = 2x` },
				{ label: 'Deriver og løys for dx', latex: `dx = \\frac{du}{2x}` },
				{ label: 'Set inn og forkort', latex: `\\int \\frac{x}{u}\\cdot\\frac{du}{2x} = \\frac{1}{2}\\int \\frac{1}{u}\\,du` },
				{ label: 'Integrer med omsyn på u', latex: `\\frac{1}{2}\\ln|u|` },
				{ label: `Set tilbake. $${u}$ er alltid positiv`, latex: `\\frac{1}{2}\\ln(${u}) + C` }
			],
			'Dette er eit variabelskifte, ikkje ein delbrøk. Kva er $(x^2+c)\'$?');
	}

	const c = rand(1, 6);
	const u = `x^{2}+${c}`;
	return draft('substitution', 3, 'scaled',
		INTEGRAL(`x\\sqrt{${u}}`),
		[
			{ label: 'Vel kjernen', latex: `u = ${u}` },
			{ label: 'Deriver og løys for dx', latex: `dx = \\frac{du}{2x}` },
			{ label: 'Set inn og forkort', latex: `\\frac{1}{2}\\int u^{1/2}\\,du` },
			{ label: 'Integrer med omsyn på u', latex: `\\frac{1}{3}u^{3/2}` },
			{ label: 'Set tilbake', latex: `\\frac{1}{3}(${u})^{3/2} + C` }
		],
		'Rota er den ytre funksjonen. Kva står inni?');
}

/**
 * Level 4: definite integrals and kernels that are not polynomials.
 *
 * The bounds are chosen from the u-side first, so both the u-limits and the
 * answer come out clean — and so no bound can land on a pole.
 */
function subDefinite(): Draft {
	const kind = pick(['rootkernel', 'expkernel', 'lnbound', 'sqrtexp', 'lnln']);

	if (kind === 'rootkernel') {
		// ∫₀^m x√(1+ax²) dx. Chosen so 1+am² is a perfect square: then the u-limits
		// and the value are both whole, and the bounds cannot land anywhere awkward.
		const [a, m, top] = pick([
			[3, 1, 4],
			[8, 1, 9],
			[2, 2, 9],
			[6, 2, 25]
		]) as number[];
		const rise = Math.round(Math.pow(top, 1.5)) - 1;
		return draft('substitution', 4, 'definite',
			DEFINITE('0', `${m}`, `x\\sqrt{1+${a}x^{2}}`),
			[
				{ label: 'Vel kjernen', latex: `u = 1+${a}x^{2}, \\quad dx = \\frac{du}{${2 * a}x}` },
				{ label: 'Byt grensene: dei er verdiar av $x$, og $u$ har andre verdiar i endepunkta', latex: `x: 0 \\to ${m} \\quad\\Rightarrow\\quad u: 1 \\to ${top}` },
				{ label: 'Set inn og forkort', latex: `\\int_{1}^{${top}} x\\sqrt{u}\\,\\frac{du}{${2 * a}x} = ${coef(1, 2 * a, '')}\\int_{1}^{${top}} u^{1/2}\\,du` },
				{ label: 'Integrer', latex: `${coef(1, 2 * a, '')}\\left[\\frac{2}{3}u^{3/2}\\right]_{1}^{${top}}` },
				{ label: 'Rekn ut', latex: frac(rise, 3 * a) }
			],
			'Bestemt integral: byt grensene når du byter variabel.');
	}

	if (kind === 'expkernel') {
		const a = pick([1, 2, 3]);
		const inner = a === 1 ? 'x^{2}' : `${a}x^{2}`;
		const eTop = a === 1 ? 'e' : `e^{${a}}`;
		return draft('substitution', 4, 'definite',
			DEFINITE('0', '1', `x e^{${inner}}`),
			[
				{ label: 'Vel kjernen', latex: `u = ${inner}, \\quad dx = \\frac{du}{${2 * a}x}` },
				{ label: 'Byt grensene', latex: `x: 0 \\to 1 \\quad\\Rightarrow\\quad u: 0 \\to ${a}` },
				{ label: 'Set inn og forkort', latex: `${coef(1, 2 * a, '')}\\int_{0}^{${a}} e^{u}\\,du` },
				{ label: 'Integrer', latex: `${coef(1, 2 * a, '')}\\left[e^{u}\\right]_{0}^{${a}}` },
				{ label: 'Rekn ut', latex: `\\frac{${eTop}-1}{${2 * a}}` }
			],
			'$x e^{x^2}$ går fint. $e^{x^2}$ åleine gjer det ikkje — kva er skilnaden?');
	}

	if (kind === 'lnbound') {
		const m = rand(2, 4);
		return draft('substitution', 4, 'definite',
			DEFINITE('1', `e^{${m}}`, `\\frac{\\ln x}{x}`),
			[
				{ label: 'Vel kjernen', latex: `u = \\ln x, \\quad dx = x\\,du` },
				{ label: 'Byt grensene', latex: `x: 1 \\to e^{${m}} \\quad\\Rightarrow\\quad u: 0 \\to ${m}` },
				{ label: 'Set inn og forkort', latex: `\\int_{0}^{${m}} u\\,du` },
				{ label: 'Integrer', latex: `\\left[\\frac{u^{2}}{2}\\right]_{0}^{${m}}` },
				{ label: 'Rekn ut', latex: frac(m * m, 2) }
			],
			'Grensene er $x$-verdiar. Kva er $\\ln x$ i endepunkta?');
	}

	if (kind === 'sqrtexp') {
		return draft('substitution', 4, 'definite',
			INTEGRAL(`\\frac{e^{\\sqrt{x}}}{\\sqrt{x}}`),
			[
				{ label: 'Vel kjernen', latex: `u = \\sqrt{x}` },
				{ label: 'Deriver og løys for dx', latex: `\\frac{du}{dx} = \\frac{1}{2\\sqrt{x}} \\Rightarrow dx = 2\\sqrt{x}\\,du` },
				{ label: 'Set inn og forkort', latex: `\\int \\frac{e^{u}}{\\sqrt{x}}\\cdot 2\\sqrt{x}\\,du = 2\\int e^{u}\\,du` },
				{ label: 'Integrer med omsyn på u', latex: `2e^{u}` },
				{ label: 'Set tilbake', latex: `2e^{\\sqrt{x}} + C` }
			],
			'Kjernen treng ikkje vere eit polynom. Kva er $(\\sqrt{x})\'$?');
	}

	return draft('substitution', 4, 'definite',
		INTEGRAL(`\\frac{1}{x\\ln x}`),
		[
			{ label: 'Vel kjernen', latex: `u = \\ln x` },
			{ label: 'Deriver og løys for dx', latex: `dx = x\\,du` },
			{ label: 'Set inn og forkort', latex: `\\int \\frac{1}{x u}\\cdot x\\,du = \\int \\frac{1}{u}\\,du` },
			{ label: 'Integrer med omsyn på u', latex: `\\ln|u|` },
			{ label: 'Set tilbake', latex: `\\ln|\\ln x| + C` }
		],
		'Skriv om til $\\frac{1/x}{\\ln x}$. Ser du $\\frac{u\'}{u}$?');
}

/** Level 5: the leftover x has to be expressed in u, or the kernel found first. */
function subRewrite(): Draft {
	const kind = pick(['frac', 'shift', 'xln']);

	if (kind === 'frac') {
		const b = rand(1, 4);
		return draft('substitution', 5, 'rewrite',
			INTEGRAL(`\\frac{x}{\\sqrt{x+${b}}}`),
			[
				{ label: `Vel kjernen. Her er $u' = 1$, så $x$ forsvinn ikkje av seg sjølv`, latex: `u = x+${b}, \\quad dx = du` },
				{ label: 'Uttrykk den ekstra $x$-en med $u$', latex: `x = u-${b}` },
				{ label: 'Set inn og del opp brøken', latex: `\\int \\frac{u-${b}}{\\sqrt{u}}\\,du = \\int \\left(u^{1/2} - ${b}u^{-1/2}\\right)du` },
				{ label: 'Integrer', latex: `\\frac{2}{3}u^{3/2} - ${2 * b}u^{1/2}` },
				{ label: 'Set tilbake', latex: `\\frac{2}{3}(x+${b})^{3/2} - ${2 * b}\\sqrt{x+${b}} + C` }
			],
			'Alle $x$ skal forsvinne. Når $u\' = 1$, må den ekstra $x$-en skrivast med $u$.');
	}

	if (kind === 'shift') {
		const b = rand(1, 4);
		const n = rand(3, 5);
		return draft('substitution', 5, 'rewrite',
			INTEGRAL(`x(x-${b})^{${n}}`),
			[
				{ label: 'Vel kjernen', latex: `u = x-${b}, \\quad dx = du` },
				{ label: 'Uttrykk $x$ med $u$', latex: `x = u+${b}` },
				{ label: 'Set inn og gong ut', latex: `\\int (u+${b})${powU(n)}\\,du = \\int \\left(${powU(n + 1)} + ${b}${powU(n)}\\right)du` },
				{ label: 'Integrer', latex: `${over(`u^{${n + 2}}`, n + 2)} + ${coef(b, n + 1, `${powU(n + 1)}`)}` },
				{ label: 'Set tilbake', latex: `${over(`(x-${b})^{${n + 2}}`, n + 2)} + ${coef(b, n + 1, `(x-${b})^{${n + 1}}`)} + C` }
			],
			'Delvis integrasjon går òg. Men prøv $u = x-b$ og skriv $x$ med $u$.');
	}

	const c = rand(1, 5);
	const u = `x^{2}+${c}`;
	return draft('substitution', 5, 'rewrite',
		INTEGRAL(`x\\ln(${u})`),
		[
			{ label: 'Vel kjernen', latex: `u = ${u}, \\quad dx = \\frac{du}{2x}` },
			{ label: 'Set inn og forkort', latex: `\\int x\\ln u\\,\\frac{du}{2x} = \\frac{1}{2}\\int \\ln u\\,du` },
			{ label: 'Bruk $\\int \\ln u\\,du = u\\ln u - u$ (delvis integrasjon)', latex: `\\frac{1}{2}\\left(u\\ln u - u\\right)` },
			{ label: 'Set tilbake', latex: `\\frac{1}{2}\\left((${u})\\ln(${u}) - (${u})\\right) + C` }
		],
		'To metodar i serie: variabelskifte først, så delvis integrasjon på $\\int \\ln u\\,du$.');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DELVIS INTEGRASJON — the product rule read backwards
//
// NDLA's convention throughout: ∫u'v dx = uv - ∫uv' dx, where u' is the factor
// we integrate and v the factor we differentiate. Sources differ on which
// letter is which, so it is held fixed across the whole module.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** e^{kx} written tidily: e^x, e^{-x}, e^{2x}. */
function expKx(k: number): string {
	if (k === 1) return 'e^{x}';
	if (k === -1) return 'e^{-x}';
	return `e^{${k}x}`;
}

/** Level 1: (ax+b)·e^{kx} — one round, the polynomial differentiates to a constant. */
function partsExp(): Draft {
	const k = pick([1, 2, 3, -1, -2]);
	const a = rand(1, 4);
	const b = pick([0, 1, -1, 2, -3]);
	const poly = b === 0 ? times(a, 'x') : `(${lin(a, b)})`;
	const E = expKx(k);

	return draft('parts', 1, 'exp',
		INTEGRAL(`${poly}${E}`),
		[
			{ label: 'Vel roller: deriver polynomet, integrer eksponentialfunksjonen', latex: `v = ${lin(a, b)},\\ v' = ${a}, \\quad u' = ${E},\\ u = ${coef(1, k, E)}` },
			{ label: 'Set inn i $uv - \\int uv\'$', latex: `${coef(1, k, `(${lin(a, b)})${E}`)} - \\int ${coef(a, k, E)}\\,dx` },
			{ label: 'Integrer det nye integralet', latex: `${coef(1, k, `(${lin(a, b)})${E}`)} ${plusFrac(-a, k * k, E)}` },
			{
				label: 'Skriv saman',
				// With k = 1 the two terms collapse into one polynomial, which is how
				// the knowledge base writes it: ∫(3x-1)e^x dx = e^x(3x-4) + C.
				latex:
					k === 1
						? `${E}\\left(${lin(a, b - a)}\\right) + C`
						: `${E}\\left(${overSum(lin(a, b), k)} ${plusFrac(-a, k * k, '')}\\right) + C`
			}
		],
		'Kva faktor blir enklare av å bli derivert? Og blir den andre verre av å bli integrert?');
}

/** Level 2: x^n·ln x — ln is what must be differentiated. */
function partsLog(): Draft {
	const n = rand(1, 3);
	const A = pick([1, 1, 2, 3]);
	const poly = times(A, powX(n));

	// ∫x^n ln x dx = x^(n+1)/(n+1)·ln x - x^(n+1)/(n+1)²
	return draft('parts', 2, 'log',
		INTEGRAL(`${poly}\\ln x`),
		[
			{ label: '$\\ln x$ skal deriverast — vi kan ikkje integrere han direkte', latex: `v = \\ln x,\\ v' = \\frac{1}{x}, \\quad u' = ${poly},\\ u = ${coef(A, n + 1, `x^{${n + 1}}`)}` },
			{ label: 'Set inn i formelen', latex: `${coef(A, n + 1, `x^{${n + 1}}`)}\\ln x - \\int ${coef(A, n + 1, `x^{${n + 1}}`)}\\cdot\\frac{1}{x}\\,dx` },
			{ label: 'Forkort i det nye integralet', latex: `${coef(A, n + 1, `x^{${n + 1}}`)}\\ln x - ${coef(A, n + 1, '')}\\int ${powX(n)}\\,dx` },
			{ label: 'Integrer', latex: `${coef(A, n + 1, `x^{${n + 1}}`)}\\ln x - ${coef(A, (n + 1) * (n + 1), `x^{${n + 1}}`)} + C` }
		],
		'$\\ln x$ blir $\\frac{1}{x}$ og forkortar mot potensen. Kva skjer om du byter rollene?');
}

/** Level 3: fractional, root or negative exponent — same formula, harder algebra. */
function partsFrac(): Draft {
	const kind = pick(['negpow', 'root', 'exphalf', 'definite']);

	if (kind === 'negpow') {
		const m = rand(2, 4); // ∫ln x / x^m dx
		const n = -m;
		return draft('parts', 3, 'frac',
			INTEGRAL(`\\frac{\\ln x}{x^{${m}}}`),
			[
				{ label: 'Skriv om til ein potens, og deriver $\\ln x$', latex: `v = \\ln x,\\ v' = \\frac{1}{x}, \\quad u' = x^{${n}},\\ u = ${coef(1, n + 1, powX(n + 1))}` },
				{ label: 'Set inn i formelen', latex: `${coef(1, n + 1, powX(n + 1))}\\ln x - ${coef(1, n + 1, '')}\\int x^{${n}}\\,dx` },
				{ label: 'Integrer', latex: `${coef(1, n + 1, powX(n + 1))}\\ln x ${plusFrac(-1, (n + 1) * (n + 1), powX(n + 1))} + C` },
				{ label: 'Skriv med brøk', latex: `-\\frac{\\ln x}{${times(m - 1, powX(m - 1))}} - \\frac{1}{${times((m - 1) * (m - 1), powX(m - 1))}} + C` }
			],
			'Same formel som $\\int x^n\\ln x$, med negativ $n$. $\\ln$ skal framleis deriverast.');
	}

	if (kind === 'root') {
		return draft('parts', 3, 'frac',
			INTEGRAL(`\\sqrt{x}\\ln x`),
			[
				{ label: 'Skriv rota som potens, og deriver $\\ln x$', latex: `v = \\ln x,\\ v' = \\frac{1}{x}, \\quad u' = x^{1/2},\\ u = \\frac{2}{3}x^{3/2}` },
				{ label: 'Set inn i formelen', latex: `\\frac{2}{3}x^{3/2}\\ln x - \\frac{2}{3}\\int x^{1/2}\\,dx` },
				{ label: 'Integrer', latex: `\\frac{2}{3}x^{3/2}\\ln x - \\frac{2}{3}\\cdot\\frac{2}{3}x^{3/2}` },
				{ label: 'Forenkle', latex: `\\frac{2}{3}x^{3/2}\\ln x - \\frac{4}{9}x^{3/2} + C` }
			],
			'$\\sqrt{x} = x^{1/2}$. Kva er $\\frac{1}{x}\\cdot x^{3/2}$?');
	}

	if (kind === 'exphalf') {
		// ∫x e^{x/k} dx with a fractional rate — the 1/k² is easy to lose.
		const k = pick([-2, 2, -3, 3]);
		const E = `e^{${frac(1, k)}x}`;
		return draft('parts', 3, 'frac',
			INTEGRAL(`x${E}`),
			[
				{ label: 'Deriver $x$, integrer eksponentialfunksjonen', latex: `v = x,\\ v' = 1, \\quad u' = ${E},\\ u = ${times(k, E)}` },
				{ label: 'Set inn i formelen', latex: `${times(k, `x${E}`)} - \\int ${times(k, E)}\\,dx` },
				{ label: 'Integrer det nye integralet', latex: `${times(k, `x${E}`)} ${plusFrac(-(k * k), 1, E)}` },
				{ label: 'Faktoriser', latex: `${times(k, E)}\\left(x${plus(-k)}\\right) + C` }
			],
			'Rata er ein brøk, så $u$ får ein stor faktor. Deriver svaret ditt til slutt og sjekk.');
	}

	return draft('parts', 3, 'frac',
		DEFINITE('1', 'e', `x\\ln x`),
		[
			{ label: 'Vel roller', latex: `v = \\ln x,\\ v' = \\frac{1}{x}, \\quad u' = x,\\ u = \\frac{1}{2}x^{2}` },
			{ label: 'Finn den antideriverte', latex: `\\frac{1}{2}x^{2}\\ln x - \\frac{1}{4}x^{2}` },
			{ label: 'Set inn grensene. Merk $\\ln e = 1$ og $\\ln 1 = 0$', latex: `\\left(\\frac{e^{2}}{2} - \\frac{e^{2}}{4}\\right) - \\left(0 - \\frac{1}{4}\\right)` },
			{ label: 'Forenkle', latex: `\\frac{e^{2}+1}{4}` }
		],
		'Finn den antideriverte først, og set inn grensene heilt til slutt.');
}

/** Level 4: two rounds. */
function partsTwice(): Draft {
	const kind = pick(['x2exp', 'x2exp', 'lnsq']);

	if (kind === 'x2exp') {
		const k = pick([1, -1, 2, -2, 3, -3]);
		const A = pick([1, 1, 2, 3]);
		const E = expKx(k);
		const poly = times(A, 'x^{2}');
		return draft('parts', 4, 'twice',
			INTEGRAL(`${poly}${E}`),
			[
				{ label: 'Runde 1: $x^2$ må deriverast to gonger før han blir ein konstant', latex: `v = ${poly},\\ v' = ${2 * A}x, \\quad u' = ${E},\\ u = ${coef(1, k, E)}` },
				{ label: 'Set inn', latex: `${coef(A, k, `x^{2}${E}`)} - ${coef(2 * A, k, '')}\\int x${E}\\,dx` },
				{ label: 'Runde 2 på det nye integralet', latex: `\\int x${E}\\,dx = ${coef(1, k, `x${E}`)} ${plusFrac(-1, k * k, E)}` },
				{ label: 'Set inn og rydd', latex: `${coef(A, k, `x^{2}${E}`)} ${plusFrac(-2 * A, k * k, `x${E}`)} ${plusFrac(2 * A, k * k * k, E)} + C` },
				{ label: 'Faktoriser', latex: `${E}\\left(${coef(A, k, 'x^{2}')} ${plusFrac(-2 * A, k * k, 'x')} ${plusFrac(2 * A, k * k * k, '')}\\right) + C` }
			],
			'Kor mange gonger må $x^2$ deriverast før han blir ein konstant? Så mange rundar treng du.');
	}

	return draft('parts', 4, 'twice',
		INTEGRAL(`(\\ln x)^{2}`),
		[
			{ label: 'Gong med 1, og deriver $(\\ln x)^2$', latex: `v = (\\ln x)^{2},\\ v' = \\frac{2\\ln x}{x}, \\quad u' = 1,\\ u = x` },
			{ label: 'Set inn og forkort', latex: `x(\\ln x)^{2} - 2\\int \\ln x\\,dx` },
			{ label: 'Runde 2: $\\int \\ln x\\,dx = x\\ln x - x$', latex: `x(\\ln x)^{2} - 2(x\\ln x - x)` },
			{ label: 'Rydd', latex: `x(\\ln x)^{2} - 2x\\ln x + 2x + C` }
		],
		'«Gong med 1»-trikset, to gonger.');
}

/** Level 5: three rounds, or a substitution before the parts. */
function partsCombined(): Draft {
	const kind = pick(['cube', 'x3exp', 'lnlin', 'seeit']);

	if (kind === 'cube') {
		const k = pick([1, 2, -1]);
		const E = expKx(k);
		return draft('parts', 5, 'combined',
			INTEGRAL(`x^{3}${E}`),
			[
				{ label: 'Tre rundar: $x^3$ må deriverast tre gonger før han blir ein konstant', latex: `v = x^{3}, \\quad u' = ${E}` },
				{ label: 'Tabellmetoden: deriver den eine kolonnen ned til 0, integrer den andre like mange gonger', latex: `x^{3},\\ 3x^{2},\\ 6x,\\ 6 \\quad\\text{mot}\\quad ${coef(1, k, E)},\\ ${coef(1, k * k, E)},\\ \\ldots` },
				{ label: 'Gong diagonalt, med vekslande forteikn', latex: `${E}\\left(${coef(1, k, 'x^{3}')} ${plusFrac(-3, k * k, 'x^{2}')} ${plusFrac(6, k * k * k, 'x')} ${plusFrac(-6, k * k * k * k, '')}\\right) + C` }
			],
			'Tre rundar. Prøv tabellmetoden: deriver den eine til 0, integrer den andre.');
	}

	if (kind === 'x3exp') {
		const a = pick([1, 2]);
		const inner = a === 1 ? 'x^{2}' : `${a}x^{2}`;
		return draft('parts', 5, 'combined',
			INTEGRAL(`x^{3}e^{${inner}}`),
			[
				{ label: `Skriv som $x^{2}\\cdot xe^{${inner}}$ — den siste faktoren er eit variabelskifte`, latex: `v = x^{2}, \\quad u' = xe^{${inner}},\\ u = ${coef(1, 2 * a, `e^{${inner}}`)}` },
				{ label: 'Set inn i formelen', latex: `${coef(1, 2 * a, `x^{2}e^{${inner}}`)} - \\int ${coef(1, a, `xe^{${inner}}`)}\\,dx` },
				{ label: 'Det nye integralet er same variabelskifte', latex: `\\int xe^{${inner}}\\,dx = ${coef(1, 2 * a, `e^{${inner}}`)}` },
				{ label: 'Set inn og faktoriser', latex: `e^{${inner}}\\left(${coef(1, 2 * a, 'x^{2}')} ${plusFrac(-1, 2 * a * a, '')}\\right) + C` }
			],
			'To metodar i serie. Kva del av integranden er den deriverte av kjernen?');
	}

	if (kind === 'lnlin') {
		const a = rand(2, 4);
		const b = rand(1, 4);
		const u = lin(a, b);
		return draft('parts', 5, 'combined',
			INTEGRAL(`\\ln(${u})`),
			[
				{ label: 'Gong med 1', latex: `\\int 1\\cdot\\ln(${u})\\,dx` },
				{ label: 'Vel roller', latex: `v = \\ln(${u}),\\ v' = \\frac{${a}}{${u}}, \\quad u' = 1,\\ u = x` },
				{ label: 'Set inn i formelen', latex: `x\\ln(${u}) - ${a}\\int \\frac{x}{${u}}\\,dx` },
				{ label: `Del brøken, så han blir integrerbar: $\\frac{${a}x}{${u}} = 1 - \\frac{${b}}{${u}}$`, latex: `x\\ln(${u}) - \\int \\left(1 - \\frac{${b}}{${u}}\\right)dx` },
				{ label: 'Integrer og rydd', latex: `${coef(1, a, `(${u})\\ln(${u})`)} - x + C` }
			],
			'«Gong med 1», og så ein brøk som må delast opp før han kan integrerast.');
	}

	const n = rand(2, 4);
	return draft('parts', 5, 'combined',
		INTEGRAL(`\\left(x^{${n}} + ${times(n, powX(n - 1))}\\right)e^{x}`),
		[
			{ label: 'Sjå etter produktregelen baklengs før du reknar', latex: `\\left(x^{${n}}e^{x}\\right)' = ${times(n, powX(n - 1))}e^{x} + x^{${n}}e^{x}` },
			{ label: 'Det er nøyaktig integranden', latex: `\\left(x^{${n}}e^{x}\\right)' = \\left(x^{${n}}+${times(n, powX(n - 1))}\\right)e^{x}` },
			{ label: 'Så den antideriverte kan lesast direkte', latex: `x^{${n}}e^{x} + C` }
		],
		'Den som ser at dette er ein derivert, slepp å rekne. Kva er $(x^n e^x)\'$?');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DELBRØKOPPSPALTING
//
// Built backwards from the constants: pick the A's and the roots, and the
// numerator follows. gcd(P, Q) = 1 comes for free that way, since every A is
// non-zero and the roots are distinct — so no constant can turn out invisible.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** A ln|x-r| term, with the sign written out. */
function lnTerm(A: number, r: number, first = false): string {
	const body = `\\ln|x${plus(-r)}|`;
	if (A === 1) return first ? body : `+ ${body}`;
	if (A === -1) return first ? `-${body}` : `- ${body}`;
	if (A < 0) return first ? `${A}${body}` : `- ${-A}${body}`;
	return first ? `${A}${body}` : `+ ${A}${body}`;
}

function twoDistinctRoots(): [number, number] {
	const r1 = pick([0, 1, 2, 3, -1, -2, -3]);
	let r2 = pick([1, 2, 3, 4, -1, -2, -4]);
	while (r2 === r1) r2 = pick([1, 2, 3, 4, -1, -2, -4]);
	return [r1, r2];
}

/** Level 1: already factorised, constant numerator. */
function partialDistinct(): Draft {
	const [a, b] = twoDistinctRoots();
	const m = pick([1, 2, -1, 3]);
	const k = m * (a - b); // keeps the coefficient a whole number

	return draft('partial', 1, 'distinct',
		INTEGRAL(signedOver(k, `${factor(a)}${factor(b)}`)),
		[
			{ label: 'Nemnaren er ferdig faktorisert, og teljaren har lågare grad', latex: `\\frac{${k}}{${factor(a)}${factor(b)}} = \\frac{A}{x${plus(-a)}} + \\frac{B}{x${plus(-b)}}` },
			{ label: 'Gong med fellesnemnaren', latex: `${k} = A(x${plus(-b)}) + B(x${plus(-a)})` },
			{ label: `Set inn $x = ${a}$ og $x = ${b}$`, latex: `A = ${m}, \\quad B = ${-m}` },
			{ label: 'Integrer kvar delbrøk', latex: `${lnTerm(m, a, true)} ${lnTerm(-m, b)} + C` }
		],
		'Dekk til éin faktor og set inn nullpunktet hans. Då forsvinn alle ledd utanom eitt.');
}

/** Level 2: the denominator has to be factorised first; linear numerator. */
function partialFactor(): Draft {
	const [r1, r2] = twoDistinctRoots();
	const A = pick([1, 2, 3, -1, -2]);
	let B = pick([1, 2, -1, -2, 4]);
	// A = -B leaves a constant numerator, which is level 1, not level 2. A = B
	// makes the numerator a multiple of (denominator)', which turns the problem
	// into a substitution — that belongs at level 5, where it is the point.
	while (A === -B || A === B) B = B + 1 === 0 ? 2 : B + 1;

	// P = A(x-r2) + B(x-r1), expanded
	const pCoef = A + B;
	const pConst = -(A * r2 + B * r1);
	const numerator = pCoef === 0 ? `${pConst}` : `${times(pCoef, 'x')}${plus(pConst)}`;
	const Q = expandQuadratic(r1, r2);

	return draft('partial', 2, 'factor',
		INTEGRAL(`\\frac{${numerator}}{${Q}}`),
		[
			{ label: 'Er teljaren den deriverte av nemnaren? Nei — og graden er lågare, så ingen divisjon', latex: `(${Q})' = 2x${plus(-(r1 + r2))}` },
			{ label: 'Faktoriser nemnaren', latex: `${Q} = ${factor(r1)}${factor(r2)}` },
			{ label: 'Set opp delbrøkane', latex: `\\frac{${numerator}}{${factor(r1)}${factor(r2)}} = \\frac{A}{x${plus(-r1)}} + \\frac{B}{x${plus(-r2)}}` },
			{ label: 'Gong med fellesnemnaren og set inn nullpunkta', latex: `A = ${A}, \\quad B = ${B}` },
			{ label: 'Integrer kvar delbrøk', latex: `${lnTerm(A, r1, true)} ${lnTerm(B, r2)} + C` }
		],
		'Faktoriser nemnaren først. To ulike faktorar gir to delbrøkar med konstant teljar.');
}

/** Level 3: polynomial division first, a coefficient inside a factor, or a definite integral. */
function partialDivision(): Draft {
	const kind = pick(['division', 'coeff', 'definite']);

	if (kind === 'division') {
		const d = rand(1, 3);
		const c = pick([1, 2, 3, -2]);
		const rest = c + d * d; // (x²+c)/(x²-d²) = 1 + (c+d²)/(x²-d²)
		return draft('partial', 3, 'division',
			INTEGRAL(`\\frac{x^{2}${plus(c)}}{x^{2}-${d * d}}`),
			[
				{ label: 'Same grad i teljar og nemnar, så divider først', latex: `x^{2}${plus(c)} = (x^{2}-${d * d}) + ${rest}` },
				{ label: 'Skriv om', latex: `\\frac{x^{2}${plus(c)}}{x^{2}-${d * d}} = 1 + \\frac{${rest}}{x^{2}-${d * d}}` },
				{ label: 'Faktoriser og spalt resten', latex: `\\frac{${rest}}{${factor(d)}${factor(-d)}} = ${coef(rest, 2 * d, '')}\\left(\\frac{1}{x-${d}} - \\frac{1}{x+${d}}\\right)` },
				{ label: 'Integrer ledd for ledd', latex: `x + ${coef(rest, 2 * d, '')}\\left(\\ln|x-${d}| - \\ln|x+${d}|\\right) + C` }
			],
			'Grad i teljar $\\ge$ grad i nemnar. Kva må du gjere før du spaltar?');
	}

	if (kind === 'coeff') {
		// 1/((ax+b)(x+c)) — the 1/a that goes missing (F-P4).
		const a = rand(2, 3);
		const b = pick([-1, 1, 3]);
		const c = pick([1, 2, -1]);
		const den = a * c - b;
		if (den === 0) return partialDistinct();
		const Q = `${a}x^{2}${plus(a * c + b)}x${plus(b * c)}`;
		return draft('partial', 3, 'division',
			INTEGRAL(`\\frac{1}{${Q}}`),
			[
				{ label: 'Faktoriser nemnaren', latex: `${Q} = (${lin(a, b)})(x${plus(c)})` },
				{ label: 'Set opp delbrøkane', latex: `\\frac{1}{(${lin(a, b)})(x${plus(c)})} = \\frac{A}{${lin(a, b)}} + \\frac{B}{x${plus(c)}}` },
				{ label: 'Set inn nullpunkta', latex: `A = ${frac(a, den)}, \\quad B = ${frac(1, -den)}` },
				{ label: `Integrer. Merk: $\\int\\frac{dx}{${lin(a, b)}} = \\frac{1}{${a}}\\ln|${lin(a, b)}|$, ikkje $\\ln|${lin(a, b)}|$ — faktoren er $${a}x${plus(b)}$, ikkje $x${plus(b)}$`, latex: `${coef(1, den, '')}\\left(\\ln|${lin(a, b)}| - \\ln|x${plus(c)}|\\right) + C` }
			],
			'Faktoren er $ax+b$, ikkje $x+b$. Deriver svaret ditt og sjå om faktoren stemmer.');
	}

	const d = rand(1, 2);
	const lo = d + 1;
	const hi = d + 2;
	return draft('partial', 3, 'division',
		DEFINITE(`${lo}`, `${hi}`, `\\frac{1}{x^{2}-${d * d}}`),
		[
			{ label: `Spalt. Intervallet $[${lo},${hi}]$ inneheld ingen nullpunkt i nemnaren`, latex: `\\frac{1}{x^{2}-${d * d}} = ${coef(1, 2 * d, '')}\\left(\\frac{1}{x-${d}} - \\frac{1}{x+${d}}\\right)` },
			{ label: 'Finn den antideriverte', latex: `${coef(1, 2 * d, '')}\\Big[\\ln|x-${d}| - \\ln|x+${d}|\\Big]_{${lo}}^{${hi}}` },
			{ label: 'Set inn grensene', latex: `${coef(1, 2 * d, '')}\\left(\\ln\\frac{${hi - d}}{${hi + d}} - \\ln\\frac{${lo - d}}{${lo + d}}\\right)` },
			{ label: 'Forenkle med logaritmesetningane', latex: `${coef(1, 2 * d, '')}\\ln${frac((hi - d) * (lo + d), (hi + d) * (lo - d))}` }
		],
		'Sjekk at intervallet ikkje inneheld eit nullpunkt i nemnaren, og bruk logaritmesetningane til slutt.');
}

/** Level 4: three factors, or a repeated factor. */
function partialTriple(): Draft {
	if (rng() < 0.5) {
		// Three distinct roots. The numerator is built from the constants, so it
		// is a real polynomial rather than a "P(x)" the student cannot work with.
		const [r1, r2, r3] = pick([
			[0, 1, -1],
			[1, 2, -2],
			[0, 2, -1],
			[1, -1, 3]
		]) as number[];
		const [A, B, C] = [pick([1, 2, -1]), pick([1, -1, 2]), pick([-1, 1, 3])];

		// P = A(x-r2)(x-r3) + B(x-r1)(x-r3) + C(x-r1)(x-r2), expanded.
		const p2 = A + B + C;
		const p1 = -(A * (r2 + r3) + B * (r1 + r3) + C * (r1 + r2));
		const p0 = A * r2 * r3 + B * r1 * r3 + C * r1 * r2;
		const numerator =
			p2 === 0
				? `${plusTimes(p1, 'x')}${plus(p0)}`.replace(/^\+/, '') || '0'
				: `${times(p2, 'x^{2}')}${plusTimes(p1, 'x')}${plus(p0)}`;
		const Q = `${factor(r1)}${factor(r2)}${factor(r3)}`;

		return draft('partial', 4, 'triple',
			INTEGRAL(`\\frac{${numerator}}{${Q}}`),
			[
				{ label: 'Nemnaren har tre ulike faktorar, så tre delbrøkar', latex: `\\frac{${numerator}}{${Q}} = \\frac{A}{x${plus(-r1)}} + \\frac{B}{x${plus(-r2)}} + \\frac{C}{x${plus(-r3)}}` },
				{ label: 'Dekkjemetoden: dekk til éin faktor og set inn nullpunktet hans', latex: `A = ${A}, \\quad B = ${B}, \\quad C = ${C}` },
				{ label: 'Kontroll: koeffisienten til $x^{2}$ i teljaren skal vere $A+B+C$', latex: `A+B+C = ${p2}` },
				{ label: 'Integrer kvar delbrøk', latex: `${lnTerm(A, r1, true)} ${lnTerm(B, r2)} ${lnTerm(C, r3)} + C` }
			],
			'Tre førstegradsfaktorar gir tre delbrøkar med konstant teljar.');
	}

	// Repeated factor: (px+q)/(x-r)²
	const r = pick([1, 2, -1, -2]);
	const p = rand(1, 4);
	const q = pick([1, -3, 5, 2]);
	const B = p * r + q;
	const numerator = `${times(p, 'x')}${plus(q)}`;
	return draft('partial', 4, 'triple',
		INTEGRAL(`\\frac{${numerator}}{${factor(r)}^{2}}`),
		[
			{ label: 'Dobbel faktor, så begge potensane må med', latex: `\\frac{${numerator}}{(x${plus(-r)})^{2}} = \\frac{A}{x${plus(-r)}} + \\frac{B}{(x${plus(-r)})^{2}}` },
			{ label: `Skriv teljaren om: $${numerator} = ${p}(x${plus(-r)}) ${B >= 0 ? '+' : '-'} ${Math.abs(B)}$`, latex: `A = ${p}, \\quad B = ${B}` },
			{ label: 'Integrer. Merk at $\\int\\frac{dx}{(x-r)^{2}} = -\\frac{1}{x-r}$', latex: `${lnTerm(p, r, true)} ${B > 0 ? '-' : '+'} \\frac{${Math.abs(B)}}{x${plus(-r)}} + C` }
		],
		'Utan leddet med $(x-r)^2$ i nemnaren kan summen aldri få $(x-r)^2$ i fellesnemnaren.');
}

/** Level 5: a repeated factor with another factor beside it, and the classic trap. */
function partialRepeated(): Draft {
	if (rng() < 0.5) {
		// P(x)/(x²(x+e)) = A/x + B/x² + C/(x+e)
		const e = pick([1, 2, 3]);
		const C = pick([1, 2, -1]);
		const A = -C; // keeps the numerator first-degree, as in the knowledge base
		// A·e + B = 0 would leave a constant numerator, which is a different
		// problem — and `times(0, 'x')` would render a literal "0x".
		let B = rand(1, 3);
		if (A * e + B === 0) B += 1;
		const pCoef = A * e + B;
		const numerator = `${times(pCoef, 'x')}${plus(B * e)}`;
		return draft('partial', 5, 'repeated',
			INTEGRAL(`\\frac{${numerator}}{x^{2}(x+${e})}`),
			[
				{ label: '$x$ er ein dobbel faktor, så tre delbrøkar', latex: `\\frac{${numerator}}{x^{2}(x+${e})} = \\frac{A}{x} + \\frac{B}{x^{2}} + \\frac{C}{x+${e}}` },
				{ label: 'Gong med fellesnemnaren', latex: `${numerator} = Ax(x+${e}) + B(x+${e}) + Cx^{2}` },
				{ label: `Set inn $x=0$ og $x=-${e}$`, latex: `B = ${B}, \\quad C = ${C}` },
				{ label: 'Samanlikn $x^2$-ledda for å finne $A$', latex: `0 = A + C \\Rightarrow A = ${A}` },
				{ label: 'Integrer. Merk at $\\int\\frac{B}{x^{2}}dx = -\\frac{B}{x}$', latex: `${lnTerm(A, 0, true)} - \\frac{${B}}{x} ${lnTerm(C, -e)} + C` }
			],
			'Dekkjemetoden gir berre $B$ og $C$ her. $A$ må du finne ved å samanlikne koeffisientar.');
	}

	// The trap: this looks like a partial fraction, but the numerator is (a
	// multiple of) the derivative of the denominator, so substitution is far
	// shorter. An odd p would need a half-integer numerator, so it keeps 2x+p.
	const [r1, r2] = twoDistinctRoots();
	const p = -(r1 + r2);
	const Q = expandQuadratic(r1, r2);
	const halved = p % 2 === 0;
	const numerator = halved ? `x${plus(p / 2)}` : `2x${plus(p)}`;
	const scale = halved ? '\\frac{1}{2}' : '';

	return draft('partial', 5, 'repeated',
		INTEGRAL(`\\frac{${numerator}}{${Q}}`),
		[
			{ label: 'Sjekk teljaren mot den deriverte av nemnaren før du spaltar', latex: `(${Q})' = 2x${plus(p)}` },
			{
				label: halved ? 'Teljaren er nøyaktig halvparten av han' : 'Teljaren er nøyaktig han',
				latex: halved ? `${numerator} = \\frac{1}{2}\\left(2x${plus(p)}\\right)` : `${numerator} = (${Q})'`
			},
			{ label: 'Så dette er eit variabelskifte, ikkje ein delbrøk', latex: `u = ${Q}, \\quad ${scale}\\int\\frac{1}{u}\\,du` },
			{ label: 'Integrer', latex: `${scale}\\ln|${Q}| + C` }
		],
		'Delbrøk gir rett svar her, men det finst ein mykje kortare veg. Kva er $(\\text{nemnar})\'$?');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GRUNNREGLAR — not a topic of their own, but blanda mode needs them
//
// Many integrals that *look* like they need a method fall to a rewrite. Without
// these in the mix, "it appeared in blanda mode" would itself be a signal that
// a method is called for.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function basicRule(level: number, type: string): Draft {
	const kind = pick(['splitfrac', 'rootexpand', 'power']);

	if (kind === 'splitfrac') {
		const a = rand(2, 5);
		const b = pick([-3, -5, 1, 4]);
		return draft('mixed', level, type,
			INTEGRAL(`\\frac{${a}x^{2}${plus(b)}}{x}`),
			[
				{ label: 'Éitt ledd i nemnaren, så del opp brøken', latex: `\\frac{${a}x^{2}${plus(b)}}{x} = ${times(a, 'x')} ${b > 0 ? '+' : '-'} \\frac{${Math.abs(b)}}{x}` },
				{ label: 'No er begge ledda grunnreglar', latex: `\\int ${times(a, 'x')}\\,dx ${b > 0 ? '+' : '-'} ${Math.abs(b)}\\int\\frac{1}{x}\\,dx` },
				{ label: 'Integrer', latex: `${coef(a, 2, 'x^{2}')} ${b > 0 ? '+' : '-'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}\\ln|x| + C` }
			],
			'Treng dette ein metode i det heile? Prøv å dele opp brøken først.');
	}

	if (kind === 'rootexpand') {
		const b = rand(1, 3);
		return draft('mixed', level, type,
			INTEGRAL(`\\frac{(x+${b})^{2}}{\\sqrt{x}}`),
			[
				{ label: 'Gong ut teljaren', latex: `\\frac{x^{2}+${2 * b}x+${b * b}}{x^{1/2}}` },
				{ label: 'Skriv kvart ledd som ein potens', latex: `x^{3/2} + ${2 * b}x^{1/2} + ${b * b}x^{-1/2}` },
				{ label: 'Integrer ledd for ledd', latex: `\\frac{2}{5}x^{5/2} + ${coef(4 * b, 3, 'x^{3/2}')} + ${2 * b * b}\\sqrt{x} + C` }
			],
			'Rot som potens, og gong ut. Ingen metode trengst.');
	}

	const k = rand(2, 5);
	const r = pick([3, 4, -3, -2]);
	return draft('mixed', level, type,
		INTEGRAL(`${k}x^{${r}}`),
		[
			{ label: 'Potensregelen baklengs', latex: `\\int x^{r}\\,dx = \\frac{x^{r+1}}{r+1}, \\quad r \\neq -1` },
			{ label: 'Set inn', latex: `${coef(k, r + 1, `x^{${r + 1}}`)} + C` }
		],
		'Rein grunnregel. Sjekk berre at eksponenten ikkje er $-1$.');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BLANDA — where the method is not given away by the filter
//
// The levels here are M1-M5 from the knowledge base: what makes a mixed problem
// hard is how clear the signal is and how many steps it takes, not the sum of
// the method levels. The concept ids follow §9.4 — recognise, combine, context —
// because "which method" is one skill however many methods it ranges over.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function retopic(d: Draft, level: number, type: string): Draft {
	return { ...d, topic: 'mixed', level, type };
}

function generateMixed(lvl: number): Draft {
	// M1-M2 train recognition, M3-M4 combination, M5 the long ones.
	const type = lvl <= 2 ? 'recognise' : lvl <= 4 ? 'combine' : 'context';

	if (lvl === 1) {
		// Clear signals, plus plain basic rules so "it is in blanda mode" is not
		// itself a hint that a method is needed.
		return pick([
			() => basicRule(1, type),
			() => basicRule(1, type),
			() => retopic(subLinear(), 1, type),
			() => retopic(partsExp(), 1, type)
		])();
	}

	if (lvl === 2) {
		// Minimal pairs: the same shape, different methods.
		return pick([
			() => retopic(subScaled(), 2, type),
			() => retopic(partialDistinct(), 2, type),
			() => retopic(subExact(), 2, type),
			() => retopic(partialFactor(), 2, type)
		])();
	}

	if (lvl === 3) {
		// A rewrite first, or two methods where one is much faster.
		return pick([
			() => basicRule(3, type),
			() => retopic(partialRepeated(), 3, type),
			() => retopic(partsFrac(), 3, type),
			() => retopic(partialDivision(), 3, type)
		])();
	}

	if (lvl === 4) {
		return pick([
			() => retopic(subRewrite(), 4, type),
			() => retopic(partsTwice(), 4, type),
			() => retopic(partialTriple(), 4, type)
		])();
	}

	return pick([
		() => retopic(partsCombined(), 5, type),
		() => retopic(subDefinite(), 5, type),
		() => retopic(partialRepeated(), 5, type)
	])();
}

// ── Public API ──

export function generateSingleProblem(topic: TopicId, lvl: number): Draft {
	if (topic === 'substitution') {
		return [subLinear, subExact, subScaled, subDefinite, subRewrite][lvl - 1]();
	}
	if (topic === 'parts') {
		return [partsExp, partsLog, partsFrac, partsTwice, partsCombined][lvl - 1]();
	}
	if (topic === 'partial') {
		return [
			partialDistinct,
			partialFactor,
			partialDivision,
			partialTriple,
			partialRepeated
		][lvl - 1]();
	}
	return generateMixed(lvl);
}

export const MODULE_ID = 'integral';

/** Variants generated per (topic x level). */
const VARIANTS = 8;

/**
 * How many re-seeds to spend trying to land on a question this level has not
 * produced yet. A handful is plenty; the salt changes the whole draw, families
 * included.
 */
const DEDUPE_TRIES = 12;

export function generateProblemBank(): Problem[] {
	const topics: TopicId[] = ['substitution', 'parts', 'partial', 'mixed'];
	const levels = [1, 2, 3, 4, 5];
	const bank: Problem[] = [];

	for (const topic of topics) {
		for (const lvl of levels) {
			// Within one level, the same question twice is a wasted variant: the
			// ladder wants five distinct problems, and a session that repeats one
			// looks broken. The id stays canonical — only the seed carries the salt,
			// so a given id still always yields the same problem.
			const seen = new Set<string>();

			for (let variant = 0; variant < VARIANTS; variant++) {
				const id = `${MODULE_ID}:${topic}:${lvl}:${variant}`;
				let prob = null;

				for (let attempt = 0; attempt < DEDUPE_TRIES; attempt++) {
					rng = rngFor(attempt === 0 ? id : `${id}#${attempt}`);
					const candidate = generateSingleProblem(topic, lvl);
					if (!seen.has(candidate.q)) {
						prob = candidate;
						break;
					}
					prob = candidate; // keep the last one rather than drop the variant
				}

				seen.add(prob!.q);
				bank.push({ ...prob!, id, moduleId: MODULE_ID });
			}
		}
	}

	rng = Math.random;
	return bank;
}
