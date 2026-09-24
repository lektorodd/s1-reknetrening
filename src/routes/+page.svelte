<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import {
		loadStudentModel,
		getDueCount,
		getSuccessRate,
		currentStreak,
		todayISO,
		type StudentModel
	} from '$lib/engine/student-model';

	let model = $state<StudentModel | null>(null);

	onMount(() => {
		model = loadStudentModel();
	});

	const dueCount = $derived(model ? getDueCount(model) : 0);
	const streak = $derived(model ? currentStreak(model) : 0);
	const attempts = $derived(model?.totalAttempts ?? 0);
	const successRate = $derived(model ? getSuccessRate(model) : 0);
	const trainedToday = $derived(model?.lastActiveDate === todayISO());

	const headline = $derived.by(() => {
		if (attempts === 0) return 'Klar for første økt?';
		if (trainedToday) return 'Du har trena i dag.';
		if (dueCount > 0) return `${dueCount} ${dueCount === 1 ? 'emne' : 'emne'} ventar på repetisjon.`;
		return 'Klar for ei ny økt?';
	});
</script>

<svelte:head><title>Mattetrening</title></svelte:head>

<section class="hero">
	<p class="eyebrow">Dagens økt</p>
	<h1>{headline}</h1>
	<p class="lede">Ti oppgåver, blanda på tvers av emne og tilpassa nivået ditt.</p>

	<a class="btn btn-primary btn-lg start" href={`${base}/tren/`}>
		{trainedToday ? 'Tren meir' : 'Start økta'}
	</a>

	{#if attempts > 0}
		<dl class="stats">
			<div>
				<dt>Dagar på rad</dt>
				<dd>{streak}</dd>
			</div>
			<div>
				<dt>Til repetisjon</dt>
				<dd>{dueCount}</dd>
			</div>
			<div>
				<dt>Treffsikkerheit</dt>
				<dd>{successRate}%</dd>
			</div>
		</dl>
	{/if}
</section>

<nav class="elsewhere" aria-label="Andre delar">
	<a href={`${base}/laer/`}>
		<strong>Lærebok</strong>
		<span>Teori og gjennomgåtte døme, når du vil slå opp.</span>
	</a>
	<a href={`${base}/framgang/`}>
		<strong>Framgang</strong>
		<span>Kva du kan, og kva som står for tur.</span>
	</a>
</nav>

<style>
	.hero {
		text-align: center;
		padding: var(--space-10) var(--space-4) var(--space-8);
	}

	.eyebrow {
		margin: 0;
		font-size: var(--font-size-sm);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-primary);
	}

	h1 {
		margin: var(--space-2) 0 var(--space-3);
		font-size: var(--font-size-3xl);
		line-height: 1.2;
	}

	.lede {
		margin: 0 auto var(--space-8);
		max-width: 28rem;
		color: var(--color-text-secondary);
	}

	.start {
		display: inline-block;
		min-width: 14rem;
		text-decoration: none;
	}

	.stats {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: var(--space-8);
		margin: var(--space-10) 0 0;
	}

	.stats div {
		text-align: center;
	}

	.stats dt {
		font-size: var(--font-size-xs);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-text-muted);
	}

	.stats dd {
		margin: var(--space-1) 0 0;
		font-size: var(--font-size-2xl);
		font-weight: 700;
	}

	.elsewhere {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		gap: var(--space-4);
	}

	.elsewhere a {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding: var(--space-5);
		border: 1px solid var(--color-border);
		border-left: var(--accent-edge) solid var(--color-border-warm);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		text-decoration: none;
		color: var(--color-text);
		transition: border-left-color var(--transition-fast), box-shadow var(--transition-fast);
	}

	.elsewhere a:hover {
		border-left-color: var(--color-primary);
		box-shadow: var(--shadow-md);
		text-decoration: none;
	}

	.elsewhere span {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
	}
</style>
