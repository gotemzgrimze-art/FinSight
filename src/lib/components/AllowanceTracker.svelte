<script lang="ts">
	import { formatMoney, optionalMoney } from '$lib/calculations';
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

	const remaining = (allowance: Allowance) => {
		try {
			return optionalMoney(allowance.limit, `${allowance.name} limit`) - optionalMoney(allowance.spent, `${allowance.name} spent`);
		} catch {
			return 0;
		}
	};

	const percentUsed = (allowance: Allowance) => {
		try {
			const limit = optionalMoney(allowance.limit, `${allowance.name} limit`);
			return limit > 0 ? Math.min((optionalMoney(allowance.spent, `${allowance.name} spent`) / limit) * 100, 100) : 0;
		} catch {
			return 0;
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
					<div class="chart-fill" style={`width: ${percentUsed(allowance)}%`}></div>
				</div>
				<p class="short-note">{formatMoney(remaining(allowance))} remaining this {allowance.period === 'weekly' ? 'week' : 'month'}</p>
			</div>
		{/each}
	</div>
</section>
