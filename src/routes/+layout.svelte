<script lang="ts">
	import '../app.css';
	import AppHeader from '$lib/components/AppHeader.svelte';
	import { onMount } from 'svelte';
	import { isAvailable } from '$lib/utils/storage';

	let { children } = $props();

	// Checked in the browser only; the prerendered page assumes storage works.
	let storageBlocked = $state(false);
	onMount(() => {
		storageBlocked = !isAvailable();
	});
</script>

<div class="app-shell">
	<AppHeader />
	{#if storageBlocked}
		<p class="storage-note" role="status">
			Nettlesaren lagrar ikkje framgangen din i dette vindauget. Du kan øva, men alt blir
			borte når du lukkar det. Opnar du appen i eit vanleg vindauge, blir det teke vare på.
		</p>
	{/if}
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

	/* Calm, not an alarm: practice still works, it just is not kept. */
	.storage-note {
		/* Same column as <main>'s content: centred, and keeping its side gutter
		   on a phone. */
		box-sizing: border-box;
		width: min(calc(100% - 2 * var(--space-4)), calc(56rem - 2 * var(--space-4)));
		margin: var(--space-4) auto 0;
		padding: var(--space-3) var(--space-4);
		border-left: var(--accent-edge) solid var(--color-warning);
		border-radius: var(--radius-sm);
		background: var(--color-warning-light);
		font-size: var(--font-size-sm);
		color: var(--color-text);
	}

	main {
		flex: 1;
		width: 100%;
		max-width: 56rem;
		margin: 0 auto;
		padding: var(--space-6) var(--space-4) var(--space-12);
	}
</style>
