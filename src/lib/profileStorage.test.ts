import { describe, expect, it } from 'vitest';
import { isProfilePasscodeStrong, isStoredProfilePayload } from '$lib/profileStorage';

const bytes = (length: number): string =>
	btoa(String.fromCharCode(...Array.from({ length }, (_, index) => index % 255)));

describe('profile storage security guards', () => {
	it('requires a stronger local encryption passcode', () => {
		expect(isProfilePasscodeStrong('shortpass')).toBe(false);
		expect(isProfilePasscodeStrong('twelve-chars')).toBe(true);
	});

	it('accepts the current encrypted payload shape', () => {
		expect(
			isStoredProfilePayload({
				version: 1,
				kdf: 'PBKDF2-SHA-256',
				cipher: 'AES-GCM',
				iterations: 310000,
				createdAt: '2026-07-10T00:00:00.000Z',
				salt: bytes(16),
				iv: bytes(12),
				data: bytes(32)
			})
		).toBe(true);
	});

	it('accepts legacy encrypted payloads for migration', () => {
		expect(
			isStoredProfilePayload({
				salt: bytes(16),
				iv: bytes(12),
				data: bytes(32)
			})
		).toBe(true);
	});

	it('rejects malformed encrypted payloads before decrypting', () => {
		expect(isStoredProfilePayload(null)).toBe(false);
		expect(isStoredProfilePayload({ salt: bytes(15), iv: bytes(12), data: bytes(32) })).toBe(false);
		expect(isStoredProfilePayload({ salt: bytes(16), iv: bytes(12), data: '' })).toBe(false);
		expect(
			isStoredProfilePayload({
				version: 1,
				kdf: 'PBKDF2-SHA-256',
				cipher: 'AES-GCM',
				iterations: 1,
				salt: bytes(16),
				iv: bytes(12),
				data: bytes(32)
			})
		).toBe(false);
	});
});
