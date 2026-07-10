import type { FinancialProfile } from '$lib/models';

type SecurePayload = {
	version?: 1;
	kdf?: 'PBKDF2-SHA-256';
	cipher?: 'AES-GCM';
	iterations?: number;
	createdAt?: string;
	salt: string;
	iv: string;
	data: string;
};

const profileStorageKey = 'finsight-local-profile';
const currentPayloadVersion = 1;
const defaultKeyIterations = 310_000;
const legacyKeyIterations = 250_000;
const minimumPasscodeLength = 12;

export const isProfilePasscodeStrong = (passcode: string): boolean =>
	passcode.trim().length >= minimumPasscodeLength;

const encodeBytes = (bytes: Uint8Array): string => btoa(String.fromCharCode(...bytes));

const decodeBytes = (value: string): Uint8Array =>
	Uint8Array.from(atob(value), (character) => character.charCodeAt(0));

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer =>
	bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;

const getProfileKey = async (
	passcode: string,
	salt: Uint8Array,
	iterations: number
): Promise<CryptoKey> => {
	const sourceKey = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(passcode),
		'PBKDF2',
		false,
		['deriveKey']
	);

	return crypto.subtle.deriveKey(
		{
			name: 'PBKDF2',
			salt: toArrayBuffer(salt),
			iterations,
			hash: 'SHA-256'
		},
		sourceKey,
		{ name: 'AES-GCM', length: 256 },
		false,
		['encrypt', 'decrypt']
	);
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

export const isStoredProfilePayload = (value: unknown): value is SecurePayload => {
	if (!isRecord(value)) return false;
	if (typeof value.salt !== 'string' || typeof value.iv !== 'string' || typeof value.data !== 'string') {
		return false;
	}
	if (value.version !== undefined && value.version !== currentPayloadVersion) return false;
	if (value.kdf !== undefined && value.kdf !== 'PBKDF2-SHA-256') return false;
	if (value.cipher !== undefined && value.cipher !== 'AES-GCM') return false;
	const iterations = value.iterations;
	if (
		iterations !== undefined &&
		(typeof iterations !== 'number' || !Number.isInteger(iterations) || iterations < legacyKeyIterations)
	) {
		return false;
	}

	try {
		return (
			decodeBytes(value.salt).length === 16 &&
			decodeBytes(value.iv).length === 12 &&
			decodeBytes(value.data).length > 0
		);
	} catch {
		return false;
	}
};

const parseStoredPayload = (storedProfile: string): SecurePayload => {
	const parsed = JSON.parse(storedProfile) as unknown;
	if (!isStoredProfilePayload(parsed)) throw new Error('Saved profile data is not a valid encrypted payload');
	return parsed;
};

const encryptProfile = async (passcode: string, value: FinancialProfile): Promise<SecurePayload> => {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const key = await getProfileKey(passcode, salt, defaultKeyIterations);
	const encryptedData = await crypto.subtle.encrypt(
		{ name: 'AES-GCM', iv: toArrayBuffer(iv) },
		key,
		new TextEncoder().encode(JSON.stringify(value))
	);

	return {
		version: currentPayloadVersion,
		kdf: 'PBKDF2-SHA-256',
		cipher: 'AES-GCM',
		iterations: defaultKeyIterations,
		createdAt: new Date().toISOString(),
		salt: encodeBytes(salt),
		iv: encodeBytes(iv),
		data: encodeBytes(new Uint8Array(encryptedData))
	};
};

const decryptProfile = async (passcode: string, payload: SecurePayload): Promise<FinancialProfile> => {
	const salt = decodeBytes(payload.salt);
	const iv = decodeBytes(payload.iv);
	const key = await getProfileKey(passcode, salt, payload.iterations ?? legacyKeyIterations);
	const decryptedData = await crypto.subtle.decrypt(
		{ name: 'AES-GCM', iv: toArrayBuffer(iv) },
		key,
		toArrayBuffer(decodeBytes(payload.data))
	);

	return JSON.parse(new TextDecoder().decode(decryptedData)) as FinancialProfile;
};

export const hasSavedProfile = (): boolean =>
	typeof localStorage !== 'undefined' && Boolean(localStorage.getItem(profileStorageKey));

export const saveProfile = async (passcode: string, profile: FinancialProfile): Promise<void> => {
	if (typeof localStorage === 'undefined' || typeof crypto === 'undefined' || !crypto.subtle) {
		throw new Error('Secure browser storage is not available');
	}
	if (!isProfilePasscodeStrong(passcode)) throw new Error('Use at least 12 characters');
	localStorage.setItem(profileStorageKey, JSON.stringify(await encryptProfile(passcode, profile)));
};

export const unlockProfile = async (passcode: string): Promise<FinancialProfile> => {
	if (typeof localStorage === 'undefined' || typeof crypto === 'undefined' || !crypto.subtle) {
		throw new Error('Secure browser storage is not available');
	}
	const storedProfile = localStorage.getItem(profileStorageKey);

	if (!storedProfile) throw new Error('No encrypted profile saved');

	try {
		return await decryptProfile(passcode, parseStoredPayload(storedProfile));
	} catch {
		throw new Error('Could not unlock profile. Check the passcode and saved data.');
	}
};

export const clearProfile = (): void => {
	localStorage.removeItem(profileStorageKey);
};
