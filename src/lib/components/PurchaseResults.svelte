<script lang="ts">
	import type { ProductOption, PurchaseAssessment } from '$lib/models';

	let {
		assessment,
		selectedProduct,
		showInvestment
	}: {
		assessment: PurchaseAssessment | null;
		selectedProduct: ProductOption;
		showInvestment: boolean;
	} = $props();

	const currentBarHeight = $derived(
		assessment ? Math.max(48, Math.round((assessment.principal / Math.max(assessment.futureAmount, 1)) * 154)) : 48
	);
</script>

{#if assessment}
	<article class={`verdict-card tone-${assessment.tone}`}>
		<div class="verdict-main">
			<p class="status-label purchase-status">{assessment.verdict}</p>
			<p class="verdict-copy">{assessment.impact}</p>
			<div class="action-strip">
				<span>Necessity</span>
				<strong>{assessment.necessity}</strong>
			</div>
		</div>
		<div class="verdict-facts" aria-label="Purchase result summary">
			<div>
				<strong>{assessment.workCost}</strong>
				<span>work cost</span>
			</div>
			<div>
				<strong>{assessment.balanceAfter}</strong>
				<span>balance after</span>
			</div>
			<div>
				<strong>{selectedProduct.name}</strong>
				<span>category</span>
			</div>
		</div>
	</article>

	<div class="pros-cons-grid" aria-label="Purchase pros and cons">
		<section class="details-panel">
			<div class="panel-heading">
				<div>
					<p class="eyebrow">Pros</p>
					<h3>What helps this purchase</h3>
				</div>
			</div>
			<ul class="decision-list">
				{#each assessment.pros as pro}
					<li>{pro}</li>
				{/each}
			</ul>
		</section>

		<section class="details-panel">
			<div class="panel-heading">
				<div>
					<p class="eyebrow">Cons</p>
					<h3>What to watch</h3>
				</div>
			</div>
			<ul class="decision-list">
				{#each assessment.cons as con}
					<li>{con}</li>
				{/each}
			</ul>
		</section>
	</div>

	<section class="details-panel detail-section" aria-labelledby="alternatives-title">
		<div class="panel-heading">
			<div>
				<p class="eyebrow">Alternatives</p>
				<h3 id="alternatives-title">Compare the options</h3>
			</div>
		</div>

		<div class="comparison-table" role="table" aria-label="Purchase scenarios">
			<div class="table-row table-head" role="row">
				<span role="columnheader">Option</span>
				<span role="columnheader">Result</span>
				<span role="columnheader">Time cost</span>
				<span role="columnheader">Verdict</span>
			</div>
			{#each assessment.alternatives as scenario}
				<div class="table-row" role="row">
					<span class="option-cell" role="cell">{scenario.option}</span>
					<span role="cell">{scenario.result}</span>
					<span role="cell">{scenario.timeCost}</span>
					<span role="cell" class={`pill tone-${scenario.tone}`}>{scenario.verdict}</span>
				</div>
			{/each}
		</div>
	</section>

	{#if showInvestment}
		<section class="details-panel detail-section" aria-labelledby="future-title">
			<div class="panel-heading">
				<div>
					<p class="eyebrow">Future impact</p>
					<h3 id="future-title">Investment opportunity cost</h3>
				</div>
				<strong class="future-number">{assessment.futureValue}</strong>
			</div>
				<div class="simple-chart" aria-label="Investment opportunity cost">
				<div class="bar current" style={`height: ${currentBarHeight}px`}>
					<small>Today</small>
					<span>{assessment.alternatives[3]?.result.replace(' preserved', '')}</span>
				</div>
				<div class="bar future" style="height: 154px">
					<small>15 years</small>
					<span>{assessment.futureValue}</span>
				</div>
			</div>
			<p class="short-note">Skipping could add about {assessment.opportunityGain} before taxes and inflation.</p>
		</section>
	{/if}
{:else}
	<section class="details-panel">
		<p class="short-note">Enter a purchase and run a check to see a verdict, alternatives, and dynamic impact.</p>
	</section>
{/if}
