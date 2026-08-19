import { env } from '$lib/server/env';

export type AnalyticsEventName =
	| 'signup_started'
	| 'signup_completed'
	| 'email_verified'
	| 'onboarding_started'
	| 'onboarding_completed'
	| 'bank_connection_started'
	| 'bank_connection_completed'
	| 'purchase_check_created'
	| 'purchase_check_result'
	| 'alternative_viewed'
	| 'user_returned';

export interface AnalyticsService {
	track(userId: string | null, eventName: AnalyticsEventName, properties?: Record<string, string | number | boolean | null>): Promise<void>;
}

export class ConsoleAnalyticsService implements AnalyticsService {
	async track(userId: string | null, eventName: AnalyticsEventName, properties: Record<string, string | number | boolean | null> = {}) {
		if (env.ANALYTICS_PROVIDER === 'none') return;
		console.info('[FinSight analytics]', {
			userId,
			eventName,
			properties
		});
	}
}

export const analytics = new ConsoleAnalyticsService();
