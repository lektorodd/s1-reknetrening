<script lang="ts">
	import type { I18nStrings } from '$lib/i18n';
	import type { Problem } from '$lib/modules/derivative/types';
	import type { ProblemStatus } from '$lib/stores';
	import { getSuccessRate, getDueCount, type StudentModel } from '$lib/engine/student-model';
	import ConceptHeatmap from './ConceptHeatmap.svelte';
	import SessionHistoryChart from './SessionHistoryChart.svelte';
	import ReviewSchedule from './ReviewSchedule.svelte';

	interface Props {
		texts: I18nStrings;
		progress: Record<number, ProblemStatus>;
		problemBank: Problem[];
		hints: number[];
		studentModel: StudentModel;
		onPractice?: (conceptId: string) => void;
	}

	let { texts, progress, problemBank, hints, studentModel, onPractice }: Props = $props();

	const successRate = $derived(getSuccessRate(studentModel));
	const dueCount = $derived(getDueCount(studentModel));

	const stats = $derived(() => {
		let mastered = 0;
		let practice = 0;
		const attemptedIds: number[] = [];

		Object.entries(progress).forEach(([id, val]) => {
			if (val === 'mastered') mastered++;
			if (val === 'practice') practice++;
			attemptedIds.push(parseInt(id));
		});

		const total = problemBank.length;
		const attempted = mastered + practice;
		const masteryRate = attempted > 0 ? Math.round((mastered / attempted) * 100) : 0;
		const relevantHints = hints.filter((h) => attemptedIds.includes(h)).length;
		const hintRate = attempted > 0 ? Math.round((relevantHints / attempted) * 100) : 0;

		// Per-topic breakdown
		const topics = ['chain', 'product', 'quotient'] as const;
		const topicStats = topics.map((topic) => {
			const topicProblems = problemBank.filter((p) => p.topic === topic);
			const topicMastered = topicProblems.filter((p) => progress[p.id] === 'mastered').length;
			const topicPractice = topicProblems.filter((p) => progress[p.id] === 'practice').length;
			const topicTotal = topicProblems.length;
			const pct = topicTotal > 0 ? Math.round((topicMastered / topicTotal) * 100) : 0;
			return { topic, mastered: topicMastered, practice: topicPractice, total: topicTotal, pct };
		});

		// Per-level breakdown
		const levelStats = [1, 2, 3, 4, 5].map((level) => {
			const levelProblems = problemBank.filter((p) => p.level === level);
			const levelMastered = levelProblems.filter((p) => progress[p.id] === 'mastered').length;
			const levelPractice = levelProblems.filter((p) => progress[p.id] === 'practice').length;
			const levelTotal = levelProblems.length;
			const pct = levelTotal > 0 ? Math.round((levelMastered / levelTotal) * 100) : 0;
			return { level, mastered: levelMastered, practice: levelPractice, total: levelTotal, pct };
		});

		return {
			mastered,
			practice,
			attempted,
			total,
			masteryRate,
			hintRate,
			topicStats,
			levelStats
		};
	});

	const topicNames = $derived<Record<string, string>>({
		chain: texts.topic_chain,
		product: texts.topic_product,
		quotient: texts.topic_quotient
	});
</script>

