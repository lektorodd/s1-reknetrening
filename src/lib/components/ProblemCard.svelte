<script lang="ts">
	import type { Problem } from '$lib/modules/derivative/types';
	import type { I18nStrings } from '$lib/i18n';
	import type { ProblemStatus } from '$lib/stores';
	import { typesetElement } from '$lib/utils/mathjax';

	interface Props {
		problem: Problem;
		status?: ProblemStatus;
		mode: 'focus' | 'mix';
		texts: I18nStrings;
		onRate: (id: number, status: ProblemStatus) => void;
	}

	let { problem, status, mode, texts, onRate }: Props = $props();

	let showHint = $state(false);
	let showSolution = $state(false);
	let cardEl: HTMLElement | undefined = $state(undefined);

	// Re-typeset when hint/solution become visible
	$effect(() => {
		if ((showHint || showSolution) && cardEl) {
			// Small delay to let DOM update
			requestAnimationFrame(() => {
				if (cardEl) typesetElement(cardEl);
			});
		}
	});

	// Typeset on mount
	$effect(() => {
		if (cardEl) {
			requestAnimationFrame(() => {
				if (cardEl) typesetElement(cardEl);
			});
		}
	});

	const typeLabel = $derived(() => {
		switch (problem.type) {
			case 'poly': return texts.type_poly;
			case 'root': return texts.type_root;
			case 'exp': return texts.type_exp;
			case 'log': return texts.type_log;
		}
	});

	const borderClass = $derived(() => {
		if (status === 'mastered') return 'border-success';
		if (status === 'practice') return 'border-warning';
		return '';
	});
</script>

<div class="problem-card {borderClass()}" bind:this={cardEl}>
	<!-- Header badges -->
	<div class="card-top">
		<div class="badges">
			{#if mode === 'mix'}
				<span class="badge badge-primary">{texts.label_mix}</span>
			{:else}
				<span class="badge badge-primary">{texts.label_level} {problem.level}</span>
				<span class="badge badge-primary" style="background-color: var(--color-primary-100); color: var(--color-primary-dark);">{typeLabel()}</span>
			{/if}
		</div>
		{#if status === 'mastered'}
			<span class="status-icon status-success">✓</span>
		{/if}
	</div>

	<!-- Question -->
	<div class="question">$${problem.q}$$</div>

	<!-- Action buttons -->
	<div class="actions">
		<button
			class="btn btn-secondary btn-sm"
			onclick={() => (showHint = !showHint)}
		>
			💡 {showHint ? texts.btn_hide_hint : texts.btn_hint}
		</button>
		<button
			class="btn btn-primary btn-sm"
			onclick={() => (showSolution = !showSolution)}
		>
			{showSolution ? texts.btn_hide : texts.btn_solution}
		</button>
	</div>

	<!-- Hint -->
	{#if showHint}
		<div class="hint-box animate-fade-in">
			<div class="hint-label">{texts.hint_title}</div>
			<p>{problem.hint}</p>
		</div>
	{/if}

	<!-- Solution -->
	{#if showSolution}
		<div class="solution-box animate-fade-in">
			<div class="answer">{problem.a}</div>
			<div class="steps">{problem.steps}</div>
			<div class="rating-buttons">
				<button
					class="btn btn-sm rate-practice"
					onclick={() => onRate(problem.id, 'practice')}
				>
					{texts.btn_practice}
				</button>
				<button
					class="btn btn-sm rate-mastered"
					onclick={() => onRate(problem.id, 'mastered')}
				>
					{texts.btn_mastered}
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.problem-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		box-shadow: var(--shadow-sm);
		transition: all var(--transition-base);
	}

	.problem-card.border-success {
		border-left: 4px solid var(--color-success);
	}

	.problem-card.border-warning {
		border-left: 4px solid var(--color-warning);
	}

	.card-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-4);
	}

	.badges {
		display: flex;
		gap: var(--space-2);
	}

	.status-icon {
		font-size: var(--font-size-lg);
		font-weight: 700;
	}

	.status-success {
		color: var(--color-success);
	}

	.question {
		text-align: center;
		font-size: var(--font-size-xl);
		padding: var(--space-4) 0 var(--space-6);
	}

	.actions {
		display: flex;
		justify-content: center;
		gap: var(--space-3);
	}

	/* Hint */
	.hint-box {
		margin-top: var(--space-4);
		background: var(--color-warning-light);
		border: 1px solid #FDE68A;
		border-radius: var(--radius-md);
		padding: var(--space-3) var(--space-4);
	}

	.hint-label {
		font-size: var(--font-size-xs);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #92400E;
		margin-bottom: var(--space-1);
	}

	.hint-box p {
		font-size: var(--font-size-sm);
		color: #78350F;
		margin: 0;
	}

	/* Solution */
	.solution-box {
		margin-top: var(--space-6);
		padding-top: var(--space-6);
		border-top: 1px solid var(--color-border);
	}

	.answer {
		text-align: center;
		font-size: var(--font-size-lg);
		font-weight: 600;
		margin-bottom: var(--space-2);
	}

	.steps {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		text-align: center;
		margin-bottom: var(--space-4);
	}

	.rating-buttons {
		display: flex;
		justify-content: center;
		gap: var(--space-3);
	}

	.rate-practice {
		background: var(--color-warning-light);
		color: #92400E;
		border: 1px solid #FDE68A;
	}

	.rate-practice:hover {
		background: #FDE68A;
	}

	.rate-mastered {
		background: var(--color-success-light);
		color: #065F46;
		border: 1px solid #A7F3D0;
	}

	.rate-mastered:hover {
		background: #A7F3D0;
	}
</style>
