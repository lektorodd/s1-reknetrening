<script lang="ts">
	import type { LadderRung } from '$lib/engine/ladder';
	import type { SelfExplanation } from '$lib/modules/types';
	import { fadeSteps } from '$lib/engine/guidance-fading';
	import { rungLabel, rungShort, rungPrompt, levelName } from '$lib/content/strings';
	import Tex from './Tex.svelte';
	import TexProse from './TexProse.svelte';
	import { rngFor } from '$lib/modules/rng';
	import { instructionFor } from '$lib/modules/registry';

	interface Props {
		/** One ladder per difficulty the topic offers, easiest first. */
		ladders: { level: number; rungs: LadderRung[] }[];
		/** Self-explanation pool for this topic, if the module has one. */
		prompts?: SelfExplanation[];
	}

	let { ladders, prompts = [] }: Props = $props();

	/**
	 * Two axes, both the student's to choose: how hard the problem is, and how
	 * much of the solution is already filled in.
	 */
	// Null means "not chosen yet", which resolves to the second-easiest ladder.
	// Kept as a choice rather than an initial value so that navigating to
	// another topic — where SvelteKit reuses this component — re-resolves it.
	let chosenLevel = $state<number | null>(null);
	let chosenRung = $state(0);
	let revealed = $state(false);
	let chosen = $state<number | null>(null);

	const levelIndex = $derived(
		Math.min(chosenLevel ?? 1, ladders.length - 1)
	);
	const rungs = $derived(ladders[levelIndex].rungs);
	// Changing difficulty keeps the amount of support, so you can retake the same
	// rung on a harder problem. A level with few distinct problems has a shorter
	// ladder (0-4, say), so the rung is remembered by what it is rather than where
	// it sat, and the nearest one wins — the one with more help on a tie.
	const position = $derived.by(() => {
		let best = 0;
		for (let i = 1; i < rungs.length; i++) {
			if (Math.abs(rungs[i].rung - chosenRung) < Math.abs(rungs[best].rung - chosenRung)) best = i;
		}
		return best;
	});
	const current = $derived(rungs[position]);
	const faded = $derived(fadeSteps(current.problem.structuredSteps, current.rung));
	const isStudy = $derived(current.rung === 0);

	/**
	 * Reflection prompt, shown once the solution is out on the middle rungs.
	 *
	 * Options are shuffled because every prompt was authored with the correct
	 * one first. The shuffle is seeded by the problem id so it holds still.
	 */
	const prompt = $derived.by((): { q: SelfExplanation; order: number[] } | null => {
		if (current.rung < 1 || current.rung > 3 || prompts.length === 0) return null;

		const rng = rngFor(current.problem.id);
		const q = prompts[Math.floor(rng() * prompts.length)];
		const order = q.options.map((_, i) => i);
		for (let i = order.length - 1; i > 0; i--) {
			const j = Math.floor(rng() * (i + 1));
			[order[i], order[j]] = [order[j], order[i]];
		}
		return { q, order };
	});

	function reset() {
		revealed = false;
		chosen = null;
	}

	function go(to: number) {
		chosenRung = rungs[Math.max(0, Math.min(rungs.length - 1, to))].rung;
		reset();
	}

	function setLevel(i: number) {
		chosenLevel = i;
		reset();
	}
</script>

