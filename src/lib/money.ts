export const supportedCurrencies = ['USD', 'CAD', 'EUR', 'GBP'] as const;

export type SupportedCurrency = (typeof supportedCurrencies)[number];

export type Money = {
	amountMinor: number;
	currency: SupportedCurrency;
};

const currencyMinorUnits: Record<SupportedCurrency, number> = {
	USD: 2,
	CAD: 2,
	EUR: 2,
	GBP: 2
};

const amountPattern = /^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/;

export const isSupportedCurrency = (currency: string): currency is SupportedCurrency =>
	supportedCurrencies.includes(currency as SupportedCurrency);

export const assertSupportedCurrency = (currency: string): SupportedCurrency => {
	if (!isSupportedCurrency(currency)) {
		throw new Error(`Unsupported currency: ${currency}`);
	}
	return currency;
};

export const parseMoneyToMinor = (
	value: string,
	currency: SupportedCurrency = 'USD',
	fieldName = 'money'
): Money => {
	const normalized = value.trim();
	if (!normalized) throw new Error(`${fieldName} is required`);
	if (normalized.startsWith('-')) throw new Error(`${fieldName} cannot be negative`);
	if (!amountPattern.test(normalized)) throw new Error(`${fieldName} must be a valid money amount`);

	const units = currencyMinorUnits[currency];
	const [majorPart, rawMinorPart = ''] = normalized.replaceAll(',', '').split('.');
	const major = BigInt(majorPart);
	const minor = BigInt(rawMinorPart.padEnd(units, '0').slice(0, units));
	const amountMinor = major * BigInt(10 ** units) + minor;

	if (amountMinor > BigInt(Number.MAX_SAFE_INTEGER)) {
		throw new Error(`${fieldName} is too large`);
	}

	return { amountMinor: Number(amountMinor), currency };
};

export const minorToDecimalString = (money: Money): string => {
	const units = currencyMinorUnits[money.currency];
	const scale = 10 ** units;
	const sign = money.amountMinor < 0 ? '-' : '';
	const absolute = Math.abs(money.amountMinor);
	const major = Math.floor(absolute / scale);
	const minor = String(absolute % scale).padStart(units, '0');
	return `${sign}${major}.${minor}`;
};

export const formatMoney = (
	money: Money,
	options: { locale?: string; maximumFractionDigits?: number } = {}
): string =>
	new Intl.NumberFormat(options.locale ?? 'en-US', {
		style: 'currency',
		currency: money.currency,
		maximumFractionDigits: options.maximumFractionDigits ?? 2
	}).format(Number(minorToDecimalString(money)));

export const addMoney = (...values: Money[]): Money => {
	if (values.length === 0) return { amountMinor: 0, currency: 'USD' };
	const currency = values[0].currency;
	return {
		currency,
		amountMinor: values.reduce((total, value) => {
			if (value.currency !== currency) throw new Error('Cannot add different currencies');
			return total + value.amountMinor;
		}, 0)
	};
};

export const subtractMoney = (left: Money, right: Money): Money => {
	if (left.currency !== right.currency) throw new Error('Cannot subtract different currencies');
	return { amountMinor: left.amountMinor - right.amountMinor, currency: left.currency };
};

export const multiplyMoney = (money: Money, factor: number): Money => {
	if (!Number.isFinite(factor)) throw new Error('Multiplier must be finite');
	return { ...money, amountMinor: Math.round(money.amountMinor * factor) };
};

export const zeroMoney = (currency: SupportedCurrency): Money => ({ amountMinor: 0, currency });
