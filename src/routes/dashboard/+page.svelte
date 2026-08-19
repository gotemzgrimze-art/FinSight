<script lang="ts">
	import AppNavigation from '$lib/components/AppNavigation.svelte';
	let { data }: { data: { user: { email: string; emailVerified: boolean } | null; isDemoData: boolean; overview: Record<string, string>; projections: Array<{ days: number; current: string }> } } = $props();
</script>

<svelte:head><title>Dashboard | FinSight</title></svelte:head>

<main class="app-shell">
	<AppNavigation user={data.user} />
	<section class="screen service-screen">
		<div class="section-heading">
			<p class="eyebrow">Overview</p>
			<h2>Financial dashboard</h2>
			{#if data.isDemoData}<span class="privacy-pill demo-pill">Synthetic demo data</span>{/if}
		</div>
		<div class="metric-grid dashboard-grid">
			<article class="metric-card tone-safe"><strong>{data.overview.availableCash}</strong><p>Available cash</p></article>
			<article class="metric-card tone-safe"><strong>{data.overview.monthlyNetIncome}</strong><p>Monthly net income</p></article>
			<article class="metric-card tone-caution"><strong>{data.overview.monthlyCommittedExpenses}</strong><p>Monthly committed expenses</p></article>
			<article class="metric-card tone-caution"><strong>{data.overview.monthlyDebtPayments}</strong><p>Monthly debt payments</p></article>
			<article class="metric-card tone-safe"><strong>{data.overview.estimatedDiscretionaryCash}</strong><p>Estimated discretionary cash</p></article>
			<article class="metric-card tone-safe"><strong>{data.overview.emergencyRunway} mo</strong><p>Emergency runway</p></article>
			<article class="metric-card tone-caution"><strong>{data.overview.totalDebt}</strong><p>Total debt</p></article>
			<article class="metric-card tone-safe"><strong>{data.overview.goalProgress}</strong><p>Goal progress</p></article>
			<article class="metric-card tone-caution"><strong>{data.overview.upcoming30Days}</strong><p>Next 30 days</p><span>{data.overview.upcoming7Days} due in the next 7 days</span></article>
		</div>
		<section class="details-panel">
			<div class="panel-heading"><div><p class="eyebrow">Estimated projection</p><h3>Cash-flow outlook</h3></div></div>
			<div class="metric-grid three-up">
				{#each data.projections as projection}
					<article class="metric-card tone-safe"><strong>{projection.current}</strong><p>{projection.days} days</p></article>
				{/each}
			</div>
			<p class="short-note">Projected balances are estimates based on available recurring income, obligations, and current cash.</p>
		</section>
	</section>
</main>
