<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { onMount, tick, untrack } from 'svelte';
	import { validateAuth, type AuthMode, type AuthResult, type FieldErrors } from '$lib/auth/validation';

	let { mode, form, configured, termsUrl, privacyUrl, signupEnabled }: {
		mode: AuthMode;
		form?: AuthResult | null;
		configured: boolean;
		signupEnabled: boolean;
		termsUrl: string | null;
		privacyUrl: string | null;
	} = $props();
	let pending = $state(false);
	let enhanced = $state(false);
	let email = $state(untrack(() => form?.values?.email ?? ''));
	let username = $state(untrack(() => form?.values?.username ?? ''));
	onMount(() => { enhanced = true; });
	let showPassword = $state(false);
	let showConfirm = $state(false);
	let clientErrors = $state<FieldErrors | null>(null);
	let networkMessage = $state('');
	const errors = $derived(clientErrors ?? form?.errors ?? {});
	const signup = $derived(mode === 'signup');
	const reset = $derived(mode === 'reset-password');
	const ready = $derived(signup ? signupEnabled : configured);
	const label = $derived(mode === 'login' ? 'Sign In' : signup ? 'Create Account' : reset ? 'Update Password' : 'Send Reset Link');
	const busyLabel = $derived(mode === 'login' ? 'Signing in…' : signup ? 'Creating account…' : reset ? 'Updating password…' : 'Sending link…');

	const submit: SubmitFunction = ({ formData, cancel, formElement }) => {
		clientErrors = validateAuth(mode, formData).errors;
		networkMessage = '';
		if (Object.keys(clientErrors).length) {
			cancel();
			void tick().then(() => formElement.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus());
			return;
		}
		pending = true;
		return async ({ result, update }) => {
			try {
				clientErrors = null;
				if (result.type === 'error') networkMessage = 'Unable to connect. Please try again.';
				else await update();
				// Never keep submitted secrets in the DOM after a response.
				for (const input of formElement.querySelectorAll<HTMLInputElement>('[data-secret]')) input.value = '';
				showPassword = false;
				showConfirm = false;
			} finally { pending = false; }
			await tick();
			formElement.querySelector<HTMLElement>('[aria-invalid="true"], [data-feedback]')?.focus();
		};
	};
</script>

