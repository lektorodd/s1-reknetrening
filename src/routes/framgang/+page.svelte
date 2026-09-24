<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import {
		loadStudentModel,
		getSuccessRate,
		getDueCount,
		getReviewBuckets,
		localISO,
		todayISO,
		type StudentModel
	} from '$lib/engine/student-model';
	import { MODULE_REGISTRY, conceptName, getModuleConceptIds } from '$lib/modules/registry';

	let model = $state<StudentModel | null>(null);

	onMount(() => {
		model = loadStudentModel();
	});

	const attempts = $derived(model?.totalAttempts ?? 0);

	/** Per-module concept rows, strongest first. */
	const groups = $derived.by(() => {
		if (!model) return [];
		return MODULE_REGISTRY.map((mod) => ({
			name: mod.name,
			color: mod.color,
			rows: getModuleConceptIds(mod.id)
				.map((id) => ({
					id,
					name: conceptName(id),
					concept: model!.concepts[id]
				}))
				.filter((r) => r.concept)
				.sort((a, b) => b.concept.confidence - a.concept.confidence)
		})).filter((g) => g.rows.length > 0);
	});

	/** The last 7 days, oldest first — days with no activity render as gaps. */
	const week = $derived.by(() => {
		const history = model?.sessionHistory ?? [];
		const byDate = new Map(history.map((e) => [e.date, e]));
		const days: { date: string; label: string; total: number; correct: number }[] = [];

		for (let i = 6; i >= 0; i--) {
			const d = new Date();
			d.setDate(d.getDate() - i);
			// Local date, matching how sessions are recorded. The UTC date labelled the
			// bars with the wrong weekday between midnight and 01/02, and on the night
			// the clocks go forward it gave two days the same key, which made the
			// keyed {#each} below throw.
			const iso = localISO(d);
			const entry = byDate.get(iso);
			days.push({
				date: iso,
				label: ['sø', 'må', 'ty', 'on', 'to', 'fr', 'la'][d.getDay()],
				total: entry ? entry.correct + entry.incorrect : 0,
				correct: entry?.correct ?? 0
			});
		}
		return days;
	});

	const weekMax = $derived(Math.max(1, ...week.map((d) => d.total)));
	const buckets = $derived(model ? getReviewBuckets(model) : null);

	function confidenceLabel(c: number): string {
		if (c >= 0.8) return 'Sit';
		if (c >= 0.6) return 'På veg';
		if (c >= 0.4) return 'Usikker';
		return 'Treng øving';
	}
</script>

<svelte:head><title>Framgang – Mattetrening</title></svelte:head>

<h1>Framgang</h1>

