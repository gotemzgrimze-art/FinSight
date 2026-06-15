<script lang="ts">
	import {
		calculateAllowanceRemaining,
		calculateAllowanceUsagePercent,
		calculateSafeDailyAllowanceSpend,
		formatMoney
	} from '$lib/calculations';
	import type { Allowance } from '$lib/models';

	let {
		allowances,
		onAllowanceChange,
		onAddAllowance,
		onRemoveAllowance
	}: {
		allowances: Allowance[];
		onAllowanceChange: (allowance: Allowance) => void;
		onAddAllowance: () => void;
		onRemoveAllowance: (id: string) => void;
	} = $props();

	const allowanceSnapshot = (allowance: Allowance) => {
		try {
			const remaining = calculateAllowanceRemaining(allowance.limit, allowance.spent);
			const usage = calculateAllowanceUsagePercent(allowance.limit, allowance.spent);
			const daysLeft = allowance.period === 'weekly' ? 7 : 30;
			return {
				error: '',
				remaining,
				usage,
				safeDaily: calculateSafeDailyAllowanceSpend(remaining, daysLeft)
			};
		} catch (error) {
			return {
				error: error instanceof Error ? error.message : 'Fix allowance data',
				remaining: null,
				usage: 0,
				safeDaily: null
			};
		}
	};
</script>

<section class="details-panel">
	<div class="section-heading tight-heading">
		<div>
			<p class="eyebrow">Allowance tracker</p>
			<h3>Weekly and monthly limits</h3>
		</div>
		<button class="secondary-action" type="button" onclick={onAddAllowance}>Add allowance</button>
	</div>

	<div class="stack-list">
		{#each allowances as allowance}
			{@const snapshot = allowanceSnapshot(allowance)}
			<div class="allowance-row">
				<div class="mini-grid">
					<input value={allowance.name} aria-label="Allowance name" oninput={(event) => onAllowanceChange({ ...allowance, name: event.currentTarget.value })} />
					<input type="number" min="0" value={allowance.limit} aria-label="Allowance limit" oninput={(event) => onAllowanceChange({ ...allowance, limit: event.currentTarget.value })} />
					<input type="number" min="0" value={allowance.spent} aria-label="Allowance spent" oninput={(event) => onAllowanceChange({ ...allowance, spent: event.currentTarget.value })} />
					<select value={allowance.period} aria-label="Allowance period" onchange={(event) => onAllowanceChange({ ...allowance, period: event.currentTarget.value as 'weekly' | 'monthly' })}>
						<option value="weekly">Weekly</option>
						<option value="monthly">Monthly</option>
					</select>
					<button class="secondary-action" type="button" onclick={() => onRemoveAllowance(allowance.id)}>Remove</button>
				</div>
				<div class="chart-line" aria-label={`${allowance.name} allowance usage`}>
					<div class="chart-fill" style={`width: ${snapshot.usage}%`}></div>
				</div>
				<p class="short-note">
					{#if snapshot.error}
						{snapshot.error}
					{:else}
						{formatMoney(snapshot.remaining ?? 0)} remaining this {allowance.period === 'weekly' ? 'week' : 'month'}.
						{formatMoney(snapshot.safeDaily ?? 0)} safe/day.
					{/if}
				</p>
			</div>
		{/each}
	</div>
</section>
