<script lang="ts">
	import type { Problem, StepEntry } from '$lib/modules/derivative/types';
	import type { I18nStrings } from '$lib/i18n';
	import type { Lang } from '$lib/i18n';
	import type { ProblemStatus } from '$lib/stores';
	import type { FadedSteps, FadingLevel } from '$lib/engine/guidance-fading';
	import { fadeSteps } from '$lib/engine/guidance-fading';
	import { getSelfExplanation, type SelfExplanation } from '$lib/modules/derivative/self-explanation';
	import { typesetElement } from '$lib/utils/mathjax';

	interface Props {
		problem: Problem;
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
	const selfExplanation = $derived<SelfExplanation | null>(
		fadingLevel >= 1 && fadingLevel <= 3 ? getSelfExplanation(problem.topic) : null
	);

	// The prompt text based on fading level
	const promptText = $derived(texts[faded.prompt as keyof typeof texts] || texts.fading_independent);

	// Badge text — localized
	const badgeText = $derived(
		fadingLevel === 4 ? `🎯 ${texts.fading_badge_solo}` : fadingLevel === 0 ? `📖 ${texts.nav_theory}` : `✏️ ${texts.fading_badge_guided}`
	);

	// Step label translations — map from English generator keys to localized text
	const stepLabelMap: Record<string, Record<string, string>> = {
		'Identify':              { nn: 'Identifiser',          en: 'Identify',             es: 'Identificar' },
		'Differentiate g':       { nn: 'Derivér g',            en: 'Differentiate g',      es: 'Derivar g' },
		'Differentiate u':       { nn: 'Derivér u',            en: 'Differentiate u',      es: 'Derivar u' },
		'Apply chain rule':      { nn: 'Bruk kjerneregelen',   en: 'Apply chain rule',     es: 'Aplicar regla cadena' },
		'Substitute':            { nn: 'Set inn',              en: 'Substitute',           es: 'Sustituir' },
		'Simplify':              { nn: 'Forenkle',             en: 'Simplify',             es: 'Simplificar' },
		'Identify u':            { nn: 'Identifiser u',        en: 'Identify u',           es: 'Identificar u' },
		'Identify v':            { nn: 'Identifiser v',        en: 'Identify v',           es: 'Identificar v' },
		'Differentiate':         { nn: 'Derivér',              en: 'Differentiate',        es: 'Derivar' },
		'Apply product rule':    { nn: 'Bruk produktregelen',  en: 'Apply product rule',   es: 'Aplicar regla producto' },
		'Identify u,v':          { nn: 'Identifiser u, v',     en: 'Identify u, v',        es: 'Identificar u, v' },
		'Apply quotient rule':   { nn: 'Bruk brøkregelen',     en: 'Apply quotient rule',  es: 'Aplicar regla cociente' },
		'Rewrite':               { nn: 'Skriv om',             en: 'Rewrite',              es: 'Reescribir' },
		'Expand':                { nn: 'Utvid',                en: 'Expand',               es: 'Expandir' },
		'Factor out':            { nn: 'Faktoriser',           en: 'Factor out',           es: 'Factorizar' },
		'Common denominator':    { nn: 'Fellesnemnar',         en: 'Common denominator',   es: 'Denominador común' },
		'Expand numerator':      { nn: 'Utvid teljaren',       en: 'Expand numerator',     es: 'Expandir numerador' },
		'Simplify numerator':    { nn: 'Forenkle teljaren',    en: 'Simplify numerator',   es: 'Simplificar numerador' },
		'Differentiate outer':   { nn: 'Derivér ytre',         en: 'Differentiate outer',  es: 'Derivar exterior' },
		'Differentiate inner':   { nn: 'Derivér indre',        en: 'Differentiate inner',  es: 'Derivar interior' },
		'Differentiate u (chain rule)': { nn: 'Derivér u (kjerneregel)', en: 'Differentiate u (chain rule)', es: 'Derivar u (regla cadena)' },
		'Differentiate v (chain rule)': { nn: 'Derivér v (kjerneregel)', en: 'Differentiate v (chain rule)', es: 'Derivar v (regla cadena)' },
	};

	function localizeLabel(label: string): string {
		const entry = stepLabelMap[label];
		if (entry) return entry[language] ?? entry.nn;
		return label;
	}

	// Reset state when problem or fading level changes
	$effect(() => {
		// Track these to reset when they change
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
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		box-shadow: var(--shadow-sm);
		transition: all var(--transition-base);
	}

	.faded-card.border-success {
		border-left: 4px solid var(--color-success);
	}

	.faded-card.border-warning {
		border-left: 4px solid var(--color-warning);
	}

	.card-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-4);
	}

	.badges { display: flex; gap: var(--space-2); }

	/* ── Badge — using DESIGN.md palette ── */
	.badge-fading {
		font-size: var(--font-size-xs);
		font-weight: 700;
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-full);
	}

	/* Study level (0): neutral */
	.level-0 {
		background: rgba(107, 114, 128, 0.12);
		color: #374151;
	}

	/* Guided levels (1-3): Primary Indigo tint */
	.level-1, .level-2, .level-3 {
		background: rgba(63, 81, 181, 0.12);
		color: #3F51B5;
	}

	/* Independent (4): Success Emerald tint */
	.level-4 {
		background: rgba(16, 185, 129, 0.12);
		color: #065F46;
	}

	.status-icon { font-size: var(--font-size-lg); font-weight: 700; }
	.status-success { color: var(--color-success); }

	.question {
		text-align: center;
		font-size: var(--font-size-xl);
		padding: var(--space-2) 0;
	}

	.fading-prompt {
		text-align: center;
		font-size: var(--font-size-sm);
		color: var(--color-primary);
		font-weight: 600;
		margin-bottom: var(--space-4);
		font-style: italic;
	}

	/* ── Steps — high contrast on white bg ── */
	.steps-section {
		margin: var(--space-2) 0;
		border-radius: var(--radius-md);
		padding: var(--space-2);
	}

	.shown-steps {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
	}

	.hidden-steps {
		background: var(--color-surface);
		border: 1px solid var(--color-success);
		border-left: 3px solid var(--color-success);
	}

	.step-row {
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-sm);
	}

	.step-row + .step-row {
		border-top: 1px solid var(--color-border);
	}

	.step-row.revealed {
		background: rgba(16, 185, 129, 0.05);
	}

	/* Scaffold rows — label visible, content hidden as ??? */
	.hidden-scaffold {
		background: var(--color-surface);
		border: 1px dashed rgba(63, 81, 181, 0.3);
		border-left: 3px dashed rgba(63, 81, 181, 0.4);
	}

	.scaffold-row {
		opacity: 0.7;
	}

	.step-placeholder {
		font-size: var(--font-size-lg);
		color: var(--color-text-muted);
		font-weight: 600;
		letter-spacing: 0.15em;
	}

	/* High contrast: dark text on white/light background */
	.step-label {
		font-size: var(--font-size-xs);
		font-weight: 700;
		color: #3F51B5;
		min-width: 110px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		flex-shrink: 0;
	}

	.step-latex {
		font-size: var(--font-size-base);
		color: var(--color-text);
	}

	/* ── Your Turn ── */
	.your-turn {
		text-align: center;
		padding: var(--space-4) 0;
	}

	.your-turn-line {
		height: 2px;
		background: linear-gradient(to right, transparent, var(--color-primary), transparent);
		margin-bottom: var(--space-2);
	}

	.your-turn-text {
		font-size: var(--font-size-sm);
		font-weight: 700;
		color: var(--color-primary);
		letter-spacing: 0.1em;
	}

	/* ── Actions ── */
	.actions {
		display: flex;
		justify-content: center;
		gap: var(--space-3);
		margin-top: var(--space-4);
	}

	.rate-practice {
		background: rgba(245, 158, 11, 0.12);
		color: #92400E;
		border: 1px solid rgba(245, 158, 11, 0.3);
	}
	.rate-practice:hover { background: rgba(245, 158, 11, 0.2); }

	.rate-mastered {
		background: rgba(16, 185, 129, 0.12);
		color: #065F46;
		border: 1px solid rgba(16, 185, 129, 0.3);
	}
	.rate-mastered:hover { background: rgba(16, 185, 129, 0.2); }

	/* ── Self-Explanation ── */
	.self-explain {
		margin-top: var(--space-6);
		padding: var(--space-4);
		background: rgba(63, 81, 181, 0.05);
		border: 1px solid rgba(63, 81, 181, 0.2);
		border-radius: var(--radius-md);
	}

	.self-explain-title {
		font-size: var(--font-size-xs);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #3F51B5;
		margin-bottom: var(--space-2);
	}

	.self-explain-question {
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: var(--space-3);
	}

	.self-explain-options {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.self-explain-btn {
		text-align: left;
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		cursor: pointer;
		font-size: var(--font-size-sm);
		color: var(--color-text);
		transition: all var(--transition-fast);
	}

	.self-explain-btn:hover {
		border-color: var(--color-primary);
		background: rgba(63, 81, 181, 0.08);
	}

	.self-explain-btn.correct {
		border-color: #10B981;
		background: rgba(16, 185, 129, 0.1);
	}

	.self-explain-btn.wrong {
		border-color: #EF4444;
		background: rgba(239, 68, 68, 0.06);
	}

	.self-explain-feedback {
		margin-top: var(--space-2);
		font-weight: 600;
		font-size: var(--font-size-sm);
	}
</style>
