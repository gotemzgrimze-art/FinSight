<script lang="ts">
	import {
		calculateDebtRatio,
		calculateGoalProgress,
		calculateMonthlyDebtPayment,
		calculateMonthlyIncome,
		calculateMonthlyLeftover,
		optionalMoney,
		calculateRunwayMonths,
		calculateSafeDailySpend,
		formatMoney
	} from '$lib/calculations';
	import type { FinancialProfile } from '$lib/models';

	let { profile }: { profile: FinancialProfile } = $props();

	const safe = (compute: () => number) => {
		try {
			return compute();
		} catch {
			return 0;
		}
	};

	const monthlyIncome = $derived(safe(() => calculateMonthlyIncome(profile.annualSalary)));
	const monthlyDebt = $derived(safe(() => calculateMonthlyDebtPayment(profile.debts)));
	const monthlyLeftover = $derived(
		safe(() => calculateMonthlyLeftover(profile.annualSalary, profile.monthlyExpenses, profile.debts))
	);
	const debtRatio = $derived(safe(() => calculateDebtRatio(profile.annualSalary, profile.debts)));
	const runwayMonths = $derived(
		safe(() => calculateRunwayMonths(profile.bankBalance, profile.monthlyExpenses, profile.debts))
	);
	const primaryGoal = $derived(profile.goals[0]);
	const goalProgress = $derived(primaryGoal ? safe(() => calculateGoalProgress(primaryGoal)) : 0);
	const goalGap = $derived(
		primaryGoal
			? safe(
					() =>
						optionalMoney(primaryGoal.targetAmount, `${primaryGoal.name} target`) -
						optionalMoney(primaryGoal.currentAmount, `${primaryGoal.name} current amount`)
				)
			: 0
	);
	const safeDailySpend = $derived(
		safe(() => calculateSafeDailySpend(profile.annualSalary, profile.monthlyExpenses, profile.debts, profile.goals))
	);
	const statusTone = $derived(monthlyLeftover >= 0 && runwayMonths >= 1 ? 'safe' : 'danger');
	const statusText = $derived(
		monthlyLeftover >= 0 && runwayMonths >= 1 ? 'Covered this month' : 'Needs attention'
	);
</script>

<section class="screen service-screen" aria-labelledby="dashboard-title">
	<div class="question-heading compact-heading">
		<p class="eyebrow">Dashboard</p>
		<h2 id="dashboard-title">Is the customer financially okay right now?</h2>
	</div>

	<article class={`verdict-card tone-${statusTone}`}>
		<div class="verdict-main">
			<p class="status-label">{statusTone === 'safe' ? 'Safe' : 'Risk'}</p>
			<p class="verdict-copy">{statusText}</p>
		</div>
		<div class="verdict-facts" aria-label="Dashboard summary">
			<div>
				<strong>{formatMoney(monthlyLeftover)}</strong>
				<span>left this month</span>
			</div>
			<div>
				<strong>{formatMoney(safeDailySpend)}</strong>
				<span>safe/day</span>
			</div>
			<div>
				<strong>{runwayMonths.toFixed(1)} mo</strong>
				<span>cash runway</span>
			</div>
		</div>
	</article>

	<div class="metric-grid dashboard-grid" aria-label="Financial snapshot">
		<article class="metric-card tone-safe">
			<strong>{formatMoney(monthlyIncome)}</strong>
			<p>Monthly income</p>
			<span>Annual income divided by 12</span>
		</article>
		<article class={`metric-card tone-${debtRatio > 36 ? 'caution' : 'safe'}`}>
			<strong>{debtRatio.toFixed(1)}%</strong>
			<p>Debt ratio</p>
			<span>{formatMoney(monthlyDebt)} minimum payments</span>
		</article>
		<article class={`metric-card tone-${safeDailySpend <= 0 ? 'danger' : 'safe'}`}>
			<strong>{formatMoney(safeDailySpend)}</strong>
			<p>Daily allowance</p>
			<span>After bills, debt, and goals</span>
		</article>
	</div>

	<section class="details-panel compact-panel detail-section" aria-labelledby="fund-title">
		<div class="panel-heading">
			<div>
				<p class="eyebrow">Goal</p>
				<h3 id="fund-title">{primaryGoal?.name ?? 'No goal yet'}: {goalProgress.toFixed(0)}%</h3>
			</div>
			<span class="pill tone-safe">{formatMoney(Math.max(0, goalGap))} gap</span>
		</div>
		<div class="progress-track" aria-label="Goal progress">
			<div class="progress-fill" style={`width: ${Math.min(goalProgress, 100)}%`}></div>
		</div>
		<p class="short-note">FinSight provides educational planning tools, not financial advice.</p>
	</section>
</section>
