export type IdentityVerificationStatus = 'not_required' | 'pending' | 'verified' | 'failed';

export interface IdentityProvider {
	createVerificationSession(userId: string): Promise<{ id: string; url: string; status: IdentityVerificationStatus }>;
	getVerificationStatus(userId: string, verificationId: string): Promise<IdentityVerificationStatus>;
	processWebhook(payload: unknown): Promise<void>;
}

export class NoopIdentityProvider implements IdentityProvider {
	async createVerificationSession(): Promise<{ id: string; url: string; status: IdentityVerificationStatus }> {
		return { id: 'not_required', url: '', status: 'not_required' };
	}

	async getVerificationStatus(): Promise<IdentityVerificationStatus> {
		return 'not_required';
	}

	async processWebhook(): Promise<void> {
		return;
	}
}

export const identityProvider = new NoopIdentityProvider();
