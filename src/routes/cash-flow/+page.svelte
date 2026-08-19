<script lang="ts">
	import AppNavigation from '$lib/components/AppNavigation.svelte';
	let { data }: { data: { user: { email: string; emailVerified: boolean } | null; isDemoData: boolean; projections: Array<{ days: number; current: string; afterPurchase: string }> } } = $props();
</script>

<main class="app-shell">
	<AppNavigation user={data.user} />
	<section class="screen service-screen">
		<p class="eyebrow">Cash flow</p>
		<h2>Estimated 30, 60, and 90 day projection</h2>
		{#if data.isDemoData}<span class="privacy-pill demo-pill">Synthetic demo data</span>{/if}
		<div class="metric-grid three-up">
			{#each data.projections as projection}
				<article class="metric-card tone-safe"><strong>{projection.current}</strong><p>{projection.days} days</p><span>Current projection</span></article>
			{/each}
		</div>
		<p class="short-note">These are estimates, not guarantees.</p>
	</section>
</main>
