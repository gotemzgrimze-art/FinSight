<script lang="ts">
	let { form }: { form?: { error?: string; values?: Record<string, string | boolean> } } = $props();
</script>

<svelte:head><title>Create Account | FinSight</title></svelte:head>

<main class="auth-shell">
	<section class="auth-panel">
		<p class="eyebrow">FinSight</p>
		<h1>Create account</h1>
		<p class="short-note">Use a real email address. Financial functionality is gated until email verification is complete.</p>
		{#if form?.error}<div class="notice-panel">{form.error}</div>{/if}
		<form method="POST" class="auth-form">
			<div class="two-col">
				<label><span>First name</span><input name="firstName" autocomplete="given-name" value={String(form?.values?.firstName ?? '')} required /></label>
				<label><span>Last name</span><input name="lastName" autocomplete="family-name" value={String(form?.values?.lastName ?? '')} required /></label>
			</div>
			<label><span>Email</span><input name="email" type="email" autocomplete="email" value={String(form?.values?.email ?? '')} required /></label>
			<label><span>Password</span><input name="password" type="password" autocomplete="new-password" minlength="12" required /></label>
			<label><span>Confirm password</span><input name="confirmPassword" type="password" autocomplete="new-password" minlength="12" required /></label>
			<label class="check-row"><input name="acceptTerms" type="checkbox" required /><span>I accept the Terms.</span></label>
			<label class="check-row"><input name="acceptPrivacy" type="checkbox" required /><span>I acknowledge the Privacy Policy.</span></label>
			<button class="primary-action" type="submit">Create account</button>
		</form>
		<a class="text-link" href="/login">Log in instead</a>
	</section>
</main>
