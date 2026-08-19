<script lang="ts">
	import AppNavigation from '$lib/components/AppNavigation.svelte';
	let { data, form }: { data: { user: { email: string; emailVerified: boolean } | null }; form?: any } = $props();
</script>

<svelte:head><title>Purchase Check | FinSight</title></svelte:head>

<main class="app-shell">
	<AppNavigation user={data.user} />
	<section class="screen service-screen">
		<div class="question-heading compact-heading">
			<p class="eyebrow">Purchase check</p>
			<h2>Calculate purchase impact</h2>
		</div>
		{#if form?.error}<div class="notice-panel">{form.error}</div>{/if}
		<form method="POST" class="details-panel purchase-panel">
			<div class="purchase-input-panel">
				<label><span>Purchase</span><input name="name" value="Laptop" required /></label>
				<label><span>Amount</span><input name="amount" inputmode="decimal" value="1499.00" required /></label>
				<label><span>Category</span><select name="category"><option>Electronics</option><option>Travel</option><option>Healthcare</option><option>Other</option></select></label>
				<button class="primary-action" type="submit">Run check</button>
			</div>
		</form>
		{#if form?.result}
			{#if form.isDemoData}<span class="privacy-pill demo-pill">Synthetic demo data</span>{/if}
			<article class={`verdict-card tone-${form.result.impactLevel.includes('LOW') ? 'safe' : form.result.impactLevel.includes('MODERATE') ? 'caution' : 'danger'}`}>
				<div class="verdict-main">
					<p class="status-label purchase-status">{form.result.impactLevel.replaceAll('_', ' ')}</p>
					<p class="verdict-copy">{form.result.summary}</p>
				</div>
				<div class="verdict-facts">
					<div><strong>{form.result.display.liquidCash}</strong><span>current liquid cash</span></div>
					<div><strong>{form.result.display.cashAfter}</strong><span>after purchase</span></div>
					<div><strong>{form.result.metrics.emergencyRunwayAfterMonths.toFixed(1)} mo</strong><span>runway after</span></div>
				</div>
			</article>
			<section class="details-panel">
				<div class="panel-heading"><div><p class="eyebrow">Why</p><h3>Main factors</h3></div></div>
				<ul class="decision-list">{#each form.result.mainFactors as factor}<li>{factor}</li>{/each}</ul>
				<p class="short-note">Reason codes: {form.result.reasonCodes.join(', ') || 'None'}</p>
			</section>
			<section class="details-panel">
				<div class="panel-heading"><div><p class="eyebrow">Alternatives</p><h3>Lower-impact options</h3></div></div>
				<div class="comparison-table">
					{#each form.result.alternatives as alternative}
						<div class="table-row"><span class="option-cell">{alternative.label}</span><span>{alternative.impact.replaceAll('_', ' ')}</span><span>{alternative.description}</span></div>
					{/each}
				</div>
			</section>
		{/if}
	</section>
</main>
