// Shared UI text. Nynorsk only — the en/es tables were removed in v0.6 along
// with the language picker, so content records hold plain strings now.

/**
 * Instruction for one rung of the Lærebok ladder, keyed by what fadeSteps()
 * returns. Only the ladder fades; a training session never does.
 */
export const RUNG_PROMPTS: Record<string, string> = {
	fading_study: 'Studer dette dømet. Sjå korleis kvart steg følgjer av det førre.',
	fading_last_step: 'Same type oppgåve. Fullfør det siste steget sjølv.',
	fading_last_two: 'Ny oppgåve. Fullfør dei to siste stega sjølv.',
	fading_apply: 'Du får berre starten. Gjer resten sjølv.',
	fading_independent: 'Ingen hjelp. Løys heile oppgåva.'
};

/** Name of a rung, for the progress dots and the heading. */
export const RUNG_LABELS: Record<number, string> = {
	0: 'Gjennomgått døme',
	1: 'Fullfør siste steg',
	2: 'Fullfør dei to siste',
	3: 'Berre starten',
	4: 'På eiga hand'
};

export function rungPrompt(key: string): string {
	return RUNG_PROMPTS[key] ?? RUNG_PROMPTS.fading_independent;
}

export function rungLabel(rung: number): string {
	return RUNG_LABELS[rung] ?? RUNG_LABELS[4];
}

/** Level 1-5 as words, for the topic filter and the progress view. */
export const LEVEL_NAMES: Record<number, string> = {
	1: 'Grunnleggjande',
	2: 'Enkel',
	3: 'Middels',
	4: 'Krevjande',
	5: 'Utfordring'
};

export function levelName(level: number): string {
	return LEVEL_NAMES[level] ?? '';
}
