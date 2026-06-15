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
		formatMoney,
		getProfileCompleteness
	} from '$lib/calculations';
	import type { FinancialProfile } from '$lib/models';

	let { profile }: { profile: FinancialProfile } = $props();

	const readDashboard = () => {
		try {
			const monthlyIncome = calculateMonthlyIncome(profile.annualSalary);
			const monthlyDebt = calculateMonthlyDebtPayment(profile.debts);
			const monthlyLeftover = calculateMonthlyLeftover(profile.annualSalary, profile.monthlyExpenses, profile.debts);
			const debtRatio = calculateDebtRatio(profile.annualSalary, profile.debts);
			const runwayMonths = calculateRunwayMonths(profile.bankBalance, profile.monthlyExpenses, profile.debts);
			const primaryGoal = profile.goals[0];
			const goalProgress = primaryGoal ? calculateGoalProgress(primaryGoal) : 0;
			const goalGap = primaryGoal
				? optionalMoney(primaryGoal.targetAmount, `${primaryGoal.name} target`) -
					optionalMoney(primaryGoal.currentAmount, `${primaryGoal.name} current amount`)
				: 0;
			const safeDailySpend = calculateSafeDailySpend(
				profile.annualSalary,
				profile.monthlyExpenses,
				profile.debts,
				profile.goals
			);

			return {
				error: '',
				monthlyIncome,
				monthlyDebt,
				monthlyLeftover,
				debtRatio,
				runwayMonths,
				primaryGoal,
				goalProgress,
				goalGap,
				safeDailySpend
			};
		} catch (error) {
			return {
				error: error instanceof Error ? error.message : 'Add profile data',
				monthlyIncome: null,
				monthlyDebt: null,
				monthlyLeftover: null,
				debtRatio: null,
				runwayMonths: null,
				primaryGoal: profile.goals[0],
				goalProgress: null,
				goalGap: null,
				safeDailySpend: null
			};
		}
	};

	const snapshot = $derived(readDashboard());
	const completeness = $derived(getProfileCompleteness(profile));
	const hasDashboardData = $derived(!snapshot.error);
	const statusTone = $derived(
		hasDashboardData && snapshot.monthlyLeftover !== null && snapshot.runwayMonths !== null && snapshot.monthlyLeftover >= 0 && snapshot.runwayMonths >= 1
			? 'safe'
			: 'danger'
	);
	const statusText = $derived(
		hasDashboardData && snapshot.monthlyLeftover !== null && snapshot.runwayMonths !== null && snapshot.monthlyLeftover >= 0 && snapshot.runwayMonths >= 1
			? 'Covered this month'
			: 'Add profile data'
	);
</script>

<section class="screen service-screen" aria-labelledby="dashboard-title">
	<div class="question-heading compact-heading">
		<p class="eyebrow">Dashboard</p>
		<h2 id="dashboard-title">Is the customer financially okay right now?</h2>
	</div>

	<article class={`verdict-card tone-${statusTone}`}>
		<div class="verdict-main">
			<p class="status-label">{statusTone === 'safe' ? 'Safe' : 'Setup'}</p>
			<p class="verdict-copy">{statusText}</p>
			<div class="action-strip">
				<span>Profile status</span>
				<strong>{completeness.label}</strong>
			</div>
		</div>
		<div class="verdict-facts" aria-label="Dashboard summary">
			<div>
				<strong>{snapshot.monthlyLeftover === null ? 'Add profile data' : formatMoney(snapshot.monthlyLeftover)}</strong>
				<span>left this month</span>
			</div>
			<div>
				<strong>{snapshot.safeDailySpend === null ? 'Add profile data' : formatMoney(snapshot.safeDailySpend)}</strong>
				<span>safe/day</span>
			</div>
			<div>
				<strong>{snapshot.runwayMonths === null ? 'Add profile data' : `${snapshot.runwayMonths.toFixed(1)} mo`}</strong>
				<span>cash runway</span>
			</div>
		</div>
	</article>

	{#if snapshot.error}
		<section class="notice-panel" role="status">{snapshot.error}</section>
	{/if}

	<div class="metric-grid dashboard-grid" aria-label="Financial snapshot">
		<article class="metric-card tone-safe">
			<strong>{snapshot.monthlyIncome === null ? 'Add profile data' : formatMoney(snapshot.monthlyIncome)}</strong>
			<p>Monthly income</p>
			<span>Annual income divided by 12</span>
		</article>
		<article class={`metric-card tone-${snapshot.debtRatio !== null && snapshot.debtRatio > 36 ? 'caution' : 'safe'}`}>
			<strong>{snapshot.debtRatio === null ? 'Add profile data' : `${snapshot.debtRatio.toFixed(1)}%`}</strong>
			<p>Debt ratio</p>
			<span>{snapshot.monthlyDebt === null ? 'Add debts or profile data' : `${formatMoney(snapshot.monthlyDebt)} minimum payments`}</span>
		</article>
		<article class={`metric-card tone-${snapshot.safeDailySpend !== null && snapshot.safeDailySpend <= 0 ? 'danger' : 'safe'}`}>
			<strong>{snapshot.safeDailySpend === null ? 'Add profile data' : formatMoney(snapshot.safeDailySpend)}</strong>
			<p>Daily allowance</p>
			<span>After bills, debt, and goals</span>
		</article>
	</div>

	<section class="details-panel compact-panel detail-section" aria-labelledby="fund-title">
		<div class="panel-heading">
			<div>
				<p class="eyebrow">Goal</p>
				<h3 id="fund-title">
					{snapshot.primaryGoal?.name ?? 'No goal yet'}:
					{snapshot.goalProgress === null ? 'Add profile data' : `${snapshot.goalProgress.toFixed(0)}%`}
				</h3>
			</div>
			<span class="pill tone-safe">{snapshot.goalGap === null ? 'Add profile data' : `${formatMoney(Math.max(0, snapshot.goalGap))} gap`}</span>
		</div>
		<div class="progress-track" aria-label="Goal progress">
			<div class="progress-fill" style={`width: ${Math.min(snapshot.goalProgress ?? 0, 100)}%`}></div>
		</div>
		<p class="short-note">FinSight provides educational planning tools, not financial advice.</p>
	</section>
</section>
