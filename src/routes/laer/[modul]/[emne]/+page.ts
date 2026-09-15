import { error } from '@sveltejs/kit';
import { MODULE_REGISTRY, getFullBank, getModuleBySlug } from '$lib/modules/registry';
import { buildLadder } from '$lib/engine/ladder';

/** Levels to draw a fully worked example from, easiest first. */
const EXAMPLE_LEVELS = [1, 3, 5];

export const prerender = true;

/** Enumerate every topic page so adapter-static renders them all. */
export function entries() {
	return MODULE_REGISTRY.flatMap((mod) =>
		mod.topics.map((topic) => ({ modul: mod.slug, emne: topic.id }))
	);
}

export function load({ params }) {
	const mod = getModuleBySlug(params.modul);
	if (!mod) error(404, 'Ukjend emne');

	const entry = mod.theory[params.emne];
	if (!entry) error(404, 'Ukjend emne');

	const index = mod.topics.findIndex((t) => t.id === params.emne);

	// Fully worked generated problems. These are instruction, not practice, so
	// they live here rather than in a session — a student who wants another
	// example of the same shape can read as many as they like without it
	// counting against anything.
	const bank = getFullBank();
	const examples = EXAMPLE_LEVELS.map((level) =>
		bank.find((p) => p.moduleId === mod.id && p.topic === params.emne && p.level === level)
	).filter((p) => p !== undefined);

	// The fading ladder: progressively less-solved problems the student walks
	// through themselves. This is instruction, which is why it lives here and
	// not in a session.
	const ladder = buildLadder(mod.id, params.emne, bank);

	return {
		entry,
		examples,
		ladder,
		prompts: mod.selfExplanations[params.emne] ?? [],
		moduleName: mod.name,
		moduleSlug: mod.slug,
		moduleColor: mod.color,
		prev: index > 0 ? mod.topics[index - 1] : null,
		next: index >= 0 && index < mod.topics.length - 1 ? mod.topics[index + 1] : null
	};
}
