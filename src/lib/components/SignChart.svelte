<script lang="ts">
	// A sign chart, drawn the way a student draws one on paper: a solid line
	// where the row is positive, a dashed line where it is negative, 0 where it
	// is zero. The last row is the product; the rows above it are its factors.
	//
	// A grid of cells rather than an SVG, so the labels go through <Tex> like all
	// other maths, and the chart reflows on a phone. The points are spaced
	// evenly, not to scale — as on paper, only their order matters.

	import type { SignChart } from '$lib/modules/types';
	import Tex from './Tex.svelte';

	interface Props {
		chart: SignChart;
	}

	let { chart }: Props = $props();

	const n = $derived(chart.points.length);

	/** Interval cells and point cells interleaved: i0 p0 i1 p1 … in. */
	const columns = $derived(
		`minmax(4.5rem, max-content) ${Array.from({ length: n }, () => 'minmax(1.5rem, 1fr) 2rem').join(' ')} minmax(1.5rem, 1fr)`
	);

	/** What the chart says, in words, for a screen reader. */
	const description = $derived(
		chart.rows
			.map((row) => {
				const parts: string[] = [];
				row.signs.forEach((sg, i) => {
					const where =
						n === 0
							? 'overalt'
							: i === 0
								? `før ${chart.points[0].label}`
								: i === n
									? `etter ${chart.points[n - 1].label}`
									: `mellom ${chart.points[i - 1].label} og ${chart.points[i].label}`;
					parts.push(`${sg === '+' ? 'positiv' : 'negativ'} ${where}`);
					if (i < n && row.zeros[i]) parts.push(`0 i ${chart.points[i].label}`);
				});
				return `${row.expr}: ${parts.join(', ')}`;
			})
			.join('. ')
	);
</script>

<div class="chart" style="grid-template-columns: {columns}" role="img" aria-label="Forteiknslinje. {description}">
	<!-- Header: the points along the x-axis. -->
	<span class="label"></span>
	{#each chart.points as p, i (i)}
		<span></span>
		<span class="point"><Tex tex={p.label} display={false} /></span>
	{/each}
	<span></span>

	{#each chart.rows as row, r (r)}
		{#if r === chart.rows.length - 1 && r > 0}
			<!-- The product reads as the result: one rule across, as on paper. -->
			<span class="rule"></span>
		{/if}
		<span class="label"><Tex tex={row.expr} display={false} /></span>
		{#each row.signs as sign, i (i)}
			<span class="seg" class:neg={sign === '-'}></span>
			{#if i < n}
				{#if row.zeros[i]}
					<span class="zero">0</span>
				{:else}
					<span class="seg" class:neg={sign === '-'}></span>
				{/if}
			{/if}
		{/each}
	{/each}
</div>

<style>
	.chart {
		display: grid;
		align-items: center;
		row-gap: var(--space-2);
		margin-top: var(--space-2);
		padding: var(--space-3) var(--space-4);
		border: 1px solid var(--color-line);
		border-radius: var(--radius-sm);
		background: var(--color-raised);
		overflow-x: auto;
	}

	.label {
		padding-right: var(--space-3);
		white-space: nowrap;
	}

	.rule {
		grid-column: 1 / -1;
		border-top: 1px solid var(--color-line-strong);
	}

	.point {
		text-align: center;
		font-size: var(--font-size-sm);
	}

	/* Solid: positive. Dashed: negative. Drawn as a border so the dash pattern
	   stays crisp at any width. */
	.seg {
		height: 0;
		border-bottom: 2px solid var(--color-text);
		align-self: center;
	}

	.seg.neg {
		border-bottom-style: dashed;
	}

	.zero {
		text-align: center;
		font-weight: 700;
		line-height: 1;
	}
</style>