<div class="stats-view animate-fade-in">
	<h1>{texts.nav_stats}</h1>

	<!-- Overview Cards -->
	<div class="stat-cards">
		<div class="card stat-card">
			<span class="stat-big">{stats().attempted}</span>
			<span class="stat-desc">{texts.stat_total_attempted}</span>
		</div>
		<div class="card stat-card">
			<span class="stat-big">{stats().masteryRate}%</span>
			<span class="stat-desc">{texts.stat_mastery_rate}</span>
		</div>
		<div class="card stat-card">
			<span class="stat-big">{successRate}%</span>
			<span class="stat-desc">{texts.stat_success_rate}</span>
		</div>
		<div class="card stat-card">
			<span class="stat-big">{stats().hintRate}%</span>
			<span class="stat-desc">{texts.stat_hint_usage}</span>
		</div>
	</div>

	<!-- Streak -->
	{#if studentModel.streakDays > 0}
		<div class="streak-badge">
			🔥 {studentModel.streakDays}-{texts.stat_streak.toLowerCase()}!
		</div>
	{/if}

	<!-- Concept Confidence Heatmap -->
	<ConceptHeatmap {texts} {studentModel} />

	<!-- Session History -->
	<SessionHistoryChart {texts} sessionHistory={studentModel.sessionHistory} />

	<!-- Review Schedule -->
	<ReviewSchedule {texts} {studentModel} {onPractice} />

	<!-- Mastery Donut (CSS-only) -->
	<div class="card chart-card">
		<h2>{texts.stat_chart_total}</h2>
		<div class="donut-container">
			<div
				class="donut"
				style="--mastered-pct: {stats().total > 0  ? (stats().mastered / stats().total) * 100 : 0}%;
				       --practice-pct: {stats().total > 0 ? (stats().practice / stats().total) * 100 : 0}%;"
			>
				<div class="donut-center">
					<span class="donut-number">{stats().total > 0 ? Math.round((stats().mastered / stats().total) * 100) : 0}%</span>
					<span class="donut-label">{texts.chart_mastered}</span>
				</div>
			</div>
			<div class="donut-legend">
				<div class="legend-item">
					<span class="legend-dot" style="background: var(--color-success)"></span>
					{texts.chart_mastered} ({stats().mastered})
				</div>
				<div class="legend-item">
					<span class="legend-dot" style="background: var(--color-warning)"></span>
					{texts.chart_practice} ({stats().practice})
				</div>
				<div class="legend-item">
					<span class="legend-dot" style="background: var(--color-border)"></span>
					{texts.chart_pending} ({stats().total - stats().mastered - stats().practice})
				</div>
			</div>
		</div>
	</div>

	<!-- Topic Breakdown -->
	<div class="card chart-card">
		<h2>{texts.stat_chart_topic}</h2>
		<div class="bar-chart">
			{#each stats().topicStats as ts}
				<div class="bar-row">
					<span class="bar-label">{topicNames[ts.topic] || ts.topic}</span>
					<div class="bar-track">
						<div class="bar-fill bar-mastered" style="width: {ts.total > 0 ? (ts.mastered / ts.total) * 100 : 0}%"></div>
						<div class="bar-fill bar-practice" style="width: {ts.total > 0 ? (ts.practice / ts.total) * 100 : 0}%; left: {ts.total > 0 ? (ts.mastered / ts.total) * 100 : 0}%;"></div>
					</div>
					<span class="bar-value">{ts.pct}%</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Level Breakdown -->
	<div class="card chart-card">
		<h2>{texts.stat_chart_level}</h2>
		<div class="bar-chart">
			{#each stats().levelStats as ls}
				<div class="bar-row">
					<span class="bar-label">{texts.label_level} {ls.level}</span>
					<div class="bar-track">
						<div class="bar-fill bar-mastered" style="width: {ls.total > 0 ? (ls.mastered / ls.total) * 100 : 0}%"></div>
						<div class="bar-fill bar-practice" style="width: {ls.total > 0 ? (ls.practice / ls.total) * 100 : 0}%; left: {ls.total > 0 ? (ls.mastered / ls.total) * 100 : 0}%;"></div>
					</div>
					<span class="bar-value">{ls.pct}%</span>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.stats-view {
		max-width: 800px;
		margin: 0 auto;
		padding: var(--space-8) var(--space-4);
	}

	.stats-view h1 {
		margin-bottom: var(--space-6);
	}

	/* Stat Cards */
	.stat-cards {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--space-4);
		margin-bottom: var(--space-6);
	}

	.stat-card {
		text-align: center;
		padding: var(--space-6);
	}

	.stat-big {
		display: block;
		font-size: var(--font-size-3xl);
		font-weight: 800;
		color: var(--color-primary);
	}

	.stat-desc {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		margin-top: var(--space-1);
		display: block;
	}

	.streak-badge {
		text-align: center;
		font-size: var(--font-size-lg);
		font-weight: 700;
		padding: var(--space-3);
		background: linear-gradient(135deg, #ff6b3520, #ff990020);
		border-radius: var(--radius-lg);
		margin-bottom: var(--space-4);
	}

	/* Chart Cards */
	.chart-card {
		margin-bottom: var(--space-6);
		padding: var(--space-6);
	}

	.chart-card h2 {
		font-size: var(--font-size-lg);
		margin-bottom: var(--space-6);
	}

	/* Donut */
	.donut-container {
		display: flex;
		align-items: center;
		gap: var(--space-8);
		justify-content: center;
	}

	.donut {
		width: 160px;
		height: 160px;
		border-radius: 50%;
		background: conic-gradient(
			var(--color-success) 0% var(--mastered-pct),
			var(--color-warning) var(--mastered-pct) calc(var(--mastered-pct) + var(--practice-pct)),
			var(--color-border) calc(var(--mastered-pct) + var(--practice-pct)) 100%
		);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.donut-center {
		width: 110px;
		height: 110px;
		background: var(--color-surface);
		border-radius: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.donut-number {
		font-size: var(--font-size-2xl);
		font-weight: 800;
		color: var(--color-text);
	}

	.donut-label {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
	}

	.donut-legend {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--font-size-sm);
		color: var(--color-text);
	}

	.legend-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	/* Bar Chart */
	.bar-chart {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.bar-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.bar-label {
		font-size: var(--font-size-sm);
		font-weight: 500;
		min-width: 120px;
		color: var(--color-text);
	}

	.bar-track {
		flex: 1;
		height: 16px;
		background: var(--color-primary-50);
		border-radius: var(--radius-full);
		position: relative;
		overflow: hidden;
	}

	.bar-fill {
		height: 100%;
		position: absolute;
		top: 0;
		transition: width var(--transition-slow);
	}

	.bar-mastered {
		background: var(--color-success);
		left: 0;
		border-radius: var(--radius-full) 0 0 var(--radius-full);
	}

	.bar-practice {
		background: var(--color-warning);
	}

	.bar-value {
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-text-muted);
		min-width: 40px;
		text-align: right;
	}

	@media (max-width: 640px) {
		.stat-cards {
			grid-template-columns: 1fr;
		}

		.donut-container {
			flex-direction: column;
		}

		.bar-label {
			min-width: 80px;
		}
	}
</style>
