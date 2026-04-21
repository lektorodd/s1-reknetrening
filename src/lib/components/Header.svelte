<script lang="ts">
	import type { Lang } from '$lib/i18n';
	import { AVAILABLE_LANGS, LANG_FLAGS, getStrings } from '$lib/i18n';
	import type { ViewId } from '$lib/stores';

	interface Props {
		language: Lang;
		currentView: ViewId;
		onNavigate: (view: ViewId) => void;
		onLanguageChange: (lang: Lang) => void;
		showBackLink?: boolean;
	}

	let { language, currentView, onNavigate, onLanguageChange, showBackLink = false }: Props = $props();

	const texts = $derived(getStrings(language));

	interface NavItem {
		id: ViewId;
		icon: string;
		labelKey: 'nav_dashboard' | 'nav_theory' | 'nav_guided' | 'nav_practice' | 'nav_stats';
	}

	const navItems: NavItem[] = [
		{ id: 'dashboard', icon: '🏠', labelKey: 'nav_dashboard' },
		{ id: 'theory', icon: '📚', labelKey: 'nav_theory' },
		{ id: 'guided', icon: '✏️', labelKey: 'nav_guided' },
		{ id: 'practice', icon: '💪', labelKey: 'nav_practice' },
		{ id: 'stats', icon: '📊', labelKey: 'nav_stats' }
	];

	let mobileNavOpen = $state(false);
	let settingsOpen = $state(false);

	function toggleSettings() {
		settingsOpen = !settingsOpen;
	}

	function closeSettings() {
		settingsOpen = false;
	}
</script>

