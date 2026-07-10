<script lang="ts">
	import { calculateAssetTotal, calculateDebtBalance, calculateNetWorth, formatMoney, optionalMoney } from '$lib/calculations';
	import type { AssetAccount, Debt } from '$lib/models';

	let {
		assets,
		debts,
		onAssetChange,
		onAddAsset,
		onRemoveAsset
	}: {
		assets: AssetAccount[];
		debts: Debt[];
		onAssetChange: (asset: AssetAccount) => void;
		onAddAsset: () => void;
		onRemoveAsset: (id: string) => void;
	} = $props();

	const safe = <T>(compute: () => T, fallback: T): T => {
		try {
			return compute();
		} catch {
			return fallback;
		}
	};

	const assetTotal = $derived(safe(() => calculateAssetTotal(assets), 0));
	const debtTotal = $derived(safe(() => calculateDebtBalance(debts), 0));
	const netWorth = $derived(safe(() => calculateNetWorth(assets, debts), 0));
	const largestValue = $derived(Math.max(assetTotal, debtTotal, 1));
</script>

<section class="screen service-screen" aria-labelledby="wealth-title">
	<div class="section-heading tight-heading">
		<div>
			<p class="eyebrow">Net worth</p>
			<h2 id="wealth-title">See the whole balance sheet</h2>
		</div>
		<button class="primary-action" type="button" onclick={onAddAsset}>Add asset</button>
	</div>

	<article class="verdict-card tone-{netWorth >= 0 ? 'safe' : 'danger'}">
		<div class="verdict-main">
			<p class="status-label purchase-status">{formatMoney(netWorth)}</p>
			<p class="verdict-copy">Assets minus tracked debt.</p>
		</div>
		<div class="verdict-facts">
			<div>
				<strong>{formatMoney(assetTotal)}</strong>
				<span>assets</span>
			</div>
			<div>
				<strong>{formatMoney(debtTotal)}</strong>
				<span>debt balance</span>
			</div>
			<div>
				<strong>{assets.length}</strong>
				<span>asset accounts</span>
			</div>
		</div>
	</article>

	<section class="details-panel">
		<div class="panel-heading">
			<div>
				<p class="eyebrow">Balance mix</p>
				<h3>Assets compared with debt</h3>
			</div>
		</div>
		<div class="wealth-bars">
			<div>
				<span>Assets</span>
				<strong>{formatMoney(assetTotal)}</strong>
				<div class="chart-line"><div class="chart-fill" style={`width: ${(assetTotal / largestValue) * 100}%`}></div></div>
			</div>
			<div>
				<span>Debt</span>
				<strong>{formatMoney(debtTotal)}</strong>
				<div class="chart-line debt-fill"><div class="chart-fill" style={`width: ${(debtTotal / largestValue) * 100}%`}></div></div>
			</div>
		</div>
	</section>

	<section class="details-panel">
		<div class="comparison-table asset-table" role="table" aria-label="Editable asset accounts">
			<div class="table-row asset-row table-head" role="row">
				<span>Name</span>
				<span>Type</span>
				<span>Balance</span>
				<span>Share</span>
				<span></span>
			</div>
			{#each assets as asset}
				{@const balance = safe(() => optionalMoney(asset.balance, `${asset.name} balance`), 0)}
				<div class="table-row asset-row editable-row" role="row">
					<input
						value={asset.name}
						aria-label="Asset name"
						oninput={(event) => onAssetChange({ ...asset, name: event.currentTarget.value })}
					/>
					<select
						value={asset.type}
						aria-label="Asset type"
						onchange={(event) => onAssetChange({ ...asset, type: event.currentTarget.value as AssetAccount['type'] })}
					>
						<option value="cash">Cash</option>
						<option value="investment">Investment</option>
						<option value="retirement">Retirement</option>
						<option value="property">Property</option>
						<option value="other">Other</option>
					</select>
					<input
						type="number"
						min="0"
						value={asset.balance}
						aria-label="Asset balance"
						oninput={(event) => onAssetChange({ ...asset, balance: event.currentTarget.value })}
					/>
					<span>{assetTotal > 0 ? `${((balance / assetTotal) * 100).toFixed(1)}%` : '0%'}</span>
					<button class="secondary-action" type="button" onclick={() => onRemoveAsset(asset.id)}>Remove</button>
				</div>
			{/each}
		</div>
	</section>
</section>
