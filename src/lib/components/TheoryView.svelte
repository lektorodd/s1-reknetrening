<script lang="ts">
	import type { I18nStrings, Lang } from '$lib/i18n';
	import { theoryBank } from '$lib/modules/derivative/theory';
	import type { TopicId } from '$lib/modules/derivative/types';
	import { typesetMath } from '$lib/utils/mathjax';

	interface Props {
		texts: I18nStrings;
		language: Lang;
	}

	let { texts, language }: Props = $props();

	const topics: TopicId[] = ['chain', 'product', 'quotient'];
	let selectedTopic = $state<TopicId>('chain');

	const currentTheory = $derived(theoryBank[selectedTopic]);

	// Helper to get localized text with fallback
	function t(record: Record<string, string>): string {
		return record[language] ?? record.nn;
	}

	// Split text on both real newlines and literal \n
	function lines(record: Record<string, string>): string[] {
		return t(record).replace(/\\n/g, '\n').split('\n').filter(l => l.trim());
	}
	$effect(() => {
		// Re-typeset when topic or language changes
		selectedTopic;
		language;
		requestAnimationFrame(() => typesetMath());
	});
</script>

<div class="theory-view animate-fade-in">
	<h1>{texts.nav_theory}</h1>

	<!-- Topic Selector -->
	<div class="topic-tabs">
		{#each topics as topic}
			<button
				class="btn"
				class:btn-primary={selectedTopic === topic}
				class:btn-ghost={selectedTopic !== topic}
				onclick={() => (selectedTopic = topic)}
			>
				{theoryBank[topic].title[language] ?? theoryBank[topic].title.nn}
			</button>
		{/each}
	</div>

	{#key selectedTopic}
	<div class="theory-content animate-fade-in">

		<!-- 1. Title + Intro -->
		<div class="card theory-card">
			<h2>{t(currentTheory.title)}</h2>
			<div class="theory-intro">
				{#each lines(currentTheory.intro) as line}
					<p>{line}</p>
				{/each}
			</div>
		</div>

		<!-- 2. Pattern Recognition (concrete — what does it look like?) -->
		<div class="card section-card pattern-card">
			<h3 class="section-title">{texts.theory_pattern}</h3>
			<div class="pattern-content">
				{#each lines(currentTheory.patternRecognition) as line}
					<p class="pattern-line">{line}</p>
				{/each}
			</div>
		</div>

		<!-- 3. Think Aloud — Expert Modeling (concrete example first!) -->
		<div class="card section-card think-aloud-card">
			<h3 class="section-title">{texts.theory_think_aloud}</h3>
			<div class="speech-bubble">
				{#each lines(currentTheory.thinkAloud) as line}
					<p class="speech-line">{line}</p>
				{/each}
			</div>
		</div>

		<!-- 4. Formula (abstract — AFTER seeing concrete examples) -->
		<div class="card theory-card">
			<div class="formula-section">
				<h3>{texts.theory_formula}</h3>
				<div class="formula-display">{currentTheory.formula}</div>
			</div>

			<div class="rule-section">
				<span class="badge badge-primary">{t(currentTheory.ruleText)}</span>
			</div>
		</div>

		<!-- 5. Worked Example with Explanations -->
		<div class="card section-card worked-card">
			<h3 class="section-title">{texts.theory_worked_example}</h3>
			<div class="worked-steps">
				{#each currentTheory.workedSteps as step, i}
					<div class="worked-step">
						<div class="step-number">{i + 1}</div>
						<div class="step-content">
							<p class="step-explanation">{t(step.explanation)}</p>
							<div class="step-math">$${step.latex}$$</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- 6. Mnemonic -->
		<div class="card section-card mnemonic-card">
			<h3 class="section-title">{texts.theory_mnemonic}</h3>
			<blockquote class="mnemonic-text">
				{t(currentTheory.mnemonic)}
			</blockquote>
		</div>

	</div>
	{/key}
</div>

<style>
	.theory-view {
		max-width: 800px;
		margin: 0 auto;
		padding: var(--space-8) var(--space-4);
	}

	.theory-view h1 {
		margin-bottom: var(--space-6);
	}

	.topic-tabs {
		display: flex;
		gap: var(--space-2);
		margin-bottom: var(--space-6);
		flex-wrap: wrap;
	}

	.theory-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	/* Theory Card */
	.theory-card {
		padding: var(--space-8);
	}

	.theory-card h2 {
		font-size: var(--font-size-2xl);
		margin-bottom: var(--space-2);
	}

	.theory-intro {
		margin-bottom: var(--space-6);
		color: var(--color-text-secondary);
	}

	.formula-section {
		margin-bottom: var(--space-4);
	}

	.formula-section h3 {
		font-size: var(--font-size-sm);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
		margin-bottom: var(--space-3);
	}

	.formula-display {
		text-align: center;
		font-size: var(--font-size-xl);
		padding: var(--space-6);
		background: var(--color-bg);
		border-radius: var(--radius-md);
	}

	.rule-section {
		margin-bottom: var(--space-2);
	}

	/* Section Cards */
	.section-card {
		padding: var(--space-6);
	}

	.section-title {
		font-size: var(--font-size-lg);
		font-weight: 700;
		margin-bottom: var(--space-4);
		color: var(--color-text);
	}

	/* Pattern Recognition */
	.pattern-card {
		border-left: 4px solid var(--color-warning, #f59e0b);
		background: rgba(245, 158, 11, 0.04);
	}

	.pattern-line {
		margin-bottom: var(--space-1);
		line-height: 1.6;
		color: var(--color-text);
	}

	/* Think Aloud */
	.think-aloud-card {
		border-left: 4px solid var(--color-primary);
		background: rgba(63, 81, 181, 0.04);
	}

	.speech-bubble {
		position: relative;
		padding: var(--space-5);
		background: var(--color-surface);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
		font-style: italic;
	}

	.speech-line {
		margin-bottom: var(--space-2);
		line-height: 1.7;
		color: var(--color-text);
	}

	/* Worked Steps */
	.worked-card {
		border-left: 4px solid var(--color-success, #10b981);
		background: rgba(16, 185, 129, 0.04);
	}

	.worked-steps {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.worked-step {
		display: flex;
		gap: var(--space-4);
		align-items: flex-start;
	}

	.step-number {
		flex-shrink: 0;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-success, #10b981);
		color: white;
		border-radius: 50%;
		font-weight: 700;
		font-size: var(--font-size-sm);
	}

	.step-content {
		flex: 1;
	}

	.step-explanation {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		margin-bottom: var(--space-2);
		line-height: 1.5;
	}

	.step-math {
		padding: var(--space-3);
		background: var(--color-surface);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
	}

	/* Mnemonic */
	.mnemonic-card {
		border-left: 4px solid var(--color-info, #3b82f6);
		background: rgba(59, 130, 246, 0.04);
	}

	.mnemonic-text {
		font-size: var(--font-size-lg);
		font-weight: 600;
		font-style: italic;
		color: var(--color-primary);
		line-height: 1.6;
		margin: 0;
		padding: var(--space-4);
		border-left: none;
	}
</style>
