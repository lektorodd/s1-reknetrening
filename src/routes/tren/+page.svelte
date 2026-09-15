<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import SessionCard from '$lib/components/SessionCard.svelte';
	import { buildSession, SESSION_LENGTH, type Session } from '$lib/engine/session';
	import type { Problem } from '$lib/modules/types';
	import { loadStudentModel, saveStudentModel, type StudentModel } from '$lib/engine/student-model';
	import { updateAfterAttempt } from '$lib/engine/spaced-repetition';
	import { getFullBank, getModule } from '$lib/modules/registry';

	let model = $state<StudentModel | null>(null);
	let session = $state<Session | null>(null);
	let position = $state(0);
	let correctCount = $state(0);
	let filterLabel = $state<string | null>(null);

	const current = $derived(session && position < session.cards.length ? session.cards[position] : null);
	const done = $derived(session !== null && position >= session.cards.length);

	onMount(() => {
		// Warm the bank before the first card so MathJax has content to typeset.
		getFullBank();
		start();
	});

	/**
	 * "Vel sjølv" narrows the session to one topic via query params. Read at
	 * mount rather than during load, so the route stays prerenderable.
	 */
	function filteredBank(): Problem[] {
		const params = new URLSearchParams(window.location.search);
		const moduleId = params.get('modul');
		const topic = params.get('emne');
		const level = Number(params.get('nivaa')) || null;

		if (!moduleId || !topic) {
			filterLabel = null;
			return getFullBank();
		}

		const mod = getModule(moduleId);
		const subset = getFullBank().filter(
			(p) => p.moduleId === moduleId && p.topic === topic && (level === null || p.level === level)
		);

		// A filter that matches nothing would end the session before it starts.
		if (subset.length === 0) {
			filterLabel = null;
			return getFullBank();
		}

		const topicName = mod?.topics.find((t) => t.id === topic)?.name ?? topic;
		filterLabel = level ? `${topicName} · nivå ${level}` : topicName;
		return subset;
	}

	function start() {
		const m = loadStudentModel();
		model = m;
		session = buildSession(m, SESSION_LENGTH, filteredBank());
		position = 0;
		correctCount = 0;
	}

	function handleAnswer(correct: boolean, hintUsed: boolean) {
		const card = current;
		if (!card || !model) return;

		updateAfterAttempt(model, { conceptId: card.conceptId, correct, hintUsed });
		saveStudentModel(model);

		if (correct) correctCount++;
		position++;
	}

	function moduleName(moduleId: string): string {
		return getModule(moduleId)?.name ?? moduleId;
	}
</script>

<svelte:head><title>Tren – Mattetrening</title></svelte:head>

{#if !session}
	<p class="loading">Set saman økta…</p>
{:else if current}
	<div class="progress-strip" aria-hidden="true">
		<div class="progress-fill" style="width: {(position / session.cards.length) * 100}%"></div>
	</div>

	<p class="context">
		{#if filterLabel}
			<span class="filter-tag">Vald: {filterLabel}</span>
		{/if}
		{moduleName(current.problem.moduleId)} · nivå {current.problem.level}
	</p>

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

	.context {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex-wrap: wrap;
		margin: 0 0 var(--space-3);
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	.filter-tag {
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-full);
		background: var(--color-primary-50);
		color: var(--color-primary-dark);
		font-weight: 600;
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
