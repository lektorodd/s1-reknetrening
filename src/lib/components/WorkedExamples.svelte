<script lang="ts">
	import type { Problem } from '$lib/modules/types';
	import { LEVEL_NAMES } from '$lib/content/strings';
	import { typesetElement } from '$lib/utils/mathjax';

	interface Props {
		examples: Problem[];
	}

	let { examples }: Props = $props();

	// null means "collapsed"; the first example starts open.
	let collapsed = $state<Set<string>>(new Set());
	let container = $state<HTMLElement | null>(null);

	const isOpen = (id: string) => (id === examples[0]?.id ? !collapsed.has(id) : collapsed.has(id));

	function toggle(id: string) {
		const next = new Set(collapsed);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		collapsed = next;
	}

	$effect(() => {
		void collapsed;
		if (container) typesetElement(container);
	});
</script>

<div bind:this={container} class="examples">
	{#each examples as ex (ex.id)}
		<section class="worked-example">
			<h3>
				<button onclick={() => toggle(ex.id)} aria-expanded={isOpen(ex.id)}>
					<span class="level">Nivå {ex.level} · {LEVEL_NAMES[ex.level]}</span>
					<span class="chevron" aria-hidden="true">{isOpen(ex.id) ? '−' : '+'}</span>
				</button>
			</h3>

			<div class="task">{`\\[${ex.q}\\]`}</div>

			{#if isOpen(ex.id)}
				<ol class="steps">
					{#each ex.structuredSteps as step, i (i)}
						<li>
							<span class="step-label">{step.label}</span>
							<span class="step-math">{`\\(${step.latex}\\)`}</span>
						</li>
					{/each}
				</ol>
			{/if}
		</section>
	{/each}
</div>

<style>
	.examples {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.worked-example {
		padding: var(--space-4) var(--space-5);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
	}

	h3 {
		margin: 0;
	}

	h3 button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 0;
		border: 0;
		background: none;
		font: inherit;
		cursor: pointer;
		color: var(--color-text-secondary);
	}

	.level {
		font-size: var(--font-size-xs);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.chevron {
		font-size: var(--font-size-lg);
		color: var(--color-primary);
	}

	.task {
		margin-top: var(--space-2);
		overflow-x: auto;
	}

	.steps {
		margin: var(--space-3) 0 0;
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
</style>
