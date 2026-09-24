import { error } from '@sveltejs/kit';
import { MODULE_REGISTRY, getFullBank, getModuleBySlug } from '$lib/modules/registry';
import { buildLadder } from '$lib/engine/ladder';

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
	const bank = getFullBank();

	// One ladder per difficulty the topic offers. The student picks a difficulty
	// and then walks the support rungs, so both axes are theirs to choose —
	// which is what a separate row of fixed worked examples used to cover, less
	// usefully, by showing three of them side by side.
	const levels = [
		...new Set(
			bank.filter((p) => p.moduleId === mod.id && p.topic === params.emne).map((p) => p.level)
		)
	].sort((a, b) => a - b);

	const ladders = levels
		.map((level) => ({ level, rungs: buildLadder(mod.id, params.emne, bank, level) }))
		.filter((l) => l.rungs.length > 0);

	return {
		entry,
		ladders,
		prompts: mod.selfExplanations[params.emne] ?? [],
		moduleId: mod.id,
		topicId: params.emne,
		moduleName: mod.name,
		moduleSlug: mod.slug,
		moduleColor: mod.color,
		prev: index > 0 ? mod.topics[index - 1] : null,
		next: index >= 0 && index < mod.topics.length - 1 ? mod.topics[index + 1] : null
	};
}
