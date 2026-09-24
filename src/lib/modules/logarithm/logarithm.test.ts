// Maths tests for the logarithm equations.
//
// The audit found one problem type showing a wrong answer: lg(x²) + lg a = 2
// was solved through 2·lg x, which assumes x > 0, so the negative root was
// dropped from every problem at that level. These tests solve the equations
// numerically from the question itself, so the answer the student sees is
// checked against the maths rather than against another piece of generator code.

import { describe, expect, it } from 'vitest';
import { generateLogProblemBank } from './generator';
import { compile, rhsOf } from '../testing/latex-eval';

const bank = generateLogProblemBank();
const at = (topic: string, level: number) =>
	bank.filter((p) => p.topic === topic && p.level === level);

/** Parse a LaTeX decimal the generator writes as 2{,}81. */
function decimalIn(latex: string): number {
	const m = latex.match(/\\approx\s*(-?\d+)\{,\}(\d+)/);
	if (!m) throw new Error(`no decimal in ${latex}`);
	return Number(`${m[1]}.${m[2]}`);
}

/** Evaluate the simplified ± root the generator writes, e.g. 5\sqrt{2}, \frac{10\sqrt{3}}{3}, \frac{e}{2}. */
function evalRoot(latex: string): number {
	const s = latex.replace(/^x = \\pm\s*/, '');
	const term = (t: string): number => {
		let v = 1;
		const coef = t.match(/^(\d+)/);
		if (coef) v *= Number(coef[1]);
		if (t.includes('e')) v *= Math.E;
		const root = t.match(/\\sqrt\{(\d+)\}/);
		if (root) v *= Math.sqrt(Number(root[1]));
		return v;
	};
	const frac = s.match(/^\\frac\{(.+)\}\{(\d+)\}$/);
	return frac ? term(frac[1]) / Number(frac[2]) : term(s);
}

describe('Logarithm equations, level 2: lg(x²) + lg a = 2', () => {
	const problems = at('log_equation', 2);

	it('has problems at this level', () => {
		expect(problems.length).toBeGreaterThan(0);
	});

	it('gives both roots, because lg(x²) is defined for negative x too', () => {
		for (const p of problems) expect(p.a, p.id).toMatch(/\\pm/);
	});

	it('does not use the power rule, which silently assumes x > 0', () => {
		for (const p of problems) {
			for (const s of p.structuredSteps) {
				expect(s.latex, p.id).not.toMatch(/^2\\(lg|ln)\\,x/);
			}
		}
	});

	it('has an answer that satisfies the equation with either sign', () => {
		for (const p of problems) {
			const m = p.q.match(/\\(lg|ln)\(x\^\{2\}\) \+ \\(?:lg|ln)\\,(\d+) = 2/);
			expect(m, p.q).not.toBeNull();
			const log = m![1] === 'lg' ? Math.log10 : Math.log;
			const a = Number(m![2]);
			const x = evalRoot(p.a);
			for (const signed of [x, -x]) {
				expect(Math.abs(log(signed * signed) + log(a) - 2), `${p.q} at x=${signed}`).toBeLessThan(1e-9);
			}
		}
	});
});

describe('Exponential equations, level 5: c · b^(x+k) = R', () => {
	const problems = at('exp_equation', 5);

	it('has an answer that solves the equation', () => {
		for (const p of problems) {
			const m = p.q.match(/^(\d+) \\cdot (\d+)\^\{x\+(\d+)\} = (\d+)$/);
			expect(m, p.q).not.toBeNull();
			const [c, b, k, R] = m!.slice(1).map(Number);
			const x = decimalIn(p.a);
			// The decimal is rounded to two places, so allow for that.
			expect(Math.abs(c * Math.pow(b, x + k) - R) / R, p.q).toBeLessThan(0.02);
		}
	});

	it('is not always x = 1', () => {
		// Every problem at this level used to have x = 1 by construction.
		const answers = new Set(problems.map((p) => decimalIn(p.a)));
		expect(answers.size).toBeGreaterThan(1);
		expect([...answers].every((x) => Math.abs(x - 1) < 1e-9)).toBe(false);
	});

	it('needs logarithms: R/c is never a power of b', () => {
		for (const p of problems) {
			const [c, b, , R] = p.q.match(/^(\d+) \\cdot (\d+)\^\{x\+(\d+)\} = (\d+)$/)!.slice(1).map(Number);
			const e = Math.log(R / c) / Math.log(b);
			expect(Math.abs(e - Math.round(e)), p.q).toBeGreaterThan(1e-6);
		}
	});
});

// ── Every problem, checked numerically ──

const EXPRESSION_TOPICS = ['log_product', 'log_quotient', 'log_power', 'log_simplify'];
const SAMPLES: Record<string, number>[] = [
	{ x: 2.3, y: 1.7, z: 3.1 },
	{ x: 5.9, y: 0.6, z: 1.4 },
	{ x: 1.2, y: 7.5, z: 0.8 }
];

/** The maths of a question, without any instruction written into it. */
const mathOf = (q: string) => q.replace(/\\text\{[^}]*\}/g, '').trim();

describe('Logaritmeuttrykk: svaret har same verdi som oppgåva', () => {
	it.each(bank.filter((p) => EXPRESSION_TOPICS.includes(p.topic)).map((p) => [p.id, p] as const))(
		'%s',
		(_id, p) => {
			const q = compile(mathOf(p.q));
			const a = compile(rhsOf(p.a));
			for (const v of SAMPLES) {
				const want = q(v);
				expect(Math.abs(a(v) - want), `${p.q} ⟶ ${p.a} ved ${JSON.stringify(v)}`).toBeLessThan(1e-9 * Math.max(1, Math.abs(want)));
			}
		}
	);
});

describe('Likningar: svaret løyser likninga', () => {
	it.each(bank.filter((p) => ['log_equation', 'exp_equation'].includes(p.topic)).map((p) => [p.id, p] as const))(
		'%s',
		(_id, p) => {
			const [lhsSrc, rhsSrc] = mathOf(p.q).split('=');
			const lhs = compile(lhsSrc);
			const rhs = compile(rhsSrc);
			const expr = rhsOf(p.a);
			const roots = expr.startsWith('\\pm')
				? [compile(expr.slice(3)), (v: Record<string, number>) => -compile(expr.slice(3))(v)]
				: [compile(expr)];
			for (const root of roots) {
				const x = root({});
				const diff = lhs({ x }) - rhs({ x });
				expect(Number.isFinite(diff) && Math.abs(diff) < 1e-9 * Math.max(1, Math.abs(rhs({ x }))), `${p.q} ved x=${x}: ${diff}`).toBe(true);
			}
		}
	);
});
