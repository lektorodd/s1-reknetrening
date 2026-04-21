// Guidance Fading – Backward fading levels 0-4
// Based on future-report §6.1

// Generic step entry — both derivative and logarithm modules use this shape
export interface FadingStepEntry {
	label: string;
	latex: string;
}

import type { ConceptKnowledge } from './student-model';

// ── Fading Levels ──

export type FadingLevel = 0 | 1 | 2 | 3 | 4;

export interface FadedSteps {
	shown: FadingStepEntry[];    // Steps shown to the student
	hidden: FadingStepEntry[];   // Steps the student must complete
	prompt: string;        // Instruction for the student (i18n key)
	level: FadingLevel;
}

/**
 * Select the appropriate fading level based on concept knowledge.
 *
 * Level 0: Full worked example (study only) — < 2 correct
 * Level 1: Complete last step — confidence < 0.4 or success rate < 0.6
 * Level 2: Complete last two steps — confidence < 0.6 or success rate < 0.7
 * Level 3: Apply & simplify — confidence < 0.8 or success rate < 0.8
 * Level 4: Independent practice — confident
 */
export function selectFadingLevel(concept: ConceptKnowledge): FadingLevel {
	const total = concept.timesCorrect + concept.timesIncorrect;

	// Brand new concept — full worked example
	if (total < 2) return 0;

	const successRate = total > 0 ? concept.timesCorrect / total : 0;

	if (concept.confidence < 0.4 || successRate < 0.6) return 1;
	if (concept.confidence < 0.6 || successRate < 0.7) return 2;
	if (concept.confidence < 0.8 || successRate < 0.8) return 3;
	return 4;
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
			// Show only identification steps (first ~40%)
			const split = Math.max(1, Math.ceil(steps.length * 0.4));
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
