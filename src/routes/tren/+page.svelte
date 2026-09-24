<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import SessionCard from '$lib/components/SessionCard.svelte';
	import TopicFilter from '$lib/components/TopicFilter.svelte';
	import {
		buildSession,
		DEFAULT_FILTER,
		filterBank,
		parseFilter,
		restoreSession,
		SESSION_LENGTH,
		storeSession,
		type Session,
		type TrenFilter
	} from '$lib/engine/session';
	import { loadStudentModel, saveStudentModel, type StudentModel } from '$lib/engine/student-model';
	import { updateAfterAttempt } from '$lib/engine/spaced-repetition';
	import { getFullBank } from '$lib/modules/registry';
	import type { Course } from '$lib/modules/types';
	import { load, remove, save } from '$lib/utils/storage';

	let model = $state<StudentModel | null>(null);
	let session = $state<Session | null>(null);
	let position = $state(0);
	let correctCount = $state(0);

	// The filter is saved, so drilling integration by parts never turns into a
	// logarithm problem the next time the page loads. The session in progress is
	// saved too, after every card, so a reload carries on where it left off.
	const FILTER_KEY = 'tren_filter';
	const SESSION_KEY = 'tren_session';

	let course = $state<Course | null>(DEFAULT_FILTER.course);
	let moduleId = $state<string | null>(null);
	let topic = $state<string | null>(null);
	let level = $state<number | null>(null);

	const current = $derived(
		session && position < session.cards.length ? session.cards[position] : null
	);
	const done = $derived(session !== null && position >= session.cards.length);

	onMount(() => {
		// Warm the bank before the first card so MathJax has content to typeset.
		getFullBank();
		model = loadStudentModel();

		const stored = parseFilter(load<unknown>(FILTER_KEY, DEFAULT_FILTER));
		course = stored.course;
		moduleId = stored.moduleId;
		topic = stored.topic;
		level = stored.level;

		const resumed = restoreSession(load<unknown>(SESSION_KEY, null), filter());
		if (resumed) {
			session = resumed.session;
			position = resumed.position;
			correctCount = resumed.correct;
		} else {
			start();
		}
	});

	const filter = (): TrenFilter => ({ course, moduleId, topic, level });

	/** Write the session's progress, or clear it once it is finished. */
	function persist() {
		if (!session) return;
		if (position >= session.cards.length) remove(SESSION_KEY);
		else save(SESSION_KEY, storeSession(session, filter(), position, correctCount));
	}

	function start() {
		if (!model) return;
		session = buildSession(model, SESSION_LENGTH, filterBank(getFullBank(), filter()));
		position = 0;
		correctCount = 0;
		persist();
	}

	function changeFilter(
		nextCourse: Course | null,
		nextModule: string | null,
		nextTopic: string | null,
		nextLevel: number | null
	) {
		course = nextCourse;
		moduleId = nextModule;
		topic = nextTopic;
		level = nextLevel;
		save<TrenFilter>(FILTER_KEY, filter());
		start();
	}

	function handleAnswer(correct: boolean, hintUsed: boolean) {
		const card = current;
		if (!card || !model) return;

		updateAfterAttempt(model, {
			conceptId: card.conceptId,
			correct,
			hintUsed,
			level: card.problem.level
		});
		saveStudentModel(model);

		if (correct) correctCount++;
		position++;
		persist();
	}
</script>

<svelte:head><title>Tren – Mattetrening</title></svelte:head>

<TopicFilter {course} {moduleId} {topic} {level} onChange={changeFilter} />

{#if !session}
	<p class="loading">Set saman økta…</p>
{:else if current}
	<div class="progress-strip" aria-hidden="true">
		<div class="progress-fill" style="width: {(position / session.cards.length) * 100}%"></div>
	</div>

	{#key current.problem.id}
		<SessionCard
			card={current}
			index={position}
			total={session.cards.length}
			onAnswer={handleAnswer}
		/>
	{/key}
{:else if done}
	<section class="card done">
		<h1>Økt fullført</h1>
		<p class="score">{correctCount} av {session.cards.length} sat</p>
		<p class="note">
			Kjem du att i morgon, veit appen kva du treng å repetere. Jamn øving slår lange økter.
		</p>
		<div class="done-actions">
			<button class="btn btn-primary" onclick={start}>Ei økt til</button>
			<a class="btn btn-secondary" href={`${base}/framgang/`}>Sjå framgang</a>
			<a class="btn btn-ghost" href={`${base}/`}>Ferdig for i dag</a>
		</div>
	</section>
{/if}

<style>
	.loading {
		text-align: center;
		color: var(--color-text-secondary);
	}

	.progress-strip {
		height: 6px;
		border-radius: var(--radius-full);
		background: var(--color-line-strong);
		overflow: hidden;
		margin-bottom: var(--space-4);
	}

	.progress-fill {
		height: 100%;
		background: var(--color-primary);
		transition: width var(--transition-base);
	}

	.done {
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.done h1 {
		margin: 0;
		font-size: var(--font-size-2xl);
	}

	.score {
		margin: 0;
		font-size: var(--font-size-3xl);
		font-weight: 700;
		color: var(--color-primary);
	}

	.note {
		margin: 0;
		color: var(--color-text-secondary);
	}

	.done-actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--space-3);
	}
</style>
