<script lang="ts">
	import {
		calculateAssetTotal,
		calculateDebtBalance,
		calculateMonthlyPlan,
		calculateNetWorth,
		calculateRunwayMonths,
		calculateTransactionSummary,
		formatMoney,
		generateMoneyInsights,
		getProfileCompleteness,
		getUpcomingRecurringItems
	} from '$lib/calculations';
	import type { FinancialProfile, SubscriptionState } from '$lib/models';
	import { getSubscriptionLimits } from '$lib/subscription';

	let {
		profile,
		subscription,
		onSelect
	}: {
		profile: FinancialProfile;
		subscription: SubscriptionState;
		onSelect: (section: string) => void;
	} = $props();

	const safe = <T>(compute: () => T, fallback: T): T => {
		try {
			return compute();
		} catch {
			return fallback;
		}
	};

	const plan = $derived(safe(() => calculateMonthlyPlan(profile), {
		monthlyIncome: 0,
		expenses: 0,
		debtPayments: 0,
		goalContributions: 0,
		recurringTotal: 0,
		leftover: 0,
		fixedPressure: 0,
		fixedRatio: 0
	}));
	const transactionSummary = $derived(safe(() => calculateTransactionSummary(profile.transactions), {
		income: 0,
		expenses: 0,
		essentialExpenses: 0,
		discretionaryExpenses: 0,
		net: 0,
		topCategories: []
	}));
	const assetTotal = $derived(safe(() => calculateAssetTotal(profile.assets), 0));
	const debtTotal = $derived(safe(() => calculateDebtBalance(profile.debts), 0));
	const netWorth = $derived(safe(() => calculateNetWorth(profile.assets, profile.debts), 0));
	const runway = $derived(safe(() => calculateRunwayMonths(profile.bankBalance, profile.monthlyExpenses, profile.debts), 0));
	const insights = $derived(safe(() => generateMoneyInsights(profile), []));
	const upcoming = $derived(safe(() => getUpcomingRecurringItems(profile.recurringItems), []));
	const completeness = $derived(getProfileCompleteness(profile));
	const limits = $derived(getSubscriptionLimits(subscription));
	const heroTone = $derived(plan.leftover < 0 || runway < 1 ? 'danger' : plan.fixedRatio > 75 ? 'caution' : 'safe');
	const heroCopy = $derived(
		heroTone === 'safe'
			? 'Your current plan has room for decisions.'
			: heroTone === 'caution'
				? 'Your plan works, but fixed costs are tight.'
				: 'Pause optional purchases until the plan is balanced.'
	);
</script>

<section class="screen command-screen" aria-labelledby="dashboard-title">
	<div class="command-hero tone-{heroTone}">
		<div>
			<p class="eyebrow">Money command center</p>
			<h2 id="dashboard-title">{heroCopy}</h2>
			<p class="hero-note">
				{formatMoney(plan.leftover)} monthly room after expenses, debt, and goal funding.
			</p>
			<div class="hero-actions">
				<button class="primary-action" type="button" onclick={() => onSelect('purchase')}>Check purchase</button>
				<button class="secondary-action" type="button" onclick={() => onSelect('transactions')}>Review spending</button>
			</div>
		</div>
		<div class="command-score">
			<span>Profile</span>
			<strong>{completeness.label}</strong>
			<small>{limits.forecastMonths}-month forecast window</small>
		</div>
	</div>

	<div class="metric-grid four-up" aria-label="Money snapshot">
		<article class="metric-card tone-safe">
			<strong>{formatMoney(plan.leftover)}</strong>
			<p>Monthly room</p>
			<span>After bills, debt, and goals</span>
		</article>
		<article class="metric-card tone-caution">
			<strong>{runway.toFixed(1)} mo</strong>
			<p>Cash runway</p>
			<span>Based on expenses and debt payments</span>
		</article>
		<article class="metric-card tone-safe">
			<strong>{formatMoney(netWorth)}</strong>
			<p>Net worth</p>
			<span>{formatMoney(assetTotal)} assets minus {formatMoney(debtTotal)} debt</span>
		</article>
		<article class="metric-card tone-caution">
			<strong>{formatMoney(transactionSummary.discretionaryExpenses)}</strong>
			<p>Flexible spend</p>
			<span>Tracked nonessential spending this month</span>
		</article>
	</div>

	<div class="command-grid">
		<section class="details-panel">
			<div class="panel-heading">
				<div>
					<p class="eyebrow">Next actions</p>
					<h3>What to do now</h3>
				</div>
			</div>
			<div class="insight-list">
				{#each insights as insight}
					<article class="insight-item tone-{insight.tone}">
						<span>{insight.title}</span>
						<p>{insight.body}</p>
						<strong>{insight.action}</strong>
					</article>
				{:else}
					<p class="short-note">Add profile data to generate guidance.</p>
				{/each}
			</div>
		</section>

		<section class="details-panel">
			<div class="panel-heading">
				<div>
					<p class="eyebrow">Cash flow</p>
					<h3>Income versus commitments</h3>
				</div>
			</div>
			<div class="cashflow-stack">
				<div>
					<span>Income</span>
					<strong>{formatMoney(plan.monthlyIncome)}</strong>
				</div>
				<div>
					<span>Expenses</span>
					<strong>{formatMoney(plan.expenses)}</strong>
				</div>
				<div>
					<span>Debt</span>
					<strong>{formatMoney(plan.debtPayments)}</strong>
				</div>
				<div>
					<span>Goals</span>
					<strong>{formatMoney(plan.goalContributions)}</strong>
				</div>
			</div>
			<div class="wide-progress" aria-label="Fixed-cost pressure">
				<div style={`width: ${Math.min(plan.fixedRatio, 100)}%`}></div>
			</div>
			<p class="short-note">{plan.fixedRatio.toFixed(1)}% of income is assigned before flexible spending.</p>
		</section>
	</div>

	<div class="command-grid">
		<section class="details-panel">
			<div class="panel-heading">
				<div>
					<p class="eyebrow">Upcoming</p>
					<h3>Bills and subscriptions</h3>
				</div>
				<button class="secondary-action" type="button" onclick={() => onSelect('recurring')}>Manage</button>
			</div>
			<ul class="compact-feed">
				{#each upcoming as item}
					<li>
						<span>{item.name}</span>
						<strong>{formatMoney(Number(item.amount))}</strong>
						<small>Day {item.dueDay} · {item.category}</small>
					</li>
				{:else}
					<li><span>No upcoming recurring items</span></li>
				{/each}
			</ul>
		</section>

		<section class="details-panel">
			<div class="panel-heading">
				<div>
					<p class="eyebrow">Top categories</p>
					<h3>Where spending goes</h3>
				</div>
				<button class="secondary-action" type="button" onclick={() => onSelect('transactions')}>Open</button>
			</div>
			<div class="category-bars">
				{#each transactionSummary.topCategories as item}
					<div>
						<span>{item.category}</span>
						<strong>{formatMoney(item.amount)}</strong>
						<div class="chart-line">
							<div class="chart-fill" style={`width: ${Math.min((item.amount / Math.max(transactionSummary.expenses, 1)) * 100, 100)}%`}></div>
						</div>
					</div>
				{:else}
					<p class="short-note">Add transactions to see category trends.</p>
				{/each}
			</div>
		</section>
	</div>
</section>
