<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import {
		loadStudentModel,
		getSuccessRate,
		getDueCount,
		getReviewBuckets,
		currentStreak,
		localISO,
		mastery,
		todayISO,
		type StudentModel
	} from '$lib/engine/student-model';
	import {
		MODULE_REGISTRY,
		conceptIdsForCourse,
		conceptName,
		conceptTopic,
		conceptTopLevel,
		getModuleConceptIds,
		getModuleForConcept,
		modulesForCourse
	} from '$lib/modules/registry';
	import {
		DEFAULT_FILTER,
		loadFilter,
		practicePath,
		saveFilter,
		setCourse,
		theoryPath,
		type TrenFilter
	} from '$lib/engine/session';
	import type { Course } from '$lib/modules/types';
	import CourseSwitch from '$lib/components/CourseSwitch.svelte';

	let model = $state<StudentModel | null>(null);
	let filter = $state<TrenFilter>({ ...DEFAULT_FILTER });

	onMount(() => {
		model = loadStudentModel();
		filter = loadFilter();
	});

	function chooseCourse(course: Course) {
		filter = setCourse(filter, course);
		saveFilter(filter);
	}

	const attempts = $derived(model?.totalAttempts ?? 0);

	/** The chosen course's concepts; every concept when the filter says "Alle kurs". */
	const scope = $derived(filter.course ? conceptIdsForCourse(filter.course) : undefined);

	/** Where a concept leads: more practice on its topic, and the page explaining it. */
	function linksFor(id: string) {
		const mod = getModuleForConcept(id);
		const topic = conceptTopic(id);
		const theory = mod && topic ? theoryPath(mod.id, topic) : null;
		return {
			practice: mod ? `${base}${practicePath(mod.id, topic)}` : null,
			theory: theory ? `${base}${theory}` : null
		};
	}

	/**
	 * Per-module rows for the chosen course, strongest first — only concepts the
	 * student has tried. Untried ones used to fill the page with «Ikkje prøvd»
	 * rows under half-full bars (the prior confidence is 0.5), eighteen of them
	 * integration rows for an S1 student. They are now one line with a way in.
	 */
	const groups = $derived.by(() => {
		if (!model) return [];
		const modules = filter.course ? modulesForCourse(filter.course) : MODULE_REGISTRY;
		return modules.map((mod) => {
			const all = getModuleConceptIds(mod.id)
				.map((id) => ({ id, concept: model!.concepts[id] }))
				.filter((r) => r.concept);
			const tried = all
				.filter((r) => r.concept.lastSeen > 0)
				.sort((a, b) => b.concept.confidence - a.concept.confidence)
				.map((r) => ({
					...r,
					name: conceptName(r.id),
					state: mastery(r.concept, conceptTopLevel(r.id)),
					...linksFor(r.id)
				}));
			return {
				id: mod.id,
				name: mod.name,
				color: mod.color,
				rows: tried,
				untried: all.length - tried.length,
				practice: `${base}${practicePath(mod.id)}`
			};
		});
	});

	const triedInScope = $derived(groups.some((g) => g.rows.length > 0));

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
	const buckets = $derived(model ? getReviewBuckets(model, scope) : null);
	const scheduleRows = $derived(
		buckets
			? [
					{ when: 'No', list: buckets.dueNow },
					{ when: 'I morgon', list: buckets.dueTomorrow },
					{ when: 'Denne veka', list: buckets.dueWeek }
				]
					.filter((r) => r.list.length > 0)
					.map((r) => ({
						when: r.when,
						items: r.list.map((c) => ({ id: c.conceptId, name: conceptName(c.conceptId), ...linksFor(c.conceptId) }))
					}))
			: []
	);
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
	<div class="course">
		<CourseSwitch course={filter.course} onChange={chooseCourse} />
	</div>

	<dl class="summary">
		<div>
			<dt>Dagar på rad</dt>
			<dd>{currentStreak(model)}</dd>
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
			<dd>{getDueCount(model, scope)}</dd>
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
		{#if !triedInScope}
			<div class="card empty">
				<p>Du har ikkje øvd på {filter.course ?? 'noko'} enno.</p>
				<a class="btn btn-primary" href={`${base}/tren/`}>Start ei økt</a>
			</div>
		{:else}
			{#each groups as group (group.id)}
				<h3 style="--accent: {group.color}">{group.name}</h3>
				{#if group.rows.length > 0}
					<ul class="concepts">
						{#each group.rows as row (row.id)}
							<li>
								<span class="concept-name">{row.name}</span>
								<span class="meter" style="--accent: {group.color}" aria-hidden="true">
									<span class="meter-fill" style="width: {row.concept.confidence * 100}%"></span>
								</span>
								<span class="concept-state">{row.state}</span>
								<span class="links">
									{#if row.practice}<a href={row.practice}>Øv</a>{/if}
									{#if row.theory}<a href={row.theory}>Les</a>{/if}
								</span>
							</li>
						{/each}
					</ul>
				{/if}
				{#if group.untried > 0}
					<p class="untried">
						{group.untried} konsept ikkje prøvde enno ·
						<a href={group.practice}>Øv på {group.name.toLowerCase()}</a>
					</p>
				{/if}
			{/each}
		{/if}
	</section>

	<section>
		<h2>Står for tur</h2>
		{#if scheduleRows.length === 0}
			<p class="muted">Ingenting forfell den næraste veka. Kom att i morgon.</p>
		{:else}
			<ul class="schedule">
				{#each scheduleRows as row (row.when)}
					<li>
						<strong>{row.when}:</strong>
						{#each row.items as item, i (item.id)}{#if i > 0},{' '}{/if}{#if item.practice}<a
									href={item.practice}>{item.name}</a
								>{:else}{item.name}{/if}{/each}
					</li>
				{/each}
			</ul>
		{/if}
	</section>
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

	.course {
		margin: 0 0 var(--space-6);
	}

	.concepts li {
		display: grid;
		grid-template-columns: minmax(8rem, 1fr) 2fr auto auto;
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

	/* Every row leads somewhere: practice on the topic, or the page explaining it. */
	.links {
		display: flex;
		gap: var(--space-1);
		font-size: var(--font-size-xs);
		font-weight: 600;
	}

	/* Stand-alone links, not words in a sentence, so they get a 24 px target. */
	.links a {
		display: inline-flex;
		align-items: center;
		min-height: 1.5rem;
		padding: 0 var(--space-2);
	}

	.untried {
		margin: var(--space-2) 0 0;
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
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
			grid-template-columns: 1fr auto auto;
		}

		.meter {
			grid-column: 1 / -1;
		}
	}
</style>
