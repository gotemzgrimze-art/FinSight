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
	lastResetMonth: new Date().toISOString().slice(0, 7),
	isStudentVerified: false
};

const subscriptionStorageKey = 'finsight-subscription-state';

export const currentResetMonth = (): string => new Date().toISOString().slice(0, 7);

type StoredSubscriptionState = Partial<SubscriptionState> & {
	subscriptionType?: SubscriptionTier;
	monthlyPurchaseCheckCount?: number;
};

export const normalizeSubscriptionState = (state: StoredSubscriptionState): SubscriptionState => {
	const resetMonth = currentResetMonth();
	const tier: SubscriptionTier =
		state.tier === 'premium' || state.tier === 'student'
			? state.tier
			: state.subscriptionType === 'premium' || state.subscriptionType === 'student'
				? state.subscriptionType
				: 'free';
	const purchaseChecksUsedThisMonth = Number(
		state.purchaseChecksUsedThisMonth ?? state.monthlyPurchaseCheckCount ?? 0
	);

	if (state.lastResetMonth !== resetMonth) {
		return {
			tier,
			purchaseChecksUsedThisMonth: 0,
			lastResetMonth: resetMonth,
			isStudentVerified: Boolean(state.isStudentVerified)
		};
	}

	return {
		tier,
		purchaseChecksUsedThisMonth: Number.isFinite(purchaseChecksUsedThisMonth)
			? Math.max(0, purchaseChecksUsedThisMonth)
			: 0,
		lastResetMonth: state.lastResetMonth ?? resetMonth,
		isStudentVerified: Boolean(state.isStudentVerified)
	};
};

export const loadSubscriptionState = (): SubscriptionState => {
	if (typeof localStorage === 'undefined') return { ...defaultSubscriptionState };

	const raw = localStorage.getItem(subscriptionStorageKey);
	if (!raw) return { ...defaultSubscriptionState };

	try {
		const parsed = JSON.parse(raw) as Partial<StoredSubscriptionState>;
		const normalized = normalizeSubscriptionState(parsed);
		saveSubscriptionState(normalized);
		return normalized;
	} catch {
		return { ...defaultSubscriptionState };
	}
};

export const saveSubscriptionState = (state: SubscriptionState): void => {
	if (typeof localStorage === 'undefined') return;

	const normalized = normalizeSubscriptionState(state);
	const stored: StoredSubscriptionState = {
		...normalized,
		subscriptionType: normalized.tier,
		monthlyPurchaseCheckCount: normalized.purchaseChecksUsedThisMonth
	};
	localStorage.setItem(subscriptionStorageKey, JSON.stringify(stored));
};

export const getSubscriptionLimits = (state: SubscriptionState): SubscriptionLimits =>
	subscriptionLimits[state.tier];

export const canAddGoal = (state: SubscriptionState, currentGoalCount: number): boolean =>
	currentGoalCount < getSubscriptionLimits(state).maxGoals;

export const canRunPurchaseCheck = (state: SubscriptionState): boolean => {
	const normalized = normalizeSubscriptionState(state);
	return normalized.purchaseChecksUsedThisMonth < getSubscriptionLimits(normalized).maxPurchaseChecksPerMonth;
};

export const describeTier = (tier: SubscriptionTier): string => {
	if (tier === 'premium') return 'Unlimited goals, unlimited purchase checks, 12-month forecast.';
	if (tier === 'student') return 'Premium limits with a mocked student discount.';
	return '3 goals, 5 purchase checks/month, 3-month forecast.';
};
