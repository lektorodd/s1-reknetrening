<script lang="ts">
	import { base } from '$app/paths';
	import { MODULE_REGISTRY } from '$lib/modules/registry';
</script>

<svelte:head><title>Lærebok – Mattetrening</title></svelte:head>

<header class="intro">
	<h1>Lærebok</h1>
	<p>
		Teori og gjennomgåtte døme. Her er det ingenting å svare på — slå opp det du treng,
		og gå tilbake til øvinga når du er klar.
	</p>
</header>

{#each MODULE_REGISTRY as mod (mod.id)}
	<section class="module" style="--accent: {mod.color}">
		<h2><span class="icon" aria-hidden="true">{mod.icon}</span> {mod.name}</h2>
		<p class="desc">{mod.description}</p>
		<ul>
			{#each mod.topics as topic (topic.id)}
				<li>
					<a href={`${base}/laer/${mod.slug}/${topic.id}/`}>{topic.name}</a>
				</li>
			{/each}
		</ul>
	</section>
{/each}

<style>
	.intro {
		margin-bottom: var(--space-8);
	}

	.intro h1 {
		margin: 0 0 var(--space-2);
		font-size: var(--font-size-3xl);
	}

	.intro p {
		margin: 0;
		max-width: 38rem;
		color: var(--color-text-secondary);
	}

	.module {
		margin-bottom: var(--space-8);
		padding: var(--space-6);
		border-radius: var(--radius-lg);
		background: var(--color-surface);
		border-left: 4px solid var(--accent);
	}

	.module h2 {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin: 0 0 var(--space-1);
		font-size: var(--font-size-xl);
	}

	.icon {
		display: grid;
		place-items: center;
		min-width: 2rem;
		height: 2rem;
		padding: 0 var(--space-2);
		border-radius: var(--radius-full);
		background: var(--accent);
		color: var(--color-text-inverse);
		font-size: var(--font-size-sm);
	}

	.desc {
		margin: 0 0 var(--space-4);
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
		gap: var(--space-2);
	}

	a {
		display: block;
		padding: var(--space-3) var(--space-4);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		text-decoration: none;
		color: var(--color-text);
		font-weight: 600;
		transition: border-color var(--transition-fast), background var(--transition-fast);
	}

	a:hover {
		border-color: var(--accent);
		background: var(--color-sunk);
	}
</style>
