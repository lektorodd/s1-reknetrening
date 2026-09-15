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
 * Build the ladder for one topic: a different problem at each rung, so the
 * student practises the pattern instead of memorising a single answer.
 *
 * Returns fewer rungs than LADDER_RUNGS.length when the topic does not have
 * enough distinct problems — better a short ladder than the same problem twice
 * wearing different amounts of help.
 */
export function buildLadder(
	moduleId: string,
	topic: string,
	bank: Problem[],
	level: number = LADDER_LEVEL
): LadderRung[] {
	const candidates = bank.filter(
		(p) => p.moduleId === moduleId && p.topic === topic && p.level === level
	);

	return LADDER_RUNGS.slice(0, candidates.length).map((rung, i) => ({
		rung,
		problem: candidates[i]
	}));
}
