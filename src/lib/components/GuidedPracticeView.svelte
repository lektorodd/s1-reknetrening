<script lang="ts">
	import type { I18nStrings, Lang } from '$lib/i18n';
	import type { Problem } from '$lib/modules/derivative/types';
	import type { ProblemStatus, TopicId } from '$lib/stores';
	import type { FadingLevel } from '$lib/engine/guidance-fading';
	import type { StudentModel } from '$lib/engine/student-model';
	import FadedProblemCard from './FadedProblemCard.svelte';

	interface Props {
		texts: I18nStrings;
		language: Lang;
		problemBank: Problem[];
		studentModel: StudentModel;
		progress: Record<number, ProblemStatus>;
		onRate: (id: number, status: ProblemStatus) => void;
		onNavigate?: (view: string) => void;
	}

	let { texts, language, problemBank, studentModel, progress, onRate, onNavigate }: Props = $props();

	let selectedTopic = $state<TopicId>('chain');
	let currentStep = $state(0);
	let pathIndex = $state(0);
	let showComplete = $state(false);

	// Fading levels for each step in the path
	const FADING_LEVELS: FadingLevel[] = [0, 1, 2, 3, 4];

	// Get all problems for selected topic, sorted by level
	const topicProblems = $derived.by(() => {
		return problemBank.filter(p => p.topic === selectedTopic)
			.sort((a, b) => a.level - b.level);
	});

	// Create a "fading path": 5 different problems, one per fading level
	// pathIndex rotates which set of 5 we use from the available pool
	const currentPath = $derived.by(() => {
		const all = topicProblems;
		if (all.length === 0) return [];
		const offset = (pathIndex * 5) % all.length;
		const path: { problem: Problem; level: FadingLevel }[] = [];
		for (let i = 0; i < FADING_LEVELS.length; i++) {
			const idx = (offset + i) % all.length;
			path.push({ problem: all[idx], level: FADING_LEVELS[i] });
		}
		return path;
	});

	const currentCard = $derived.by(() => {
		if (currentPath.length === 0) return null;
		return currentPath[currentStep];
	});

	const totalSteps = $derived(currentPath.length);

	function goToStep(step: number) {
		if (step >= 0 && step < totalSteps) {
			currentStep = step;
		}
	}

	function nextPath() {
		pathIndex++;
		currentStep = 0;
		showComplete = false;
	}

	function completePath() {
		showComplete = true;
	}

	function changeTopic(topic: TopicId) {
		selectedTopic = topic;
		currentStep = 0;
		pathIndex = 0;
		showComplete = false;
	}

	function cycleToNextTopic() {
		const topicIds: TopicId[] = ['chain', 'product', 'quotient'];
		const idx = topicIds.indexOf(selectedTopic);
		const next = topicIds[(idx + 1) % topicIds.length];
		changeTopic(next);
	}

	const topics: { id: TopicId; labelKey: 'topic_chain' | 'topic_product' | 'topic_quotient' }[] = [
		{ id: 'chain', labelKey: 'topic_chain' },
		{ id: 'product', labelKey: 'topic_product' },
		{ id: 'quotient', labelKey: 'topic_quotient' }
	];

	// Level labels for the dots
	const DOT_LABELS = ['📖', '✏️¹', '✏️²', '✏️³', '🎯'];
</script>

