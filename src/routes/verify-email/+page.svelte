<script lang="ts">
	let { data, form }: { data: { email: string | null; verified: boolean; error: string }; form?: { error?: string; message?: string } } = $props();
</script>

<svelte:head><title>Verify Email | FinSight</title></svelte:head>

<main class="auth-shell">
	<section class="auth-panel">
		<p class="eyebrow">Security</p>
		<h1>Verify your email</h1>
		<p class="short-note">A verified email is required before accessing sensitive financial functionality.</p>
		{#if data.error}<div class="notice-panel">{data.error}</div>{/if}
		{#if form?.error}<div class="notice-panel">{form.error}</div>{/if}
		{#if form?.message}<div class="notice-panel success-panel">{form.message}</div>{/if}
		<form method="POST" class="auth-form">
			<label><span>Email</span><input name="email" type="email" value={data.email ?? ''} required /></label>
			<button class="primary-action" type="submit">Resend verification</button>
		</form>
		<a class="text-link" href="/login">Back to login</a>
	</section>
</main>
