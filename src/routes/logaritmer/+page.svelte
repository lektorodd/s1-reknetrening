<script lang="ts">
	import { onMount } from 'svelte';
	import { getStrings, type Lang } from '$lib/i18n';
	import { generateLogProblemBank, type LogProblem, type LogTopicId } from '$lib/modules/logarithm/generator';
	import type { ProblemStatus, ViewId } from '$lib/stores';
	import { saveProgress, saveLanguage } from '$lib/stores';
	import * as storage from '$lib/utils/storage';
	import { typesetMath } from '$lib/utils/mathjax';
	import {
		loadStudentModel, saveStudentModel,
		getSuccessRate, getDueCount,
		type StudentModel
	} from '$lib/engine/student-model';
	import { updateAfterAttempt } from '$lib/engine/spaced-repetition';

	import Header from '$lib/components/Header.svelte';
	import LogFadedProblemCard from '$lib/components/LogFadedProblemCard.svelte';
	import { LOG_THEORY } from '$lib/modules/logarithm/theory';
	import type { FadingLevel } from '$lib/engine/guidance-fading';

	// ── State ──
	let currentView = $state<ViewId>('dashboard');
	let language = $state<Lang>(storage.load<Lang>('language', 'nn'));
	let mode = $state<'focus' | 'mix'>('focus');
	let activeTopic = $state<LogTopicId>('log_product');
	let progress = $state<Record<number, ProblemStatus>>(storage.load('log_progress', {}));
	let hints = $state<number[]>(storage.load('log_hints', []));
	let activeProblems = $state<LogProblem[]>([]);
	let showSolution = $state<Record<number, boolean>>({});
	let filters = $state({ levels: [1, 2, 3, 4, 5], types: ['lg', 'ln'] as ('lg' | 'ln')[] });

	// ── Guided Practice State ──
	let currentGuidedStep = $state(0);
	let guidedPathIndex = $state(0);
	let showGuidedComplete = $state(false);
	const FADING_LEVELS: FadingLevel[] = [0, 1, 2, 3, 4];
	const DOT_LABELS = ['📖', '✏️¹', '✏️²', '✏️³', '🎯'];

	// ── Learning Engine ──
	let studentModel = $state<StudentModel>(loadStudentModel());

	// ── Problem Bank ──
	let problemBank = $state<LogProblem[]>([]);

	onMount(() => {
		problemBank = generateLogProblemBank();
		requestAnimationFrame(() => typesetMath());
	});

	// ── Derived ──
	const texts = $derived(getStrings(language));

	const logTopics: { id: LogTopicId; labelKey: keyof typeof texts }[] = [
		{ id: 'log_product', labelKey: 'topic_log_product' },
		{ id: 'log_quotient', labelKey: 'topic_log_quotient' },
		{ id: 'log_power', labelKey: 'topic_log_power' },
		{ id: 'log_simplify', labelKey: 'topic_log_simplify' },
		{ id: 'log_equation', labelKey: 'topic_log_equation' },
		{ id: 'exp_equation', labelKey: 'topic_exp_equation' }
	];

	// ── Navigation ──
	function navigateTo(view: ViewId) {
		currentView = view;
		requestAnimationFrame(() => typesetMath());
	}

	function changeLanguage(lang: Lang) {
		language = lang;
		saveLanguage(lang);
		requestAnimationFrame(() => typesetMath());
	}

	// ── Guided Practice ──
	const guidedTopicProblems = $derived.by(() => {
		return problemBank.filter(p => p.topic === activeTopic)
			.sort((a, b) => a.level - b.level);
	});

	const currentGuidedPath = $derived.by(() => {
		const all = guidedTopicProblems;
		if (all.length === 0) return [];
		const offset = (guidedPathIndex * 5) % all.length;
		const path: { problem: LogProblem; level: FadingLevel }[] = [];
		for (let i = 0; i < FADING_LEVELS.length; i++) {
			const idx = (offset + i) % all.length;
			path.push({ problem: all[idx], level: FADING_LEVELS[i] });
		}
		return path;
	});

	const currentGuidedCard = $derived.by(() => {
		if (currentGuidedPath.length === 0) return null;
		return currentGuidedPath[currentGuidedStep];
	});

	const guidedTotalSteps = $derived(currentGuidedPath.length);

	function goToGuidedStep(step: number) {
		if (step >= 0 && step < guidedTotalSteps) {
			currentGuidedStep = step;
			requestAnimationFrame(() => typesetMath());
		}
	}

	function nextGuidedPath() {
		guidedPathIndex++;
		currentGuidedStep = 0;
		showGuidedComplete = false;
		requestAnimationFrame(() => typesetMath());
	}

	function completeGuidedPath() {
		showGuidedComplete = true;
	}

	function changeGuidedTopic(topic: LogTopicId) {
		activeTopic = topic;
		currentGuidedStep = 0;
		guidedPathIndex = 0;
		showGuidedComplete = false;
		requestAnimationFrame(() => typesetMath());
	}

	function cycleToNextLogTopic() {
		const topicIds: LogTopicId[] = ['log_product', 'log_quotient', 'log_power', 'log_simplify', 'log_equation', 'exp_equation'];
		const idx = topicIds.indexOf(activeTopic);
		const next = topicIds[(idx + 1) % topicIds.length];
		changeGuidedTopic(next);
	}

	// ── Practice ──
	function drawProblems() {
		let candidates = problemBank.filter(
			(p) =>
				p.topic === activeTopic &&
				filters.levels.includes(p.level) &&
				filters.types.includes(p.type)
		);

		if (candidates.length === 0) {
			alert(texts.no_problems_found);
			return;
		}

		candidates.sort(() => 0.5 - Math.random());
		const selected = candidates.slice(0, 5);
		selected.sort((a, b) => a.level - b.level);
		activeProblems = selected;
		showSolution = {};
		requestAnimationFrame(() => typesetMath());
	}

	function startMix() {
		if (problemBank.length === 0) return;
		// Simple mix: random from all topics, weighted by confidence
		const shuffled = [...problemBank].sort(() => 0.5 - Math.random());
		activeProblems = shuffled.slice(0, 5).sort((a, b) => a.level - b.level);
		mode = 'mix';
		showSolution = {};
		requestAnimationFrame(() => typesetMath());
	}

	function rateProblem(id: number, status: ProblemStatus) {
		progress = { ...progress, [id]: status };
		storage.save('log_progress', progress);

		const problem = problemBank.find(p => p.id === id);
		if (problem) {
			updateAfterAttempt(studentModel, {
				conceptId: problem.topic,
				correct: status === 'mastered',
				hintUsed: hints.includes(id)
			});
			saveStudentModel(studentModel);
		}

		requestAnimationFrame(() => typesetMath());
	}

	function toggleHint(id: number) {
		if (hints.includes(id)) {
			hints = hints.filter(h => h !== id);
		} else {
			hints = [...hints, id];
		}
		storage.save('log_hints', hints);
	}

	function toggleSolution(id: number) {
		showSolution = { ...showSolution, [id]: !showSolution[id] };
		requestAnimationFrame(() => typesetMath());
	}

	// ── Stats ──
	$effect(() => {
		requestAnimationFrame(() => typesetMath());
	});
