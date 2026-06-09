<script lang="ts">
	import {
		calculateDebtRatio,
		calculateMonthlyLeftover,
		calculateSafeDailySpend,
		formatMoney
	} from '$lib/calculations';
	import type { FinancialProfile, SubscriptionState } from '$lib/models';
	import { getSubscriptionLimits } from '$lib/subscription';

	let { profile, subscription }: { profile: FinancialProfile; subscription: SubscriptionState } = $props();

	const safe = (compute: () => number) => {
		try {
			return compute();
		} catch {
			return 0;
		}
	};

	const monthlyLeftover = $derived(
		safe(() => calculateMonthlyLeftover(profile.annualSalary, profile.monthlyExpenses, profile.debts))
	);
	const debtRatio = $derived(safe(() => calculateDebtRatio(profile.annualSalary, profile.debts)));
	const dailySpend = $derived(
		safe(() => calculateSafeDailySpend(profile.annualSalary, profile.monthlyExpenses, profile.debts, profile.goals))
	);
	const limits = $derived(getSubscriptionLimits(subscription));
</script>

<section class="screen service-screen review-screen" aria-labelledby="review-title">
	<div class="section-heading">
		<p class="eyebrow">Customer overview</p>
		<h2 id="review-title">What the customer sees at a glance</h2>
	</div>

	<ul class="checklist overview-list">
		<li>
			<span aria-hidden="true">Status</span>
			<strong>{monthlyLeftover >= 0 ? 'Covered' : 'Short'}</strong>
			<p>{formatMoney(monthlyLeftover)} after expenses and debt.</p>
		</li>
		<li>
			<span aria-hidden="true">Spend</span>
			<strong>{formatMoney(dailySpend)}/day</strong>
			<p>Safe daily spend after goals.</p>
		</li>
		<li>
			<span aria-hidden="true">Debt</span>
			<strong>{debtRatio.toFixed(1)}%</strong>
			<p>Debt ratio from the editable debt list.</p>
		</li>
		<li>
			<span aria-hidden="true">Plan</span>
			<strong>{subscription.tier}</strong>
			<p>{limits.forecastMonths}-month forecast window in this mock tier.</p>
		</li>
	</ul>
	<p class="short-note">FinSight provides educational planning tools, not financial advice.</p>
</section>
