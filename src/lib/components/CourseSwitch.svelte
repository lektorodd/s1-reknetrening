<script lang="ts">
	// The course, as one visible choice. It used to sit behind «Endre» in the
	// topic filter, three taps deep, so a new S2 student landed in S1 with nothing
	// to say how to leave. The choice is stored with the Treningsrom filter, so
	// the front page, the session and the progress page all follow it.

	import { COURSES } from '$lib/modules/registry';
	import type { Course } from '$lib/modules/types';

	interface Props {
		/** Null when the Treningsrom filter is set to every course. */
		course: Course | null;
		onChange: (course: Course) => void;
	}

	let { course, onChange }: Props = $props();
</script>

<div class="switch" role="group" aria-label="Kurs">
	<span class="label" aria-hidden="true">Kurs</span>
	{#each COURSES as c (c)}
		<button
			class="option"
			class:selected={course === c}
			aria-pressed={course === c}
			onclick={() => onChange(c)}
		>
			{c}
		</button>
	{/each}
</div>

<style>
	.switch {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}

	.label {
		font-size: var(--font-size-xs);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-text-muted);
	}

	/* A segmented pair: two buttons that read as one control. */
	.option {
		min-width: 3.25rem;
		min-height: 2.5rem;
		padding: var(--space-2) var(--space-4);
		border: 1px solid var(--color-border-warm);
		background: var(--color-surface);
		font: inherit;
		font-weight: 700;
		color: var(--color-text-strong);
		cursor: pointer;
		transition: background var(--transition-fast), border-color var(--transition-fast);
	}

	.option:first-of-type {
		border-radius: var(--radius-md) 0 0 var(--radius-md);
	}

	.option:last-of-type {
		border-radius: 0 var(--radius-md) var(--radius-md) 0;
		margin-left: -1px;
	}

	.option:hover {
		border-color: var(--color-primary);
	}

	.option.selected {
		position: relative;
		border-color: var(--color-primary);
		background: var(--color-primary);
		color: var(--color-text-inverse);
	}
</style>
