import { env } from '$lib/server/env';

export type TransactionalEmail = {
	to: string;
	subject: string;
	text: string;
};

export const sendTransactionalEmail = async (email: TransactionalEmail): Promise<void> => {
	if (env.EMAIL_PROVIDER === 'console') {
		console.info('[FinSight email:console]', {
			to: email.to,
			subject: email.subject,
			text: email.text
		});
		return;
	}

	throw new Error('External email provider is not configured');
};
