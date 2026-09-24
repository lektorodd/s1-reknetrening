<script lang="ts">
	import { COURSES, MODULE_REGISTRY, modulesForCourse } from '$lib/modules/registry';
	import type { Course } from '$lib/modules/types';
	import { LEVEL_NAMES } from '$lib/content/strings';

	interface Props {
		/** null = every course. A session never mixes courses unless this is null. */
		course: Course | null;
		/** null = every subject. */
		moduleId: string | null;
		/** null = every topic within the chosen subject. */
		topic: string | null;
		/** 1-5, or null for every level. */
		level: number | null;
		onChange: (
			course: Course | null,
			moduleId: string | null,
			topic: string | null,
			level: number | null
		) => void;
	}

	let { course, moduleId, topic, level, onChange }: Props = $props();

	let open = $state(false);

	/** Only the chosen course's subjects are offered; all of them when none is. */
	const subjects = $derived(course === null ? MODULE_REGISTRY : modulesForCourse(course));

	const label = $derived.by(() => {
		const parts: string[] = [course ?? 'Alle kurs'];
		const mod = moduleId ? MODULE_REGISTRY.find((m) => m.id === moduleId) : null;

		if (!mod) parts.push('alle fag');
		else {
			parts.push(mod.name);
			parts.push(topic ? (mod.topics.find((t) => t.id === topic)?.name ?? topic) : 'alle emne');
		}

		parts.push(level ? `nivå ${level}` : 'alle nivå');
		return parts.join(' · ');
	});

	/**
	 * Changing course clears the subject and topic below it: keeping "Derivasjon"
	 * selected while showing S2 would mean a label that names a subject the panel
	 * no longer offers.
	 */
	function chooseCourse(next: Course | null) {
		onChange(next, null, null, level);
	}
</script>

<div class="filter">
	<button class="summary" onclick={() => (open = !open)} aria-expanded={open}>
		<span class="what">{label}</span>
		<span class="toggle">{open ? 'Lukk' : 'Endre'}</span>
	</button>

	{#if open}
		<div class="panel">
			<section class="course-section">
				<h3>Kurs</h3>
				<div class="chips">
					<button
						class="chip"
						class:selected={course === null}
						aria-pressed={course === null}
						onclick={() => chooseCourse(null)}
					>
						Alle kurs
					</button>
					{#each COURSES as c (c)}
						<button
							class="chip"
							class:selected={course === c}
							aria-pressed={course === c}
							onclick={() => chooseCourse(c)}
						>
							{c}
						</button>
					{/each}
				</div>
			</section>

			{#each subjects as mod (mod.id)}
				<section class="subject" style="--accent: {mod.color}">
					<h3>
						<span class="icon" aria-hidden="true">{mod.icon}</span>
						{mod.name}
						{#if course === null}<span class="course-tag">{mod.course}</span>{/if}
					</h3>
					<div class="chips">
						<button
							class="chip"
							class:selected={moduleId === mod.id && topic === null}
							aria-pressed={moduleId === mod.id && topic === null}
							onclick={() => onChange(course, mod.id, null, level)}
						>
							Alle
						</button>
						{#each mod.topics as t (t.id)}
							<button
								class="chip"
								class:selected={moduleId === mod.id && topic === t.id}
								aria-pressed={moduleId === mod.id && topic === t.id}
								onclick={() => onChange(course, mod.id, t.id, level)}
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
						aria-pressed={level === null}
						onclick={() => onChange(course, moduleId, topic, null)}
					>
						Alle
					</button>
					{#each [1, 2, 3, 4, 5] as l (l)}
						<button
							class="chip"
							class:selected={level === l}
							aria-pressed={level === l}
							onclick={() => onChange(course, moduleId, topic, l)}
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

	/* Course is the top axis: choosing S2 leaves only S2's subjects below. */
	.course-section {
		padding-bottom: var(--space-4);
		border-bottom: 1px solid var(--color-line);
	}

	.course-section h3 {
		margin: 0 0 var(--space-2);
		font-size: var(--font-size-xs);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
	}

	/* Only shown under "Alle kurs", where a subject name alone is ambiguous. */
	.course-tag {
		padding: 0 var(--space-1);
		border: 1px solid var(--color-line-strong);
		border-radius: var(--radius-sm);
		font-size: var(--font-size-xs);
		letter-spacing: 0;
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
