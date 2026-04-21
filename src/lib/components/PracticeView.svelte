<script lang="ts">
	import type { I18nStrings, Lang } from '$lib/i18n';
	import type { Problem, TopicId, ProblemType } from '$lib/modules/derivative/types';
	import type { ProblemStatus } from '$lib/stores';
	import type { StudentModel } from '$lib/engine/student-model';
	import ProblemCard from './ProblemCard.svelte';
	import { typesetMath } from '$lib/utils/mathjax';

	interface Props {
		texts: I18nStrings;
		language: Lang;
		mode: 'focus' | 'mix';
		activeProblems: Problem[];
		problemBank: Problem[];
		progress: Record<number, ProblemStatus>;
		studentModel: StudentModel;
		activeTopic: TopicId;
		filters: { levels: number[]; types: ProblemType[] };
		onSetMode: (mode: 'focus' | 'mix') => void;
		onChangeTopic: (topic: TopicId) => void;
		onToggleFilter: (category: 'level' | 'type', value: number | string) => void;
		onDrawProblems: () => void;
		onStartMix: () => void;
		onRate: (id: number, status: ProblemStatus) => void;
	}

	let {
		texts,
		language,
		mode,
		activeProblems,
		problemBank,
		progress,
		studentModel,
		activeTopic,
		filters,
		onSetMode,
		onChangeTopic,
		onToggleFilter,
		onDrawProblems,
		onStartMix,
		onRate
	}: Props = $props();

	const topics: TopicId[] = ['chain', 'product', 'quotient'];
	const levels = [1, 2, 3, 4, 5];
	const types: ProblemType[] = ['poly', 'root', 'exp', 'log'];
	const typeLabels = $derived<Record<string, string>>({
		poly: texts.type_poly,
		root: texts.type_root,
		exp: texts.type_exp,
		log: texts.type_log
	});

	const filterCount = $derived(() => {
		return problemBank.filter(
			(p) =>
				p.topic === activeTopic &&
				filters.levels.includes(p.level) &&
				filters.types.includes(p.type)
		).length;
	});

	$effect(() => {
		// Re-typeset when problems change
		activeProblems;
		requestAnimationFrame(() => typesetMath());
	});
</script>

<div class="practice-view animate-fade-in">
	<div class="practice-header">
		<h1>{mode === 'mix' ? texts.mode_mix_title : texts.dash_focus_header}</h1>
		<div class="mode-toggle">
			<button
				class="btn btn-sm"
				class:btn-ghost={mode !== 'focus'}
				class:btn-primary={mode === 'focus'}
				onclick={() => onSetMode('focus')}
			>
				🎯 {texts.dash_focus_header}
			</button>
			<button
				class="btn btn-sm"
				class:btn-ghost={mode !== 'mix'}
				class:btn-primary={mode === 'mix'}
				onclick={() => onSetMode('mix')}
			>
				🧠 {texts.mode_mix_title}
			</button>
		</div>
	</div>

	<!-- Focus Filters -->
	{#if mode === 'focus'}
		<div class="filter-panel card">
			<!-- Rule selector -->
			<div class="filter-group">
				<span class="filter-label">{texts.filter_rule}</span>
				<div class="filter-options">
					{#each topics as topic}
						<button
							class="btn btn-sm"
							class:btn-primary={activeTopic === topic}
							class:btn-ghost={activeTopic !== topic}
							onclick={() => onChangeTopic(topic)}
						>
							{texts[`topic_${topic}` as keyof typeof texts]}
						</button>
					{/each}
				</div>
			</div>

			<!-- Level selector -->
			<div class="filter-group">
				<span class="filter-label">{texts.filter_levels}</span>
				<div class="filter-options">
					{#each levels as level}
						<button
							class="btn btn-sm"
							class:btn-primary={filters.levels.includes(level)}
							class:btn-ghost={!filters.levels.includes(level)}
							onclick={() => onToggleFilter('level', level)}
						>
							{level}
						</button>
					{/each}
				</div>
			</div>

			<!-- Type selector -->
			<div class="filter-group">
				<span class="filter-label">{texts.filter_types}</span>
				<div class="filter-options">
					{#each types as type}
						<button
							class="btn btn-sm"
							class:btn-primary={filters.types.includes(type)}
							class:btn-ghost={!filters.types.includes(type)}
							onclick={() => onToggleFilter('type', type)}
						>
							{typeLabels[type]}
						</button>
					{/each}
				</div>
			</div>

			<div class="filter-actions">
				<span class="filter-count">{filterCount()} {texts.label_problems_count}</span>
				<button class="btn btn-primary" onclick={onDrawProblems}>
					{texts.btn_draw_focus}
				</button>
			</div>
		</div>
	{/if}

	<!-- Problems List -->
	<div class="problems-list stagger">
		{#each activeProblems as problem (problem.id)}
			<div class="animate-slide-up">
				<ProblemCard
					{problem}
					status={progress[problem.id]}
					{mode}
					{texts}
					{onRate}
				/>
			</div>
		{/each}
	</div>

	<!-- Empty state -->
	{#if activeProblems.length === 0 && mode === 'focus'}
		<div class="empty-state">
			<span class="empty-icon">🎯</span>
			<p>Velg filtre og trykk «{texts.btn_draw_focus}»</p>
		</div>
	{/if}

	<!-- Footer action -->
	{#if activeProblems.length > 0}
		<div class="round-footer">
			<p>{mode === 'mix' ? texts.mix_end_text : texts.focus_end_text}</p>
			<button
				class="btn btn-primary btn-lg"
				onclick={mode === 'mix' ? onStartMix : onDrawProblems}
			>
				🔄 {mode === 'mix' ? texts.btn_new_mix : texts.btn_new_focus}
			</button>
		</div>
	{/if}
</div>

<style>
	.practice-view {
		max-width: 800px;
		margin: 0 auto;
		padding: var(--space-8) var(--space-4);
	}

	.practice-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-6);
		flex-wrap: wrap;
		gap: var(--space-4);
	}

	.practice-header h1 {
		margin: 0;
	}

	.mode-toggle {
		display: flex;
		gap: var(--space-2);
		background: var(--color-bg);
		padding: var(--space-1);
		border-radius: var(--radius-full);
	}

	/* Filter Panel */
	.filter-panel {
		margin-bottom: var(--space-6);
		padding: var(--space-6);
	}

	.filter-group {
		margin-bottom: var(--space-4);
	}

	.filter-label {
		display: block;
		font-size: var(--font-size-xs);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
		margin-bottom: var(--space-2);
	}

	.filter-options {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.filter-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: var(--space-4);
		padding-top: var(--space-4);
		border-top: 1px solid var(--color-border);
	}

	.filter-count {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		font-weight: 500;
	}

	/* Problems List */
	.problems-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	/* Empty state */
	.empty-state {
		text-align: center;
		padding: var(--space-16) 0;
		color: var(--color-text-muted);
	}

	.empty-icon {
		font-size: 3rem;
		display: block;
		margin-bottom: var(--space-4);
	}

	/* Round footer */
	.round-footer {
		text-align: center;
		padding: var(--space-8) 0;
		margin-top: var(--space-8);
		border-top: 1px solid var(--color-border);
	}

	.round-footer p {
		margin-bottom: var(--space-4);
	}
</style>
