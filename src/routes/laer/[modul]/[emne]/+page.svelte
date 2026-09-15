<script lang="ts">
	import { base } from '$app/paths';
	import TheoryArticle from '$lib/components/TheoryArticle.svelte';
	import WorkedExamples from '$lib/components/WorkedExamples.svelte';

	let { data } = $props();
</script>

<svelte:head><title>{data.entry.title} – Lærebok</title></svelte:head>

<nav class="crumbs" aria-label="Brødsmular">
	<a href={`${base}/laer/`}>Lærebok</a>
	<span aria-hidden="true">/</span>
	<span>{data.moduleName}</span>
</nav>

<TheoryArticle entry={data.entry} />

{#if data.examples.length > 0}
	<section class="more-examples">
		<h2>Fleire gjennomgåtte døme</h2>
		<p class="hint">
			Same emne på tre vanskegrader, løyst heilt ut. Les så mange du vil — ingenting
			her blir talt eller vurdert.
		</p>
		<WorkedExamples examples={data.examples} />
	</section>
{/if}

<nav class="pager" aria-label="Bla mellom emne">
	{#if data.prev}
		<a class="btn btn-ghost" href={`${base}/laer/${data.moduleSlug}/${data.prev.id}/`}>
			← {data.prev.name}
		</a>
	{:else}
		<span></span>
	{/if}

	<a class="btn btn-primary" href={`${base}/tren/`}>Øv på dette</a>

	{#if data.next}
		<a class="btn btn-ghost" href={`${base}/laer/${data.moduleSlug}/${data.next.id}/`}>
			{data.next.name} →
		</a>
	{:else}
		<span></span>
	{/if}
</nav>

<style>
	.crumbs {
		display: flex;
		gap: var(--space-2);
		margin-bottom: var(--space-5);
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	.crumbs a {
		color: var(--color-primary);
	}

	.more-examples {
		margin-top: var(--space-10);
	}

	.more-examples h2 {
		margin: 0 0 var(--space-2);
		font-size: var(--font-size-lg);
		color: var(--color-primary);
	}

	.more-examples .hint {
		margin: 0 0 var(--space-5);
		max-width: 38rem;
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
	}

	.pager {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		flex-wrap: wrap;
		margin-top: var(--space-10);
		padding-top: var(--space-6);
		border-top: 1px solid var(--color-border);
	}

	.pager a {
		text-decoration: none;
	}
</style>
