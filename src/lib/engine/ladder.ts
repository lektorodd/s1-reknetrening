// Practice ladder — the fading sequence, as instruction.
//
// A ladder walks a student from a fully worked solution to an unaided problem
// over five rungs, showing fewer steps each time. It is *browsed*, not drawn:
// the student decides when to take on more, and nothing here is rated or
// scheduled. That is what makes it Lærebok material rather than practice.
//
// Difficulty (level 1-5) and support (rung 0-4) are separate axes. The ladder
// holds difficulty fixed and varies support; the Treningsrom does the opposite.

import type { Problem } from '$lib/modules/types';
import type { FadingLevel } from './guidance-fading';

/** Support rungs, most help first. */
export const LADDER_RUNGS: FadingLevel[] = [0, 1, 2, 3, 4];

/**
 * Difficulty the ladder draws from.
 *
 * Level 2 is the gentlest level that still has the full step structure worth
 * walking through; level 1 problems are often too short for five distinct
 * degrees of support to read differently.
 */
export const LADDER_LEVEL = 2;

export interface LadderRung {
	/** 0 = fully worked, 4 = nothing shown. */
	rung: FadingLevel;
	problem: Problem;
}

/**
 * Which rungs a ladder of `n` distinct problems gets.
 *
 * Both ends are kept whenever there are two problems or more: the worked
 * example is the point of starting, and the unaided problem is the point of
 * finishing. The rungs in between are spread evenly, so four problems give
 * 0-1-3-4 and two give 0-4.
 */
export function rungsFor(n: number): FadingLevel[] {
	const all = LADDER_RUNGS.length;
	if (n >= all) return [...LADDER_RUNGS];
	if (n <= 1) return LADDER_RUNGS.slice(0, n);
	return Array.from(
		{ length: n },
		(_, i) => LADDER_RUNGS[Math.round((i * (all - 1)) / (n - 1))]
	);
}

/**
 * Build the ladder for one topic: a different problem at each rung, so the
 * student practises the pattern instead of memorising a single answer.
 *
 * "Different" means a different question, not just a different id: the bank
 * holds several variants that come out identical (lg and ln versions of one
 * rule, say), and without this the worked example on the first rung came back
 * as the unaided problem on the last. When a topic has fewer distinct problems
 * than rungs the ladder is shorter — better that than the same problem twice
 * wearing different amounts of help.
 */
export function buildLadder(
	moduleId: string,
	topic: string,
	bank: Problem[],
	level: number = LADDER_LEVEL
): LadderRung[] {
	const seen = new Set<string>();
	const candidates = bank.filter((p) => {
		if (p.moduleId !== moduleId || p.topic !== topic || p.level !== level) return false;
		if (seen.has(p.q)) return false;
		seen.add(p.q);
		return true;
	});

	return rungsFor(candidates.length).map((rung, i) => ({
		rung,
		problem: candidates[i]
	}));
}
