<script lang="ts">
	import { getStrings, type Lang } from '$lib/i18n';
	import { MODULE_REGISTRY, type TopicModuleMeta } from '$lib/modules/registry';
	import * as storage from '$lib/utils/storage';
	import { loadStudentModel, getSuccessRate, getConceptCount } from '$lib/engine/student-model';

	let language = $state<Lang>(storage.load<Lang>('language', 'nn'));
	const texts = $derived(getStrings(language));
	const studentModel = $derived(loadStudentModel());

	// Module progress summary
	function getModuleProgress(mod: TopicModuleMeta): { attempted: boolean; masteredPct: number } {
		const concepts = mod.conceptIds;
		let hasData = false;
		let mastered = 0;
		for (const cId of concepts) {
			const c = studentModel.concepts[cId];
			if (c && (c.timesCorrect > 0 || c.timesIncorrect > 0)) {
				hasData = true;
				if (c.confidence >= 0.8) mastered++;
			}
		}
		return {
			attempted: hasData,
			masteredPct: concepts.length > 0 ? Math.round((mastered / concepts.length) * 100) : 0
		};
	}

	const principles = $derived([
		{ icon: '🔄', title: texts.landing_principle_srs, desc: texts.landing_principle_srs_desc },
		{ icon: '✏️', title: texts.landing_principle_fading, desc: texts.landing_principle_fading_desc },
		{ icon: '📈', title: texts.landing_principle_adaptive, desc: texts.landing_principle_adaptive_desc }
	]);
</script>

<svelte:head>
	<title>{texts.landing_title}</title>
</svelte:head>

