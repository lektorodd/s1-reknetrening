// Problem generator for «Drøfting» — what the derivative is for, in S1:
// tangent lines, top and bottom points read off a sign chart, and optimisation.
//
// Every function is built backwards from the answer: the critical points are
// chosen first, so every value a student computes is a whole number and the
// sign chart is exact. The tests read the LaTeX back and check it against the
// maths independently of how it was built.

import type { Problem, SignChart, StepEntry } from '../types';
import { rngFor } from '../rng';

export type AnalysisTopicId = 'tangent' | 'extrema' | 'optimisation';

/** Draft problem — id and moduleId are attached by generateBank(). */
type Draft = Omit<Problem, 'id' | 'moduleId'>;

let rng: () => number = Math.random;

function rand(min: number, max: number): number {
	return Math.floor(rng() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
	return arr[Math.floor(rng() * arr.length)];
}

// ── Formatting ──

/** [coefficient, power] terms, highest power first. */
type Poly = [number, number][];

function xPow(k: number): string {
	if (k === 0) return '';
	if (k === 1) return 'x';
	return `x^{${k}}`;
}

/** A polynomial written the way a teacher would: signs, 1s and 0s tidied. */
function polyTex(terms: Poly): string {
	let out = '';
	for (const [c, k] of terms) {
		if (c === 0) continue;
		const body = k === 0 ? `${Math.abs(c)}` : `${Math.abs(c) === 1 ? '' : Math.abs(c)}${xPow(k)}`;
		if (out === '') out = c < 0 ? `-${body}` : body;
		else out += c < 0 ? ` - ${body}` : ` + ${body}`;
	}
	return out || '0';
}

function derive(terms: Poly): Poly {
	return terms.filter(([, k]) => k !== 0).map(([c, k]) => [c * k, k - 1]);
}

function evalPoly(terms: Poly, x: number): number {
	return terms.reduce((s, [c, k]) => s + c * x ** k, 0);
}

/** x − r, written x + 3 or x for r = 0. */
function xMinus(r: number): string {
	if (r === 0) return 'x';
	return r > 0 ? `x - ${r}` : `x + ${-r}`;
}

/** m·x + c as a line. */
function lineTex(m: number, c: number): string {
	return polyTex([[m, 1], [c, 0]]);
}

/** A number in brackets when negative, for substitution: f(-2). */
function arg(n: number): string {
	return `${n}`;
}

// ── Sign charts ──

interface Factor {
	expr: string;
	fn: (x: number) => number;
}

/**
 * A sign chart from factors given as functions, at the given points. The last
 * row is the product, labelled `productLabel`. Signs are computed, not typed,
 * so they cannot disagree with the factors.
 */
function signChart(points: number[], factors: Factor[], productLabel: string): SignChart {
	const xs = [...points].sort((a, b) => a - b);
	const samples = [xs[0] - 1, ...xs.slice(1).map((x, i) => (x + xs[i]) / 2), xs[xs.length - 1] + 1];
	const row = (expr: string, fn: (x: number) => number) => ({
		expr,
		signs: samples.map((x) => (fn(x) > 0 ? '+' : '-') as '+' | '-'),
		zeros: xs.map((x) => Math.abs(fn(x)) < 1e-9)
	});
	const product = (x: number) => factors.reduce((p, f) => p * f.fn(x), 1);
	return {
		points: xs.map((x) => ({ label: `${x}`, value: x })),
		rows: [...factors.map((f) => row(f.expr, f.fn)), row(productLabel, product)]
	};
}

const linear = (r: number): Factor => ({ expr: xMinus(r), fn: (x) => x - r });

// ── Tangent ──
// Lvl 1: x² + bx at a given x
// Lvl 2: a general quadratic
// Lvl 3: a cubic
// Lvl 4: the point where the tangent has a given slope
// Lvl 5: e^{kx} at x = 0, or c·ln x at x = 1

function tangentSteps(fPrime: string, a: number, fa: number, m: number): StepEntry[] {
	const c = fa - m * a;
	const lhs = fa === 0 ? 'y' : fa > 0 ? `y - ${fa}` : `y + ${-fa}`;
	const slope = m === 1 ? '' : m === -1 ? '-' : `${m}`;
	return [
		{ label: 'Funksjonsverdien', latex: `f(${arg(a)}) = ${fa}` },
		{ label: 'Deriver', latex: `f'(x) = ${fPrime}` },
		{ label: 'Stigingstalet', latex: `f'(${arg(a)}) = ${m}` },
		{ label: 'Eittpunktsformelen', latex: `${lhs} = ${m === 0 ? '0' : `${slope}(${xMinus(a)})`}` },
		{ label: 'Løys for y', latex: `y = ${lineTex(m, c)}` }
	];
}

function generateTangent(lvl: number, variant: number): Draft {
	let q = '';
	let steps: StepEntry[] = [];
	let instruction = '';
	const at = (a: number) => `Finn likninga for tangenten til grafen til $f$ i punktet der $x = ${a}$.`;

	if (lvl <= 3) {
		let f: Poly;
		if (lvl === 1) {
			const b = [-4, -3, -2, -1, 1, 2, 3, 4][variant];
			f = [[1, 2], [b, 1]];
		} else if (lvl === 2) {
			const a2 = [2, 3, -1, -2][variant % 4];
			f = [[a2, 2], [rand(-4, 4), 1], [1 + variant, 0]];
		} else {
			f = [[1, 3], [[-3, -2, -1, 1, 2, 3, -3, 2][variant], 2], [rand(-4, 4), 1], [rand(-5, 5), 0]];
		}
		const a = pick([-2, -1, 1, 2, 3]);
		const fa = evalPoly(f, a);
		const m = evalPoly(derive(f), a);
		q = `f(x) = ${polyTex(f)}`;
		instruction = at(a);
		steps = tangentSteps(polyTex(derive(f)), a, fa, m);
	} else if (lvl === 4) {
		// Choose the point first, then the slope it has.
		const a2 = [1, 2, -1, 3][variant % 4];
		const b = rand(-5, 5);
		const c = rand(-6, 6);
		const f: Poly = [[a2, 2], [b, 1], [c, 0]];
		const x0 = [-2, -1, 1, 2, 3, 0, 4, -3][variant];
		const m = 2 * a2 * x0 + b;
		const y0 = evalPoly(f, x0);
		q = `f(x) = ${polyTex(f)}`;
		instruction = `Finn likninga for tangenten til grafen til $f$ som har stigingstal $${m}$.`;
		const lhs = y0 === 0 ? 'y' : y0 > 0 ? `y - ${y0}` : `y + ${-y0}`;
		steps = [
			{ label: 'Deriver', latex: `f'(x) = ${polyTex(derive(f))}` },
			{ label: 'Set lik stigingstalet', latex: `${polyTex(derive(f))} = ${m}` },
			{ label: 'Løys for x', latex: `x = ${x0}` },
			{ label: 'Funksjonsverdien', latex: `f(${arg(x0)}) = ${y0}` },
			{ label: 'Eittpunktsformelen', latex: `${lhs} = ${m === 1 ? '' : m === -1 ? '-' : m}${m === 0 ? '0' : `(${xMinus(x0)})`}` },
			{ label: 'Løys for y', latex: `y = ${lineTex(m, y0 - m * x0)}` }
		];
	} else {
		if (variant % 2 === 0) {
			const k = 1 + Math.floor(variant / 2);
			q = `f(x) = e^{${k === 1 ? '' : k}x}`;
			instruction = at(0);
			steps = [
				{ label: 'Funksjonsverdien', latex: 'f(0) = e^{0} = 1' },
				{ label: 'Deriver', latex: `f'(x) = ${k === 1 ? '' : k}e^{${k === 1 ? '' : k}x}` },
				{ label: 'Stigingstalet', latex: `f'(0) = ${k}` },
				{ label: 'Eittpunktsformelen', latex: `y - 1 = ${k === 1 ? '' : k}(x - 0)` },
				{ label: 'Løys for y', latex: `y = ${lineTex(k, 1)}` }
			];
		} else {
			const c = 1 + Math.floor(variant / 2);
			q = `f(x) = ${c === 1 ? '' : c}\\ln x`;
			instruction = at(1);
			steps = [
				{ label: 'Funksjonsverdien', latex: `f(1) = ${c === 1 ? '' : c}\\ln 1 = 0` },
				{ label: 'Deriver', latex: `f'(x) = \\frac{${c}}{x}` },
				{ label: 'Stigingstalet', latex: `f'(1) = ${c}` },
				{ label: 'Eittpunktsformelen', latex: `y = ${c === 1 ? '' : c}(x - 1)` },
				{ label: 'Løys for y', latex: `y = ${lineTex(c, -c)}` }
			];
		}
	}

	return {
		topic: 'tangent',
		level: lvl,
		type: 'tangent',
		q,
		a: steps[steps.length - 1].latex,
		structuredSteps: steps,
		hint: 'Tangenten går gjennom $(a, f(a))$ og har stigingstal $f\'(a)$. Bruk eittpunktsformelen $y - y_1 = a(x - x_1)$.',
		instruction
	};
}

// ── Top and bottom points ──
// Lvl 1: x² − 2px + c                 one bottom point
// Lvl 2: −x² + 2px + c                one top point
// Lvl 3: x³ − 3p²x + c                symmetric top and bottom
// Lvl 4: ±(2x³ − 3(r+s)x² + 6rsx) + c  roots anywhere
// Lvl 5: x⁴ − 2p²x² + c (three), or (x − p)³ + c (a terrace, none)

const pt = (x: number, y: number) => `(${x}, ${y})`;

/** «Toppunkt: (…), botnpunkt: (…)», with a capital only on the first word. */
function extremaAnswer(tops: [number, number][], bottoms: [number, number][]): string {
	const parts: string[] = [];
	if (tops.length) parts.push(`\\text{Toppunkt: } ${tops.map(([x, y]) => pt(x, y)).join(', \\ ')}`);
	if (bottoms.length) {
		const name = tops.length ? 'botnpunkt' : 'Botnpunkt';
		parts.push(`\\text{${name}: } ${bottoms.map(([x, y]) => pt(x, y)).join(', \\ ')}`);
	}
	return parts.join(', \\quad ');
}

function generateExtrema(lvl: number, variant: number): Draft {
	let f: Poly;
	let factorised = '';
	let factors: Factor[] = [];
	let points: number[] = [];
	let terrace = false;
	const p = [1, 2, 3, -1, -2, 4, -3, 2][variant];
	const c = rand(-5, 5);

	if (lvl === 1) {
		f = [[1, 2], [-2 * p, 1], [c, 0]];
		factorised = `2(${xMinus(p)})`;
		factors = [linear(p)];
		points = [p];
	} else if (lvl === 2) {
		f = [[-1, 2], [2 * p, 1], [c, 0]];
		factorised = `2(${p} - x)`;
		factors = [{ expr: `${p} - x`, fn: (x) => p - x }];
		points = [p];
	} else if (lvl === 3) {
		const q = Math.abs(p) === 4 ? 2 : Math.abs(p);
		f = [[1, 3], [-3 * q * q, 1], [c, 0]];
		factorised = `3(x + ${q})(x - ${q})`;
		factors = [linear(-q), linear(q)];
		points = [-q, q];
	} else if (lvl === 4) {
		const pairs = [[-1, 2], [0, 3], [1, 3], [-2, 1], [0, 2], [-3, 0], [1, 4], [-1, 1]];
		const [r, s] = pairs[variant];
		const sign = variant % 2 === 0 ? 1 : -1;
		f = [[2 * sign, 3], [-3 * (r + s) * sign, 2], [6 * r * s * sign, 1], [c, 0]];
		// A bare x goes first and without brackets: −6x(x + 3), not −6(x + 3)(x).
		const bracket = (t: number) => (t === 0 ? 'x' : `(${xMinus(t)})`);
		const ordered = [r, s].sort((u, v) => (u === 0 ? -1 : v === 0 ? 1 : 0));
		factorised = `${sign === 1 ? '' : '-'}6${ordered.map(bracket).join('')}`;
		factors = [...(sign === -1 ? [{ expr: '-6', fn: () => -6 }] : []), linear(r), linear(s)];
		points = [r, s];
	} else if (variant % 2 === 0) {
		const q = 1 + Math.floor(variant / 4);
		f = [[1, 4], [-2 * q * q, 2], [c, 0]];
		factorised = `4x(x + ${q})(x - ${q})`;
		factors = [linear(-q), linear(0), linear(q)];
		points = [-q, 0, q];
	} else {
		const q = [1, 2, -1, 3][Math.floor(variant / 2)];
		// (x − q)³ + c, multiplied out
		f = [[1, 3], [-3 * q, 2], [3 * q * q, 1], [c - q ** 3, 0]];
		factorised = `3(${xMinus(q)})^{2}`;
		factors = [{ expr: `(${xMinus(q)})^{2}`, fn: (x) => (x - q) ** 2 }];
		points = [q];
		terrace = true;
	}

	const fp = derive(f);
	const chart = signChart(points, factors, "f'(x)");
	const values = points.map((x) => [x, evalPoly(f, x)] as [number, number]);

	// Top: f' goes + to −. Bottom: − to +. Neither: a terrace point.
	const product = chart.rows[chart.rows.length - 1];
	const tops = values.filter((_, i) => product.signs[i] === '+' && product.signs[i + 1] === '-');
	const bottoms = values.filter((_, i) => product.signs[i] === '-' && product.signs[i + 1] === '+');

	const steps: StepEntry[] = [
		{ label: 'Deriver', latex: `f'(x) = ${polyTex(fp)}` },
		{ label: 'Faktoriser', latex: `f'(x) = ${factorised}` },
		{ label: 'Forteiknslinja', latex: `f'(x) = 0 \\iff x = ${points.join(' \\lor x = ')}`, signChart: chart },
		{
			label: 'Funksjonsverdiane',
			latex: values.map(([x, y]) => `f(${arg(x)}) = ${y}`).join(', \\quad ')
		},
		{
			label: terrace ? 'Ingen forteiknsskifte' : 'Les av forteiknslinja',
			latex: terrace
				? `\\text{Ingen toppunkt eller botnpunkt. Terrassepunkt: } ${pt(values[0][0], values[0][1])}`
				: extremaAnswer(tops, bottoms)
		}
	];

	return {
		topic: 'extrema',
		level: lvl,
		type: 'extrema',
		q: `f(x) = ${polyTex(f)}`,
		a: steps[steps.length - 1].latex,
		structuredSteps: steps,
		hint: 'Der $f\'$ skiftar frå $+$ til $-$, er det eit toppunkt. Frå $-$ til $+$ er det eit botnpunkt.'
	};
}

// ── Optimisation ──
// Lvl 1: a quadratic on an interval, the vertex inside
// Lvl 2: a quadratic on an interval, the vertex outside — the ends decide
// Lvl 3: a cubic on an interval
// Lvl 4: a fence: the largest rectangle for a given length
// Lvl 5: a box without a lid, or the largest profit

function optimiseOnInterval(f: Poly, lo: number, hi: number): Draft['structuredSteps'] {
	const fp = derive(f);
	// Critical points: the whole-number roots of f', which is how f was built.
	const crit: number[] = [];
	for (let x = -20; x <= 20; x++) if (evalPoly(fp, x) === 0) crit.push(x);
	const inside = crit.filter((x) => x > lo && x < hi);
	const outside = crit.filter((x) => x <= lo || x >= hi);
	const candidates = [lo, ...inside, hi];
	const vals = candidates.map((x) => [x, evalPoly(f, x)] as [number, number]);
	const max = vals.reduce((a, b) => (b[1] > a[1] ? b : a));
	const min = vals.reduce((a, b) => (b[1] < a[1] ? b : a));
	return [
		{ label: 'Deriver', latex: `f'(x) = ${polyTex(fp)}` },
		{
			label: 'Nullpunkta til den deriverte',
			latex: `x = ${crit.join(' \\lor x = ')}${outside.length ? `, \\quad ${outside.map((x) => `x = ${x}`).join(', ')} \\notin [${lo}, ${hi}]` : ''}`
		},
		{
			label: 'Rekn ut aktuelle verdiar',
			latex: vals.map(([x, y]) => `f(${arg(x)}) = ${y}`).join(', \\quad ')
		},
		{
			label: 'Samanlikn',
			latex: `\\text{Størst: } f(${arg(max[0])}) = ${max[1]}, \\quad \\text{minst: } f(${arg(min[0])}) = ${min[1]}`
		}
	];
}

function generateOptimisation(lvl: number, variant: number): Draft {
	let q = '';
	let steps: StepEntry[] = [];
	let instruction = '';
	let hint = 'Kandidatane er endepunkta og punkta der $f\'(x) = 0$ inne i intervallet. Rekn ut $f$ i alle.';
	const onInterval = (lo: number, hi: number) =>
		`Finn største og minste verdi for $f$ når $x \\in [${lo}, ${hi}]$.`;

	if (lvl === 1 || lvl === 2) {
		const p = [1, 2, -1, 3, 0, -2, 2, 1][variant];
		const sign = variant % 2 === 0 ? 1 : -1;
		const f: Poly = [[sign, 2], [-2 * p * sign, 1], [rand(-5, 5), 0]];
		// Level 1: the vertex inside, the ends at unequal distances so there is no
		// tie. Level 2: the vertex outside, on either side.
		const [lo, hi] = lvl === 1
			? [p - 1 - (variant % 2), p + 2 + (variant % 2)]
			: variant % 2 === 0 ? [p + 1, p + 4] : [p - 4, p - 1];
		q = `f(x) = ${polyTex(f)}`;
		instruction = onInterval(lo, hi);
		steps = optimiseOnInterval(f, lo, hi);
	} else if (lvl === 3) {
		// x³ − 3k²x has a top at −k and a bottom at k. The intervals are chosen
		// so that some answers lie inside and some at an end — the point of the
		// level is to check both.
		const cases: [number, number, number][] = [
			[2, -3, 3], [2, 0, 4], [3, -4, 4], [1, -3, 0], [2, -1, 3], [3, 0, 5], [1, 0, 3], [2, -4, 1]
		];
		const [k, lo0, hi0] = cases[variant];
		let [lo, hi] = [lo0, hi0];
		const f: Poly = [[1, 3], [-3 * k * k, 1], [rand(-4, 4), 0]];
		// Guard against a tie between two candidates, which would make «the»
		// answer two: widen one end, then the other.
		const vals = () => [lo, hi, -k, k].filter((x) => x >= lo && x <= hi).map((x) => evalPoly(f, x));
		for (let i = 0; new Set(vals()).size < vals().length && i < 20; i++) {
			if (i % 2 === 0) hi++;
			else lo--;
		}
		q = `f(x) = ${polyTex(f)}`;
		instruction = onInterval(lo, hi);
		steps = optimiseOnInterval(f, lo, hi);
	} else if (lvl === 4) {
		const P = 4 * (5 + variant * 2); // 20, 28, …: x comes out whole
		if (variant % 2 === 0) {
			// Three sides: 2x + y = P, A = x(P − 2x)
			const x0 = P / 4;
			q = `2x + y = ${P}`;
			instruction = `Du har $${P}$ m gjerde og skal gjerde inn eit rektangel langs ein vegg, så berre tre sider treng gjerde. La $x$ vere breidda ut frå veggen og $y$ lengda langs veggen. Kva for $x$ gir størst areal, og kor stort er det?`;
			steps = [
				{ label: 'Uttrykk y ved x', latex: `y = ${P} - 2x` },
				{ label: 'Arealfunksjonen', latex: `A(x) = x(${P} - 2x) = ${polyTex([[-2, 2], [P, 1]])}` },
				{ label: 'Deriver', latex: `A'(x) = ${polyTex([[-4, 1], [P, 0]])}` },
				{ label: 'Nullpunkta til den deriverte', latex: `x = ${x0}` },
				{ label: 'Toppunkt', latex: `A'(x) > 0 \\text{ før og } A'(x) < 0 \\text{ etter } x = ${x0}` },
				{ label: 'Størst areal', latex: `x = ${x0}\\text{ m}, \\quad A = ${(P * P) / 8}\\text{ m}^{2}` }
			];
		} else {
			// Four sides: 2x + 2y = P, A = x(P/2 − x)
			const h = P / 2;
			const x0 = P / 4;
			q = `2x + 2y = ${P}`;
			instruction = `Eit rektangel skal ha omkrins $${P}$ cm. La $x$ og $y$ vere sidene. Kva for $x$ gir størst areal, og kor stort er det?`;
			steps = [
				{ label: 'Uttrykk y ved x', latex: `y = ${h} - x` },
				{ label: 'Arealfunksjonen', latex: `A(x) = x(${h} - x) = ${polyTex([[-1, 2], [h, 1]])}` },
				{ label: 'Deriver', latex: `A'(x) = ${polyTex([[-2, 1], [h, 0]])}` },
				{ label: 'Nullpunkta til den deriverte', latex: `x = ${x0}` },
				{ label: 'Toppunkt', latex: `A'(x) > 0 \\text{ før og } A'(x) < 0 \\text{ etter } x = ${x0}` },
				{ label: 'Størst areal', latex: `x = ${x0}\\text{ cm}, \\quad A = ${x0 * x0}\\text{ cm}^{2}` }
			];
		}
		hint = 'Set opp arealet som ein funksjon av éin variabel først. Bruk opplysninga om gjerdet til å bli kvitt $y$.';
	} else if (variant % 2 === 0) {
		// Box without a lid from an s × s sheet: V = x(s − 2x)², largest at x = s/6.
		const s = 6 * (2 + variant / 2); // 12, 18, 24, 30
		const x0 = s / 6;
		const v = x0 * (s - 2 * x0) ** 2;
		q = `V(x) = x(${s} - 2x)^{2}, \\quad 0 < x < ${s / 2}`;
		instruction = `Frå ei kvadratisk plate på $${s} \\times ${s}$ cm klipper du ut eit kvadrat med side $x$ i kvart hjørne og brettar opp ein boks utan lok. Volumet er gitt under. Kva for $x$ gir størst volum, og kor stort blir det?`;
		steps = [
			{ label: 'Deriver (produktregelen)', latex: `V'(x) = (${s} - 2x)^{2} + x \\cdot 2(${s} - 2x)(-2)` },
			{ label: 'Faktoriser', latex: `V'(x) = (${s} - 2x)(${s} - 6x)` },
			{ label: 'Nullpunkta til den deriverte', latex: `x = ${x0} \\lor x = ${s / 2}, \\quad x = ${s / 2} \\text{ er utanfor}` },
			{ label: 'Toppunkt', latex: `V'(x) > 0 \\text{ før og } V'(x) < 0 \\text{ etter } x = ${x0}` },
			{ label: 'Størst volum', latex: `x = ${x0}\\text{ cm}, \\quad V = ${v}\\text{ cm}^{3}` }
		];
		hint = 'Deriver med produktregelen og faktoriser. Berre éin av løysingane ligg i definisjonsmengda.';
	} else {
		// Profit: O(x) = I(x) − K(x), a downward parabola.
		const p = 100 + 20 * variant;
		const b = 20 + 10 * rand(0, 2);
		const F = 100 * rand(3, 9);
		const x0 = (p - b) / 2;
		const best = x0 * x0 - F;
		q = `I(x) = ${p}x - x^{2}, \\quad K(x) = ${b}x + ${F}`;
		instruction = `Ei bedrift produserer og sel $x$ einingar. Inntekta $I$ og kostnadene $K$ i kroner er gitt under. Kor mange einingar gir størst overskot, og kor stort er det?`;
		steps = [
			{ label: 'Overskotet', latex: `O(x) = I(x) - K(x) = ${polyTex([[-1, 2], [p - b, 1], [-F, 0]])}` },
			{ label: 'Deriver', latex: `O'(x) = ${polyTex([[-2, 1], [p - b, 0]])}` },
			{ label: 'Nullpunkta til den deriverte', latex: `x = ${x0}` },
			{ label: 'Toppunkt', latex: `O'(x) > 0 \\text{ før og } O'(x) < 0 \\text{ etter } x = ${x0}` },
			{ label: 'Størst overskot', latex: `x = ${x0}, \\quad O = ${best}\\text{ kr}` }
		];
		hint = 'Overskot er inntekt minus kostnader. Finn toppunktet til overskotsfunksjonen.';
	}

	return {
		topic: 'optimisation',
		level: lvl,
		type: 'optimisation',
		q,
		a: steps[steps.length - 1].latex,
		structuredSteps: steps,
		hint,
		instruction
	};
}

// ── Public API ──

export const MODULE_ID = 'analysis';

const VARIANTS = 8;

export function generateSingleAnalysisProblem(topic: AnalysisTopicId, lvl: number, variant = 0): Draft {
	switch (topic) {
		case 'tangent':
			return generateTangent(lvl, variant);
		case 'extrema':
			return generateExtrema(lvl, variant);
		case 'optimisation':
			return generateOptimisation(lvl, variant);
	}
}

export function generateAnalysisBank(): Problem[] {
	const topics: AnalysisTopicId[] = ['tangent', 'extrema', 'optimisation'];
	const bank: Problem[] = [];
	for (const topic of topics) {
		for (const lvl of [1, 2, 3, 4, 5]) {
			for (let variant = 0; variant < VARIANTS; variant++) {
				const id = `${MODULE_ID}:${topic}:${lvl}:${variant}`;
				rng = rngFor(id);
				bank.push({ ...generateSingleAnalysisProblem(topic, lvl, variant), id, moduleId: MODULE_ID });
			}
		}
	}
	rng = Math.random;
	return bank;
}