<form method="POST" use:enhance={submit} novalidate aria-busy={pending} data-enhanced={enhanced}>
	{#if !ready}<p class="notice" role="status">{signup ? 'Account creation is not available yet. Please check back soon.' : 'Account services are not available yet. Please check back soon.'}</p>{/if}
	{#if networkMessage || form?.message}
		<p class="notice" class:success={form?.success && !networkMessage} role={form?.success ? 'status' : 'alert'} tabindex="-1" data-feedback>{networkMessage || form?.message}</p>
	{/if}
	{#if form?.success}
		<a class="auth-link" href={reset ? '/' : '/login'}>{reset ? 'Return to FinSight' : 'Back to Sign In'}</a>
	{:else}
		<fieldset disabled={pending || !ready}>
			{#if signup}
				<div class="field">
					<label for="username">Username</label>
					<input id="username" name="username" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" required maxlength="30" bind:value={username} aria-invalid={Boolean(errors.username)} aria-describedby="username-hint username-error" />
					<p id="username-hint" class="hint">3–30 letters, numbers or underscores. Saved in lowercase.</p>
					<p id="username-error" class="error">{errors.username ?? ''}</p>
				</div>
			{/if}
			{#if !reset}
				<div class="field">
					<label for="email">Email</label>
					<input id="email" name="email" type="email" inputmode="email" autocomplete={mode === 'login' ? 'username' : 'email'} autocapitalize="none" spellcheck="false" required maxlength="254" bind:value={email} aria-invalid={Boolean(errors.email)} aria-describedby="email-error" />
					<p id="email-error" class="error">{errors.email ?? ''}</p>
				</div>
			{/if}
			{#if mode !== 'forgot-password'}
				<div class="field">
					<label for="password">{reset ? 'New password' : 'Password'}</label>
					<div class="password-wrap">
						<input id="password" name="password" data-secret type={showPassword ? 'text' : 'password'} autocomplete={signup || reset ? 'new-password' : 'current-password'} required minlength={signup || reset ? 8 : undefined} aria-invalid={Boolean(errors.password)} aria-describedby="password-hint password-error" />
						<button type="button" class="toggle" aria-controls="password" aria-label="Show password" aria-pressed={showPassword} onclick={() => showPassword = !showPassword}>{showPassword ? 'Hide' : 'Show'}</button>
					</div>
					<p id="password-hint" class="hint">{signup || reset ? 'Use at least 8 characters.' : ''}</p>
					<p id="password-error" class="error">{errors.password ?? ''}</p>
				</div>
			{/if}
			{#if signup || reset}
				<div class="field">
					<label for="confirmPassword">Confirm password</label>
					<div class="password-wrap">
						<input id="confirmPassword" name="confirmPassword" data-secret type={showConfirm ? 'text' : 'password'} autocomplete="new-password" required minlength="8" aria-invalid={Boolean(errors.confirmPassword)} aria-describedby="confirm-error" />
						<button type="button" class="toggle" aria-controls="confirmPassword" aria-label="Show confirm password" aria-pressed={showConfirm} onclick={() => showConfirm = !showConfirm}>{showConfirm ? 'Hide' : 'Show'}</button>
					</div>
					<p id="confirm-error" class="error">{errors.confirmPassword ?? ''}</p>
				</div>
			{/if}
			{#if signup}
				<div class="field">
					<div class="terms-row">
						<input id="terms" name="terms" type="checkbox" required aria-invalid={Boolean(errors.terms)} aria-describedby="terms-error" />
						<label for="terms">I accept the <a class="auth-link" href={termsUrl ?? '/terms'} target="_blank" rel="noopener noreferrer">Terms of Service<span class="sr-only"> (opens in a new tab)</span></a> and have read the <a class="auth-link" href={privacyUrl ?? '/privacy'} target="_blank" rel="noopener noreferrer">Privacy Policy<span class="sr-only"> (opens in a new tab)</span></a>.</label>
					</div>
					<p id="terms-error" class="error">{errors.terms ?? ''}</p>
				</div>
			{/if}
			<button class="submit-button" type="submit" disabled={pending || !ready}>{pending ? busyLabel : label}</button>
		</fieldset>
	{/if}
	{#if mode === 'login'}
		<div class="recovery-links"><a class="auth-link" href="/forgot-password">Forgot Password?</a><a class="auth-link" href="/forgot-email">Forgot Email?</a></div>
	{/if}
	<p class="switch-page">{signup ? 'Already have an account?' : mode === 'login' ? 'New to FinSight?' : 'Remember your password?'} <a class="auth-link" href={mode === 'login' ? '/signup' : '/login'}>{mode === 'login' ? 'Create Account' : 'Sign In'}</a></p>
</form>

<style>
	fieldset { display: grid; gap: 18px; padding: 0; margin: 0; border: 0; min-width: 0; }
	.field { min-width: 0; }
	label { display: block; margin-bottom: 7px; font-size: .9rem; font-weight: 650; color: #243044; }
	input:not([type='checkbox']) { display: block; width: 100%; min-height: 48px; border: 1px solid #b8c3cf; border-radius: 8px; background: white; padding: 11px 12px; font-size: 16px; color: #101828; }
	input:focus { outline: 2px solid #11845b; outline-offset: 2px; }
	input[aria-invalid='true'] { border-color: #a31521; }
	.password-wrap { position: relative; }
	.password-wrap input { padding-right: 76px; }
	.toggle { position: absolute; right: 4px; top: 3px; min-height: 42px; min-width: 64px; padding: 8px; background: transparent; border: 0; border-radius: 5px; font-size: .85rem; font-weight: 700; color: #075f42; }
	.hint, .error { margin: 6px 0 0; font-size: .8rem; line-height: 1.45; }
	.hint { color: #536174; }
	.error { color: #a31521; }
	.hint:empty, .error:empty { display: none; }
	.terms-row { display: flex; align-items: flex-start; gap: 10px; }
	.terms-row input { flex: 0 0 20px; width: 20px; height: 20px; margin: 3px 0 0; border: 1px solid #8a98a9; border-radius: 4px; color: #075f42; }
	.terms-row label { margin: 0; font-size: .85rem; line-height: 1.65; font-weight: 400; }
	.submit-button { width: 100%; min-height: 48px; border: 0; border-radius: 8px; background: #075f42; color: white; font-weight: 750; margin-top: 2px; }
	.submit-button:hover:not(:disabled) { background: #064b35; }
	button:disabled, fieldset:disabled { opacity: .65; }
	button:disabled { cursor: wait; }
	.notice { margin: 0 0 20px; padding: 14px; border: 1px solid #e5be7d; background: #fff8e9; border-radius: 8px; color: #754400; font-size: .9rem; line-height: 1.6; overflow-wrap: anywhere; }
	.notice.success { background: #edf8f2; border-color: #a9d8bf; color: #075f42; }
	.recovery-links { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; margin-top: 14px; font-size: .8rem; }
	.recovery-links a { padding: 8px 0; }
	.switch-page { margin: 24px 0 0; text-align: center; color: #536174; font-size: .85rem; line-height: 1.8; }
	.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
</style>