</script>

<svelte:head>
	<title>{texts.module_logarithm_name} · Mattetrening</title>
</svelte:head>

<Header
	{language}
	{currentView}
	onNavigate={navigateTo}
	onLanguageChange={changeLanguage}
	showBackLink={true}
/>

<main class="main-content">
	{#if currentView === 'dashboard'}
		<!-- Logarithm Dashboard -->
		<div class="log-dashboard">
			<h1 class="dash-title">{texts.module_logarithm_name}</h1>
			<p class="dash-subtitle">{texts.dash_subtitle}</p>

			<div class="dash-cards">
				<button class="dash-card" onclick={() => { mode = 'focus'; navigateTo('practice'); }}>
					<span class="card-icon">🎯</span>
					<h3>{texts.dash_focus_header}</h3>
					<p>{texts.dash_focus_desc}</p>
				</button>
				<button class="dash-card" onclick={() => { startMix(); navigateTo('practice'); }}>
					<span class="card-icon">🔀</span>
					<h3>{texts.mode_mix_title}</h3>
					<p>{texts.mode_mix_desc}</p>
				</button>
			</div>

			<div class="dash-cards">
				<button class="dash-card" onclick={() => navigateTo('guided')}>
					<span class="card-icon">✏️</span>
					<h3>{texts.dash_guided_header}</h3>
					<p>{texts.dash_guided_desc}</p>
				</button>
				<button class="dash-card" onclick={() => navigateTo('theory')}>
					<span class="card-icon">📚</span>
					<h3>{texts.nav_theory}</h3>
					<p>Dei tre setningane, forenkling og likningar.</p>
				</button>
			</div>
		</div>
	{:else if currentView === 'theory'}
		<!-- Logarithm Theory — one topic at a time -->
		<div class="theory-view">
			<h1 class="theory-title">{texts.nav_theory}</h1>

			<!-- Topic Selector Tabs -->
			<div class="topic-tabs">
				{#each logTopics as t}
					<button
						class="topic-tab"
						class:active={activeTopic === t.id}
						onclick={() => { activeTopic = t.id; requestAnimationFrame(() => typesetMath()); }}
					>
						{texts[t.labelKey]}
					</button>
				{/each}
			</div>

			{#each [LOG_THEORY[activeTopic]] as entry}
				{#if entry}
					{#key activeTopic}
					<div class="theory-content">
						<!-- 1. Title + Intro -->
						<div class="theory-section-card intro-card">
							<h2>{entry.title[language] || entry.title.nn}</h2>
							<p class="theory-intro-text">{entry.intro[language] || entry.intro.nn}</p>
						</div>

						<!-- 2. Pattern Recognition -->
						<div class="theory-section-card pattern-card">
							<h3 class="section-heading">{texts.theory_pattern}</h3>
							<p class="pattern-text">{entry.patternRecognition[language] || entry.patternRecognition.nn}</p>
						</div>

						<!-- 3. Think Aloud -->
						<div class="theory-section-card think-card">
							<h3 class="section-heading">{texts.theory_think_aloud}</h3>
							<div class="speech-bubble">
								<p>{entry.thinkAloud[language] || entry.thinkAloud.nn}</p>
							</div>
						</div>

						<!-- 4. Formula -->
						<div class="theory-section-card formula-card">
							<h3 class="section-heading">{texts.theory_formula}</h3>
							<div class="formula-display">$$ {entry.formula} $$</div>
							<p class="rule-badge">{entry.ruleText[language] || entry.ruleText.nn}</p>
						</div>

						<!-- 5. Worked Example -->
						<div class="theory-section-card worked-card">
							<h3 class="section-heading">{texts.theory_worked_example}</h3>
							<div class="theory-worked-steps">
								{#each entry.workedSteps as step, i}
									<div class="theory-worked-step">
										<div class="theory-step-num">{i + 1}</div>
										<div class="theory-step-body">
											<p class="theory-step-explain">{step.explanation[language] || step.explanation.nn}</p>
											<div class="theory-step-math">$${step.latex}$$</div>
										</div>
									</div>
								{/each}
							</div>
						</div>

						<!-- 6. Mnemonic -->
						<div class="theory-section-card mnemonic-card">
							<h3 class="section-heading">{texts.theory_mnemonic}</h3>
							<blockquote class="mnemonic-quote">{entry.mnemonic[language] || entry.mnemonic.nn}</blockquote>
						</div>
					</div>
					{/key}
				{/if}
			{/each}
		</div>
	{:else if currentView === 'guided'}
		<!-- Logarithm Guided Practice (Rettleia Øving) -->
		<section class="guided-view">
			<div class="guided-header">
				<h1 class="view-title">{texts.nav_guided}</h1>
				<p class="guided-subtitle">{texts.dash_guided_desc}</p>
			</div>

			<!-- Topic Tabs -->
			<div class="topic-tabs">
				{#each logTopics as t}
					<button
						class="topic-tab"
						class:active={activeTopic === t.id}
						onclick={() => changeGuidedTopic(t.id)}
					>
						{texts[t.labelKey]}
					</button>
				{/each}
			</div>

			{#if currentGuidedCard && !showGuidedComplete}
				<!-- Fading Level Dots -->
				<div class="fading-dots">
					{#each FADING_LEVELS as level, i}
						<button
							class="dot"
							class:active={currentGuidedStep === i}
							class:visited={i < currentGuidedStep}
							onclick={() => goToGuidedStep(i)}
							title="Level {level}"
						>
							<span class="dot-label">{DOT_LABELS[i]}</span>
						</button>
						{#if i < FADING_LEVELS.length - 1}
							<div class="dot-connector" class:active={i < currentGuidedStep}></div>
						{/if}
					{/each}
				</div>

				<div class="carousel-card">
					{#key `${currentGuidedCard.problem.id}-${currentGuidedCard.level}`}
						<LogFadedProblemCard
							problem={currentGuidedCard.problem}
							status={progress[currentGuidedCard.problem.id]}
							fadingLevel={currentGuidedCard.level}
							{texts}
							{language}
							onRate={rateProblem}
						/>
					{/key}
				</div>

				<!-- Navigation -->
				<div class="carousel-nav">
					<button
						class="nav-btn"
						disabled={currentGuidedStep === 0}
						onclick={() => goToGuidedStep(currentGuidedStep - 1)}
					>
						{texts.guided_more_support}
					</button>

					<span class="step-counter">
						{currentGuidedStep + 1} {texts.guided_problem_of} {guidedTotalSteps}
					</span>

					{#if currentGuidedStep < guidedTotalSteps - 1}
						<button
							class="nav-btn nav-btn-primary"
							onclick={() => goToGuidedStep(currentGuidedStep + 1)}
						>
							{texts.guided_less_support}
						</button>
					{:else}
						<button
							class="nav-btn nav-btn-primary"
							onclick={completeGuidedPath}
						>
							✓ {texts.guided_complete_title.replace(' 🎉', '')}
						</button>
					{/if}
				</div>

			{:else if showGuidedComplete}
				<!-- Completion Card -->
				<div class="completion-card">
					<div class="completion-icon">🎉</div>
					<h2 class="completion-title">{texts.guided_complete_title}</h2>
					<p class="completion-desc">{texts.guided_complete_desc}</p>

					<div class="completion-actions">
						<button class="action-card" onclick={nextGuidedPath}>
							<span class="action-icon">🔄</span>
							<span class="action-label">{texts.guided_new_round.replace('🔄 ', '')}</span>
							<span class="action-hint">{texts[logTopics.find(t => t.id === activeTopic)!.labelKey]}</span>
						</button>

						<button class="action-card" onclick={() => { startMix(); navigateTo('practice'); }}>
							<span class="action-icon">💪</span>
							<span class="action-label">{texts.guided_to_arena.replace('💪 ', '')}</span>
							<span class="action-hint">{texts.nav_practice}</span>
						</button>

						<button class="action-card" onclick={cycleToNextLogTopic}>
							<span class="action-icon">📚</span>
							<span class="action-label">{texts.guided_other_topic.replace('📚 ', '')}</span>
							<span class="action-hint">{(() => {
								const ids: LogTopicId[] = ['log_product', 'log_quotient', 'log_power', 'log_simplify', 'log_equation', 'exp_equation'];
								const next = ids[(ids.indexOf(activeTopic) + 1) % ids.length];
								const key = logTopics.find(t => t.id === next)!.labelKey;
								return texts[key];
							})()}</span>
						</button>
					</div>
				</div>

			{:else}
				<div class="empty-state">
					<p>{texts.no_problems_found}</p>
				</div>
			{/if}
		</section>
	{:else if currentView === 'practice'}
		<!-- Logarithm Practice -->
		<div class="log-view">
			<h2 class="view-title">{mode === 'mix' ? texts.practice_subtitle_mix : texts.nav_practice}</h2>

			{#if mode === 'focus'}
				<!-- Topic Selector -->
				<div class="topic-selector">
					<label class="filter-label">{texts.filter_rule}</label>
					<div class="topic-pills">
						{#each logTopics as t}
							<button
								class="pill"
								class:active={activeTopic === t.id}
								onclick={() => { activeTopic = t.id; activeProblems = []; }}
							>
								{texts[t.labelKey]}
							</button>
						{/each}
					</div>
				</div>

				<!-- Level Filter -->
				<div class="filter-row">
					<label class="filter-label">{texts.filter_levels}</label>
					<div class="filter-pills">
						{#each [1, 2, 3, 4, 5] as lvl}
							<button
								class="pill small"
								class:active={filters.levels.includes(lvl)}
								onclick={() => {
									if (filters.levels.includes(lvl)) {
										filters.levels = filters.levels.filter(l => l !== lvl);
									} else {
										filters.levels = [...filters.levels, lvl];
									}
								}}
							>
								{lvl}
							</button>
						{/each}
					</div>
				</div>

				<button class="btn-primary" onclick={drawProblems}>{texts.btn_draw_focus}</button>
			{:else}
				<button class="btn-primary" onclick={startMix}>{texts.btn_new_mix}</button>
			{/if}

			<!-- Problem List -->
			{#if activeProblems.length > 0}
				<div class="problems">
					{#each activeProblems as problem (problem.id)}
						<div class="problem-card" class:border-success={progress[problem.id] === 'mastered'} class:border-warning={progress[problem.id] === 'practice'}>
							<div class="problem-header">
								<div class="badges">
									{#if mode === 'mix'}
										<span class="problem-badge">{texts.label_mix}</span>
									{:else}
										<span class="problem-badge">{texts.label_level} {problem.level}</span>
										<span class="problem-type">{problem.type}</span>
									{/if}
								</div>
								{#if progress[problem.id] === 'mastered'}
									<span class="status-icon">✓</span>
								{/if}
							</div>
							<div class="problem-question">$$ {problem.q} $$</div>

							<!-- Action buttons: Hint + Show Solution -->
							<div class="actions">
								<button class="btn-hint" onclick={() => toggleHint(problem.id)}>
									💡 {hints.includes(problem.id) ? texts.btn_hide_hint : texts.btn_hint}
								</button>
								<button class="btn-solution" onclick={() => toggleSolution(problem.id)}>
									{showSolution[problem.id] ? texts.btn_hide : texts.btn_solution}
								</button>
							</div>

							<!-- Hint -->
							{#if hints.includes(problem.id)}
								<div class="hint-box">
									<div class="hint-label">{texts.hint_title}</div>
									<p>{problem.hint}</p>
								</div>
							{/if}

							<!-- Solution (revealed after clicking Vis Fasit) -->
							{#if showSolution[problem.id]}
								<div class="solution">
									<div class="answer">{problem.a}</div>
									{#each problem.structuredSteps as step}
										<div class="step-row">
											<span class="step-label">{step.label}:</span>
											<span class="step-latex">$$ {step.latex} $$</span>
										</div>
									{/each}
									{#if !progress[problem.id]}
										<div class="rating-buttons">
											<button class="btn-practice" onclick={() => rateProblem(problem.id, 'practice')}>
												{texts.btn_practice}
											</button>
											<button class="btn-mastered" onclick={() => rateProblem(problem.id, 'mastered')}>
												{texts.btn_mastered}
											</button>
										</div>
									{/if}
								</div>
							{/if}
						</div>
					{/each}
				</div>

				<div class="end-actions">
					<p>{mode === 'mix' ? texts.mix_end_text : texts.focus_end_text}</p>
					<button class="btn-primary" onclick={mode === 'mix' ? startMix : drawProblems}>
						{mode === 'mix' ? texts.btn_new_mix : texts.btn_new_focus}
					</button>
				</div>
			{/if}
		</div>
	{:else if currentView === 'stats'}
		<!-- Logarithm Stats -->
		<div class="log-view">
			<h2 class="view-title">{texts.nav_stats}</h2>
			<div class="stat-grid">
				<div class="stat-card">
					<span class="stat-value">{Object.keys(progress).length}</span>
					<span class="stat-label">{texts.stat_total_attempted}</span>
				</div>
				<div class="stat-card">
					<span class="stat-value">
						{#if Object.keys(progress).length > 0}
							{Math.round(Object.values(progress).filter(s => s === 'mastered').length / Object.keys(progress).length * 100)}%
						{:else}
							0%
						{/if}
					</span>
					<span class="stat-label">{texts.stat_mastery_rate}</span>
				</div>
			</div>

			<!-- Per-topic confidence -->
			<h3 class="sub-heading">{texts.stat_confidence_map}</h3>
			<div class="concept-grid">
				{#each logTopics as t}
					{@const concept = studentModel.concepts[t.id]}
					{#if concept}
						<div class="concept-cell" style="--conf: {concept.confidence}">
							<span class="concept-name">{texts[t.labelKey]}</span>
							<span class="concept-pct">
								{concept.timesCorrect + concept.timesIncorrect > 0
									? Math.round(concept.confidence * 100) + '%'
									: texts.stat_never_attempted}
							</span>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	{:else if currentView === 'help'}
		<div class="log-view">
			<h2 class="view-title">{texts.help_title}</h2>
			<div class="help-section">
				<h3>{texts.help_focus_title}</h3>
				<p>{texts.help_focus_desc}</p>
			</div>
			<div class="help-section">
				<h3>{texts.help_mix_title}</h3>
				<p>{texts.help_mix_desc}</p>
			</div>
			<div class="help-section">
				<h3>{texts.help_stats_title}</h3>
				<p>{texts.help_stats_desc}</p>
			</div>
		</div>
	{/if}
</main>

<style>
	.main-content { flex: 1; }

	.log-dashboard, .log-view {
		max-width: 900px;
		margin: 0 auto;
		padding: var(--space-6, 2rem) var(--space-4, 1rem);
	}

	.dash-title {
		font-size: clamp(1.5rem, 4vw, 2.5rem);
		font-weight: 800;
		margin: 0 0 var(--space-2, 0.5rem);
		color: var(--color-text, #1e293b);
	}

	.dash-subtitle {
		color: var(--color-text-secondary, #64748b);
		margin: 0 0 var(--space-6, 2rem);
	}

	.dash-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: var(--space-4, 1rem);
		margin-bottom: var(--space-4, 1rem);
	}

	.dash-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: var(--space-5, 1.5rem);
		background: var(--color-surface, white);
		border-radius: 24px;
		box-shadow: 0 2px 12px rgba(0,0,0,0.06);
		border: 2px solid transparent;
		cursor: pointer;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
		font-family: inherit;
	}

	.dash-card.wide {
		grid-column: 1 / -1;
	}

	.dash-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(0,0,0,0.08);
		border-color: var(--color-primary, #3F51B5);
	}

	.card-icon { font-size: 2rem; margin-bottom: var(--space-2, 0.5rem); }
	.dash-card h3 {
		margin: 0 0 var(--space-1, 0.25rem);
		font-size: var(--font-size-base, 1rem);
		color: var(--color-text, #1e293b);
	}
	.dash-card p {
		margin: 0;
		font-size: var(--font-size-sm, 0.875rem);
		color: var(--color-text-secondary, #64748b);
	}

	/* Theory View */
	.theory-view {
		max-width: 800px;
		margin: 0 auto;
		padding: var(--space-8, 3rem) var(--space-4, 1rem);
	}

	.theory-title {
		font-size: var(--font-size-2xl, 2rem);
		font-weight: 700;
		margin-bottom: var(--space-6, 2rem);
	}

	.theory-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-5, 1.5rem);
	}

	.theory-section-card {
		background: var(--color-surface, white);
		border-radius: 16px;
		padding: var(--space-6, 2rem);
		box-shadow: 0 1px 6px rgba(0,0,0,0.04);
	}

	.intro-card h2 {
		font-size: var(--font-size-2xl, 2rem);
		margin-bottom: var(--space-2, 0.5rem);
	}

	.theory-intro-text {
		color: var(--color-text-secondary, #64748b);
		line-height: 1.6;
	}

	.section-heading {
		font-size: var(--font-size-lg, 1.125rem);
		font-weight: 700;
		margin-bottom: var(--space-4, 1rem);
		color: var(--color-text, #1e293b);
	}

	/* Pattern Recognition — amber accent */
	.pattern-card {
		border-left: 4px solid #F59E0B;
		background: rgba(245, 158, 11, 0.04);
	}

	.pattern-text { line-height: 1.6; color: var(--color-text, #1e293b); }

	/* Think Aloud — primary accent */
	.think-card {
		border-left: 4px solid var(--color-primary, #3F51B5);
		background: rgba(63, 81, 181, 0.04);
	}

	.speech-bubble {
		padding: var(--space-5, 1.5rem);
		background: var(--color-surface, white);
		border-radius: 16px;
		border: 1px solid var(--color-border, #e2e8f0);
		font-style: italic;
		line-height: 1.7;
	}

	.speech-bubble p { margin: 0; }

	/* Formula */
	.formula-card { padding: var(--space-6, 2rem); }

	.formula-display {
		text-align: center;
		font-size: var(--font-size-xl, 1.5rem);
		padding: var(--space-6, 2rem);
		background: var(--color-bg, #f8fafc);
		border-radius: 12px;
		margin-bottom: var(--space-3, 0.75rem);
	}

	.rule-badge {
		display: inline-block;
		background: rgba(63, 81, 181, 0.08);
		color: var(--color-primary, #3F51B5);
		padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
		border-radius: 9999px;
		font-size: var(--font-size-sm, 0.875rem);
		font-weight: 600;
	}

	/* Worked Example — green accent */
	.worked-card {
		border-left: 4px solid #10B981;
		background: rgba(16, 185, 129, 0.04);
	}

	.theory-worked-steps { display: flex; flex-direction: column; gap: var(--space-4, 1rem); }
	.theory-worked-step { display: flex; gap: var(--space-4, 1rem); align-items: flex-start; }

	.theory-step-num {
		flex-shrink: 0;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #10B981;
		color: white;
		border-radius: 50%;
		font-weight: 700;
		font-size: var(--font-size-sm, 0.875rem);
	}

	.theory-step-body { flex: 1; }

	.theory-step-explain {
		font-size: var(--font-size-sm, 0.875rem);
		color: var(--color-text-secondary, #64748b);
		margin-bottom: var(--space-2, 0.5rem);
		line-height: 1.5;
	}

	.theory-step-math {
		padding: var(--space-3, 0.75rem);
		background: var(--color-surface, white);
		border-radius: 12px;
		border: 1px solid var(--color-border, #e2e8f0);
	}

	/* Mnemonic — blue accent */
	.mnemonic-card {
		border-left: 4px solid #3B82F6;
		background: rgba(59, 130, 246, 0.04);
	}

	.mnemonic-quote {
		font-size: var(--font-size-lg, 1.125rem);
		font-weight: 600;
		font-style: italic;
		color: var(--color-primary, #3F51B5);
		line-height: 1.6;
		margin: 0;
		padding: var(--space-4, 1rem);
		border-left: none;
	}

	/* Guided Practice (Carousel) */
	.guided-view {
		max-width: 900px;
		margin: 0 auto;
		padding: var(--space-6, 2rem) var(--space-4, 1rem);
	}

	.guided-header { margin-bottom: var(--space-6, 2rem); }

	.guided-subtitle {
		font-size: var(--font-size-base, 1rem);
		color: var(--color-text-secondary, #64748b);
		margin: var(--space-2, 0.5rem) 0 0;
	}

	.topic-tabs {
		display: flex;
		gap: var(--space-2, 0.5rem);
		margin-bottom: var(--space-6, 2rem);
		background: var(--color-bg, #f8fafc);
		padding: var(--space-1, 0.25rem);
		border-radius: 9999px;
		width: fit-content;
		flex-wrap: wrap;
	}

	.topic-tab {
		padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
		border: none;
		background: none;
		border-radius: 9999px;
		font-family: inherit;
		font-size: var(--font-size-sm, 0.875rem);
		font-weight: 600;
		color: var(--color-text-secondary, #64748b);
		cursor: pointer;
		transition: all 0.15s;
	}

	.topic-tab:hover { color: var(--color-primary, #3F51B5); }
	.topic-tab.active { background: var(--color-primary, #3F51B5); color: white; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }

	.fading-dots {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: var(--space-6, 2rem);
	}

	.dot {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		border: 2px solid var(--color-border, #e2e8f0);
		background: var(--color-surface, white);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s;
		font-family: inherit;
	}

	.dot:hover { border-color: var(--color-primary, #3F51B5); transform: scale(1.1); }
	.dot.active { border-color: var(--color-primary, #3F51B5); background: var(--color-primary, #3F51B5); box-shadow: 0 0 0 4px rgba(63, 81, 181, 0.15); }
	.dot.active .dot-label { filter: brightness(10); }
	.dot.visited { border-color: #10B981; background: rgba(16, 185, 129, 0.1); }
	.dot-label { font-size: 0.75rem; line-height: 1; }
	.dot-connector { width: 32px; height: 2px; background: var(--color-border, #e2e8f0); transition: background 0.15s; }
	.dot-connector.active { background: #10B981; }

	.carousel-card { margin-bottom: var(--space-4, 1rem); }

	.carousel-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4, 1rem);
		padding: var(--space-3, 0.75rem) 0;
	}

	.nav-btn {
		padding: var(--space-2, 0.5rem) var(--space-5, 1.5rem);
		border: 1px solid var(--color-border, #e2e8f0);
		background: var(--color-surface, white);
		border-radius: 9999px;
		font-family: inherit;
		font-size: var(--font-size-sm, 0.875rem);
		font-weight: 600;
		color: var(--color-text-secondary, #64748b);
		cursor: pointer;
		transition: all 0.15s;
	}

	.nav-btn:hover:not(:disabled) { border-color: var(--color-primary, #3F51B5); color: var(--color-primary, #3F51B5); }
	.nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
	.nav-btn-primary { background: var(--color-primary, #3F51B5); color: white; border-color: var(--color-primary, #3F51B5); }
	.nav-btn-primary:hover:not(:disabled) { background: var(--color-primary-dark, #303F9F); color: white; }

	.step-counter {
		font-size: var(--font-size-sm, 0.875rem);
		color: var(--color-text-muted, #94a3b8);
		font-weight: 500;
	}

	.empty-state { text-align: center; padding: var(--space-8, 3rem); color: var(--color-text-muted, #94a3b8); }

	.completion-card {
		text-align: center;
		padding: var(--space-8, 3rem) var(--space-6, 2rem);
		background: var(--color-surface, white);
		border-radius: 16px;
		border: 1px solid var(--color-border, #e2e8f0);
		box-shadow: 0 2px 12px rgba(0,0,0,0.06);
	}

	.completion-icon { font-size: 3rem; margin-bottom: var(--space-4, 1rem); }
	.completion-title { font-size: var(--font-size-xl, 1.5rem); font-weight: 700; margin-bottom: var(--space-2, 0.5rem); }
	.completion-desc { color: var(--color-text-secondary, #64748b); margin-bottom: var(--space-6, 2rem); }

	.completion-actions {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-4, 1rem);
	}

	.action-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2, 0.5rem);
		padding: var(--space-5, 1.5rem) var(--space-4, 1rem);
		background: var(--color-bg, #f8fafc);
		border: 1px solid var(--color-border, #e2e8f0);
		border-radius: 16px;
		cursor: pointer;
		transition: all 0.15s;
		font-family: inherit;
	}

	.action-card:hover { border-color: var(--color-primary, #3F51B5); background: rgba(63, 81, 181, 0.04); transform: translateY(-2px); box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
	.action-icon { font-size: 1.8rem; }
	.action-label { font-size: var(--font-size-sm, 0.875rem); font-weight: 700; color: var(--color-text, #1e293b); }
	.action-hint { font-size: var(--font-size-xs, 0.75rem); color: var(--color-text-muted, #94a3b8); }

	/* Practice */
	.topic-selector, .filter-row {
		margin-bottom: var(--space-3, 0.75rem);
	}

	.filter-label {
		display: block;
		font-size: var(--font-size-sm, 0.875rem);
		font-weight: 600;
		color: var(--color-text-secondary, #64748b);
		margin-bottom: var(--space-2, 0.5rem);
	}

	.topic-pills, .filter-pills {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2, 0.5rem);
	}

	.pill {
		padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
		border: 1px solid var(--color-border, #e2e8f0);
		border-radius: 9999px;
		background: var(--color-surface, white);
		cursor: pointer;
		font-family: inherit;
		font-size: var(--font-size-sm, 0.875rem);
		color: var(--color-text-secondary, #64748b);
		transition: all 0.15s ease;
	}

	.pill.small { padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem); }

	.pill.active {
		background: var(--color-primary, #3F51B5);
		color: white;
		border-color: var(--color-primary, #3F51B5);
	}

	.btn-primary {
		display: inline-block;
		padding: var(--space-3, 0.75rem) var(--space-6, 2rem);
		background: var(--color-primary, #3F51B5);
		color: white;
		border: none;
		border-radius: 9999px;
		font-family: inherit;
		font-size: var(--font-size-base, 1rem);
		font-weight: 600;
		cursor: pointer;
		transition: background 0.15s ease;
		margin: var(--space-3, 0.75rem) 0;
	}

	.btn-primary:hover { background: var(--color-primary-dark, #303F9F); }

	/* Problems */
	.problems {
		display: flex;
		flex-direction: column;
		gap: var(--space-4, 1rem);
		margin-top: var(--space-4, 1rem);
	}

	.problem-card {
		background: var(--color-surface, white);
		border: 1px solid var(--color-border, #e2e8f0);
		border-radius: 16px;
		padding: var(--space-4, 1rem) var(--space-5, 1.5rem);
		box-shadow: 0 1px 6px rgba(0,0,0,0.04);
		transition: border-color 0.2s;
	}

	.problem-card.border-success {
		border-left: 4px solid #10B981;
	}

	.problem-card.border-warning {
		border-left: 4px solid #F59E0B;
	}

	.problem-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-2, 0.5rem);
	}

	.badges {
		display: flex;
		gap: var(--space-2, 0.5rem);
	}

	.status-icon {
		font-size: var(--font-size-lg, 1.125rem);
		font-weight: 700;
		color: #10B981;
	}

	.problem-badge, .problem-type {
		font-size: var(--font-size-xs, 0.75rem);
		padding: 2px 8px;
		border-radius: 9999px;
		background: var(--color-bg, #f1f5f9);
		color: var(--color-text-secondary, #64748b);
	}

	.problem-question {
		font-size: 1.1em;
		text-align: center;
		padding: var(--space-3, 0.75rem) 0;
	}

	.actions {
		display: flex;
		justify-content: center;
		gap: var(--space-3, 0.75rem);
		margin-bottom: var(--space-2, 0.5rem);
	}

	.btn-hint, .btn-solution {
		font-size: var(--font-size-sm, 0.875rem);
		padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
		border: 1px solid var(--color-border, #e2e8f0);
		border-radius: 9999px;
		background: transparent;
		cursor: pointer;
		font-family: inherit;
		color: var(--color-text-secondary, #64748b);
		transition: background 0.15s;
	}

	.btn-solution {
		background: var(--color-primary, #3F51B5);
		color: white;
		border-color: var(--color-primary, #3F51B5);
	}

	.btn-hint:hover { background: var(--color-bg, #f1f5f9); }
	.btn-solution:hover { opacity: 0.9; }

	.hint-box {
		margin-top: var(--space-3, 0.75rem);
		background: #FFFBEB;
		border: 1px solid #FDE68A;
		border-radius: 12px;
		padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
	}

	.hint-label {
		font-size: var(--font-size-xs, 0.75rem);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #92400E;
		margin-bottom: var(--space-1, 0.25rem);
	}

	.hint-box p {
		font-size: var(--font-size-sm, 0.875rem);
		color: #78350F;
		margin: 0;
	}

	.solution {
		margin-top: var(--space-4, 1rem);
		padding-top: var(--space-4, 1rem);
		border-top: 1px solid var(--color-border, #e2e8f0);
	}

	.answer {
		text-align: center;
		font-size: var(--font-size-lg, 1.125rem);
		font-weight: 600;
		margin-bottom: var(--space-2, 0.5rem);
	}

	.solution h4 { margin: 0 0 var(--space-2, 0.5rem); font-size: var(--font-size-sm, 0.875rem); }

	.step-row {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: var(--space-1, 0.25rem) 0;
	}

	.step-label {
		font-size: var(--font-size-xs, 0.75rem);
		font-weight: 600;
		color: var(--color-text-secondary, #64748b);
	}

	.rating-buttons {
		display: flex;
		gap: var(--space-2, 0.5rem);
		margin-top: var(--space-3, 0.75rem);
	}

	.btn-mastered, .btn-practice {
		flex: 1;
		padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
		border: none;
		border-radius: 9999px;
		font-family: inherit;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.15s;
	}

	.btn-mastered { background: #10B981; color: white; }
	.btn-practice { background: #F59E0B; color: white; }
	.btn-mastered:hover, .btn-practice:hover { opacity: 0.9; }

	.end-actions {
		text-align: center;
		margin-top: var(--space-4, 1rem);
		color: var(--color-text-secondary, #64748b);
	}

	/* Stats */
	.stat-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: var(--space-3, 0.75rem);
		margin-bottom: var(--space-6, 2rem);
	}

	.stat-card {
		background: var(--color-surface, white);
		border-radius: 16px;
		padding: var(--space-4, 1rem);
		text-align: center;
	}

	.stat-value {
		display: block;
		font-size: 2rem;
		font-weight: 800;
		color: var(--color-primary, #3F51B5);
	}

	.stat-label {
		font-size: var(--font-size-sm, 0.875rem);
		color: var(--color-text-secondary, #64748b);
	}

	.sub-heading {
		font-size: var(--font-size-lg, 1.125rem);
		margin: var(--space-4, 1rem) 0 var(--space-3, 0.75rem);
	}

	.concept-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--space-2, 0.5rem);
	}

	.concept-cell {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
		border-radius: 12px;
		background: var(--color-surface, white);
		border-left: 4px solid hsl(calc(var(--conf, 0.5) * 120), 70%, 50%);
	}

	.concept-name { font-weight: 600; font-size: var(--font-size-sm, 0.875rem); }
	.concept-pct { font-size: var(--font-size-sm, 0.875rem); color: var(--color-text-secondary, #64748b); }

	/* Help */
	.help-section {
		background: var(--color-surface, white);
		border-radius: 16px;
		padding: var(--space-4, 1rem) var(--space-5, 1.5rem);
		margin-bottom: var(--space-3, 0.75rem);
	}

	.help-section h3 { margin: 0 0 var(--space-2, 0.5rem); }
	.help-section p { margin: 0; color: var(--color-text-secondary, #64748b); line-height: 1.6; }
</style>
