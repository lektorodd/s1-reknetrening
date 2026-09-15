<script lang="ts">
	import { base } from '$app/paths';
	import { MODULE_REGISTRY } from '$lib/modules/registry';
	import { LEVEL_NAMES } from '$lib/content/strings';

	const LEVELS = [1, 2, 3, 4, 5];

	let topic = $state<string | null>(null);
	let moduleId = $state<string | null>(null);
	let level = $state<number | null>(null);

	const href = $derived.by(() => {
		if (!moduleId || !topic) return null;
		const params = new URLSearchParams({ modul: moduleId, emne: topic });
		if (level) params.set('nivaa', String(level));
		return `${base}/tren/?${params}`;
	});

	function selectTopic(mod: string, id: string) {
		moduleId = mod;
		topic = id;
	}
</script>

<svelte:head><title>Vel sjølv – Mattetrening</title></svelte:head>

<h1>Vel sjølv</h1>
<p class="lede">
	Vanlegvis set appen saman økta for deg. Her kan du i staden velje eitt emne — nyttig
	rett før ein prøve, eller når læraren har sagt kva de jobbar med.
</p>

<section>
	<h2>1. Emne</h2>
	{#each MODULE_REGISTRY as mod (mod.id)}
		<h3>{mod.name}</h3>
		<div class="chips">
			{#each mod.topics as t (t.id)}
				<button
					class="chip"
					class:selected={moduleId === mod.id && topic === t.id}
					style="--accent: {mod.color}"
					onclick={() => selectTopic(mod.id, t.id)}
				>
					{t.name}
				</button>
			{/each}
		</div>
	{/each}
</section>

<section>
	<h2>2. Nivå <span class="optional">(valfritt)</span></h2>
	<div class="chips">
		{#each LEVELS as l (l)}
			<button class="chip" class:selected={level === l} onclick={() => (level = level === l ? null : l)}>
				{l}. {LEVEL_NAMES[l]}
			</button>
		{/each}
	</div>
</section>

<div class="go">
	{#if href}
		<a class="btn btn-primary btn-lg" {href}>Start øving</a>
	{:else}
		<button class="btn btn-primary btn-lg" disabled>Vel eit emne først</button>
	{/if}
	<a class="btn btn-ghost" href={`${base}/`}>Tilbake</a>
</div>

<style>
	h1 {
		margin: 0 0 var(--space-2);
		font-size: var(--font-size-3xl);
	}

	.lede {
		margin: 0 0 var(--space-8);
		max-width: 38rem;
		color: var(--color-text-secondary);
	}

	h2 {
		margin: 0 0 var(--space-3);
		font-size: var(--font-size-lg);
	}

	h3 {
		margin: var(--space-4) 0 var(--space-2);
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-text-muted);
	}

	section {
		margin-bottom: var(--space-8);
	}

	.optional {
		font-weight: 400;
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.chip {
		padding: var(--space-2) var(--space-4);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		background: var(--color-surface);
		font: inherit;
		font-size: var(--font-size-sm);
		cursor: pointer;
		transition: border-color var(--transition-fast), background var(--transition-fast);
	}

	.chip:hover {
		border-color: var(--accent, var(--color-primary));
	}

	.chip.selected {
		border-color: var(--accent, var(--color-primary));
		background: var(--accent, var(--color-primary));
		color: var(--color-text-inverse);
	}

	.go {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		flex-wrap: wrap;
	}

	.go a {
		text-decoration: none;
	}

	.go button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
