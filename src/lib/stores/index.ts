// Application state management using Svelte 5 runes
// Global state for navigation, language, and practice mode

import type { Lang } from '$lib/i18n';
import type { Problem } from '$lib/modules/derivative/types';
import * as storage from '$lib/utils/storage';

// ── Types ──

export type ViewId = 'dashboard' | 'theory' | 'guided' | 'practice' | 'stats' | 'help';
export type PracticeMode = 'focus' | 'mix';
export type TopicId = 'chain' | 'product' | 'quotient';
export type ProblemType = 'poly' | 'root' | 'exp' | 'log';
export type ProblemStatus = 'mastered' | 'practice';

export interface AppState {
	currentView: ViewId;
	language: Lang;
	activeTopic: TopicId;
	mode: PracticeMode;
	progress: Record<number, ProblemStatus>;
	hints: number[];
	activeProblems: Problem[];
	filters: {
		levels: number[];
		types: ProblemType[];
	};
}

// ── Default State ──

function createDefaultState(): AppState {
	return {
		currentView: 'dashboard',
		language: storage.load<Lang>('language', 'nn'),
		activeTopic: 'chain',
		mode: 'focus',
		progress: storage.load<Record<number, ProblemStatus>>('progress', {}),
		hints: storage.load<number[]>('hints', []),
		activeProblems: [],
		filters: {
			levels: [1, 2, 3, 4, 5],
			types: ['poly', 'root', 'exp', 'log']
		}
	};
}

// ── Reactive State (Svelte 5 runes – must be used in .svelte files) ──
// We export factory functions that create reactive state

export function createAppState() {
	const state = $state<AppState>(createDefaultState());
	return state;
}

// ── Persistence Helpers ──

export function saveProgress(progress: Record<number, ProblemStatus>): void {
	storage.save('progress', progress);
}

export function saveHints(hints: number[]): void {
	storage.save('hints', hints);
}

export function saveLanguage(lang: Lang): void {
	storage.save('language', lang);
}
