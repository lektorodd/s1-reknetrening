// Module registry — the single place the rest of the app learns about topics.
//
// Everything downstream (the session builder, the selector, the Lærebok, the
// progress page) reads modules through here. Adding a topic is: write a folder
// that exports a TopicModule, then add it to MODULE_REGISTRY.

import type { Course, Problem, TopicModule } from './types';
import { derivativeModule } from './derivative';
import { logarithmModule } from './logarithm';
import { integralModule } from './integral';

export type { Course, Problem, TopicModule, TopicMeta, StepEntry, TheoryEntry, SelfExplanation, WorkedStep } from './types';

export const MODULE_REGISTRY: TopicModule[] = [derivativeModule, logarithmModule, integralModule];

/** Courses the app covers, in the order a student meets them. */
export const COURSES: Course[] = ['S1', 'S2'];

export function getModule(id: string): TopicModule | undefined {
	return MODULE_REGISTRY.find((m) => m.id === id);
}

/**
 * The modules belonging to one course.
 *
 * Derived from the registry rather than declared, for the same reason concept
 * ids are: a second list is a list that goes out of date.
 */
export function modulesForCourse(course: Course): TopicModule[] {
	return MODULE_REGISTRY.filter((m) => m.course === course);
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

/** Every concept belonging to one course, for per-course counts. */
export function conceptIdsForCourse(course: Course): string[] {
	return modulesForCourse(course).flatMap((m) => getModuleConceptIds(m.id));
}

let topicCache: Map<string, string> | null = null;

/**
 * The topic a concept belongs to, for linking a concept to its Lærebok page and
 * to practice. Derived from the bank like every other concept fact.
 */
export function conceptTopic(conceptId: string): string | undefined {
	if (!topicCache) {
		topicCache = new Map();
		for (const p of getFullBank()) {
			const id = conceptIdOf(p);
			if (!topicCache.has(id)) topicCache.set(id, p.topic);
		}
	}
	return topicCache.get(conceptId);
}

let topLevelCache: Map<string, number> | null = null;

/** The highest difficulty the bank holds for a concept (5 if unknown). */
export function conceptTopLevel(conceptId: string): number {
	if (!topLevelCache) {
		topLevelCache = new Map();
		for (const p of getFullBank()) {
			const id = conceptIdOf(p);
			topLevelCache.set(id, Math.max(topLevelCache.get(id) ?? 0, p.level));
		}
	}
	return topLevelCache.get(conceptId) ?? 5;
}

/** Display name for a concept, resolved through its owning module. */
export function conceptName(conceptId: string): string {
	return getModuleForConcept(conceptId)?.conceptName(conceptId) ?? conceptId;
}

/** What the student is asked to do with a problem: its own instruction, or its topic's. */
export function instructionFor(problem: Problem): string {
	if (problem.instruction) return problem.instruction;
	return getModule(problem.moduleId)?.topics.find((t) => t.id === problem.topic)?.instruction ?? '';
}

/** Which module a problem belongs to, and the concept it trains. */
export function conceptIdOf(problem: Problem): string {
	const mod = getModule(problem.moduleId);
	return mod ? mod.conceptIdOf(problem) : problem.topic;
}