<div class="ladder">
	<div class="axes">
		<div class="axis">
			<span class="axis-label">Vanskegrad</span>
			<div class="levels">
				{#each ladders as l, i (l.level)}
					<button
						class="level"
						class:active={i === levelIndex}
						aria-pressed={i === levelIndex}
						title={levelName(l.level)}
						onclick={() => setLevel(i)}
					>
						{l.level}
					</button>
				{/each}
			</div>
		</div>

		<div class="axis">
			<span class="axis-label">Hjelp</span>
			<nav class="rungs" aria-label="Kor mykje hjelp">
				{#each rungs as r, i (r.problem.id)}
					<button
						class="rung"
						class:active={i === position}
						aria-current={i === position ? 'step' : undefined}
						aria-label={rungLabel(r.rung)}
						title={rungLabel(r.rung)}
						onclick={() => go(i)}
					>
						{rungShort(r.rung)}
					</button>
				{/each}
			</nav>
		</div>
	</div>

	<p class="prompt">{rungPrompt(faded.prompt)}</p>

	<div class="task">
		<p class="instruction"><TexProse text={instructionFor(current.problem)} /></p>
		<div class="question"><Tex tex={current.problem.q} /></div>
	</div>

	{#if faded.shown.length > 0}
		<ol class="steps">
			{#each faded.shown as step, i (i)}
				<li>
					<span class="step-label">{step.label}</span>
					<div class="step-math"><Tex tex={step.latex} /></div>
				</li>
			{/each}
		</ol>
	{/if}

	{#if faded.hidden.length > 0 && !revealed}
		<p class="your-turn">
			Din tur — {faded.hidden.length} steg att
		</p>
	{/if}

	{#if revealed && faded.hidden.length > 0}
		<ol class="steps revealed" start={faded.shown.length + 1}>
			{#each faded.hidden as step, i (i)}
				<li>
					<span class="step-label">{step.label}</span>
					<div class="step-math"><Tex tex={step.latex} /></div>
				</li>
			{/each}
		</ol>
	{/if}

	{#if !isStudy && !revealed}
		<button class="btn btn-secondary reveal" onclick={() => (revealed = true)}>Vis løysing</button>
	{/if}

	{#if revealed && prompt}
		<section class="self-explanation">
			<h4><TexProse text={prompt.q.question} /></h4>
			{#each prompt.order as optionIndex (optionIndex)}
				<button
					class="option"
					class:correct={chosen !== null && optionIndex === prompt.q.correct}
					class:wrong={chosen === optionIndex && optionIndex !== prompt.q.correct}
					disabled={chosen !== null}
					onclick={() => (chosen = optionIndex)}
				>
					<TexProse text={prompt.q.options[optionIndex]} />
				</button>
			{/each}
			{#if chosen !== null}
				<p class="verdict">
					{chosen === prompt.q.correct ? '✓ Riktig.' : '✗ Ikkje heilt — sjå det grøne svaret.'}
				</p>
			{/if}
		</section>
	{/if}

	<div class="nav">
		<button class="btn btn-ghost" disabled={position === 0} onclick={() => go(position - 1)}>
			← Meir hjelp
		</button>
		<button
			class="btn btn-primary"
			disabled={position === rungs.length - 1}
			onclick={() => go(position + 1)}
		>
			Mindre hjelp →
		</button>
	</div>
</div>

<style>
	/* The ladder is worked-example material too, so it carries the violet edge. */
	.ladder {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding: var(--space-6);
		border: 1px solid var(--color-border-warm);
		border-left: var(--accent-edge) solid var(--color-example);
		border-radius: var(--radius-md);
		background: var(--color-surface);
	}

	/* Tops aligned, so the two axis labels sit on one line. The controls below
	   them are different heights, and flex-end pushed the shorter axis's label
	   down. */
	.axes {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-5);
		align-items: flex-start;
	}

	.axis {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.axis:last-child {
		flex: 1;
		min-width: 16rem;
	}

	.axis-label {
		font-size: var(--font-size-xs);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-text-muted);
	}

	.levels {
		display: flex;
		gap: var(--space-1);
	}

	.level {
		width: 2.4rem;
		height: 2.4rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		background: var(--color-surface);
		font: inherit;
		font-size: var(--font-size-sm);
		cursor: pointer;
		transition: border-color var(--transition-fast), background var(--transition-fast);
	}

	.level:hover {
		border-color: var(--color-primary);
	}

	.level.active {
		border-color: var(--color-primary);
		background: var(--color-primary);
		color: var(--color-text-inverse);
	}

	.rungs {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	/* Words, not a meter. The bars they replaced were 6px tall — you had to aim —
	   and the filled one sat furthest right, where there is the least help, so
	   more colour read as less help. A named button says what it is, and there is
	   no fill left to point the wrong way. Violet, because which rung you are on
	   is worked-example material, like the rest of this card. */
	.rung {
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		font: inherit;
		font-size: var(--font-size-sm);
		color: var(--color-text-strong);
		cursor: pointer;
		white-space: nowrap;
		transition: border-color var(--transition-fast), background var(--transition-fast);
	}

	.rung:hover {
		border-color: var(--color-example);
	}

	.rung.active {
		border-color: var(--color-example);
		background: var(--color-example);
		color: var(--color-text-inverse);
	}

	.prompt {
		margin: 0;
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
	}

	.task {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.instruction {
		margin: 0;
		font-weight: 600;
		color: var(--color-text-strong);
	}

	.question {
		padding: var(--space-3) var(--space-4);
		border: 1px solid var(--color-line);
		border-radius: var(--radius-sm);
		background: var(--color-raised);
		text-align: center;
		overflow-x: auto;
	}

	.steps {
		margin: 0;
		padding-left: var(--space-5);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.steps li {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.steps.revealed li {
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

	/* Display maths, not inline. Inline maths lives inside a text line, and a
	   fraction is taller than the line — with `overflow-x: auto` the other axis
	   computes to `auto` too (CSS forbids one axis scrolling while the other is
	   visible), so every step with a fraction grew its own vertical scrollbar.
	   A display container is a block that sets its own height, so there is
	   nothing to overflow. Horizontal scrolling stays: a long formula still
	   needs it. */
	.step-math {
		padding: var(--space-2) 0;
		overflow-x: auto;
	}


	.your-turn {
		margin: 0;
		padding: var(--space-4);
		border: 2px dashed var(--color-border-warm);
		border-radius: var(--radius-sm);
		text-align: center;
		color: var(--color-text-secondary);
		font-weight: 600;
	}

	.reveal {
		align-self: flex-start;
	}

	.self-explanation {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding-top: var(--space-4);
		border-top: 1px solid var(--color-border);
	}

	.self-explanation h4 {
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

	.nav {
		display: flex;
		justify-content: space-between;
		gap: var(--space-3);
		padding-top: var(--space-2);
	}

	.nav .btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
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
