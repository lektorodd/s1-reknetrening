<script lang="ts">
	import '../app.css';
	import AppHeader from '$lib/components/AppHeader.svelte';

	let { children } = $props();
</script>

<div class="app-shell">
	<AppHeader />
	<main>
		{@render children()}
	</main>
</div>

<style>
	/* Deliberately transparent: the grid lives on <body>, and a solid fill here
	   would paint straight over it. */
	.app-shell {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	main {
		flex: 1;
		width: 100%;
		max-width: 56rem;
		margin: 0 auto;
		padding: var(--space-6) var(--space-4) var(--space-12);
	}
</style>
