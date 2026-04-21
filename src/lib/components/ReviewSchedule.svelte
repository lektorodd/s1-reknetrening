<script lang="ts">
	import type { I18nStrings } from '$lib/i18n';
	import type { StudentModel, ConceptKnowledge } from '$lib/engine/student-model';
	import { getReviewBuckets } from '$lib/engine/student-model';

	interface Props {
		texts: I18nStrings;
		studentModel: StudentModel;
		onPractice?: (conceptId: string) => void;
	}

	let { texts, studentModel, onPractice }: Props = $props();

	const buckets = $derived(getReviewBuckets(studentModel));

	const conceptDisplayName = $derived((conceptId: string): string => {
		// Parse "chain_poly" → "Chain Rule × Polynomials"
		const [topic, type] = conceptId.split('_');
		const topicMap: Record<string, string> = {
			chain: texts.topic_chain,
			product: texts.topic_product,
			quotient: texts.topic_quotient
		};
		const typeMap: Record<string, string> = {
			poly: texts.type_poly,
			root: texts.type_root,
			exp: texts.type_exp,
			log: texts.type_log
		};
		return `${topicMap[topic] ?? topic} × ${typeMap[type] ?? type}`;
	});

	function handlePractice(conceptId: string) {
		onPractice?.(conceptId);
	}
</script>

<div class="card chart-card">
	<h2>{texts.stat_review_schedule}</h2>

	{#if buckets.dueNow.length === 0 && buckets.dueTomorrow.length === 0 && buckets.dueWeek.length === 0}
		<p class="empty-state">✅ {texts.stat_never_attempted}</p>
	{:else}
		<!-- Due now -->
		{#if buckets.dueNow.length > 0}
			<div class="bucket">
				<div class="bucket-header bucket-urgent">
					<span class="bucket-dot" style="background: var(--color-error, #ef4444)"></span>
					{texts.stat_due_now} ({buckets.dueNow.length})
				</div>
				<ul class="bucket-list">
					{#each buckets.dueNow as concept}
						<li class="bucket-item">
							<span class="concept-name">{conceptDisplayName(concept.conceptId)}</span>
							{#if onPractice}
								<button
									class="practice-btn"
									onclick={() => handlePractice(concept.conceptId)}
								>
									{texts.stat_practice_now}
								</button>
							{/if}
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<!-- Due tomorrow -->
		{#if buckets.dueTomorrow.length > 0}
			<div class="bucket">
				<div class="bucket-header bucket-soon">
					<span class="bucket-dot" style="background: var(--color-warning)"></span>
					{texts.stat_due_tomorrow} ({buckets.dueTomorrow.length})
				</div>
				<ul class="bucket-list">
					{#each buckets.dueTomorrow as concept}
						<li class="bucket-item">
							<span class="concept-name">{conceptDisplayName(concept.conceptId)}</span>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<!-- Next 7 days -->
		{#if buckets.dueWeek.length > 0}
			<div class="bucket">
				<div class="bucket-header bucket-later">
					<span class="bucket-dot" style="background: var(--color-success)"></span>
					{texts.stat_due_week} ({buckets.dueWeek.length})
				</div>
				<ul class="bucket-list">
					{#each buckets.dueWeek as concept}
						<li class="bucket-item">
							<span class="concept-name">{conceptDisplayName(concept.conceptId)}</span>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	{/if}
</div>

<style>
	.empty-state {
		color: var(--color-text-muted);
		text-align: center;
		padding: var(--space-6) 0;
		font-size: var(--font-size-sm);
	}

	.bucket {
		margin-bottom: var(--space-4);
	}

	.bucket:last-child {
		margin-bottom: 0;
	}

	.bucket-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--font-size-sm);
		font-weight: 600;
		padding: var(--space-2) 0;
		color: var(--color-text);
	}

	.bucket-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.bucket-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.bucket-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-md);
		transition: background 0.15s ease;
	}

	.bucket-item:hover {
		background: var(--color-primary-50);
	}

	.concept-name {
		font-size: var(--font-size-sm);
		color: var(--color-text);
	}

	.practice-btn {
		font-size: var(--font-size-xs);
		font-weight: 600;
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-full);
		border: 1px solid var(--color-primary);
		background: transparent;
		color: var(--color-primary);
		cursor: pointer;
		transition: background 0.15s ease, color 0.15s ease;
		white-space: nowrap;
	}

	.practice-btn:hover {
		background: var(--color-primary);
		color: #fff;
	}

	@media (max-width: 640px) {
		.concept-name {
			font-size: var(--font-size-xs);
		}
		.practice-btn {
			font-size: 0.65rem;
			padding: 2px var(--space-2);
		}
	}
</style>
