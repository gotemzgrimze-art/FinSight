import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './e2e',
	testMatch: '**/*.pw.ts',
	workers: 2,
	timeout: 60_000,
	use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
	projects: [
		{ name: 'desktop', use: { ...devices['Desktop Chrome'] } },
		{ name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } }
	],
	webServer: {
		command: 'pnpm dev --host 127.0.0.1 --port 4173 --strictPort',
		url: 'http://127.0.0.1:4173',
		reuseExistingServer: false,
		timeout: 120_000,
		env: {
			PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54329',
			PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'test-publishable-key',
			PUBLIC_LEGAL_ENTITY: 'FinSight Test Operator',
			PUBLIC_LEGAL_ADDRESS: 'Test address, Istanbul',
			PUBLIC_LEGAL_DEPLOYMENT_DETAILS: 'Test environment only; no external data processing.',
			PUBLIC_LEGAL_PUBLISHED: 'true',
			PUBLIC_TERMS_URL: '', PUBLIC_PRIVACY_URL: ''
		}
	}
});
