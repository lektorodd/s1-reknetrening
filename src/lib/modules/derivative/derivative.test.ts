// Every derivative the bank shows, checked against the maths.
//
// The question f(x) is read back from its LaTeX and differentiated numerically;
// the answer, and every intermediate line of the form f'(x) = …, must agree
// with that at several points where f is defined. The generator is never asked
// what the answer "should" be — only the question is trusted.

import { describe, expect, it } from 'vitest';
import { generateProblemBank } from './generator';
import { compile } from '../testing/latex-eval';

const bank = generateProblemBank();
const POINTS = [0.35, 0.8, 1.3, 1.9, 2.6, 3.4];
const H = 1e-5;

const close = (a: number, b: number) => Math.abs(a - b) <= 1e-4 * Math.max(1, Math.abs(a), Math.abs(b));

/** The expression after `f(x) =` or `f'(x) =`, or null when the line is not one. */
function body(latex: string, prefix: RegExp): string | null {
	const m = latex.match(prefix);
	return m ? latex.slice(m[0].length) : null;
}

describe('Derivasjonsbanken', () => {
	it('has problems', () => {
		expect(bank.length).toBeGreaterThan(0);
	});

	it.each(bank.map((p) => [p.id, p] as const))('%s: svaret er den deriverte', (_id, p) => {
		const fSrc = body(p.q, /^f\(x\)\s*=/);
		expect(fSrc, p.q).not.toBeNull();
		const f = compile(fSrc!);

		// Every concrete f'(x) = … line: the answer, and the working before it.
		// Lines naming u, v or g are the rule in general form, not an expression.
		const lines = p.structuredSteps
			.map((s) => body(s.latex, /^f'\(x\)\s*=/))
			.filter((b): b is string => b !== null && !/[uvg]|'/.test(b));
		expect(lines.length, p.id).toBeGreaterThan(0);
		const candidates = [...new Set([...lines.flatMap((l) => l.split('=')), (body(p.a, /^f'\(x\)\s*=/) ?? p.a)])];

		let checked = 0;
		for (const x of POINTS) {
			const fx = f({ x });
			const d = (f({ x: x + H }) - f({ x: x - H })) / (2 * H);
			if (!Number.isFinite(fx) || !Number.isFinite(d)) continue;
			checked++;
			for (const c of candidates) {
				const got = compile(c)({ x });
				expect(close(got, d), `${p.q}  ⟶  ${c} ved x=${x}: ${got} ≠ ${d}`).toBe(true);
			}
		}
		expect(checked, `${p.q}: for få punkt der f er definert`).toBeGreaterThanOrEqual(3);
	});
});

describe('Kjerneregelen etter funksjonsfamilie', () => {
	const chain = bank.filter((p) => p.topic === 'chain');

	it('names the concept after the outer function, not the level', () => {
		// √(4x+1) used to be filed as «polynom» because it sat at level 2.
		const outer: Record<string, RegExp> = {
			root: /^f\(x\) = \\sqrt/,
			exp: /^f\(x\) = e\^/,
			log: /^f\(x\) = \\ln/,
			poly: /^f\(x\) = \(/
		};
		for (const p of chain) expect(p.q, `${p.id} (${p.type})`).toMatch(outer[p.type]);
	});

	it('gives every family a way in at level 2 or below', () => {
		// e^u existed only at levels 4-5, so a weak student never met it at a
		// level they could manage.
		for (const family of ['poly', 'root', 'exp', 'log']) {
			const lowest = Math.min(...chain.filter((p) => p.type === family).map((p) => p.level));
			expect(lowest, family).toBeLessThanOrEqual(2);
		}
	});
});
