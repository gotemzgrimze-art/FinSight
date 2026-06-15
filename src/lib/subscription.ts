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

const subscriptionStorageKey = 'finsight-subscription-state';

const currentResetMonth = (): string => new Date().toISOString().slice(0, 7);

type StoredSubscriptionState = SubscriptionState & {
	lastResetMonth: string;
};

const normalizeSubscriptionState = (state: StoredSubscriptionState): StoredSubscriptionState => {
	const resetMonth = currentResetMonth();
	if (state.lastResetMonth !== resetMonth) {
		return {
			...state,
			purchaseChecksUsedThisMonth: 0,
			lastResetMonth: resetMonth
		};
	}
	return state;
};

export const loadSubscriptionState = (): SubscriptionState => {
	if (typeof localStorage === 'undefined') return { ...defaultSubscriptionState };

	const raw = localStorage.getItem(subscriptionStorageKey);
	if (!raw) return { ...defaultSubscriptionState };

	try {
		const parsed = JSON.parse(raw) as Partial<StoredSubscriptionState>;
		const tier: SubscriptionTier =
			parsed.tier === 'premium' || parsed.tier === 'student' ? parsed.tier : 'free';
		const purchaseChecksUsedThisMonth = Number(parsed.purchaseChecksUsedThisMonth ?? 0);
		const normalized = normalizeSubscriptionState({
			tier,
			purchaseChecksUsedThisMonth: Number.isFinite(purchaseChecksUsedThisMonth)
				? Math.max(0, purchaseChecksUsedThisMonth)
				: 0,
			isStudentVerified: Boolean(parsed.isStudentVerified),
			lastResetMonth: parsed.lastResetMonth ?? currentResetMonth()
		});
		saveSubscriptionState(normalized);
		return {
			tier: normalized.tier,
			purchaseChecksUsedThisMonth: normalized.purchaseChecksUsedThisMonth,
			isStudentVerified: normalized.isStudentVerified
		};
	} catch {
		return { ...defaultSubscriptionState };
	}
};

export const saveSubscriptionState = (state: SubscriptionState): void => {
	if (typeof localStorage === 'undefined') return;

	const stored: StoredSubscriptionState = {
		...state,
		lastResetMonth: currentResetMonth()
	};
	localStorage.setItem(subscriptionStorageKey, JSON.stringify(stored));
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
