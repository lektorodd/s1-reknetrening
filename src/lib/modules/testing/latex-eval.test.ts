// The evaluator the content tests lean on. If it quietly misread LaTeX, every
// numeric check built on it would pass for the wrong reason.

import { describe, expect, it } from 'vitest';
import { compile, evaluate, rhsOf } from './latex-eval';

describe('latex-eval', () => {
	it.each([
		['2x^{3}', { x: 2 }, 16],
		['\\frac{3}{2\\sqrt{x}}', { x: 4 }, 0.75],
		['e^{2x}', { x: 0.5 }, Math.E],
		['\\ln(x^{2}+1)', { x: 2 }, Math.log(5)],
		['\\lg\\,1000', {}, 3],
		['3\\ln x + 1', { x: Math.E }, 4],
		['\\sqrt[3]{x^{2}}', { x: 8 }, 4],
		['x^{3/2}', { x: 4 }, 8],
		['(2x+1)^{-2}', { x: 1 }, 1 / 9],
		['-4x \\cdot e^{x}', { x: 0 }, -0],
		['\\left(\\frac{x}{y}\\right)', { x: 6, y: 3 }, 2],
		['x[3 + 2x]', { x: 2 }, 14],
		['\\lg\\,x + \\lg\\,y - \\lg\\,z', { x: 10, y: 100, z: 10 }, 2],
		['2{,}81', {}, 2.81]
	])('%s', (src, vars, want) => {
		expect(evaluate(src, vars)).toBeCloseTo(want, 10);
	});

	it('reads implicit products at the right precedence', () => {
		// 2x^2 is 2·(x²), not (2x)².
		expect(evaluate('2x^{2}', { x: 3 })).toBe(18);
	});

	it('rejects what it does not understand, rather than guessing', () => {
		expect(() => compile('\\sin x')).toThrow();
		expect(() => compile('g(u)')).toThrow();
	});

	it('tells a wrong derivative from a right one', () => {
		// The numeric check in derivative.test.ts rests on this.
		const f = compile('(3x+1)^{2}');
		const d = (x: number) => (f({ x: x + 1e-5 }) - f({ x: x - 1e-5 })) / 2e-5;
		expect(evaluate('6(3x+1)', { x: 1.3 })).toBeCloseTo(d(1.3), 4);
		expect(Math.abs(evaluate('2(3x+1)', { x: 1.3 }) - d(1.3))).toBeGreaterThan(1);
	});

	it('takes the last right-hand side, without the approximation', () => {
		expect(rhsOf("f'(x) = 2x = 4x - 2x")).toBe('4x - 2x');
		expect(rhsOf('x = \\frac{\\lg 49}{\\lg 4} - 2 \\approx 0{,}81')).toBe('\\frac{\\lg 49}{\\lg 4} - 2');
	});
});
