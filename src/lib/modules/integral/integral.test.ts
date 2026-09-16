// Maths tests for the integration module.
//
// A wrong antiderivative is the one failure here that a student cannot catch:
// the app shows them a solution, and they have no reason to doubt it. So the
// formulas the generator implements are checked the way the knowledge base
// checked them with sympy — differentiate F numerically and compare with f.
//
// The generator builds everything backwards from the antiderivative, so these
// pairs *are* what it implements: if one of them is wrong, the problems built
// on it are wrong in exactly the same way.

import { describe, it, expect } from 'vitest';
import { generateProblemBank } from './generator';
import { integralModule } from './index';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// F' = f, numerically
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type Fn = (x: number) => number;

/** Central difference. Accurate to about 1e-10 relative at h = 1e-5. */
function derivative(F: Fn, x: number): number {
	const h = 1e-5;
	return (F(x + h) - F(x - h)) / (2 * h);
}

function isAntiderivative(f: Fn, F: Fn, xs: number[]): boolean {
	return xs.every((x) => {
		const num = derivative(F, x);
		const exact = f(x);
		if (!Number.isFinite(num) || !Number.isFinite(exact)) return false;
		return Math.abs(num - exact) <= 1e-4 * Math.max(1, Math.abs(exact));
	});
}

/** Sample points that stay clear of poles and of ln's domain edge. */
const POS = [0.4, 0.9, 1.7, 2.6, 3.3];
const ANY = [-2.3, -0.7, 0.6, 1.9, 3.1];
/** Right of every root the partial-fraction families use. */
const FAR = [5.2, 6.7, 8.1, 9.4];

interface Family {
	name: string;
	f: Fn;
	F: Fn;
	xs: number[];
}

const SUBSTITUTION: Family[] = [
	...([
		[2, 3, 4],
		[4, -1, 5],
		[5, 2, 2],
		[3, -5, 6]
	] as const).map(([a, b, n]) => ({
		name: `lineær kjerne, potens (a=${a}, n=${n})`,
		f: (x: number) => (a * x + b) ** n,
		F: (x: number) => (a * x + b) ** (n + 1) / (a * (n + 1)),
		xs: ANY
	})),
	{
		name: 'lineær kjerne, eksponential',
		f: (x) => Math.exp(3 * x - 2),
		F: (x) => Math.exp(3 * x - 2) / 3,
		xs: ANY
	},
	{
		name: 'lineær kjerne, logaritme',
		f: (x) => 6 / (3 * x + 1),
		F: (x) => 2 * Math.log(Math.abs(3 * x + 1)),
		xs: POS
	},
	{
		name: 'lineær kjerne, rot',
		f: (x) => Math.sqrt(2 * x + 1),
		F: (x) => (2 / 6) * (2 * x + 1) ** 1.5,
		xs: POS
	},
	{
		name: "u' står nøyaktig, potens",
		f: (x) => 2 * x * (x * x + 5) ** 3,
		F: (x) => (x * x + 5) ** 4 / 4,
		xs: ANY
	},
	{
		// p² - 4q < 0, so the quadratic never vanishes and the absolute value goes.
		name: "u'/u med irredusibel nemnar",
		f: (x) => (2 * x + 1) / (x * x + x + 3),
		F: (x) => Math.log(x * x + x + 3),
		xs: ANY
	},
	{
		name: 'ln x som kjerne',
		f: (x) => Math.log(x) ** 3 / x,
		F: (x) => Math.log(x) ** 4 / 4,
		xs: POS
	},
	{
		name: 'e^x som kjerne',
		f: (x) => Math.exp(x) / (Math.exp(x) + 2),
		F: (x) => Math.log(Math.exp(x) + 2),
		xs: ANY
	},
	{
		name: "u' med feil konstant, potens",
		f: (x) => x * (x * x + 5) ** 3,
		F: (x) => (x * x + 5) ** 4 / 8,
		xs: ANY
	},
	{
		name: "u' med feil konstant, eksponential",
		f: (x) => x * x * Math.exp(3 * x ** 3),
		F: (x) => Math.exp(3 * x ** 3) / 9,
		xs: POS
	},
	{
		name: "u' med feil konstant, logaritme",
		f: (x) => x / (x * x + 4),
		F: (x) => 0.5 * Math.log(x * x + 4),
		xs: ANY
	},
	{
		name: "u' med feil konstant, rot",
		f: (x) => x * Math.sqrt(x * x + 3),
		F: (x) => (x * x + 3) ** 1.5 / 3,
		xs: ANY
	},
	{
		name: 'rot-kjerne (bestemt)',
		f: (x) => x * Math.sqrt(1 + 3 * x * x),
		F: (x) => (1 + 3 * x * x) ** 1.5 / 9,
		xs: POS
	},
	{
		name: 'e^{√x}/√x',
		f: (x) => Math.exp(Math.sqrt(x)) / Math.sqrt(x),
		F: (x) => 2 * Math.exp(Math.sqrt(x)),
		xs: POS
	},
	{
		name: '1/(x ln x)',
		f: (x) => 1 / (x * Math.log(x)),
		F: (x) => Math.log(Math.abs(Math.log(x))),
		xs: [1.6, 2.4, 3.1, 4.8]
	},
	{
		name: 'ekstra x må skrivast med u',
		f: (x) => x / Math.sqrt(x + 3),
		F: (x) => (2 / 3) * (x + 3) ** 1.5 - 6 * Math.sqrt(x + 3),
		xs: POS
	},
	{
		name: 'forskyvd kjerne, x(x-b)^n',
		f: (x) => x * (x - 2) ** 5,
		F: (x) => (x - 2) ** 7 / 7 + (2 * (x - 2) ** 6) / 6,
		xs: ANY
	},
	{
		name: 'x ln(x²+c) — variabelskifte så delvis',
		f: (x) => x * Math.log(x * x + 4),
		F: (x) => 0.5 * ((x * x + 4) * Math.log(x * x + 4) - (x * x + 4)),
		xs: ANY
	}
];

