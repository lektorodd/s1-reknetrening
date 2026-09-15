<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import SessionCard from '$lib/components/SessionCard.svelte';
	import TopicFilter from '$lib/components/TopicFilter.svelte';
	import { buildSession, SESSION_LENGTH, type Session } from '$lib/engine/session';
	import { loadStudentModel, saveStudentModel, type StudentModel } from '$lib/engine/student-model';
	import { updateAfterAttempt } from '$lib/engine/spaced-repetition';
	import { getFullBank } from '$lib/modules/registry';
	import type { Problem } from '$lib/modules/types';

	let model = $state<StudentModel | null>(null);
	let session = $state<Session | null>(null);
	let position = $state(0);
	let correctCount = $state(0);

	/** null on both means "let the engine choose", which is the default. */
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
		start();
	});

	/** The slice of the bank the current filter allows. */
	function filteredBank(): Problem[] {
		const bank = getFullBank();
		const [moduleId, topicId] = topic ? topic.split(':') : [null, null];

		const subset = bank.filter(
			(p) =>
				(moduleId === null || (p.moduleId === moduleId && p.topic === topicId)) &&
				(level === null || p.level === level)
		);

		// A filter matching nothing would end the session before it starts.
		return subset.length > 0 ? subset : bank;
	}

	function start() {
		if (!model) return;
		session = buildSession(model, SESSION_LENGTH, filteredBank());
		position = 0;
		correctCount = 0;
	}

	function changeFilter(nextTopic: string | null, nextLevel: number | null) {
		topic = nextTopic;
		level = nextLevel;
		start();
	}

	function handleAnswer(correct: boolean, hintUsed: boolean) {
		const card = current;
		if (!card || !model) return;

		updateAfterAttempt(model, { conceptId: card.conceptId, correct, hintUsed });
		saveStudentModel(model);

		if (correct) correctCount++;
		position++;
	}
</script>

<svelte:head><title>Tren – Mattetrening</title></svelte:head>

<TopicFilter {topic} {level} onChange={changeFilter} />

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
		background: var(--color-primary-50);
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
