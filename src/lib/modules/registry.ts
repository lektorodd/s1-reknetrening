// Module registry — the single place the rest of the app learns about topics.
//
// Everything downstream (the session builder, the selector, the Lærebok, the
// progress page) reads modules through here. Adding a topic is: write a folder
// that exports a TopicModule, then add it to MODULE_REGISTRY.

import type { Problem, TopicModule } from './types';
import { derivativeModule } from './derivative';
import { logarithmModule } from './logarithm';

export type { Problem, TopicModule, TopicMeta, StepEntry, TheoryEntry, SelfExplanation, WorkedStep } from './types';

export const MODULE_REGISTRY: TopicModule[] = [derivativeModule, logarithmModule];

export function getModule(id: string): TopicModule | undefined {
	return MODULE_REGISTRY.find((m) => m.id === id);
}

export function getModuleBySlug(slug: string): TopicModule | undefined {
	return MODULE_REGISTRY.find((m) => m.slug === slug);
}

// ── Bank ──

let bankCache: Problem[] | null = null;

/** Every problem from every module. Built once; ids are deterministic. */
export function getFullBank(): Problem[] {
	if (!bankCache) bankCache = MODULE_REGISTRY.flatMap((m) => m.generateBank());
	return bankCache;
}

export function getProblemById(id: string): Problem | undefined {
	return getFullBank().find((p) => p.id === id);
}

// ── Concepts ──

let conceptCache: Map<string, string> | null = null;

/**
 * Concept id -> module id, derived from what the generators actually produce.
 *
 * Deriving rather than declaring is deliberate: the old hand-written list
 * claimed 12 derivative concepts while the generator could only produce 5, so
 * 7 concepts sat in every student model forever at confidence 0.5.
 */
function conceptMap(): Map<string, string> {
	if (!conceptCache) {
		conceptCache = new Map();
		for (const mod of MODULE_REGISTRY) {
			for (const p of mod.generateBank()) {
				conceptCache.set(mod.conceptIdOf(p), mod.id);
			}
		}
	}
	return conceptCache;
}

export function getAllConceptIds(): string[] {
	return [...conceptMap().keys()];
}

export function getModuleConceptIds(moduleId: string): string[] {
	return [...conceptMap().entries()].filter(([, m]) => m === moduleId).map(([c]) => c);
}

export function getModuleForConcept(conceptId: string): TopicModule | undefined {
	const moduleId = conceptMap().get(conceptId);
	return moduleId ? getModule(moduleId) : undefined;
}

/** Display name for a concept, resolved through its owning module. */
export function conceptName(conceptId: string): string {
	return getModuleForConcept(conceptId)?.conceptName(conceptId) ?? conceptId;
}

/** Which module a problem belongs to, and the concept it trains. */
export function conceptIdOf(problem: Problem): string {
	const mod = getModule(problem.moduleId);
	return mod ? mod.conceptIdOf(problem) : problem.topic;
}
