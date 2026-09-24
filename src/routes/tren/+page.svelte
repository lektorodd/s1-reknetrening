<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { afterNavigate, replaceState } from '$app/navigation';
	import SessionCard from '$lib/components/SessionCard.svelte';
	import TopicFilter from '$lib/components/TopicFilter.svelte';
	import {
		buildSession,
		DEFAULT_FILTER,
		filterBank,
		filterFromQuery,
		loadFilter,
		practicePath,
		restoreSession,
		saveFilter,
		SESSION_LENGTH,
		storeSession,
		theoryPath,
		type Session,
		type TrenFilter
	} from '$lib/engine/session';
	import { loadStudentModel, saveStudentModel, type StudentModel } from '$lib/engine/student-model';
	import { updateAfterAttempt } from '$lib/engine/spaced-repetition';
	import { conceptName, conceptTopic, getFullBank, getModuleForConcept } from '$lib/modules/registry';
	import type { Course } from '$lib/modules/types';
	import { load, remove, save } from '$lib/utils/storage';

	let model = $state<StudentModel | null>(null);
	let session = $state<Session | null>(null);
	let position = $state(0);
	let correctCount = $state(0);
	/** Concepts rated "Trong øving" this session, in the order they came up. */
	let missed = $state<string[]>([]);

	// The session in progress is saved after every card, so a reload carries on
	// where it left off. The filter is saved as well (see loadFilter), so drilling
	// integration by parts never turns into a logarithm problem next time.
	const SESSION_KEY = 'tren_session';

	let course = $state<Course | null>(DEFAULT_FILTER.course);
	let moduleId = $state<string | null>(null);
	let topic = $state<string | null>(null);
	let level = $state<number | null>(null);

	const current = $derived(
		session && position < session.cards.length ? session.cards[position] : null
	);
	const done = $derived(session !== null && position >= session.cards.length);

	/** What a screen reader hears when the card changes or the session ends. */
	const announcement = $derived.by(() => {
		if (!session) return '';
		if (done) return `Økt fullført. ${correctCount} av ${session.cards.length} sat.`;
		return `Oppgåve ${position + 1} av ${session.cards.length}`;
	});

	/** Up to three concepts to go on with, each with a way into practice and theory. */
	const toPractise = $derived(
		[...new Set(missed)].slice(0, 3).map((id) => {
			const mod = getModuleForConcept(id);
			const t = conceptTopic(id);
			return {
				id,
				name: conceptName(id),
				practice: mod ? `${base}${practicePath(mod.id, t)}` : null,
				theory: mod && t ? theoryPath(mod.id, t) : null
			};
		})
	);

	const filter = (): TrenFilter => ({ course, moduleId, topic, level });

	function useFilter(f: TrenFilter) {
		course = f.course;
		moduleId = f.moduleId;
		topic = f.topic;
		level = f.level;
	}

	/**
	 * On arrival — and on every later navigation to this page, which a link from
	 * the end of a session is. A filter in the address («Øv på dette» in the
	 * Lærebok, a row in Framgang) wins over the stored one and becomes the new
	 * stored one; the address is then tidied, so a reload resumes the session
	 * instead of asking for a new one.
	 */
	afterNavigate(() => {
		if (!model) {
			// Warm the bank before the first card so MathJax has content to typeset.
			getFullBank();
			model = loadStudentModel();
		}

		const asked = filterFromQuery(page.url.searchParams);
		if (asked) {
			useFilter(asked);
			saveFilter(asked);
			replaceState(`${base}/tren/`, {});
		} else if (session) {
			return;
		} else {
			useFilter(loadFilter());
		}

		const resumed = restoreSession(load<unknown>(SESSION_KEY, null), filter());
		if (resumed) {
			session = resumed.session;
			position = resumed.position;
			correctCount = resumed.correct;
			missed = resumed.missed;
		} else {
			start();
		}
	});

	/** Write the session's progress, or clear it once it is finished. */
	function persist() {
		if (!session) return;
		if (position >= session.cards.length) remove(SESSION_KEY);
		else save(SESSION_KEY, storeSession(session, filter(), position, correctCount, missed));
	}

	function start() {
		if (!model) return;
		session = buildSession(model, SESSION_LENGTH, filterBank(getFullBank(), filter()));
		position = 0;
		correctCount = 0;
		missed = [];
		persist();
	}

	function changeFilter(
		nextCourse: Course | null,
		nextModule: string | null,
		nextTopic: string | null,
		nextLevel: number | null
	) {
		// Changing the filter builds a new session. Half-way through one, that
		// used to throw away the cards already answered without a word.
		if (position > 0 && !done && !confirm('Byte av filter startar ei ny økt. Vil du det?')) return;
		useFilter({ course: nextCourse, moduleId: nextModule, topic: nextTopic, level: nextLevel });
		saveFilter(filter());
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
		else missed = [...missed, card.conceptId];
		position++;
		persist();
	}
</script>

<svelte:head><title>Tren – Mattetrening</title></svelte:head>

<h1 class="sr-only">Tren</h1>
<p class="sr-only" aria-live="polite">{announcement}</p>

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

		{#if toPractise.length > 0}
			<div class="next">
				<h2>Dette kan du øva meir på</h2>
				<ul>
					{#each toPractise as c (c.id)}
						<li>
							<span class="name">{c.name}</span>
							{#if c.practice}<a href={c.practice}>Øv meir</a>{/if}
							{#if c.theory}<a href={`${base}${c.theory}`}>Les</a>{/if}
						</li>
					{/each}
				</ul>
			</div>
		{:else}
			<p class="note">Alt sat — sterkt!</p>
		{/if}

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

	/* Where to go next: the concepts that needed practice, each one tap from
	   more of the same or from the page that explains it. */
	.next {
		text-align: left;
		padding: var(--space-4) var(--space-5);
		border: 1px solid var(--color-border);
		border-left: var(--accent-edge) solid var(--color-warning);
		border-radius: var(--radius-md);
		background: var(--color-surface);
	}

	.next h2 {
		margin: 0 0 var(--space-3);
		font-size: var(--font-size-base);
	}

	.next ul {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.next li {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-3);
	}

	.next .name {
		flex: 1;
		min-width: 10rem;
		font-weight: 600;
	}

	.done-actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--space-3);
	}
</style>