{#if !model}
	<p class="muted">Hentar…</p>
{:else if attempts === 0}
	<section class="card empty">
		<p>Du har ikkje trena enno, så det er ingenting å vise her.</p>
		<a class="btn btn-primary" href={`${base}/tren/`}>Start første økt</a>
	</section>
{:else}
	<dl class="summary">
		<div>
			<dt>Dagar på rad</dt>
			<dd>{model.streakDays}</dd>
		</div>
		<div>
			<dt>Oppgåver</dt>
			<dd>{attempts}</dd>
		</div>
		<div>
			<dt>Treffsikkerheit</dt>
			<dd>{getSuccessRate(model)}%</dd>
		</div>
		<div>
			<dt>Til repetisjon</dt>
			<dd>{getDueCount(model)}</dd>
		</div>
	</dl>

	<section>
		<h2>Siste sju dagar</h2>
		<div class="week">
			{#each week as day (day.date)}
				<div class="day" class:today={day.date === todayISO()}>
					<div class="bar-track" title="{day.total} oppgåver">
						{#if day.total > 0}
							<div class="bar" style="height: {(day.total / weekMax) * 100}%"></div>
						{/if}
					</div>
					<span class="day-label">{day.label}</span>
				</div>
			{/each}
		</div>
	</section>

	<section>
		<h2>Kva du kan</h2>
		{#each groups as group (group.name)}
			<h3 style="--accent: {group.color}">{group.name}</h3>
			<ul class="concepts">
				{#each group.rows as row (row.id)}
					<li>
						<span class="concept-name">{row.name}</span>
						<span class="meter" style="--accent: {group.color}">
							<span class="meter-fill" style="width: {row.concept.confidence * 100}%"></span>
						</span>
						<span class="concept-state">
							{row.concept.lastSeen === 0 ? 'Ikkje prøvd' : confidenceLabel(row.concept.confidence)}
						</span>
					</li>
				{/each}
			</ul>
		{/each}
	</section>

	{#if buckets}
		<section>
			<h2>Står for tur</h2>
			{#if buckets.dueNow.length === 0 && buckets.dueTomorrow.length === 0 && buckets.dueWeek.length === 0}
				<p class="muted">Ingenting forfell den næraste veka. Kom att i morgon.</p>
			{:else}
				<ul class="schedule">
					{#if buckets.dueNow.length > 0}
						<li><strong>No:</strong> {buckets.dueNow.map((c) => conceptName(c.conceptId)).join(', ')}</li>
					{/if}
					{#if buckets.dueTomorrow.length > 0}
						<li><strong>I morgon:</strong> {buckets.dueTomorrow.map((c) => conceptName(c.conceptId)).join(', ')}</li>
					{/if}
					{#if buckets.dueWeek.length > 0}
						<li><strong>Denne veka:</strong> {buckets.dueWeek.map((c) => conceptName(c.conceptId)).join(', ')}</li>
					{/if}
				</ul>
			{/if}
		</section>
	{/if}
{/if}

<style>
	h1 {
		margin: 0 0 var(--space-6);
		font-size: var(--font-size-3xl);
	}

	h2 {
		margin: 0 0 var(--space-4);
		font-size: var(--font-size-lg);
	}

	h3 {
		margin: var(--space-5) 0 var(--space-2);
		padding-left: var(--space-3);
		border-left: 3px solid var(--accent);
		font-size: var(--font-size-base);
	}

	section {
		margin-bottom: var(--space-10);
	}

	.muted {
		color: var(--color-text-secondary);
	}

	.empty {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-4);
	}

	.summary {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
		gap: var(--space-4);
		margin: 0 0 var(--space-10);
	}

	.summary div {
		padding: var(--space-4);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		text-align: center;
	}

	.summary dt {
		font-size: var(--font-size-xs);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-text-muted);
	}

	.summary dd {
		margin: var(--space-1) 0 0;
		font-size: var(--font-size-2xl);
		font-weight: 700;
	}

	.week {
		display: flex;
		align-items: flex-end;
		gap: var(--space-2);
		height: 7rem;
	}

	.day {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
		height: 100%;
	}

	/* A warm rail behind the bars; the blue belongs to what is filled. */
	.bar-track {
		flex: 1;
		width: 100%;
		display: flex;
		align-items: flex-end;
		border-radius: var(--radius-sm);
		background: var(--color-line);
	}

	.bar {
		width: 100%;
		min-height: 4px;
		border-radius: var(--radius-sm);
		background: var(--color-primary);
	}

	.day-label {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
	}

	.day.today .day-label {
		color: var(--color-primary);
		font-weight: 700;
	}

	.concepts {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.concepts li {
		display: grid;
		grid-template-columns: minmax(8rem, 1fr) 2fr auto;
		align-items: center;
		gap: var(--space-3);
		font-size: var(--font-size-sm);
	}

	.meter {
		height: 8px;
		border-radius: var(--radius-full);
		background: var(--color-border);
		overflow: hidden;
	}

	.meter-fill {
		display: block;
		height: 100%;
		border-radius: var(--radius-full);
		background: var(--accent);
	}

	.concept-state {
		color: var(--color-text-secondary);
		font-size: var(--font-size-xs);
		white-space: nowrap;
	}

	.schedule {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	@media (max-width: 560px) {
		.concepts li {
			grid-template-columns: 1fr auto;
		}

		.meter {
			grid-column: 1 / -1;
		}
	}
</style>
