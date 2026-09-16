import { expect, test } from '@playwright/test';

test('signup has accessible fields, unchecked consent, validation and password toggles', async ({ page }, testInfo) => {
	await page.goto('/signup');
	await expect(page.locator('form[data-enhanced]')).toHaveAttribute('data-enhanced', 'true');
	await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
	const terms = page.getByRole('checkbox');
	await expect(terms).not.toBeChecked();
	await page.screenshot({ path: testInfo.outputPath('signup.png'), fullPage: true });
	await page.getByRole('button', { name: 'Create Account', exact: true }).click();
	await expect(page.getByText('Accept the Terms of Service to continue.')).toBeVisible();
	await expect(page.getByLabel('Username', { exact: true })).toBeFocused();
	await page.getByLabel('Username', { exact: true }).fill(' Mixed_Name ');
	await page.getByLabel('Email', { exact: true }).fill('person@example.com');
	const password = page.getByLabel('Password', { exact: true });
	await password.fill('secret123');
	await page.getByLabel('Confirm password', { exact: true }).fill('different');
	await page.getByRole('button', { name: 'Show password', exact: true }).click();
	await expect(password).toHaveAttribute('type', 'text');
	await page.getByRole('button', { name: 'Show password', exact: true }).click();
	await expect(password).toHaveAttribute('type', 'password');
	await page.getByRole('button', { name: 'Create Account', exact: true }).click();
	await expect(page.getByText('Passwords must match.')).toBeVisible();
	await expect(terms).not.toBeChecked();
	await expect(page.getByRole('link', { name: 'Terms of Service (opens in a new tab)' })).toHaveAttribute('href', '/terms');
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('loading disables resubmission and a network failure restores the form without secrets', async ({ page }) => {
	await page.goto('/login');
	await expect(page.locator('form[data-enhanced]')).toHaveAttribute('data-enhanced', 'true');
	await page.getByLabel('Email', { exact: true }).fill('person@example.com');
	await page.getByLabel('Password', { exact: true }).fill('secret123');
	let release!: () => void;
	const barrier = new Promise<void>((resolve) => { release = resolve; });
	await page.route('**/login', async (route) => {
		if (route.request().method() !== 'POST') return route.continue();
		await barrier;
		await route.abort('failed');
	});
	await page.getByRole('button', { name: 'Sign In', exact: true }).click();
	try { await expect(page.getByRole('button', { name: 'Signing in…' })).toBeDisabled(); }
	finally { release(); }
	await expect(page.getByRole('alert')).toHaveText('Unable to connect. Please try again.');
	await expect(page.getByRole('button', { name: 'Sign In', exact: true })).toBeEnabled();
	await expect(page.getByLabel('Password', { exact: true })).toHaveValue('');
});

test('recovery and legal links reach working pages', async ({ page }) => {
	await page.goto('/login');
	await page.getByRole('link', { name: 'Forgot Email?' }).click();
	await expect(page.getByRole('heading', { name: 'Forgot your email?' })).toBeVisible();
	await page.getByRole('link', { name: 'Try a password reset' }).click();
	await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible();
	await page.getByRole('link', { name: 'Privacy Policy', exact: true }).click();
	await expect(page.getByRole('heading', { name: 'Privacy Policy', exact: true })).toBeVisible();
	await expect(page.getByText('gotemzgrimze@gmail.com', { exact: false }).first()).toBeVisible();
	await page.getByRole('link', { name: 'Terms of Service', exact: true }).click();
	await expect(page.getByRole('heading', { name: 'Terms of Service', exact: true })).toBeVisible();
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test.describe('without JavaScript', () => {
	test.use({ javaScriptEnabled: false });
	test('server validation works and never echoes passwords', async ({ page }) => {
		await page.goto('/signup');
		await page.getByLabel('Username', { exact: true }).fill('person');
		await page.getByLabel('Email', { exact: true }).fill('person@example.com');
		await page.getByLabel('Password', { exact: true }).fill('secret123');
		await page.getByLabel('Confirm password', { exact: true }).fill('secret123');
		await page.getByLabel('Confirm password', { exact: true }).press('Enter');
		await expect(page.getByText('Accept the Terms of Service to continue.')).toBeVisible();
		expect(await page.content()).not.toContain('secret123');
	});
});
