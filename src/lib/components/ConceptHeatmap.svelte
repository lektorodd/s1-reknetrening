<script lang="ts">
	import type { I18nStrings } from '$lib/i18n';
	import type { StudentModel, ConceptKnowledge } from '$lib/engine/student-model';

	interface Props {
		texts: I18nStrings;
		studentModel: StudentModel;
	}

	let { texts, studentModel }: Props = $props();

	// Detail popover state
	let selectedConcept = $state<ConceptKnowledge | null>(null);
	let popoverPos = $state({ x: 0, y: 0 });

	const topics = ['chain', 'product', 'quotient'] as const;
	const types = ['poly', 'root', 'exp', 'log'] as const;

	const topicNames = $derived<Record<string, string>>({
		chain: texts.topic_chain,
		product: texts.topic_product,
		quotient: texts.topic_quotient
	});

	const typeNames = $derived<Record<string, string>>({
		poly: texts.type_poly,
		root: texts.type_root,
		exp: texts.type_exp,
		log: texts.type_log
	});

	function getConcept(topic: string, type: string): ConceptKnowledge {
		return studentModel.concepts[`${topic}_${type}`];
	}

	function confidenceHue(confidence: number, attempted: boolean): string {
		if (!attempted) return 'var(--color-border)';
		// 0→0° (red), 1→120° (green)
		const hue = Math.round(confidence * 120);
		const saturation = 65;
		const lightness = 45;
		return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
	}

	function confidenceLabel(concept: ConceptKnowledge): string {
		if (concept.lastSeen === 0) return '—';
		return `${Math.round(concept.confidence * 100)}%`;
	}

	function isAttempted(concept: ConceptKnowledge): boolean {
		return concept.lastSeen > 0;
	}

	function togglePopover(concept: ConceptKnowledge, event: MouseEvent) {
		if (selectedConcept === concept) {
			selectedConcept = null;
			return;
		}
		selectedConcept = concept;
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		popoverPos = { x: rect.left + rect.width / 2, y: rect.bottom + 8 };
	}

	function closePopover() {
		selectedConcept = null;
	}

	function formatDate(timestamp: number): string {
		if (timestamp === 0) return '—';
		return new Date(timestamp).toLocaleDateString();
	}

	function daysUntilReview(concept: ConceptKnowledge): string {
		if (concept.lastSeen === 0) return '—';
		const daysSince = (Date.now() - concept.lastSeen) / (1000 * 60 * 60 * 24);
		const daysLeft = Math.ceil(concept.currentInterval - daysSince);
		if (daysLeft <= 0) return texts.stat_due_now;
		if (daysLeft === 1) return texts.stat_due_tomorrow;
		return `${daysLeft}d`;
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="card chart-card">
	<h2>{texts.stat_confidence_map}</h2>

	<div class="heatmap">
		<!-- Header row -->
		<div class="heatmap-corner"></div>
		{#each types as type}
			<div class="heatmap-col-header">{typeNames[type]}</div>
		{/each}

		<!-- Data rows -->
		{#each topics as topic}
			<div class="heatmap-row-header">{topicNames[topic]}</div>
			{#each types as type}
				{@const concept = getConcept(topic, type)}
				{@const attempted = isAttempted(concept)}
				<button
					class="heatmap-cell"
					class:unattempted={!attempted}
					style="--cell-bg: {confidenceHue(concept.confidence, attempted)}"
					onclick={(e) => togglePopover(concept, e)}
					title="{topicNames[topic]} × {typeNames[type]}"
				>
					<span class="cell-value">{confidenceLabel(concept)}</span>
				</button>
			{/each}
		{/each}
	</div>

	<!-- Detail popover -->
	{#if selectedConcept}
		<div class="popover-backdrop" onclick={closePopover}></div>
		<div class="popover" style="left: {popoverPos.x}px; top: {popoverPos.y}px;">
			{#if selectedConcept.lastSeen === 0}
				<p class="popover-empty">{texts.stat_never_attempted}</p>
			{:else}
				<div class="popover-row">
					<span>✅</span><span>{selectedConcept.timesCorrect}</span>
					<span>❌</span><span>{selectedConcept.timesIncorrect}</span>
				</div>
				<div class="popover-row">
					<span>{texts.stat_last_seen}:</span>
					<span>{formatDate(selectedConcept.lastSeen)}</span>
				</div>
				<div class="popover-row">
					<span>{texts.stat_next_review}:</span>
					<span>{daysUntilReview(selectedConcept)}</span>
				</div>
				<div class="popover-row">
					<span>{texts.stat_hint_usage}:</span>
					<span>{Math.round(selectedConcept.hintsUsedFrequency * 100)}%</span>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.heatmap {
		display: grid;
		grid-template-columns: auto repeat(4, 1fr);
		gap: 6px;
		margin-top: var(--space-4);
	}

	.heatmap-corner {
		/* intentionally empty: spacer cell in the grid */
		content: '';
	}

	.heatmap-col-header {
		font-size: var(--font-size-xs);
		font-weight: 600;
		color: var(--color-text-muted);
		text-align: center;
		padding-bottom: var(--space-2);
	}

	.heatmap-row-header {
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-text);
		display: flex;
		align-items: center;
		padding-right: var(--space-3);
	}

	.heatmap-cell {
		position: relative;
		aspect-ratio: 1.6;
		min-height: 44px;
		border-radius: var(--radius-md);
		border: 2px solid transparent;
		background: var(--cell-bg);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.15s ease, box-shadow 0.15s ease;
	}

	.heatmap-cell:hover {
		transform: scale(1.08);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.heatmap-cell:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	.heatmap-cell.unattempted {
		opacity: 0.4;
	}

	.cell-value {
		font-size: var(--font-size-sm);
		font-weight: 700;
		color: #fff;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.heatmap-cell.unattempted .cell-value {
		color: var(--color-text-muted);
		text-shadow: none;
	}

	/* Popover */
	.popover-backdrop {
		position: fixed;
		inset: 0;
		z-index: 99;
	}

	.popover {
		position: fixed;
		z-index: 100;
		transform: translateX(-50%);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-4);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
		min-width: 180px;
	}

	.popover-empty {
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
		text-align: center;
		margin: 0;
	}

	.popover-row {
		display: flex;
		justify-content: space-between;
		gap: var(--space-2);
		font-size: var(--font-size-sm);
		padding: var(--space-1) 0;
		color: var(--color-text);
	}

	@media (max-width: 640px) {
		.heatmap-col-header {
			font-size: 0.65rem;
		}
		.heatmap-row-header {
			font-size: var(--font-size-xs);
		}
		.heatmap-cell {
			min-height: 36px;
		}
		.cell-value {
			font-size: var(--font-size-xs);
		}
	}
</style>
