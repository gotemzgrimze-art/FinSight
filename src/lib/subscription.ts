import type { SubscriptionState, SubscriptionTier } from '$lib/models';

export type SubscriptionLimits = {
	maxGoals: number;
	maxPurchaseChecksPerMonth: number;
	forecastMonths: number;
	investmentOpportunityCost: boolean;
	priceLabel: string;
};

export const subscriptionLimits: Record<SubscriptionTier, SubscriptionLimits> = {
	free: {
		maxGoals: 3,
		maxPurchaseChecksPerMonth: 5,
		forecastMonths: 3,
		investmentOpportunityCost: false,
		priceLabel: '$0'
	},
	premium: {
		maxGoals: Number.POSITIVE_INFINITY,
		maxPurchaseChecksPerMonth: Number.POSITIVE_INFINITY,
		forecastMonths: 12,
		investmentOpportunityCost: true,
		priceLabel: '$8/mo'
	},
	student: {
		maxGoals: Number.POSITIVE_INFINITY,
		maxPurchaseChecksPerMonth: Number.POSITIVE_INFINITY,
		forecastMonths: 12,
		investmentOpportunityCost: true,
		priceLabel: '$3/mo'
	}
};

export const defaultSubscriptionState: SubscriptionState = {
	tier: 'free',
	purchaseChecksUsedThisMonth: 0,
	isStudentVerified: false
};

export const getSubscriptionLimits = (state: SubscriptionState): SubscriptionLimits =>
	subscriptionLimits[state.tier];

export const canAddGoal = (state: SubscriptionState, currentGoalCount: number): boolean =>
	currentGoalCount < getSubscriptionLimits(state).maxGoals;

export const canRunPurchaseCheck = (state: SubscriptionState): boolean =>
	state.purchaseChecksUsedThisMonth < getSubscriptionLimits(state).maxPurchaseChecksPerMonth;

export const describeTier = (tier: SubscriptionTier): string => {
	if (tier === 'premium') return 'Unlimited goals, unlimited purchase checks, 12-month forecast.';
	if (tier === 'student') return 'Premium limits with a mocked student discount.';
	return '3 goals, 5 purchase checks/month, 3-month forecast.';
};
