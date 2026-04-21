<script lang="ts">
	import type { LogProblem } from '$lib/modules/logarithm/types';
	import type { I18nStrings, Lang } from '$lib/i18n';
	import type { ProblemStatus } from '$lib/stores';
	import type { FadedSteps, FadingLevel } from '$lib/engine/guidance-fading';
	import { fadeSteps } from '$lib/engine/guidance-fading';
	import { LOG_SELF_EXPLANATIONS, type SelfExplanation } from '$lib/modules/logarithm/self-explanation';
	import { typesetElement } from '$lib/utils/mathjax';

	interface Props {
		problem: LogProblem;
		status?: ProblemStatus;
		fadingLevel: FadingLevel;
		texts: I18nStrings;
		language: Lang;
		onRate: (id: number, status: ProblemStatus) => void;
	}

	let { problem, status, fadingLevel, texts, language, onRate }: Props = $props();

	let showHidden = $state(false);
	let showSelfExplanation = $state(false);
	let selectedAnswer = $state<number | null>(null);
	let cardEl: HTMLElement | undefined = $state(undefined);

	const faded = $derived<FadedSteps>(fadeSteps(problem.structuredSteps || [], fadingLevel));

	// Self-explanation (shown at levels 1-3 after revealing)
	const selfExplanation = $derived.by(() => {
		if (fadingLevel >= 1 && fadingLevel <= 3) {
			const prompts = LOG_SELF_EXPLANATIONS[problem.topic];
			return prompts && prompts.length > 0 ? prompts[0] : null;
		}
		return null;
	});

	// The prompt text based on fading level
	const promptText = $derived(texts[faded.prompt as keyof typeof texts] || texts.fading_independent);

	// Badge text — localized
	const badgeText = $derived(
		fadingLevel === 4 ? `🎯 ${texts.fading_badge_solo}` : fadingLevel === 0 ? `📖 ${texts.nav_theory}` : `✏️ ${texts.fading_badge_guided}`
	);

	// Step label translations — map from English generator keys to localized text
	const stepLabelMap: Record<string, Record<string, string>> = {
		'Identify':              { nn: 'Identifiser',            en: 'Identify',              es: 'Identificar' },
		'Apply product rule':    { nn: 'Produktsetningen',       en: 'Apply product rule',    es: 'Regla del producto' },
		'Apply quotient rule':   { nn: 'Kvotientsetningen',      en: 'Apply quotient rule',   es: 'Regla del cociente' },
		'Apply power rule':      { nn: 'Potenssetningen',        en: 'Apply power rule',      es: 'Regla de la potencia' },
		'Rewrite':               { nn: 'Skriv om',               en: 'Rewrite',               es: 'Reescribir' },
		'Simplify':              { nn: 'Forenkle',               en: 'Simplify',              es: 'Simplificar' },
		'Split':                 { nn: 'Del opp',                en: 'Split',                 es: 'Dividir' },
		'Combine':               { nn: 'Kombiner',               en: 'Combine',               es: 'Combinar' },
		'Use definition':        { nn: 'Bruk definisjonen',      en: 'Use definition',        es: 'Usa la definición' },
		'Solve':                 { nn: 'Løys',                   en: 'Solve',                 es: 'Resolver' },
		'Take log':              { nn: 'Ta logaritmen',          en: 'Take log',              es: 'Toma el log' },
		'Power rule':            { nn: 'Potenssetningen',        en: 'Power rule',            es: 'Regla de la potencia' },
		'Divide':                { nn: 'Del',                    en: 'Divide',                es: 'Dividir' },
		'Answer':                { nn: 'Svar',                   en: 'Answer',                es: 'Respuesta' },
	};

	function localizeLabel(label: string): string {
		const entry = stepLabelMap[label];
		if (entry) return entry[language] ?? entry.nn;
		return label;
	}

	// Reset state when problem or fading level changes
	$effect(() => {
		const _p = problem.id;
		const _l = fadingLevel;
		showHidden = false;
		showSelfExplanation = false;
		selectedAnswer = null;
	});

	// Typeset on mount and when content changes
	$effect(() => {
		if (cardEl) {
			requestAnimationFrame(() => {
				if (cardEl) typesetElement(cardEl);
			});
		}
	});

	$effect(() => {
		if (showHidden && cardEl) {
			requestAnimationFrame(() => {
				if (cardEl) typesetElement(cardEl);
			});
		}
	});

	function revealHidden() {
		showHidden = true;
		if (selfExplanation && fadingLevel >= 2 && fadingLevel <= 3) {
			showSelfExplanation = true;
		}
	}

	function checkAnswer(idx: number) {
		selectedAnswer = idx;
	}

	const borderClass = $derived(() => {
		if (status === 'mastered') return 'border-success';
		if (status === 'practice') return 'border-warning';
		return '';
	});
