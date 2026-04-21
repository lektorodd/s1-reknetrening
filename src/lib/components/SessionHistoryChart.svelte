<script lang="ts">
	import type { I18nStrings } from '$lib/i18n';
	import type { SessionEntry } from '$lib/engine/student-model';

	interface Props {
		texts: I18nStrings;
		sessionHistory: SessionEntry[];
	}

	let { texts, sessionHistory }: Props = $props();

	// Day labels (locale-independent short names)
	const dayLabels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

	const chartData = $derived(() => {
		// Build last 7 days
		const days: { label: string; correct: number; incorrect: number; date: string }[] = [];
		const today = new Date();

		for (let i = 6; i >= 0; i--) {
			const d = new Date(today);
			d.setDate(d.getDate() - i);
			const iso = d.toISOString().slice(0, 10);
			const dayOfWeek = d.getDay(); // 0=Sun
			const labelIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Mon=0
			const entry = sessionHistory.find(e => e.date === iso);

			days.push({
				label: dayLabels[labelIdx],
				correct: entry?.correct ?? 0,
				incorrect: entry?.incorrect ?? 0,
				date: iso
			});
		}

		const maxTotal = Math.max(1, ...days.map(d => d.correct + d.incorrect));
		return { days, maxTotal };
	});
</script>

<div class="card chart-card">
	<h2>{texts.stat_session_history}</h2>

	<div class="session-chart">
		{#each chartData().days as day}
			{@const total = day.correct + day.incorrect}
			{@const correctPct = chartData().maxTotal > 0 ? (day.correct / chartData().maxTotal) * 100 : 0}
			{@const incorrectPct = chartData().maxTotal > 0 ? (day.incorrect / chartData().maxTotal) * 100 : 0}
			<div class="bar-column">
				<div class="bar-wrapper">
					{#if total > 0}
						<div
							class="bar-segment bar-incorrect"
							style="height: {incorrectPct}%"
						></div>
						<div
							class="bar-segment bar-correct"
							style="height: {correctPct}%"
						></div>
					{:else}
						<div class="bar-empty"></div>
					{/if}
				</div>
				<span class="bar-day-label">{day.label}</span>
				{#if total > 0}
					<span class="bar-count">{total}</span>
				{/if}
			</div>
		{/each}
	</div>

	<div class="chart-legend">
		<div class="legend-item">
			<span class="legend-dot" style="background: var(--color-success)"></span>
			<span>✅</span>
		</div>
		<div class="legend-item">
			<span class="legend-dot" style="background: var(--color-error, #ef4444)"></span>
			<span>❌</span>
		</div>
	</div>
</div>

<style>
	.session-chart {
		display: flex;
		gap: var(--space-3);
		align-items: flex-end;
		justify-content: center;
		height: 160px;
		padding: var(--space-4) 0;
	}

	.bar-column {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 1;
		max-width: 48px;
		gap: var(--space-1);
	}

	.bar-wrapper {
		width: 100%;
		height: 120px;
		display: flex;
		flex-direction: column-reverse;
		align-items: stretch;
		border-radius: var(--radius-sm) var(--radius-sm) 0 0;
		overflow: hidden;
	}

	.bar-segment {
		width: 100%;
		transition: height 0.4s ease;
		min-height: 0;
	}

	.bar-correct {
		background: var(--color-success);
		border-radius: var(--radius-sm) var(--radius-sm) 0 0;
	}

	.bar-incorrect {
		background: var(--color-error, #ef4444);
	}

	.bar-empty {
		width: 100%;
		height: 4px;
		background: var(--color-border);
		border-radius: var(--radius-sm);
		opacity: 0.4;
	}

	.bar-day-label {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		font-weight: 500;
	}

	.bar-count {
		font-size: 0.65rem;
		color: var(--color-text-muted);
		font-weight: 600;
	}

	.chart-legend {
		display: flex;
		justify-content: center;
		gap: var(--space-6);
		margin-top: var(--space-2);
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--font-size-sm);
		color: var(--color-text);
	}

	.legend-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	@media (max-width: 640px) {
		.session-chart {
			height: 120px;
			gap: var(--space-2);
		}
		.bar-wrapper {
			height: 80px;
		}
	}
</style>
