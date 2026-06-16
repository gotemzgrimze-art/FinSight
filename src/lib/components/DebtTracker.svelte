<script lang="ts">
	import { calculateDebtPayoffMonths, formatMoney, optionalMoney } from '$lib/calculations';
	import type { Debt } from '$lib/models';

	let {
		debts,
		onDebtChange,
		onAddDebt,
		onRemoveDebt
	}: {
		debts: Debt[];
		onDebtChange: (debt: Debt) => void;
		onAddDebt: () => void;
		onRemoveDebt: (id: string) => void;
	} = $props();

	const payoffLabel = (debt: Debt) => {
		try {
			const months = calculateDebtPayoffMonths(debt);
			if (!Number.isFinite(months)) return 'No payoff';
			return `${months} mo`;
		} catch {
			return 'Needs data';
		}
	};

	const debtTotal = $derived(
		(() => {
			try {
				return {
					error: '',
					value: debts.reduce((total, debt) => total + optionalMoney(debt.balance, `${debt.name} balance`), 0)
				};
			} catch (error) {
				return {
					error: error instanceof Error ? error.message : 'Fix debt data',
					value: null
				};
			}
		})()
	);
</script>

<section class="details-panel">
	<div class="section-heading tight-heading">
		<div>
			<p class="eyebrow">Debt tracker</p>
			<h3>{debtTotal.value === null ? 'Fix debt data' : `${formatMoney(debtTotal.value)} total balance`}</h3>
		</div>
		<button class="secondary-action" type="button" onclick={onAddDebt}>Add debt</button>
	</div>

	{#if debtTotal.error}
		<p class="field-warning">{debtTotal.error}</p>
	{/if}

	{#if debts.length > 0}
		<div class="comparison-table" role="table" aria-label="Debt list">
			<div class="table-row table-head" role="row">
				<span>Name</span>
				<span>Balance</span>
				<span>Payment</span>
				<span>APR</span>
				<span>Payoff</span>
			</div>
			{#each debts as debt}
				<div class="table-row editable-row" role="row">
					<input value={debt.name} aria-label="Debt name" oninput={(event) => onDebtChange({ ...debt, name: event.currentTarget.value })} />
					<input type="number" min="0" value={debt.balance} aria-label="Debt balance" oninput={(event) => onDebtChange({ ...debt, balance: event.currentTarget.value })} />
					<input type="number" min="0" value={debt.minimumPayment} aria-label="Debt payment" oninput={(event) => onDebtChange({ ...debt, minimumPayment: event.currentTarget.value })} />
					<input type="number" min="0" value={debt.annualInterestRate} aria-label="Debt APR" oninput={(event) => onDebtChange({ ...debt, annualInterestRate: event.currentTarget.value })} />
					<span>
						{payoffLabel(debt)}
						<button class="text-action" type="button" onclick={() => onRemoveDebt(debt.id)}>Remove</button>
					</span>
				</div>
			{/each}
		</div>
	{:else}
		<p class="empty-state">No debts added. Add one to compare debt payoff against purchases.</p>
	{/if}
</section>