<div class="landing">
	<!-- Hero -->
	<header class="hero">
		<div class="hero-inner">
			<h1 class="hero-title">{texts.landing_title}</h1>
			<p class="hero-subtitle">{texts.landing_subtitle}</p>
		</div>
	</header>

	<!-- Module Cards -->
	<section class="modules-section">
		<h2 class="section-heading">{texts.landing_choose_module}</h2>
		<div class="modules-grid">
			{#each MODULE_REGISTRY as mod}
				{@const progress = getModuleProgress(mod)}
				<a href={mod.route} class="module-card" style="--accent: {mod.color}">
					<div class="module-icon">{mod.icon}</div>
					<h3 class="module-name">{mod.name[language]}</h3>
					<p class="module-desc">{mod.description[language]}</p>
					{#if progress.attempted}
						<div class="module-progress">
							<div class="progress-bar">
								<div class="progress-fill" style="width: {progress.masteredPct}%"></div>
							</div>
							<span class="progress-label">{progress.masteredPct}%</span>
						</div>
					{:else}
						<span class="module-badge-new">✨ Ny</span>
					{/if}
				</a>
			{/each}
		</div>
	</section>

	<!-- Principles -->
	<section class="principles-section">
		<h2 class="section-heading">{texts.landing_principles_title}</h2>
		<div class="principles-grid">
			{#each principles as p}
				<div class="principle-card">
					<span class="principle-icon">{p.icon}</span>
					<h3 class="principle-title">{p.title}</h3>
					<p class="principle-desc">{p.desc}</p>
				</div>
			{/each}
		</div>
	</section>

	<footer class="landing-footer">
		<p>Mattetrening v0.5.0 · Bygd med SvelteKit og kognitiv vitskap</p>
	</footer>
</div>

<style>
	.landing {
		min-height: 100vh;
		background: var(--color-bg, #F8FAFC);
	}

	/* Hero */
	.hero {
		background: linear-gradient(135deg, #3F51B5 0%, #5C6BC0 50%, #0D9488 100%);
		color: white;
		padding: var(--space-8, 3rem) var(--space-4, 1rem);
		text-align: center;
	}

	.hero-inner {
		max-width: 700px;
		margin: 0 auto;
	}

	.hero-title {
		font-size: clamp(2rem, 5vw, 3.5rem);
		font-weight: 800;
		margin: 0 0 var(--space-3, 0.75rem);
		letter-spacing: -0.02em;
	}

	.hero-subtitle {
		font-size: var(--font-size-lg, 1.125rem);
		opacity: 0.9;
		margin: 0;
		font-weight: 400;
	}

	/* Section styling */
	.modules-section, .principles-section {
		max-width: 900px;
		margin: 0 auto;
		padding: var(--space-6, 2rem) var(--space-4, 1rem);
	}

	.section-heading {
		font-size: var(--font-size-xl, 1.5rem);
		font-weight: 700;
		color: var(--color-text, #1e293b);
		margin: 0 0 var(--space-4, 1rem);
		text-align: center;
	}

	/* Module Cards */
	.modules-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: var(--space-4, 1rem);
	}

	.module-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: var(--space-6, 2rem) var(--space-4, 1rem);
		background: var(--color-surface, white);
		border-radius: 24px;
		box-shadow: 0 2px 12px rgba(0,0,0,0.06);
		text-decoration: none;
		color: inherit;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
		border: 2px solid transparent;
		cursor: pointer;
	}

	.module-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 24px rgba(0,0,0,0.10);
		border-color: var(--accent);
	}

	.module-icon {
		font-size: 2.5rem;
		width: 72px;
		height: 72px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 20px;
		background: color-mix(in srgb, var(--accent) 12%, transparent);
		color: var(--accent);
		font-weight: 700;
		margin-bottom: var(--space-3, 0.75rem);
	}

	.module-name {
		font-size: var(--font-size-lg, 1.125rem);
		font-weight: 700;
		margin: 0 0 var(--space-2, 0.5rem);
		color: var(--color-text, #1e293b);
	}

	.module-desc {
		font-size: var(--font-size-sm, 0.875rem);
		color: var(--color-text-secondary, #64748b);
		margin: 0 0 var(--space-3, 0.75rem);
		line-height: 1.5;
	}

	.module-progress {
		display: flex;
		align-items: center;
		gap: var(--space-2, 0.5rem);
		width: 100%;
		max-width: 200px;
	}

	.progress-bar {
		flex: 1;
		height: 8px;
		background: var(--color-bg, #f1f5f9);
		border-radius: 4px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: var(--accent);
		border-radius: 4px;
		transition: width 0.3s ease;
	}

	.progress-label {
		font-size: var(--font-size-sm, 0.875rem);
		font-weight: 600;
		color: var(--accent);
		min-width: 36px;
	}

	.module-badge-new {
		font-size: var(--font-size-sm, 0.875rem);
		padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
		border-radius: 9999px;
		background: color-mix(in srgb, var(--accent) 10%, transparent);
		color: var(--accent);
		font-weight: 600;
	}

	/* Principles */
	.principles-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: var(--space-4, 1rem);
	}

	.principle-card {
		padding: var(--space-4, 1rem) var(--space-4, 1rem);
		background: var(--color-surface, white);
		border-radius: 16px;
		text-align: center;
	}

	.principle-icon {
		font-size: 2rem;
		display: block;
		margin-bottom: var(--space-2, 0.5rem);
	}

	.principle-title {
		font-size: var(--font-size-base, 1rem);
		font-weight: 700;
		margin: 0 0 var(--space-2, 0.5rem);
		color: var(--color-text, #1e293b);
	}

	.principle-desc {
		font-size: var(--font-size-sm, 0.875rem);
		color: var(--color-text-secondary, #64748b);
		margin: 0;
		line-height: 1.5;
	}

	/* Footer */
	.landing-footer {
		text-align: center;
		padding: var(--space-6, 2rem) var(--space-4, 1rem);
		font-size: var(--font-size-xs, 0.75rem);
		color: var(--color-text-muted, #94a3b8);
	}

	.landing-footer p {
		margin: 0;
	}
</style>
