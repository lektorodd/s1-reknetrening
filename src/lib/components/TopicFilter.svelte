<script lang="ts">
	import { MODULE_REGISTRY } from '$lib/modules/registry';
	import { LEVEL_NAMES } from '$lib/content/strings';

	interface Props {
		/** `${moduleId}:${topic}`, or null for every topic. */
		topic: string | null;
		/** 1-5, or null for every level. */
		level: number | null;
		onChange: (topic: string | null, level: number | null) => void;
	}

	let { topic, level, onChange }: Props = $props();

	let open = $state(false);

	const label = $derived.by(() => {
		if (!topic && !level) return 'Alle emne, alle nivå';
		const parts: string[] = [];
		if (topic) {
			const [moduleId, topicId] = topic.split(':');
			const mod = MODULE_REGISTRY.find((m) => m.id === moduleId);
			parts.push(mod?.topics.find((t) => t.id === topicId)?.name ?? topicId);
		} else {
			parts.push('Alle emne');
		}
		if (level) parts.push(`nivå ${level}`);
		return parts.join(', ');
	});
</script>

<div class="filter">
	<button class="summary" onclick={() => (open = !open)} aria-expanded={open}>
		<span class="what">{label}</span>
		<span class="toggle">{open ? 'Lukk' : 'Endre'}</span>
	</button>

	{#if open}
		<div class="panel">
			<h2>Emne</h2>
			<div class="chips">
				<button class="chip" class:selected={topic === null} onclick={() => onChange(null, level)}>
					Alle
				</button>
				{#each MODULE_REGISTRY as mod (mod.id)}
					{#each mod.topics as t (t.id)}
						{@const value = `${mod.id}:${t.id}`}
						<button
							class="chip"
							class:selected={topic === value}
							style="--accent: {mod.color}"
							onclick={() => onChange(value, level)}
						>
							{t.name}
						</button>
					{/each}
				{/each}
			</div>

			<h2>Nivå</h2>
			<div class="chips">
				<button class="chip" class:selected={level === null} onclick={() => onChange(topic, null)}>
					Alle
				</button>
				{#each [1, 2, 3, 4, 5] as l (l)}
					<button
						class="chip"
						class:selected={level === l}
						onclick={() => onChange(topic, l)}
					>
						{l}. {LEVEL_NAMES[l]}
					</button>
				{/each}
			</div>
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
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
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
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
	}

	h2 {
		margin: 0 0 var(--space-2);
		font-size: var(--font-size-xs);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-text-muted);
	}

	h2:not(:first-child) {
		margin-top: var(--space-5);
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.chip {
		padding: var(--space-2) var(--space-3);
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
</style>
