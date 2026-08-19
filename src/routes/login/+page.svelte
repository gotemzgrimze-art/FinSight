<script lang="ts">
	let { data, form }: { data: { redirectTo: string }; form?: { error?: string } } = $props();
</script>

<svelte:head><title>Log In | FinSight</title></svelte:head>

<main class="auth-shell">
	<section class="auth-panel">
		<p class="eyebrow">FinSight</p>
		<h1>Log in</h1>
		<p class="short-note">Sessions use server-managed, HttpOnly cookies.</p>
		{#if form?.error}<div class="notice-panel">{form.error}</div>{/if}
		<form method="POST" class="auth-form">
			<input type="hidden" name="redirectTo" value={data.redirectTo} />
			<label><span>Email</span><input name="email" type="email" autocomplete="email" required /></label>
			<label><span>Password</span><input name="password" type="password" autocomplete="current-password" required /></label>
			<label class="check-row"><input name="rememberMe" type="checkbox" checked /><span>Keep me signed in on this device</span></label>
			<button class="primary-action" type="submit">Log in</button>
		</form>
		<div class="auth-links">
			<a class="text-link" href="/forgot-password">Forgot password?</a>
			<a class="text-link" href="/signup">Create account</a>
		</div>
	</section>
</main>
