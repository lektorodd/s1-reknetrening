<script lang="ts">
	import type { I18nStrings } from '$lib/i18n';
	import type { Problem } from '$lib/modules/derivative/types';
	import type { ProblemStatus, ViewId } from '$lib/stores';
	import { getDueCount, getSuccessRate, type StudentModel } from '$lib/engine/student-model';

	interface Props {
		texts: I18nStrings;
		progress: Record<number, ProblemStatus>;
		problemBank: Problem[];
		studentModel: StudentModel;
		onNavigate: (view: ViewId) => void;
		onStartMix: () => void;
		onStartFocus: () => void;
	}

	let { texts, progress, problemBank, studentModel, onNavigate, onStartMix, onStartFocus }: Props = $props();

	const dueCount = $derived(getDueCount(studentModel));
	const successRate = $derived(getSuccessRate(studentModel));

	const stats = $derived(() => {
		let mastered = 0;
		let practice = 0;
		Object.values(progress).forEach((v) => {
			if (v === 'mastered') mastered++;
			if (v === 'practice') practice++;
		});
		const total = problemBank.length;
		const attempted = mastered + practice;
		const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;
		return { mastered, practice, attempted, total, pct };
	});
</script>

<div class="dashboard animate-fade-in">
	<div class="welcome-section">
		<h1>{texts.dash_welcome}</h1>
		<p>{texts.dash_subtitle}</p>
	</div>

	<!-- Quick Stats -->
	{#if stats().attempted > 0}
		<div class="quick-stats">
			<div class="stat-pill">
				<span class="stat-number">{stats().mastered}</span>
				<span class="stat-label">{texts.chart_mastered}</span>
			</div>
			<div class="stat-pill">
				<span class="stat-number">{stats().practice}</span>
				<span class="stat-label">{texts.chart_practice}</span>
			</div>
			<div class="stat-pill">
				<span class="stat-number">{stats().pct}%</span>
				<span class="stat-label">{texts.stat_mastery_rate}</span>
			</div>
			{#if dueCount > 0}
				<div class="stat-pill">
					<span class="stat-number">{dueCount}</span>
					<span class="stat-label">{texts.stat_due_review}</span>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Mode Cards -->
	<div class="mode-cards">
		<button class="card card-featured card-interactive mode-card" onclick={onStartMix}>
			<div class="mode-icon">🧠</div>
			<h2>{texts.mode_mix_title}</h2>
			<p>{texts.mode_mix_desc}</p>
			<span class="card-action">{texts.btn_start_mix} →</span>
		</button>

		<button class="card card-interactive mode-card guided-card" onclick={() => onNavigate('guided')}>
			<div class="mode-icon">✏️</div>
			<h2>{texts.dash_guided_header}</h2>
			<p>{texts.dash_guided_desc}</p>
			<span class="card-action">{texts.dash_guided_link}</span>
		</button>

		<button class="card card-interactive mode-card" onclick={onStartFocus}>
			<div class="mode-icon">🎯</div>
			<h2>{texts.dash_focus_header}</h2>
			<p>{texts.dash_focus_desc}</p>
			<span class="card-action">{texts.btn_start_focus} →</span>
		</button>
	</div>

	<!-- Quick Links -->
	<div class="quick-links">
		<button class="card card-interactive quick-card" onclick={() => onNavigate('theory')}>
			<span class="quick-icon">📚</span>
			<span class="quick-label">{texts.nav_theory}</span>
		</button>
		<button class="card card-interactive quick-card" onclick={() => onNavigate('stats')}>
			<span class="quick-icon">📊</span>
			<span class="quick-label">{texts.nav_stats}</span>
		</button>
	</div>
</div>

<style>
	.dashboard {
		max-width: 800px;
		margin: 0 auto;
		padding: var(--space-8) var(--space-4);
	}

	.welcome-section {
		text-align: center;
		margin-bottom: var(--space-8);
	}

	.welcome-section h1 {
		font-size: var(--font-size-3xl);
		margin-bottom: var(--space-2);
	}

	/* Quick Stats */
	.quick-stats {
		display: flex;
		justify-content: center;
		gap: var(--space-4);
		margin-bottom: var(--space-8);
	}

	.stat-pill {
		display: flex;
		flex-direction: column;
		align-items: center;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-4) var(--space-6);
		min-width: 100px;
	}

	.stat-number {
		font-size: var(--font-size-2xl);
		font-weight: 700;
		color: var(--color-primary);
	}

	.stat-label {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		margin-top: var(--space-1);
	}

	/* Mode Cards */
	.mode-cards {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-6);
		margin-bottom: var(--space-8);
	}

	.mode-card {
		text-align: left;
		font-family: var(--font-family);
		width: 100%;
	}

	.mode-icon {
		font-size: 2.5rem;
		margin-bottom: var(--space-3);
	}

	.mode-card h2 {
		margin-bottom: var(--space-2);
		font-size: var(--font-size-xl);
	}

	.mode-card p {
		margin-bottom: var(--space-4);
		font-size: var(--font-size-sm);
	}

	.card-action {
		font-size: var(--font-size-sm);
		font-weight: 700;
		color: var(--color-primary);
	}

	.card-featured .card-action {
		color: rgba(255, 255, 255, 0.9);
	}

	/* Quick Links */
	.quick-links {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-4);
	}

	.quick-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-6) var(--space-4);
		text-align: center;
		font-family: var(--font-family);
		width: 100%;
	}

	.quick-icon {
		font-size: 1.5rem;
	}

	.quick-label {
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-text);
	}

	@media (max-width: 640px) {
		.mode-cards {
			grid-template-columns: 1fr;
		}

		.quick-stats {
			flex-wrap: wrap;
		}
	}
</style>
