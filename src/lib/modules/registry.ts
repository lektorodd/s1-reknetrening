// Module registry — lists available topic modules and their metadata
// Each module registers itself here so the app can discover it

import type { Lang } from '$lib/i18n';

// ── Types ──

export interface TopicModuleMeta {
	id: string;              // 'derivative' | 'logarithm' | ...
	icon: string;            // '∂' | 'log' | ...
	color: string;           // accent color for module cards
	route: string;           // '/derivasjon' | '/logaritmer' | ...
	conceptIds: string[];    // all concept IDs this module uses
	name: Record<Lang, string>;
	description: Record<Lang, string>;
}

// ── Derivative Module ──

const derivativeModule: TopicModuleMeta = {
	id: 'derivative',
	icon: '∂',
	color: '#3F51B5',  // Indigo (matches current design)
	route: '/derivasjon',
	conceptIds: [
		'chain_poly', 'chain_root', 'chain_exp', 'chain_log',
		'product_poly', 'product_root', 'product_exp', 'product_log',
		'quotient_poly', 'quotient_root', 'quotient_exp', 'quotient_log'
	],
	name: {
		nn: 'Derivasjon',
		en: 'Derivatives',
		es: 'Derivadas'
	},
	description: {
		nn: 'Kjerne-, produkt- og brøkregelen med ulike funksjonstypar.',
		en: 'Chain, product and quotient rules with various function types.',
		es: 'Reglas de cadena, producto y cociente con varios tipos de funciones.'
	}
};

// ── Logarithm Module ──

const logarithmModule: TopicModuleMeta = {
	id: 'logarithm',
	icon: 'log',
	color: '#0D9488',  // Teal
	route: '/logaritmer',
	conceptIds: [
		'log_product', 'log_quotient', 'log_power',
		'log_simplify', 'log_equation', 'exp_equation'
	],
	name: {
		nn: 'Logaritmar',
		en: 'Logarithms',
		es: 'Logaritmos'
	},
	description: {
		nn: 'Dei tre setningane, forenkling, og log-/eksponentiallikningar.',
		en: 'The three laws, simplification, and log/exponential equations.',
		es: 'Las tres leyes, simplificación, y ecuaciones logarítmicas/exponenciales.'
	}
};

// ── Registry ──

export const MODULE_REGISTRY: TopicModuleMeta[] = [
	derivativeModule,
	logarithmModule
];

/** Get a module by ID */
export function getModule(id: string): TopicModuleMeta | undefined {
	return MODULE_REGISTRY.find(m => m.id === id);
}

/** Get all concept IDs across all modules */
export function getAllConceptIds(): string[] {
	return MODULE_REGISTRY.flatMap(m => m.conceptIds);
}

/** Get concept IDs for a specific module */
export function getModuleConceptIds(moduleId: string): string[] {
	return getModule(moduleId)?.conceptIds ?? [];
}
