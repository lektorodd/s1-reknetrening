// A small LaTeX evaluator, for tests only.
//
// The generators write answers as LaTeX strings, so the only way to check that
// an answer is *right* — not merely well-formed — is to read the string back as
// maths and compute with it. This covers exactly the subset the generators use:
// numbers (with a Norwegian decimal comma, 2{,}81), x, y, z, e, + − · and
// implicit products, / and \frac, powers, \sqrt and \sqrt[n], \ln and \lg,
// brackets of every kind. Anything else is a parse error, which a test should
// treat as a finding: either the generator wrote something unusual, or this
// evaluator needs to learn it.

export type Vars = Record<string, number>;
type Node = (v: Vars) => number;

class ParseError extends Error {}

/** Remove spacing commands and \left / \right, which carry no meaning here. */
function normalise(src: string): string {
	return src
		.replace(/\\left|\\right/g, '')
		.replace(/\\[,;:! ]|\\quad|\\qquad/g, ' ')
		.replace(/\\cdot|\\times/g, '*')
		.replace(/(\d)\{,\}(\d)/g, '$1.$2')
		.trim();
}

/**
 * Parse LaTeX into a function of the variables.
 * Throws a ParseError on anything outside the supported subset.
 */
export function compile(latex: string): Node {
	const s = normalise(latex);
	let i = 0;

	const peek = () => {
		while (s[i] === ' ') i++;
		return s[i];
	};
	const startsWith = (tok: string) => {
		peek();
		return s.startsWith(tok, i);
	};
	const eat = (tok: string) => {
		if (!startsWith(tok)) throw new ParseError(`expected ${tok} at ${i} in «${s}»`);
		i += tok.length;
	};

	function group(): Node {
		eat('{');
		const n = expr();
		eat('}');
		return n;
	}

	function expr(): Node {
		let left = term();
		for (;;) {
			if (startsWith('+')) {
				i++;
				const l = left, r = term();
				left = (v) => l(v) + r(v);
			} else if (startsWith('-')) {
				i++;
				const l = left, r = term();
				left = (v) => l(v) - r(v);
			} else return left;
		}
	}

	/** Can a factor start here? Used for implicit multiplication. */
	function factorStarts(): boolean {
		const c = peek();
		if (c === undefined) return false;
		if (/[0-9.xyze([{]/.test(c)) return true;
		return /^\\(frac|sqrt|ln|lg)/.test(s.slice(i));
	}

	function term(): Node {
		let left = unary();
		for (;;) {
			if (startsWith('*')) {
				i++;
				const l = left, r = unary();
				left = (v) => l(v) * r(v);
			} else if (startsWith('/')) {
				i++;
				const l = left, r = unary();
				left = (v) => l(v) / r(v);
			} else if (factorStarts()) {
				const l = left, r = power();
				left = (v) => l(v) * r(v);
			} else return left;
		}
	}

	function unary(): Node {
		if (startsWith('-')) {
			i++;
			const n = unary();
			return (v) => -n(v);
		}
		if (startsWith('+')) {
			i++;
			return unary();
		}
		return power();
	}

	function exponent(): Node {
		if (startsWith('{')) return group();
		// A single character exponent: x^2
		const c = peek();
		if (c && /[0-9]/.test(c)) {
			i++;
			return () => Number(c);
		}
		if (c && /[xyz]/.test(c)) {
			i++;
			return (v) => v[c];
		}
		throw new ParseError(`bad exponent at ${i} in «${s}»`);
	}

	function power(): Node {
		const base = atom();
		if (startsWith('^')) {
			i++;
			const e = exponent();
			return (v) => Math.pow(base(v), e(v));
		}
		return base;
	}

	/** The argument of \ln or \lg: bracketed, or a single atom with its power. */
	function logArg(): Node {
		if (startsWith('(') || startsWith('[') || startsWith('{')) return power();
		return power();
	}

	function atom(): Node {
		const c = peek();
		if (c === undefined) throw new ParseError(`unexpected end of «${s}»`);
		if (c === '(') {
			i++;
			const n = expr();
			eat(')');
			return n;
		}
		if (c === '[') {
			i++;
			const n = expr();
			eat(']');
			return n;
		}
		if (c === '{') return group();
		if (/[0-9.]/.test(c)) {
			const m = /^[0-9]*\.?[0-9]+/.exec(s.slice(i));
			if (!m) throw new ParseError(`bad number at ${i} in «${s}»`);
			i += m[0].length;
			const n = Number(m[0]);
			return () => n;
		}
		if (c === 'e') {
			i++;
			return () => Math.E;
		}
		if (/[xyz]/.test(c)) {
			i++;
			return (v) => {
				if (!(c in v)) throw new ParseError(`no value for ${c}`);
				return v[c];
			};
		}
		if (s.startsWith('\\frac', i)) {
			i += 5;
			const num = group();
			const den = group();
			return (v) => num(v) / den(v);
		}
		if (s.startsWith('\\sqrt', i)) {
			i += 5;
			let index: Node = () => 2;
			if (startsWith('[')) {
				i++;
				index = expr();
				eat(']');
			}
			const rad = group();
			return (v) => Math.pow(rad(v), 1 / index(v));
		}
		if (s.startsWith('\\ln', i)) {
			i += 3;
			const a = logArg();
			return (v) => Math.log(a(v));
		}
		if (s.startsWith('\\lg', i)) {
			i += 3;
			const a = logArg();
			return (v) => Math.log10(a(v));
		}
		throw new ParseError(`unsupported «${s.slice(i, i + 12)}» in «${s}»`);
	}

	const root = expr();
	if (peek() !== undefined) throw new ParseError(`trailing «${s.slice(i)}» in «${s}»`);
	return root;
}

/** Evaluate LaTeX at the given variable values. */
export function evaluate(latex: string, vars: Vars = {}): number {
	return compile(latex)(vars);
}

/** The right-hand side of `lhs = rhs` (the last `=`), with any `\approx …` tail removed. */
export function rhsOf(latex: string): string {
	const exact = latex.split('\\approx')[0];
	const parts = exact.split('=');
	return parts[parts.length - 1].trim();
}

export { ParseError };
