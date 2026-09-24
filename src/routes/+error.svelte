<script lang="ts">
	// The app's own error page, in Nynorsk. Without it SvelteKit shows its
	// built-in English one — a bare status code and "Not Found".

	import { base } from '$app/paths';
	import { page } from '$app/state';

	const notFound = $derived(page.status === 404);
</script>

<svelte:head><title>{notFound ? 'Fann ikkje sida' : 'Noko gjekk gale'} – Mattetrening</title></svelte:head>

<section class="card error">
	<p class="code">{page.status}</p>
	<h1>{notFound ? 'Fann ikkje sida' : 'Noko gjekk gale'}</h1>
	<p>
		{#if notFound}
			Adressa peikar ikkje på noko her. Kanskje ho er skriven feil, eller sida er flytta.
		{:else}
			Sida kunne ikkje visast. Prøv å lasta henne inn på nytt. Framgangen din er lagra.
		{/if}
	</p>
	<div class="actions">
		<a class="btn btn-primary" href={`${base}/`}>Til framsida</a>
		<a class="btn btn-ghost" href={`${base}/laer/`}>Til Læreboka</a>
	</div>
</section>

<style>
	.error {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-3);
	}

	.code {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	h1 {
		margin: 0;
		font-size: var(--font-size-2xl);
	}

	p {
		margin: 0;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		margin-top: var(--space-2);
	}
</style>