const PARTS: Family[] = [
	...([
		[1, 0, 2],
		[3, -1, 1],
		[1, 0, -3],
		[2, 5, -1],
		[4, -3, 1]
	] as const).map(([a, b, k]) => ({
		name: `(${a}x+${b})e^{${k}x}`,
		f: (x: number) => (a * x + b) * Math.exp(k * x),
		F: (x: number) => Math.exp(k * x) * ((a * x + b) / k - a / (k * k)),
		xs: ANY
	})),
	// One formula covers x^n ln x for whole, negative and fractional n — which is
	// why levels 2 and 3 are the same family with a different exponent.
	...([1, 2, 3, -2, -3, -4, 0.5, 0] as const).map((n) => ({
		name: `x^{${n}} ln x`,
		f: (x: number) => x ** n * Math.log(x),
		F: (x: number) => (x ** (n + 1) / (n + 1)) * Math.log(x) - x ** (n + 1) / (n + 1) ** 2,
		xs: POS
	})),
	...([-1, 1, 2, -2, 3, -3] as const).map((k) => ({
		name: `x e^{x/${k}} (brøk-rate)`,
		f: (x: number) => x * Math.exp(x / k),
		F: (x: number) => k * Math.exp(x / k) * (x - k),
		xs: ANY
	})),
	...([1, -1, 2, -2, 3, -3] as const).flatMap((k) =>
		([1, 2, 3] as const).map((A) => ({
			name: `${A}x² e^{${k}x} — to rundar`,
			f: (x: number) => A * x * x * Math.exp(k * x),
			F: (x: number) =>
				Math.exp(k * x) * ((A * x * x) / k - (2 * A * x) / k ** 2 + (2 * A) / k ** 3),
			xs: ANY
		}))
	),
	{
		name: '(ln x)² — to rundar',
		f: (x) => Math.log(x) ** 2,
		F: (x) => x * Math.log(x) ** 2 - 2 * x * Math.log(x) + 2 * x,
		xs: POS
	},
	...([1, 2, -1] as const).map((k) => ({
		name: `x³ e^{${k}x} — tre rundar`,
		f: (x: number) => x ** 3 * Math.exp(k * x),
		F: (x: number) =>
			Math.exp(k * x) * (x ** 3 / k - (3 * x * x) / k ** 2 + (6 * x) / k ** 3 - 6 / k ** 4),
		xs: ANY
	})),
	...([1, 2] as const).map((a) => ({
		name: `x³ e^{${a}x²} — variabelskifte så delvis`,
		f: (x: number) => x ** 3 * Math.exp(a * x * x),
		F: (x: number) => Math.exp(a * x * x) * ((x * x) / (2 * a) - 1 / (2 * a * a)),
		xs: ANY
	})),
	...([
		[2, 1],
		[3, 2],
		[4, 4]
	] as const).map(([a, b]) => ({
		name: `ln(${a}x+${b})`,
		f: (x: number) => Math.log(a * x + b),
		F: (x: number) => ((a * x + b) * Math.log(a * x + b)) / a - x,
		xs: POS
	})),
	...([2, 3, 4] as const).map((n) => ({
		// The one you can see instead of compute: the integrand is (xⁿeˣ)'.
		name: `(x^${n} + ${n}x^${n - 1})e^x — produktregelen baklengs`,
		f: (x: number) => (x ** n + n * x ** (n - 1)) * Math.exp(x),
		F: (x: number) => x ** n * Math.exp(x),
		xs: ANY
	}))
];

