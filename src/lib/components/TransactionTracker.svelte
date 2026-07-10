<script lang="ts">
	import { calculateTransactionSummary, formatMoney, optionalMoney } from '$lib/calculations';
	import type { Transaction } from '$lib/models';

	let {
		transactions,
		onTransactionChange,
		onAddTransaction,
		onRemoveTransaction
	}: {
		transactions: Transaction[];
		onTransactionChange: (transaction: Transaction) => void;
		onAddTransaction: () => void;
		onRemoveTransaction: (id: string) => void;
	} = $props();

	const safeSummary = $derived.by(() => {
		try {
			return calculateTransactionSummary(transactions);
		} catch {
			return {
				income: 0,
				expenses: 0,
				essentialExpenses: 0,
				discretionaryExpenses: 0,
				net: 0,
				topCategories: []
			};
		}
	});

	const sortedTransactions = $derived(
		[...transactions].sort((left, right) => right.date.localeCompare(left.date))
	);
</script>

<section class="screen service-screen" aria-labelledby="transactions-title">
	<div class="section-heading tight-heading">
		<div>
			<p class="eyebrow">Transaction tracker</p>
			<h2 id="transactions-title">Track money movement manually</h2>
		</div>
		<button class="primary-action" type="button" onclick={onAddTransaction}>Add transaction</button>
	</div>

	<div class="metric-grid four-up">
		<article class="metric-card tone-safe">
			<strong>{formatMoney(safeSummary.income)}</strong>
			<p>Income</p>
			<span>Tracked this month</span>
		</article>
		<article class="metric-card tone-caution">
			<strong>{formatMoney(safeSummary.expenses)}</strong>
			<p>Expenses</p>
			<span>Essential and flexible</span>
		</article>
		<article class="metric-card tone-safe">
			<strong>{formatMoney(safeSummary.net)}</strong>
			<p>Net flow</p>
			<span>Income minus spending</span>
		</article>
		<article class="metric-card tone-caution">
			<strong>{formatMoney(safeSummary.discretionaryExpenses)}</strong>
			<p>Flexible</p>
			<span>Nonessential spending</span>
		</article>
	</div>

	<section class="details-panel">
		<div class="panel-heading">
			<div>
				<p class="eyebrow">Category pulse</p>
				<h3>Largest spending buckets</h3>
			</div>
		</div>
		<div class="category-bars">
			{#each safeSummary.topCategories as item}
				<div>
					<span>{item.category}</span>
					<strong>{formatMoney(item.amount)}</strong>
					<div class="chart-line">
						<div class="chart-fill" style={`width: ${Math.min((item.amount / Math.max(safeSummary.expenses, 1)) * 100, 100)}%`}></div>
					</div>
				</div>
			{:else}
				<p class="short-note">Add expenses to see categories.</p>
			{/each}
		</div>
	</section>

	<section class="details-panel">
		<div class="comparison-table transaction-table" role="table" aria-label="Editable transactions">
			<div class="table-row transaction-row table-head" role="row">
				<span>Date</span>
				<span>Merchant</span>
				<span>Category</span>
				<span>Amount</span>
				<span>Type</span>
				<span>Need</span>
				<span></span>
			</div>
			{#each sortedTransactions as transaction}
				<div class="table-row transaction-row editable-row" role="row">
					<input
						type="date"
						value={transaction.date}
						aria-label="Transaction date"
						oninput={(event) => onTransactionChange({ ...transaction, date: event.currentTarget.value })}
					/>
					<input
						value={transaction.merchant}
						aria-label="Merchant"
						placeholder="Merchant"
						oninput={(event) => onTransactionChange({ ...transaction, merchant: event.currentTarget.value })}
					/>
					<input
						value={transaction.category}
						aria-label="Category"
						placeholder="Category"
						oninput={(event) => onTransactionChange({ ...transaction, category: event.currentTarget.value })}
					/>
					<input
						type="number"
						min="0"
						value={transaction.amount}
						aria-label="Amount"
						oninput={(event) => onTransactionChange({ ...transaction, amount: event.currentTarget.value })}
					/>
					<select
						value={transaction.type}
						aria-label="Transaction type"
						onchange={(event) => onTransactionChange({ ...transaction, type: event.currentTarget.value as Transaction['type'] })}
					>
						<option value="expense">Expense</option>
						<option value="income">Income</option>
					</select>
					<label class="inline-check">
						<input
							type="checkbox"
							checked={transaction.essential}
							onchange={(event) => onTransactionChange({ ...transaction, essential: event.currentTarget.checked })}
						/>
						<span>{transaction.essential ? 'Need' : 'Want'}</span>
					</label>
					<button class="secondary-action" type="button" onclick={() => onRemoveTransaction(transaction.id)}>
						Remove
					</button>
				</div>
			{/each}
		</div>
		<p class="short-note">
			Latest visible entry value:
			{formatMoney(optionalMoney(sortedTransactions[0]?.amount ?? '0', 'latest transaction amount'))}.
		</p>
	</section>
</section>
