<script lang="ts">
	import AppNavigation from '$lib/components/AppNavigation.svelte';
	let { data }: { data: { user: { email: string; emailVerified: boolean } | null; isDemoData: boolean; transactions: Array<{ id: string; date: string; merchant: string; description: string; category: string; amount: string }> } } = $props();
	let query = $state('');
	let category = $state('All');
	const categories = $derived(['All', ...new Set(data.transactions.map((transaction) => transaction.category))]);
	const filtered = $derived(data.transactions.filter((transaction) => {
		const matchesQuery = `${transaction.merchant} ${transaction.description}`.toLowerCase().includes(query.toLowerCase());
		const matchesCategory = category === 'All' || transaction.category === category;
		return matchesQuery && matchesCategory;
	}));
</script>

<main class="app-shell">
	<AppNavigation user={data.user} />
	<section class="screen service-screen">
		<div class="section-heading"><p class="eyebrow">Transactions</p><h2>Activity and categories</h2>{#if data.isDemoData}<span class="privacy-pill demo-pill">Synthetic demo data</span>{/if}</div>
		<div class="purchase-input-panel">
			<label><span>Search</span><input bind:value={query} placeholder="Merchant or description" /></label>
			<label><span>Category</span><select bind:value={category}>{#each categories as option}<option>{option}</option>{/each}</select></label>
		</div>
		<div class="comparison-table">
			<div class="table-row table-head"><span>Date</span><span>Merchant</span><span>Description</span><span>Category</span><span>Amount</span></div>
			{#each filtered as transaction}
				<div class="table-row"><span>{transaction.date}</span><span class="option-cell">{transaction.merchant}</span><span>{transaction.description}</span><span>{transaction.category}</span><span>{transaction.amount}</span></div>
			{:else}
				<p class="short-note">No transactions match these filters.</p>
			{/each}
		</div>
	</section>
</main>
