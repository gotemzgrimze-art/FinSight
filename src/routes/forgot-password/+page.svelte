<script lang="ts">
	let { form }: { form?: { error?: string; message?: string } } = $props();
</script>

<svelte:head><title>Forgot Password | FinSight</title></svelte:head>

<main class="auth-shell">
	<section class="auth-panel">
		<p class="eyebrow">Account recovery</p>
		<h1>Reset password</h1>
		{#if form?.error}<div class="notice-panel">{form.error}</div>{/if}
		{#if form?.message}<div class="notice-panel success-panel">{form.message}</div>{/if}
		<form method="POST" class="auth-form">
			<label><span>Email</span><input name="email" type="email" autocomplete="email" required /></label>
			<button class="primary-action" type="submit">Send reset link</button>
		</form>
	</section>
</main>