<!-- Desktop Header -->
<header class="app-header">
	<div class="header-inner">
		{#if showBackLink}
			<a href="/" class="back-link">{texts.nav_back_modules}</a>
		{/if}

		<button class="logo" onclick={() => onNavigate('dashboard')}>
			<span class="logo-icon">∂</span>
			<span class="logo-text">Mattetrening</span>
		</button>

		<nav class="desktop-nav">
			{#each navItems as item}
				<button
					class="nav-link"
					class:active={currentView === item.id}
					onclick={() => onNavigate(item.id)}
				>
					<span class="nav-icon">{item.icon}</span>
					{texts[item.labelKey]}
				</button>
			{/each}
		</nav>

		<div class="header-actions">
			<!-- Settings Gear Dropdown -->
			<div class="settings-wrapper">
				<button
					class="gear-btn"
					onclick={toggleSettings}
					aria-label="Settings"
				>
					⚙️
				</button>

				{#if settingsOpen}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div class="settings-backdrop" onclick={closeSettings} onkeydown={closeSettings}></div>
					<div class="settings-dropdown">
						<!-- Language -->
						<div class="settings-section">
							<span class="settings-label">{texts.nav_help === 'Hjelp' ? 'Språk' : texts.nav_help === 'Help' ? 'Language' : 'Idioma'}</span>
							<div class="lang-switcher">
								{#each AVAILABLE_LANGS as lang}
									<button
										class="lang-btn"
										class:active={language === lang}
										onclick={() => { onLanguageChange(lang); closeSettings(); }}
									>
										{LANG_FLAGS[lang]}
									</button>
								{/each}
							</div>
						</div>

						<!-- Help -->
						<button class="settings-item" onclick={() => { onNavigate('help'); closeSettings(); }}>
							<span>❓</span> {texts.nav_help}
						</button>

						<!-- Version -->
						<div class="settings-version">v0.4.0</div>
					</div>
				{/if}
			</div>

			<button class="mobile-toggle" onclick={() => (mobileNavOpen = !mobileNavOpen)}>
				{mobileNavOpen ? '✕' : '☰'}
			</button>
		</div>
	</div>

	<!-- Mobile Nav Dropdown -->
	{#if mobileNavOpen}
		<nav class="mobile-nav">
			{#each navItems as item}
				<button
					class="mobile-nav-link"
					class:active={currentView === item.id}
					onclick={() => {
						onNavigate(item.id);
						mobileNavOpen = false;
					}}
				>
					<span class="nav-icon">{item.icon}</span>
					{texts[item.labelKey]}
				</button>
			{/each}

			<!-- Mobile: Language + Help inline -->
			<div class="mobile-divider"></div>
			<div class="mobile-lang-row">
				{#each AVAILABLE_LANGS as lang}
					<button
						class="lang-btn"
						class:active={language === lang}
						onclick={() => onLanguageChange(lang)}
					>
						{LANG_FLAGS[lang]}
					</button>
				{/each}
			</div>
			<button
				class="mobile-nav-link"
				class:active={currentView === 'help'}
				onclick={() => { onNavigate('help'); mobileNavOpen = false; }}
			>
				<span class="nav-icon">❓</span>
				{texts.nav_help}
			</button>
			<div class="mobile-version">v0.4.0</div>
		</nav>
	{/if}
</header>

<style>
	.app-header {
		background-color: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.back-link {
		font-size: var(--font-size-sm);
		color: var(--color-primary);
		text-decoration: none;
		font-weight: 500;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-full);
		transition: background var(--transition-fast);
		white-space: nowrap;
	}

	.back-link:hover {
		background: var(--color-primary-50);
	}

	.header-inner {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-3) var(--space-4);
	}

	.logo {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		background: none;
		border: none;
		cursor: pointer;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-md);
		transition: background var(--transition-fast);
	}

	.logo:hover {
		background: var(--color-primary-50);
	}

	.logo-icon {
		font-size: 1.5rem;
		background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
		color: white;
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-sm);
		font-weight: 700;
	}

	.logo-text {
		font-weight: 700;
		font-size: var(--font-size-lg);
		color: var(--color-text);
	}

	/* Desktop Nav */
	.desktop-nav {
		display: flex;
		gap: var(--space-1);
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-4);
		border: none;
		background: none;
		border-radius: var(--radius-full);
		font-family: var(--font-family);
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.nav-link:hover {
		background: var(--color-primary-50);
		color: var(--color-primary);
	}

	.nav-link.active {
		background: var(--color-primary);
		color: white;
	}

	.nav-icon {
		font-size: 1rem;
	}

	/* Header Actions */
	.header-actions {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	/* Settings Gear Dropdown */
	.settings-wrapper {
		position: relative;
	}

	.gear-btn {
		font-size: 1.25rem;
		background: none;
		border: none;
		cursor: pointer;
		padding: var(--space-2);
		border-radius: var(--radius-full);
		transition: all var(--transition-fast);
		line-height: 1;
	}

	.gear-btn:hover {
		background: var(--color-primary-50);
	}

	.settings-backdrop {
		position: fixed;
		inset: 0;
		z-index: 199;
	}

	.settings-dropdown {
		position: absolute;
		right: 0;
		top: calc(100% + var(--space-2));
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		padding: var(--space-3);
		min-width: 200px;
		z-index: 200;
	}

	.settings-section {
		padding: var(--space-2) 0;
	}

	.settings-label {
		font-size: var(--font-size-xs);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
		display: block;
		margin-bottom: var(--space-2);
	}

	.lang-switcher {
		display: flex;
		gap: var(--space-1);
		background: var(--color-bg);
		padding: var(--space-1);
		border-radius: var(--radius-full);
	}

	.lang-btn {
		font-size: 1rem;
		padding: var(--space-1) var(--space-2);
		border: none;
		background: transparent;
		border-radius: var(--radius-full);
		cursor: pointer;
		transition: all var(--transition-fast);
		opacity: 0.5;
	}

	.lang-btn.active {
		background: var(--color-surface);
		box-shadow: var(--shadow-sm);
		opacity: 1;
	}

	.lang-btn:hover {
		opacity: 1;
	}

	.settings-item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		width: 100%;
		padding: var(--space-2) var(--space-2);
		border: none;
		background: none;
		border-radius: var(--radius-md);
		font-family: var(--font-family);
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
		text-align: left;
	}

	.settings-item:hover {
		background: var(--color-primary-50);
		color: var(--color-primary);
	}

	.settings-version {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		text-align: center;
		padding-top: var(--space-2);
		border-top: 1px solid var(--color-border);
		margin-top: var(--space-2);
	}

	/* Mobile */
	.mobile-toggle {
		display: none;
		font-size: 1.25rem;
		background: none;
		border: none;
		cursor: pointer;
		padding: var(--space-2);
		border-radius: var(--radius-sm);
		color: var(--color-text);
	}

	.mobile-nav {
		border-top: 1px solid var(--color-border);
		padding: var(--space-2);
		display: none;
		flex-direction: column;
		gap: var(--space-1);
	}

	.mobile-nav-link {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		border: none;
		background: none;
		border-radius: var(--radius-md);
		font-family: var(--font-family);
		font-size: var(--font-size-base);
		font-weight: 500;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
		width: 100%;
		text-align: left;
	}

	.mobile-nav-link:hover,
	.mobile-nav-link.active {
		background: var(--color-primary-50);
		color: var(--color-primary);
	}

	.mobile-divider {
		height: 1px;
		background: var(--color-border);
		margin: var(--space-2) var(--space-4);
	}

	.mobile-lang-row {
		display: flex;
		gap: var(--space-1);
		padding: var(--space-2) var(--space-4);
	}

	.mobile-version {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		text-align: center;
		padding: var(--space-2) 0;
	}

	@media (max-width: 768px) {
		.desktop-nav {
			display: none;
		}
		.settings-wrapper {
			display: none;
		}
		.mobile-toggle {
			display: block;
		}
		.mobile-nav {
			display: flex;
		}
		.logo-text {
			font-size: var(--font-size-base);
		}
	}
</style>