</script>

<div class="faded-card {borderClass()}" bind:this={cardEl}>
	<!-- Fading Level Badge -->
	<div class="card-top">
		<div class="badges">
			<span class="badge badge-fading level-{fadingLevel}">
				{badgeText}
			</span>
		</div>
		{#if status === 'mastered'}
			<span class="status-icon status-success">✓</span>
		{/if}
	</div>

	<!-- Question -->
	<div class="question">$${problem.q}$$</div>

	<!-- Prompt -->
	{#if fadingLevel > 0}
		<div class="fading-prompt">{promptText}</div>
	{/if}

	<!-- Shown Steps -->
	{#if faded.shown.length > 0}
		<div class="steps-section shown-steps">
			{#each faded.shown as step, i}
				<div class="step-row animate-fade-in" style="animation-delay: {i * 80}ms">
					<span class="step-label">{localizeLabel(step.label)}</span>
					<span class="step-latex">$${step.latex}$$</span>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Your Turn indicator + Hidden Step Labels (scaffolding) -->
	{#if faded.hidden.length > 0 && !showHidden}
		<div class="your-turn animate-fade-in">
			<div class="your-turn-line"></div>
			<span class="your-turn-text">↓ {texts.fading_your_turn} ↓</span>
		</div>

		<!-- Show step labels as scaffolding hints -->
		<div class="steps-section hidden-scaffold">
			{#each faded.hidden as step, i}
				<div class="step-row scaffold-row" style="animation-delay: {i * 80}ms">
					<span class="step-label">{localizeLabel(step.label)}</span>
					<span class="step-placeholder">???</span>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Hidden Steps (revealed) -->
	{#if showHidden && faded.hidden.length > 0}
		<div class="steps-section hidden-steps animate-fade-in">
			{#each faded.hidden as step, i}
				<div class="step-row revealed" style="animation-delay: {i * 80}ms">
					<span class="step-label">{localizeLabel(step.label)}</span>
					<span class="step-latex">$${step.latex}$$</span>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Action Buttons -->
	<div class="actions">
		{#if !showHidden && faded.hidden.length > 0}
			<button class="btn btn-primary btn-sm" onclick={revealHidden}>
				{texts.fading_reveal}
			</button>
		{/if}

		{#if showHidden || fadingLevel === 4 || fadingLevel === 0}
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
		{/if}
	</div>

	<!-- Self-Explanation Prompt -->
	{#if showSelfExplanation && selfExplanation}
		<div class="self-explain animate-fade-in">
			<div class="self-explain-title">{texts.self_explain_title}</div>
			<p class="self-explain-question">{selfExplanation.question[language]}</p>
			<div class="self-explain-options">
				{#each selfExplanation.options as opt, i}
					<button
						class="self-explain-btn"
						class:correct={selectedAnswer === i && opt.correct}
						class:wrong={selectedAnswer === i && !opt.correct}
						onclick={() => checkAnswer(i)}
					>
						{opt.text[language]}
					</button>
				{/each}
			</div>
			{#if selectedAnswer !== null}
				<div class="self-explain-feedback animate-fade-in">
					{selfExplanation.options[selectedAnswer].correct
						? texts.self_explain_correct
						: texts.self_explain_wrong}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	/* ── Card Container ── */
	.faded-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg, 16px);
		padding: var(--space-6, 2rem);
		box-shadow: var(--shadow-sm, 0 1px 6px rgba(0,0,0,0.04));
		transition: all 0.2s;
	}

	.faded-card.border-success { border-left: 4px solid var(--color-success, #10B981); }
	.faded-card.border-warning { border-left: 4px solid var(--color-warning, #F59E0B); }

	.card-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-4, 1rem);
	}

	.badges { display: flex; gap: var(--space-2, 0.5rem); }

	.badge-fading {
		font-size: var(--font-size-xs, 0.75rem);
		font-weight: 700;
		padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
		border-radius: 9999px;
	}

	.level-0 { background: rgba(107, 114, 128, 0.12); color: #374151; }
	.level-1, .level-2, .level-3 { background: rgba(63, 81, 181, 0.12); color: #3F51B5; }
	.level-4 { background: rgba(16, 185, 129, 0.12); color: #065F46; }

	.status-icon { font-size: var(--font-size-lg, 1.125rem); font-weight: 700; }
	.status-success { color: var(--color-success, #10B981); }

	.question {
		text-align: center;
		font-size: var(--font-size-xl, 1.5rem);
		padding: var(--space-2, 0.5rem) 0;
	}

	.fading-prompt {
		text-align: center;
		font-size: var(--font-size-sm, 0.875rem);
		color: var(--color-primary, #3F51B5);
		font-weight: 600;
		margin-bottom: var(--space-4, 1rem);
		font-style: italic;
	}

	/* Steps */
	.steps-section {
		margin: var(--space-2, 0.5rem) 0;
		border-radius: 12px;
		padding: var(--space-2, 0.5rem);
	}

	.shown-steps { background: var(--color-surface, white); border: 1px solid var(--color-border, #e2e8f0); }
	.hidden-steps { background: var(--color-surface, white); border: 1px solid var(--color-success, #10B981); border-left: 3px solid var(--color-success, #10B981); }
	.hidden-scaffold { background: var(--color-surface, white); border: 1px dashed rgba(63, 81, 181, 0.3); border-left: 3px dashed rgba(63, 81, 181, 0.4); }

	.step-row {
		display: flex;
		align-items: baseline;
		gap: var(--space-3, 0.75rem);
		padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
		border-radius: 6px;
	}

	.step-row + .step-row { border-top: 1px solid var(--color-border, #e2e8f0); }
	.step-row.revealed { background: rgba(16, 185, 129, 0.05); }
	.scaffold-row { opacity: 0.7; }

	.step-placeholder {
		font-size: var(--font-size-lg, 1.125rem);
		color: var(--color-text-muted, #94a3b8);
		font-weight: 600;
		letter-spacing: 0.15em;
	}

	.step-label {
		font-size: var(--font-size-xs, 0.75rem);
		font-weight: 700;
		color: #3F51B5;
		min-width: 110px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		flex-shrink: 0;
	}

	.step-latex { font-size: var(--font-size-base, 1rem); color: var(--color-text, #1e293b); }

	/* Your Turn */
	.your-turn { text-align: center; padding: var(--space-4, 1rem) 0; }
	.your-turn-line { height: 2px; background: linear-gradient(to right, transparent, var(--color-primary, #3F51B5), transparent); margin-bottom: var(--space-2, 0.5rem); }
	.your-turn-text { font-size: var(--font-size-sm, 0.875rem); font-weight: 700; color: var(--color-primary, #3F51B5); letter-spacing: 0.1em; }

	/* Actions */
	.actions { display: flex; justify-content: center; gap: var(--space-3, 0.75rem); margin-top: var(--space-4, 1rem); }

	.btn { font-family: inherit; cursor: pointer; border: none; border-radius: 9999px; font-weight: 600; transition: all 0.15s; }
	.btn-sm { padding: var(--space-2, 0.5rem) var(--space-4, 1rem); font-size: var(--font-size-sm, 0.875rem); }
	.btn-primary { background: var(--color-primary, #3F51B5); color: white; }
	.btn-primary:hover { opacity: 0.9; }

	.rate-practice { background: rgba(245, 158, 11, 0.12); color: #92400E; border: 1px solid rgba(245, 158, 11, 0.3); }
	.rate-practice:hover { background: rgba(245, 158, 11, 0.2); }
	.rate-mastered { background: rgba(16, 185, 129, 0.12); color: #065F46; border: 1px solid rgba(16, 185, 129, 0.3); }
	.rate-mastered:hover { background: rgba(16, 185, 129, 0.2); }

	/* Self-Explanation */
	.self-explain { margin-top: var(--space-6, 2rem); padding: var(--space-4, 1rem); background: rgba(63, 81, 181, 0.05); border: 1px solid rgba(63, 81, 181, 0.2); border-radius: 12px; }
	.self-explain-title { font-size: var(--font-size-xs, 0.75rem); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #3F51B5; margin-bottom: var(--space-2, 0.5rem); }
	.self-explain-question { font-size: var(--font-size-sm, 0.875rem); font-weight: 600; color: var(--color-text, #1e293b); margin-bottom: var(--space-3, 0.75rem); }
	.self-explain-options { display: flex; flex-direction: column; gap: var(--space-2, 0.5rem); }

	.self-explain-btn {
		text-align: left;
		padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
		border: 1px solid var(--color-border, #e2e8f0);
		border-radius: 12px;
		background: var(--color-surface, white);
		cursor: pointer;
		font-size: var(--font-size-sm, 0.875rem);
		color: var(--color-text, #1e293b);
		font-family: inherit;
		transition: all 0.15s;
	}

	.self-explain-btn:hover { border-color: var(--color-primary, #3F51B5); background: rgba(63, 81, 181, 0.08); }
	.self-explain-btn.correct { border-color: #10B981; background: rgba(16, 185, 129, 0.1); }
	.self-explain-btn.wrong { border-color: #EF4444; background: rgba(239, 68, 68, 0.06); }
	.self-explain-feedback { margin-top: var(--space-2, 0.5rem); font-weight: 600; font-size: var(--font-size-sm, 0.875rem); }

	/* Animations */
	.animate-fade-in { animation: fadeIn 0.3s ease forwards; }
	@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
</style>
