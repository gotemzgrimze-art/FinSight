<script lang="ts">
	import type { ProductCategory, ProductOption, PurchaseInput } from '$lib/models';

	let {
		purchase,
		productOptions,
		onPurchaseField,
		onRunCheck,
		canRunCheck
	}: {
		purchase: PurchaseInput;
		productOptions: ProductOption[];
		onPurchaseField: (key: keyof PurchaseInput, value: string) => void;
		onRunCheck: () => void;
		canRunCheck: boolean;
	} = $props();
</script>

<section class="purchase-input-panel" aria-label="Purchase details">
	<label>
		<span>What does the customer want to buy?</span>
		<input
			type="text"
			placeholder="Laptop, couch, dinner, headphones"
			value={purchase.name}
			oninput={(event) => onPurchaseField('name', event.currentTarget.value)}
		/>
	</label>
	<label>
		<span>How much does it cost?</span>
		<input
			type="number"
			inputmode="decimal"
			min="0.01"
			placeholder="1470"
			value={purchase.cost}
			oninput={(event) => onPurchaseField('cost', event.currentTarget.value)}
		/>
	</label>
	<label>
		<span>Product type</span>
		<select
			value={purchase.category}
			onchange={(event) => onPurchaseField('category', event.currentTarget.value as ProductCategory)}
		>
			{#each productOptions as option}
				<option value={option.id}>{option.name}</option>
			{/each}
		</select>
	</label>
	<button class="primary-action" type="button" onclick={onRunCheck} disabled={!canRunCheck}>Run check</button>
</section>
