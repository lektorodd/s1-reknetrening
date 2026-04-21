<script lang="ts">
	import type { I18nStrings } from '$lib/i18n';

	interface Props {
		texts: I18nStrings;
	}

	let { texts }: Props = $props();
</script>

<div class="help-view animate-fade-in">
	<h1>{texts.help_title}</h1>

	<div class="help-cards">
		<div class="card help-card">
			<div class="help-icon">🎯</div>
			<h2>{texts.help_focus_title}</h2>
			<p>{texts.help_focus_desc}</p>
		</div>

		<div class="card help-card">
			<div class="help-icon">🧠</div>
			<h2>{texts.help_mix_title}</h2>
			<p>{texts.help_mix_desc}</p>
		</div>

		<div class="card help-card">
			<div class="help-icon">📊</div>
			<h2>{texts.help_stats_title}</h2>
			<p>{texts.help_stats_desc}</p>
		</div>
	</div>

	<div class="card about-card">
		<h2>{texts.label_about}</h2>
		<p>{texts.label_about_version}</p>
		<p>{texts.label_about_design} <strong>Axiom Geometric – «The Friendly Scholar»</strong></p>
		<div class="tech-badges">
			<span class="badge badge-primary">SvelteKit</span>
			<span class="badge badge-primary">TypeScript</span>
			<span class="badge badge-primary">MathJax</span>
			<span class="badge badge-primary">FSRS (coming)</span>
		</div>
	</div>
</div>

<style>
	.help-view {
		max-width: 800px;
		margin: 0 auto;
		padding: var(--space-8) var(--space-4);
	}

	.help-view h1 {
		margin-bottom: var(--space-6);
	}

	.help-cards {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		margin-bottom: var(--space-6);
	}

	.help-card {
		padding: var(--space-6);
	}

	.help-icon {
		font-size: 2rem;
		margin-bottom: var(--space-3);
	}

	.help-card h2 {
		font-size: var(--font-size-lg);
		margin-bottom: var(--space-2);
	}

	.help-card p {
		line-height: 1.7;
	}

	.about-card {
		padding: var(--space-6);
		background: var(--color-primary-50);
		border-color: var(--color-primary-100);
	}

	.about-card h2 {
		font-size: var(--font-size-lg);
		margin-bottom: var(--space-2);
	}

	.about-card p {
		margin-bottom: var(--space-3);
	}

	.tech-badges {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
		margin-top: var(--space-4);
	}
</style>
