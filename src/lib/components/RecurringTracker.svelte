<script lang="ts">
	import {
		calculateRecurringMonthlyTotal,
		calculateRecurringReviewTotal,
		formatMoney,
		getUpcomingRecurringItems
	} from '$lib/calculations';
	import type { RecurringItem } from '$lib/models';

	let {
		items,
		onRecurringChange,
		onAddRecurring,
		onRemoveRecurring
	}: {
		items: RecurringItem[];
		onRecurringChange: (item: RecurringItem) => void;
		onAddRecurring: () => void;
		onRemoveRecurring: (id: string) => void;
	} = $props();

	const safe = <T>(compute: () => T, fallback: T): T => {
		try {
			return compute();
		} catch {
			return fallback;
		}
	};

	const monthlyTotal = $derived(safe(() => calculateRecurringMonthlyTotal(items), 0));
	const reviewTotal = $derived(safe(() => calculateRecurringReviewTotal(items), 0));
	const upcoming = $derived(safe(() => getUpcomingRecurringItems(items), []));
</script>

<section class="screen service-screen" aria-labelledby="recurring-title">
	<div class="section-heading tight-heading">
		<div>
			<p class="eyebrow">Bills and subscriptions</p>
			<h2 id="recurring-title">Find fixed costs before they surprise you</h2>
		</div>
		<button class="primary-action" type="button" onclick={onAddRecurring}>Add recurring</button>
	</div>

	<div class="metric-grid three-up">
		<article class="metric-card tone-caution">
			<strong>{formatMoney(monthlyTotal)}</strong>
			<p>Monthly fixed charges</p>
			<span>Marked bills and subscriptions</span>
		</article>
		<article class="metric-card tone-safe">
			<strong>{items.length}</strong>
			<p>Tracked items</p>
			<span>Active, review, and cancel states</span>
		</article>
		<article class="metric-card tone-risky">
			<strong>{formatMoney(reviewTotal)}</strong>
			<p>Review pool</p>
			<span>Possible savings from weak charges</span>
		</article>
	</div>

	<div class="command-grid">
		<section class="details-panel">
			<div class="panel-heading">
				<div>
					<p class="eyebrow">Calendar</p>
					<h3>Upcoming charges</h3>
				</div>
			</div>
			<ul class="compact-feed">
				{#each upcoming as item}
					<li>
						<span>{item.name}</span>
						<strong>{formatMoney(Number(item.amount))}</strong>
						<small>Day {item.dueDay} · {item.category}</small>
					</li>
				{:else}
					<li><span>No upcoming items yet</span></li>
				{/each}
			</ul>
		</section>

		<section class="details-panel">
			<div class="panel-heading">
				<div>
					<p class="eyebrow">Cleanup</p>
					<h3>Subscription review list</h3>
				</div>
			</div>
			<ul class="compact-feed">
				{#each items.filter((item) => item.status !== 'active') as item}
					<li>
						<span>{item.name}</span>
						<strong>{item.status}</strong>
						<small>{formatMoney(Number(item.amount))}/mo</small>
					</li>
				{:else}
					<li><span>No review items marked</span></li>
				{/each}
			</ul>
		</section>
	</div>

	<section class="details-panel">
		<div class="comparison-table recurring-table" role="table" aria-label="Editable recurring items">
			<div class="table-row recurring-row table-head" role="row">
				<span>Name</span>
				<span>Amount</span>
				<span>Category</span>
				<span>Due day</span>
				<span>Status</span>
				<span></span>
			</div>
			{#each items as item}
				<div class="table-row recurring-row editable-row" role="row">
					<input
						value={item.name}
						aria-label="Recurring name"
						oninput={(event) => onRecurringChange({ ...item, name: event.currentTarget.value })}
					/>
					<input
						type="number"
						min="0"
						value={item.amount}
						aria-label="Recurring amount"
						oninput={(event) => onRecurringChange({ ...item, amount: event.currentTarget.value })}
					/>
					<input
						value={item.category}
						aria-label="Recurring category"
						oninput={(event) => onRecurringChange({ ...item, category: event.currentTarget.value })}
					/>
					<input
						type="number"
						min="1"
						max="31"
						value={item.dueDay}
						aria-label="Due day"
						oninput={(event) => onRecurringChange({ ...item, dueDay: event.currentTarget.value })}
					/>
					<select
						value={item.status}
						aria-label="Recurring status"
						onchange={(event) => onRecurringChange({ ...item, status: event.currentTarget.value as RecurringItem['status'] })}
					>
						<option value="active">Active</option>
						<option value="review">Review</option>
						<option value="cancel">Cancel</option>
					</select>
					<button class="secondary-action" type="button" onclick={() => onRemoveRecurring(item.id)}>
						Remove
					</button>
				</div>
			{/each}
		</div>
	</section>
</section>