const PARTIAL: Family[] = [
	...([
		[5, 1, -4],
		[4, 3, -1],
		[-6, 2, -1]
	] as const).map(([k, a, b]) => ({
		name: `${k}/((x-${a})(x-${b})) — ferdig faktorisert`,
		f: (x: number) => k / ((x - a) * (x - b)),
		F: (x: number) =>
			(k / (a - b)) * (Math.log(Math.abs(x - a)) - Math.log(Math.abs(x - b))),
		xs: FAR
	})),
	...([
		[2, -1, 3, -2],
		[1, 4, 1, -3],
		[-2, 3, 0, 5]
	] as const).map(([A, B, r1, r2]) => ({
		name: `bygd bakvegen frå A=${A}, B=${B}`,
		f: (x: number) => (A * (x - r2) + B * (x - r1)) / ((x - r1) * (x - r2)),
		F: (x: number) => A * Math.log(Math.abs(x - r1)) + B * Math.log(Math.abs(x - r2)),
		xs: FAR
	})),
	...([
		[1, 1],
		[3, 2],
		[-2, 3]
	] as const).map(([c, d]) => ({
		name: `(x²+${c})/(x²-${d * d}) — divisjon først`,
		f: (x: number) => (x * x + c) / (x * x - d * d),
		F: (x: number) =>
			x +
			((c + d * d) / (2 * d)) * (Math.log(Math.abs(x - d)) - Math.log(Math.abs(x + d))),
		xs: FAR
	})),
	...([
		[2, -1, 1],
		[3, 1, 2],
		[2, 3, -1]
	] as const).map(([a, b, c]) => ({
		// The 1/a that goes missing when the factor is ax+b rather than x+b.
		name: `1/((${a}x+${b})(x+${c})) — koeffisient i faktoren`,
		f: (x: number) => 1 / ((a * x + b) * (x + c)),
		F: (x: number) =>
			Math.log(Math.abs(a * x + b)) / (a * c - b) + Math.log(Math.abs(x + c)) / (b - a * c),
		xs: FAR
	})),
	...([
		[1, 1, -1, 0, 1, -1],
		[2, -1, 3, 1, 2, -2]
	] as const).map(([A, B, C, r1, r2, r3]) => ({
		name: `tre faktorar (A=${A}, B=${B}, C=${C})`,
		f: (x: number) =>
			(A * (x - r2) * (x - r3) + B * (x - r1) * (x - r3) + C * (x - r1) * (x - r2)) /
			((x - r1) * (x - r2) * (x - r3)),
		F: (x: number) =>
			A * Math.log(Math.abs(x - r1)) +
			B * Math.log(Math.abs(x - r2)) +
			C * Math.log(Math.abs(x - r3)),
		xs: FAR
	})),
	...([
		[3, 1, 1],
		[2, -3, 2],
		[1, 5, -1]
	] as const).map(([p, q, r]) => ({
		name: `(${p}x+${q})/(x-${r})² — dobbel faktor`,
		f: (x: number) => (p * x + q) / (x - r) ** 2,
		F: (x: number) => p * Math.log(Math.abs(x - r)) - (p * r + q) / (x - r),
		xs: FAR
	})),
	...([
		[-0.5, 2, 0.5, 2],
		[1, -1, 2, 3],
		[-1, 1, 1, 3]
	] as const).map(([A, B, C, e]) => ({
		name: `dobbel faktor med ekstra faktor (e=${e})`,
		f: (x: number) => (A * x * (x + e) + B * (x + e) + C * x * x) / (x * x * (x + e)),
		F: (x: number) => A * Math.log(Math.abs(x)) - B / x + C * Math.log(Math.abs(x + e)),
		xs: [1.4, 2.7, 4.2]
	})),
	...([
		[2, -8],
		[4, 3],
		[-2, -3]
	] as const).map(([p, q]) => ({
		// Looks like a partial fraction; is really a substitution.
		name: `fella: teljaren er ½(nemnar)' (p=${p})`,
		f: (x: number) => (x + p / 2) / (x * x + p * x + q),
		F: (x: number) => 0.5 * Math.log(Math.abs(x * x + p * x + q)),
		xs: FAR
	}))
];

