// Shared UI text. Nynorsk only — the en/es tables were removed in v0.6 along
// with the language picker, so content records hold plain strings now.

/** Instruction shown above a card, keyed by the fading prompt the engine returns. */
export const FADING_PROMPTS: Record<string, string> = {
	fading_study: 'Studer dette dømet. Sjå korleis kvart steg følgjer av det førre.',
	fading_last_step: 'Fullfør det siste steget sjølv.',
	fading_last_two: 'Fullfør dei to siste stega sjølv.',
	fading_apply: 'Du har identifikasjonen. Gjer resten sjølv.',
	fading_independent: 'Løys heile oppgåva sjølv.'
};

/**
 * Short badge naming how much of the solution a card still shows.
 *
 * Level 0 is study-only and never appears in a session — it is what the Lærebok
 * shows. Practice starts at level 1.
 */
export const FADING_BADGES: Record<number, string> = {
	0: 'Gjennomgått døme',
	1: 'Fullfør siste steg',
	2: 'Fullfør dei to siste',
	3: 'Din tur',
	4: 'På eiga hand'
};

export function fadingPrompt(key: string): string {
	return FADING_PROMPTS[key] ?? FADING_PROMPTS.fading_independent;
}

export function fadingBadge(level: number): string {
	return FADING_BADGES[level] ?? FADING_BADGES[4];
}

/** Level 1-5 as words, for the "Vel sjølv" page and the progress view. */
export const LEVEL_NAMES: Record<number, string> = {
	1: 'Grunnleggjande',
	2: 'Enkel',
	3: 'Middels',
	4: 'Krevjande',
	5: 'Utfordring'
};
