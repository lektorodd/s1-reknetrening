// Problem generator for derivative rules — v2
// Conceptual difficulty progression (not arithmetic)
// S1 curriculum: no trigonometric functions
// Coefficients capped at 6 — difficulty is structural

import type { Problem, TopicId, ProblemType, StepEntry } from './types';

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

function rand(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

// ── Chain Rule Generator ──
// Lvl 1: linear inner, power outer — (ax+b)^n
// Lvl 2: linear inner, varied outer — √(ax+b), e^(ax+b), ln(ax+b)
// Lvl 3: quadratic inner, power/root — (ax²+bx)^n, √(x²+b)
// Lvl 4: power/quadratic inner, exp/ln — e^(x²), ln(x²+b)
// Lvl 5: nested chain — √((ax+b)^n), e^(√(x+b)), (e^(ax))^n

function generateChainProblem(lvl: number): Omit<Problem, 'id'> {
	const a = rand(2, Math.min(lvl + 2, 5)) * (lvl >= 3 && Math.random() > 0.7 ? -1 : 1);
	const b = rand(1, 4);
	const n = pick(lvl <= 2 ? [2, 3] : [2, 3, 4]);

	let q = '', structuredSteps: StepEntry[] = [];
	const linear = `${fmt(a, 'x')}${fmtNum(b)}`;
	const a_str = `${a}`;

	if (lvl === 1) {
		// (ax+b)^n — simplest chain rule
		q = `f(x) = (${linear})^{${n}}`;
		const coeff = n * a;
		structuredSteps = [
			{ label: 'Identify', latex: `g(u) = u^{${n}}, \\quad u(x) = ${linear}` },
			{ label: 'Differentiate g', latex: `g'(u) = ${n}u${fmtPow(n - 1)}` },
			{ label: 'Differentiate u', latex: `u'(x) = ${a_str}` },
			{ label: 'Apply chain rule', latex: `f'(x) = g'(u) \\cdot u'(x)` },
			{ label: 'Substitute', latex: `f'(x) = ${n}(${linear})${fmtPow(n - 1)} \\cdot ${par(a)}` },
			{ label: 'Simplify', latex: `f'(x) = ${coeff}(${linear})${fmtPow(n - 1)}` }
		];
	} else if (lvl === 2) {
		// varied outer: root, exp, ln with linear inner
		const variant = pick(['root', 'exp', 'ln'] as const);
		if (variant === 'root') {
			q = `f(x) = \\sqrt{${linear}}`;
			structuredSteps = [
				{ label: 'Identify', latex: `g(u) = \\sqrt{u}, \\quad u(x) = ${linear}` },
				{ label: 'Differentiate g', latex: `g'(u) = \\frac{1}{2\\sqrt{u}}` },
				{ label: 'Differentiate u', latex: `u'(x) = ${a_str}` },
				{ label: 'Apply chain rule', latex: `f'(x) = g'(u) \\cdot u'(x)` },
				{ label: 'Substitute', latex: `f'(x) = \\frac{1}{2\\sqrt{${linear}}} \\cdot ${par(a)}` },
				{ label: 'Simplify', latex: `f'(x) = \\frac{${a}}{2\\sqrt{${linear}}}` }
			];
		} else if (variant === 'exp') {
			q = `f(x) = e^{${linear}}`;
			structuredSteps = [
				{ label: 'Identify', latex: `g(u) = e^u, \\quad u(x) = ${linear}` },
				{ label: 'Differentiate g', latex: `g'(u) = e^u` },
				{ label: 'Differentiate u', latex: `u'(x) = ${a_str}` },
				{ label: 'Apply chain rule', latex: `f'(x) = g'(u) \\cdot u'(x)` },
				{ label: 'Substitute', latex: `f'(x) = e^{${linear}} \\cdot ${par(a)}` },
				{ label: 'Simplify', latex: `f'(x) = ${a}e^{${linear}}` }
			];
		} else {
			q = `f(x) = \\ln(${linear})`;
			structuredSteps = [
				{ label: 'Identify', latex: `g(u) = \\ln u, \\quad u(x) = ${linear}` },
				{ label: 'Differentiate g', latex: `g'(u) = \\frac{1}{u}` },
				{ label: 'Differentiate u', latex: `u'(x) = ${a_str}` },
				{ label: 'Apply chain rule', latex: `f'(x) = g'(u) \\cdot u'(x)` },
				{ label: 'Substitute', latex: `f'(x) = \\frac{1}{${linear}} \\cdot ${par(a)}` },
				{ label: 'Simplify', latex: `f'(x) = \\frac{${a}}{${linear}}` }
			];
		}
	} else if (lvl === 3) {
		// quadratic inner: (ax²+b)^n or √(x²+b)
		const c = rand(1, 3);
		const variant = pick(['power', 'root'] as const);
		const inner = `${fmt(c, 'x^2')}${fmtNum(b)}`;
		const inner_deriv = `${2 * c}x`;

		if (variant === 'power') {
			q = `f(x) = (${inner})^{${n}}`;
			const coeff = n;
			structuredSteps = [
				{ label: 'Identify', latex: `g(u) = u^{${n}}, \\quad u(x) = ${inner}` },
				{ label: 'Differentiate g', latex: `g'(u) = ${n}u${fmtPow(n - 1)}` },
				{ label: 'Differentiate u', latex: `u'(x) = ${inner_deriv}` },
				{ label: 'Apply chain rule', latex: `f'(x) = g'(u) \\cdot u'(x)` },
				{ label: 'Substitute', latex: `f'(x) = ${coeff}(${inner})${fmtPow(n - 1)} \\cdot ${inner_deriv}` },
				{ label: 'Simplify', latex: `f'(x) = ${coeff * 2 * c}x(${inner})${fmtPow(n - 1)}` }
			];
		} else {
			q = `f(x) = \\sqrt{${inner}}`;
			structuredSteps = [
				{ label: 'Identify', latex: `g(u) = \\sqrt{u}, \\quad u(x) = ${inner}` },
				{ label: 'Differentiate g', latex: `g'(u) = \\frac{1}{2\\sqrt{u}}` },
				{ label: 'Differentiate u', latex: `u'(x) = ${inner_deriv}` },
				{ label: 'Apply chain rule', latex: `f'(x) = g'(u) \\cdot u'(x)` },
				{ label: 'Substitute', latex: `f'(x) = \\frac{1}{2\\sqrt{${inner}}} \\cdot ${inner_deriv}` },
				{ label: 'Simplify', latex: `f'(x) = \\frac{${2 * c}x}{2\\sqrt{${inner}}}` },
				{ label: 'Simplify', latex: `f'(x) = \\frac{${c}x}{\\sqrt{${inner}}}` }
			];
		}
	} else if (lvl === 4) {
		// quadratic/power inner with exp/ln outer
		const c = rand(1, 3);
		const variant = pick(['exp', 'ln'] as const);
		const inner = `${fmt(c, 'x^2')}${fmtNum(b)}`;
		const inner_deriv = `${2 * c}x`;

		if (variant === 'exp') {
			q = `f(x) = e^{${inner}}`;
			structuredSteps = [
				{ label: 'Identify', latex: `g(u) = e^u, \\quad u(x) = ${inner}` },
				{ label: 'Differentiate g', latex: `g'(u) = e^u` },
				{ label: 'Differentiate u', latex: `u'(x) = ${inner_deriv}` },
				{ label: 'Apply chain rule', latex: `f'(x) = g'(u) \\cdot u'(x)` },
				{ label: 'Substitute', latex: `f'(x) = e^{${inner}} \\cdot ${inner_deriv}` },
				{ label: 'Simplify', latex: `f'(x) = ${2 * c}x \\cdot e^{${inner}}` }
			];
		} else {
			q = `f(x) = \\ln(${inner})`;
			structuredSteps = [
				{ label: 'Identify', latex: `g(u) = \\ln u, \\quad u(x) = ${inner}` },
				{ label: 'Differentiate g', latex: `g'(u) = \\frac{1}{u}` },
				{ label: 'Differentiate u', latex: `u'(x) = ${inner_deriv}` },
				{ label: 'Apply chain rule', latex: `f'(x) = g'(u) \\cdot u'(x)` },
				{ label: 'Substitute', latex: `f'(x) = \\frac{1}{${inner}} \\cdot ${inner_deriv}` },
				{ label: 'Simplify', latex: `f'(x) = \\frac{${2 * c}x}{${inner}}` }
			];
		}
	} else {
		// lvl 5: nested chain rule — two compositions
		const variant = pick(['sqrt_power', 'exp_sqrt', 'power_exp'] as const);

		if (variant === 'sqrt_power') {
			// √((ax+b)^n) = ((ax+b)^n)^(1/2)
			q = `f(x) = \\sqrt{(${linear})^{${n}}}`;
			structuredSteps = [
				{ label: 'Identify', latex: `\\text{Ytre: } \\sqrt{\\cdot}, \\quad \\text{Midtre: } u^{${n}}, \\quad \\text{Indre: } ${linear}` },
				{ label: 'Rewrite', latex: `f(x) = ((${linear})^{${n}})^{1/2} = (${linear})^{${n}/2}` },
				{ label: 'Apply chain rule', latex: `f'(x) = \\frac{${n}}{2}(${linear})^{${n}/2 - 1} \\cdot (${linear})'` },
				{ label: 'Differentiate inner', latex: `(${linear})' = ${a}` },
				{ label: 'Substitute', latex: `f'(x) = \\frac{${n}}{2}(${linear})^{${n - 2}/2} \\cdot ${par(a)}` },
				{ label: 'Simplify', latex: `f'(x) = \\frac{${n * a}}{2}(${linear})^{${n - 2}/2}` }
			];
		} else if (variant === 'exp_sqrt') {
			// e^(√(x+b))
			const inner_b = `x${fmtNum(b)}`;
			q = `f(x) = e^{\\sqrt{${inner_b}}}`;
			structuredSteps = [
				{ label: 'Identify', latex: `\\text{Ytre: } e^u, \\quad u = \\sqrt{${inner_b}}` },
				{ label: 'Differentiate outer', latex: `(e^u)' = e^u` },
				{ label: 'Differentiate inner', latex: `(\\sqrt{${inner_b}})' = \\frac{1}{2\\sqrt{${inner_b}}}` },
				{ label: 'Apply chain rule', latex: `f'(x) = e^{\\sqrt{${inner_b}}} \\cdot \\frac{1}{2\\sqrt{${inner_b}}}` },
				{ label: 'Simplify', latex: `f'(x) = \\frac{e^{\\sqrt{${inner_b}}}}{2\\sqrt{${inner_b}}}` }
			];
		} else {
			// (e^(ax))^n = e^(nax)
			q = `f(x) = (e^{${fmt(a, 'x')}})^{${n}}`;
			structuredSteps = [
				{ label: 'Rewrite', latex: `f(x) = e^{${n * a}x}` },
				{ label: 'Identify', latex: `g(u) = e^u, \\quad u(x) = ${n * a}x` },
				{ label: 'Apply chain rule', latex: `f'(x) = e^{${n * a}x} \\cdot ${n * a}` },
				{ label: 'Simplify', latex: `f'(x) = ${n * a}e^{${n * a}x}` }
			];
		}
	}

	const lastStep = structuredSteps[structuredSteps.length - 1];
	return {
		topic: 'chain',
		level: lvl,
		type: lvl <= 2 ? 'poly' : (lvl <= 3 ? 'root' : 'exp'),
		q,
		a: `$$ ${lastStep.latex} $$`,
		steps: structuredSteps.map(s => `$$${s.latex}$$`).join('\n'),
		structuredSteps,
		hint: lvl <= 2 ? 'Finn indre og ytre funksjon.' : (lvl <= 4 ? 'Hugs å derivere den indre funksjonen.' : 'Dobbel kjerneregel — to lag.')
	};
}

// ── Product Rule Generator ──
// Lvl 1: x^n · (ax+b) — basic
// Lvl 2: x^n · e^(ax) or x^n · ln(x) — non-polynomial v'
// Lvl 3: x · √(x+b) — root requires algebra
// Lvl 4: x^n · (ax+b)^m — product + chain rule
// Lvl 5: (ax+b)^n · e^(cx) — both need chain rule

function generateProductProblem(lvl: number): Omit<Problem, 'id'> {
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
			{ label: 'Identify u', latex: `u = x^{${n}}` },
			{ label: 'Identify v', latex: `v = ${linear}` },
			{ label: 'Differentiate', latex: `u' = ${n}x${fmtPow(n - 1)}, \\quad v' = ${a}` },
			{ label: 'Apply product rule', latex: `f'(x) = u'v + uv'` },
			{ label: 'Substitute', latex: `f'(x) = ${n}x${fmtPow(n - 1)}(${linear}) + x^{${n}} \\cdot ${a}` },
			{ label: 'Expand', latex: `f'(x) = ${expand_coeff1}x^{${n}}${fmtNum(n * b)}x${fmtPow(n - 1)} + ${a}x^{${n}}` },
			{ label: 'Simplify', latex: `f'(x) = ${a * (n + 1)}x^{${n}}${fmtNum(n * b)}x${fmtPow(n - 1)}` }
		];
	} else if (lvl === 2) {
		const variant = pick(['exp', 'ln'] as const);
		if (variant === 'exp') {
			q = `f(x) = x^{${n}} \\cdot e^{${a}x}`;
			structuredSteps = [
				{ label: 'Identify u', latex: `u = x^{${n}}` },
				{ label: 'Identify v', latex: `v = e^{${a}x}` },
				{ label: 'Differentiate', latex: `u' = ${n}x${fmtPow(n - 1)}, \\quad v' = ${a}e^{${a}x}` },
				{ label: 'Apply product rule', latex: `f'(x) = u'v + uv'` },
				{ label: 'Substitute', latex: `f'(x) = ${n}x${fmtPow(n - 1)} \\cdot e^{${a}x} + x^{${n}} \\cdot ${a}e^{${a}x}` },
				{ label: 'Factor out', latex: `f'(x) = x${fmtPow(n - 1)}e^{${a}x}(${n} + ${a}x)` }
			];
		} else {
			q = `f(x) = x^{${n}} \\cdot \\ln(x)`;
			structuredSteps = [
				{ label: 'Identify u', latex: `u = x^{${n}}` },
				{ label: 'Identify v', latex: `v = \\ln(x)` },
				{ label: 'Differentiate', latex: `u' = ${n}x${fmtPow(n - 1)}, \\quad v' = \\frac{1}{x}` },
				{ label: 'Apply product rule', latex: `f'(x) = u'v + uv'` },
				{ label: 'Substitute', latex: `f'(x) = ${n}x${fmtPow(n - 1)} \\ln(x) + x^{${n}} \\cdot \\frac{1}{x}` },
				{ label: 'Simplify', latex: `f'(x) = ${n}x${fmtPow(n - 1)} \\ln(x) + x${fmtPow(n - 1)}` },
				{ label: 'Factor out', latex: `f'(x) = x${fmtPow(n - 1)}(${n}\\ln x + 1)` }
			];
		}
	} else if (lvl === 3) {
		// x · √(x+b)
		q = `f(x) = x \\sqrt{x${fmtNum(b)}}`;
		structuredSteps = [
			{ label: 'Identify u', latex: `u = x` },
			{ label: 'Identify v', latex: `v = \\sqrt{x${fmtNum(b)}}` },
			{ label: 'Differentiate', latex: `u' = 1, \\quad v' = \\frac{1}{2\\sqrt{x${fmtNum(b)}}}` },
			{ label: 'Apply product rule', latex: `f'(x) = u'v + uv'` },
			{ label: 'Substitute', latex: `f'(x) = 1 \\cdot \\sqrt{x${fmtNum(b)}} + x \\cdot \\frac{1}{2\\sqrt{x${fmtNum(b)}}}` },
			{ label: 'Common denominator', latex: `f'(x) = \\frac{2(x${fmtNum(b)}) + x}{2\\sqrt{x${fmtNum(b)}}}` },
			{ label: 'Simplify', latex: `f'(x) = \\frac{3x${fmtNum(2 * b)}}{2\\sqrt{x${fmtNum(b)}}}` }
		];
	} else if (lvl === 4) {
		// x^n · (ax+b)^m — product + chain rule
		const linear = `${fmt(a, 'x')}${fmtNum(b)}`;
		q = `f(x) = x^{${n}}(${linear})^{${m}}`;
		structuredSteps = [
			{ label: 'Identify u', latex: `u = x^{${n}}` },
			{ label: 'Identify v', latex: `v = (${linear})^{${m}}` },
			{ label: 'Differentiate u', latex: `u' = ${n}x${fmtPow(n - 1)}` },
			{ label: 'Differentiate v (chain rule)', latex: `v' = ${m}(${linear})${fmtPow(m - 1)} \\cdot ${a} = ${m * a}(${linear})${fmtPow(m - 1)}` },
			{ label: 'Apply product rule', latex: `f'(x) = u'v + uv'` },
			{ label: 'Substitute', latex: `f'(x) = ${n}x${fmtPow(n - 1)}(${linear})^{${m}} + x^{${n}} \\cdot ${m * a}(${linear})${fmtPow(m - 1)}` },
			{ label: 'Factor out', latex: `f'(x) = x${fmtPow(n - 1)}(${linear})${fmtPow(m - 1)}[${n}(${linear}) + ${m * a}x]` },
			{ label: 'Simplify', latex: `f'(x) = x${fmtPow(n - 1)}(${linear})${fmtPow(m - 1)}(${n * a + m * a}x${fmtNum(n * b)})` }
		];
	} else {
		// lvl 5: (ax+b)^n · e^(cx) — both factors need chain rule
		const c = rand(1, 3);
		const linear = `${fmt(a, 'x')}${fmtNum(b)}`;
		q = `f(x) = (${linear})^{${n}} \\cdot e^{${c}x}`;
		structuredSteps = [
			{ label: 'Identify u', latex: `u = (${linear})^{${n}}` },
			{ label: 'Identify v', latex: `v = e^{${c}x}` },
			{ label: 'Differentiate u (chain rule)', latex: `u' = ${n}(${linear})${fmtPow(n - 1)} \\cdot ${a} = ${n * a}(${linear})${fmtPow(n - 1)}` },
			{ label: 'Differentiate v (chain rule)', latex: `v' = ${c}e^{${c}x}` },
			{ label: 'Apply product rule', latex: `f'(x) = u'v + uv'` },
			{ label: 'Substitute', latex: `f'(x) = ${n * a}(${linear})${fmtPow(n - 1)} \\cdot e^{${c}x} + (${linear})^{${n}} \\cdot ${c}e^{${c}x}` },
			{ label: 'Factor out', latex: `f'(x) = (${linear})${fmtPow(n - 1)} \\cdot e^{${c}x}[${n * a} + ${c}(${linear})]` },
			{ label: 'Simplify', latex: `f'(x) = (${linear})${fmtPow(n - 1)} e^{${c}x}(${n * a + c * a}x${fmtNum(c * b)})` }
		];
	}

	const lastStep = structuredSteps[structuredSteps.length - 1];
	return {
		topic: 'product',
		level: lvl,
		type: 'poly',
		q,
		a: `$$ ${lastStep.latex} $$`,
		steps: structuredSteps.map(s => `$$${s.latex}$$`).join('\n'),
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

function generateQuotientProblem(lvl: number): Omit<Problem, 'id'> {
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
			{ label: 'Identify u,v', latex: `u = ${a}, \\quad v = ${denom}` },
			{ label: 'Differentiate', latex: `u' = 0, \\quad v' = ${b}` },
			{ label: 'Apply quotient rule', latex: `f'(x) = \\frac{u'v - uv'}{v^2}` },
			{ label: 'Substitute', latex: `f'(x) = \\frac{0 \\cdot (${denom}) - ${a} \\cdot ${b}}{(${denom})^2}` },
			{ label: 'Simplify', latex: `f'(x) = \\frac{${-a * b}}{(${denom})^2}` }
		];
	} else if (lvl === 2) {
		// x^n / (x+b)
		const denom = `x${fmtNum(b)}`;
		q = `f(x) = \\frac{x^{${n}}}{${denom}}`;
		structuredSteps = [
			{ label: 'Identify u,v', latex: `u = x^{${n}}, \\quad v = ${denom}` },
			{ label: 'Differentiate', latex: `u' = ${n}x${fmtPow(n - 1)}, \\quad v' = 1` },
			{ label: 'Apply quotient rule', latex: `f'(x) = \\frac{u'v - uv'}{v^2}` },
			{ label: 'Substitute', latex: `f'(x) = \\frac{${n}x${fmtPow(n - 1)}(${denom}) - x^{${n}} \\cdot 1}{(${denom})^2}` },
			{ label: 'Expand numerator', latex: `f'(x) = \\frac{${n}x^{${n}}${fmtNum(n * b)}x${fmtPow(n - 1)} - x^{${n}}}{(${denom})^2}` },
			{ label: 'Simplify', latex: `f'(x) = \\frac{${n - 1}x^{${n}}${fmtNum(n * b)}x${fmtPow(n - 1)}}{(${denom})^2}` }
		];
	} else if (lvl === 3) {
		// e^(ax) / x or ln(x) / x^n
		const variant = pick(['exp', 'ln'] as const);
		if (variant === 'exp') {
			q = `f(x) = \\frac{e^{${a}x}}{x}`;
			structuredSteps = [
				{ label: 'Identify u,v', latex: `u = e^{${a}x}, \\quad v = x` },
				{ label: 'Differentiate', latex: `u' = ${a}e^{${a}x}, \\quad v' = 1` },
				{ label: 'Apply quotient rule', latex: `f'(x) = \\frac{u'v - uv'}{v^2}` },
				{ label: 'Substitute', latex: `f'(x) = \\frac{${a}e^{${a}x} \\cdot x - e^{${a}x} \\cdot 1}{x^2}` },
				{ label: 'Factor out', latex: `f'(x) = \\frac{e^{${a}x}(${a}x - 1)}{x^2}` }
			];
		} else {
			q = `f(x) = \\frac{\\ln x}{x^{${n}}}`;
			structuredSteps = [
				{ label: 'Identify u,v', latex: `u = \\ln x, \\quad v = x^{${n}}` },
				{ label: 'Differentiate', latex: `u' = \\frac{1}{x}, \\quad v' = ${n}x${fmtPow(n - 1)}` },
				{ label: 'Apply quotient rule', latex: `f'(x) = \\frac{u'v - uv'}{v^2}` },
				{ label: 'Substitute', latex: `f'(x) = \\frac{\\frac{1}{x} \\cdot x^{${n}} - \\ln x \\cdot ${n}x${fmtPow(n - 1)}}{(x^{${n}})^2}` },
				{ label: 'Simplify numerator', latex: `f'(x) = \\frac{x${fmtPow(n - 1)} - ${n}x${fmtPow(n - 1)}\\ln x}{x^{${2 * n}}}` },
				{ label: 'Factor out', latex: `f'(x) = \\frac{x${fmtPow(n - 1)}(1 - ${n}\\ln x)}{x^{${2 * n}}}` },
				{ label: 'Simplify', latex: `f'(x) = \\frac{1 - ${n}\\ln x}{x^{${n + 1}}}` }
			];
		}
	} else if (lvl === 4) {
		// x / (ax+b)^n — quotient + chain rule
		const linear = `${fmt(a, 'x')}${fmtNum(b)}`;
		q = `f(x) = \\frac{x}{(${linear})^{${n}}}`;
		structuredSteps = [
			{ label: 'Identify u,v', latex: `u = x, \\quad v = (${linear})^{${n}}` },
			{ label: 'Differentiate u', latex: `u' = 1` },
			{ label: 'Differentiate v (chain rule)', latex: `v' = ${n}(${linear})${fmtPow(n - 1)} \\cdot ${a} = ${n * a}(${linear})${fmtPow(n - 1)}` },
			{ label: 'Apply quotient rule', latex: `f'(x) = \\frac{u'v - uv'}{v^2}` },
			{ label: 'Substitute', latex: `f'(x) = \\frac{1 \\cdot (${linear})^{${n}} - x \\cdot ${n * a}(${linear})${fmtPow(n - 1)}}{((${linear})^{${n}})^2}` },
			{ label: 'Factor out', latex: `f'(x) = \\frac{(${linear})${fmtPow(n - 1)}[(${linear}) - ${n * a}x]}{(${linear})^{${2 * n}}}` },
			{ label: 'Simplify', latex: `f'(x) = \\frac{${a - n * a}x${fmtNum(b)}}{(${linear})^{${n + 1}}}` }
		];
	} else {
		// lvl 5: √x / (x+a)
		const denom = `x${fmtNum(a)}`;
		q = `f(x) = \\frac{\\sqrt{x}}{${denom}}`;
		structuredSteps = [
			{ label: 'Identify u,v', latex: `u = \\sqrt{x}, \\quad v = ${denom}` },
			{ label: 'Differentiate', latex: `u' = \\frac{1}{2\\sqrt{x}}, \\quad v' = 1` },
			{ label: 'Apply quotient rule', latex: `f'(x) = \\frac{u'v - uv'}{v^2}` },
			{ label: 'Substitute', latex: `f'(x) = \\frac{\\frac{1}{2\\sqrt{x}}(${denom}) - \\sqrt{x} \\cdot 1}{(${denom})^2}` },
			{ label: 'Expand numerator', latex: `f'(x) = \\frac{\\frac{${denom}}{2\\sqrt{x}} - \\sqrt{x}}{(${denom})^2}` },
			{ label: 'Common denominator', latex: `f'(x) = \\frac{${denom} - 2x}{2\\sqrt{x}(${denom})^2}` },
			{ label: 'Simplify', latex: `f'(x) = \\frac{${a}-x}{2\\sqrt{x}(${denom})^2}` }
		];
	}

	const lastStep = structuredSteps[structuredSteps.length - 1];
	return {
		topic: 'quotient',
		level: lvl,
		type: 'poly',
		q,
		a: `$$ ${lastStep.latex} $$`,
		steps: structuredSteps.map(s => `$$${s.latex}$$`).join('\n'),
		structuredSteps,
		hint: lvl <= 3 ? "Brøkregel: (u'v - uv') / v²." : "Brøkregel + kjerneregel på nemnaren."
	};
}

// ── Public API ──

export function generateSingleProblem(
	rule: TopicId,
	lvl: number,
	_type?: ProblemType  // kept for API compat, but level drives variant now
): Omit<Problem, 'id'> | null {
	switch (rule) {
		case 'chain':
			return generateChainProblem(lvl);
		case 'product':
			return generateProductProblem(lvl);
		case 'quotient':
			return generateQuotientProblem(lvl);
	}
}

export function generateProblemBank(): Problem[] {
	let id = 1000;
	const rules: TopicId[] = ['chain', 'product', 'quotient'];
	const levels = [1, 2, 3, 4, 5];
	const bank: Problem[] = [];

	for (const rule of rules) {
		for (const lvl of levels) {
			// 8 problems per (rule × level) — enough variety, not overwhelming
			for (let i = 0; i < 8; i++) {
				const prob = generateSingleProblem(rule, lvl);
				if (prob) {
					bank.push({ ...prob, id: id++ });
				}
			}
		}
	}

	return bank;
}

// Re-export types
export type { Problem, TopicId, ProblemType } from './types';