const BASIC: Family[] = [
	...([
		[2, -3],
		[4, 1],
		[3, -5]
	] as const).map(([a, b]) => ({
		name: `(${a}x²+${b})/x — del opp brøken`,
		f: (x: number) => (a * x * x + b) / x,
		F: (x: number) => (a / 2) * x * x + b * Math.log(Math.abs(x)),
		xs: POS
	})),
	...([1, 2, 3] as const).map((b) => ({
		name: `(x+${b})²/√x — gong ut og skriv som potensar`,
		f: (x: number) => (x + b) ** 2 / Math.sqrt(x),
		F: (x: number) =>
			(2 / 5) * x ** 2.5 + ((4 * b) / 3) * x ** 1.5 + 2 * b * b * Math.sqrt(x),
		xs: POS
	})),
	...([
		[3, 4],
		[2, -3],
		[5, -2]
	] as const).map(([k, r]) => ({
		name: `${k}x^{${r}} — rein potensregel`,
		f: (x: number) => k * x ** r,
		F: (x: number) => (k * x ** (r + 1)) / (r + 1),
		xs: POS
	}))
];

describe.each([
	['Variabelskifte', SUBSTITUTION],
	['Delvis integrasjon', PARTS],
	['Delbrøkoppspalting', PARTIAL],
	['Grunnreglar', BASIC]
])('%s: F′ = f', (_group, families) => {
	it.each(families.map((fam) => [fam.name, fam] as const))('%s', (_name, fam) => {
		expect(isAntiderivative(fam.f, fam.F, fam.xs)).toBe(true);
	});
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// What the S2 syllabus rules out
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('S2-avgrensingar', () => {
	const bank = generateProblemBank();

	it('har ingen trigonometri', () => {
		const trig = /\\(sin|cos|tan|arcsin|arccos|arctan)/;
		expect(bank.filter((p) => trig.test(p.q) || trig.test(p.a))).toHaveLength(0);
	});

	it('lagar aldri e^{x^2} utan ein faktor føre', () => {
		// x·e^(x²) is fine — it is a substitution. e^(x²) alone has no elementary
		// antiderivative at all, and looks deceptively like it should. The test is
		// therefore about what stands immediately after the integral sign: if the
		// exponential is the whole integrand, there is no u' to cancel.
		const offenders = bank.filter((p) =>
			/\\int(_\{[^}]*\}\^\{[^}]*\})?\s*e\^\{-?\d*x\^\{2\}\}/.test(p.q)
		);
		expect(offenders.map((p) => p.q)).toEqual([]);
	});

	it('har ingen integrand utan elementær antiderivert', () => {
		const forbidden = [
			/\\frac\{e\^\{x\}\}\{x\}/, // e^x / x
			/\\frac\{1\}\{\\ln x\}/, // 1 / ln x
			/\\sqrt\{1\+x\^\{3\}\}/ // √(1+x³)
		];
		for (const p of bank) {
			for (const bad of forbidden) expect(p.q).not.toMatch(bad);
		}
	});

	it('har ingen uekte integral', () => {
		expect(bank.filter((p) => /\\infty/.test(p.q))).toHaveLength(0);
	});

	it('gir alle ubestemte integral ein konstant', () => {
		const indefinite = bank.filter((p) => !/\\int_/.test(p.q));
		expect(indefinite.length).toBeGreaterThan(0);
		for (const p of indefinite) expect(p.a).toMatch(/\+ C$/);
	});

	it('gir alle bestemte integral eit svar utan C', () => {
		const definite = bank.filter((p) => /\\int_/.test(p.q));
		expect(definite.length).toBeGreaterThan(0);
		for (const p of definite) expect(p.a).not.toMatch(/\+ C$/);
	});
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Bank shape
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('Integrasjonsbanken', () => {
	const bank = generateProblemBank();

	it('dekkjer fire emne på fem nivå', () => {
		for (const topic of integralModule.topics) {
			for (const level of [1, 2, 3, 4, 5]) {
				const slice = bank.filter((p) => p.topic === topic.id && p.level === level);
				expect(slice.length, `${topic.id} nivå ${level}`).toBeGreaterThan(0);
			}
		}
	});

	it('gir nok ulike oppgåver per nivå til at stigen får fem', () => {
		// The Lærebok ladder wants a different problem on every rung, so anything
		// under five distinct questions makes a rung repeat.
		for (const topic of integralModule.topics) {
			for (const level of [1, 2, 3, 4, 5]) {
				const qs = bank
					.filter((p) => p.topic === topic.id && p.level === level)
					.map((p) => p.q);
				expect(new Set(qs).size, `${topic.id} nivå ${level}`).toBeGreaterThanOrEqual(5);
			}
		}
	});

	it('er determinisisk — same id gir same oppgåve', () => {
		const again = generateProblemBank();
		expect(again.map((p) => `${p.id}|${p.q}|${p.a}`)).toEqual(
			bank.map((p) => `${p.id}|${p.q}|${p.a}`)
		);
	});

	it('avsluttar kvar oppgåve med det siste steget i løysinga', () => {
		for (const p of bank) {
			expect(p.structuredSteps.length).toBeGreaterThan(1);
			expect(p.a).toBe(p.structuredSteps[p.structuredSteps.length - 1].latex);
		}
	});

	it('etterlèt ingen tomme ledd eller eksponentar på 1 i utskrifta', () => {
		// Both are template slips rather than maths errors, and both showed up in
		// the first pass: "e^{-x}(-(x) - )" had lost its constant term entirely.
		for (const p of bank) {
			const all = [p.q, p.a, ...p.structuredSteps.map((s) => s.latex)].join(' ');
			// A variable or a closing bracket raised to 1 is a slip. An upper bound
			// of 1 in \int_{0}^{1} is not, so the preceding "}" is excluded.
			expect(all, p.id).not.toMatch(/[a-zA-Z)]\^\{1\}/);
			expect(all, p.id).not.toMatch(/[-+]\s*\\right/);
			expect(all, p.id).not.toMatch(/\d\s*-\s*-/);
		}
	});
});
