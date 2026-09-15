import { error } from '@sveltejs/kit';
import { MODULE_REGISTRY, getModuleBySlug } from '$lib/modules/registry';

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

	return {
		entry,
		moduleName: mod.name,
		moduleSlug: mod.slug,
		moduleColor: mod.color,
		prev: index > 0 ? mod.topics[index - 1] : null,
		next: index >= 0 && index < mod.topics.length - 1 ? mod.topics[index + 1] : null
	};
}
