<script lang="ts">
	import { MODULE_REGISTRY } from '$lib/modules/registry';
	import { LEVEL_NAMES } from '$lib/content/strings';

	interface Props {
		/** null = every subject. */
		moduleId: string | null;
		/** null = every topic within the chosen subject. */
		topic: string | null;
		/** 1-5, or null for every level. */
		level: number | null;
		onChange: (moduleId: string | null, topic: string | null, level: number | null) => void;
	}

	let { moduleId, topic, level, onChange }: Props = $props();

	let open = $state(false);

	const label = $derived.by(() => {
		const parts: string[] = [];
		const mod = moduleId ? MODULE_REGISTRY.find((m) => m.id === moduleId) : null;

		if (!mod) parts.push('Alle fag');
		else {
			parts.push(mod.name);
			parts.push(topic ? (mod.topics.find((t) => t.id === topic)?.name ?? topic) : 'alle emne');
		}

		parts.push(level ? `nivå ${level}` : 'alle nivå');
		return parts.join(' · ');
	});
</script>

<div class="filter">
	<button class="summary" onclick={() => (open = !open)} aria-expanded={open}>
		<span class="what">{label}</span>
		<span class="toggle">{open ? 'Lukk' : 'Endre'}</span>
	</button>

	{#if open}
		<div class="panel">
			<div class="all-subjects">
				<button
					class="chip"
					class:selected={moduleId === null}
					onclick={() => onChange(null, null, level)}
				>
					Alle fag
				</button>
			</div>

			{#each MODULE_REGISTRY as mod (mod.id)}
				<section class="subject" style="--accent: {mod.color}">
					<h3>
						<span class="icon" aria-hidden="true">{mod.icon}</span>
						{mod.name}
					</h3>
					<div class="chips">
						<button
							class="chip"
							class:selected={moduleId === mod.id && topic === null}
							onclick={() => onChange(mod.id, null, level)}
						>
							Alle
						</button>
						{#each mod.topics as t (t.id)}
							<button
								class="chip"
								class:selected={moduleId === mod.id && topic === t.id}
								onclick={() => onChange(mod.id, t.id, level)}
							>
								{t.name}
							</button>
						{/each}
					</div>
				</section>
			{/each}

			<section class="subject levels-section">
				<h3>Nivå</h3>
				<div class="chips">
					<button
						class="chip"
						class:selected={level === null}
						onclick={() => onChange(moduleId, topic, null)}
					>
						Alle
					</button>
					{#each [1, 2, 3, 4, 5] as l (l)}
						<button
							class="chip"
							class:selected={level === l}
							onclick={() => onChange(moduleId, topic, l)}
						>
							{l}. {LEVEL_NAMES[l]}
						</button>
					{/each}
				</div>
			</section>
		</div>
	{/if}
</div>

<style>
	.filter {
		margin-bottom: var(--space-5);
	}

	.summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		width: 100%;
		padding: var(--space-3) var(--space-4);
		border: 1px solid var(--color-line);
		border-radius: var(--radius-md);
		background: var(--color-raised);
		font: inherit;
		cursor: pointer;
	}

	.what {
		font-weight: 600;
	}

	.toggle {
		font-size: var(--font-size-sm);
		color: var(--color-primary);
	}

	.panel {
		margin-top: var(--space-3);
		padding: var(--space-4);
		border: 1px solid var(--color-line);
		border-radius: var(--radius-md);
		background: var(--color-raised);
	}

	.all-subjects {
		padding-bottom: var(--space-4);
		border-bottom: 1px solid var(--color-line);
	}

	/* One block per subject, so a topic name is never orphaned from its subject. */
	.subject {
		padding-top: var(--space-4);
	}

	.subject h3 {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin: 0 0 var(--space-2);
		font-size: var(--font-size-xs);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
	}

	.icon {
		display: grid;
		place-items: center;
		min-width: 1.4rem;
		height: 1.4rem;
		padding: 0 var(--space-1);
		border-radius: var(--radius-sm);
		background: var(--accent);
		color: var(--color-text-inverse);
		font-size: var(--font-size-xs);
		font-weight: 700;
		letter-spacing: 0;
		text-transform: none;
	}

	.levels-section {
		margin-top: var(--space-2);
		border-top: 1px solid var(--color-line);
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.chip {
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-line-strong);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		font: inherit;
		font-size: var(--font-size-sm);
		color: var(--color-text-strong);
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
</style>
