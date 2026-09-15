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
		<h2>Regelen</h2>
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
			<strong>Hugseregel</strong>
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

	.formula-block {
		padding: var(--space-6);
		border-radius: var(--radius-lg);
		background: var(--color-primary-50);
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
		border-left: 3px solid var(--color-border);
		color: var(--color-text-secondary);
		font-style: italic;
	}

	.worked {
		margin: 0;
		padding-left: var(--space-5);
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.explanation {
		margin: 0 0 var(--space-2);
	}

	.step-math {
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-md);
		background: var(--color-bg);
		overflow-x: auto;
	}

	.mnemonic {
		padding: var(--space-5);
		border-radius: var(--radius-lg);
		background: var(--color-warning-light);
		color: #78350f;
	}

	.mnemonic p {
		margin: var(--space-2) 0 0;
		white-space: pre-line;
	}
</style>
