import type { FinancialProfile } from '$lib/models';

type SecurePayload = {
	salt: string;
	iv: string;
	data: string;
};

const profileStorageKey = 'finsight-local-profile';
const keyIterations = 250_000;

const encodeBytes = (bytes: Uint8Array): string => btoa(String.fromCharCode(...bytes));

const decodeBytes = (value: string): Uint8Array =>
	Uint8Array.from(atob(value), (character) => character.charCodeAt(0));

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer =>
	bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;

const getProfileKey = async (passcode: string, salt: Uint8Array): Promise<CryptoKey> => {
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
			iterations: keyIterations,
			hash: 'SHA-256'
		},
		sourceKey,
		{ name: 'AES-GCM', length: 256 },
		false,
		['encrypt', 'decrypt']
	);
};

const encryptProfile = async (passcode: string, value: FinancialProfile): Promise<SecurePayload> => {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const key = await getProfileKey(passcode, salt);
	const encryptedData = await crypto.subtle.encrypt(
		{ name: 'AES-GCM', iv: toArrayBuffer(iv) },
		key,
		new TextEncoder().encode(JSON.stringify(value))
	);

	return {
		salt: encodeBytes(salt),
		iv: encodeBytes(iv),
		data: encodeBytes(new Uint8Array(encryptedData))
	};
};

const decryptProfile = async (passcode: string, payload: SecurePayload): Promise<FinancialProfile> => {
	const salt = decodeBytes(payload.salt);
	const iv = decodeBytes(payload.iv);
	const key = await getProfileKey(passcode, salt);
	const decryptedData = await crypto.subtle.decrypt(
		{ name: 'AES-GCM', iv: toArrayBuffer(iv) },
		key,
		decodeBytes(payload.data)
	);

	return JSON.parse(new TextDecoder().decode(decryptedData)) as FinancialProfile;
};

export const hasSavedProfile = (): boolean =>
	typeof localStorage !== 'undefined' && Boolean(localStorage.getItem(profileStorageKey));

export const saveProfile = async (passcode: string, profile: FinancialProfile): Promise<void> => {
	if (passcode.length < 8) throw new Error('Use at least 8 characters');
	localStorage.setItem(profileStorageKey, JSON.stringify(await encryptProfile(passcode, profile)));
};

export const unlockProfile = async (passcode: string): Promise<FinancialProfile> => {
	const storedProfile = localStorage.getItem(profileStorageKey);

	if (!storedProfile) throw new Error('No encrypted profile saved');

	return decryptProfile(passcode, JSON.parse(storedProfile) as SecurePayload);
};

export const clearProfile = (): void => {
	localStorage.removeItem(profileStorageKey);
};
