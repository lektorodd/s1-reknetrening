<script lang="ts">
	import type { SessionCard } from '$lib/engine/session';
	import type { SelfExplanation } from '$lib/modules/types';
	import { fadeSteps } from '$lib/engine/guidance-fading';
	import { getModule } from '$lib/modules/registry';
	import { fadingBadge, fadingPrompt } from '$lib/content/strings';
	import { typesetElement } from '$lib/utils/mathjax';
	import { rngFor } from '$lib/modules/rng';
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
	let chosen = $state<number | null>(null);
	let container = $state<HTMLElement | null>(null);

	const faded = $derived(fadeSteps(card.problem.structuredSteps, card.level));

	/** Where the fully worked example for this concept lives. */
	const theoryHref = $derived.by(() => {
		const mod = getModule(card.problem.moduleId);
		return mod ? `${base}/laer/${mod.slug}/${card.problem.topic}/` : null;
	});

	/**
	 * Pick a self-explanation prompt and shuffle its options.
	 *
	 * Shuffling matters: every prompt was authored with the correct option
	 * first, so an unshuffled list can be answered correctly without reading it.
	 * The shuffle is seeded by the problem id so the order is stable while the
	 * card is on screen.
	 */
	const prompt = $derived.by((): { q: SelfExplanation; order: number[] } | null => {
		if (card.level < 1 || card.level > 3) return null;
		const mod = getModule(card.problem.moduleId);
		const pool = mod?.selfExplanations[card.problem.topic];
		if (!pool || pool.length === 0) return null;

		const rng = rngFor(card.problem.id);
		const q = pool[Math.floor(rng() * pool.length)];
		const order = q.options.map((_, i) => i);
		for (let i = order.length - 1; i > 0; i--) {
			const j = Math.floor(rng() * (i + 1));
			[order[i], order[j]] = [order[j], order[i]];
		}
		return { q, order };
	});

	// Re-typeset whenever the card or its revealed state changes.
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
		chosen = null;
	});

	function rate(correct: boolean) {
		onAnswer(correct, hintShown);
	}
</script>

<article class="card session-card" bind:this={container}>
	<header>
		<span class="badge">{fadingBadge(card.level)}</span>
		{#if card.isNewConcept}
			<span class="badge new">Nytt emne</span>
		{/if}
		<span class="counter">{index + 1} av {total}</span>
	</header>

	<p class="prompt">{fadingPrompt(faded.prompt)}</p>

	<div class="question">{`\\[${card.problem.q}\\]`}</div>

	{#if faded.shown.length > 0}
		<ol class="steps">
			{#each faded.shown as step, i (i)}
				<li>
					<span class="step-label">{step.label}</span>
					<span class="step-math">{`\\(${step.latex}\\)`}</span>
				</li>
			{/each}
		</ol>
	{/if}

	{#if faded.hidden.length > 0 && !revealed}
		<p class="your-turn">Din tur — {faded.hidden.length}
			{faded.hidden.length === 1 ? 'steg' : 'steg'} att</p>
	{/if}

	{#if revealed && faded.hidden.length > 0}
		<ol class="steps revealed" start={faded.shown.length + 1}>
			{#each faded.hidden as step, i (i)}
				<li>
					<span class="step-label">{step.label}</span>
					<span class="step-math">{`\\(${step.latex}\\)`}</span>
				</li>
			{/each}
		</ol>
	{/if}

	{#if hintShown}
		<p class="hint">💡 {card.problem.hint}</p>
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
			<a href={theoryHref} target="_blank" rel="noopener">Sjå gjennomgått døme i Lærebok →</a>
		</p>
	{/if}

	{#if revealed && prompt}
		<section class="self-explanation">
			<h3>{prompt.q.question}</h3>
			{#each prompt.order as optionIndex (optionIndex)}
				<button
					class="option"
					class:correct={chosen !== null && optionIndex === prompt.q.correct}
					class:wrong={chosen === optionIndex && optionIndex !== prompt.q.correct}
					disabled={chosen !== null}
					onclick={() => (chosen = optionIndex)}
				>
					{prompt.q.options[optionIndex]}
				</button>
			{/each}
			{#if chosen !== null}
				<p class="verdict">
					{chosen === prompt.q.correct ? '✓ Riktig.' : '✗ Ikkje heilt — sjå det grøne svaret.'}
				</p>
			{/if}
		</section>
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

	.counter {
		margin-left: auto;
	}

	.badge {
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-full);
		background: var(--color-primary-50);
		color: var(--color-primary-dark);
		font-size: var(--font-size-xs);
		font-weight: 700;
	}

	.badge.new {
		background: var(--color-warning-light);
		color: #92400e;
	}

	.counter {
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
	}

	.prompt {
		margin: 0;
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
	}

	.question {
		padding: var(--space-5);
		border-radius: var(--radius-md);
		background: var(--color-bg);
		font-size: var(--font-size-lg);
		overflow-x: auto;
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
	}

	.steps.revealed li {
		animation: fade-in var(--transition-base) both;
	}

	.step-label {
		font-size: var(--font-size-xs);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-primary);
	}

	.step-math {
		overflow-x: auto;
	}

	.your-turn {
		margin: 0;
		padding: var(--space-4);
		border: 2px dashed var(--color-border);
		border-radius: var(--radius-md);
		text-align: center;
		color: var(--color-text-secondary);
		font-weight: 600;
	}

	.hint {
		margin: 0;
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-md);
		background: var(--color-warning-light);
		color: #78350f;
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

	.self-explanation {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding-top: var(--space-4);
		border-top: 1px solid var(--color-border);
	}

	.self-explanation h3 {
		margin: 0 0 var(--space-1);
		font-size: var(--font-size-base);
	}

	.option {
		padding: var(--space-3) var(--space-4);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		font: inherit;
		text-align: left;
		cursor: pointer;
		transition: border-color var(--transition-fast), background var(--transition-fast);
	}

	.option:hover:not(:disabled) {
		border-color: var(--color-primary);
	}

	.option:disabled {
		cursor: default;
	}

	.option.correct {
		border-color: var(--color-success);
		background: var(--color-success-light);
	}

	.option.wrong {
		border-color: var(--color-error);
		background: var(--color-error-light);
	}

	.verdict {
		margin: 0;
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
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
