<script lang="ts">
	import { describeTier, getSubscriptionLimits } from '$lib/subscription';
	import type { SubscriptionState, SubscriptionTier } from '$lib/models';

	let {
		subscription,
		onTierChange
	}: {
		subscription: SubscriptionState;
		onTierChange: (tier: SubscriptionTier) => void;
	} = $props();

	const limits = $derived(getSubscriptionLimits(subscription));
</script>

<section class="details-panel">
	<div class="panel-heading">
		<div>
			<p class="eyebrow">Subscription mock</p>
			<h3>{subscription.tier} tier</h3>
		</div>
		<span class="pill tone-safe">{limits.priceLabel}</span>
	</div>
	<p class="short-note">{describeTier(subscription.tier)}</p>
	<div class="segmented-actions">
		<button class:active-service={subscription.tier === 'free'} type="button" onclick={() => onTierChange('free')}>Free</button>
		<button class:active-service={subscription.tier === 'premium'} type="button" onclick={() => onTierChange('premium')}>Premium</button>
		<button class:active-service={subscription.tier === 'student'} type="button" onclick={() => onTierChange('student')}>Student</button>
	</div>
	<p class="short-note">
		Checks used this month: {subscription.purchaseChecksUsedThisMonth} / {Number.isFinite(limits.maxPurchaseChecksPerMonth) ? limits.maxPurchaseChecksPerMonth : 'unlimited'}.
	</p>
</section>
