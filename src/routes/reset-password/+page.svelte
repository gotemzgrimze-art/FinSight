<script lang="ts">
	let { data, form }: { data: { token: string }; form?: { error?: string } } = $props();
</script>

<svelte:head><title>Reset Password | FinSight</title></svelte:head>

<main class="auth-shell">
	<section class="auth-panel">
		<p class="eyebrow">Account recovery</p>
		<h1>Choose a new password</h1>
		{#if form?.error}<div class="notice-panel">{form.error}</div>{/if}
		<form method="POST" class="auth-form">
			<input type="hidden" name="token" value={data.token} />
			<label><span>New password</span><input name="newPassword" type="password" autocomplete="new-password" minlength="12" required /></label>
			<label><span>Confirm password</span><input name="confirmPassword" type="password" autocomplete="new-password" minlength="12" required /></label>
			<button class="primary-action" type="submit">Reset password</button>
		</form>
	</section>
</main>
