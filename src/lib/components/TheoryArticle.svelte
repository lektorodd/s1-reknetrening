<script lang="ts">
	import type { TheoryEntry } from '$lib/modules/types';
	import { typesetElement } from '$lib/utils/mathjax';

	interface Props {
		entry: TheoryEntry;
	}

	let { entry }: Props = $props();
	let container = $state<HTMLElement | null>(null);

	$effect(() => {
		void entry.title;
		if (container) typesetElement(container);
	});
</script>

<article bind:this={container}>
	<h1>{entry.title}</h1>
	<p class="intro">{entry.intro}</p>

	<section class="formula-block">
		<h2><span class="mark" aria-hidden="true">Σ</span> Regelen</h2>
		<div class="formula">{`\\[${entry.formula}\\]`}</div>
		<p class="rule-text">{entry.ruleText}</p>
		<p class="example">{entry.example}</p>
	</section>

	<section>
		<h2>Kjenn att mønsteret</h2>
		<p class="flow">{entry.patternRecognition}</p>
	</section>

	<section>
		<h2>Tenk høgt</h2>
		<blockquote class="flow">{entry.thinkAloud}</blockquote>
	</section>

	<section>
		<h2>Gjennomgått døme</h2>
		<ol class="worked">
			{#each entry.workedSteps as step, i (i)}
				<li>
					<p class="explanation">{step.explanation}</p>
					<div class="step-math">{`\\[${step.latex}\\]`}</div>
				</li>
			{/each}
		</ol>
	</section>

	{#if entry.mnemonic}
		<aside class="mnemonic">
			<strong><span class="mark" aria-hidden="true">✓</span> Hugseregel</strong>
			<p>{entry.mnemonic}</p>
		</aside>
	{/if}
</article>

<style>
	h1 {
		margin: 0 0 var(--space-3);
		font-size: var(--font-size-3xl);
	}

	h2 {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin: 0 0 var(--space-3);
		font-size: var(--font-size-lg);
		color: var(--color-primary);
	}

	.intro {
		margin: 0 0 var(--space-8);
		font-size: var(--font-size-lg);
		color: var(--color-text-secondary);
		white-space: pre-line;
	}

	section {
		margin-bottom: var(--space-8);
	}

	/* Worked example / formula: violet, the same meaning it carries in the
	   itslearning boxes. */
	.formula-block {
		--accent: var(--color-example);
		padding: var(--space-5) var(--space-6);
		border: 1px solid var(--color-border-warm);
		border-left: var(--accent-edge) solid var(--accent);
		border-radius: var(--radius-md);
		background: var(--color-example-light);
	}

	.formula-block h2 {
		color: var(--color-example);
	}

	.formula {
		font-size: var(--font-size-lg);
		overflow-x: auto;
	}

	.rule-text,
	.example {
		margin: var(--space-2) 0 0;
		color: var(--color-text-secondary);
	}

	/* Theory prose is authored with real newlines and bullet characters. */
	.flow {
		margin: 0;
		white-space: pre-line;
		line-height: 1.7;
	}

	blockquote.flow {
		padding-left: var(--space-4);
		border-left: var(--accent-edge) solid var(--color-border-warm);
		color: var(--color-text-secondary);
		font-style: italic;
	}

	/* Numbered violet circles, matching the step lists in the itslearning boxes. */
	.worked {
		margin: 0;
		padding: 0;
		list-style: none;
		counter-reset: step;
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.worked li {
		counter-increment: step;
		padding-left: var(--space-8);
		position: relative;
	}

	.worked li::before {
		content: counter(step);
		position: absolute;
		left: 0;
		top: 0.1em;
		display: grid;
		place-items: center;
		width: 1.3rem;
		height: 1.3rem;
		border-radius: var(--radius-full);
		background: var(--color-example);
		color: var(--color-text-inverse);
		font-size: var(--font-size-xs);
		font-weight: 700;
		line-height: 1;
	}

	.explanation {
		margin: 0 0 var(--space-2);
		color: var(--color-text);
	}

	/* The formula field: white on a warm border, as in the boxes. */
	.step-math {
		padding: var(--space-3) var(--space-4);
		border: 1px solid var(--color-border-warm);
		border-radius: var(--radius-sm);
		background: var(--color-surface);
		text-align: center;
		overflow-x: auto;
	}

	/* Mnemonic gets the house mint — the signature highlight. */
	.mnemonic {
		--accent: var(--color-success);
		padding: var(--space-5);
		border: 1px solid var(--color-mint);
		border-left: var(--accent-edge) solid var(--color-mint);
		border-radius: var(--radius-md);
		background: var(--color-mint-light);
	}

	.mnemonic strong {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		color: var(--color-success);
	}

	.mnemonic p {
		margin: var(--space-2) 0 0;
		white-space: pre-line;
		color: var(--color-text);
	}
</style>
