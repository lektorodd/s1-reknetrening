<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';

	const LINKS = [
		{ href: '/tren/', label: 'Tren' },
		{ href: '/laer/', label: 'Lærebok' },
		{ href: '/framgang/', label: 'Framgang' }
	];

	const path = $derived(page.url.pathname);

	function isActive(href: string): boolean {
		return path === `${base}${href}` || path.startsWith(`${base}${href}`);
	}
</script>

<header class="app-header">
	<a class="brand" href={`${base}/`}>
		<span class="brand-mark" aria-hidden="true">∑</span>
		<span class="brand-name">Mattetrening</span>
	</a>

	<nav aria-label="Hovudmeny">
		{#each LINKS as link (link.href)}
			<a
				href={`${base}${link.href}`}
				class="nav-link"
				aria-current={isActive(link.href) ? 'page' : undefined}
			>
				{link.label}
			</a>
		{/each}
	</nav>
</header>

<style>
	.app-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		flex-wrap: wrap;
		padding: var(--space-4) var(--space-6);
		background: var(--color-surface);
		border-bottom: 1px solid var(--color-border-warm);
	}

	.nav-link:hover {
		text-decoration: none;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		text-decoration: none;
		color: var(--color-text);
		font-weight: 700;
	}

	.brand-mark {
		display: grid;
		place-items: center;
		width: 2rem;
		height: 2rem;
		border-radius: var(--radius-full);
		background: var(--color-primary);
		color: var(--color-text-inverse);
		font-size: var(--font-size-lg);
	}

	nav {
		display: flex;
		gap: var(--space-1);
	}

	.nav-link {
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-md);
		text-decoration: none;
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
		font-weight: 600;
		transition: background var(--transition-fast), color var(--transition-fast);
	}

	.nav-link:hover {
		background: var(--color-primary-50);
		color: var(--color-primary);
	}

	.nav-link[aria-current='page'] {
		background: var(--color-primary);
		color: var(--color-text-inverse);
	}

	@media (max-width: 480px) {
		.app-header {
			padding: var(--space-3) var(--space-4);
		}

		.brand-name {
			display: none;
		}
	}
</style>
