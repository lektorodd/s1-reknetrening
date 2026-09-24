// «Drøfting», checked against the maths.
//
// The function is read back from the question and the answer is checked by
// computing with it — never by asking the generator what it meant. A tangent
// must touch the graph with the same slope; a top point must have f' = 0 and
// f' going from + to −; an optimum must beat every other point in its range.

import { describe, expect, it } from 'vitest';
import { generateAnalysisBank } from './generator';
import { compile, rhsOf } from '../testing/latex-eval';
import { instructionFor } from '../registry';

const bank = generateAnalysisBank();
const of = (topic: string) => bank.filter((p) => p.topic === topic).map((p) => [p.id, p] as const);
const H = 1e-5;
const deriv = (f: (x: number) => number, x: number) => (f(x + H) - f(x - H)) / (2 * H);
const fn = (latex: string) => {
	const c = compile(latex);
	return (x: number) => c({ x });
};
const num = (s: string) => Number(s.replace('{,}', '.'));

describe('Tangenten', () => {
	it.each(of('tangent'))('%s: linja rører grafen med same stiging', (_id, p) => {
		const f = fn(p.q.replace(/^f\(x\)\s*=/, ''));
		const line = fn(rhsOf(p.a));
		const m = deriv(line, 0);
		const c = line(0);

		// The point: named in the instruction, or wherever f' equals the slope.
		const named = instructionFor(p).match(/x = (-?\d+)/);
		const xs = named ? [Number(named[1])] : Array.from({ length: 2001 }, (_, i) => -10 + i * 0.01);
		const touch = xs.find((x) => Math.abs(f(x) - (m * x + c)) < 1e-6 && Math.abs(deriv(f, x) - m) < 1e-4);
		expect(touch, `${p.q}, ${p.a}`).toBeDefined();

		const slope = instructionFor(p).match(/stigingstal \$(-?\d+)\$/);
		if (slope) expect(m).toBeCloseTo(Number(slope[1]), 6);
	});
});

describe('Topp- og botnpunkt', () => {
	it.each(of('extrema'))('%s: punkta er rette, og ingen manglar', (_id, p) => {
		const f = fn(p.q.replace(/^f\(x\)\s*=/, ''));
		const fp = (x: number) => deriv(f, x);
		const found = [...p.a.matchAll(/\\text\{([^:}]+):\s*\}\s*((?:\(-?\d+, -?\d+\)(?:, \\ )?)+)/g)].flatMap((m) =>
			[...m[2].matchAll(/\((-?\d+), (-?\d+)\)/g)].map((pt) => ({
				kind: m[1].trim().toLowerCase(),
				x: Number(pt[1]),
				y: Number(pt[2])
			}))
		);
		expect(found.length, p.a).toBeGreaterThan(0);

		for (const { kind, x, y } of found) {
			expect(Math.abs(fp(x)), `${p.q}: f'(${x})`).toBeLessThan(1e-4);
			expect(f(x), `${p.q}: f(${x})`).toBeCloseTo(y, 6);
			const [left, right] = [fp(x - 0.01), fp(x + 0.01)];
			const actual = left > 0 && right < 0 ? 'toppunkt' : left < 0 && right > 0 ? 'botnpunkt' : 'terrassepunkt';
			const named = kind.includes('terrasse') ? 'terrassepunkt' : kind;
			expect(actual, `${p.q}: (${x}, ${y})`).toBe(named);
		}

		// Every whole-number zero of f' in view is accounted for.
		for (let x = -10; x <= 10; x++) {
			if (Math.abs(fp(x)) < 1e-6) expect(found.some((f) => f.x === x), `${p.q}: f'(${x}) = 0 manglar`).toBe(true);
		}
	});
});

describe('Optimering', () => {
	it.each(of('optimisation'))('%s: svaret er det beste i området', (_id, p) => {
		const interval = instructionFor(p).match(/\[(-?\d+), (-?\d+)\]/);
		if (interval) {
			// On an interval: the largest and smallest value of f.
			const f = fn(p.q.replace(/^f\(x\)\s*=/, ''));
			const [lo, hi] = interval.slice(1).map(Number);
			const m = p.a.match(/Størst: \} f\((-?\d+)\) = (-?\d+).*minst: \} f\((-?\d+)\) = (-?\d+)/);
			expect(m, p.a).not.toBeNull();
			const [xMax, vMax, xMin, vMin] = m!.slice(1).map(Number);
			expect(f(xMax)).toBeCloseTo(vMax, 6);
			expect(f(xMin)).toBeCloseTo(vMin, 6);
			for (let x = lo; x <= hi + 1e-9; x += (hi - lo) / 400) {
				expect(f(x)).toBeLessThanOrEqual(vMax + 1e-9);
				expect(f(x)).toBeGreaterThanOrEqual(vMin - 1e-9);
			}
		} else {
			// A word problem: the function to maximise is the one the working sets up.
			const setup = p.structuredSteps.find((s) => /^[AO]\(x\) =/.test(s.latex))?.latex ?? p.q.split('\\quad')[0];
			const objective = fn(rhsOf(setup.replace(/^V\(x\) =/, '')).replace(/,\s*$/, ''));
			const m = p.a.match(/^x = (\d+)(?:\\text\{[^}]*\})?, \\quad [AVO] = (\d+)/);
			expect(m, p.a).not.toBeNull();
			const [x0, best] = m!.slice(1).map(num);
			expect(objective(x0), setup).toBeCloseTo(best, 6);
			for (let x = x0 / 50; x < 2 * x0; x += x0 / 50) {
				expect(objective(x), `${setup} ved x=${x}`).toBeLessThanOrEqual(best + 1e-9);
			}
		}
	});
});
