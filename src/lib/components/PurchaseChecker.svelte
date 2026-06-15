<script lang="ts">
	import type { ProductCategory, ProductOption, PurchaseAssessmentOptions, PurchaseInput } from '$lib/models';

	let {
		purchase,
		options,
		productOptions,
		onPurchaseField,
		onOptionField,
		onRunCheck,
		canRunCheck
	}: {
		purchase: PurchaseInput;
		options: Required<PurchaseAssessmentOptions>;
		productOptions: ProductOption[];
		onPurchaseField: (key: keyof PurchaseInput, value: string) => void;
		onOptionField: (key: keyof PurchaseAssessmentOptions, value: number) => void;
		onRunCheck: () => void;
		canRunCheck: boolean;
	} = $props();
</script>

<section class="details-panel purchase-panel" aria-label="Purchase details">
	<div class="purchase-input-panel">
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
	</div>

	<div class="assumption-grid" aria-label="Assessment assumptions">
		<label>
			<span>Wait days</span>
			<input
				type="number"
				min="1"
				value={options.waitDays}
				oninput={(event) => onOptionField('waitDays', Number(event.currentTarget.value))}
			/>
		</label>
		<label>
			<span>Cheaper version %</span>
			<input
				type="number"
				min="1"
				max="100"
				value={Math.round(options.cheaperAlternativePercentage * 100)}
				oninput={(event) =>
					onOptionField('cheaperAlternativePercentage', Number(event.currentTarget.value) / 100)}
			/>
		</label>
		<label>
			<span>Investment years</span>
			<input
				type="number"
				min="1"
				value={options.investmentYears}
				oninput={(event) => onOptionField('investmentYears', Number(event.currentTarget.value))}
			/>
		</label>
	</div>
</section>
