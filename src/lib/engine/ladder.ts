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
import { fadeSteps, type FadingLevel } from './guidance-fading';

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
 * Pick `n` of the given rungs, spread evenly and keeping both ends.
 *
 * The worked example is the point of starting, and the unaided problem is the
 * point of finishing, so both stay whenever there are two problems or more:
 * four of five rungs give 0-1-3-4, two give 0-4.
 */
function spread(rungs: FadingLevel[], n: number): FadingLevel[] {
	const all = rungs.length;
	if (n >= all) return [...rungs];
	if (n <= 1) return rungs.slice(0, n);
	return Array.from({ length: n }, (_, i) => rungs[Math.round((i * (all - 1)) / (n - 1))]);
}

/** Which rungs a ladder of `n` distinct problems gets, when every rung differs. */
export function rungsFor(n: number): FadingLevel[] {
	return spread(LADDER_RUNGS, n);
}

/**
 * The rungs that actually give less help than the one before, for a problem
 * with this many steps.
 *
 * On a short problem two rungs can hide the same number of steps: a 3-step
 * problem showed one step on both «To siste» and «Starten», so the student
 * pressed «Mindre hjelp» and got the same help again. Those rungs are left out.
 */
export function distinctRungs(stepCount: number): FadingLevel[] {
	const steps = Array.from({ length: stepCount }, (_, i) => ({ label: '', latex: `${i}` }));
	const out: FadingLevel[] = [];
	let last = -1;
	for (const rung of LADDER_RUNGS) {
		const hidden = fadeSteps(steps, rung).hidden.length;
		if (hidden > last) {
			out.push(rung);
			last = hidden;
		}
	}
	return out;
}

/**
 * Build the ladder for one topic: a different problem at each rung, so the
 * student practises the pattern instead of memorising a single answer.
 *
 * "Different" means a different question, not just a different id: the bank
 * has held variants that came out identical, and the worked example on the
 * first rung came back as the unaided problem on the last. Rungs that would
 * give no less help than the one before are skipped (see distinctRungs). When
 * a topic has fewer distinct problems than rungs the ladder is shorter still —
 * better that than the same problem twice wearing different amounts of help.
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
	if (candidates.length === 0) return [];

	// Problems at one level can differ by a step (a fraction that reduces or
	// not), so go by the shortest: its distinct rungs are distinct for all.
	const shortest = Math.min(...candidates.map((p) => p.structuredSteps.length));
	return spread(distinctRungs(shortest), candidates.length).map((rung, i) => ({
		rung,
		problem: candidates[i]
	}));
}
