import { env } from '$env/dynamic/public';

const httpsUrl = (value: string | undefined) => {
	try {
		const url = new URL(value ?? '');
		return url.protocol === 'https:' ? url.href : null;
	} catch { return null; }
};

export function authConfig() {
	const externalTerms = httpsUrl(env.PUBLIC_TERMS_URL);
	const externalPrivacy = httpsUrl(env.PUBLIC_PRIVACY_URL);
	const legal = {
		entity: env.PUBLIC_LEGAL_ENTITY?.trim() || '',
		address: env.PUBLIC_LEGAL_ADDRESS?.trim() || '',
		jurisdiction: env.PUBLIC_LEGAL_JURISDICTION?.trim() || 'Istanbul, Türkiye',
		email: env.PUBLIC_LEGAL_CONTACT_EMAIL?.trim() || 'gotemzgrimze@gmail.com',
		deploymentDetails: env.PUBLIC_LEGAL_DEPLOYMENT_DETAILS?.trim() || '',
		published: env.PUBLIC_LEGAL_PUBLISHED === 'true'
	};
	const legalReady = legal.published && Boolean(legal.entity && legal.address && legal.jurisdiction && legal.deploymentDetails && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(legal.email));
	const termsUrl = externalTerms || '/terms';
	const privacyUrl = externalPrivacy || '/privacy';
	const configured = Boolean(env.PUBLIC_SUPABASE_URL && env.PUBLIC_SUPABASE_PUBLISHABLE_KEY);
	return { configured, termsUrl, privacyUrl, legal, legalReady, signupEnabled: configured && legalReady };
}
