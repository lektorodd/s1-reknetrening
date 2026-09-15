<script lang="ts">
	import type { SessionCard } from '$lib/engine/session';
	import { getModule } from '$lib/modules/registry';
	import { typesetElement } from '$lib/utils/mathjax';
	import { base } from '$app/paths';

	interface Props {
		card: SessionCard;
		index: number;
		total: number;
		onAnswer: (correct: boolean, hintUsed: boolean) => void;
	}

	let { card, index, total, onAnswer }: Props = $props();

	let revealed = $state(false);
	let hintShown = $state(false);
	let container = $state<HTMLElement | null>(null);

	const mod = $derived(getModule(card.problem.moduleId));
	const topicName = $derived(
		mod?.topics.find((t) => t.id === card.problem.topic)?.name ?? card.problem.topic
	);
	const theoryHref = $derived(mod ? `${base}/laer/${mod.slug}/${card.problem.topic}/` : null);
	/** The card's left edge carries the module's colour. */
	const accent = $derived(mod?.color ?? 'var(--color-primary)');

	// Re-typeset whenever the card or what it shows changes.
	$effect(() => {
		void card.problem.id;
		void revealed;
		void hintShown;
		if (container) typesetElement(container);
	});

	// A new card resets everything.
	$effect(() => {
		void card.problem.id;
		revealed = false;
		hintShown = false;
	});

	function rate(correct: boolean) {
		onAnswer(correct, hintShown);
	}
</script>

<article class="card session-card" style="--accent: {accent}" bind:this={container}>
	<header>
		<span class="badge">{topicName} · Nivå {card.problem.level}</span>
		{#if card.isNewConcept}
			<span class="badge new">Nytt emne</span>
		{/if}
		<span class="counter">{index + 1} av {total}</span>
	</header>

	<div class="question">{`\\[${card.problem.q}\\]`}</div>

	{#if hintShown}
		<p class="hint">💡 {card.problem.hint}</p>
	{/if}

	{#if revealed}
		<ol class="steps">
			{#each card.problem.structuredSteps as step, i (i)}
				<li>
					<span class="step-label">{step.label}</span>
					<span class="step-math">{`\\(${step.latex}\\)`}</span>
				</li>
			{/each}
		</ol>
	{/if}

	<div class="actions">
		{#if !revealed}
			{#if !hintShown}
				<button class="btn btn-ghost" onclick={() => (hintShown = true)}>💡 Hint</button>
			{/if}
			<button class="btn btn-primary" onclick={() => (revealed = true)}>Vis løysing</button>
		{:else}
			<button class="btn btn-secondary" onclick={() => rate(false)}>Trong øving</button>
			<button class="btn btn-primary" onclick={() => rate(true)}>Fekk det til</button>
		{/if}
	</div>

	{#if theoryHref}
		<p class="to-theory">
			Står du fast?
			<a href={theoryHref} target="_blank" rel="noopener">Les om {topicName} i Lærebok →</a>
		</p>
	{/if}
</article>

<style>
	.session-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.badge {
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		background: var(--color-primary-50);
		color: var(--color-primary-dark);
		font-size: var(--font-size-xs);
		font-weight: 700;
	}

	.badge.new {
		background: var(--color-warning-light);
		color: var(--color-warning);
	}

	.counter {
		margin-left: auto;
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
	}

	.question {
		padding: var(--space-5);
		border: 1px solid var(--color-line-strong);
		border-radius: var(--radius-sm);
		background: var(--color-sunk);
		font-size: var(--font-size-lg);
		text-align: center;
		overflow-x: auto;
	}

	/* A hint is a "merk deg" note: yellow edge, body text on a pale ground.
	   The yellow itself is too light to carry running text. */
	.hint {
		margin: 0;
		padding: var(--space-3) var(--space-4);
		border-left: var(--accent-edge) solid var(--color-warning);
		border-radius: var(--radius-sm);
		background: var(--color-warning-light);
		color: var(--color-text);
	}

	.steps {
		margin: 0;
		padding-left: var(--space-5);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.steps li {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		animation: fade-in var(--transition-base) both;
	}

	/* Solution steps are worked-example material, so they take the violet the
	   itslearning boxes use for that. */
	.step-label {
		font-size: var(--font-size-xs);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-example);
	}

	.step-math {
		overflow-x: auto;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
	}

	.actions .btn {
		flex: 1 1 10rem;
	}

	.to-theory {
		margin: 0;
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
</style>
