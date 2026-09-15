// Deterministic pseudo-random number generation.
//
// The problem bank is rebuilt on every page load, but a given problem id must
// always produce the same problem — otherwise progress stored against that id
// refers to a different question after a reload.

/** xmur3 string hash — spreads an id string into a 32-bit seed. */
export function hashId(str: string): number {
	let h = 1779033703 ^ str.length;
	for (let i = 0; i < str.length; i++) {
		h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
		h = (h << 13) | (h >>> 19);
	}
	h = Math.imul(h ^ (h >>> 16), 2246822507);
	h = Math.imul(h ^ (h >>> 13), 3266489909);
	return (h ^= h >>> 16) >>> 0;
}

/** mulberry32 — small, fast, good enough for picking coefficients. */
export function mulberry32(seed: number): () => number {
	let a = seed >>> 0;
	return function () {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Build an RNG seeded by a problem id. */
export function rngFor(id: string): () => number {
	return mulberry32(hashId(id));
}
