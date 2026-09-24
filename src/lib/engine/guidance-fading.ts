// Backward fading, levels 0-4 — based on future-report §6.1.
//
// Used only by the Lærebok's practice ladder. A session never fades: how much
// of a solution is shown is instruction, and the student chooses it there
// rather than having it drawn for them.

import type { StepEntry } from '$lib/modules/types';

/** A solution step as the modules write it — sign charts and all. */
export type FadingStepEntry = StepEntry;

// ── Fading Levels ──

export type FadingLevel = 0 | 1 | 2 | 3 | 4;

export interface FadedSteps {
	shown: FadingStepEntry[];    // Steps shown to the student
	hidden: FadingStepEntry[];   // Steps the student must complete
	prompt: string;        // Instruction for the student (i18n key)
	level: FadingLevel;
}

/**
 * Apply backward fading to a set of steps.
 * Returns which steps to show and which to hide.
 */
export function fadeSteps(steps: FadingStepEntry[], level: FadingLevel): FadedSteps {
	if (steps.length === 0) {
		return { shown: [], hidden: [], prompt: 'fading_independent', level };
	}

	switch (level) {
		case 0:
			// Full worked example — show everything
			return {
				shown: steps,
				hidden: [],
				prompt: 'fading_study',
				level: 0
			};

		case 1: {
			// Show all but last step
			const split = Math.max(1, steps.length - 1);
			return {
				shown: steps.slice(0, split),
				hidden: steps.slice(split),
				prompt: 'fading_last_step',
				level: 1
			};
		}

		case 2: {
			// Show all but last two steps
			const split = Math.max(1, steps.length - 2);
			return {
				shown: steps.slice(0, split),
				hidden: steps.slice(split),
				prompt: 'fading_last_two',
				level: 2
			};
		}

		case 3: {
			// Show only the identification steps (first ~40%).
			// Clamped against level 2 so the ladder stays monotonic: on a short
			// 3-step problem, ceil(0.4 * 3) = 2 would otherwise reveal *more*
			// than level 2 does.
			const levelTwoSplit = Math.max(1, steps.length - 2);
			const split = Math.max(1, Math.min(levelTwoSplit, Math.ceil(steps.length * 0.4)));
			return {
				shown: steps.slice(0, split),
				hidden: steps.slice(split),
				prompt: 'fading_apply',
				level: 3
			};
		}

		case 4:
			// Independent — show nothing
			return {
				shown: [],
				hidden: steps,
				prompt: 'fading_independent',
				level: 4
			};
	}
}