<section class="guided-view">
	<div class="guided-header">
		<h1 class="guided-title">{texts.nav_guided}</h1>
		<p class="guided-subtitle">{texts.dash_guided_desc}</p>
	</div>

	<!-- Topic Tabs -->
	<div class="topic-tabs">
		{#each topics as topic}
			<button
				class="topic-tab"
				class:active={selectedTopic === topic.id}
				onclick={() => changeTopic(topic.id)}
			>
				{texts[topic.labelKey]}
			</button>
		{/each}
	</div>

	{#if currentCard}
		<!-- Fading Level Dots -->
		<div class="fading-dots">
			{#each FADING_LEVELS as level, i}
				<button
					class="dot"
					class:active={currentStep === i}
					class:visited={i < currentStep}
					onclick={() => goToStep(i)}
					title="Level {level}"
				>
					<span class="dot-label">{DOT_LABELS[i]}</span>
				</button>
				{#if i < FADING_LEVELS.length - 1}
					<div class="dot-connector" class:active={i < currentStep}></div>
				{/if}
			{/each}
		</div>

		<div class="carousel-card">
			{#key `${currentCard.problem.id}-${currentCard.level}`}
				<FadedProblemCard
					problem={currentCard.problem}
					status={progress[currentCard.problem.id]}
					fadingLevel={currentCard.level}
					{texts}
					{language}
					{onRate}
				/>
			{/key}
		</div>

		<!-- Navigation -->
		<div class="carousel-nav">
			<button
				class="nav-btn"
				disabled={currentStep === 0}
				onclick={() => goToStep(currentStep - 1)}
			>
				{texts.guided_more_support}
			</button>

			<span class="step-counter">
				{currentStep + 1} {texts.guided_problem_of} {totalSteps}
			</span>

			{#if currentStep < totalSteps - 1}
				<button
					class="nav-btn nav-btn-primary"
					onclick={() => goToStep(currentStep + 1)}
				>
					{texts.guided_less_support}
				</button>
			{:else}
				<button
					class="nav-btn nav-btn-primary"
					onclick={completePath}
				>
					✓ {texts.guided_complete_title.replace(' 🎉', '')}
				</button>
			{/if}
		</div>

	{:else if showComplete}
		<!-- Completion Card -->
		<div class="completion-card animate-fade-in">
			<div class="completion-icon">🎉</div>
			<h2 class="completion-title">{texts.guided_complete_title}</h2>
			<p class="completion-desc">{texts.guided_complete_desc}</p>

			<div class="completion-actions">
				<button class="action-card" onclick={nextPath}>
					<span class="action-icon">🔄</span>
					<span class="action-label">{texts.guided_new_round.replace('🔄 ', '')}</span>
					<span class="action-hint">{texts[topics.find(t => t.id === selectedTopic)!.labelKey]}</span>
				</button>

				<button class="action-card" onclick={() => onNavigate?.('mix')}>
					<span class="action-icon">💪</span>
					<span class="action-label">{texts.guided_to_arena.replace('💪 ', '')}</span>
					<span class="action-hint">{texts.nav_practice}</span>
				</button>

				<button class="action-card" onclick={cycleToNextTopic}>
					<span class="action-icon">📚</span>
					<span class="action-label">{texts.guided_other_topic.replace('📚 ', '')}</span>
					<span class="action-hint">{(() => {
						const ids: TopicId[] = ['chain', 'product', 'quotient'];
						const next = ids[(ids.indexOf(selectedTopic) + 1) % ids.length];
						const key = topics.find(t => t.id === next)!.labelKey;
						return texts[key];
					})()}</span>
				</button>
			</div>
		</div>
	{:else}
		<div class="empty-state">
			<p>{texts.no_problems_found}</p>
		</div>
	{/if}
</section>

<style>
	.guided-view {
		max-width: 900px;
		margin: 0 auto;
		padding: var(--space-6) var(--space-4);
	}

	.guided-header {
		margin-bottom: var(--space-6);
	}

	.guided-title {
		font-size: var(--font-size-2xl);
		font-weight: 700;
		color: var(--color-text);
		margin-bottom: var(--space-2);
	}

	.guided-subtitle {
		font-size: var(--font-size-base);
		color: var(--color-text-secondary);
	}

	/* Topic Tabs */
	.topic-tabs {
		display: flex;
		gap: var(--space-2);
		margin-bottom: var(--space-6);
		background: var(--color-bg);
		padding: var(--space-1);
		border-radius: var(--radius-full);
		width: fit-content;
	}

	.topic-tab {
		padding: var(--space-2) var(--space-5);
		border: none;
		background: none;
		border-radius: var(--radius-full);
		font-family: var(--font-family);
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.topic-tab:hover { color: var(--color-primary); }

	.topic-tab.active {
		background: var(--color-primary);
		color: white;
		box-shadow: var(--shadow-sm);
	}

	/* Fading Level Dots */
	.fading-dots {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0;
		margin-bottom: var(--space-6);
	}

	.dot {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		border: 2px solid var(--color-border);
		background: var(--color-surface);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all var(--transition-fast);
		position: relative;
	}

	.dot:hover {
		border-color: var(--color-primary);
		transform: scale(1.1);
	}

	.dot.active {
		border-color: var(--color-primary);
		background: var(--color-primary);
		box-shadow: 0 0 0 4px rgba(63, 81, 181, 0.15);
	}

	.dot.active .dot-label {
		filter: brightness(10);
	}

	.dot.visited {
		border-color: var(--color-success);
		background: rgba(16, 185, 129, 0.1);
	}

	.dot-label {
		font-size: 0.75rem;
		line-height: 1;
	}

	.dot-connector {
		width: 32px;
		height: 2px;
		background: var(--color-border);
		transition: background var(--transition-fast);
	}

	.dot-connector.active {
		background: var(--color-success);
	}

	/* Carousel Card */
	.carousel-card {
		margin-bottom: var(--space-4);
	}

	/* Navigation */
	.carousel-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		padding: var(--space-3) 0;
	}

	.nav-btn {
		padding: var(--space-2) var(--space-5);
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		border-radius: var(--radius-full);
		font-family: var(--font-family);
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.nav-btn:hover:not(:disabled) {
		border-color: var(--color-primary);
		color: var(--color-primary);
	}

	.nav-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.nav-btn-primary {
		background: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
	}

	.nav-btn-primary:hover:not(:disabled) {
		background: var(--color-primary-dark, #303F9F);
		color: white;
	}

	.step-counter {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		font-weight: 500;
	}

	.empty-state {
		text-align: center;
		padding: var(--space-8);
		color: var(--color-text-muted);
	}

	/* Completion Card */
	.completion-card {
		text-align: center;
		padding: var(--space-8) var(--space-6);
		background: var(--color-surface);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
		box-shadow: var(--shadow-md);
	}

	.completion-icon {
		font-size: 3rem;
		margin-bottom: var(--space-4);
	}

	.completion-title {
		font-size: var(--font-size-xl);
		font-weight: 700;
		color: var(--color-text);
		margin-bottom: var(--space-2);
	}

	.completion-desc {
		font-size: var(--font-size-base);
		color: var(--color-text-secondary);
		margin-bottom: var(--space-6);
	}

	.completion-actions {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-4);
	}

	.action-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-5) var(--space-4);
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		cursor: pointer;
		transition: all var(--transition-fast);
		font-family: var(--font-family);
	}

	.action-card:hover {
		border-color: var(--color-primary);
		background: rgba(63, 81, 181, 0.04);
		transform: translateY(-2px);
		box-shadow: var(--shadow-sm);
	}

	.action-icon {
		font-size: 1.8rem;
	}

	.action-label {
		font-size: var(--font-size-sm);
		font-weight: 700;
		color: var(--color-text);
	}

	.action-hint {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
	}
</style>
